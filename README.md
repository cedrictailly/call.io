
# Call.IO

[![npm version](https://badge.fury.io/js/take-easy.svg)](https://www.npmjs.com/package/call.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A remote procedure call (RPC) module through Socket.IO.

## Installation

```bash
npm install -s call.io
```

or :

```bash
yarn add call.io
```

## Usage

You can see a use case in `/example`, here is an example.

### Server side

```javascript

const server = require('http').createServer();
const io     = require('socket.io')(server);
const callio = require('callio');

const methods = {
  log: message => {
    console.log(message);
    return "Hello from server";
  },
  plusOne: value => value + 1
};

io.on('connection', socket => callio.publish(socket, "methods", methods));

server.listen(8080);

```

### Client side

```javascript

(async () => {

  const socket = require('socket.io-client')('http://127.0.0.1:8080/');
  const callio = require('callio');

  const { log, plusOne } = await callio.require(socket, "methods");

  console.log(await log("Hello from client"));
  console.log(await plusOne(10));

})();

```

## License

This package is open source and available under the [MIT License](https://opensource.org/licenses/MIT).
