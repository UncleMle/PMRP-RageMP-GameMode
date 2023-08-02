const express = require('express');
const router = express.Router();
const db = require('../models');
const api = require('../api/api');

module.exports = router.post('/', async(req, res) => {
    const token = req.header("x-auth-token");
    if( (req.body.accountId && req.body.adminName && req.body.time && req.body.reason) != null && token) {
        let tokenCheck = await api.auth(token);
        if(tokenCheck) {
            db.web_tokens.findAll({ where: {token: token} }).then(webToken => {
                if(webToken[0].adminLevel > 2) {
                    db.Accounts.findAll({ where: {id: req.body.accountId} }).then((acc) => {
                        if(acc.length > 0) {
                            db.server_bans.create({
                                IP: acc[0].lastIP,
                                HWID: acc[0].HWID,
                                uuid: acc[0].uuid == undefined ? 'Not Known' : acc[0].uuid,
                                socialClub: acc[0].socialClub,
                                socialID: acc[0].socialClubId,
                                username: acc[0].username,
                                Reason: req.body.reason,
                                admin: req.body.adminName,
                                issueDate: new Date().toJSON().slice(0, 10),
                                LiftTimestamp: req.body.time == -1 ? -1 : api.getUnix() + (req.body.time * 60)
                            })

                            db.Accounts.update({ banStatus: 1 }, { where: {id: acc[0].id} });

                            mp.players.forEach(player => {
                                if(player.sqlID == acc[0].id) {
                                    if (player.getVariable('injured') == true) {
                                        mp.events.call('slayPlayer', player);
                                    }

                                    player.setVariable('loggedIn', false);
                                    player.setVariable('banned', true);
                                    player.setVariable('loggedIn', false);
                                    const date = new Date();
                                    let currentDate = date.toJSON();

                                    player.call('client:loginHandler', ['banned'])
                                    player.call('requestRoute', ['ban', true, true]);
                                    player.call('requestBrowser', [`appSys.commit('setBanInfo', {
                                        username: '${player.name}',
                                        IP: '${player.ip}',
                                        socialClub: '${player.socialClub}',
                                        reason: '${req.body.reason}',
                                        admin: '${req.body.adminName}',
                                        issueDate: '${currentDate.slice(0, 10)}',
                                      liftTime: '${req.body.time == -1 ? `Ban is permanent` : api.formatUnix(api.getUnix() + (req.body.time * 60))}'
                                    });`]);
                                }
                            })

                            res.send({
                                status: true,
                                info: `Banned account ${acc[0].username} successfully.`
                            });
                        }
                    })

                }
            })

        }
    } else {
        return res.status(401).send({
            status: false,
            error: "Invalid parameters or token"
        });
    }
});