import React, {useState, useEffect} from 'react'
import axios from 'axios'
export default function VLANs(){
  const [vlans, setVlans] = useState([]); const [id,setId]=useState(''); const [name,setName]=useState('');
  useEffect(()=>{ axios.get('/api/vlans').then(r=>setVlans(r.data)); },[]);
  async function create(){ await axios.post('/api/vlans',{id,name}); setVlans([...vlans,{id,name}]); setId(''); setName(''); }
  return (
    <div>
      <h1 className="text-xl font-semibold mb-3">VLANs</h1>
      <div className="bg-white p-4 rounded shadow mb-4">
        <input value={id} onChange={e=>setId(e.target.value)} placeholder="VLAN ID" className="p-2 border rounded w-full mb-2"/>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre" className="p-2 border rounded w-full mb-2"/>
        <button onClick={create} className="px-3 py-2 bg-blue-600 text-white rounded">Crear VLAN</button>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <ul>{vlans.map(v=> <li key={v.id} className="p-2 border-b">VLAN {v.id} · {v.name}</li>)}</ul>
      </div>
    </div>
  )
}
