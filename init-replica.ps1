# Script para inicializar el replica set rsBanco usando Docker
Write-Host "Inicializando Replica Set rsBanco..." -ForegroundColor Cyan

# Ejecutar el comando de inicialización dentro del contenedor mongo1
docker exec mongo1 mongosh --eval "rs.initiate({_id: 'rsBanco', members: [{_id: 0, host: 'mongo1:27017'}, {_id: 1, host: 'mongo2:27018'}, {_id: 2, host: 'mongo3:27019'}]})"

Write-Host "`nEsperando 5 segundos para que se configure el replica set..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`n=== Estado del Replica Set ===" -ForegroundColor Green
docker exec mongo1 mongosh --eval "rs.status().members.forEach(m => print(m.name + ' | ' + m.stateStr))"

Write-Host "`n✅ Replica Set inicializado correctamente!" -ForegroundColor Green
