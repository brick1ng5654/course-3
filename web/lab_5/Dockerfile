FROM node:latest

WORKDIR /app/src
COPY ./src/package*.json ./
RUN npm install \
    && npm install i18next i18next-http-middleware i18next-fs-backend \
    && npm install ejs

COPY . ./

EXPOSE 3000 

CMD ["node", "server.js"]