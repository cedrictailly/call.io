
# Call.IO

A remote procedure call system through Socket.IO

## Installation

```bash
npm install -s call.io
```

or :

```bash
yarn add call.io
```

## Usage

See example in the tests folder.

### Server side

```javascript

const server = require('http').createServer();
const io     = require('socket.io')(server);
const callio = require('call.io').create();

// --- //

callio.add('log', message =>
{
  console.log(message);

  return "Hello from server";
});

callio.add('plusOne', value => value + 1);

// --- //

io.on('connection', socket => callio.publish(socket));

server.listen(8080);

```

### Client side

```javascript

const socket = require('socket.io-client')('http://127.0.0.1:8080/');
const callio = require('call.io').create();

const { log, plusOne } = await callio.connect(socket);

console.log(await log("Hello from client"));
console.log(await plusOne(10));

console.log(await callio.log("Hello from client"));
console.log(await callio.plusOne(10));

console.log(await callio.call('log', "Hello from client"));
console.log(await callio.call('plusOne', 10));

```
