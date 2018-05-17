# Password Breaker Instructions

## Installing Node
Make sure you have node installed first. If you don't have it, get it from here: https://nodejs.org/en/

Once you have that, run this command in the directory
```
npm install
```

## Hosting the Server

Only one person can host the server

To open the server 
```
node passwordSender.js
```
Once at least one client has connected, type a 4 letter lowercase string to start the breaker. For example:
```
abcd
```
Type "R" to create a random string
```
R
```

## Becoming a Client

To start the client
```
node passwordReceiver.js <server ip>
```
Starting the client with no ip will default to localhost. Then wait for the server to send a string.