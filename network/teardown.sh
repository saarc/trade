#!/bin/bash
#
# Exit on first error, print all commands.
set -e

# Shut down the Docker containers for the system tests.
#docker-compose -f docker-compose.yml kill && docker-compose -f docker-compose.yml down

# remove the local state
rm -f ~/.hfc-key-store/*

# remove chaincode docker images
echo "Containers Removal"
cons=$(docker ps -aq)
if [ -n "$cons" ];  then
        docker rm -f $(docker ps -aq)
fi

echo "Chaincode images Removal"
imgs=$(docker images dev-* -q)
if [ -n "$imgs" ];  then
        docker rmi -f $(docker images dev-* -q)
fi

echo "Network Removal"
netb=$(docker network ls | grep net_basic)
if [ -n "$netb" ];  then
        docker network rm net_basic
fi

echo "=== Container List ============"
docker ps -a
echo "=== Chaincode image List ======"
docker images dev-*
echo "=== Network List =============="
docker network ls



# Your system is now clean
