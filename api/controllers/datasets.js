const utils = require('./utils');
const fs  = require("fs");
const _ = require("underscore");
const multer = require('multer');

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

// Código relacionado a la subida de archivos con multer

var localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './datasets/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

var upload = multer({
  storage: localStorage
}).single('file');

module.exports.uploadDataset = (req, res) => {
  var path = '';
  upload(req, res, function (err) {
    if (err) {
      // An error occurred when uploading
      console.log(err);
      return res.status(422).send("an Error occured")
    }
   // No error occured.
    path = req.file.path;
    return res.send("Upload Completed for "+path);
  })
}
