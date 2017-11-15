const utils = require('./utils');
const fs    = require("fs-extra");

module.exports.getResultsByID = (req, res) => {
  let folder = "./results/"+req.params.id+"/";
  fs.readdir(folder, (err, files) => {
    if(err) {
      utils.sendJSONresponse(res, 400, {
        message: "Error al leer archivos."
      })
    }else{
      utils.sendJSONresponse(res, 200, {
        data: files
      })
    }
  })
}

module.exports.getAllResults = (req, res) => {
  let file = "./results/db.json";
  if(fs.pathExistsSync(file)){
    resultsDB = fs.readJsonSync('results/db.json');
    utils.sendJSONresponse(res, 200, {
      data: resultsDB.reverse()
    })
  }else{
    utils.sendJSONresponse(res, 200, {
      data: []
    })
  }
}

module.exports.deleteResultsByID = (req, res) => {
  let id = req.params.id;
  let file = "./results/db.json";
  if(fs.pathExistsSync(file)){
    resultsDB = fs.readJsonSync('results/db.json');
  }else{
    resultsDB = [];
  }
  resultsDB = resultsDB.filter((obj) => {
    return obj.id !== id;
  });
  fs.writeJsonSync('results/db.json', resultsDB);
  fs.remove('results/'+id, err => {
    if (err) return console.error(err);
    console.log('Se eliminó la carpeta ' + 'results/'+id);
  })
  utils.sendJSONresponse(res, 200, {})
}
