FROM node:20-alpine

WORKDIR /app

# Crear carpeta de subidas y asegurar permisos para el usuario 'node'
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

RUN npm install -g nx

COPY package*.json ./
RUN npm install

COPY . .

RUN chown -R node:node /app


# Cambiar al usuario con permisos limitados por seguridad
USER node

EXPOSE 3000

CMD ["nx", "serve", "api", "--host", "0.0.0.0"]
