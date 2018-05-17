/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


const sha256 = require('js-sha256');
const WebSocket = require('ws');
const packageData = require('./package.json');
const readline = require('readline');
const ip = require('ip');
const serverIp = ip.address();

const lineInterface = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

const server = new WebSocket.Server({ 
	port: packageData.port 
});

const broadcast = (data) => {
	server.clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(data);
		}
	});
};

//num of clients connected to server
var numClients = 0;

let hashed;
const attackSpace = Math.pow(26, 10);

//when password is sent...
lineInterface.on('line', (line) => {
        
        if (line === "R") {
            //generating random password
            let random = "";
            var possible = "abcdefghijklmnopqrstuvwxyz";

            for (var i = 0; i < 10; i++)
                random += possible.charAt(Math.floor(Math.random() * possible.length));
  
            //console.log(`Random password: ${random}`);
            
            //calculating range
            let range = attackSpace/ numClients;
            //hashing
            hashed = sha256(random);
            
            //printing timestamp
            var dt = new Date();
            var utcDate = dt.toUTCString();
            console.log(`Password sent [${utcDate}]`);
                    
            broadcast(JSON.stringify({
		command: 'BREAK',
		range,
                hashed,
                utcDate,
            }));
        }
        //checking if password sent is 4 characters
        else if (line.length === 10) {
            
            //calculating range
            let range = attackSpace/ numClients;
            //hashing
            hashed = sha256(line);
            
            //printing timestamp
            var dt = new Date();
            var utcDate = dt.toUTCString();
            console.log(`Password sent [${utcDate}]`);
            
            broadcast(JSON.stringify({
		command: 'BREAK',
		range,
                hashed,
                utcDate,
            }));
        } else {
            console.log(`ERROR: password must be 4 characters long`);
        }
        
});	

//when client connects...
server.on('connection', (ws) => { 
    
    numClients++;
    console.log(numClients + " computer(s) connected");
    
    //command 'init' => client
    ws.send(JSON.stringify({
        command: 'init',
        data: numClients,
    }));
    
    //when client sends message...
    ws.on('message', (message) => {
        const messageData = JSON.parse(message);
        switch (messageData.command) {
            case 'START' :
                console.log(`Computer ${messageData.id} calculating...`);
                break;
            case 'END' :
                console.log(`Computer ${messageData.id} failed [${messageData.utcDate}]`);
                break;
            case 'FOUND' :
                console.log(`Computer ${messageData.id} succeeded [${messageData.utcDate}]`);
                console.log("Password: ", messageData.answer);                
                break;
            default:
        }
    });
});

console.log(`Listening at  ws:\/\/${serverIp}:${packageData.port}`);
