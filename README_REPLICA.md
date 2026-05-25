# Configuración de Replica Set MongoDB - Banco Nexus

## Requisitos previos
- Docker Desktop instalado y corriendo
- Node.js instalado

---

## Paso 1: Configurar el archivo hosts (IMPORTANTE!)

Primero, debes agregar entradas en el archivo hosts de Windows para resolver los nombres de los contenedores.

**Ejecuta PowerShell como ADMINISTRADOR** y ejecuta:
```powershell
.\setup-hosts.ps1
```

Si prefieres hacerlo manualmente:
1. Abre el archivo `C:\Windows\System32\drivers\etc\hosts` con un editor de texto como Administrador
2. Agrega estas líneas al final:
   ```
   127.0.0.1 mongo1
   127.0.0.1 mongo2
   127.0.0.1 mongo3
   ```
3. Guarda el archivo

---

## Paso 2: Iniciar los contenedores Docker

En la raíz del proyecto, ejecuta:
```bash
docker-compose up -d
```

Esto creará 3 contenedores:
- mongo1 (puerto externo 27017, interno 27017)
- mongo2 (puerto externo 27018, interno 27017)
- mongo3 (puerto externo 27019, interno 27017)

---

## Paso 3: Inicializar el Replica Set

### Opción 1: Usar el script de PowerShell (recomendado)
```powershell
.\init-replica.ps1
```

### Opción 2: Usar el archivo .bat
Doble-click en `init-replica.bat` o ejecuta:
```cmd
init-replica.bat
```

### Opción 3: Manualmente con docker exec
1. Conecta al contenedor:
   ```bash
   docker exec -it mongo1 mongosh
   ```
2. Dentro de mongosh, ejecuta:
   ```javascript
   rs.initiate({
     _id: "rsBanco",
     members: [
       { _id: 0, host: "mongo1:27017" },
       { _id: 1, host: "mongo2:27017" },
       { _id: 2, host: "mongo3:27017" }
     ]
   });
   ```
3. Verifica el estado:
   ```javascript
   rs.status()
   ```
4. Sal con:
   ```javascript
   exit
   ```

---

## Paso 4: Cargar datos iniciales

Navega a la carpeta backend y ejecuta:
```bash
cd backend
npm install
node crearBaseDeDatos.js
```

---

## Paso 5: Iniciar el servidor Backend

```bash
npm start
```

El servidor se ejecutará en **http://localhost:3001**

---

## Paso 6: Iniciar el Frontend

Abre una **nueva terminal** y ejecuta:
```bash
cd frontend
npm install
npm run dev
```

El frontend se ejecutará en la URL que te muestre la terminal (generalmente **http://localhost:5173**)

---

## Paso 7: Prueba de Failover

Ejecuta el script de prueba:
```bash
cd backend
node failoverTest.js
```

### Para probar el failover manualmente:
1. Ejecuta `node failoverTest.js` y observa cuál es el nodo primario
2. Detén el contenedor del nodo primario:
   ```bash
   docker stop mongo1  # si mongo1 era el primario
   ```
3. Vuelve a ejecutar `node failoverTest.js` para verificar que un nuevo nodo se ha convertido en primario
4. Para reiniciar el nodo detenido:
   ```bash
   docker start mongo1
   ```

---

## Archivos importantes

- `docker-compose.yml`: Configuración de los 3 nodos MongoDB
- `setup-hosts.ps1`: Script para configurar el archivo hosts
- `iniciarReplica.js`: Script para inicializar el replica set rsBanco
- `init-replica.ps1` / `init-replica.bat`: Scripts para inicializar el replica set automáticamente
- `backend/server.js`: Servidor backend conectado al replica set
- `backend/crearBaseDeDatos.js`: Script para cargar datos iniciales
- `backend/failoverTest.js`: Script de prueba de failover

---

## Conexión desde Node.js

La URI de conexión es:
```
mongodb://mongo1:27017,mongo2:27017,mongo3:27017/banco_nexus?replicaSet=rsBanco
```

---

## Para eliminar las entradas del archivo hosts

Si necesitas quitar las entradas del archivo hosts, ejecuta como Administrador:
```powershell
.\setup-hosts.ps1 -Remove
```
