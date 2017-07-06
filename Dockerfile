FROM keymetrics/pm2-docker-alpine:6

ADD app/ /my_app/

WORKDIR /my_app

RUN npm install

CMD ["pm2-docker", "start", "--auto-exit", "--env", "production", "process.json"]
