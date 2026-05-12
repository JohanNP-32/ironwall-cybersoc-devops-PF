import { useState, useEffect } from 'react';
import './index.css';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { LayoutDashboard, Ticket, Activity, Settings, User } from 'lucide-react';

function App() {
  const [activeMenu, setActiveMenu] = useState('graphs');
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevosEstados, setNuevosEstados] = useState({});

  const fetchIncidentes = async () => {
    try {
      const response = await fetch('/api/incidentes');
      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        setIncidentes([...data.data].reverse());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIncidentes(); }, []);

  const handleUpdateStatus = async (id) => {
    const estadoToUpdate = nuevosEstados[id];
    if (!estadoToUpdate) return;
    try {
      await fetch(`/api/incidentes/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: estadoToUpdate })
      });
      fetchIncidentes();
    } catch (error) { console.error(error); }
  };

  // --- DATOS SEGUROS PARA KPIS ---
  const total = incidentes.length;
  const criticos = incidentes.filter(inc => inc?.severidad === 'Critica').length;
  const mitigados = incidentes.filter(inc => inc?.estado === 'Mitigado' || inc?.estado === 'Resuelto').length;

  // --- DATOS PARA GRÁFICAS (Simulando la imagen de referencia) ---
  const areaData = [
    { name: 'Lun', tickets: total > 5 ? total - 3 : 2, mitigados: mitigados > 2 ? mitigados - 1 : 1 },
    { name: 'Mar', tickets: total > 2 ? total - 1 : 4, mitigados: mitigados + 1 },
    { name: 'Mie', tickets: total + 2, mitigados: mitigados },
    { name: 'Jue', tickets: total, mitigados: mitigados + 2 },
    { name: 'Vie', tickets: total + 5, mitigados: mitigados + 3 },
  ];

  const pieData = [
    { name: 'Ransomware', value: incidentes.filter(i => i?.tipo === 'Ransomware').length || 1 },
    { name: 'Phishing', value: incidentes.filter(i => i?.tipo === 'Phishing').length || 2 },
    { name: 'DDoS', value: incidentes.filter(i => i?.tipo === 'DDoS').length || 1 },
  ];
  const COLORS = ['#e14eca', '#00f2fe', '#ffb199'];

  const barData = [
    { name: 'Mon', val: 4 }, { name: 'Tue', val: 7 }, { name: 'Wed', val: 5 },
    { name: 'Thu', val: 10 }, { name: 'Fri', val: 8 }, { name: 'Sat', val: 3 }
  ];

  // --- VISTA 1: DASHBOARD (Graphs) ---
  const RenderGraphs = () => (
    <>
      <div className="kpi-row">
        <div className="kpi-grad-card pink">
          <h3>Total Amenazas Críticas</h3>
          <div className="val">{criticos} <span style={{fontSize:'1rem'}}>Alertas</span></div>
        </div>
        <div className="kpi-grad-card cyan">
          <h3>Incidentes Mitigados</h3>
          <div className="val">{mitigados} <span style={{fontSize:'1rem'}}>Casos</span></div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: '15px', flex: 1}}>
          <div className="kpi-small-card">
            <span style={{color: '#8b92a5'}}>Nuevos Tickets</span>
            <span style={{color: '#e14eca', fontWeight: 'bold'}}>+{total}</span>
          </div>
          <div className="kpi-small-card">
            <span style={{color: '#8b92a5'}}>Falsos Positivos</span>
            <span style={{color: '#00f2fe', fontWeight: 'bold'}}>{incidentes.filter(i => i?.estado === 'Falso Positivo').length}</span>
          </div>
        </div>
      </div>

      <div className="chart-card" style={{height: '350px'}}>
        <div className="chart-title">Tickets Reportados vs Mitigados</div>
        <ResponsiveContainer width="100%" height="90%">
          <AreaChart data={areaData}>
            <defs>
              <linearGradient id="colorT" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e14eca" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#e14eca" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorM" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#00f2fe" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#8b92a5" />
            <Tooltip contentStyle={{background: '#27293d', border: 'none', borderRadius: '8px', color: '#fff'}} />
            <Area type="monotone" dataKey="tickets" stroke="#e14eca" strokeWidth={3} fillOpacity={1} fill="url(#colorT)" />
            <Area type="monotone" dataKey="mitigados" stroke="#00f2fe" strokeWidth={3} fillOpacity={1} fill="url(#colorM)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bottom-grid">
        <div className="chart-card" style={{height: '300px'}}>
          <div className="chart-title">Vectores de Ataque</div>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{background: '#27293d', border: 'none'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-card" style={{height: '300px'}}>
          <div className="chart-title">Volumen Semanal</div>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#8b92a5" tick={{fontSize: 12}} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{background: '#27293d', border: 'none'}} />
              <Bar dataKey="val" fill="#00f2fe" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );

  // --- VISTA 2: TABLA (Tickets) ---
  const RenderTickets = () => (
    <div className="table-container">
      <div className="chart-title">Gestión de Incidentes (Triage)</div>
      <table>
        <thead>
          <tr><th>ID</th><th>Fecha</th><th>Entidad</th><th>Vector</th><th>Severidad</th><th>Estado</th><th>Acción</th></tr>
        </thead>
        <tbody>
          {incidentes.map(inc => {
            const safeId = inc?._id ? String(inc._id).substring(0,8) : 'N/A';
            const safeSeveridad = inc?.severidad ? String(inc.severidad).toLowerCase() : 'media';
            const displaySeveridad = inc?.severidad ? String(inc.severidad).toUpperCase() : 'DESCONOCIDA';
            const safeEstado = inc?.estado || 'Recibido';

            return (
              <tr key={inc?._id || Math.random()}>
                <td style={{color: '#8b92a5'}}>{safeId}</td>
                <td>{inc?.fecha || '-'}</td>
                <td>{inc?.entidad || 'Anónimo'}</td>
                <td style={{color: '#00f2fe'}}>{inc?.tipo || '-'}</td>
                <td><span className={`badge ${safeSeveridad}`}>{displaySeveridad}</span></td>
                <td>{safeEstado}</td>
                <td>
                  <select className="tactical-select" value={nuevosEstados[inc?._id] || safeEstado} onChange={(e) => setNuevosEstados({...nuevosEstados, [inc?._id]: e.target.value})}>
                    <option>Recibido</option><option>En Revisión</option><option>Mitigado</option><option>Falso Positivo</option>
                  </select>
                  <button className="btn-apply" onClick={() => handleUpdateStatus(inc?._id)}>Aplicar</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-title">IronWall SOC</div>
        
        <div className="menu-section">REPORT</div>
        <div className={`nav-item ${activeMenu === 'graphs' ? 'active' : ''}`} onClick={() => setActiveMenu('graphs')}>
          <Activity size={18}/> Graphs
        </div>
        
        <div className="menu-section">TICKETS STATUS</div>
        <div className={`nav-item ${activeMenu === 'tickets' ? 'active' : ''}`} onClick={() => setActiveMenu('tickets')}>
          <Ticket size={18}/> Management Table
        </div>
        
        <div className="menu-section">SYSTEM</div>
        <div className="nav-item"><User size={18}/> Profile</div>
        <div className="nav-item"><Settings size={18}/> Settings</div>
      </aside>

      <main className="main-area">
        {activeMenu === 'graphs' ? <RenderGraphs /> : <RenderTickets />}
      </main>
    </div>
  );
}

export default App;