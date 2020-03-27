FROM node:13.7.0-alpine3.11

WORKDIR /project
COPY . /project

RUN npm i && npm run build

CMD [ "npm", "run", "start" ]
