# prototype

Imbue Network Dapp prototype/MVP

## Local deployment quickstart with docker-compose

From the top-level of the repo, all that's required is to run

```bash
docker-compose up -d
```

to build the associated images and start all services.

## Steps to create a new Imbue Network Project

1. Navigate to https://localhost:8443/
2. In the navigation, click "Start a project"
    - Note that the website's navigation currently only shows up when the screen size is at a small breakpoint. You can alternatively navigate directly to "Start a project" by going to https://localhost:8443/grant-submission
3. The site will start to try connect to the configured websocket, as well as search for a web3 extension, etc. This will require you to grant permission to the site on your extension. If there is no extension found, the site should notify you and link to the download page.
4. Enter all of the required information (i.e., every field except "category", which appeared in the exported webflow design, so I kept it in, but not sure what the values should be)
5. Add at least one milestone. The "percent to unlock" for all of the milestones should add up to 100%. (Known issue: currently you can add more milestones, but you can't delete them)
6. Click "Create Project Proposal" to start the process of submitting the transaction to the chain.
7. If you have enough funds in your account, it will start to display status messages about what part of the process you're in in terms of creating the project and finalization.
    - known issue: no spinner or progress bar
    - If you don't have enough funds, the dialog will say so; dismiss the dialog and go to https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A8081%2Fwsapp%2F#/accounts to get Alice to send you some funds
    - Once you have enough funds, resubmit and everything should work
8. Once the status is "Finalized", hit escape (or click anywhere) and you should see the form with all of the controls disabled.


## Services

- The "web" service is an nginx container that `proxy_pass`es most requests to the webflow server, except for `location /dist`
- The "api" service is a nodejs/express app configured to use dynamodb local storage.
- The "dynamodb-local" service is a temporary sqlite-based dynamodb interface to stand in for an eventual AWS hosted version of the same.
- The "imbue" service is a rococo-local test network (currently disabled in the docker-compose config)

The repo is split into `api` and `web` directories. In each of those, you will find a `Dockerfile`. To run the api without docker, use its Dockerfile as a guide.

To develop the website locally, using `yarn` run 

```bash
yarn install
```
to install dependencies, and 

```bash
yarn start
```

which starts webpack in "watch" mode. This is connected to the running nginx server via the docker-compose `volumes` directive, which is tied to the `./web/dist` directory (where webpack outputs its bundle).

