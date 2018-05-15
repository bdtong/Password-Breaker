/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const WebSocket = require('ws');
const packageData = require('./package.json');
const readline = require('readline');
const ip = require('ip');
const sha256 = require('js-sha256');
const clientIp = ip.address();

const lineInterface = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

let socket;

let host = 'localhost';
if (process.argv.length === 3) {
	host = process.argv[2];
}

const address = `ws:\/\/${host}:${packageData.port}`;
console.log(`connecting to ${address}`);
console.log(`client ip is ${clientIp}`);
const client = new WebSocket(address);

client.on('open', (ws) => {
	console.log('connected');
	lineInterface.on('line', function(line){
		client.send(JSON.stringify({
			data: line,
			command: 'MESSAGE',
			ip: clientIp,
		}));
	});

	client.send(JSON.stringify({
		command: 'OPEN',
		ip: clientIp,
	}));

});


var crackFlag = false;
var id;

const breakPassword = (targetHash, range ) => {
    console.log((id - 1) * range, ((id - 1) * range) + range);
    //for (let i = (id - 1) * range; i < ((id - 1) * range) + range; i++) {
        
    //}
    
            let availableItems = 26;
            let maxLength = 4;
            let attackRange = Math.pow(availableItems, maxLength);
            //let testPassword = 'aabd';
            //let targetHash = sha256(testPassword);
            console.log(`Total bruteforce combinations : ${attackRange}`);
            //console.log(`Attacking : ${testPassword} : ${targetHash}`);

            let splits = [];
            for (let i = 0; i < maxLength; i++) {
                splits.push(Math.pow(availableItems, i));
            }

            let letterMapper;
            let mappedNumber;
            let basedIndex;
            let mapped;
            let hashed;
            for (let i = (id - 1) * range; i < ((id - 1) * range) + range; i++) {
                mappedNumber = i;
                letterMapper = [];
                for (let j = maxLength - 1; j >= 0; j--) {
                    basedIndex = Math.floor(mappedNumber / splits[j]);
                    letterMapper.push(String.fromCharCode(97 + basedIndex));
                    mappedNumber = mappedNumber % splits[j];
                }
                mapped = letterMapper.join('');
                hashed = sha256(mapped);
                console.log(`${mapped} hashes to: ${hashed}`);
                if (targetHash === hashed) {
                    console.log(`PASSWORD BROKEN : '${mapped}' Attempt number: ${i}`);
                    return mapped;
                }
            }
            
            
    return null;
} ;
    
client.on('message', (message) => {
	const messageData = JSON.parse(message);
	console.log(`${messageData.ip} sent :  ${messageData.data}`);
        
        let answer;
        
        switch (messageData.command) {
            case 'init' :
                id = messageData.data;
                console.log("my id is: ", id);
                break;
            case 'BREAK' : 
                answer = breakPassword(messageData.hashed, messageData.range);
                if (answer) { //if we find password send FOUND command
                    client.send(JSON.stringify({
                        command : "FOUND",
                        answer,
                    }));
                }
                break;
        }
        return;
        
        if (messageData.data === 'crack') {
            crackFlag = true;
            console.log("crackFlag is true");
        }
        
        if (crackFlag === false) {
            console.log("crackFlag is false");
        }
        
        if (crackFlag === true) {
            console.log("checking for subsequent integer");
        }
            
        if (crackFlag && !isNaN(messageData.data)) {
        
            
            
            
        }
        
});

client.on('close', () => {
	console.log('connection closed');
});
