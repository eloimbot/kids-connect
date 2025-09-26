import React from 'react'
export default function Clients({clients}){
  return (
    <div>
      <h1 className="text-xl font-semibold mb-3">Clientes</h1>
      <div className="bg-white p-4 rounded shadow">
        <ul>
          {(clients||[]).map(c=>(
            <li key={c.id} className="p-2 border-b flex justify-between">
              <div>
                <div className="font-medium">{c.hostname || c.mac}</div>
                <div className="text-xs text-gray-400">{c.ip || '—'} · {c.ap}</div>
              </div>
              <div className="text-xs text-gray-400">{new Date(c.last_seen).toLocaleTimeString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
