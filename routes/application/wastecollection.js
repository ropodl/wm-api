const express = require('express');
const router = express.Router();
const wasteCollectionController = require('../../controller/application/wasteCollectionController');

// Define the API route
router.get('/api/waste-collection', wasteCollectionController.getWasteCollection);

module.exports = router;
