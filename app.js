const R   = require("r-script");

const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const api = require('./api/index');
const app = express();
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
var debug = require('debug')('rscripts:server');
const os = require('os');
const shortid = require('shortid');
const coresManager = require('./controllers/cores-manager');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// Point static path to dist
// app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(express.static(path.join(__dirname, 'client/dist')));
app.use('/datasets', express.static(path.join(__dirname, 'datasets')));
app.use('/results', express.static(path.join(__dirname, 'results')));
app.use('/api/v1', api);

var expressWs = require('express-ws')(app);

app.ws('/', function(ws, req) {
  ws.on('message', function(msg) {
    console.log(msg);
  });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

var clientManager = require('./clients');

wss.on('connection', (ws, req) => {
  debug("WebSocket: Received new connection.");
  var id = shortid.generate();
  clientManager.addClient(ws, id);
  ws.send(JSON.stringify({
    type: "log",
  	message: "Conectado exitosamente al servidor WebSocket."
  }));
  ws.send(JSON.stringify({
    type: "cores",
  	message: coresManager.getAvailableCores()
  }));
  ws.send(JSON.stringify({
    type: "logId",
  	message: id
  }));
  ws.on('message', function incoming(message) {
    console.log('Received: %s', message);
    let parsed = JSON.parse(message);
    if(parsed.type=='SETLOGID'){
      clientManager.setLogId(ws, parsed.message);
    }
  });
  ws.on('close', () => {
    clientManager.removeClient(ws);
  })
});

server.listen(process.env.PORT || 3101, () => {
  debug('WebSocket: Server started on port ' + (process.env.PORT || 3101));
});

debug('Number of CPUs Available: ' + coresManager.getAvailableCores());

module.exports = app;
