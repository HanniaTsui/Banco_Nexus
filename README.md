## Banco Nexus - Sistema Bancario Distribuido ##

Práctica distribuida de una Base de Datos Distribuida con MongoDB, simulando un sistema bancario con consultas de cuentas, transacciones y visualización de historial.

## Requisitos previos
- Node.js
- MongoDB
- React (Frontend)
- npm

---------------------------------------------

## Instalación y configuración del proyecto

## 1. Clonar el repositorio

git clone <URL_DEL_REPOSITORIO>
cd Banco_Nexus

## 2. Configurar el backend

cd backend
npm install

## 3. Configurar el frontend
cd ../frontend
npm install

## 4. Crear y poblar la base de datos

cd ../backend
npm run cargar-datos

----------------------------------

## Ejecución del proyecto

## 1. Iniciar backend

cd backend
npm start

    # Servidor disponible en http://localhost:3001

## 2. Iniciar frontend

cd frontend
npm run dev

    #Frontend disponible en http://localhost:3000

-----------------------------------------------

## Uso del Sistema

##Consultar una Cuenta

1. Ingresa un número de cuenta en el campo (ej: 001, 002, hasta 015)
2. Hacer clic en **Consultar** para ver:
   - Número de cuenta
   - Saldo actual
   - Nombre del cliente
   - Últimas transacciones
   - Grafico con la evolución del saldo

---

## API Endpoint

## Obtener información de una cuenta

    GET /api/cuenta/:cuenta

## Obtener el historial completo de transacciones para el dashboard.

    GET /api/historial/:cuenta

## Realizar un depósito

    POST /api/deposito
    Body: { "cuenta": "001", "monto": 1000 }

## Realizar un retiro

    POST /api/retiro
    Body: { "cuenta": "001", "monto": 500 }

## Recomendaciones

En caso de tener problemas con MongoDB, utilizar un contenedor Docker:

 	 docker run -d --name mongodb -p 27017:27017 mongo
