import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

function App() {
  const [cuenta, setCuenta] = useState('');
  const [monto, setMonto] = useState('');
  const [datosCuenta, setDatosCuenta] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [latencyWarning, setLatencyWarning] = useState('');
  const [persistenciaStatus, setPersistenciaStatus] = useState('');
  const [replicaStatus, setReplicaStatus] = useState('');
  const [ultimaPrueba, setUltimaPrueba] = useState(null);

  useEffect(() => {
    const guardado = localStorage.getItem('ultimoEstadoCuenta');
    if (guardado) {
      setUltimaPrueba(JSON.parse(guardado));
    }
  }, []);

  const setNotification = () => {
    setError('');
    setMensaje('');
    setPersistenciaStatus('');
    setReplicaStatus('');
  };

  const fetchWithTimeout = async (url, options = {}, timeout = 6000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const start = Date.now();

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      const elapsed = Date.now() - start;

      if (elapsed > 1500) {
        setLatencyWarning('Latencia alta detectada. Puede deberse a carga o a fallos en el nodo primario.');
      } else {
        setLatencyWarning('');
      }

      clearTimeout(timer);
      return response;
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        throw new Error('La peticion tardo demasiado. Posible latencia extrema o caida del nodo primario.');
      }
      throw err;
    }
  };

  const handleFetchError = (err) => {
    const message = err.message || 'Error inesperado';
    if (message.includes('Failed to fetch') || message.includes('nodo primario') || message.includes('No se pudo conectar')) {
      setError('No se pudo conectar al nodo primario. Verifica el servidor o la replicacion.');
    } else {
      setError(message);
    }
  };

  const safeFetch = async (url, options) => {
    try {
      const res = await fetchWithTimeout(url, options);
      return res;
    } catch (err) {
      handleFetchError(err);
      throw err;
    }
  };

  const consultarCuenta = async () => {
    try {
      setMensaje('');
      setError('');
      setPersistenciaStatus('');
      setReplicaStatus('');

      const res = await safeFetch(`/api/cuenta/${cuenta}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Cuenta no encontrada');
      }

      const data = await res.json();
      setDatosCuenta(data);

      const resHistorial = await safeFetch(`/api/historial/${cuenta}`);
      if (resHistorial.ok) {
        const dataHistorial = await resHistorial.json();
        const formateado = dataHistorial.map(t => ({
          fecha: t.fecha.split('T')[0],
          saldo: t.saldo
        }));
        setHistorial(formateado);
      } else {
        setHistorial([]);
      }
    } catch (err) {
      if (!error) setError(err.message);
      setDatosCuenta(null);
      setHistorial([]);
    }
  };

  const hacerDeposito = async () => {
    try {
      setNotification();
      const res = await safeFetch('/api/deposito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuenta, monto: Number(monto) })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error en deposito');
      }
      setMensaje('Deposito realizado correctamente');
      setMonto('');
      consultarCuenta();
    } catch (err) {
      if (!error) setError(err.message);
    }
  };

  const hacerRetiro = async () => {
    try {
      setNotification();
      const res = await safeFetch('/api/retiro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuenta, monto: Number(monto) })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error en retiro');
      }
      setMensaje('Retiro realizado correctamente');
      setMonto('');
      consultarCuenta();
    } catch (err) {
      if (!error) setError(err.message);
    }
  };

  const guardarPersistencia = async () => {
    try {
      setNotification();
      if (!cuenta) {
        setError('Ingresa el numero de cuenta para la prueba de persistencia.');
        return;
      }
      const res = await safeFetch(`/api/cuenta/${cuenta}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'No se pudo obtener la cuenta.');
      }
      const data = await res.json();
      const estado = {
        cuenta: data.cuenta,
        cliente: data.cliente,
        saldo: data.saldo,
        transacciones: data.transacciones.map(t => ({ fecha: t.fecha, monto: t.monto, tipo: t.tipo })),
        guardadoEn: new Date().toISOString()
      };
      localStorage.setItem('ultimoEstadoCuenta', JSON.stringify(estado));
      setUltimaPrueba(estado);
      setPersistenciaStatus('Estado guardado. Reinicia el servidor y usa "Verificar persistencia" despues del reinicio.');
    } catch (err) {
      if (!error) setError(err.message);
    }
  };

  const verificarPersistencia = async () => {
    try {
      setNotification();
      if (!cuenta) {
        setError('Ingresa el numero de cuenta para verificar persistencia.');
        return;
      }
      if (!ultimaPrueba || ultimaPrueba.cuenta !== cuenta) {
        setError('No existe una prueba guardada para esta cuenta. Usa primero "Guardar prueba de persistencia".');
        return;
      }
      const res = await safeFetch(`/api/cuenta/${cuenta}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'No se pudo obtener la cuenta para verificacion.');
      }
      const data = await res.json();
      const mismoSaldo = Number(data.saldo) === Number(ultimaPrueba.saldo);
      const mismoConteo = data.transacciones.length === ultimaPrueba.transacciones.length;
      if (mismoSaldo && mismoConteo) {
        setPersistenciaStatus('Persistencia verificada. Saldo y numero de transacciones coinciden tras el reinicio.');
      } else {
        setPersistenciaStatus(
          `Persistencia no verificada. Saldo actual: ${data.saldo}, saldo guardado: ${ultimaPrueba.saldo}. Transacciones actuales: ${data.transacciones.length}, guardadas: ${ultimaPrueba.transacciones.length}.`
        );
      }
    } catch (err) {
      if (!error) setError(err.message);
    }
  };

  const probarOperacionReplica = async () => {
    try {
      setNotification();
      if (!cuenta) {
        setError('Ingresa el numero de cuenta para la prueba de replicacion.');
        return;
      }
      const res = await safeFetch('/api/deposito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuenta, monto: 1, sucursal: 'PruebaReplica' })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo crear la operacion de prueba.');
      }
      await consultarCuenta();
      setReplicaStatus('Operacion de prueba ejecutada correctamente. Verifica el historial actualizado para asegurar la replica.');
    } catch (err) {
      if (!error) setError(err.message);
    }
  };

  const limpiar = () => {
    setCuenta('');
    setMonto('');
    setDatosCuenta(null);
    setHistorial([]);
    setError('');
    setMensaje('');
    setLatencyWarning('');
    setPersistenciaStatus('');
    setReplicaStatus('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Banner de alerta para errores críticos */}
        {error && (
          <div className="mb-6 bg-red-600 text-white p-4 rounded-xl shadow-lg flex items-center gap-3 animate-pulse">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-bold text-lg">⚠️ Error de Conexión</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Banner de advertencia para latencia alta */}
        {latencyWarning && !error && (
          <div className="mb-6 bg-amber-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-bold text-lg">⚠️ Latencia Alta Detectada</h3>
              <p>{latencyWarning}</p>
            </div>
          </div>
        )}

        {/* Banner de éxito */}
        {mensaje && !error && !latencyWarning && (
          <div className="mb-6 bg-green-600 text-white p-4 rounded-xl shadow-lg flex items-center gap-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <h3 className="font-bold text-lg">✅ Operación Exitosa</h3>
              <p>{mensaje}</p>
            </div>
          </div>
        )}

        <nav className="bg-black shadow-lg mb-8 rounded-xl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <h1 className="text-3xl text-center font-bold text-white">Banco Nexus - Sistema Bancario</h1>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 h-fit">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Operaciones Bancarias</h2>
            <p className="text-sm text-gray-600 mb-2">Introduce el numero de cuenta y el monto para realizar operaciones.</p>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Numero de cuenta"
                value={cuenta}
                onChange={(e) => setCuenta(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Monto"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button onClick={consultarCuenta} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">Consultar</button>
              <button onClick={hacerDeposito} className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">Depositar</button>
              <button onClick={hacerRetiro} className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">Retirar</button>
              <button onClick={limpiar} className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold">Limpiar</button>
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200" style={{ display: 'none' }}>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Pruebas de persistencia y replica</h3>
              <p className="text-sm text-slate-600 mb-4">Guarda el estado antes del reinicio y verifica que los datos se mantengan. Usa la prueba de replica para ejecutar una operacion de escritura y confirmar el comportamiento.</p>
              <button onClick={guardarPersistencia} className="w-full py-2 mb-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-semibold">Guardar prueba de persistencia</button>
              <button onClick={verificarPersistencia} className="w-full py-2 mb-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">Verificar persistencia</button>
              <button onClick={probarOperacionReplica} className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold">Probar operacion replicada</button>

              {persistenciaStatus && <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">{persistenciaStatus}</div>}
              {replicaStatus && <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{replicaStatus}</div>}
              {ultimaPrueba && (
                <div className="mt-4 bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-lg">
                  <p className="font-semibold">Ultima prueba guardada:</p>
                  <p className="text-sm">Cuenta: {ultimaPrueba.cuenta}</p>
                  <p className="text-sm">Saldo: ${Number(ultimaPrueba.saldo).toLocaleString()}</p>
                  <p className="text-sm">Transacciones guardadas: {ultimaPrueba.transacciones.length}</p>
                </div>
              )}
            </div>


          </div>

          <div className="lg:col-span-3 flex flex-col gap-6">
            {datosCuenta && (
              <>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-bold mb-6 text-gray-800">Informacion de la Cuenta</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-5 rounded-xl">
                      <p className="text-sm text-gray-600">Numero de Cuenta</p>
                      <p className="text-2xl font-bold text-blue-700">{datosCuenta.cuenta}</p>
                    </div>
                    <div className="bg-purple-50 p-5 rounded-xl">
                      <p className="text-sm text-gray-600">Cliente</p>
                      <p className="text-xl font-bold text-purple-700">{datosCuenta.cliente}</p>
                    </div>
                    <div className="bg-green-50 p-5 rounded-xl">
                      <p className="text-sm text-gray-600">Saldo Actual</p>
                      <p className="text-2xl font-bold text-green-700">${datosCuenta.saldo.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Historial de Movimientos</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-3 border text-left">Fecha</th>
                          <th className="px-4 py-3 border text-left">Tipo</th>
                          <th className="px-4 py-3 border text-right">Monto</th>
                          <th className="px-4 py-3 border text-left">Sucursal</th>
                          <th className="px-4 py-3 border text-right">Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datosCuenta.transacciones.map((t, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3 border">{t.fecha.split('T')[0]}</td>
                            <td className="px-4 py-3 border capitalize">{t.tipo}</td>
                            <td className="px-4 py-3 border text-right">${Number(t.monto).toLocaleString()}</td>
                            <td className="px-4 py-3 border">{t.sucursal || 'N/A'}</td>
                            <td className="px-4 py-3 border text-right">${Number(t.saldo).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {historial.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Evolucion del Saldo</h2>
                    <div className="w-full h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historial}>
                          <Line type="monotone" dataKey="saldo" stroke="#2563eb" strokeWidth={3} />
                          <CartesianGrid stroke="#d1d5db" />
                          <XAxis dataKey="fecha" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Saldo']} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;