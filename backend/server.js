const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = 3001;

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
let db;

app.use(cors());
app.use(express.json());

async function connectDB() {
  try {
    await client.connect();
    db = client.db('banco_nexus');
    console.log('Conectado a MongoDB');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  }
}

app.get('/api/cuenta/:cuenta', async (req, res) => {
  try {
    const { cuenta } = req.params;
    
    const cuentaData = await db.collection('cuentas').findOne({ cuenta });
    if (!cuentaData) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    const cliente = await db.collection('clientes').findOne({ curp: cuentaData.cliente });
    const transacciones = await db.collection('transacciones')
      .find({ cuenta })
      .sort({ fecha: -1 })
      .toArray();

    res.json({
      cuenta: cuentaData.cuenta,
      saldo: cuentaData.saldo,
      cliente: cliente ? cliente.nombre : cuentaData.cliente,
      transacciones: transacciones
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
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
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/deposito', async (req, res) => {
  try {
    const { cuenta, monto } = req.body;

    if (!cuenta || !monto || monto <= 0) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    const cuentaData = await db.collection('cuentas').findOne({ cuenta });
    if (!cuentaData) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    const nuevoSaldo = cuentaData.saldo + monto;
    await db.collection('cuentas').updateOne(
      { cuenta },
      { $set: { saldo: nuevoSaldo } }
    );

    const transaccion = {
      cuenta,
      tipo: 'deposito',
      monto,
      fecha: new Date(),
      saldo: nuevoSaldo
    };

    await db.collection('transacciones').insertOne(transaccion);

    res.json({
      cuenta,
      saldo: nuevoSaldo,
      transaccion
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/retiro', async (req, res) => {
  try {
    const { cuenta, monto } = req.body;

    if (!cuenta || !monto || monto <= 0) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    const cuentaData = await db.collection('cuentas').findOne({ cuenta });
    if (!cuentaData) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    if (cuentaData.saldo < monto) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    const nuevoSaldo = cuentaData.saldo - monto;
    await db.collection('cuentas').updateOne(
      { cuenta },
      { $set: { saldo: nuevoSaldo } }
    );

    const transaccion = {
      cuenta,
      tipo: 'retiro',
      monto,
      fecha: new Date(),
      saldo: nuevoSaldo
    };

    await db.collection('transacciones').insertOne(transaccion);

    res.json({
      cuenta,
      saldo: nuevoSaldo,
      transaccion
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
});
