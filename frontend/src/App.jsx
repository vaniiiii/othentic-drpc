import React from "react";

const LEADERBOARD = [
  ["https://rpc.a.com", 0.2, 1000],
  ["https://rpc.b.com", 0.3, 2000],
  ["https://rpc.c.com", 0.5, 3000]
]

function App() {
  const [leaderboard, setLeaderboard] = React.useState(LEADERBOARD)

  React.useEffect(() =>{
    let interval = setInterval(() => {
      setLeaderboard(leaderboard);
    }, 1000)
    return () => clearInterval(interval)
  })

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
          <tr>
            <th className="text-left pl-2 bg-gray-100/50 py-2">RPC</th>
            <th className="text-left bg-gray-100/50 py-2">Latency</th>
            <th className="text-left bg-gray-100/50 py-2">Reputation</th>
            <th className="text-left bg-gray-100/50 py-2 text-center">Score</th>
          </tr>
          {
            leaderboard.map(l => {
              return (
                <tr key={l[0]}>
                  <td className="py-2 border-b border-black/10 pl-2">{l[0]}</td>
                  <td className="py-2 border-b border-black/10">{l[1]}</td>
                  <td className="py-2 border-b border-black/10 text-left">{l[2]}</td>
                  <td className="py-2 border-b border-black/10 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="green" class="w-5 h-5 mx-auto"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"></path></svg>
                  </td>
                </tr>
              )
            })
          }
        </table>
      </div>
    </div>
  )
}

export default App
