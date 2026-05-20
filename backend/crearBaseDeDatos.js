const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0';
const client = new MongoClient(uri);

async function crearBD() {
  try {
    await client.connect();
    console.log('Conectado al Replica Set');
    const db = client.db('banco_nexus');

    const clientes = db.collection('clientes');
    const cuentas = db.collection('cuentas');
    const transacciones = db.collection('transacciones');

    await clientes.deleteMany({});
    await cuentas.deleteMany({});
    await transacciones.deleteMany({});


    const clientesData = [

      { nombre: "Romina Lopez", curp: "ROLZ900101MDFXXX01", telefono: "6121113267", correo: "rom@gmail.com", ciudad: "San Carlos"},
      { nombre: "Antonio Alvarez", curp: "ALAN850203HDFXXX02", telefono: "6122092187", correo: "anto@gmail.com", ciudad: "Los Cabos"},
      { nombre: "Mariana Rosales", curp: "ROMA920405MDFXXX03", telefono: "6126754705", correo: "mariaro@gmail.com", ciudad: "La Paz"},
      { nombre: "Carlos Lucero", curp: "LUCA910607HDFXXX04", telefono: "6124105198", correo: "carlos@gmail.com", ciudad: "Loreto"},
      { nombre: "Fernanda Diaz", curp: "DIAF980809MDFXXX05", telefono: "6125556677", correo: "fernanda@gmail.com", ciudad: "Mulege"},
      { nombre: "Jorge Martinez", curp: "MAJJ870101HDFXXX06", telefono: "6126667788", correo: "jorge@gmail.com", ciudad: "Tijuana"},
      { nombre: "Sofia Hernandez", curp: "HESO930202MDFXXX07", telefono: "6127778899", correo: "sofia@gmail.com", ciudad: "Mexicali"},
      { nombre: "Ricardo Torres", curp: "TORR910303HDFXXX08", telefono: "6128889900", correo: "ricardo@gmail.com", ciudad: "Ensenada"},
      { nombre: "Valeria Castro", curp: "CAVA950404MDFXXX09", telefono: "6129990011", correo: "valeria@gmail.com", ciudad: "Guadalajara"},
      { nombre: "Miguel Ortega", curp: "ORMI960505HDFXXX10", telefono: "6130001122", correo: "miguel@gmail.com", ciudad: "Monterrey"},
      { nombre: "Daniela Navarro", curp: "NADA970606MDFXXX11", telefono: "6131112233", correo: "daniela@gmail.com", ciudad: "Puebla"},
      { nombre: "Pedro Vega", curp: "VEPE980707HDFXXX12", telefono: "6132223344", correo: "pedro@gmail.com", ciudad: "Toluca"},
      { nombre: "Camila Morales", curp: "MOCA990808MDFXXX13", telefono: "6133334455", correo: "camila@gmail.com", ciudad: "Queretaro"},
      { nombre: "Andres Rojas", curp: "ROAN000909HDFXXX14", telefono: "6134445566", correo: "andres@gmail.com", ciudad: "Cancun"},
      { nombre: "Paula Jimenez", curp: "JIPA010101MDFXXX15", telefono: "6135556677", correo: "paula@gmail.com", ciudad: "Merida"}
    
    ];


    const cuentasData = [

      { cuenta: "001", cliente: "ROLZ900101MDFXXX01", tipoCuenta: "ahorro", saldo: 5000, moneda: "MXN", activa: true },
      { cuenta: "002", cliente: "ALAN850203HDFXXX02", tipoCuenta: "nomina", saldo: 8000, moneda: "MXN", activa: true },
      { cuenta: "003", cliente: "ROMA920405MDFXXX03", tipoCuenta: "corriente", saldo: 12500, moneda: "MXN", activa: true },
      { cuenta: "004", cliente: "LUCA910607HDFXXX04", tipoCuenta: "ahorro", saldo: 3200, moneda: "MXN", activa: true },
      { cuenta: "005", cliente: "DIAF980809MDFXXX05", tipoCuenta: "nomina", saldo: 18900, moneda: "MXN", activa: true },
      { cuenta: "006", cliente: "MAJJ870101HDFXXX06", tipoCuenta: "ahorro", saldo: 7500, moneda: "MXN", activa: true },
      { cuenta: "007", cliente: "HESO930202MDFXXX07", tipoCuenta: "corriente", saldo: 15000, moneda: "MXN", activa: true },
      { cuenta: "008", cliente: "TORR910303HDFXXX08", tipoCuenta: "nomina", saldo: 4300, moneda: "MXN", activa: true },
      { cuenta: "009", cliente: "CAVA950404MDFXXX09", tipoCuenta: "ahorro", saldo: 9800, moneda: "MXN", activa: true },
      { cuenta: "010", cliente: "ORMI960505HDFXXX10", tipoCuenta: "corriente", saldo: 11200, moneda: "MXN", activa: true },
      { cuenta: "011", cliente: "NADA970606MDFXXX11", tipoCuenta: "nomina", saldo: 7000, moneda: "MXN", activa: true },
      { cuenta: "012", cliente: "VEPE980707HDFXXX12", tipoCuenta: "ahorro", saldo: 5900, moneda: "MXN", activa: true },
      { cuenta: "013", cliente: "MOCA990808MDFXXX13", tipoCuenta: "corriente", saldo: 15400, moneda: "MXN", activa: true },
      { cuenta: "014", cliente: "ROAN000909HDFXXX14", tipoCuenta: "nomina", saldo: 15100, moneda: "MXN", activa: true },
      { cuenta: "015", cliente: "JIPA010101MDFXXX15", tipoCuenta: "ahorro", saldo: 9000, moneda: "MXN", activa: true }

    ];

    const sucursales = [
      "CDMX",
      "Guadalajara",
      "La Paz",
      "Monterrey",
      "Tijuana"
    ];


    const transaccionesData = [

      { cuenta: '001', tipo: 'deposito', monto: 2000, sucursal: 'CDMX', fecha: new Date('2026-04-01'), saldo: 2000 },
      { cuenta: '001', tipo: 'retiro', monto: 500, sucursal: 'Guadalajara', fecha: new Date('2026-04-05'), saldo: 1500 },
      { cuenta: '001', tipo: 'deposito', monto: 3500, sucursal: 'La Paz', fecha: new Date('2026-04-10'), saldo: 5000 },
      { cuenta: '002', tipo: 'deposito', monto: 5000, sucursal: 'Monterrey', fecha: new Date('2026-04-02'), saldo: 5000 },
      { cuenta: '002', tipo: 'deposito', monto: 3000, sucursal: 'Tijuana', fecha: new Date('2026-04-15'), saldo: 8000 },
      { cuenta: '003', tipo: 'deposito', monto: 10000, sucursal: 'CDMX', fecha: new Date('2026-04-03'), saldo: 10000 },
      { cuenta: '003', tipo: 'retiro', monto: 1000, sucursal: 'La Paz', fecha: new Date('2026-04-12'), saldo: 9000 },
      { cuenta: '003', tipo: 'deposito', monto: 3500, sucursal: 'Guadalajara', fecha: new Date('2026-04-20'), saldo: 12500 },
      { cuenta: '004', tipo: 'deposito', monto: 3200, sucursal: 'Monterrey', fecha: new Date('2026-04-05'), saldo: 3200 },
      { cuenta: '005', tipo: 'deposito', monto: 15000, sucursal: 'Tijuana', fecha: new Date('2026-04-01'), saldo: 15000 },
      { cuenta: '005', tipo: 'retiro', monto: 1000, sucursal: 'CDMX', fecha: new Date('2026-04-18'), saldo: 14000 },
      { cuenta: '005', tipo: 'deposito', monto: 4900, sucursal: 'Guadalajara', fecha: new Date('2026-04-25'), saldo: 18900 }

    ];

    await clientes.insertMany(clientesData);
    await cuentas.insertMany(cuentasData);
    await transacciones.insertMany(transaccionesData);


    await clientes.createIndex(
      { curp: 1 }, { unique: true }
    );

    await cuentas.createIndex(
      { cuenta: 1 }, { unique: true }
    );

    await transacciones.createIndex(
      { cuenta: 1 }
    );

    console.log('Base de datos inicial creada con éxito.');
    console.log(`Clientes: ${clientesData.length}`);
    console.log(`Cuentas: ${cuentasData.length}`);
    console.log(`Transacciones: ${transaccionesData.length}`);

  } catch (error) {

    console.error('Error:', error);

  } finally {

    await client.close();

  }

}

crearBD().catch(console.error);