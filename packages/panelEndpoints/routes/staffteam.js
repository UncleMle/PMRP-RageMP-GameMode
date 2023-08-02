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
        let admins = [];
        admins.length = 0;
        new Promise((resolve, reject) => {
            db.Accounts.findAll({}).then(acc => {
                acc.forEach(item => {
                    if(item.adminStatus > 0) {
                        admins.push({"name": item.aName, "level": item.adminStatus});
                    }
                })
                resolve()
            })
        }).then(() => {
            res.send({
                admins: admins
            })
        })
    } else {
        return res.status(401).send({
            status: false,
            error: "Token Expired"
        });
    }
})