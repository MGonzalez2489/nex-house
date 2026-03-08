FROM node:20-alpine

WORKDIR /app

RUN npm install -g nx

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4200

CMD ["nx", "serve", "web", "--host", "0.0.0.0"]
