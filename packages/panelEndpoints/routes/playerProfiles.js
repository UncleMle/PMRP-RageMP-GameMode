const router = require('express').Router();
const db = require('../models');
const api = require('../api/api');

const deleteItems = ['pinNum', 'position'];

module.exports = router.get('/', async(req, res) => {
    const token = req.header('x-auth-token');
    const cid = req.header('cid');
    if(token && cid) {
        var auth = await api.auth(token);
        if(auth) {
            db.web_tokens.findAll({ where: {token: token} }).then(tokenCheck => {
                if(tokenCheck.length > 0 && tokenCheck[0].adminLevel > 2) {

                    db.characters.findAll({ where: {id: cid} }).then(char => {
                        if(char.length > 0) {
                            deleteItems.forEach(item => {
                                char[0][item] = undefined;
                                char[0].cName = char[0].cName.replace('_', ' ')
                            })
                            res.status(200).send({
                                status: true,
                                online: api.checkOnline('characterId', char[0].id),
                                data: char[0]
                            })
                        }
                    }).catch(err => {mp.log(err)});

                } else return api.sendErr(res, 'auth')
            })

        } else {
            api.sendErr(res, 'inval')
            return;
        }

    } else {
        api.sendErr(res, 'param')
        return;
    }
})