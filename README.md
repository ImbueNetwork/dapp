# prototype

Imbue Network Dapp prototype/MVP

## Quickstart with docker-compose

From the top-level of the repo, all that's required is to run

```bash
docker-compose up -d
```

to build the associated images and start all services.

- The "web" service is an nginx container serving static content exported from webflow (without CMS data).
- The "api" service is a nodejs/express app configured to use dynamodb local storage.
- The "dynamodb-local" service is a temporary sqlite-based dynamodb interface to stand in for an eventual AWS hosted version of the same. (This will possibly be removed in the near future.)

The repo is split into `api` and `web` directories. In each of those, you will find a `Dockerfile`. To run the api without docker, use its Dockerfile as a guide.

To serve the website locally, using `yarn` you could run 

```bash
yarn install
```
and 

```bash
npx run start
```

which starts up a simple HTTP server via [`serve`](https://www.npmjs.com/package/serve). But, since it's just static content, you could serve it with any HTTP server.

