
const socket = require('socket.io-client')('http://127.0.0.1:8080/');
const callio = require('..').create();

socket.on('disconnect', () => {
  socket.close();
});

socket.on('connect', async () =>
{
  const { log, plusOne } = await callio.connect(socket);

  const hash = require('shortid').generate();

  console.log('procedures : ' + callio.procedures.join(', '));
  console.log("Sent to server : " + hash);

  console.log(await log("Hello from client : " + hash));
  console.log(await plusOne(10));

  console.log(await callio.log("Hello from client : " + hash));
  console.log(await callio.plusOne(10));

  callio.disconnect();
  socket.disconnect();
});
