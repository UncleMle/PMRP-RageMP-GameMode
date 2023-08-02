const express = require('express');
const router = express.Router();
const db = require('../models');
const jwt = require('jsonwebtoken');

module.exports = router.get('/', (req, res) => {
    const token = req.header("x-auth-token");
    if(!token) return res.status(401).send({
        status: false,
        error: "Access denied, No token provided"
    });
    try {
        const decoded = jwt.verify(token, "jwtPrivateKey");
        req.user = decoded;
        if(req.user) {
            db.vehicles.findAll({}).then((veh) => {
                res.send({
                    vehicles: veh
                })
            })
        }
    } catch(err) {
        return res.status(401).send({
            status: false,
            error: "Token Expired"
        });
    }
})
