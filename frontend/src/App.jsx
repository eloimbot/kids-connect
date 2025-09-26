import React, {useEffect, useState} from 'react'
import io from 'socket.io-client'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Devices from './components/Devices'
import Clients from './components/Clients'
import WLANs from './components/WLANs'
import VLANs from './components/VLANs'
import Logs from './components/Logs'
import Settings from './components/Settings'
import axios from 'axios'

const socket = io();

export default function App(){
  const [page, setPage] = useState('dashboard');
  const [aps, setAps] = useState([]);
  const [clients, setClients] = useState([]);
  useEffect(()=> {
    async function load(){
      try {
        const r = await axios.get('/api/devices'); setAps(r.data);
        const c = await axios.get('/api/clients'); setClients(c.data);
      } catch(e){}
    }
    load();
    socket.on('aps:update', data => { axios.get('/api/devices').then(r=>setAps(r.data)); });
    socket.on('clients:update', data => setClients(data));
  },[]);
  return (
    <div className="flex h-screen">
      <Sidebar onNavigate={setPage} />
      <div className="flex-1 bg-gray-50 p-6 overflow-auto">
        {page==='dashboard' && <Dashboard aps={aps} clients={clients} />}
        {page==='devices' && <Devices aps={aps} refresh={()=>axios.get('/api/devices').then(r=>setAps(r.data))} />}
        {page==='clients' && <Clients clients={clients} />}
        {page==='wlans' && <WLANs />}
        {page==='vlans' && <VLANs />}
        {page==='logs' && <Logs />}
        {page==='settings' && <Settings />}
      </div>
    </div>
  )
}
