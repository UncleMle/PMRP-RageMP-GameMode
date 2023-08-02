const express = require('express');
const router = express.Router();
const api = require('../api/api.js');
const db = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = router.post('/', (req, res) => {
    if( (req.body.user && req.body.password) != undefined ) {
        db.Accounts.findAll({ where: {username: req.body.user} }).then(async(acc) => {
            if(acc.length > 0) {
                var entry = await bcrypt.compare(req.body.password, acc[0].password);
                if(entry) {

                    const token = jwt.sign({
                        id: acc[0].id,
                        roles: acc[0].adminStatus,
                    }, "jwtPrivateKey", { expiresIn: "20m" });

                    db.web_tokens.create({
                        token: token,
                        accountId: acc[0].id,
                        adminLevel: acc[0].adminStatus,
                        created: api.getUnix(),
                        expires: api.getUnix()+1200
                    })

                    res.send({
                        status: true,
                        token: token,
                        data: acc[0],
                        serverData: acc[0]
                    })
                    return;
                } else {
                    res.send({
                        status: false
                    })
                }
                return;
            } else {
                res.send({
                    status: false
                })
            }
        })
    }
})

