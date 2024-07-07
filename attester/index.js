import express from "express";
import { ethers } from "ethers";
import dotenv from "dotenv";
import pinataSDK from "@pinata/sdk";

dotenv.config();

const NODE_RPC = process.env.NODE_RPC; // The URL for the RPC endpoint (the aggregator node)

const nodeAccount = new ethers.Wallet(process.env.PRIVATE_KEY); // The signing key for performing tasks

const app = express();
const port = 4002;
app.use(express.json());

// L2 RPC provider
const rpcUrl = process.env.L2_RPC_ATTESTER;

const provider = new ethers.JsonRpcProvider(rpcUrl);

// The AttestationCenter contract object
const attestationCenterAddress = process.env.ATTESTATION_CENTER_ADDRESS;
const attestationCenterAbi = [
  "function numOfOperators() view returns (uint256)",
  "function getOperatorPaymentDetail(uint256) view returns (address, uint256, uint256, uint8)",
];
const attestationCenterContract = new ethers.Contract(
  attestationCenterAddress,
  attestationCenterAbi,
  provider
);

/**
 * Helper function to publish a JSON object with block.number and block.hash to IPFS
 */
async function publishJSONToIpfs(data) {
  var proofOfTask = "";
  try {
    const pinata = new pinataSDK(pinataApiKey, pinataSecretApiKey);
    const response = await pinata.pinJSONToIPFS(data);
    proofOfTask = response.IpfsHash;
    console.log(`proofOfTask: ${proofOfTask}`);
  } catch (error) {
    console.error("Error making API request to pinataSDK:", error);
  }
  return proofOfTask;
}

/**
 * Find the elected task performer for a certain block
 */
async function electedLeader(blockNumber) {
  const count = await attestationCenterContract.numOfOperators({
    blockTag: blockNumber,
  });
  const selectedOperatorId = ((BigInt(blockNumber) / 10n) % count) + 1n;
  const paymentDetails =
    await attestationCenterContract.getOperatorPaymentDetail(
      selectedOperatorId,
      { blockTag: blockNumber }
    );
  return paymentDetails[0];
}

/**
 * Performing tasks:
 * The "Task Performer" is chosen in a "Round Robin" fashion, meaning the
 * operators perform tasks in the order of their IDs: 1, 2, 3, ... etc.
 *
 * The round-robin scheme is trivially implemented by taking the block
 * number modulo the number of operators (plus 1). This gives us a number in
 * the range [1..count], which we use as the ID of the chosen performer.
 */
provider.on("block", async (blockNumber) => {
  if (blockNumber % 10 == 0) {
    // Every operator knows who is supposed to send a task in the next block
    const currentPerformer = await electedLeader(blockNumber);

    // If the current performer is the operator itself, it performs the task
    if (currentPerformer === nodeAccount.address) {
      console.log(`Performing task for block ${blockNumber}...`);
      const block = await provider.getBlock(blockNumber);
      const proofOfTask = JSON.stringify({
        blockNumber: blockNumber,
        blockHash: block.hash,
      });
      const taskDefinitionId = 0;
      const data = ethers.hexlify(ethers.toUtf8Bytes(`Send task for block ${blockNumber}`));
      const message = ethers.AbiCoder.defaultAbiCoder().encode(
        ["string", "bytes", "address", "uint16"],
        [proofOfTask, data, nodeAccount.address, taskDefinitionId]
      );
      const messageHash = ethers.keccak256(message);
      const sig = nodeAccount.signingKey.sign(messageHash).serialized;

      console.log(`Performing task with seed: ${proofOfTask}`);

      const jsonRpcBody = {
        jsonrpc: "2.0",
        method: "sendTask",
        params: [proofOfTask, data, taskDefinitionId, nodeAccount.address, sig],
      };
      
      new ethers.JsonRpcProvider(NODE_RPC).send(
        jsonRpcBody.method,
        jsonRpcBody.params
      );
    }
  }
});

/**
 * AVS WebAPI endpoint:
 * This endpoint is responsible for validating that a task was performed by
 * the correct performer. It receives the performer from the Othentic node
 * and checks that it's the `currentPerformer`.
 */
app.post("/task/validate", async (req, res) => {
  const { proofOfTask, performer } = req.body;
  const { blockNumber: taskBlockNumber, blockHash: taskHash } = JSON.parse(proofOfTask);

  try {
    const electedPerformer = await electedLeader(taskBlockNumber); // Get the elected performer for that block
    const block = await provider.getBlock(taskBlockNumber);
    
    const currentBlockNumber = await provider.getBlockNumber();

    // Gather validation results
    const isBlockHashValid = block.hash === taskHash;
    const isBlockRecent = currentBlockNumber - taskBlockNumber <= 10;
    const isPerformerCorrect = electedPerformer === performer;

    // Determine response based on validation results
    if (!isBlockHashValid) {
      return res.status(400).json({
        data: false,
        error: true,
        message: "Block hash does not match",
      });
    }

    if (!isBlockRecent) {
      return res.status(400).json({
        data: false,
        error: true,
        message: "Block is older than 10 blocks",
      });
    }

    if (!isPerformerCorrect) {
      return res.status(400).json({
        data: false,
        error: true,
        message: "Performer is incorrect",
      });
    }

    // If all validations pass
    return res.status(200).json({
      data: true,
      error: false,
      message: "Performer is correct",
    });

  } catch (error) {
    console.error("Error validating task:", error);
    return res.status(500).json({
      data: false,
      error: true,
      message: "Internal server error",
    });
  }
});


app.listen(port, () => {
  console.log(`AVS Implementation listening on localhost:${port}`);
});
