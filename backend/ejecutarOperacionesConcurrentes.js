const { MongoClient } = require('mongodb');
const operacionCDMX = require('./sucursales/operacionSucursalCDMX');
const operacionGDL = require('./sucursales/operacionSucursalGDL');
const operacionLaPaz = require('./sucursales/operacionSucursalLaPaz');
const operacionMTY = require('./sucursales/operacionSucursalMTY');
const operacionTijuana = require('./sucursales/operacionSucursalTijuana');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

const CUENTA_PRUEBA = '001';
const SALDO_INICIAL_ESPERADO = 5000;
const NUM_OPERACIONES_POR_SUCURSAL = 2;
const MONTO_POR_OPERACION = 100;

async function obtenerSaldoActual() {
  await client.connect();
  const db = client.db('banco_nexus');
  const cuenta = await db.collection('cuentas').findOne({ cuenta: CUENTA_PRUEBA });
  await client.close();
  return cuenta ? cuenta.saldo : null;
}

async function main() {
  console.log('=== Iniciando operaciones concurrentes ===');
  console.log(`Cuenta de prueba: ${CUENTA_PRUEBA}`);
  console.log(`Saldo inicial esperado: $${SALDO_INICIAL_ESPERADO}`);

  const saldoInicial = await obtenerSaldoActual();
  console.log(`Saldo inicial actual: $${saldoInicial}`);

  const operaciones = [
    ...Array(NUM_OPERACIONES_POR_SUCURSAL).fill().map((_, i) => operacionCDMX(CUENTA_PRUEBA, MONTO_POR_OPERACION, 'deposito')),
    ...Array(NUM_OPERACIONES_POR_SUCURSAL).fill().map((_, i) => operacionGDL(CUENTA_PRUEBA, MONTO_POR_OPERACION, 'deposito')),
    ...Array(NUM_OPERACIONES_POR_SUCURSAL).fill().map((_, i) => operacionLaPaz(CUENTA_PRUEBA, MONTO_POR_OPERACION, 'deposito')),
    ...Array(NUM_OPERACIONES_POR_SUCURSAL).fill().map((_, i) => operacionMTY(CUENTA_PRUEBA, MONTO_POR_OPERACION, 'deposito')),
    ...Array(NUM_OPERACIONES_POR_SUCURSAL).fill().map((_, i) => operacionTijuana(CUENTA_PRUEBA, MONTO_POR_OPERACION, 'deposito'))
  ];

  console.log(`Ejecutando ${operaciones.length} operaciones concurrentes...`);
  await Promise.all(operaciones);

  const saldoFinal = await obtenerSaldoActual();
  const totalDepositado = 5 * NUM_OPERACIONES_POR_SUCURSAL * MONTO_POR_OPERACION;
  const saldoEsperado = saldoInicial + totalDepositado;

  console.log('\n=== Resultados ===');
  console.log(`Total depositado: $${totalDepositado}`);
  console.log(`Saldo esperado: $${saldoEsperado}`);
  console.log(`Saldo final: $${saldoFinal}`);
  console.log(`¿Coincide?: ${saldoFinal === saldoEsperado ? 'SÍ' : 'NO'}`);

  if (saldoFinal !== saldoEsperado) {
    console.log('⚠️  ¡INCONSISTENCIA DETECTADA!');
  } else {
    console.log('✅ Todas las operaciones se ejecutaron correctamente sin colisiones.');
  }
}

main().catch(console.error);
