#!/bin/bash

puertos=$(ssh 10.19.10.2 "mysql --login-path=acdTelef -e \"call sesionesBloqueoRDP.cerrarSesion('CHORRILLOS_BACKUP');\" --skip-column-names")

# Elimina los corchetes y las comas de la lista
puertos=$(echo $puertos | sed 's/\[\|]//g' | tr ',' '\n')

# Itera sobre la lista de puertos y mata los procesos
for puerto in $puertos
do
    idOperacion=$(date +%s)
    # Encuentra el PID del proceso usando el número de puerto
    pid=$(ps axu | grep $puerto:192.168 | grep -v grep | awk '{ print $2}')

    # Mata el proceso si se encuentra
    if [ -n "$pid" ]; then
        ssh 10.19.10.2 "echo \"$idOperacion CHORRILLOS_PID $puerto $pid FINISHED\" >> /var/log/puertos_RDP_$(date +%Y).txt"
        kill -9 $pid
    fi
    
    # Quita el puerto del firewall
    firewall-cmd --remove-port=$puerto/tcp > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        ssh 10.19.10.2 "echo \"$idOperacion FIREWALL $puerto CLOSED\" >> /var/log/puertos_RDP_$(date +%Y).txt"
    fi
done
