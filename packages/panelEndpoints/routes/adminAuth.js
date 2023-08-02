const express = require('express');
const router = express.Router();
const db = require('../models');
const api = require('../api/api');

module.exports = router.get('/', async(req, res) => {
    const token = req.header("x-auth-token");
    if(token) {
        var auth = await api.auth(token);
        if(auth) {
            db.web_tokens.findAll({ where: {token: token} }).then(token => {
                if(token.length > 0 && token[0].adminLevel > 2) {
                    res.send({
                        status: true,
                        info: "Valid token",
                        adminLevel: token[0].adminLevel
                    });
                }
            })
        } else {
            res.status(401).send({
                status: false,
                error: "Invalid token"
            });
        }
    } else {
        return res.status(401).send({
            status: false,
            error: "No token provided"
        });
    }
});