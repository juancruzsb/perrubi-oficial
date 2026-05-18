const express = require('express');

const router = express.Router();

const {
    getRoute,
    getDirection
} = require('../services/maps.service');

router.get('/', (req, res) => {
    res.json({
        message: 'API de mapas funcionando'
    })
});

router.post('/route', getRoute);
router.post('/directions', getDirection);

module.exports = router;