const express = require('express');
const router = express.Router();
const db = require('../models');
const jwt = require('jsonwebtoken');

module.exports = router.get('/', (req, res) => {
    const token = req.header("x-auth-token");
    if(!token) return res.status(401).send({
        status: false,
        error: "Access Denied, No Token provided"
    });
    try {
        const decoded = jwt.verify(token, "jwtPrivateKey");
        req.user = decoded;
        if(req.user) {
            db.web_tokens.findAll({ where: {token: token} }).then(acc => {
                if(acc.length > 0) {
                    db.admin_punishments.findAll({ where: {accountId: acc[0].accountId} }).then(punishment => {
                        res.send({
                            status: true,
                            data: punishment
                        })
                    })
                }
            })
        }
    } catch(err) {
        return res.status(401).send({
            status: false,
            error: "Token Expired"
        })
     }
})