const express = require('express');
const router = express.Router();
const db = require('../models');
const api = require('../api/api');

module.exports = router.post('/', async(req, res) => {
    const token = req.body.token;
    if(token) {
        var tokenAuth = await api.auth(token);
        db.web_tokens.findAll({ where: {token: token} }).then(tokenCheck => {
            if(tokenCheck.length > 0 && tokenCheck[0].adminLevel > 2 && tokenAuth) {

                if((req.body.data.gameUnix && req.body.data.gameId) != null) {
                    if(api.checkVal('alp', req.body.data.gameUnix) || api.checkVal('alp', req.body.data.gameId)) return api.sendErr(res, 'param');

                    db.server_connections.findAll({ where: { gameId: req.body.data.gameId } }).then(connection => {
                        if(connection.length > 0) {
                            var oldest = JSON.stringify(connection[0].unix);
                            var newest = JSON.stringify(connection[connection.length - 1].unix);
                            if(req.body.data.gameUnix >= oldest && req.body.data.gameUnix <= newest) {
                                db.characters.findAll({ where: { id: connection[0].OwnerId } }).then((char) => {
                                    if(char.length == 0) return;

                                    res.send({
                                        status: true,
                                        characterId: char[0].id,
                                        characterName: char[0].cName
                                    })
                                })
                            } else {
                                res.send({
                                    status: false,
                                    error: 'No entry matching given parameters where found.'
                                })

                            }
                            return;
                        } else {
                            res.send({
                                status: false,
                                error: 'No game ID matching the one provided was found.'
                            })
                        }
                    })
                }

                if(req.body.data.searchType == 'Character SQLID' && req.body.data.searchQuery) {
                    if(api.checkVal('alp', req.body.data.searchQuery)) return api.sendErr(res, 'param');

                    db.characters.findAll({ where: {id: parseInt(req.body.data.searchQuery) } }).then(async(char) => {
                        if(char.length > 0) {
                            res.send({
                                status: true,
                                characterId: char[0].id,
                                characterName: char[0].cName
                            })
                        } else [
                            res.send({
                                status: false,
                                error: 'No entry matching given parameters where found.'
                            })
                        ]
                    })
                }

                if(req.body.data.searchType == 'Character Name' && req.body.data.searchQuery) {
                    if(api.checkVal('num', req.body.data.searchQuery)) return api.sendErr(res, 'param');

                    db.characters.findAll({ where: {cName: req.body.data.searchQuery } }).then(char => {
                        if(char.length > 0) {
                            res.send({
                                status: true,
                                characterId: char[0].id,
                                characterName: char[0].cName
                            })
                        } else [
                            res.send({
                                status: false,
                                error: 'No entry matching given parameters where found.'
                            })
                        ]
                    })
                }

            } else {

            }
        })
    } else {
        res.status(401).send({
            status: false,
            error: 'No token provided.'
        });
    }
})