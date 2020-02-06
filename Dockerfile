FROM node:13.7.0-alpine3.11

VOLUME /root/.aws
VOLUME /project
WORKDIR /project
COPY ./package.json ./
COPY ./package-lock.json ./

RUN npm i --production
