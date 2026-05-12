import { useState } from 'react';
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <nav className="bg-black shadow-lg mb-8">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <h1 className="text-3xl text-center font-bold text-white">
              Banco Nexus - Sistema Bancario
            </h1>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* PANEL IZQUIERDO */}
          <div className="bg-white rounded-xl shadow-md p-6 h-fit">
            <h2 className="text-xl font-bold mb-6 text-gray-800">
              Consulta de Cuenta
            </h2>
            <p className="text-sm text-gray-600 mb-2"> Introduce el número de Cuenta para consultar la información</p>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="001"
                value={cuenta}
                onChange={(e) => setCuenta(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={consultarCuenta}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Consultar
              </button>

              <button
                onClick={limpiar}
                className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Limpiar
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* PANEL DERECHO */}
          <div className="lg:col-span-3 flex flex-col gap-6">

            {/* INFORMACIÓN DE LA CUENTA */}
            {datosCuenta && (
              <>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-bold mb-6 text-gray-800">
                    Información de la Cuenta
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-5 rounded-xl">
                      <p className="text-sm text-gray-600">
                        Número de Cuenta
                      </p>
                      <p className="text-2xl font-bold text-blue-700">
                        {datosCuenta.cuenta}
                      </p>
                    </div>

                    <div className="bg-purple-50 p-5 rounded-xl">
                      <p className="text-sm text-gray-600">
                        Cliente
                      </p>
                      <p className="text-xl font-bold text-purple-700">
                        {datosCuenta.cliente}
                      </p>
                    </div>

                    <div className="bg-green-50 p-5 rounded-xl">
                      <p className="text-sm text-gray-600">
                        Saldo Actual
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        ${datosCuenta.saldo.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* HISTORIAL */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">
                    Historial de Movimientos
                  </h2>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-3 border text-left">
                            Fecha
                          </th>
                          <th className="px-4 py-3 border text-left">
                            Tipo
                          </th>
                          <th className="px-4 py-3 border text-right">
                            Monto
                          </th>
                          <th className="px-4 py-3 border text-right">
                            Saldo
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {datosCuenta.transacciones.map((t, i) => (
                          <tr
                            key={i}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 border">
                              {t.fecha.split('T')[0]}
                            </td>

                            <td className="px-4 py-3 border capitalize">
                              {t.tipo}
                            </td>

                            <td className="px-4 py-3 border text-right">
                              ${t.monto.toLocaleString()}
                            </td>

                            <td className="px-4 py-3 border text-right">
                              ${t.saldo.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* GRÁFICO */}
                {historial.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">
                      Evolución del Saldo
                    </h2>

                    <div className="w-full h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historial}>
                          <Line
                            type="monotone"
                            dataKey="saldo"
                            stroke="#2563eb"
                            strokeWidth={3}
                          />

                          <CartesianGrid stroke="#d1d5db" />

                          <XAxis dataKey="fecha" />

                          <YAxis />

                          <Tooltip
                            formatter={(value) => [
                              `$${value.toLocaleString()}`,
                              'Saldo'
                            ]}
                          />
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