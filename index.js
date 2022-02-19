
module.exports.CallIoRepository = class CallIoRepository
{
  constructor(name = 'default'){
    this._name       = name;
    this._procedures = {};
    this._socket     = null;
  }

  get name()       { return this._name; };
  get socket()     { return this._socket; };
  get procedures() { return Object.keys(this._procedures); }

  // --- //

  add(name, callback)
  {
    if ( this._procedures[name] )
      throw new Error(`Procedure ${name} already defined`);

    this._procedures[name] = callback;

    return this;
  }

  remove(name){
    delete this._procedures[name];
    return this;
  }

  has(name){
    return !!this._procedures[name];
  }

  // --- //

  async connect(socket)
  {
    if ( this._socket )
      throw new Error('Already connected');

    this._socket = socket;

    this._procedures = {};

    (await this.call('@')).forEach(name => {
      this._procedures[name] = this[name] = (...args) => this.call(name, ...args);
    });

    return {...this._procedures};
  }

  disconnect()
  {
    if ( !this._socket )
      throw new Error('Not connected');

    for ( var name in this._procedures )
      delete this[name];

    this._procedures = {};
    this._socket     = null;

    return this;
  }

  call(name, ...args)
  {
    return new Promise((resolve, reject) => {

      if ( !this._socket )
        return reject(new Error('Not linked'))

      const id = require('shortid').generate();

      this._socket.once('callio:' + id, result =>
      {
        if ( result.error )
        {
          if ( result.error.type == 'NOTFOUND' )
            return reject(new Error('Procedure not found'));

          return reject(new Error(result.error.name, result.error.message));
        }

        resolve(result.result);
      });

      this._socket.emit('callio:' + this._name, name, args, id);
    });
  }

  // --- //

  publish(socket)
  {
    socket.on('callio:' + this._name, (name, args, id) =>
    {
      if ( name == '@' )
        return socket.emit('callio:' + id, {
          result: this.procedures,
        });

      if ( !this._procedures[name] )
        return socket.emit('callio:' + id, {
          error: {
            type: 'NOTFOUND',
          },
        });

      try
      {
        var returned = this._procedures[name](...args);
      }
      catch ( error )
      {
        socket.emit('callio:' + id, {
          error: {
            type   : 'EXCEPTION',
            name   : error.name,
            message: error.message,
          },
        });

        return;
      }

      if ( returned instanceof Promise )
        return returned.then(result => {
          socket.emit('callio:' + id, {
            result: result,
          });
        }).catch(error => {
          socket.emit('callio:' + id, {
            error : {
              type   : 'EXCEPTION',
              name   : error.name,
              message: error.message,
            },
          });
        });

      socket.emit('callio:' + id, {
        result: returned,
      });
    });

    return this;
  }

  unpublish(socket)
  {
    socket.off('callio:' + this._name);

    this.remove('@', () => this.procedures);

    return this;
  }
}

module.exports.create = (name = 'default') => new module.exports.CallIoRepository(name);
