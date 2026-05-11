import { useEffect, useState } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

function App() {
  const [cuenta, setCuenta] = useState('');
  const [datosCuenta, setDatosCuenta] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState('');

  const consultarCuenta = async () => {
    try {
      setError('');
      const res = await fetch(`/api/cuenta/${cuenta}`);
      if (!res.ok) throw new Error('Cuenta no encontrada');
      const data = await res.json();
      setDatosCuenta(data);
      // Cargar automáticamente el historial
      const resHistorial = await fetch(`/api/historial/${cuenta}`);
      if (resHistorial.ok) {
        const dataHistorial = await resHistorial.json();
        const formateado = dataHistorial.map(t => ({
          fecha: t.fecha.split('T')[0],
          saldo: t.saldo
        }));
        setHistorial(formateado);
      }
    } catch (err) {
      setError(err.message);
      setDatosCuenta(null);
      setHistorial([]);
    }
  };

  const limpiar = () => {
    setCuenta('');
    setDatosCuenta(null);
    setHistorial([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Banco Nexus - Sistema Bancario
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Número de cuenta (ej: 001)"
              value={cuenta}
              onChange={e => setCuenta(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={consultarCuenta}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Consultar
            </button>
            <button
              onClick={limpiar}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {datosCuenta && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Detalles de la Cuenta
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Cuenta</p>
                <p className="text-2xl font-bold text-blue-600">{datosCuenta.cuenta}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Saldo</p>
                <p className="text-2xl font-bold text-green-600">${datosCuenta.saldo.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="text-lg font-bold text-purple-600">{datosCuenta.cliente}</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-800">
              Últimas Transacciones
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left border">Fecha</th>
                    <th className="px-4 py-2 text-left border">Tipo</th>
                    <th className="px-4 py-2 text-right border">Monto</th>
                    <th className="px-4 py-2 text-right border">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {datosCuenta.transacciones.map((t, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{t.fecha.split('T')[0]}</td>
                      <td className="px-4 py-2 border capitalize">{t.tipo}</td>
                      <td className="px-4 py-2 border text-right">${t.monto.toLocaleString()}</td>
                      <td className="px-4 py-2 border text-right">${t.saldo.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {historial.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Evolución del Saldo
                </h3>
                <LineChart width={800} height={300} data={historial}>
                  <Line type="monotone" dataKey="saldo" stroke="#8884d8" strokeWidth={2} />
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Saldo']} />
                </LineChart>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
