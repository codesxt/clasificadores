const express = require('express');
const router = express.Router();

const ctrlExecution       = require('./controllers/executions');
const ctrlDatasets        = require('./controllers/datasets');

router.post('/execute', ctrlExecution.execute);
router.delete('/process/:pid', ctrlExecution.killProcess);

router.get('/datasets', ctrlDatasets.getDatasets);
router.delete('/dataset/:datasetName', ctrlDatasets.deleteDataset);
router.post('/dataset', ctrlDatasets.uploadDataset);

module.exports = router;
