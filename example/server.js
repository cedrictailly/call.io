
const express = require("express");
const app     = express();
const server  = require("http").createServer(app);
const io      = require("socket.io")(server);
const callio  = require("..");

app.use(express.static(__dirname + "/public"));

io.on("connection", socket => {
  callio.publish(socket, "methods", require("./methods"));
});

const port = process.argv[2] || 3000;

server.listen(port, () => {
  console.log("http://localhost:" + port);
});
