#!/bin/bash
# CHORRILLOS

# Timeout 1 segundo para verificar si hay ping
TIMEOUT=1
# Obtener el número del episodio del primer argumento de la línea de comandos
ip="$1"

# Función para comprobar si un puerto está en uso
check_port() {
    netstat -tuln | grep ":$1" > /dev/null
    return $?
}
  
   
# Encontrar un puerto aleatorio disponible entre 1000 y 2000
for i in {1..5}
do
    port=$((RANDOM % 1001 + 6000))  # Puertos válidos van de 1000 a 2000
    if ! check_port $port; then
        
        # Abrimos el Tunel en inversa
        ssh -f -N -R $port:$ip:3389 10.19.10.2 > /dev/null 2>&1  

        if [ $? -eq 0 ]; then

            # Obtenemos el PID
            PID=$(ps axu | grep -v grep | grep $port:192.168 | awk '{print $2}')               

            echo "200 $port $PID $ip"
 
        else 
            echo "404 $port"
        fi
        break
    fi 
done    


