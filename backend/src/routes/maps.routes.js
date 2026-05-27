const express = require('express');

const router = express.Router();

const {
    getRoute,
    getDirection,
    createSingleRouteWaypoints
} = require('../services/maps.service');

router.get('/', (req, res) => {
    res.json({
        message: 'API de mapas funcionando'
    })
});
router.post('/route', getRoute);
router.post('/directions', getDirection);
router.post('/route/waypoints', createSingleRouteWaypoints);


module.exports = router;