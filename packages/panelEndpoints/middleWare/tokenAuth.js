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
            db.web_tokens.findAll({ where: {token: token} }).then(acc => {
                if(acc.length > 0) {
                    db.Accounts.findAll({ where: {id: acc[0].accountId} }).then(accs => {
                        if(accs.length > 0) {
                            res.send({
                                status: true,
                                token: token,
                                data: accs[0],
                                serverData: accs[0]
                            })
                        }
                    }).catch(e => mp.log(e))
                } else {
                    res.status(401).send({
                        status: false,
                        error: "Token not found"
                    });
                }
            })
        }
    } catch(err) {
        return res.status(401).send({
            status: false,
            error: "Token Expired"
        });
    }
})