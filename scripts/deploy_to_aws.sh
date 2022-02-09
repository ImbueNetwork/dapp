#!/bin/bash

#AMI id ami-03a6074373e014172
GOOGLE_OAUTH2_CLIENT_ID=$1
GOOGLE_OAUTH2_CLIENT_SECRET=$2
BRANCH_NAME=$3
echo 'Starting to Deploy...'
echo 'BRANCH NAME IS ' $BRANCH_NAME

ssh ec2-user@18.191.252.212 -o StrictHostKeyChecking=no " 
        export GOOGLE_OAUTH2_CLIENT_ID=$GOOGLE_OAUTH2_CLIENT_ID;
        export GOOGLE_OAUTH2_CLIENT_SECRET=$GOOGLE_OAUTH2_CLIENT_SECRET;
        export BRANCH_NAME=$BRANCH_NAME;
        rm -rf dapp && git clone https://github.com/ImbueNetwork/dapp/ && cd dapp; git checkout $BRANCH_NAME;
        docker-compose -f docker-compose.staging.yml down;
        docker system prune --volumes;
        docker-compose -f docker-compose.staging.yml build --no-cache; 
        docker-compose -f docker-compose.staging.yml up -d;
        docker exec api make db_up;
"

echo 'Deployment completed successfully'
