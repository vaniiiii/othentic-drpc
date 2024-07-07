import React from "react";
import { polygonAmoy, sepolia } from "viem/chains";
import { createPublicClient, getContract, parseAbi, http } from "viem";
import { Link, Route, Switch } from "wouter";
import { createConfig } from "@wagmi/core";
import { useSwitchChain } from "wagmi";

export const config = createConfig({
	chains: [sepolia, polygonAmoy],
	transports: {
		[polygonAmoy.id]: http(),
		[sepolia.id]: http(),
	},
});

export const contractAbi = [
	"function getUsers() view returns (address[] memory)",
	"function userExists(address) view returns (bool)",
	"function userScore(address) view returns (int256)",
	"function users(uint256) view returns (address)",
];
export const contractAddress = "0xe666Bca53207d724D9f214dC792dfa2a873a10b6";

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
			const scores = [];
			for (const u of users) {
				scores.push(await contract.read.userScore([u]));
			}
			const leaderboard = [];
			for (let i = 0; i < users.length; i++) {
				leaderboard.push([users[i], parseInt(scores[i].toString())]);
			}
			setLeaderboard(leaderboard.sort((a, b) => b[1] - a[1]));
		}

		fetchContract();
		let interval = setInterval(() => {
			// setLeaderboard(leaderboard);
		}, 1000);
		return () => clearInterval(interval);
	}, [rpc]);

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
					{leaderboard.map((l) => {
						return (
							<tr key={l[0]}>
								<td className="py-2 border-b border-black/10 pl-2">
									{l[0].slice(0, 6).replace("0x", "")}.rpc.node
								</td>
								<td className="py-2 border-b border-black/10 font-mono text-sm">
									{l[0]}
								</td>
								<td className="py-2 border-b border-black/10 text-left">
									{l[1]?.toString()}
								</td>
								<td className="border-b border-black/10 text-right pr-2">
									<button
										onClick={() => {
											switchChain({
												chainId: polygonAmoy.id,
												addEthereumChainParameter: {
													rpcUrls: [
														"https://gateway.tenderly.co/public/sepolia",
													],
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

export default App;
