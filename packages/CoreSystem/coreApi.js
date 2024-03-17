
const express = require('express');
const app = express();
const port = 5000;
const nodemailer = require('nodemailer');
const db = require('../models');
const LZString = require('./compression.js');
const consoleColours = require('@jshor/colors');
require("dotenv").config();

const email = process.env.NODEMAILER_EMAIL;
const emailPassword = process.env.NODEMAILER_PASSWORD;

class coreApi {
    constructor() {
        this.CONFIG = require('./chatformatconf.js').CONFIG;
        this.count = [];
        this.callbacks = [];

        mp.cmds = {
            add: (name, callback) => {
                name.forEach(async data => {
                    this.count.push(data);
                    this.callbacks.push(callback);
                    mp.events.addCommand(data, callback);
                    mp.events.addCommand(data.toUpperCase(), callback);
                })
            },
            getCmds: () => {
                return this.count;
            }
        }

        mp.core = {
            idOrName: (player, id) => {
                var nameMngr = []
                mp.players.forEach((ps) => {
                    if (!ps.getVariable('loggedIn')) { return; }
                    if (ps.id == id && ps.getVariable('loggedIn') == true) {
                        nameMngr.push(ps);
                    }
                    if (ps.characterName && ps.characterName.replace(' ', '_').toLowerCase() === id.replace(' ', '_').toLowerCase() && ps.getVariable('loggedIn') == true || ps.characterName.split(' ')[0].replace(' ', '_').toLowerCase().toString() === id.replace(' ', '_').toLowerCase() && ps.getVariable('loggedIn') == true || ps.characterName.split(' ')[1].replace(' ', '_').toLowerCase().toString() === id.replace(' ', '_').toLowerCase() && ps.getVariable('loggedIn') == true) {
                        nameMngr.push(ps);
                    }
                })
                if (nameMngr.length > 0) {
                    return nameMngr[0];
                }
                else { return false }
            },

            msgAdmins: (msg) => {
                mp.players.forEach((ps) => {
                    if(ps.getVariable('loggedIn') && ps.isAdmin > 0) {
                        mp.chat.aPush(msg);
                    }
                })
            },

            compressStringToClient: (player, string, event) => {
                let compressedStr = LZString.compress(string);
                player.call(event, [compressedStr]);
            },

            addBankingLog: (sqlid, actionName, type, moneyAmount) => {
                db.banking_logs.create({
                    OwnerId: sqlid,
                    actionName: actionName,
                    type: type,
                    moneyAmount: moneyAmount,
                    time: mp.core.getUnixTimestamp()
                })
            },

            sendEmail: (targetUser, address, subject, textBody) => {
                if (!address || !subject || !textBody) return;
                function sendEmail() {
                    return new Promise((resolve, reject) => {
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: email,
                                pass: emailPassword
                            }
                        })

                        const emailMsg = `<!DOCTYPE html>
                      <html>

                      <head>
                          <meta charset="UTF-8">
                          <style>
                              body {
                                  font-family: Arial, sans-serif;
                                  font-size: 16px;
                                  line-height: 1.5;
                                  color: #333333;
                              }

                              header {
                                  border-top: solid rgb(183, 119, 255) 5px;
                                  background-color: #0000004b;
                                  color: #ffffff;
                                  padding: 5px;
                              }

                              .logo {
                                  font-size: 24px;
                                  font-weight: bold;
                                  margin: 0;
                              }

                              .content {
                                  padding: 20px;
                              }

                              footer {
                                  background-color: #f0f0f0;
                                  color: #333333;
                                  padding: 20px;
                                  text-align: center;
                              }
                          </style>
                      </head>

                      <body>
                          <header>
                              <h1 class="logo"><img src="https://i.imgur.com/dcZQZAh.png" height="100" width="320"></h1>
                          </header>
                          <div class="content">
                          ${textBody}
                          </div>
                          <footer>
                              <p>© 2023 ParamountRP. All rights reserved.</p>
                          </footer>
                      </body>
                      </html>`;

                        const mail_configs = {
                            from: 'paramountregister@gmail.com',
                            to: address,
                            subject: subject,
                            html: emailMsg
                        }

                        if (targetUser != null && mp.players.at(targetUser.id)) {
                            db.server_emails.create({
                                OwnerId: targetUser.sqlID == null ? -1 : targetUser.sqlID,
                                unix: mp.core.getUnixTimestamp(),
                                text: textBody,
                                targetAddress: address
                            }).catch((err) => { mp.log(err) })
                        }

                        transporter.sendMail(mail_configs, function (error, info) {
                            if (error) {
                                mp.log(`[MAIL] ${error}`)
                                return reject({ message: 'An error has occured' })
                            }
                            return resolve({ message: 'Email sent successfully' })
                        })

                        mp.log(`[INFO] Nodemailer has sent an email to ${address}`)
                    })
                }
                sendEmail()
                app.listen(port, () => {
                    mp.log(`[INFO] Nodemailer process has started under port ${port}`)
                })
            },

            annToAll: (message) => {
                mp.players.forEach((ps) => {
                    if (ps.getVariable('loggedIn') == true) {
                        mp.chat.ann(ps, `${message}`)
                    }
                })
            },

            updatePlayerMoney: async(player, type, amount) => {
                if(!player.getVariable('loggedIn')) return;
                switch(type) {
                    case 'add':
                    {
                        db.characters.findAll({ where: {id: player.characterId} }).then(char => {
                            if(char.length > 0) {
                                player.moneyAmount += amount;
                                player.setVariable('moneyValue', player.moneyAmount);
                                db.characters.update({
                                    moneyAmount: player.moneyAmount
                                }, { where: {id: player.characterId} }).catch(err => {mp.log(err)});
                                return;
                            }
                        })
                        break;
                    }
                    case 'remove':
                    {
                        db.characters.findAll({ where: {id: player.characterId} }).then(char => {
                            if(char.length > 0) {
                                player.moneyAmount -= amount;
                                player.setVariable('moneyValue', player.moneyAmount);
                                db.characters.update({
                                    moneyAmount: player.moneyAmount
                                }, { where: {id: player.characterId} }).catch(err => {mp.log(err)});
                                return;
                            }
                        })
                        break;
                    }
                    default: break;
                }
            },

            addAdminPunishment: (player, admin, act, log, expires) => {
                if (player.getVariable('loggedIn') && admin.getVariable('loggedIn') && log) {
                    try {
                        db.admin_punishments.create({
                            characterId: player.characterId,
                            accountId: player.sqlID,
                            adminName: admin.adminName,
                            adminId: admin.sqlID,
                            action: act,
                            log: log,
                            time: mp.core.getUnixTimestamp(),
                            voided: false,
                            expires: expires
                        }).catch((err) => {mp.log(err)})
                    } catch(e) { mp.log(e) }
                }
            },

            getUnixTimestamp: () => {
                return Math.round(Date.now() / 1000)
            },

            generateString(length) {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

                let result = '';
                const charactersLength = characters.length;
                for (let i = 0; i < length; i++) {
                    result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }

                return result;
            },

            sendNotif(player, message, time, icon) {
                player.call('requestBrowser', [`gui.notify.showNotification("${message}", ${time == null ? true : false}, ${time == null ? false : true}, ${time == null ? false : time}, '${icon}')`]);
            },

            clearNotifs(player) {
                player.call('requestBrowser', [`gui.notify.clearAll()`]);
            },

            genPlate(length) {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

                let result = '';
                const charactersLength = characters.length;
                for (let i = 0; i < length; i++) {
                    result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }

                return result;
            },

            formatUnixTimestamp: (unixTimestamp) => {
                const date = new Date(unixTimestamp * 1000)
                const hours = date.getHours()
                const minutes = date.getMinutes()
                const seconds = date.getSeconds()
                return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
            }
        }

        setTimeout(() => {
            mp.log(`${this.CONFIG.consoleBlue}[SERVER]${this.CONFIG.consoleWhite} Loaded all ${this.count.length} commands successfully.`)
            if (this.createDb) { this.createDb = false; }
        }, 5000);

    }
}

const core = new coreApi();

