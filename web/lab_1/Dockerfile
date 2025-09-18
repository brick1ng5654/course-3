FROM node:latest

WORKDIR /app/src
COPY ./src/package*.json ./
RUN npm install

COPY . ./

EXPOSE 3000

CMD ["node", "server.js"]