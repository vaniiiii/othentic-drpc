import React from "react";
import { polygonAmoy } from "viem/chains"; 
import { createPublicClient, getContract, parseAbi, http } from "viem";

export const contractAbi = [
  "function getUsers() view returns (address[] memory)",
  "function userExists(address) view returns (bool)",
  "function userScore(address) view returns (int256)",
  "function users(uint256) view returns (address)",
];
export const contractAddress = "0xe666Bca53207d724D9f214dC792dfa2a873a10b6"

export const rpc = createPublicClient({
  chain: polygonAmoy,
  batch: {
    multicall: {
      wait: 500,
    },
  },
  transport: http(),
});

function App() {
  const [leaderboard, setLeaderboard] = React.useState([])

  React.useEffect(() =>{
    async function fetchContract() {
      const contract = getContract({
        address: contractAddress,
        abi: parseAbi(contractAbi),
        client: rpc,
      })
      const users = await contract.read.getUsers();
      const scores = []
      for (const u of users) {
        scores.push(
          await contract.read.userScore([u])
        )
      }
      const leaderboard = []
      for (let i = 0; i < users.length; i++) {
        leaderboard.push([
          users[i],
          parseInt(scores[i].toString()),
        ])
      }
      setLeaderboard(leaderboard.sort((a,b) => b[1]-a[1]));
    }

    fetchContract();
    let interval = setInterval(() => {
      // setLeaderboard(leaderboard);
    }, 1000)
    return () => clearInterval(interval)
  }, [rpc])

  return (
    <div className="flex items-center justify-center h-screen flex-col mt-[-100px]">
      <div className="w-[800px] mb-4">
        <h2 className="font-bold text-2xl flex items-center gap-2">
          <span><img className="h-6" src="/image.avif" alt="" /></span>
          <span>Othentic dRPC</span>
        </h2>
        <p className="opacity-80 opacity-40">Powered by EigenLayer and the Othentic Stack</p>
      </div>
      <div className="w-[800px] border">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left pl-2 bg-gray-100/50 py-2">RPC</th>
              <th className="text-left bg-gray-100/50 py-2">Address</th>
              <th className="text-left bg-gray-100/50 py-2 text-left">Score</th>
            </tr>
          </thead>
          <tbody>
            {
              leaderboard.map(l => {
                return (
                  <tr key={l[0]}>
                    <td className="py-2 border-b border-black/10 pl-2">{l[0].slice(0,6).replace("0x","")}.rpc.node</td>
                    <td className="py-2 border-b border-black/10 font-mono text-sm">{l[0]}</td>
                    <td className="py-2 border-b border-black/10 text-left">{l[1]?.toString()}</td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
        {
          leaderboard.length === 0 &&
            <div className="bg-gray-100/20 p-4 flex items-center justify-center">
              <span>Loading...</span>
            </div>
        }
      </div>
    </div>
  )
}

export default App
