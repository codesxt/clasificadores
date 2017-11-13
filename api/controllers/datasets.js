const utils = require('./utils');
const fs  = require("fs");
const _ = require("underscore");

var path = require('path');
var appDir = path.dirname(require.main.filename);
var appDir = appDir.replace('/bin','');

module.exports.getDatasets = (req, res) => {
  var fileList = fs.readdirSync(appDir+"/datasets");
  utils.sendJSONresponse(res, 200, {
    data: fileList
  })
}

module.exports.deleteDataset = (req, res) => {
  let datasetName = req.params.datasetName;
  fs.unlink(appDir+"/datasets/"+datasetName, (err) => {
    if(err){
      console.log(error);
      utils.sendJSONresponse(res, 500, {
        message: "No se pudo eliminar el archivo."
      });
    }else{
      utils.sendJSONresponse(res, 200, {});
    }
  })
}
