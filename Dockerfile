FROM node:10.15.3-alpine
MAINTAINER kaso "why028328@126.com"

RUN npm config set unsafe-perm true
RUN npm install -g pm2@latest 

ADD . /app

WORKDIR /app

RUN npm install

EXPOSE 3000

CMD ["node", "/app/app.js"]