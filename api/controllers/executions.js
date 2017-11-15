const utils = require('./utils');
const fs  = require("fs-extra");
const shortid = require('shortid');
const mkdirp = require('mkdirp');
const { spawn } = require('child_process')
const _ = require("underscore")

var clientManager = require('../../clients');
const coresManager = require('../../controllers/cores-manager');

var path = require('path');
var appDir = path.dirname(require.main.filename);
var appDir = appDir.replace('/bin','');

module.exports.execute = (req, res) => {
  let id = req.body.logId;
  let description = {
    has_header : req.body.description.has_header,
    class_col  : req.body.description.class_col
  }
  let algorithms = {
    normalization  : req.body.algorithms.normalization,
    paralelization : req.body.algorithms.paralelization,
    cores          : req.body.algorithms.cores,
    sampling       : req.body.algorithms.sampling,
    algorithms     : req.body.algorithms.algorithms
  }
  let dataset = req.body.description.dataset;
  createExcecution(id, description, algorithms, dataset);
  utils.sendJSONresponse(res, 200, {
    message: "Execution started.",
    id: id
  })
}

var desc = {
  has_header : false,
  class_col  : 1,
  out_folder : '"./outputs/testing/"'
}

var config = {
  normalization  : true,
  paralelization : true,
  cores          : '"ALL"',
  sampling       : '"LOO"',
  algorithms     : [
    "classif.knn",
    "classif.naiveBayes",
    "classif.rpart",
    "classif.randomForest",
    "classif.svm",
    "classif.LiblineaRL1L2SVC",
    "classif.LiblineaRL1LogReg",
    "classif.LiblineaRL2L1SVC",
    "classif.LiblineaRL2LogReg",
    "classif.LiblineaRL2SVC"
  ]
}

parseDescription = (description) => {
  var text = "";
  text += "cabecera.archivo<-" + ((description.has_header) ? 'TRUE' : 'FALSE');
  text += "\ncolumna.clase<-" + description.class_col;
  text += "\ncarpeta_salida<-" + description.out_folder;
  return text;
}

parseConfiguration = (configuration) => {
  var algs = configuration.algorithms.slice(0);
  var lastAlg = algs.pop()
  var text = "";
  text += "normalizacion<-" + ((configuration.normalization) ? 'TRUE' : 'FALSE');
  text += "\nparalelizacion<-" + ((configuration.paralelization) ? 'TRUE' : 'FALSE');
  text += "\ncores<-" + configuration.cores;
  text += "\nmuestreo<-makeResampleDesc(method = \"" + configuration.sampling + "\")";
  text += "\nAlgoritmos<-c(";
  for(alg of algs){
    text += '"' + alg + '", '
  }
  text += '"' + lastAlg + '")';
  return text;
}

createExcecution = (id, dsDescription, algsConfig, dataset) => {
  console.log("Iniciando ejecución de los métodos de clasificación.");
  // Crear ID
  console.log("ID de ejecución: " + id);
  // Crear carpeta con el ID en la carpeta "excecutions"
  mkdirp('executions/'+id, function (err) {
    if (err) console.error(err);
    else {
      console.log('Created folder : executions/'+id);
      // Crear carpetas para opciones y salidas de la ejecución
      optsFolder = mkdirp.sync('executions/' + id + '/options');
      outpFolder = mkdirp.sync('executions/' + id + '/outputs');
      console.log('Created folder : executions/'+id+'/options');
      console.log('Created folder : executions/'+id+'/outputs');
      // Crear archivos de descripción y configuración en la carpeta options
      dsDescription.out_folder = '"' + appDir + '/executions/'+id+'/outputs/"';
      // Se actualiza la cantidad de cores disponibles
      coresManager.requestCores(algsConfig.cores);
      description   = parseDescription(dsDescription);
      configuration = parseConfiguration(algsConfig);
      fs.writeFileSync('executions/'+id+'/options/description.txt', description);
      fs.writeFileSync('executions/'+id+'/options/configuration.txt', configuration);
      descFile = appDir + '/executions/'+id+'/options/description.txt';
      confFile = appDir + '/executions/'+id+'/options/configuration.txt';
      console.log('Created file   : executions/'+id+'/options/description.txt');
      console.log('Created file   : executions/'+id+'/options/configuration.txt');
      // Obtener ruta del dataset
      // datasetFile = appDir + "/datasets/set_datos_mg_15_mejores.csv";
      datasetFile = appDir + "/datasets/" + dataset;
      // Configure and execute script
      var args = [
        "./main.R",
        datasetFile,
        descFile,
        confFile,
        '--vanilla'
      ];
      var options = {
        env: _.extend({DIRNAME: appDir}, process.env),
        encoding: "utf8"
      };
      var child = spawn("Rscript", args, options);
      console.log("Spawned Process: " + child.pid);
      child.stderr.on("data", (d) => {
        //console.log("Stderr: " + d.toString('utf8'));
      });
      child.stdout.on("data", function(d) {
        var text = d.toString('utf8');
        //console.log("Stdout: " + text);
        clientManager.messageToClient(text, id);
        clientManager.pidToClient(child.pid, id);
      });
      child.on('exit', function(code, signal) {
        if(signal=='SIGTERM'){
          console.log("Terminó la ejecución " + id + " de manera forzosa.");
          fs.remove('executions/'+id, err => {
            if (err) return console.error(err);
            console.log('Se eliminó la carpeta ' + 'executions/'+id);
          })
        }else{
          console.log("Terminó la ejecución " + id + " de manera normal.");
          //  Generar un ID único para el resultado
          var resultId = shortid.generate();
          fs.move('executions/'+id+'/outputs', 'results/'+resultId, err => {
            fs.remove('executions/'+id, err => {
              if (err) return console.error(err);
              console.log('Se eliminó la carpeta ' + 'executions/'+id);
            })
            if (err) return console.error(err);
            console.log('Se guardaron los resultados en la carpeta ' + 'results/'+id);

            // Solución momentánea para mantener un registro de los resultados generados
            // (antes de implementar una base de datos)
            let resultsDB = null;
            if(fs.pathExistsSync('results/db.json')){
              resultsDB = fs.readJsonSync('results/db.json');
            }else{
              resultsDB = [];
            }

            let resultData = {
              id            : resultId,
              dataset       : dataset,
              description   : dsDescription,
              configuration : algsConfig,
              date          : new Date()
            }

            resultsDB.push(resultData);
            fs.writeJsonSync('results/db.json', resultsDB);
            // Enviar información de resultados al cliente
            clientManager.toClient({
              type : "resultdata",
              data : resultData
            }, id);
          })
        }
        clientManager.messageToClient("Terminó la ejecución.", id);
        clientManager.signalToClient("FINISH", id);
        coresManager.releaseCores(algsConfig.cores);
      })
    }
  });
}

module.exports.killProcess = (req, res) => {
  process.kill(req.params.pid);
  utils.sendJSONresponse(res, 200, {});
}
