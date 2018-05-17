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

//when server connects...
client.on('open', (ws) => {
    
    //when text is sent...
    lineInterface.on('line', function(line){
        //no typing!
        if (line) {
            console.log(`Standby for password.`);
        }
    })

});

//unique id for each client
var id;

//passwordBreaker method
const breakPassword = (targetHash, range ) => {
    
    //command 'START' => server
    //client is starting
    client.send(JSON.stringify({
                        command : "START",
                        id,
                    }));
    
    //a-z
    let availableItems = 26;
    //max lenght of password
    let maxLength = 4;
    //range of passwords
    let attackRange = Math.pow(availableItems, maxLength);
    console.log(`Total bruteforce combinations : ${attackRange}`);
   
    // 26^3, 26^2, 26^2, 26^2, 25^1 ...
    let splits = [];
    for (let i = 0; i < maxLength; i++) {
        splits.push(Math.pow(availableItems, i));
    }

    let letterMapper;
    let mappedNumber;
    let basedIndex;
    let mapped;
    let hashed;
    let attempts = 0;
    
    //splitting attack range based on id
    for (let i = (id - 1) * range; i < ((id - 1) * range) + range; i++) {
        //map our letter
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
        attempts++;
        //if this client found password
        if (targetHash === hashed) {
            console.log(`PASSWORD BROKEN : '${mapped}' Attempt number: ${attempts}`);
            return mapped;
        }
    }
    
    console.log(`[Job Completed]`);
    console.log(Date.now());
    
    //command 'END' => server
    //client has failed
    client.send(JSON.stringify({
                        command : "END",
                        id,
                    }));
    
    //if this client did not find password
    return null;
} ;

//when server sends message...
client.on('message', (message) => {
	const messageData = JSON.parse(message);
        
        //cracked password
        let answer;
        
        switch (messageData.command) {
            case 'init' :
                //messageData.data = numClients
                id = messageData.data; 
                console.log("Connection to server established.");
                console.log("Standby for password.");
                console.log("ID: ", id);
                break;
            case 'BREAK' : 
                //running passwordBreaker. returns cracked password
                answer = breakPassword(messageData.hashed, messageData.range);
                //if we find password, command 'FOUND' => server
                //client successful
                if (answer) { 
                    client.send(JSON.stringify({
                        command : "FOUND",
                        answer,
                        id,
                    }));
                }
                break;
        }
        return;
        
});

//when server closes...
client.on('close', () => {
	console.log('[Connection Closed]');
});
