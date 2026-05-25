@echo off
echo Inicializando Replica Set rsBanco...

REM Ejecutar el comando de inicializacion dentro del contenedor mongo1
docker exec mongo1 mongosh --eval "rs.initiate({_id: 'rsBanco', members: [{_id: 0, host: 'mongo1:27017'}, {_id: 1, host: 'mongo2:27018'}, {_id: 2, host: 'mongo3:27019'}]})"

echo.
echo Esperando 5 segundos para que se configure el replica set...
timeout /t 5 /nobreak > nul

echo.
echo === Estado del Replica Set ===
docker exec mongo1 mongosh --eval "rs.status().members.forEach(m => print(m.name + ' | ' + m.stateStr))"

echo.
echo Replica Set inicializado correctamente!
pause
