import React from 'react'
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js'
Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);

export default function Dashboard({aps, clients}){
  // simple aggregates
  const totalClients = (clients || []).length;
  const totalAps = (aps || []).length;
  const totalTraffic = aps.reduce((s,a)=>s+(a.traffic||0),0);
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">APs</div>
          <div className="text-2xl font-bold">{totalAps}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Clientes</div>
          <div className="text-2xl font-bold">{totalClients}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Tráfico (KB)</div>
          <div className="text-2xl font-bold">{totalTraffic}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow"><h3 className="font-medium">Clientes recientes</h3>
          <ul className="mt-2">{(clients||[]).slice(0,12).map(c=> <li key={c.id} className="text-sm">{c.hostname||c.mac} — {c.ip||'—'} <span className="text-xs text-gray-400">/{c.ap}</span></li>)}</ul>
        </div>
        <div className="bg-white p-4 rounded shadow"><h3 className="font-medium">APs</h3>
          <ul className="mt-2">{(aps||[]).map(a=> <li key={a.id} className="text-sm">{a.name} <span className="text-xs text-gray-400">({a.id})</span></li>)}</ul>
        </div>
      </div>
    </div>
  )
}
