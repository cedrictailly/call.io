
const server = require('http').createServer();
const io     = require('socket.io')(server);
const callio = require('..').create();

// --- //

callio.add('log', message =>
{
  console.log(message);

  const hash = require("shortid").generate();

  console.log("Returned to client : " + hash);

  return "Hello from server : " + hash;
});

callio.add('plusOne', value => value + 1);

// --- //

io.on('connection', socket =>
{
  console.log(`[${socket.id}] connected`);

  socket.on('disconnect', () => {
    console.log(`[${socket.id}] disconnected`);
  });

  callio.publish(socket);
});

server.listen(8080, () => {
  console.log('Listening...');
});
