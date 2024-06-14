#!/bin/bash

puertos=$(mysql --login-path=acdTelef -e "call sesionesBloqueoRDP.cerrarSesion('ENTEL');" --skip-column-names)

# Elimina los corchetes y las comas de la lista
puertos=$(echo $puertos | sed 's/\[\|]//g' | tr ',' '\n')

# Itera sobre la lista de puertos y mata los procesos
for puerto in $puertos
do
    # Encuentra el PID del proceso usando el número de puerto
    pid=$(ps axu | grep $puerto:192.168 | grep -v grep | awk '{ print $2}')

    # Mata el proceso si se encuentra
    if [ -n "$pid" ]; then
        echo "PID $puerto $pid $(date +%s) FINISHED" >> /var/log/puertos_RDP_$(date +%Y).txt
        kill -9 $pid
    fi
    
    # Quita el puerto del firewall
    firewall-cmd --remove-port=$puerto/tcp > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "FIREWALL $puerto $(date +%s) CLOSED" >> /var/log/puertos_RDP_$(date +%Y).txt
    fi
done
