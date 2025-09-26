import React, {useEffect, useState} from 'react'
import axios from 'axios'
export default function Logs(){
  const [logs, setLogs] = useState([]);
  useEffect(()=>{ axios.get('/api/logs').then(r=>setLogs(r.data)); },[]);
  return (
    <div>
      <h1 className="text-xl font-semibold mb-3">Logs</h1>
      <div className="bg-white p-4 rounded shadow">
        <ul>{logs.map(l=> <li key={l.id} className="text-sm py-1 border-b"><strong>{new Date(l.ts).toLocaleString()}</strong> — {l.msg}</li>)}</ul>
      </div>
    </div>
  )
}

