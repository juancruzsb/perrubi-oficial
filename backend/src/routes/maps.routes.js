const express = require('express');

const router = express.Router();

const {
    getRoute
} = require('../services/maps.service')

router.get('route/', getRoute)

module.exports = router