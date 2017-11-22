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

module.exports.setLogId = (ws, id) => {
  // Forcefully set log id (used for reconnections to active logs)
  var i = clients.indexOf(ws);
  if(i != -1) {
    connectionIds[i] = id;
  }
}

module.exports.messageToClient = (message, id) => {
  var i = connectionIds.indexOf(id);
  if(clients[i] !== undefined){
    clients[i].send(JSON.stringify({
      type    : "log",
      message : message
    }))
  }else{
    debug("Error: attempting to message a non existing client.")
  }
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
  if(clients[i] !== undefined){
    clients[i].send(JSON.stringify({
      type    : "signal",
      message : signal
    }))
  }else{
    debug("Error: attempting to message a non existing client.")
  }
}

module.exports.pidToClient = (pid, id) => {
  var i = connectionIds.indexOf(id);
  if(clients[i] !== undefined){
    clients[i].send(JSON.stringify({
      type    : "pid",
      message : pid
    }))
  }else{
    debug("Error: attempting to message a non existing client.")
  }
}

module.exports.toClient = (obj, id) => {
  var i = connectionIds.indexOf(id);
  if(clients[i] !== undefined){
    clients[i].send(JSON.stringify(obj));
  }else{
    debug("Error: attempting to message a non existing client.")
  }
}

/*
// Block used to test client reconnection capabilities
setInterval(() => {
  for(let c of clients){
    debug("Killing connection to WebSocket.");
    c.terminate();
  }
}, 5000)
*/
