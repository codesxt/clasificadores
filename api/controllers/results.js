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
