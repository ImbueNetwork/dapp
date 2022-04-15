FROM arm64v8/node:16-slim

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update
RUN apt-get install -y \
        --no-install-recommends ca-certificates python3 wget git curl bash make vim g++ node-typescript

WORKDIR /api
COPY . .

RUN yarn
RUN make

CMD ["node", "build/index.js"]
