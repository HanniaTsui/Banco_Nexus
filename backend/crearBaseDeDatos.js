const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function crearBD() {
  try {
    await client.connect();
    const db = client.db('banco_nexus');

    const clientes = db.collection('clientes');
    const cuentas = db.collection('cuentas');
    const transacciones = db.collection('transacciones');

    await clientes.deleteMany({});
    await cuentas.deleteMany({});
    await transacciones.deleteMany({});

    const clientesData = [
       { nombre: "Romina Lopez", curp: "ROLZ900101MDFXXX01", telefono: "6121113267", correo: "rom@gmail.com", ciudad: "San Carlos" },
      { nombre: "Antonio Alvarez", curp: "ALAN850203HDFXXX02", telefono: "6122092187", correo: "anto@gmail.com", ciudad: "Los Cabos" },
      { nombre: "Mariana Rosales", curp: "ROMA920405MDFXXX03", telefono: "6126754705", correo: "mariaro@gmail.com", ciudad: "La Paz" },
      { nombre: "Carlos Lucero", curp: "LUCA910607HDFXXX04", telefono: "6124105198", correo: "carlos@gmail.com", ciudad: "Loreto" },
      { nombre: "Fernanda Diaz", curp: "DIAF980809MDFXXX05", telefono: "6125556677", correo: "fernanda@gmail.com", ciudad: "Mulege" },
      { nombre: "Jorge Martinez", curp: "MAJJ870101HDFXXX06", telefono: "6126667788", correo: "jorge@gmail.com", ciudad: "Tijuana" },
      { nombre: "Sofia Hernandez", curp: "HESO930202MDFXXX07", telefono: "6127778899", correo: "sofia@gmail.com", ciudad: "Mexicali" },
      { nombre: "Ricardo Torres", curp: "TORR910303HDFXXX08", telefono: "6128889900", correo: "ricardo@gmail.com", ciudad: "Ensenada" },
      { nombre: "Valeria Castro", curp: "CAVA950404MDFXXX09", telefono: "6129990011", correo: "valeria@gmail.com", ciudad: "Guadalajara" },
      { nombre: "Miguel Ortega", curp: "ORMI960505HDFXXX10", telefono: "6130001122", correo: "miguel@gmail.com", ciudad: "Monterrey" },
      { nombre: "Daniela Navarro", curp: "NADA970606MDFXXX11", telefono: "6131112233", correo: "daniela@gmail.com", ciudad: "Puebla" },
      { nombre: "Pedro Vega", curp: "VEPE980707HDFXXX12", telefono: "6132223344", correo: "pedro@gmail.com", ciudad: "Toluca" },
      { nombre: "Camila Morales", curp: "MOCA990808MDFXXX13", telefono: "6133334455", correo: "camila@gmail.com", ciudad: "Queretaro" },
      { nombre: "Andres Rojas", curp: "ROAN000909HDFXXX14", telefono: "6134445566", correo: "andres@gmail.com", ciudad: "Cancun" },
      { nombre: "Paula Jimenez", curp: "JIPA010101MDFXXX15", telefono: "6135556677", correo: "paula@gmail.com", ciudad: "Merida" }
    ];
    
    const cuentasData = [
      { cuenta: "001", cliente: "ROLZ900101MDFXXX01", saldo: 5000 },
      { cuenta: "002", cliente: "ALAN850203HDFXXX02", saldo: 8000 },
      { cuenta: "003", cliente: "ROMA920405MDFXXX03", saldo: 12500 },
      { cuenta: "004", cliente: "LUCA910607HDFXXX04", saldo: 3200 },
      { cuenta: "005", cliente: "DIAF980809MDFXXX05", saldo: 18900 },
      { cuenta: "006", cliente: "MAJJ870101HDFXXX06", saldo: 7500 },
      { cuenta: "007", cliente: "HESO930202MDFXXX07", saldo: 15000 },
      { cuenta: "008", cliente: "TORR910303HDFXXX08", saldo: 4300 },
      { cuenta: "009", cliente: "CAVA950404MDFXXX09", saldo: 9800 },
      { cuenta: "010", cliente: "ORMI960505HDFXXX10", saldo: 11200 },
      { cuenta: "011", cliente: "NADA970606MDFXXX11", saldo: 7000 },
      { cuenta: "012", cliente: "VEPE980707HDFXXX12", saldo: 5900 },
      { cuenta: "013", cliente: "MOCA990808MDFXXX13", saldo: 15400 },
      { cuenta: "014", cliente: "ROAN000909HDFXXX14", saldo: 15100 },
      { cuenta: "015", cliente: "JIPA010101MDFXXX15", saldo: 9000 }
    ];

    const transaccionesData = [
      { cuenta: '001', tipo: 'deposito', monto: 2000, fecha: new Date('2026-04-01'), saldo: 2000 },
      { cuenta: '001', tipo: 'deposito', monto: 3000, fecha: new Date('2026-04-10'), saldo: 5000 },
      { cuenta: '002', tipo: 'deposito', monto: 5000, fecha: new Date('2026-04-02'), saldo: 5000 },
      { cuenta: '002', tipo: 'deposito', monto: 3000, fecha: new Date('2026-04-15'), saldo: 8000 },
      { cuenta: '003', tipo: 'deposito', monto: 10000, fecha: new Date('2026-04-03'), saldo: 10000 },
      { cuenta: '003', tipo: 'deposito', monto: 2500, fecha: new Date('2026-04-20'), saldo: 12500 },
      { cuenta: '004', tipo: 'deposito', monto: 3200, fecha: new Date('2026-04-05'), saldo: 3200 },
      { cuenta: '005', tipo: 'deposito', monto: 15000, fecha: new Date('2026-04-01'), saldo: 15000 },
      { cuenta: '005', tipo: 'deposito', monto: 3900, fecha: new Date('2026-04-25'), saldo: 18900 },
      { cuenta: '006', tipo: 'deposito', monto: 7500, fecha: new Date('2026-04-10'), saldo: 7500 },
      { cuenta: '007', tipo: 'deposito', monto: 10000, fecha: new Date('2026-04-08'), saldo: 10000 },
      { cuenta: '007', tipo: 'deposito', monto: 5000, fecha: new Date('2026-04-18'), saldo: 15000 },
      { cuenta: '008', tipo: 'deposito', monto: 4300, fecha: new Date('2026-04-12'), saldo: 4300 },
      { cuenta: '009', tipo: 'deposito', monto: 8000, fecha: new Date('2026-04-04'), saldo: 8000 },
      { cuenta: '009', tipo: 'deposito', monto: 1800, fecha: new Date('2026-04-22'), saldo: 9800 },
      { cuenta: '010', tipo: 'deposito', monto: 10000, fecha: new Date('2026-04-06'), saldo: 10000 },
      { cuenta: '010', tipo: 'deposito', monto: 1200, fecha: new Date('2026-04-28'), saldo: 11200 },
      { cuenta: "011", tipo: "deposito", monto: 6700, fecha: new Date("2026-04-10"), saldo: 6700 },
      { cuenta: "011", tipo: "deposito", monto: 300, fecha: new Date("2026-04-21"), saldo: 7000 },
      { cuenta: "012", tipo: "deposito", monto: 5400, fecha: new Date("2026-04-10"), saldo: 5400 },
      { cuenta: "012", tipo: "deposito", monto: 500, fecha: new Date("2026-04-19"), saldo: 5900 },
      { cuenta: "013", tipo: "deposito", monto: 9300, fecha: new Date("2026-04-10"), saldo: 9300 },
      { cuenta: "013", tipo: "deposito", monto: 6100, fecha: new Date("2026-04-30"), saldo: 15400 },
      { cuenta: "014", tipo: "deposito", monto: 15000, fecha: new Date("2026-04-10"), saldo: 15000 },
      { cuenta: "014", tipo: "deposito", monto: 100, fecha: new Date("2026-04-11"), saldo: 15100 },
      { cuenta: "015", tipo: "deposito", monto: 8200, fecha: new Date("2026-04-10"), saldo: 8200 },
      { cuenta: "015", tipo: "deposito", monto: 800, fecha: new Date("2026-04-26"), saldo: 9000 }
    ];

    await clientes.insertMany(clientesData);
    await cuentas.insertMany(cuentasData);
    await transacciones.insertMany(transaccionesData);

    console.log('Base de datos inicial creada con éxito.');
    console.log(`Clientes: ${clientesData.length}`);
    console.log(`Cuentas: ${cuentasData.length}`);
    console.log(`Transacciones: ${transaccionesData.length}`);
  } finally {
    await client.close();
  }
}

crearBD().catch(console.error);
