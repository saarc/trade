// ExpressJS Setup
const express = require('express');
const app = express();
var bodyParser = require('body-parser');

// Hyperledger Bridge
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..', 'network' ,'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// use static file
app.use(express.static(path.join(__dirname, 'views')));

// configure app to use body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// main page routing
app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/index.html');
})

async function cc_call(fn_name, args){
    
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);

    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('trade');

    var result;
    
    if(fn_name == 'acceptTrade')
        result = await contract.submitTransaction('acceptTrade', args);
    else if( fn_name == 'requestTrade')
    {
        i=args[0];
        a=args[1];
        d=args[2];
        result = await contract.submitTransaction('requestTrade', i, a, d);
    }
    else if(fn_name == 'getTradeStatus')
        result = await contract.evaluateTransaction('getTradeStatus', args);
    else
        result = 'Not supported function'

    return result;
}

// 거래수락
app.put('/trade', async(req, res)=>{
    const id = req.query.id;
    console.log("Accepting, id: " + id);

    result = cc_call('acceptTrade', id)

    const myobj = {result: "success"}
    res.status(200).json(myobj) 
})

// 거래요청
app.post('/trade', async(req, res)=>{
    const id = req.body.id;
    const amount = req.body.amount;
    const description = req.body.description;
    console.log("Requesting id: " + id);
    console.log("Requesting amount: " + amount);
    console.log("Requesting description: " + description);

    var args=[id, amount, description];
    result = cc_call('requestTrade', args)

    const myobj = {result: "success"}
    res.status(200).json(myobj) 
})

// 거래조회
app.get('/trade', async (req,res)=>{
    const id = req.query.id;
    console.log("Finding id: " + req.query.id);
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('trade');
    const result = await contract.evaluateTransaction('getTradeStatus', id);
    const myobj = JSON.parse(result)
    res.status(200).json(myobj)
    // res.status(200).json(result)

});

// server start
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);