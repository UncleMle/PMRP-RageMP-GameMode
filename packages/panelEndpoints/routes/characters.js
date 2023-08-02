const express = require('express');
const router = express.Router();
const api = require('../api/api.js');
const db = require('../models');

module.exports = router.get('/', async(req, res) => {
    const token = req.header("x-auth-token");
    if(!token) return res.status(401).send({
        status: false,
        error: "Access Denied, No Token provided"
    });
    let checkToken = await api.auth(token);
    if(checkToken) {
        db.web_tokens.findAll({ where: {token: token} }).then(acc => {
            if(acc.length > 0) {
                db.characters.findAll({ where: {OwnerId: acc[0].accountId} }).then(char => {
                    res.send({
                        status: true,
                        characters: char
                    })
                })
            }
        })
    } else {
        return res.status(401).send({
            status: false,
            error: "Token Expired"
        });
    }
})

