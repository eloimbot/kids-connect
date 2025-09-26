import React from 'react'
export default function Sidebar({onNavigate}){
  const items = [
    ['dashboard','🏠','Dashboard'],
    ['devices','📡','Devices'],
    ['clients','👥','Clients'],
    ['wlans','📶','WLANs'],
    ['vlans','🔧','VLANs'],
    ['logs','📝','Logs'],
    ['settings','⚙️','Settings']
  ];
  return (
    <aside className="w-20 bg-white border-r p-3 flex flex-col items-center gap-3">
      <div className="w-12 h-10 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white font-bold">U</div>
      <nav className="flex flex-col gap-2 mt-3">
        {items.map(([id,icon,label])=>(
          <button key={id} title={label} onClick={()=>onNavigate(id)} className="w-12 h-12 rounded hover:bg-blue-50 flex items-center justify-center">
            <span style={{fontSize:18}}>{icon}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
