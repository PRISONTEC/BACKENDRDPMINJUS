#!/bin/bash
#ENTEL

# Inicializar la primera parte de la IP
ip_prefix="192.168."

# IP CHORRILLOS
ip_chorrillos="192.168.169.253"

# Timeout 1 segundo para verificar si hay ping
TIMEOUT=1
# Obtener el número del episodio del primer argumento de la línea de comandos
ep="$1"

# Función para comprobar si un puerto está en uso
check_port() {
    netstat -tuln | grep ":$1" > /dev/null
    return $?
}

# Verificar si el número del episodio está en el rango 101-128
if [[ "$ep" -ge 101 && "$ep" -le 128 ]]; then
    # Manejar las excepciones para ep107 y ep109
    if [ "$ep" -eq 107 ] || [ "$ep" -eq 109 ]; then
        ip="${ip_prefix}156.3"
    elif [ "$ep" -lt 107 ]; then
        ip="${ip_prefix}$((150 + $ep - 101)).3"
    else
        ip="${ip_prefix}$((150 + $ep - 102)).3"
    fi
    
    # Si hay ping desde Entel hacia el servidor de bloqueo remoto
    if timeout $TIMEOUT ping -c 1 $ip > /dev/null 2>&1; then   
        # Encontrar un puerto aleatorio disponible entre 4000 y 5000
        for i in {1..5}
        do
            port=$((RANDOM % 1001 + 4000))  # Puertos válidos van de 1000 a 2000
            if ! check_port $port; then

                idConexion=$(date +%s)
                
                # Abrimos el Tunel en inversa
                ssh -f -N -R $port:$ip:3389 10.19.10.2 > /dev/null 2>&1  

                if [ $? -eq 0 ]; then

                    PID=$(ps axu | grep -v grep | grep $port:192.168 | awk '{print $2}')
                    echo "$idConexion PID $port $PID $(date +%s) ACTIVE" >> /var/log/puertos_RDP_$(date +%Y).txt                

                    # Abrimos el puerto en el firewall
                    firewall-cmd --add-port=$port/tcp > /dev/null 2>&1

                    # Si el comando anterior fue exitoso
                    if [ $? -eq 0 ]; then
                        echo "$idConexion FIREWALL $port OPEN" >> /var/log/puertos_RDP_$(date +%Y).txt
                        echo "{\"resultado\":\"OK\",\"port\":$port,\"ip\":\"$ip\",\"salto\":\"ENTEL\"}"
                    else
                        # Si no abre el firewall el puerto, matamos al proceso
                        kill -9 $PID
                        echo "$idConexion PID $port $PID INACTIVE" >> /var/log/puertos_RDP_$(date +%Y).txt
                        echo "{\"resultado\":\"KO\",\"message\":\"error abriendo el puerto en el firewall\"}"
                    fi
                else 
                    echo "{\"resultado\":\"KO\",\"message\":\"error abriendo el tunnel\"}"
                fi
                break
            fi 
        done
    elif timeout $TIMEOUT ping -c 1 $ip_chorrillos > /dev/null 2>&1; then 
        # Si no hay ping directo a Entel, se hará la conexión a travez de chorrillos backup
        remoteRDP=$(ssh -o ConnectTimeout=3 $ip_chorrillos "sh searchPortRDP.sh $ip")

        # Si la respuesta es 200 o 404
        idRes=$(echo $remoteRDP | awk '{print $1}')

        if [ $idRes -eq 200 ]; then
            idConexion=$(date +%s)
            port=$(echo $remoteRDP | awk '{print $2}')
            idConexion=$(echo $remoteRDP | awk '{print $5}')
            PID=$(echo $remoteRDP | awk '{print $3}')

            echo "$idConexion CHORRILLOS $port $PID $ip OPEN" >> /var/log/puertos_RDP_$(date +%Y).txt
            # Abrimos el puerto en el firewall
            firewall-cmd --add-port=$port/tcp > /dev/null 2>&1

            if [ $? -eq 0 ]; then
                echo "$idConexion FIREWALL $port $PID $ip OPEN" >> /var/log/puertos_RDP_$(date +%Y).txt
                echo "{\"resultado\":\"OK\",\"port\":$port,\"ip\":\"$ip\",\"salto\":\"CHORRILLOS_BACKUP\"}"
            else
                # deberiamos matar el proceso en chorrillos con comando remoto
                echo "{\"resultado\":\"KO\",\"message\":\"error abriendo el puerto en el firewall\"}"
            fi
        else
            echo "{\"resultado\":\"KO\",\"message\":\"error 404 en chorrillos\"}"
        fi
    else 
        echo "{\"resultado\":\"KO\",\"message\":\"Ni chorrillos ni entel alcanzan al ep solicitado\"}"
    fi

else
    echo "{\"resultado\":\"KO\",\"message\":\"prefijo incorrecto\"}"
fi
