#!/bin/bash

if [ $# -ne 2 ]; then
	echo "Arguments are missing. ex) ./cc_tea.sh instantiate 1.0.0"
	exit 1
fi

instruction=$1 # instantiate upgrade
version=$2 
cc_name=trade

set -ev

#chaincode install
docker exec cli peer chaincode install -n $cc_name -v $version -p github.com/$cc_name
#chaincode instatiate
docker exec cli peer chaincode $instruction -n $cc_name -v $version -C mychannel -c '{"Args":["init","LumberInc","LumberBank","100000","WoodenToys","ToyBank","200000","UniversalFrieght","ForestryDepartment"]}' -P 'OR ("Org1MSP.member", "Org2MSP.member","Org3MSP.member")'
sleep 5


# tradeID="2ks89j9"
# amount=50000
# descGoods="Wood for Toys"

#chaincode invoke 
docker exec cli peer chaincode invoke -n $cc_name -C mychannel -c '{"Args":["requestTrade","2ks89j9","50000","Wood for Toys"]}'
sleep 5
#chaincode invoke 
docker exec cli peer chaincode invoke -n $cc_name -C mychannel -c '{"Args":["acceptTrade","2ks89j9"]}'
sleep 5
#chaincode query 
docker exec cli peer chaincode query -n $cc_name -C mychannel -c '{"Args":["getTradeStatus","2ks89j9"]}'

echo '-------------------------------------END-------------------------------------'

