const express = require('express');

const router = express.Router();

const {
    getRoute
} = require('../services/maps.service');

router.post('/route', getRoute);

module.exports = router;