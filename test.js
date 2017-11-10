const fs  = require("fs");
const shortid = require('shortid');
const mkdirp = require('mkdirp');
const { spawn } = require('child_process')
const _ = require("underscore")

var path = require('path');
var appDir = path.dirname(require.main.filename);
//var appDir = appDir.replace('/bin','');

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
  var algs = configuration.algorithms;
  var lastAlg = algs.pop()
  var text = "";
  text += "normalizacion<-" + ((configuration.normalization) ? 'TRUE' : 'FALSE');
  text += "\nparalelizacion<-" + ((configuration.paralelization) ? 'TRUE' : 'FALSE');
  text += "\ncores<-" + configuration.cores;
  text += "\nmuestreo<-makeResampleDesc(method = " + configuration.sampling + ")";
  text += "\nAlgoritmos<-c(";
  for(alg of algs){
    text += '"' + alg + '", '
  }
  text += '"' + lastAlg + '")';
  return text;
}

createExcecution = (dsDescription, algsConfig) => {
  console.log("Iniciando ejecución de los métodos de clasificación.");
  // Crear ID
  var id = shortid.generate();
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
      dsDescription.out_folder = '"' + __dirname + '/executions/'+id+'/outputs/"';
      description   = parseDescription(dsDescription);
      configuration = parseConfiguration(algsConfig);
      fs.writeFileSync('executions/'+id+'/options/description.txt', description);
      fs.writeFileSync('executions/'+id+'/options/configuration.txt', configuration);
      descFile = __dirname + '/executions/'+id+'/options/description.txt';
      confFile = __dirname + '/executions/'+id+'/options/configuration.txt';
      console.log('Created file   : executions/'+id+'/options/description.txt');
      console.log('Created file   : executions/'+id+'/options/configuration.txt');
      // Obtener ruta del dataset
      datasetFile = __dirname + "/datasets/set_datos_mg_15_mejores.csv";
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
      child.stderr.on("data", (d) => {
        console.log("Stderr: " + d.toString('utf8'));
      });
      child.stdout.on("data", function(d) {
        console.log("Stdout: " + d.toString('utf8'));
      });
      child.on('exit', function() {
        console.log("Terminó la ejecución.");
      })
    }
  });
}

createExcecution(desc, config);
