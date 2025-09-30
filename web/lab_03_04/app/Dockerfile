FROM node:alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev express

COPY server.js ./ 
COPY movies.en.json movies.ru.json ./

EXPOSE 3000
CMD ["node","server.js"]
