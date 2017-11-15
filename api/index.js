const express = require('express');
const router = express.Router();

const ctrlExecution       = require('./controllers/executions');
const ctrlDatasets        = require('./controllers/datasets');
const ctrlResults         = require('./controllers/results');

router.post('/execute', ctrlExecution.execute);
router.delete('/process/:pid', ctrlExecution.killProcess);

router.get('/datasets', ctrlDatasets.getDatasets);
router.delete('/dataset/:datasetName', ctrlDatasets.deleteDataset);
router.post('/dataset', ctrlDatasets.uploadDataset);

router.get('/result/:id', ctrlResults.getResultsByID);

module.exports = router;
