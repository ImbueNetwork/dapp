ARG IMBUE_DOCKERFILE_NODE_IMAGE="node:16-slim"

FROM ${IMBUE_DOCKERFILE_NODE_IMAGE}

ARG IMBUE_LOCAL_INIT_SCRIPTS

WORKDIR /api

RUN apt-get update
RUN apt-get install -y make

COPY . .

RUN if [ "${IMBUE_LOCAL_INIT_SCRIPTS}x" != "x" ]; then \
        for file in ${IMBUE_LOCAL_INIT_SCRIPTS}/*; do bash -l $file; done;\
    fi

RUN make

CMD ["node", "build/index.js"]
