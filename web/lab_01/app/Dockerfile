FROM node:alpine

RUN apk add --no-cache \
      bash curl wget unzip zip tar git \
      ca-certificates openssl tzdata jq dumb-init \
 && update-ca-certificates

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev express

COPY server.js ./

EXPOSE 3000
CMD ["node","server.js"]
