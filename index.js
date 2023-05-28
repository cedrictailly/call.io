
exports.publish = (socket, name, methods) => {

  if (!name.match(/^[a-z0-9\-]+$/))
    throw new Error("Invalid package name format, must be lowercase letters, numbers and dashes only");

  if (!socket.callio) {

    socket.callio = new Map();

    socket.on(
      "callio:list",
      callback => callback(Array.from(socket.callio.keys())),
    );

    socket.on("callio:subscribe", (name, callback) => {

      if (!socket.callio.has(name))
        return callback("Package not published");

      const methods = socket.callio.get(name);

      Object.keys(methods).forEach(method => {

        socket.on("callio:call:" + name + ":" + method, async (...args) => {

          const callback = args.pop();

          try {
            const result = methods[method](...args);
            callback(null, result instanceof Promise ? await result : result);
          } catch (error) {
            callback(error.toString());
          }
        });
      });

      callback(null, Object.keys(methods));
    });

  } else if (socket.callio.has(name))
    throw new Error("Package already published");

  socket.callio.set(name, methods);
};

exports.unpublish = (socket, name) => {

  if (!socket.callio.has(name))
    throw new Error("Package not published");

  socket.callio.delete(name);
};

exports.list = socket => new Promise((resolve, reject) => {
  socket.emit("callio:list", resolve);
});

exports.require = (socket, name) => new Promise((resolve, reject) => {

  if (socket.callio?.has(name))
    return resolve(socket.callio.get(name));

  exports.list(socket).then(list => {

    socket.emit("callio:subscribe", name, async (err, methods) => {

      if (err)
        return reject(new Error(err));

      const result = {};

      methods.forEach(method => {
        result[method] = (...args) => new Promise((resolve, reject) => {
          socket.emit(
            "callio:call:" + name + ":" + method,
            ...args,
            (err, result) => err ? reject(new Error(err)) : resolve(result),
          );
        });
      });

      if (!socket.callio)
        socket.callio = new Map();

      socket.callio.set(name, result);

      resolve(result);
    });
  });
});
