import React, {useState, useEffect} from 'react'
import axios from 'axios'
export default function WLANs(){
  const [wlans, setWlans] = useState([]);
  const [ssid, setSsid] = useState(''); const [vlan, setVlan] = useState('');
  useEffect(()=>{ axios.get('/api/wlans').then(r=>setWlans(r.data)); },[]);
  async function create(){
    await axios.post('/api/wlans',{ssid,vlan}); setSsid(''); setVlan(''); setWlans((s)=>[{ssid,vlan}].concat(s));
  }
  return (
    <div>
      <h1 className="text-xl font-semibold mb-3">WLANs</h1>
      <div className="bg-white p-4 rounded shadow mb-4">
        <input value={ssid} onChange={e=>setSsid(e.target.value)} placeholder="SSID" className="p-2 border rounded w-full mb-2" />
        <input value={vlan} onChange={e=>setVlan(e.target.value)} placeholder="VLAN ID" className="p-2 border rounded w-full mb-2" />
        <button onClick={create} className="px-3 py-2 bg-blue-600 text-white rounded">Crear SSID</button>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <ul>{wlans.map((w,i)=> <li key={i} className="p-2 border-b">{w.ssid} · VLAN {w.vlan}</li>)}</ul>
      </div>
    </div>
  )
}
