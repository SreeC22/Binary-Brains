if (typeof global.fetch !== 'function') {
    global.fetch = require('node-fetch');
    global.Response = global.fetch.Response;
  }
  
