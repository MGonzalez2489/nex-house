FROM node:20-alpine

WORKDIR /app

RUN npm install -g nx

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["nx", "serve", "api", "--host", "0.0.0.0"]
