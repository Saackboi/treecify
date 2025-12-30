# 1. Usamos Node.js ligero (Alpine Linux)

FROM node:18-alpine



# 2. Creamos carpeta de trabajo

WORKDIR /app



# 3. Copiamos los archivos de dependencias

COPY package*.json ./



# 4. Instalamos dependencias (incluyendo devDependencies para poder hacer el build)

RUN npm install



# 5. Copiamos todo el código fuente

COPY . .



# 6. CONSTRUIMOS el frontend dentro del contenedor

# Esto creará la carpeta /dist interna

RUN npm run build



# 7. Limpiamos dependencias de desarrollo para ahorrar espacio (Opcional, pero recomendado)

RUN npm prune --production



# 8. Exponemos el puerto

EXPOSE 3001



# 9. Comando de inicio

CMD ["node", "server/index.js"]