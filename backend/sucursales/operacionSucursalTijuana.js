const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';

const registrarTransaccion = async (cuenta, monto, tipo) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('banco_nexus');
    const transacciones = db.collection('transacciones');
    const cuentas = db.collection('cuentas');

    const operador = tipo === 'deposito' ? 1 : -1;
    const cuentaActualizada = await cuentas.findOneAndUpdate(
      { cuenta },
      { $inc: { saldo: operador * monto } },
      { returnDocument: 'after' }
    );

    if (!cuentaActualizada) {
      console.log('Cuenta no encontrada');
      return;
    }

    const nueva = {
      cuenta,
      monto,
      tipo,
      sucursal: 'Tijuana',
      fecha: new Date().toISOString(),
      saldo: cuentaActualizada.saldo
    };

    await transacciones.insertOne(nueva);
    console.log(`Transacción ${tipo} de $${monto} realizada en Tijuana para cuenta ${cuenta}. Nuevo saldo: ${cuentaActualizada.saldo}`);
  } catch (error) {
    console.error('Error en Tijuana:', error);
  } finally {
    await client.close();
  }
};

module.exports = registrarTransaccion;
