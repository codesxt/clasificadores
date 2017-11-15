var debug = require('debug')('rscripts:server');

var clients = [];
var connectionIds = [];
var children = [];

module.exports.addClient = (ws, id) => {
  clients.push(ws);
  connectionIds.push(id);
}

module.exports.removeClient = (ws) => {
  debug("WebSocket: Client disconnected.");
  var i = clients.indexOf(ws);
  if(i != -1) {
    clients.splice(i, 1);
    connectionIds.splice(i, 1);
  }
}

module.exports.messageToClient = (message, id) => {
  var i = connectionIds.indexOf(id);
  clients[i].send(JSON.stringify({
    type    : "log",
    message : message
  }))
}

module.exports.broadcastMessage = (message) => {
  for(c of clients){
    c.send(JSON.stringify({
      type: "log",
      message:message
    }))
  }
}

module.exports.signalToClient = (signal, id) => {
  var i = connectionIds.indexOf(id);
  clients[i].send(JSON.stringify({
    type    : "signal",
    message : signal
  }))
}

module.exports.pidToClient = (pid, id) => {
  var i = connectionIds.indexOf(id);
  clients[i].send(JSON.stringify({
    type    : "pid",
    message : pid
  }))
}

module.exports.toClient = (obj, id) => {
  var i = connectionIds.indexOf(id);
  clients[i].send(JSON.stringify(obj))
}
