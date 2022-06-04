FROM node:16-slim

WORKDIR /api

RUN apt-get update
RUN apt-get install -y make

COPY . .

RUN make

CMD ["make", "cmd"]
