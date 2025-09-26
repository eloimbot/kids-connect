import React, {useState} from 'react'
import axios from 'axios'

export default function Devices({aps, refresh}){
  const [selected, setSelected] = useState(null);
  const [vlan, setVlan] = useState('');
  const [ssid, setSsid] = useState('');
  const [psk, setPsk] = useState('');

  async function applyVlan(){
    if(!selected) return alert('Selecciona AP');
    await axios.post(`/api/devices/${selected}/vlan`, {vlan: parseInt(vlan)});
    alert('VLAN aplicada'); refresh();
  }
  async function changeSsid(){
    if(!selected) return alert('Selecciona AP');
    await axios.post(`/api/devices/${selected}/ssid`, {ssid, password: psk});
    alert('SSID aplicado'); refresh();
  }
  async function reboot(){
    if(!selected) return alert('Selecciona AP');
    if(!confirm('Reiniciar AP '+selected+'?')) return;
    await axios.post(`/api/devices/${selected}/reboot`);
    alert('Reinicio solicitado');
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-3">Devices</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-medium mb-2">Lista de APs</h3>
          <ul>
            {aps.map(a=>(
              <li key={a.id} className="flex justify-between items-center p-2 border-b">
                <div>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs text-gray-400">{a.id} · {a.host}</div>
                </div>
                <div>
                  <button onClick={()=>setSelected(a.id)} className="px-2 py-1 bg-blue-50 rounded">Seleccionar</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-medium">AP seleccionado</h3>
          <div className="text-sm text-gray-600 mb-3">{selected || 'Ninguno'}</div>
          <div className="mb-2">
            <label className="text-xs">VLAN</label>
            <input value={vlan} onChange={e=>setVlan(e.target.value)} className="w-full p-2 border rounded" />
            <button onClick={applyVlan} className="mt-2 px-3 py-2 bg-blue-600 text-white rounded">Aplicar VLAN</button>
          </div>
          <div className="mb-2">
            <label className="text-xs">SSID</label>
            <input value={ssid} onChange={e=>setSsid(e.target.value)} className="w-full p-2 border rounded" />
            <label className="text-xs mt-2">Contraseña</label>
            <input value={psk} onChange={e=>setPsk(e.target.value)} className="w-full p-2 border rounded" />
            <button onClick={changeSsid} className="mt-2 px-3 py-2 bg-green-600 text-white rounded">Cambiar SSID</button>
          </div>
          <div className="mt-4">
            <button onClick={reboot} className="px-3 py-2 bg-red-600 text-white rounded">Reiniciar AP</button>
          </div>
        </div>
      </div>
    </div>
  )
}
