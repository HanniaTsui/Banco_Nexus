const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = 3001;

const uri = 'mongodb://mongo1:27017,mongo2:27018,mongo3:27019/banco_nexus?replicaSet=rsBanco';
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 2,
  heartbeatFrequencyMS: 2000,
  retryWrites: true,
  retryReads: true
});

let db;

app.use(cors());
app.use(express.json());

async function connectDB() {
  try {
    await client.connect();
    db = client.db('banco_nexus');
    console.log('Conectado a MongoDB');

    client.on('serverDescriptionChanged', (event) => {
      console.log('🔄 Cambio en el servidor:', event.newDescription.address, '-', event.newDescription.type);
    });

    client.on('topologyDescriptionChanged', (event) => {
      console.log('🔄 Cambio en la topología');
      event.newDescription.servers.forEach((server) => {
        console.log('  -', server.address, ':', server.type);
      });
    });

  } catch (err) {
    console.error('Error al conectar a MongoDB:', err);
    setTimeout(connectDB, 5000);
  }
}

app.get('/api/cuenta/:cuenta', async (req, res) => {

  try {

    const { cuenta } = req.params;

    const cuentaData = await db.collection('cuentas').findOne({ cuenta });

    if (!cuentaData) {

      return res.status(404).json({
        error: 'Cuenta no encontrada'
      });

    }

    const cliente = await db.collection('clientes').findOne({
      curp: cuentaData.cliente
    });

    const transacciones = await db.collection('transacciones')
      .find({ cuenta })
      .sort({ fecha: -1 })
      .toArray();

    res.json({
      cuenta: cuentaData.cuenta,
      saldo: cuentaData.saldo,
      cliente: cliente ? cliente.nombre : cuentaData.cliente,
      transacciones
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'Error interno del servidor'
    });

  }

});

app.get('/api/historial/:cuenta', async (req, res) => {

  try {

    const { cuenta } = req.params;

    const transacciones = await db.collection('transacciones')
      .find({ cuenta })
      .sort({ fecha: 1 })
      .toArray();

    res.json(transacciones);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'Error interno del servidor'
    });

  }

});

app.post('/api/deposito', async (req, res) => {

  try {

    const { cuenta, monto, sucursal } = req.body;

    const montoNum = Number(monto);

    if (!cuenta || !monto || isNaN(montoNum) || montoNum <= 0) {

      return res.status(400).json({
        error: 'Datos inválidos'
      });

    }

    const cuentaActualizada = await db.collection('cuentas').findOneAndUpdate(
      { cuenta },
      { $inc: { saldo: montoNum } },
      { returnDocument: 'after' }
    );

    if (!cuentaActualizada) {

      return res.status(404).json({
        error: 'Cuenta no encontrada'
      });

    }

    const sucursalFinal = sucursal || [
      'CDMX',
      'Guadalajara',
      'La Paz',
      'Monterrey',
      'Tijuana'
    ][Math.floor(Math.random() * 5)];

    const transaccion = {
      cuenta,
      tipo: 'deposito',
      monto: montoNum,
      sucursal: sucursalFinal,
      fecha: new Date(),
      saldo: cuentaActualizada.saldo
    };

    await db.collection('transacciones').insertOne(transaccion);

    res.json({
      cuenta,
      saldo: cuentaActualizada.saldo,
      transaccion
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'Error interno del servidor'
    });

  }

});

app.post('/api/retiro', async (req, res) => {

  try {

    const { cuenta, monto, sucursal } = req.body;

    const montoNum = Number(monto);

    if (!cuenta || !monto || isNaN(montoNum) || montoNum <= 0) {

      return res.status(400).json({
        error: 'Datos inválidos'
      });

    }

    const cuentaActualizada = await db.collection('cuentas').findOneAndUpdate(
      { cuenta, saldo: { $gte: montoNum } },
      { $inc: { saldo: -montoNum } },
      { returnDocument: 'after' }
    );

    if (!cuentaActualizada) {

      const cuentaData = await db.collection('cuentas').findOne({ cuenta });
      if (!cuentaData) {
        return res.status(404).json({
          error: 'Cuenta no encontrada'
        });
      }
      return res.status(400).json({
        error: 'Saldo insuficiente'
      });

    }

    const sucursalFinal = sucursal || [
      'CDMX',
      'Guadalajara',
      'La Paz',
      'Monterrey',
      'Tijuana'
    ][Math.floor(Math.random() * 5)];

    const transaccion = {
      cuenta,
      tipo: 'retiro',
      monto: montoNum,
      sucursal: sucursalFinal,
      fecha: new Date(),
      saldo: cuentaActualizada.saldo
    };

    await db.collection('transacciones').insertOne(transaccion);

    res.json({
      cuenta,
      saldo: cuentaActualizada.saldo,
      transaccion
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'Error interno del servidor'
    });

  }

});

connectDB().then(() => {

  app.listen(PORT, () => {

    console.log(`Servidor corriendo en http://localhost:${PORT}`);

  });

});