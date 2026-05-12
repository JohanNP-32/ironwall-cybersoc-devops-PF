import { useState } from 'react';
import './index.css';

function App() {
  // Estado del Formulario
  const [entidad, setEntidad] = useState('');
  const [tipo, setTipo] = useState('');
  const [severidad, setSeveridad] = useState('low');
  const [descripcion, setDescripcion] = useState('');
  
  // Estado de UI
  const [loadingForm, setLoadingForm] = useState(false);
  const [ticketGenerado, setTicketGenerado] = useState(null);

  // Estado del Rastreador
  const [searchId, setSearchId] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState('');

  // 1. Enviar Reporte
  const enviarReporte = async (e) => {
    e.preventDefault();
    setLoadingForm(true);
    setTicketGenerado(null);
    
    try {
      const response = await fetch('/api/incidentes/reportar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entidad, tipo, severidad, descripcion, fecha: new Date().toLocaleString() })
      });
      const data = await response.json();
      
      setTimeout(() => {
        if (data.status === 'success') {
          setTicketGenerado(data.ticket_id);
          setEntidad(''); setTipo(''); setDescripcion('');
        }
        setLoadingForm(false);
      }, 1500); // Simulamos encriptación
    } catch (error) {
      setLoadingForm(false);
    }
  };

  // 2. Rastrear Ticket
  const rastrearTicket = async (e) => {
    e.preventDefault();
    setTrackError(''); setTrackResult(null);
    try {
      const response = await fetch(`/api/incidentes/${searchId}`);
      const data = await response.json();
      if (data.status === 'success') {
        setTrackResult(data.data);
      } else {
        setTrackError('ID no encontrado en los registros seguros.');
      }
    } catch (error) {
      setTrackError('Error de conexión con la red principal.');
    }
  };

  const getFaseActiva = (estado) => {
    if (estado === 'Recibido') return 1;
    if (estado === 'En Revisión') return 2;
    if (estado === 'Falso Positivo' || estado === 'Mitigado' || estado === 'Resuelto') return 3;
    return 1;
  };

  return (
    <>
      <header>
        <div className="logo">IRON <span>WALL</span></div>
        <nav>
          <a href="#servicios">Módulos de Defensa</a>
          <a href="#tickets">Reportar Incidente</a>
          <a href="#rastreador">Estado de Ticket</a>
        </nav>
      </header>

      <div className="container">
        {/* HERO SECTION - RECONSTRUIDO PARA COINCIDIR CON LA REFERENCIA */}
        <div className="hero-section">
          {/* El fondo de imagen está controlado por CSS.
              Aquí solo tenemos la tarjeta de bienvenida centrada. */}
          
          <div className="hero-content">
            <div className="terminal-text">
              {'>'} SISTEMA INICIADO...<br />
              {'>'} CONECTANDO A RED GLOBAL... [OK]<br />
              {'>'} ESTADO DEL MURO: EN LÍNEA.<br /><br />
              <span style={{ color: '#fff' }}>Bienvenido a IRON WALL.</span><br />
              La primera línea de defensa contra amenazas digitales. Monitoreo constante, respuesta inmediata.<br /><br />
              {'>'} MONITOREANDO AMENAZAS... <span className="error">[SISTEMA ACTIVO]</span>
            </div>
          </div>
        </div>

        {/* SERVICIOS */}
        <section id="servicios">
          <h2>Módulos de Defensa (Servicios)</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>{'>'} Red Teaming</h3>
              <p>Simulamos ataques cibernéticos para identificar fisuras en tu infraestructura.</p>
            </div>
            <div className="service-card">
              <h3>{'>'} SOC 24/7</h3>
              <p>Vigilancia constante de red. Detectamos y neutralizamos anomalías en tiempo real.</p>
            </div>
            <div className="service-card">
              <h3>{'>'} Respuesta a Incidentes</h3>
              <p>Protocolos de contención inmediata ante brechas de datos o ataques de Ransomware.</p>
            </div>
          </div>
        </section>

        {/* TICKET SECTION */}
        <section id="tickets" className="ticket-section">
          <h2>Crear Ticket de Incidente</h2>
          <p style={{ marginBottom: '20px', color: '#ccc' }}>
            Complete el formulario para abrir un canal seguro. Su reporte generará un ID de rastreo único.
          </p>

          <form onSubmit={enviarReporte}>
            <div className="form-group">
              <label>{'>'} ID del Operador / Entidad:</label>
              <input type="text" value={entidad} onChange={(e)=>setEntidad(e.target.value)} required placeholder="Ej. Corp. Alpha" />
            </div>
            <div className="form-group">
              <label>{'>'} Clasificación de la Amenaza:</label>
              <select value={tipo} onChange={(e)=>setTipo(e.target.value)} required>
                <option value="">Selecciona el vector de ataque...</option>
                <option value="Ransomware">Infección por Ransomware</option>
                <option value="Phishing">Ataque de Phishing</option>
                <option value="DDoS">Ataque DDoS</option>
              </select>
            </div>
            <div className="form-group">
              <label>{'>'} Nivel de Severidad:</label>
              <select value={severidad} onChange={(e)=>setSeveridad(e.target.value)} required>
                <option value="Baja">DEFCON 5 - Baja</option>
                <option value="Media">DEFCON 4 - Media</option>
                <option value="Alta">DEFCON 2 - Alta</option>
                <option value="Critica">DEFCON 1 - CRÍTICA</option>
              </select>
            </div>
            <div className="form-group">
              <label>{'>'} Detalles de la Anomalía:</label>
              <textarea value={descripcion} onChange={(e)=>setDescripcion(e.target.value)} rows="4" required></textarea>
            </div>
            <button type="submit" disabled={loadingForm}>
              {loadingForm ? '> ENCRIPTANDO Y ENVIANDO...' : '> ENCRIPTAR Y ENVIAR REPORTE'}
            </button>
          </form>

          {ticketGenerado && (
            <div style={{ marginTop: '20px', padding: '15px', border: '2px dashed #00ffcc', color: '#00ffcc' }}>
              <strong>⚠️ TICKET GENERADO CON ÉXITO</strong><br/>
              GUARDE SU CÓDIGO DE RASTREO: <span style={{ fontSize: '1.5rem', color: '#fff' }}>{ticketGenerado}</span>
            </div>
          )}
        </section>

        {/* TRACKER SECTION */}
        <section id="rastreador" className="tracker-section">
          <h2>Rastreo de Protocolo SOC</h2>
          <form onSubmit={rastrearTicket} style={{ display: 'flex', gap: '10px' }}>
            <input type="text" value={searchId} onChange={(e)=>setSearchId(e.target.value)} placeholder="Ingrese su ID de Ticket..." required style={{ flex: 1 }}/>
            <button type="submit" style={{ width: 'auto' }}>{'>'} BUSCAR</button>
          </form>

          {trackError && <p style={{ color: '#ff3366', marginTop: '10px' }}>{trackError}</p>}

          {trackResult && (
            <div className="tracker-result">
              <h3>Estado del Ticket: <span style={{color: '#fff'}}>{trackResult._id}</span></h3>
              <p><strong>Entidad:</strong> {trackResult.entidad}</p>
              <p><strong>Clasificación:</strong> {trackResult.tipo}</p>
              
              <h3 style={{ marginTop: '20px', color: '#fff' }}>Línea de Tiempo de Resolución:</h3>
              <ul className="timeline">
                <li className={getFaseActiva(trackResult.estado) >= 1 ? 'active' : ''}>
                  FASE 1: RECIBIDO - Reporte ingresado al sistema SOC.
                </li>
                <li className={getFaseActiva(trackResult.estado) >= 2 ? 'active' : ''}>
                  FASE 2: EN REVISIÓN - Analistas investigando telemetría del incidente.
                </li>
                <li className={getFaseActiva(trackResult.estado) >= 3 ? 'active' : ''}>
                  FASE 3: RESOLUCIÓN - Estado Final: <strong style={{color: '#ff3366'}}>[{trackResult.estado.toUpperCase()}]</strong>
                </li>
              </ul>
            </div>
          )}
        </section>
      </div>

      <footer>
        <p>&copy; 2026 IRON WALL Cybersecurity. Todos los sistemas protegidos.</p>
      </footer>
    </>
  );
}

export default App;