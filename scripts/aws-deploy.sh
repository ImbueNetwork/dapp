#!/bin/bash
 
echo 'Starting to Deploy...'
ssh ec2-user@3.12.198.64 " 
        sudo docker image prune -f 
        git clone https://github.com/ImbueNetwork/dapp/
        cd dapp 
        docker-compose down
        docker-compose up -d
        "
echo 'Deployment completed successfully'