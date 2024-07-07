import React from "react";
import { polygonAmoy, sepolia } from "viem/chains";
import { createPublicClient, getContract, parseAbi, http } from "viem";
import { Link, Route, Switch } from "wouter";
import { createConfig } from "@wagmi/core";
import { useSwitchChain } from "wagmi";

export const config = createConfig({
	chains: [polygonAmoy, sepolia],
	transports: {
		[polygonAmoy.id]: http(),
		[sepolia.id]: http(),
	},
});

export const contractAbi = [
	"function getUsers() view returns (address[] memory)",
	"function userScore(address) view returns (int256)",
	"function userMaxScore(address) external view returns (uint256)",
];
export const contractAddress = "0x8285Ebcc7247C42C75747152f7ea5aa2C2C348db";
export const nodeRpcs = [
	"https://polygon-amoy.g.alchemy.com/v2/ZAb5Lm8DYTZjtnkiJthyYWODWGqATMBM",
	"https://polygon-amoy.g.alchemy.com/v2/CCNDzP7_HAme-FX8L4fkJFT6WC4R_DWo",
	"https://polygon-amoy.g.alchemy.com/v2/MRsSLOe2XZZjXGkkEuEvmWFgy7vOZJQx",
];

const CHAINS = [
	{
		title: "Ethereum Mainnet",
		chainId: 1,
		currency: "ETH",
		iconPath: "/ethereum.webp",
	},
	{
		title: "Base",
		chainId: 8453,
		currency: "ETH",
		iconPath: "/base.webp",
	},
	{
		title: "Polygon",
		chainId: 137,
		currency: "MATIC",
		iconPath: "/polygon.webp",
	},
];

export const rpc = createPublicClient({
	chain: polygonAmoy,
	batch: {
		multicall: true,
	},
	transport: http(),
});

function App() {
	return (
		<>
			<div className="flex items-center justify-center h-screen flex-col mt-[-100px]">
				<div className="w-[1024px] mb-4">
					<h2 className="font-bold text-2xl flex items-center gap-2">
						<span>
							<img className="h-6" src="/image.avif" alt="" />
						</span>
						<span>Othentic dRPC</span>
					</h2>
					<p className="opacity-80 opacity-40">
						Powered by EigenLayer and the Othentic Stack
					</p>
				</div>

				<Switch>
					<Route path="/" component={Homepage} />
					<Route path="/leaderboard" component={Leaderboard} />
				</Switch>
			</div>
		</>
	);
}

function Homepage() {
	return (
		<div className="grid grid-cols-3 gap-4 w-[1024px]">
			{CHAINS.map((d) => (
				<div className="p-4 flex flex-col border border-gray-100 bg-white items-center gap-2 rounded-lg">
					<img className="h-6 rounded-full" src={d.iconPath} alt="" />
					<h2 className="text-xl font-bold text-center">{d.title}</h2>
					<span>
						{d.chainId} <span className="opacity-20 font-mono">/</span>{" "}
						{d.currency}
					</span>
					<Link
						className="border-black border hover:text-white text-black text-center py-2 w-full rounded-full hover:bg-blue-500"
						to="/leaderboard"
					>
						Select
					</Link>
				</div>
			))}
		</div>
	);
}

function Leaderboard() {
	const { switchChain } = useSwitchChain();

	const [leaderboard, setLeaderboard] = React.useState([]);

	React.useEffect(() => {
		async function fetchContract() {
			const contract = getContract({
				address: contractAddress,
				abi: parseAbi(contractAbi),
				client: rpc,
			});
			const users = await contract.read.getUsers();

			const scoresPromises = [];
			const maxScoresPromises = [];

			for (const u of users) {
				scoresPromises.push(contract.read.userScore([u]));
				maxScoresPromises.push(contract.read.userMaxScore([u]));
			}

			const scores = await Promise.all(scoresPromises);
			const maxScores = await Promise.all(maxScoresPromises);

			const leaderboard = [];
			for (let i = 0; i < users.length; i++) {
				const score = parseInt(scores[i].toString());
				const maxScore = parseFloat(maxScores[i].toString());
				const pct = parseFloat(((score / maxScore) * 100).toFixed(2));
				leaderboard.push([users[i], score, maxScore, pct]);
			}
			setLeaderboard(leaderboard.sort((a, b) => b[1] - a[1]));
		}
		let interval = setInterval(() => {
			fetchContract();
		}, 10000);
		return () => clearInterval(interval);
	}, [rpc]);

	function getRpcUrl(i) {
		return nodeRpcs[i];
	}

	return (
		<div className="w-[1024px] border">
			<table className="w-full bg-white">
				<thead>
					<tr>
						<th className="text-left pl-2 bg-gray-100/50 py-2">RPC</th>
						<th className="text-left bg-gray-100/50 py-2">Address</th>
						<th className="text-left bg-gray-100/50 py-2 text-left">Score</th>
						<th className="text-left bg-gray-100/50"></th>
					</tr>
				</thead>
				<tbody>
					{leaderboard.map((l, i) => {
						return (
							<tr key={l[0]}>
								<td className="py-2 border-b border-black/10 pl-2">
									{l[0].slice(0, 6).replace("0x", "")}.rpc.node
								</td>
								<td className="py-2 border-b border-black/10 font-mono text-sm">
									{shortenAddress(l[0])}
								</td>
								<td className="py-2 border-b border-black/10 text-left">
									<span className="block flex gap-1 items-center">
										{l[3] > 90 ? (
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 20 20"
												fill="green"
												class="w-5 h-5"
											>
												<path
													fill-rule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
													clip-rule="evenodd"
												></path>
											</svg>
										) : (
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 20 20"
												fill="red"
												class="w-5 h-5"
											>
												<path
													fill-rule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
													clip-rule="evenodd"
												></path>
											</svg>
										)}
										<span
											className={l[3] > 90 ? "text-green-500" : "text-red-500"}
										>
											{l[3]}
										</span>
									</span>
								</td>
								<td className="border-b border-black/10 text-right pr-2">
									<button
										onClick={() => {
											switchChain({
												chainId: polygonAmoy.id,
												addEthereumChainParameter: {
													rpcUrls: [getRpcUrl(i)],
												},
											});
										}}
										className="border-black border hover:text-white text-black text-center rounded-full hover:bg-blue-500 px-2 py-1"
									>
										Add to Metamask
									</button>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
			{leaderboard.length === 0 && (
				<div className="bg-gray-100/20 p-4 flex items-center justify-center">
					<span>Loading...</span>
				</div>
			)}
		</div>
	);
}

export function shortenAddress(address) {
	return address ? address.slice(0, 6) + "..." + address.slice(-4) : "";
}

export default App;
