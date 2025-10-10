FROM node:18-alpine

RUN apk add --no-cache openssl

WORKDIR /app/src
COPY ./src/package*.json ./
RUN npm install \
    && npm install i18next i18next-http-middleware i18next-fs-backend\
    && npm install ejs

COPY . ./

EXPOSE 3000 3443

CMD ["node", "server.js"]