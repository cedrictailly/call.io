
const ioClient = require("socket.io-client");
const callio   = require("..");

(async () => {

  const socket = ioClient.connect("http://localhost:" + (process.argv[2] || 3000));

  console.log("Available packages: " + (await callio.list(socket)).join(", "));

  const {addNumbers, fetch, throwError} = await callio.require(socket, "methods");

  try {

    console.log(await Promise.all(Array(100).fill(0).map(
      (_, idx) => addNumbers(idx, idx * 2))),
    );

    console.log(await fetch("http://api.ipify.org/?format=json"));
    console.log(await throwError());

  } catch (error) {
    console.log(error.message);
  }

})();

// process.on('uncaughtException', (err) => {
//   console.log(err.message);
//   process.exit(1);
// });
