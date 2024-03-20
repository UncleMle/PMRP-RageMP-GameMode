let CONFIG = require('../CoreSystem/chatformatconf.js').CONFIG;
const db = require('../models')
const fetch = require("node-fetch");
let ajail = mp.colshapes.newRectangle(3055, -4703.1, 100, 2000)
var toga = false;
var imgur = require('imgur');
var serverRestartTime = null;

mp.cmds.add(['ainfo'], async (player, id) => {
    if (id == null) return mp.chat.info(player, `Use: /ainfo [Name/ID]`)
    if (player.isAdmin > 2 && player.adminDuty || player.isAdmin > 7) {
        var rageMpPlayer = mp.core.idOrName(player, id)
        if (rageMpPlayer) {
            const clientFps = await rageMpPlayer.callProc('proc:getClientFPS')
            const clientRes = await rageMpPlayer.callProc('proc:getResoultion')
            mp.chat.sendMsg(player, `<font color="#919191">================================================<br><font color="yellow">Players Dimension: <font color="orange">[${rageMpPlayer.dimension}]<br> <font color="yellow">Injured: <font color="orange">[${rageMpPlayer.getVariable('injured') ? 'True' : 'False'}]<br> <font color="yellow">Admin Level: <font color="orange">[${rageMpPlayer.adminSt}]<br> <font color="yellow">Admin Name: <font color="orange">[${rageMpPlayer.adminName}]<br> <font color="yellow">Screen Resolution: <font color="orange">[${clientRes}]<br> <font color="yellow">Ajailed: <font color="orange">[${rageMpPlayer.getVariable('adminJailed') ? 'True' : 'False'}] <br><font color="yellow">Ping:<font color="orange"> [${rageMpPlayer.ping}]<br><font color="yellow"> FPS:<font color="orange"> [${clientFps}]<br><font color="yellow"> AC Violations:<font color="orange"> [${player.cheatViolations.join('/')} | (${player.cheatViolations.length}) ]<br><font color="yellow"> Licenses:<font color="orange"> [${rageMpPlayer.licenses}]`);
            mp.chat.sendMsg(player, `<font color="#919191">================================================`);
            player.call('requestRoute', ['stats', true, true]);
            player.call('requestBrowser', [`appSys.commit('updateStats', {
                name: '${rageMpPlayer.characterName}',
                id: ${rageMpPlayer.id},
                bank: '${rageMpPlayer.moneyAmount.toLocaleString("en-US")}',
                cash: '${rageMpPlayer.cashAmount.toLocaleString("en-US")}',
                credits: 0,
                phone: 0,
                occupation: 'notset',
                hours: ${Math.round(rageMpPlayer.playTime / 60)},
                salary: 0,
                debt: 0,
                vehicles: 0,
                characters: 0,
                houses: 0
            });`])
            return
        }
        else { mp.chat.err(player, `No player with this ID was found.`) }
        return;
    }
    mp.chat.err(player, `${CONFIG.noauth}`);
}),
    mp.cmds.add(['aid', 'adminid'], async (player, id) => {
        if (id == null) return mp.chat.info(player, `Use: /adminid [Name/ID]`)
        if (player.isAdmin > 2) {
            var target = mp.core.idOrName(player, id)
            if (target) {
                mp.chat.aPush(player, `!{yellow}Name: !{orange}[${target.characterName}] !{yellow}ID: !{orange}[${target.id}] !{yellow} Ping: !{orange}[${target.ping}]`)
            }
            else { mp.chat.err(player, `No player with this ID was found.`) }
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['report', 'createticket'], async (player, fullText, ...message) => {
        if (fullText == null || message == null) return mp.chat.info(player, `Use: /report [message]`)
        function getUnixTimestamp() {
            return Math.round(Date.now() / 1000);
        }
        function validReport(report) {
            let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(report).toLowerCase());
        }
        if (validReport(message.join(' '))) return mp.chat.err(player, 'Use correct word formatting')
        const { admin_reports } = require('../models')
        admin_reports.findAll({
        }, { where: { OwnerId: player.id } }).then((report) => {
            if (report.length == 0) {
                admin_reports.create({
                    OwnerId: player.id,
                    Time: parseInt(getUnixTimestamp()),
                    Description: String(message.join(' ')),
                    accepted: 0
                }).then(() => {
                    player.createdReport = 1;
                    mp.chat.report(player, `Your report has been submitted !{#78cc78}successfully!{white} please wait until a member of staff reviews it.`);
                    mp.players.forEach((ps) => { if (ps.isAdmin > 0 && ps.getVariable('toggledAdmin') === false) { mp.chat.report(ps, `A new report has been created.`) } })
                    mp.players.forEach((ps) => { if (ps.isAdmin > 0) { ps.call('report:sync') } });
                })
                return
            }
            else { return mp.chat.err(player, `You already have a pending report.`) }
        }).catch((err) => { mp.log(err) })
    }),
    mp.cmds.add(['adrev', 'adminrevive'], async (player, arg) => {
        if (arg != undefined) return mp.chat.info(player, `Use: /adrev`)
        if (player.isAdmin > 2 && player.adminDuty || player.isAdmin > 7) {
            player.health = 100;
            player.setVariable('injured', false)
            player.stopAnimation();
            player.call('unfreezePlayer');
            player.call('endDeath');
            const { characters } = require('../models')
            characters.update({
                isInjured: 0,
                injuredTime: 0
            }, { where: { id: player.characterId } })
            if (player.respawner) { clearTimeout(player.respawner) }
            mp.chat.aPush(player, ` You have revived yourself to !{#b1a1ff}100 HP!{white}.`);
            player.call('notifCreate', [`~r~You revived yourself to ~g~100HP`])
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['in'], (player, arg) => {
        if (arg != undefined || arg != null) return mp.chat.info(player, `Use /in`)
        if (player.isAdmin > 7) {
            player.call('interior:start');
        }
    }),
    mp.cmds.add(['ln'], (player, arg) => {
        if (arg != undefined || arg != null) return mp.chat.info(player, `Use /ln`)
        if (player.isAdmin > 7) {
            player.call('interior:start');
        }
    }),
    mp.cmds.add(['rr', 'reportrespond'], async (player, message) => {
        if (message == null) return mp.chat.info(player, `Use: /rr [message]`);
        const { admin_reports } = require('../models')
        admin_reports.findAll({}, {
            where: {
                [admin_reports.or]: [{ OwnerId: player.id }, { adminId: player.id }]
            }
        }).then((reportCheck) => {
            if (reportCheck.length == 0) {
                mp.chat.err(player, `You do not have an valid report open right now.`)
                return;
            }
            var target = mp.players.at(reportCheck[0].OwnerId)
            var admin = mp.players.at(reportCheck[0].adminId)
            if (reportCheck[0].adminId == player.id && target && player.isAdmin > 0) {
                mp.chat.report(player, `!{grey}[!{red}${player.adminSt}!{white}!{grey}] !{#ff4242}${player.adminName}!{white} !{grey}says:!{white} ${message}`);
                mp.chat.report(target, `!{grey}[!{red}${player.adminSt}!{white}!{grey}] !{#ff4242}${player.adminName}!{white} !{grey}says:!{white} ${message}`);
            }
            if (reportCheck[0].OwnerId == player.id && admin) {
                mp.chat.report(player, `${player.characterName} !{grey}says:!{white} ${message}`);
                mp.chat.report(admin, `Player [${player.id}] !{grey}says:!{white}  ${message}`);
            }
        })
    }),
    mp.cmds.add(['restartserver'], async (player, time) => {
        if (!time) return mp.chat.info(player, `Use: /restartserver [time(minutes)]`)
        if (player.isAdmin > 7) {
            if (time <= 0) return mp.chat.err(player, `Time value must be greater than 0`)

            mp.players.forEach((ps) => {
                if (ps.getVariable('loggedIn')) {
                    mp.chat.server(ps, `!{red}Server has began the restarting proccess and will restart in ${parseInt(time) == 1 ? parseInt(time) + ' minute' : parseInt(time) + ' minutes'}</b>`)
                }
            })

            setTimeout(() => {
                mp.players.forEach((ps) => {
                    mp.chat.server(ps, `!{red}Server restarting...`)
                })
                setTimeout(() => {
                    process.exit();
                }, 1000);
            }, time * 60000);

            setTimeout(() => {
                mp.players.forEach((ps) => {
                    if (ps.getVariable('loggedIn')) {
                        mp.chat.server(ps, `!{red}Server restarting in ${Math.trunc(time * 30)} seconds. Log off now to avoid roll back.`)
                    }
                })
            }, time * 30000);
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    })
mp.cmds.add(['sp', 'savepos'], async (player, name) => {
    if (!name) return mp.chat.info(player, `Use: /savepos [name]`)
    if (player.adminDuty || player.isAdmin > 7) {
        if (player.savedPositions && player.savedPositionNames) {
            player.savedPositionNames.push(name);
            player.savedPositions.push(JSON.stringify(player.position))
            mp.chat.aPush(player, `!{white}You !{#59ff99}saved!{white} your position.`);
            player.call('notifCreate', [`~r~Saved position as ${name}`])
        }
        else {
            player.savedPositions = []
            player.savedPositionNames = []
            player.savedPositionNames.push(name);
            player.savedPositions.push(JSON.stringify(player.position))
            mp.chat.aPush(player, `!{white}You !{#59ff99}saved!{white} your position.`);
            player.call('notifCreate', [`~r~Saved position as ${name}`])
        }
        return
    }
    mp.chat.err(player, `${CONFIG.noauth}`)
}),
    mp.cmds.add(['gotopos', 'gtp'], async (player, value) => {
        if (player.adminDuty || player.isAdmin > 7) {
            if (player.savedPositions && player.savedPositionNames && !value) {
                count = 0;
                player.savedPositionNames.forEach((name) => {
                    mp.chat.aPush(player, `!{#59ff99}${count}.!{white} ${name}`)
                    count++;
                })
                return
            }
            else if (player.savedPositions && player.savedPositionNames && player.savedPositions[value]) {
                player.position = new mp.Vector3(JSON.parse(player.savedPositions[value]))
                mp.chat.aPush(player, `Teleported to saved position ${player.savedPositionNames[value]}`)
                player.call('requestBrowser', [`gui.notify.showNotification("Teleported to saved position ${player.savedPositionNames[value]}", false, true, 7000, 'fa-solid fa-triangle-exclamation')`])
            }
            else if (!player.savedPositions) { mp.chat.err(player, `You do not have any saved positions`) }
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['gprops'], async (player, id) => {
        if (!id) return mp.chat.info(player, `Use: /gprops [id]`)
        if (player.isAdmin > 7) {
            var targ = mp.players.at(id)
            if (targ) {
                for (var variableKey in targ) {
                    if (targ.hasOwnProperty(variableKey)) {
                        mp.chat.aPush(player, `!{white}Prop: ${variableKey}`)
                    }
                }
            }
            else { mp.chat.err(player, `No player with this ID was found.`) }
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    })
mp.cmds.add(['closereport', 'cr'], async (player, arg) => {
    if (arg != null) return mp.chat.info(player, `Use: /closereport`)
    const { admin_reports } = require('../models')
    admin_reports.findAll({
    }).then((reportCheck) => {
        if (reportCheck.length > 0) {
            if (parseInt(reportCheck[0].OwnerId) == player.id) {
                if (reportCheck[0].accepted == 1 && player.createdReport == 1) {
                    targetP = mp.players.at(parseInt(reportCheck[0].adminId))
                    if (targetP) {
                        mp.chat.report(targetP, `Player [${player.id}] has closed the report.`);
                    }
                    const { admin_reports } = require('../models')
                    admin_reports.destroy({ where: { id: reportCheck[0].id } })
                    player.createdReport = 0;
                    targetP.handlingR = false;
                    return
                }
                else {
                    const { admin_reports } = require('../models')
                    admin_reports.destroy({ where: { OwnerId: player.id } })
                    mp.chat.report(player, `You have closed your report.`);
                    player.createdReport = 0;
                }
                return
            }
            if (parseInt(reportCheck[0].adminId) == player.id && player.isAdmin > 0) {
                if (reportCheck[0].accepted == 1) {
                    targetA = mp.players.at(parseInt(reportCheck[0].OwnerId));
                    if (targetA) {
                        mp.chat.report(targetA, `Your report has been !{orange}closed!{white} by !{orange}${player.adminName}`);
                    }
                    const { admin_reports } = require('../models')
                    admin_reports.destroy({ where: { adminId: player.id } })
                    targetA.createdReport = 0;
                    targetP.handlingR = false;
                    return
                }
                else {
                    targetP.handlingR = false;
                    const { admin_reports } = require('../models')
                    admin_reports.destroy({ where: { adminId: player.id } })
                    mp.chat.report(player, `You have closed the report.`);
                }
            }
        }
    })
}),
    mp.cmds.add(['releasereport', 'release'], async (player, id) => {
        if (id == null) return mp.chat.info(player, `Use: /releasereport [id]`)
        if (!ps.isAdmin > 0) return;
        const { admin_reports } = require('../models')
        admin_reports.findAll({}).then((rrCheck) => {
            if (rrCheck.length == 0) return;
            if (parseInt(rrCheck[0].adminId) == player.id) {
                const { admin_reports } = require('../models')
                admin_reports.update({
                    adminId: null,
                    accepted: 0,
                }, { where: { adminId: player.id } })
                mp.players.forEach((ps) => {
                    if (ps.isAdmin > 0 && ps.getVariable('toggledAdmin') === false && ps.id != rrCheck[0].OwnerId) { mp.chat.report(player, ` Report with ID ${parseInt(rrCheck[0].id)} has been !{#b1a1ff}released!{white}.`) }
                })
                var targetP = mp.players.at(parseInt(rrCheck[0].OwnerId));
                if (targetP) {
                    mp.chat.report(targetP, `Your report has been released for further support. Please be paitent whilst another staff member accepts it.`)
                }
                else {
                    const { admin_reports } = require('../models')
                    admin_reports.destroy({ where: { id: parseInt(rrCheck[0].id) } })
                }
            }
            else {
                mp.chat.err(player, `You are not the owner of this report`)
            }
        })
    }),
    mp.cmds.add(['ban'], async (player, fullText, target, minutes, ...reason) => {
        if (target == undefined || minutes == undefined || reason == undefined || reason.length == 0) return mp.chat.info(player, `Use: /ban [Name/ID] [minutes(-1 perm)] [reason]`);
        if (player.isAdmin > 2 && player.adminDuty || player.isAdmin > 7) {
            function getUnixTimestamp() {
                return Math.round(Date.now() / 1000);
            }
            function formatUnixTimestamp(unixTimestamp) {
                let date = new Date(unixTimestamp * 1000);
                let hours = date.getHours();
                let minutes = date.getMinutes();
                let seconds = date.getSeconds();
                return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            }
            var fullReason = reason.join(' ')
            var targetPlayer = mp.core.idOrName(player, target);
            if (!targetPlayer) return mp.chat.err(player, `Player wasn't found`);
            var times = getUnixTimestamp() + (minutes * 60);
            if (minutes == Number(-1)) {
                times = -1;
            }
            db.server_bans.create({
                IP: targetPlayer.ip,
                HWID: targetPlayer.serial,
                uuid: targetPlayer.uuid == undefined ? 'Not Known' : targetPlayer.uuid,
                socialClub: targetPlayer.socialClub,
                socialID: targetPlayer.rgscId,
                username: targetPlayer.name,
                Reason: fullReason,
                admin: player.adminName,
                issueDate: new Date().toJSON().slice(0, 10),
                LiftTimestamp: times
            })
            targetPlayer.call('requestBrowser', [`gui.notify.clearAll()`])
            db.Accounts.update({
                banStatus: 1,
            }, { where: { id: targetPlayer.sqlID } }).then(() => {
                mp.log(`${CONFIG.consoleRed}[ADMIN]${CONFIG.consoleWhite} Admin ${player.adminName} has banned ${targetPlayer.characterName} for ${fullReason} time ${times}`)
                mp.core.addAdminPunishment(targetPlayer, player, `BAN`, fullReason, times);
                if (times == -1) {
                    mp.players.forEach((ps) => {
                        if (ps.getVariable('loggedIn')) {
                            mp.chat.aPush(ps, `!{white}Player ${targetPlayer.characterName} [${targetPlayer.id}] was !{#ff4242}banned!{white} by !{#ff4242}${player.adminName}!{white} | Reason: !{orange}${fullReason}!{white} | Time: !{#ff4242}permanent!{white}.`)
                        }
                    })
                    if (targetPlayer.getVariable('injured') == true) {
                        mp.events.call('slayPlayer', targetPlayer)
                    }
                    targetPlayer.setVariable('loggedIn', false)
                    targetPlayer.setVariable('banned', true)
                    const date = new Date();
                    let currentDate = date.toJSON();
                    targetPlayer.call('client:loginHandler', ['banned'])
                    targetPlayer.call('requestRoute', ['ban', true, true]);
                    targetPlayer.call('requestBrowser', [`appSys.commit('setBanInfo', {
                        username: '${targetPlayer.name}',
                        IP: '${targetPlayer.ip}',
                        socialClub: '${targetPlayer.socialClub}',
                        reason: '${fullReason}',
                        admin: '${player.adminName}',
                        issueDate: '${currentDate.slice(0, 10)}',
                        liftTime: 'Ban is permanent'
                    });`])
                    targetPlayer.setVariable('loggedIn', false)
                    targetPlayer.dimension = 20;
                    mp.core.sendEmail(targetPlayer, targetPlayer.emailAddress, 'Paramount RP | Account Ban', `<h2>Hello ${targetPlayer.name},</h2><p> Your account has been banned by ${player.adminName} for ${fullReason} [<font color="red"> Ban is permanent </font>]. To counteract this ban you are entitled to appeal this ban a week after its issue date.<p>`);
                    return
                } else {
                    mp.players.forEach((ps) => {
                        if (ps.getVariable('loggedIn')) {
                            mp.chat.aPush(ps, `!{white}Player ${targetPlayer.characterName} [${targetPlayer.id}] was !{#ff4242}banned!{white} by !{#ff4242}${player.adminName}!{white} | Reason: !{orange}${fullReason}!{white} | Time: !{#78cc78}${formatUnixTimestamp(times)}!{white}.`)
                        }
                    })
                    if (targetPlayer.getVariable('injured') == true) {
                        mp.events.call('slayPlayer', targetPlayer)
                    }
                    targetPlayer.setVariable('banned', true)
                    targetPlayer.setVariable('loggedIn', false)
                    const date = new Date();
                    let currentDate = date.toJSON();
                    targetPlayer.call('client:loginHandler', ['banned'])
                    targetPlayer.call('requestRoute', ['ban', true, true]);
                    targetPlayer.call('requestBrowser', [`appSys.commit('setBanInfo', {
                        username: '${targetPlayer.name}',
                        IP: '${targetPlayer.ip}',
                        socialClub: '${targetPlayer.socialClub}',
                        reason: '${fullReason}',
                        admin: '${player.adminName}',
                        issueDate: '${currentDate.slice(0, 10)}',
                        liftTime: '${formatUnixTimestamp(times)}'
                    });`])

                    targetPlayer.setVariable('loggedIn', false)
                    targetPlayer.dimension = 20;
                    mp.core.sendEmail(targetPlayer, targetPlayer.emailAddress, 'Paramount RP | Account Ban', `<h2>Hello ${targetPlayer.name},</h2><p> Your account has been banned by ${player.adminName} for ${fullReason} [<font color="green"> Expires: ${formatUnixTimestamp(times)} </font>]. To counteract this ban you are entitled to appeal this ban a week after its issue date.<p>`);
                    return
                }
            }).catch((err) => { mp.log(err) })
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`);
    }),
    mp.cmds.add(['removeban'], async (player, username) => {
        if (!username) return mp.chat.info(player, `Use: /removeban [username]`)
        if (player.adminDuty || player.isAdmin > 7) {
            const { Accounts } = require('../models')
            Accounts.findAll({ where: { username: username } }).then((acc) => {
                if (acc.banStatus == 0) return;
                if (acc.length > 0) {
                    const { server_bans } = require('../models')
                    server_bans.destroy({ where: { username: username } })
                    Accounts.update({
                        banStatus: 0
                    }, { where: { username: username } }).then((user) => { mp.chat.aPush(player, `Ban for account with username ${username} SQLID: ${JSON.parse(JSON.stringify(user)).id} was removed.`) }).catch((err) => { mp.log(err) })
                }
            })
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    })
mp.cmds.add(['aduty', 'ad'], async (player, arg) => {
    if (arg != undefined || arg != null) return mp.chat.info(player, `Use: /aduty`)
    if (player.isAdmin > 2) {
        if (player.getVariable('adminJailed') == true && !player.isAdmin > 7) return mp.chat.err(player, `You cannot use this command whilst in admin jail.`);
        if (player.adminDuty == false) {
            mp.events.call('adutyStart', player);
        }
        else {
            mp.events.call('adutyStop', player);
        }
        return
    }
    mp.chat.err(player, `${CONFIG.noauth}`)
}),
    mp.cmds.add(['return', 'back', 'gotob'], (player, arg) => {
        if (arg != undefined || arg != null) return mp.chat.info(player, `Use: /return`)
        if (player.adminDuty || player.isAdmin > 7) {
            let lastAdutyPos = player.getVariable('adutyPos');
            if (lastAdutyPos == null || lastAdutyPos == undefined) return;
            player.position = new mp.Vector3(JSON.parse(lastAdutyPos))
            if (player.adutyDim) { player.dimension = player.adutyDim }
            player.call('notifCreate', [`~r~Teleported successfully`])
            return;
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['ann'], (player, message) => {
        if (message == null) return mp.chat.info(player, `Use: /ann [message]`)
        if (player.isAdmin > 3 && player.adminDuty || player.isAdmin > 7) {
            mp.players.forEach((ps) => {
                if (ps.getVariable('loggedIn')) {
                    ps.outputChatBox(`!{#ff4242}[Announcement] !{#b1a1ff}[!{white}${player.adminSt}!{#b1a1ff}]:!{white} ${message}`)
                }
            })
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['aclothing'], async (player, arg) => {
        if (arg != null) return mp.chat.info(player, `Use: /aclothing`)
        if (player.isAdmin > 7) {
            player.call('requestRoute', ['clothing'])
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    })
mp.cmds.add(['acreation'], async (player, arg) => {
    if (arg != null) return mp.chat.info(player, `Use: /acreation`)
    if (player.isAdmin > 7) {
        player.call('requestRoute', ['creation'])
        return
    }
    mp.chat.err(player, `${CONFIG.noauth}`)
})
mp.cmds.add(['addclothes'], async (player, name) => {
    if (!name) return mp.chat.info(player, `Use: /addclothes [name]`)
    if (player.isAdmin > 7) {
        const { clothing_stores } = require('../models')
        clothing_stores.create({
            OwnerId: 0,
            clothingName: name,
            moneyAmount: 230000,
            items: '{}',
            lastRobbery: 0,
            position: JSON.stringify(player.position)
        }).then((shop) => {
            mp.chat.aPush(player, `Added new clothing store with ID: ${JSON.parse(JSON.stringify(shop)).id} NAME: ${name} to database.`)
        })
        return
    }
    mp.chat.err(player, `${CONFIG.noauth}`)
})
mp.cmds.add(['rmc'], (player, arg) => {
    if (arg != undefined || arg != null) return mp.chat.info(player, `Use: /rmc`)
    if (player.isAdmin > 7) {
        player.model = mp.joaat(["mp_m_freemode_01"]);
        mp.chat.aPush(player, ` Triggered default MP Ped`)
        return
    }
    mp.chat.err(player, `${CONFIG.noauth}`)
}),
    mp.cmds.add(['setw'], async (player, weather) => {
        if (weather == null) return mp.chat.info(player, `Use: /setw [weather]`)
        if (player.isAdmin > 7) {
            mp.world.weather = weather;
            mp.chat.aPush(player, ` Set server weather to !{yellow}${weather}`)
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['flip'], async (player, id) => {
        if (player.adminDuty || player.isAdmin > 6) {
            if (id == null) {
                if (player.vehicle && player.vehicle.getVariable('sqlID')) {
                    id = player.vehicle.getVariable('sqlID')
                }
                else if (!player.vehicle) {
                    return mp.chat.info(player, `Use: /flip [Current Vehicle / SQLID]`)
                }
            }
            mp.vehicles.forEach(async (veh) => {
                if (veh.getVariable('sqlID') == id) {
                    veh.rotation = new mp.Vector3(0, 0, 0);
                    const vehicleName = await player.callProc('proc::vehicleName', [veh.model]);
                    mp.chat.aPush(player, ` Flipped vehicle ${vehicleName} !{#919191}${veh.numberPlate}`)
                }
            })
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['veh', 'car'], async (player, fullText, vehicle, colourOne = 111, colourTwo = 111) => {
        if (vehicle == null) return mp.chat.info(player, `Use: /veh [model] [colourOne(default=111)] [colourTwo(default=111)]`);
        if (player.isAdmin > 7 || player.adminSt == 'Head Administrator' && player.adminDuty) {

            var veh = mp.vehicles.new(mp.joaat(vehicle), player.position, {
                dimension: player.dimension,
                numberPlate: `null`
            });

            veh.locked = true;
            player.putIntoVehicle(veh, 0);

            const vehicleName = await player.callProc('proc::vehicleName', [veh.model]);

            db.vehicles.create({
                vid: 20,
                uuvid: 20,
                vehicleModel: vehicle,
                vehicleModelName: vehicleName == null ? 'Vehicle' : vehicleName,
                position: JSON.stringify(veh.position),
                OwnerId: player.characterId,
                numberPlate: "null",
                tyreStatus: '[]',
                locked: 1,
                dirtLevel: 0,
                data: `{"fuelLevel": 100, "Health": 100, "DistanceKm": 0}`,
                parked: 0,
                parkedArea: 0,
                insurance: 0,
                spawned: 1,
                lastActive: mp.core.getUnixTimestamp(),
                heading: veh.position.z
            }).then((car) => {
                veh.setVariable('sqlID', car.id);
                veh.setVariable('vehData', `{"fuelLevel": 100, "Health": 100, "DistanceKm": 0}`);
                var numPlate = `${mp.core.generateString(2).toUpperCase()}${car.id}`;
                veh.numberPlate = numPlate;
                mp.events.call('vehicle:setMods', player, veh);
                veh.setColor(parseInt(colourOne), parseInt(colourTwo));
                db.vehicles.update({
                    numberPlate: numPlate
                }, { where: { id: car.id } }).then(() => { mp.log(`${CONFIG.consoleRed}[ADMIN]${CONFIG.consoleWhite} ${player.adminName} spawned in a ${vehicle} SQLID: ${veh.getVariable('sqlID')}`), mp.chat.aPush(player, `You spawned in a ${vehicleName} with SQLID: ${car.id}`) })
            })
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`);
    }),
    mp.cmds.add(['vhealth'], (player, set) => {
        if (!set || !player.vehicle || !(set >= 0 && set <= 1000)) return mp.chat.info(player, `Use: /vhealth [health(0-1000)]`);
        if ((player.isAdmin > 7 || player.adminDuty && player.isAdmin > 4) && player.vehicle.getVariable('sqlID')) {
            var currentData = JSON.parse(player.vehicle.getVariable('vehData'));
            currentData.Health = set;
            db.vehicles.update({ data: JSON.stringify(currentData) }, { where: { id: player.vehicle.getVariable('sqlID') } });
            player.vehicle.setVariable('vehDamage', set);
            mp.chat.aPush(player, `You set health of vehicle with SQLID: ${player.vehicle.getVariable('sqlID')} [${player.vehicle.numberPlate}] to ${set}%`);
            return;
        }
        mp.chat.err(player, `${CONFIG.noauth}`);
    })
mp.cmds.add(['freeze'], (player, id) => {
    if (id == null) return mp.chat.info(player, `Use: /freeze [Name/ID]`)
    if (player.adminDuty || player.isAdmin > 7) {
        var targetPlayer = mp.core.idOrName(player, id)
        if (targetPlayer) {
            targetPlayer.call('freezePlayer');
            mp.chat.aPush(targetPlayer, `You were frozen by !{orange}${player.adminName}`);
            mp.chat.aPush(player, `You have frozen !{#b1a1ff}${targetPlayer.characterName}`);
            targetPlayer.call('notifCreate', [`~r~You were frozen by ~p~${player.adminName}`])
            player.call('notifCreate', [`~r~You froze ~p~${targetPlayer.characterName}`])
        }
        else { mp.chat.err(player, `No player could be found.`) }
        return
    }
    mp.chat.err(player, `${CONFIG.noauth}`)
}),
    mp.cmds.add(['unfreeze'], (player, id) => {
        if (id == null) return mp.chat.info(player, `Use: /unfreeze [Name/ID]`);
        if (player.adminDuty || player.isAdmin > 7) {
            var targetP = mp.core.idOrName(player, id)
            if (targetP) {
                targetP.call('unfreezePlayer');
                mp.chat.aPush(targetP, `You were unfrozen by !{orange}${player.adminName}`);
                targetP.call('notifCreate', [`~r~You were unfrozen by ~p~${player.adminName}`])
                player.call('notifCreate', [`~r~You unfroze ~p~${targetP.characterName}`])
                mp.chat.aPush(player, `You have unfrozen !{#b1a1ff}${targetP.characterName}`)
            }
            else { mp.chat.err(player, `No player could be found.`) }
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['bring', 'teleport'], (player, id) => {
        if (id == null) return mp.chat.info(player, `Use: /bring [Name/ID]`)
        if (player.adminDuty || player.isAdmin > 7) {
            var targetP = mp.core.idOrName(player, id)
            if (targetP) {
                targetP.lastApos = targetP.position;
                if (targetP.vehicle) {
                    targetP.vehicle.position = player.position;
                }
                targetP.position = player.position;
                targetP.dimension = player.dimension;
                mp.chat.aPush(targetP, ` You have been teleported by !{orange}${player.adminName}!{white}`)
                targetP.call('notifCreate', [`~r~You were teleported by ~p~${player.adminName}`])
                player.call('notifCreate', [`~r~You teleported ~p~${targetP.characterName}`])
                mp.chat.aPush(player, ` Teleported ${targetP.characterName} (${targetP.id}) to you.`)
            }
            else { mp.chat.err(player, `No player was found.`) }
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['putback', 'pb'], async (player, id) => {
        if (!id) return mp.chat.info(player, `Use: /putback [Name/ID]`)
        if (player.adminDuty || player.isAdmin > 7) {
            var targetP = mp.core.idOrName(player, id)
            if (targetP) {
                if (targetP.lastApos) {
                    targetP.position = targetP.lastApos;
                    targetP.lastApos = null;
                    mp.chat.aPush(targetP, `You were teleported back by !{orange}${player.adminName}!{white}`)
                    mp.chat.aPush(player, `You teleported back !{orange}${targetP.characterName}!{white}`)
                    targetP.call('notifCreate', [`~r~You were teleported back by ~p~${player.adminName}`])
                    player.call('notifCreate', [`~r~You teleported ~p~${targetP.characterName}~r~ back`])
                    return
                }
                else { mp.chat.err(player, `Player has not been teleported recently`) }
                return
            }
            else { mp.chat.err(player, `No player was found.`) }
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    })
mp.cmds.add(['goto', 'tpto'], (player, id) => {
    if (id == null) return mp.chat.info(player, `Use: /goto [Name/ID]`)
    if (player.adminDuty || player.isAdmin > 7) {
        var targetP = mp.core.idOrName(player, id)
        if (targetP) {
            if (player.vehicle) {
                player.vehicle.position = targetP.position
            }
            player.dimension = targetP.dimension;
            player.position = targetP.position;
            player.call('notifCreate', [`~r~You teleported to ~p~${targetP.characterName}`])
            mp.chat.aPush(player, ` Teleported  to !{#b1a1ff}${targetP.characterName} (${targetP.id})!{white}`)
        }
        else { mp.chat.err(player, `No player was found.`) }
        return
    }
    mp.chat.err(player, `${CONFIG.noauth}`)
}),
    mp.cmds.add(['tre'], (player, event) => {
        if (event == null) return mp.chat.info(player, `Use: /tre [eventName]`);
        if (player.isAdmin > 7) {
            player.call(event);
            mp.events.call(event);
            mp.chat.aPush(player, ` Successfully triggered event ${event}`);
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`);
    }),
    mp.cmds.add(['apark'], async (player, id) => {
        if (player.isAdmin > 1 && player.adminDuty || player.isAdmin > 7) {
            if (id == null) {
                if (player.vehicle && player.vehicle.getVariable('sqlID')) {
                    id = player.vehicle.getVariable('sqlID')
                }
                else if (!player.vehicle) {
                    return mp.chat.info(player, `Use: /apark [Current Vehicle / SQLID]`)
                }
            }
            const { vehicles } = require('../models')
            vehicles.findAll({ where: { id: id } }).then(async (ve) => {
                if (ve.length == 0) {
                    mp.chat.err(player, `No vehicle with that SQLID was found.`)
                }
                if (ve.length > 0) {
                    if (ve[0].spawned == 1) {
                        mp.vehicles.forEach(async (veh) => {
                            if (veh.getVariable('sqlID') && veh.getVariable('sqlID') == ve[0].id) {
                                const { vehicles } = require('../models')
                                vehicles.update({
                                    insurance: 0,
                                    parked: 1,
                                    parkedArea: 1,
                                    spawned: 0,
                                    position: `{"x":223.72373962402344,"y":-798.9999389648438,"z":30.42055320739746}`,
                                }, { where: { id: veh.getVariable('sqlID') } })
                                mp.chat.aPush(player, `You have sent !{#ff4242} SQLID!{orange} ${id}!{#ff4242} to parking.`);
                                veh.destroy();
                                return;
                            }
                        })
                    }
                    else if (ve[0].spawned != 1) {
                        vehicles.update({
                            spawned: 0,
                            insurance: 0,
                            parked: 1,
                            position: `{"x":223.72373962402344,"y":-798.9999389648438,"z":30.42055320739746}`,
                        }, { where: { id: id } }).then(() => {
                            mp.chat.aPush(player, `You have sent !{#ff4242} SQLID!{orange} ${id}!{#ff4242} to parking. (Vehicle was not spawned)`);
                        })
                    }
                }
            })
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['setped'], async (player, model) => {
        if (!model) return mp.chat.info(player, `Use: /setped [model]`);
        if (player.isAdmin > 7) {
            player.model = mp.joaat([model]);
        }
        else {
            mp.chat.err(player, CONFIG.noauth)
        }
    })
mp.cmds.add(['svti', 'sendtoinsurance'], async (player, id) => {
    if (player.adminDuty || player.isAdmin > 7) {
        if (id == null) {
            if (player.vehicle && player.vehicle.getVariable('sqlID')) {
                id = player.vehicle.getVariable('sqlID')
            }
            else if (!player.vehicle) {
                return mp.chat.info(player, `Use: /sendtoinsurance [Current Vehicle / SQLID]`)
            }
        }
        const { vehicles } = require('../models')
        vehicles.findAll({ where: { id: id } }).then(async (ve) => {
            if (ve.length == 0) {
                mp.chat.err(player, `No vehicle with that SQLID was found.`)
            }
            if (ve.length > 0) {
                if (ve[0].spawned == 1) {
                    mp.vehicles.forEach(async (veh) => {
                        if (veh.getVariable('sqlID') && veh.getVariable('sqlID') == ve[0].id) {
                            const { vehicles } = require('../models')
                            vehicles.update({
                                insurance: 1,
                                parked: 0,
                                position: `{"x":-857.5166625976562,"y":-258.8004455566406,"z":39.189544677734375}`,
                                spawned: 0
                            }, { where: { id: veh.getVariable('sqlID') } })
                            mp.chat.aPush(player, `You have sent !{#ff4242} SQLID!{orange} ${veh.getVariable('sqlID')}!{#ff4242} to insurance.`);
                            veh.destroy();
                            return;
                        }
                    })
                } else if (ve[0].spawned != 1) {
                    vehicles.update({
                        spawned: 0,
                        insurance: 1,
                        parked: 0,
                        position: `{"x":-857.5166625976562,"y":-258.8004455566406,"z":39.189544677734375}`,
                    }, { where: { id: id } }).then(() => {
                        mp.chat.aPush(player, `You have sent !{#ff4242} SQLID!{orange} ${id}!{#ff4242} to parking. (Vehicle was not spawned)`);
                    })
                }
            }
        })
        return
    }
    mp.chat.err(player, `${CONFIG.noauth}`)
}),
    mp.cmds.add(['setvowner'], async (player, fullText, id, ...vehId) => {
        if (!vehId || !id) return mp.chat.info(player, `Use: /setvowner [Name/ID] [SQLID]`)
        if (player.adminDuty && player.isAdmin > 6 || player.isAdmin > 7) {
            var targetP = mp.core.idOrName(player, id)
            if (targetP) {
                const { vehicles } = require('../models')
                vehicles.findAll({ where: { id: vehId } }).then((veh) => {
                    if (veh.length > 0) {
                        vehicles.update({
                            OwnerId: targetP.characterId
                        }, { where: { id: vehId } }).then(() => {
                            mp.chat.aPush(player, `!{white}You transferred ownership of vehicle with !{#4bfa7a}SQLID ${vehId}!{white} to Player!{#ff2626} ${targetP.characterName} [${targetP.id}]`)
                            mp.chat.aPush(targetP, `!{white}Vehicle with !{#4bfa7a}SQLID ${vehId}!{white} was tranferred to you from admin !{#ff2626}${player.adminName}`)
                        }).catch((err) => { mp.log(err) })
                    }
                    else { return mp.chat.err(player, `No vehicle was found with that ID.`) }
                })
                return
            }
            else { mp.chat.err(player, `No player was found.`) }
            return;
        }
        mp.chat.err(player, `${CONFIG.noauth}`);
    })
mp.cmds.add(['fly'], (player, arg) => {
    if (arg != null) return mp.chat.info(player, `Use: /fly`)
    if (player.isAdmin > 2 && player.adminDuty || player.isAdmin > 7) {
        if (!player.fly) {
            mp.events.call('flyStart', player)
        }
        else {
            mp.events.call('flyStop', player)
        }
        return
    }
    mp.chat.err(player, `${CONFIG.noauth}`)
})
mp.cmds.add(['aunstall'], async (player, arg) => {
    if (arg != null) return mp.chat.info(player, `Use: /aunstall`)
    if (player.adminDuty || player.isAdmin > 7) {
        if (player.vehicle) {
            player.vehicle.setVariable('isStalled', null)
        }
        else if (!player.vehicle) {
            return mp.chat.err(player, `You are not in a vehicle.`)
        }
        return
    }
    mp.chat.err(player, `${CONFIG.noauth}`)
})
mp.cmds.add(['checkn'], async (player, name) => {
    if (!name || !name[1]) return mp.chat.info(player, `Use: /checn [Full Character Name] (Fname Lname)`)
    if (player.isAdmin > 7) {
        for (var i = 0; i < name.length; i++) {
            if (name[i] === ' ') {
                const { characters } = require('../models')
                characters.findAll({ where: { cName: name } }).then((char) => {
                    if (char.length > 0) { mp.chat.aPush(player, `Name ${name} is currently taken by player with SQLID: ${char[0].id}`) }
                    else if (char.length == 0) { mp.chat.aPush(player, `No character with this name has been registered.`) }
                })
            }
            else if (!name[i] === ' ') { mp.chat.err(player, `Please use valid character name formatting for example: Alex Dover`) }
        }
        return
    }
    mp.chat.err(player, `${CONFIG.noauth}`)
}),
    mp.cmds.add(['a', 'adminchat'], (player, message) => {
        if (message == null) return mp.chat.info(player, `Use: /adminchat [message]`)
        if (player.isAdmin > 0) {
            if (player.getVariable('toggledAdmin') === true) return mp.chat.err(player, ` You have toggled admin messages !{orange}off!{white}.`)
            mp.players.forEach((ps) => {
                if (ps.isAdmin > 0 && ps.getVariable('toggledAdmin') === false) {
                    var msg = message.replace(/(?=!{).:*("DROP?<=})/g, "");
                    ps.outputChatBox(`!{#b1a1ff}[!{${player.adminColour}}${player.adminSt}!{#b1a1ff}]!{white} ${player.adminName} !{#b1a1ff}says:!{white} ${msg}!{white}`)
                    return
                }
            });
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['ha', 'headadmin'], (player, message) => {
        if (message == null) return mp.chat.info(player, `Use: /headadmin [message]`)
        if (player.isAdmin > 7 || player.adminSt == 'Head Administrator') {
            if (player.getVariable('toggledAdmin') === true) return mp.chat.err(player, ` You have toggled admin messages !{orange}off!{white}.`)
            mp.players.forEach((ps) => {
                if (ps.isAdmin > 6 && ps.getVariable('toggledAdmin') === false) {
                    mp.chat.staffMsg(ps, `!{#ff4242}[HA+] !{#b1a1ff}[!{${player.adminColour}}${player.adminSt}!{#b1a1ff}]!{white} ${player.adminName} !{#b1a1ff}says:!{white} ${message}`)
                    return
                }
            });
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['dv'], async (player, id) => {
        if (player.isAdmin > 7) {
            if (id == null) {
                if (player.vehicle && player.vehicle.getVariable('sqlID')) {
                    id = player.vehicle.getVariable('sqlID')
                }
                else if (!player.vehicle) {
                    return mp.chat.info(player, `Use: /dv [Current Vehicle / SQLID]`);
                }
            }
            mp.vehicles.forEach((veh) => {
                if (veh.getVariable('sqlID') == parseInt(id)) {
                    const { vehicles } = require('../models')
                    vehicles.destroy({ where: { id: parseInt(veh.getVariable('sqlID')) } }).then(() => {
                        mp.chat.aPush(player, `You have deleted vehicle with SQLID: ${veh.getVariable('sqlID')}.`)
                        veh.destroy()
                    })
                }
            })
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`);
    }),
    mp.cmds.add(['fix'], async (player, id) => {
        if (player.adminDuty || player.isAdmin > 7) {
            if (id == null) {
                if (player.vehicle && player.vehicle.getVariable('sqlID')) {
                    id = player.vehicle.getVariable('sqlID')
                }
                else if (!player.vehicle) {
                    return mp.chat.info(player, `Use: /fix [Current Vehicle / SQLID]`);
                }
            }
            mp.vehicles.forEach(async (veh) => {
                if (veh.getVariable('sqlID') == id && veh.getVariable('vehData') && veh.getVariable('currentTyres')) {
                    veh.repair();
                    veh.setVariable('vehDamage', 1000);
                    var currentData = JSON.parse(veh.getVariable('vehData'));
                    currentData.health = 1000;
                    var currentTyres = veh.getVariable('currentTyres');
                    currentTyres = JSON.parse(currentTyres);
                    for (var x = 0; x < currentTyres.length; x++) {
                        currentTyres[x] = false;
                    }
                    db.vehicles.update({ data: JSON.stringify(currentData), tyreStatus: JSON.stringify(currentTyres) }, { where: { id: veh.getVariable('sqlID') } })
                    const vehicleName = await player.callProc('proc::vehicleName', [veh.model]);
                    mp.chat.aPush(player, ` repaired vehicle ${vehicleName} !{#919191}${veh.numberPlate}!`);
                    veh.setVariable('vehData', JSON.stringify(currentData));
                    veh.setVariable('currentTyres', JSON.stringify(currentTyres));
                    return;
                }
            })
            return;
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['spw'], async (player, fullText, weapon, ammo) => {
        if (weapon == null) return mp.chat.info(player, `Use: /spw [weaponHash] [ammo]`);
        if (player.isAdmin > 7) {
            let weaponHash = mp.joaat('weapon_' + weapon);
            player.giveWeapon(weaponHash, parseInt(ammo) || 10000);
            if (ammo == null) ammo = 10000
            mp.chat.aPush(player, ` You have given yourself a !{yellow}${weapon}!{#ff4242} with !{#ff4242}!{yellow}${ammo}!{#ff4242} ammunition!`);
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['getpos'], (player, arg) => {
        if (arg != undefined || arg != null) return mp.chat.info(player, `Use: /getpos`)
        if (player.isAdmin > 2) {
            mp.chat.aPush(player, ` Player position !{orange}${player.position}`)
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['sethp'], (player, fullText, id, ...hp) => {
        if (id == null || hp == null || isNaN(hp)) return mp.chat.info(player, `Use: /sethp [Name/ID] [hp]`)
        if (player.adminDuty || player.isAdmin > 7) {
            var targetP = mp.core.idOrName(player, id)
            if (targetP) {
                targetP.health = parseInt(hp);
                targetP.call('notifCreate', [`~r~Your HP was set to ~g~${hp}~r~ by ~p~${player.adminName}`])
                player.call('notifCreate', [`~r~You set ~g~${targetP.characterName}'s~r~ HP to ~p~${parseInt(hp)}`])
                mp.chat.aPush(targetP, ` Your health has been set to !{#b1a1ff}${hp}!{#ff4242} by !{orange}${player.adminName}`);
                mp.chat.aPush(player, ` You have set player ${targetP.characterName}'s health to !{#b1a1ff}${hp}`);
            }
            else { mp.chat.err(player, `No player was found.`) }
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['spectate', 'spec'], (player, target) => {
        if (!target) return mp.chat.info(player, `Use: /spectate [Name/ID/off]`);
        if (player.adminDuty || player.isAdmin > 7) {
            if (target.toLowerCase() == 'off' && player.getVariable('specPos')) {
                player.call('StopSpectatingTarget::Client');
                mp.chat.aPush(player, `Stopped spectating`);
                player.alpha = 255;
                if (player.getVariable('specPos')) { player.position = new mp.Vector3(JSON.parse(player.getVariable('specPos'))), player.setVariable('specPos', null) }
                return
            }
            var targetPlayer = mp.core.idOrName(player, target)
            if (!player.getVariable('adminFly')) { mp.events.call('flyStart', player) }
            if (targetPlayer == player) return mp.chat.err(player, `You cannot spectate yourself.`);
            if (targetPlayer) {
                player.setVariable('specPos', [JSON.stringify(player.position)]);
                player.alpha = 0;
                player.position = targetPlayer.position;
                setTimeout(async () => {
                    if (player && targetPlayer) {
                        player.call('StartSpectatingTarget::Client', [targetPlayer]);
                        mp.chat.aPush(player, `Now spectating Player ${targetPlayer.characterName} [${targetPlayer.id}]. Use /spec off to cancel`);
                    }
                }, 2000);
            }
            else {
                mp.chat.err(player, `No player was found.`);
            }
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['setmod'], (player, modOne, modTwo) => {
        if (!(modOne || modTwo)) return;
        if (player.isAdmin > 7 && player.vehicle) {
            player.vehicle.setMod(parseInt(modOne), parseInt(modTwo))
            mp.chat.aPush(player, 'Mods: ' + modOne, modTwo)
        }
    })
mp.cmds.add(['setarmour'], (player, fullText, id, ...amount) => {
    if (!id || !amount || amount.length == 0) return mp.chat.info(player, `Use: /setarmour [Name/ID] [amount]`);
    if (player.adminDuty && player.adminSt == 'Head Administrator' || player.isAdmin > 7) {
        var target = mp.core.idOrName(player, id)
        if (target) {
            target.armour = parseInt(amount);
            mp.chat.aPush(target, `Your armour level was set to ${parseInt(amount)} by ${player.adminName}`);
            mp.chat.aPush(player, `You set ${target.characterName}'s armour level to ${parseInt(amount)}`);
            target.call('notifCreate', [`~r~Your armour level was set to ${parseInt(amount)} by ~p~${player.adminName}`])
            player.call('notifCreate', [`~r~You set player ~g~${target.characterName}'s~r~ armour level to ~p~${parseInt(amount)}`])
        }
        else {
            mp.chat.err(player, `No player was found.`);
        }
        return
    }
    mp.chat.err(player, `${CONFIG.noauth}`)
}),
    mp.cmds.add(['acarry'], (player, target) => {
        if (!target) return mp.chat.info(player, `Use: /acarry [Name/ID/off]`)
        if (player.isAdmin > 4 && player.adminDuty || player.isAdmin > 7) {
            var targetP = mp.core.idOrName(player, target)
            if (targetP && targetP != player) {
                player.setVariable('carryInfo', targetP)
                player.call('notifCreate', [`~w~Now carrying ${targetP.characterName} use ~y~'X'~w~ to cancel`])
                return
            }
            else { mp.chat.err(player, `No player was found.`) }
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['warn'], async (player, fullText, id, ...message) => {
        if (!id || !message || message.length == 0) return mp.chat.info(player, `Use: /warn [Name/ID] [message]`);
        if (player.adminDuty || player.isAdmin > 7) {
            var targetPlayer = mp.core.idOrName(player, id);
            if (targetPlayer) {
                mp.chat.aPush(player, `You warned ${targetPlayer.characterName} with reason ${message.join(' ')}`), mp.chat.aPush(player, `You were warned by ${player.adminName} with reason ${message.join(' ')}`);
                mp.core.addAdminPunishment(player, targetPlayer, 'WARN', `${message.join(' ')}`, 0);
                return;
            } else {
                mp.chat.err(player, `No player was found.`)
            }
        }
    })
mp.cmds.add(['revive', 'rev'], (player, id) => {
    if (!id) return mp.chat.info(player, `Use: /revive [Name/ID]`);
    if (player.adminDuty || player.isAdmin > 7) {
        var target = mp.core.idOrName(player, id)
        if (target) {
            target.setVariable('injured', false);
            target.stopAnimation();
            target.call('unfreezePlayer');
            target.call('endDeath');
            target.health = 100;
            const { characters } = require("../models");
            characters.update({
                isInjured: 0,
                injuredTime: 0,
            }, { where: { id: target.characterId } })
            target.call('notifCreate', [`~r~You were revived by ~p~${player.adminName}`])
            player.call('notifCreate', [`~r~You revived ~p~${target.characterName}`])
            if (target.respawner) { clearTimeout(target.respawner) }
            mp.chat.aPush(player, `You have revived ${target.characterName} [${target.id}]`);
            mp.chat.aPush(target, `You have been revived by ${player.adminName}`);
        }
        else { mp.chat.err(player, `No player was found.`) }
        return
    }
    mp.chat.err(player, `${CONFIG.noauth}`)
}),
    mp.cmds.add(['gotov', 'gtv'], async (player, target) => {
        class gotoV {
            constructor() {
                if (!target) return mp.chat.info(player, `Use: /gtv [SQLID]`);
                if (player.isAdmin > 2 && player.adminDuty || player.isAdmin > 7) {
                    if (parseInt(target)) {
                        var foundV = false;

                        mp.vehicles.forEach((veh) => {
                            if (veh.getVariable('sqlID') == parseInt(target)) {
                                foundV = true;
                                new Promise((resolve, reject) => {
                                    player.position = veh.position
                                    resolve();
                                }).then(() => {
                                    setTimeout(() => {
                                        if (!veh || !player) return;
                                        player.putIntoVehicle(veh, 0);
                                    }, 200);
                                    mp.chat.aPush(player, `You teleported to vehicle with SQLID: ${veh.getVariable('sqlID')}`)
                                    player.call('notifCreate', [`~r~Teleported successfully`])
                                })
                            }
                        })

                        if (!foundV) return mp.chat.err(player, `No vehicle with that SQLID was found spawned.`);
                    }
                    return
                }
                mp.chat.err(player, `${CONFIG.noauth}`)
            }
        }
        new gotoV
    })
mp.cmds.add(['vbring', 'tpv'], async (player, targetVehicle) => {
    class bringVehicle {
        constructor() {
            if (!targetVehicle) { return mp.chat.info(player, `Use: /vbring [SQLID]`) }
            if (player.isAdmin > 7 || player.adminDuty) {
                if (parseInt(targetVehicle)) {
                    const { vehicles } = require('../models')
                    vehicles.findAll({
                        where: { id: targetVehicle }
                    }).then((ve) => {
                        if (ve.length == 0) return mp.chat.err(player, `No vehicle with this SQLID was found.`)
                        if (ve.length > 0 && ve[0].spawned == 1) {
                            mp.vehicles.forEach((veh) => {
                                if (veh.getVariable('sqlID') == ve[0].id) {
                                    veh.position = player.position;
                                    mp.chat.aPush(player, `Teleported vehicle with SQLID: ${ve[0].id}`)
                                    player.putIntoVehicle(veh, 0)
                                    return;
                                }
                            })
                        }
                        else {
                            const { vehicles } = require('../models')
                            vehicles.findAll({ where: { id: targetVehicle } }).then((build) => {
                                if (build.length > 0) {
                                    var vehicle = mp.vehicles.new(mp.joaat(build[0].vehicleModel), new mp.Vector3(JSON.parse(build[0].position), {
                                        dimension: 0,
                                        locked: true,
                                        engine: false
                                    }));
                                    vehicle.locked = true;
                                    vehicle.rotation = new mp.Vector3(0, 0, build[0].heading);
                                    vehicle.position = player.position;
                                    vehicle.setVariable('sqlID', parseInt(build[0].id));
                                    mp.chat.aPush(player, `Teleported vehicle with SQLID: ${build[0].id}`)
                                    player.putIntoVehicle(vehicle, 0)
                                    vehicles.update({
                                        spawned: 1,
                                        parked: 0,
                                        insurance: 0,
                                        position: JSON.stringify(player.position)
                                    }, { where: { id: targetVehicle } })
                                    vehicle.setVariable('vehData', build[0].data);
                                    vehicle.numberPlate = build[0].numberPlate;
                                    mp.events.call('vehicle:setMods', player, vehicle);
                                    vehicle.setVariable('currentTyres', build[0].tyreStatus);
                                    vehicle.setVariable('tyreSet', build[0].tyreStatus);
                                }
                            })
                        }
                    })
                }
                return
            }
            mp.chat.err(player, `${CONFIG.noauth}`)
        }
    }
    new bringVehicle();
})
mp.cmds.add(['vbringp', 'tpvp'], async (player, targetVehicle) => {
    class bringVehicle {
        constructor() {
            if (!targetVehicle) { return mp.chat.info(player, `Use: /vbringp [plate]`) }
            if (player.isAdmin > 7 || player.adminDuty) {
                if (targetVehicle) {
                    const { vehicles } = require('../models')
                    vehicles.findAll({
                        where: { numberPlate: targetVehicle }
                    }).then((ve) => {
                        if (ve.length == 0) return mp.chat.err(player, `No vehicle with this plate was found.`)
                        if (ve.length > 0 && ve[0].spawned == 1) {
                            mp.vehicles.forEach((veh) => {
                                if (veh.getVariable('sqlID') == ve[0].id) {
                                    veh.position = player.position;
                                    mp.chat.aPush(player, `Teleported vehicle with plate: ${ve[0].numberPlate}`)
                                    player.putIntoVehicle(veh, 0)
                                    return;
                                }
                            })
                        }
                        else {
                            const { vehicles } = require('../models')
                            vehicles.findAll({ where: { numberPlate: targetVehicle } }).then((build) => {
                                if (build.length > 0 && build[0].spawned != 1) {
                                    var vehicle = mp.vehicles.new(mp.joaat(build[0].vehicleModel), new mp.Vector3(JSON.parse(build[0].position), {
                                        dimension: 0,
                                        locked: true,
                                        engine: false
                                    }));
                                    vehicle.locked = true;
                                    vehicle.rotation = new mp.Vector3(0, 0, build[0].heading);
                                    vehicle.position = player.position;
                                    vehicle.setVariable('sqlID', parseInt(build[0].id));
                                    mp.chat.aPush(player, `Teleported vehicle with plate: ${build[0].numberPlate}`)
                                    player.putIntoVehicle(vehicle, 0)
                                    vehicles.update({
                                        spawned: 1,
                                        parked: 0,
                                        insurance: 0,
                                        position: JSON.stringify(player.position)
                                    }, { where: { numberPlate: targetVehicle } })
                                    vehicle.setVariable('vehData', build[0].data)
                                    vehicle.numberPlate = build[0].numberPlate;
                                    mp.events.call('vehicle:setMods', player, vehicle);
                                    vehicle.setVariable('currentTyres', build[0].tyreStatus);
                                    vehicle.setVariable('tyreSet', build[0].tyreStatus);
                                }
                            })
                        }
                    })
                }
                return
            }
            mp.chat.err(player, `${CONFIG.noauth}`)
        }
    }
    new bringVehicle();
})
mp.cmds.add(['slay'], (player, id) => {
    if (!id) return mp.chat.info(player, `Use: /slay [Name/ID]`);
    if (player.adminDuty || player.isAdmin > 7) {
        var targetP = mp.core.idOrName(player, id)
        if (targetP) {
            mp.events.call('slayPlayer', targetP);
            mp.chat.aPush(targetP, `You have been slayed by ${player.adminName}`);
            mp.chat.aPush(player, `You have slayed ${targetP.characterName}`);
            targetP.call('notifCreate', [`~r~You were slayed by ~p~${player.adminName}`])
            player.call('notifCreate', [`~r~You slayed ~p~${targetP.characterName}`])
            return;
        }
        else { mp.chat.err(player, `No player was found.`) }
        return;
    }
    mp.chat.err(player, `${CONFIG.noauth}`)
}),
    mp.cmds.add(['setvplate'], async (player, fullText, sqlid, ...plate) => {
        if (player.isAdmin > 7) {
            if (sqlid == null) {
                if (player.vehicle && player.vehicle.getVariable('sqlID')) {
                    sqlid = player.vehicle.getVariable('sqlID')
                    if (plate.length == 0) return mp.chat.info(player, `Use: /setvplate [Current Vehicle / SQLID] [plate]`);
                }
                else return mp.chat.info(player, `Use: /setvplate [Current Vehicle / SQLID] [plate]`)
            }

            db.vehicles.findAll({ where: { id: sqlid } }).then((vehicle) => {
                if (vehicle.length > 0) {
                    db.vehicles.update({
                        numberPlate: plate.join('_')
                    }, { where: { id: sqlid } }).then(() => {
                        mp.vehicles.forEach((veh) => { if (veh.getVariable('sqlID') == sqlid) { veh.numberPlate = plate.join('_'); } })
                        mp.chat.aPush(player, `Updated number plate to ${plate.join('_')} for vehicle with sqlid: ${sqlid}`)
                    }).catch((err) => { mp.log(err) })
                    return;
                }
                else return mp.chat.err(player, `No vehicle with that SQLID was found.`)
            })

        }
    }),
    mp.cmds.add(['slap'], (player, fullText, id, ...value) => {
        if (id == null) return mp.chat.info(player, `Use: /slap [Name/ID] [value(0-2600)]`)
        if (player.adminDuty || player.isAdmin > 7) {
            var ps = mp.core.idOrName(player, id)
            if (ps && parseInt(value) > 0 && parseInt(value) <= 2600) {
                ps.lastApos = ps.position;
                ps.position = new mp.Vector3(ps.position.x, ps.position.y, ps.position.z + parseInt(value));
                player.call('notifCreate', [`~r~You slapped ${ps.characterName} for ~p~${value}~r~ units`])
                ps.call('notifCreate', [`~r~ You were slapped by ~p~${player.adminName}~r~ for ${value} units.`])
                mp.chat.aPush(ps, ` You have been slapped by !{orange}${player.adminName}!{#ff4242} for !{orange}${value}!{#ff4242} units!`);
                mp.chat.aPush(player, ` Slapped ${ps.characterName}!`);
                return;
            }
            else { mp.chat.err(player, `No player was found.`) }
            return;
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['tpc'], (player, fullText, ...pos) => {
        if (!pos[2]) return mp.chat.info(player, `Use: /tpc [x] [y] [z]`);
        if (player.adminDuty) {
            var pos = `{"x": ${pos[0]}, "y": ${pos[1]}, "z": ${pos[2]}}`
            player.position = new mp.Vector3(JSON.parse(pos));
            mp.chat.aPush(player, ` Teleported to !{#919191}${player.position}!{#ff4242}!`);
            return;
        }
        mp.chat.err(player, `${CONFIG.noauth}`);
    }),
    mp.cmds.add(['setdim'], (player, fullText, id, ...dim) => {
        if (!id || !dim[0]) return mp.chat.info(player, `Use: /setdim [Name/ID] [dim]`)
        if (player.adminDuty || player.isAdmin > 7) {
            var targetP = mp.core.idOrName(player, id)
            if (targetP) {
                targetP.dimension = parseInt(dim);
                mp.chat.aPush(player, ` You have set ${targetP.characterName} dimension to !{orange}${dim}`)
                targetP.call('notifCreate', [`~r~Your dimension was set to ~g~${parseInt(dim)}~r~ by ~p~${player.adminName}`])
                player.call('notifCreate', [`~r~You set ~g~${targetP.characterName}'s~r~ dimension to ~p~${parseInt(dim)}`])
                mp.chat.aPush(targetP, ` Your dimension has been set to !{orange}${dim}!{#ff4242} by !{orange}${player.adminName}`)
                return
            }
            else { mp.chat.err(player, `No player was found.`) }
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['tpmr'], (player, arg) => {
        if (arg != undefined || arg != null) return mp.chat.info(player, `Use: /tpmr`)
        if (player.adminDuty || player.isAdmin > 7) {
            player.position = new mp.Vector3(427.9, -978.9, 30.7)
            player.call('notifCreate', [`~r~Teleported successfully`])
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['telm', 'tptowp'], async (player, arg) => {
        if (arg != undefined || arg != null) return mp.chat.info(player, `Use: /telm`)
        if (player.adminDuty || player.isAdmin > 7) {
            new Promise(async (resolve, reject) => {
                let targetVeh = null;
                if (player.vehicle) {
                    targetVeh = player.vehicle;
                    player.call('TELEPORTWAY');
                    setTimeout(() => {
                        if (!player || !targetVeh) return;
                        targetVeh.position = player.position;
                        setTimeout(() => {
                            player.putIntoVehicle(targetVeh, 0);
                            resolve();
                        }, 200);
                    }, 1200);
                    return;
                } else {
                    player.call('TELEPORTWAY');
                    resolve();
                }

            }).catch((err) => { mp.chat.err(player, `${err}`) });
            return;
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['createshop'], async (player, name) => {
        if (!name) return mp.chat.info(player, `Use: /createshop [name]`)
        if (player.isAdmin > 7) {
            const { server_shops } = require('../models')
            server_shops.create({
                OwnerId: player.characterId,
                shopName: name.toString(),
                moneyAmount: 120000000000,
                items: `{}`,
                lastRobbery: 0,
                position: JSON.stringify(player.position)
            }).then((shop) => {
                mp.chat.success(player, `You have created a new shop on the server with ID: ${JSON.parse(JSON.stringify(shop)).id}`)
                var shopLabel = mp.labels.new(`Shop: ${JSON.parse(JSON.stringify(shop)).shopName} ID: ${JSON.parse(JSON.stringify(shop)).id}`, new mp.Vector3(JSON.parse(JSON.stringify(shop)).position),
                    {
                        font: 4,
                        drawDistance: 30,
                        color: [255, 0, 0, 255],
                        dimension: 0
                    });
                var shopBlip = mp.blips.new(110, new mp.Vector3(JSON.parse(JSON.stringify(shop)).position),
                    {
                        name: JSON.parse(JSON.stringify(shop)).shopName,
                        shortRange: true,
                    });
            }).catch((err) => { mp.log(err) })
        }
    })
mp.cmds.add(['amark'], (player, text) => {
    if (!text) return mp.chat.info(player, `Use: /amark [text]`);
    if (player.adminDuty || player.isAdmin > 7) {
        const amark = mp.labels.new("~c~((~r~ [ADMIN MARKER] ~w~" + text + '~c~ ))', player.position,
            {
                font: 4,
                drawDistance: 30,
                color: [255, 0, 0, 255],
                dimension: player.dimension
            });
        amark.setVariable('adminMark', true);
    }
}),
    mp.cmds.add(['amarkremove'], async (player, arg) => {
        if (arg != null) return mp.chat.info(player, `Use: /amarkremove`);
        if (player.isAdmin > 2) {
            mp.labels.forEach((label) => {
                if (player.dist(label.position) <= 2 && label.getVariable('adminMark') == true) {
                    label.destroy();
                    mp.chat.aPush(player, `Removed admin marker.`);
                }
            })
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['vsync'], async (player, sqlid) => {
        if (!sqlid) return mp.chat.info(player, `Use: /vsync [SQLID]`)
        if (player.isAdmin > 7) {
            mp.vehicles.forEach((veh) => {
                if (veh.getVariable('sqlID') == parseInt(sqlid)) {
                    mp.events.call('vehicle:setMods', player, veh);
                    mp.chat.aPush(player, `Resynced vehicle mods for vehicle with SQLID: ${veh.getVariable('sqlID')}`)
                }
            })
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    })
mp.cmds.add(['amods'], async (player, arg) => {
    if (arg != null) return mp.chat.info(player, `Use: /amods`)
    if (player.isAdmin > 7) {
        player.call('requestRoute', ['vehcustom', false, false])
    }
}),
    mp.cmds.add(['sstart'], async (player, sound) => {
        if (!player.isAdmin > 7) return
        mp.labels.new('Audio Source', player.position,
            {
                los: false,
                font: 4,
                drawDistance: 30,
            });
        mp.players.forEachInRange(player.position, 200, (ps) => { ps.call('soundStart', [sound]) })
    }),
    mp.cmds.add(['sstop'], (player) => {
        if (player.isAdmin > 7) { mp.players.forEachInRange(player.position, 200, (ps) => { ps.call('soundStop') }) }
    })
mp.cmds.add(['ssres'], (player) => {
    if (player.isAdmin > 7) { mp.players.forEachInRange(player.position, 200, (ps) => { ps.call('soundResume') }) }
})
mp.cmds.add(['setaped'], async (player, fullText, id, model) => {
    if (!id || !model || model.length == 0) return mp.chat.info(player, `Use: /setaped [Name/ID] [pedModel]`)
    if (player.isAdmin > 4 && player.adminDuty || player.isAdmin > 7) {
        var target = mp.core.idOrName(player, id)
        if (target) {
            target.adminPed = model;
            const { Accounts } = require('../models')
            Accounts.update({
                aPed: target.adminPed
            }, { where: { id: target.sqlID } }).then(() => {
                mp.chat.aPush(target, `!{white}Your admin ped was set to ${model} by !{red}${player.adminName}`)
                mp.chat.aPush(player, `You set player ${target.characterName}'s admin ped to !{red}${model}`);
            }).catch((err) => { mp.log(err) })
        }
        else { mp.chat.err(player, `No player was found.`) }
        return
    }
    mp.chat.err(player, `${CONFIG.noauth}`)
}),
    mp.cmds.add(['banchar'], async (player, name) => {
        if (!name) return mp.chat.info(player, `Use: /banchar [Character Name (Fname_Lname)]`)
        if (player.adminDuty || player.isAdmin > 7) {
            const { characters } = require('../models')
            characters.findAll({ where: { cName: name } }).then((char) => {
                if (char.length > 0) {
                    characters.update({
                        banned: 1,
                    }, { where: { cName: name } }).then(() => {
                        mp.players.forEach((ps) => {
                            console.log(`${ps.characterName.split('_')}`)
                            if (ps.getVariable('loggedIn') && ps.characterName.split(" ").join('_') == name) {
                                mp.chat.aPush(ps, `This character has been banned by ${player.adminName}.`)
                                setTimeout(() => {
                                    if (ps) { ps.kick() }
                                }, 1000);
                            }
                        })
                        mp.players.forEach((ps) => { if (ps.isAdmin > 1) { mp.chat.staffMsg(ps, `${player.adminName} has banned character ${name}.`) } })
                        mp.chat.aPush(player, `You have banned character ${name} successfully.`)
                    })
                    return
                }
                else if (!char.length == 0) { return mp.chat.err(player, `No character with name ${name} was found.`) }
            })
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['unbanchar'], async (player, name) => {
        if (!name) return mp.chat.info(player, `Use: /unbanchar [Character Name (Fname_Lname)]`);
        if (player.adminDuty || player.isAdmin > 7) {
            const { characters } = require('../models')
            characters.findAll({ where: { cName: name, banned: 1 } }).then((char) => {
                if (char.length > 0) {
                    characters.update({
                        banned: 0
                    }, { where: { cName: name } }).then(() => {
                        mp.chat.aPush(player, `Unbanned character ${name} successfully.`);
                    })
                    return
                }
                else if (!char.length == 0) { return mp.chat.err(player, `No character was found with that name or the character is not banned.`) }
            })
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['kickall'], async (player, arg) => {
        if (arg != undefined) return mp.chat.info(player, `Use /kickall`)
        if (player.isAdmin > 7) {
            mp.players.forEach((pe) => {
                pe.kick();
            })
            mp.log(`${CONFIG.consoleRed}[ADMIN]${CONFIG.consoleWhite} ${player.adminName} has kicked everyone from the server!`);
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['gcv'], async (player, arg) => {
        if (arg != undefined || arg != null) return mp.chat.info(player, `Use: /gcv`);
        if (player.isAdmin > 2) {
            mp.vehicles.forEachInRange(player.position, 6,
                async (vehicle) => {
                    const vehicleName = await player.callProc('proc::vehicleName', [vehicle.model]);
                    const dist = await player.callProc('proc:getDist', [vehicle])
                    if (vehicle.getVariable('sqlID')) {
                        const { vehicles } = require('../models');
                        vehicles.findAll({
                            where: { id: parseInt(vehicle.getVariable('sqlID')) }
                        }).then((ve) => {
                            if (ve.length == 0) return;
                            const { characters } = require("../models");
                            characters.findAll({
                                where: { id: ve[0].OwnerId }
                            }).then((char) => {
                                if (char.length > 0) {
                                    mp.chat.sendMsg(player, `<br><font color="#919191">===============================================<br><font color="yellow"> [Vehicle ID]<font color="orange"> ${vehicle.id}<br><font color="yellow"> [Vehicle Plate]<font color="orange"> ${vehicle.numberPlate}<br><font color="yellow"> [Vehicle Model]<font color="orange"> ${vehicleName}<br> <font color="yellow"> [SQLID]<font color="orange"> ${vehicle.getVariable('sqlID')}<br><font color="yellow"> [Owner Char]<font color="orange"> ${char[0].cName}<br><font color="yellow"> [Distance]<font color="orange"> ${dist} meters<br><font color="yellow"> [Data]<font color="orange"> ${vehicle.getVariable('vehData')}<br><font color="yellow"> [Tyre Status]<font color="orange"> ${vehicle.getVariable('currentTyres')}<br><font color="yellow"> [Dirt Level]<font color="orange"> ${vehicle.getVariable('dirtLevel') == null ? 0 : vehicle.getVariable('dirtLevel')}<br><font color="#919191">================================================`);
                                }
                                else {
                                    mp.chat.sendMsg(player, `<br><font color="#919191">================================================<br><font color="yellow"> [Vehicle ID]<font color="orange"> ${vehicle.id}<br><font color="yellow"> [Vehicle Plate]<font color="orange"> ${vehicle.numberPlate}<br><font color="yellow"> [Vehicle Model]<font color="orange"> ${vehicleName}<br><font color="yellow"> [Owner Char]<font color="orange"> None<br> <font color="yellow"> [SQLID]<font color="orange"> ${vehicle.getVariable('sqlID')}<br><font color="yellow"> [Distance]<font color="orange"> ${dist} meters<br><font color="yellow"> [Data]<font color="orange"> ${vehicle.getVariable('vehData')}<br><font color="yellow"> [Tyre Status]<font color="orange"> ${vehicle.getVariable('currentTyres')}<br><font color="yellow"> [Dirt Level]<font color="orange"> ${vehicle.getVariable('dirtLevel') == null ? 0 : vehicle.getVariable('dirtLevel')}<br><font color="#919191">================================================`);
                                }
                                return
                            })
                        })
                    }
                    else {
                        mp.chat.sendMsg(player, `<br><font color="#919191">================================================<br><font color="yellow"> [Vehicle ID]<font color="orange"> ${vehicle.id}<br><font color="yellow"> [Vehicle Plate]<font color="orange"> ${vehicle.numberPlate}<br><font color="yellow"> [Vehicle Model]<font color="orange"> ${vehicleName}<br><br><font color="yellow"> [Distance]<font color="orange"> ${dist} meters<br><font color="yellow"> [Data]<font color="orange"> ${vehicle.getVariable('vehData')}<br><font color="yellow"> [Tyre Status]<font color="orange"> ${vehicle.getVariable('currentTyres')}<br><font color="#919191">================================================`);
                        return
                    }
                }
            );
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['vinfo'], (player, sqlid) => {
        if (!sqlid) return mp.chat.info(player, `Use: /vinfo [sqlid]`);
        if (player.isAdmin > 2) {
            var foundVeh = false;
            mp.vehicles.forEach(veh => { if (veh.getVariable('sqlID') == sqlid) { foundVeh = true, mp.events.call('veh:getData', player, veh); } });
            if (!foundVeh) { return mp.chat.err(player, `No vehicle with that SQLID was found spawned.`); }
            return;
        }
        mp.chat.err(player, `${CONFIG.noauth}`);
    }),
    mp.cmds.add(['ajail'], async (player, fullText, id, time, ...reason) => {
        if (!id || !time || !reason || reason.length == 0 || 0 > time) return mp.chat.info(player, `Use: /ajail [Name/ID] [minutes] [reason]`);
        if (player.adminDuty || player.isAdmin > 7) {
            var targetP = mp.core.idOrName(player, id)
            if (targetP.getVariable('adminJailed') == true) return mp.chat.err(player, `Player is already admin jailed.`)
            if (targetP && parseInt(time)) {
                if (targetP.adminDuty) {
                    mp.events.call('adutyStop', targetP);
                }
                const { characters } = require('../models')
                characters.update({
                    isInjured: 0
                }, { where: { id: targetP.characterId } })
                mp.chat.aPush(targetP, `You were admin jailed by !{#b1a1ff}${player.adminName}!{white} | Time ${time} minutes | Reason ${reason.join(' ')}`)
                mp.chat.aPush(player, `You admin jailed Player !{#b1a1ff}${targetP.characterName}!{white} | Time ${time} minutes | Reason ${reason.join(' ')}`)
                mp.players.forEach((ps) => {
                    if (ps.isAdmin > 0) {
                        mp.chat.staffMsg(ps, `Player ${targetP.characterName} was jailed by ${player.adminName} | Reason ${reason.join(' ')} | Time ${time} minutes`);
                    }
                })
                mp.events.call('adminJailStart', player, id, time * 60, reason.join(' '));
                if (targetP.getVariable('injured') == true) {
                    targetP.health = 0;
                }
            }
            else { mp.chat.err(player, `No player was found.`) }
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['releaseajail'], async (player, target) => {
        if (!target) return mp.chat.info(player, `Use: /releaseajail [Name/ID]`);
        if (player.isAdmin > 2 && player.adminDuty || player.isAdmin > 7) {
            var targetPlayer = mp.core.idOrName(player, target)
            if (targetPlayer) {
                if (targetPlayer.getVariable('adminJailed') == true) {
                    mp.events.call('endAjail', targetPlayer);
                    mp.chat.aPush(player, `You have ended admin jail for player ${targetPlayer.characterName}`);
                    mp.chat.aPush(targetPlayer, `Your admin jail was ended by ${player.adminName}`);
                    targetPlayer.setVariable('adminJailed', false);
                    mp.players.forEach((ps) => {
                        if (ps.isAdmin > 0) {
                            mp.chat.staffMsg(ps, `Player ${targetPlayer.characterName} [${targetPlayer.id}] was released from ajail by ${player.adminName}`);
                        }
                    })
                    return;
                }
                else {
                    mp.chat.err(player, `Player is not admin jailed.`);
                }
                return
            }
            else { mp.chat.err(player, `No player was found.`) }
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['stv'], (player, seatId = 0) => {
        if (player.adminDuty || player.isAdmin > 7) {
            var vehArray = []
            mp.vehicles.forEachInRange(player.position, 5,
                (vehicle) => {
                    vehArray.push(vehicle)
                    return
                }
            );
            if (vehArray.length == 0) { return mp.chat.err(player, `There is no vehicle near you. (5 Meters)`) }
            if (vehArray[0]) {
                player.putIntoVehicle(vehArray[0], parseInt(seatId));
                return
            }
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['kick'], (player, fullText, id, ...reason) => {
        if (id == null || reason == null) return mp.chat.info(player, `Use: /kick [Name/ID] [reason]`)
        if (player.adminDuty || player.isAdmin > 7) {
            var rageMpPlayer = mp.core.idOrName(player, id)
            if (rageMpPlayer) {
                var res = reason.join(' ');
                mp.players.forEach((ps) => {
                    if (ps.getVariable('loggedIn')) {
                        mp.chat.aPush(ps, `!{orange}${player.adminName}!{#ff4242}!{white} kicked ${rageMpPlayer.characterName} [${rageMpPlayer.id}] from the server | !{orange}Reason: !{white}${res}`)
                    }
                })
                mp.core.addAdminPunishment(player, rageMpPlayer, 'KICK', `${reason.join(' ') == null || undefined ? 'none' : reason.join(' ')}`, 0);
                mp.chat.aPush(rageMpPlayer, ` You were kicked by !{orange}${player.adminName}!{#ff4242} | Reason: !{#ff4242}${res}`);
                setTimeout(async () => {
                    if (rageMpPlayer) {
                        rageMpPlayer.kick(res);
                    }
                }, 1000);
                return
            }
            else { mp.chat.err(player, `No player was found.`) }
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['setadmin'], async (player, fullText, id, ...level) => {
        if (!id || !level || level.length == 0) return mp.chat.info(player, `Use: /setadmin [Name/ID] [adminRank(0 - 8)]`)
        if (player.isAdmin > 5) {
            var targetPlayer = mp.core.idOrName(player, id)

            const adminRanks = ['None', 'Support', 'Senior Support', 'Moderator', 'Senior Moderator', 'Administrator', 'Senior Administrator', 'Head Administrator', 'Immortal']
            const adminColours = ['', '#ff00fa', '#9666ff', '#37db63', '#018a35', '#ff6363', '#ff0000', '#00bbff', '#c096ff']

            if (parseInt(level) < 0 || parseInt(level) > 8) { return mp.chat.err(player, `Enter a valid admin level between 0 and 8`) }

            if (!targetPlayer) { return mp.chat.err(player, `No player was found.`) }

            if (player.isAdmin > 5 && player.adminDuty && parseInt(level) <= 3 || player.isAdmin > 6 && player.adminDuty && parseInt(level) <= 6 || player.isAdmin > 7) {
                targetPlayer.isAdmin = parseInt(level);
                targetPlayer.adminSt = adminRanks[parseInt(level)];
                targetPlayer.adminColour = adminColours[parseInt(level)];
                targetPlayer.setVariable('adminLevel', parseInt(level));

                db.Accounts.update({ adminStatus: targetPlayer.isAdmin }, { where: { id: targetPlayer.sqlID } }).then(() => {
                    mp.events.call('adutyStop', targetPlayer)
                    mp.chat.aPush(player, `!{white}You set !{#ff6678}${targetPlayer.characterName}'s!{white} admin level to !{${targetPlayer.adminColour}}${targetPlayer.adminSt}!{white}`)
                    mp.chat.aPush(targetPlayer, `!{white}You admin level was set to !{${targetPlayer.adminColour}}${targetPlayer.adminSt}!{white} by !{#ff6678}${player.adminName}!{white}`)
                })
            }

            else { mp.chat.err(player, `You are not authorized to assign that admin rank.`) }
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['tat'], async (player, fullText, lib, ...sec) => {
        if (!lib || !sec || sec.length == 0) return mp.chat.info(player, `Use: /tat [lib] [sec]`)
        if (player.isAdmin > 7) {
            mp.chat.aPush(player, `["${lib}", "${sec}"]`)
            const { player_tattoos } = require('../models')
            player_tattoos.create({
                OwnerId: player.characterId,
                libary: lib,
                section: sec.join('_')
            }).catch((err) => { mp.log(err) }).then(() => {
                mp.events.call('player:setClothing', player);
            })
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    })
mp.cmds.add(['setaname'], (player, fullText, id, ...aname) => {
    if (fullText == null || id == null || aname.length == 0) return mp.chat.info(player, `Use: /setaname [Name/ID] [name]`)
    if (player.isAdmin > 4 && player.adminDuty || player.isAdmin == 8) {
        var ps = mp.core.idOrName(player, id)
        if (ps) {
            if (aname.length == 0) return;
            var adName = aname.join(' ');
            ps.adminName = adName;
            const { Accounts } = require('../models')
            Accounts.update({
                aName: adName
            }, { where: { id: ps.sqlID } }).then(() => {
                mp.chat.aPush(player, `You have set !{#b1a1ff}${ps.characterName}'s!{#ff4242} admin name to!{orange} ${adName}`);
                mp.chat.aPush(ps, ` Your admin name has been set to !{orange}${adName}!{#ff4242} by !{orange}${player.adminName}`);
                ps.setVariable('adminName', ps.adminName)
            }).catch((err) => { mp.log(err) })
        }
        else { mp.chat.err(player, `No player was found.`) }
        return
    }
    mp.chat.err(player, `${CONFIG.noauth}`)
}),
    mp.cmds.add(['debug'], (player, arg) => {
        if (arg != null) return mp.chat.info(player, `Use: /debug`)
        if (player.isAdmin > 7) {
            if (!player.getVariable('devdebug')) {
                player.setVariable('devdebug', true);
                mp.chat.aPush(player, `You have enabled developer debugging.`);
            }
            else if (player.getVariable('devdebug')) {
                player.setVariable('devdebug', false);
                mp.chat.aPush(player, `You have disabled developer debugging.`);
            }
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['replenish', 'rhw'], async (player, id) => {
        if (!id) return mp.chat.info(player, `Use: /replenish [Name/ID]`)
        if (player.adminDuty || player.isAdmin > 7) {
            var targetPlayer = mp.core.idOrName(player, id)
            if (targetPlayer) {
                const { characters } = require('../models')
                characters.update({
                    thirst: 100,
                    hunger: 100
                }, { where: { id: targetPlayer.characterId } }).then(() => {
                    targetPlayer.setVariable('hungerAmount', 100)
                    targetPlayer.setVariable('thirstAmount', 100)
                    player.thirst = 100;
                    player.hunger = 100;
                    mp.chat.aPush(player, `You replenished ${targetPlayer.characterName} [${targetPlayer.id}]'s water and hunger.`)
                    mp.chat.aPush(targetPlayer, `Your food and water has been replenished by ${player.adminName}`)
                })
            }
            else if (!targetPlayer) { mp.chat.err(player, `No player was found.`) }
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    })
mp.cmds.add(['giveamoney'], (player, fullText, id, ...amount) => {
    if (fullText == null || id == null) return mp.chat.info(player, `Use: /giveamoney [Name/ID] [money]`);
    if (player.isAdmin > 6 && player.adminDuty || player.isAdmin > 7) {
        var targetPlayer = mp.core.idOrName(player, id)
        if (targetPlayer) {
            player.moneyAmount = parseInt(amount)
            const { characters } = require('../models')
            characters.update({
                moneyAmount: parseInt(amount)
            }, { where: { id: targetPlayer.characterId } }).then(() => {
                mp.chat.aPush(player, `!{white}You gave !{#94ffa6}$${parseInt(amount)}!{white} to ${targetPlayer.characterName}`);
                mp.chat.aPush(targetPlayer, `!{white}You were given !{#94ffa6}$${parseInt(amount)}!{white} by !{red}${player.adminName}`)
            }).catch((err) => { mp.log(err) })
        }
        else { mp.chat.err(player, `No player was found.`) }
        return
    }
    mp.chat.err(player, `${CONFIG.noauth}`);
}),
    mp.cmds.add(['aremovefdo'], async (player, id) => {
        if (!id) return mp.chat.info(player, `Use: /aremovefdo [id]`)
        if (player.adminDuty || player.isAdmin > 7) {
            mp.labels.forEachInRange(player.position, 20,
                async (lab) => {
                    if (lab.getVariable('sqlID') == id) {
                        const { floating_dos } = require('../models')
                        floating_dos.findAll({ where: { id: lab.getVariable('sqlID') } }).then((fdo) => {
                            if (fdo.length > 0) {
                                floating_dos.destroy({ where: { id: lab.getVariable('sqlID') } }).then(() => {
                                    mp.chat.aPush(player, `Removed fdo with ID: ${lab.getVariable('sqlID')}`)
                                    lab.destroy();
                                })
                            }
                            else { return mp.chat.err(player, `No floating do with this ID was found.`) }
                        })
                    }
                })
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['setname'], (player, fullText, id, ...name) => {
        if (id == null || !name[0] || !name[1] || name[2] != null) return mp.chat.info(player, `Use: /setname [Name/ID] [fname lname]`);
        if (player.isAdmin > 6 && player.adminDuty || player.isAdmin > 7) {
            var targetP = mp.core.idOrName(player, id);
            if (targetP) {
                targetP.characterName = name.join(' ');
                const { characters } = require('../models');
                characters.update({
                    cName: targetP.characterName.join('_')
                }, { where: { id: targetP.characterId } }).then(() => {
                    mp.chat.aPush(player, ` You have changed Player [${targetP.id}]s name to ${name.join(' ')}`);
                    mp.chat.aPush(targetP, `Your name has been set to ${name.join(' ')} by !{orange}${player.adminName}`);
                })
            }
            else {
                mp.chat.err(player, ` No player with that ID was found.`)
            }
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['fillfuel'], async (player, sqlid) => {
        if (player.isAdmin > 2 && player.adminDuty || player.isAdmin > 7) {
            if (sqlid == null) {
                if (player.vehicle && player.vehicle.getVariable('sqlID')) { sqlid = player.vehicle.getVariable('sqlID') }
                else { return mp.chat.info(player, `Use: /fillfuel [CurrentVehicle / SQLID]`) }
            }

            mp.vehicles.forEach((veh) => {
                if (veh.getVariable('sqlID') && veh.getVariable('sqlID') == sqlid && veh.getVariable('vehData')) {
                    var newJson = `{"fuelLevel": 100, "Health": ${JSON.parse(veh.getVariable('vehData')).Health}, "DistanceKm": ${JSON.parse(veh.getVariable('vehData')).DistanceKm}}`;
                    veh.setVariable('vehData', newJson)
                    const { vehicles } = require('../models');
                    vehicles.update({
                        data: newJson
                    }, { where: { id: parseInt(veh.getVariable('sqlID')) } }).then((suc) => {
                        mp.chat.aPush(player, `Refilled vehicle with SQLID ${veh.getVariable('sqlID')}`)
                    })
                }
            })
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    })
mp.cmds.add(['emptyfuel'], async (player, sqlid) => {
    if (player.isAdmin > 4 && player.adminDuty || player.isAdmin > 7) {
        if (sqlid == null) {
            if (player.vehicle && player.vehicle.getVariable('sqlID')) { sqlid = player.vehicle.getVariable('sqlID') }
            else { return mp.chat.info(player, `Use: /emptyfuel [CurrentVehicle / SQLID]`) }
        }

        mp.vehicles.forEach((veh) => {
            if (veh.getVariable('sqlID') && veh.getVariable('sqlID') == sqlid && veh.getVariable('vehData')) {
                var newJson = `{"fuelLevel": 0, "Health": ${JSON.parse(veh.getVariable('vehData')).Health}, "DistanceKm": ${JSON.parse(veh.getVariable('vehData')).DistanceKm}}`;
                veh.setVariable('vehData', newJson)
                const { vehicles } = require('../models');
                vehicles.update({
                    data: newJson
                }, { where: { id: parseInt(veh.getVariable('sqlID')) } }).then((suc) => {
                    mp.chat.aPush(player, `Removed fuel for vehicle with SQLID ${veh.getVariable('sqlID')}`)
                })
            }
        })
        return
    }
    mp.chat.err(player, `${CONFIG.noauth}`)
})
mp.cmds.add(['toga'], (player, arg) => {
    if (arg != null || undefined) return mp.chat.info(player, `Use: /toga`);
    if (player.isAdmin > 0) {
        toga = !toga;
        if (toga) {
            player.setVariable('toggledAdmin', true);
            mp.chat.aPush(player, ` You have turned admin messages !{orange}off!{#ff4242}.`)
        }
        else {
            player.setVariable('toggledAdmin', false);
            mp.chat.aPush(player, ` You have turned admin messages !{#b1a1ff}on!{#ff4242}.`)
        }
        return
    }
    mp.chat.err(player, `${CONFIG.noauth}`)
}),
    mp.cmds.add(['alock'], async (player, id, bool) => {
        if (!bool || !id) return mp.chat.info(player, `Use: /alock [id] [status]`)
        if (player.adminDuty || player.isAdmin > 7) {
            var targetVeh = mp.vehicles.at(id);
            if (targetVeh && bool) {
                targetVeh.locked = true;
                mp.chat.aPush(player, `Locked vehicle with ID ${id}`)
            }
            if (targetVeh && !bool) {
                targetVeh.locked = false;
                mp.chat.aPush(player, `Unlocked vehicle with ID ${id}`)
            }
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),
    mp.cmds.add(['smenu'], (player, arg) => {
        if (arg != undefined) return mp.chat.info(player, `Use: /smenu`);
        if (player.adminDuty || player.isAdmin > 7) {
            player.call('requestRoute', ['listMenu', true, true])
            mp.players.forEach((ps) => {
                if (ps.getVariable('loggedIn')) {
                    player.call('requestBrowser', [`appSys.commit('updateLists', {
                    menuName: 'Spectate',
                    menuSub: 'Currently ${mp.players.length == 1 ? '1 player online' : `${mp.players.length} players online`}.',
                    tableOne: 'Name',
                    tableTwo: 'ID',
                    icon: 'fa-solid fa-shield',
                    name: '${ps.characterName} [${ps.id}]',
                    id: ${ps.id},
                    button: true,
                    funcs: 'spectateStart'
                    });`]);
                }
            })
            return
        }
        mp.chat.err(player, `${CONFIG.noauth}`)
    }),

    function serverRestart(cycleTime) {
        if (cycleTime >= 0) return
        serverRestartTime = cycleTime;
        serverRestartInter = setInterval(() => {
            if (serverRestartTime >= 0) {
                mp.players.forEach((ps) => { mp.chat.server(ps, 'Server is now restarting...') })
                setTimeout(() => {
                    process.exit()
                }, 1000);
            }
            serverRestartTime--
        }, 1000);
        setTimeout(() => {
            mp.players.forEach((ps) => {
                if (ps.getVariable('loggedIn')) {
                    mp.chat.server(ps, `Server will be restarting in ${Math.trunc((serverRestart / 2) / 60000)} minutes`)
                }
            })
        }, serverRestart / 2);
    }

mp.cmds.add(['ebr'], (player, browser) => {
    if (browser && player.isAdmin > 7) {
        player.call('requestRoute', [browser, false, false]);
        mp.chat.aPush(player, `${browser}`);
    }
})

mp.cmds.add(['vclean'], (player, sqlid) => {
    if (player.isAdmin > 2 && player.adminDuty || player.isAdmin > 7) {
        if (!sqlid) {
            if (player.vehicle && player.vehicle.getVariable('sqlID')) { sqlid = player.vehicle.getVariable('sqlID') }
            else return mp.chat.info(player, `Use: /alean [Current Vehicle / SQLID]`);

            mp.vehicles.forEach(veh => { if (veh.getVariable('sqlID') == sqlid) { mp.events.call('updateDirtLevel', player, veh, 0) } });
            mp.chat.aPush(player, `You have cleaned vehicle with sqlid: ${sqlid}`);
        }
        return;
    }
    mp.chat.err(player, `${CONFIG.noauth}`);
})

// Core Staff System remote events
mp.events.add({
    // Wipe table on initizaltion
    'packagesLoaded': async () => {
        const { admin_reports } = require('../models')
        admin_reports.destroy({
            where: {},
            truncate: true
        }).catch((err) => { mp.log(err) })
    },
    'spectateStart': (player, targetId) => {
        if (player.adminDuty || player.isAdmin > 7) {
            var targetPlayer = mp.players.at(targetId)
            if (targetPlayer.id == player.id) return mp.chat.err(player, `You cannot spectate yourself.`);
            if (!player.getVariable('adminFly')) { mp.events.call('flyStart', player) }
            if (targetPlayer) {
                player.setVariable('specPos', [JSON.stringify(player.position)]);
                player.alpha = 0;
                player.position = targetPlayer.position;
                setTimeout(async () => {
                    if (player && targetPlayer) {
                        player.call('StartSpectatingTarget::Client', [targetPlayer]);
                        mp.chat.aPush(player, `Now spectating Player ${targetPlayer.characterName} [${targetPlayer.id}]. Use /spec off to cancel`);
                    }
                }, 2000);
                return
            }
            else { mp.chat.err(player, `Player not found`) }
        }
    },
    'server:reportHandle': async (player, status, id) => {
        if (!player.isAdmin > 0) return;
        switch (status) {
            case 'open':
                {
                    if (player.isAdmin > 0 && player.handlingR == false) {
                        try {
                            player.handlingR = true;
                            const { admin_reports } = require('../models')
                            admin_reports.findAll({}).then((rows) => {
                                if (rows.length == 0) return mp.chat.err(player, ` No report with this ID could be found!`);
                                if (rows[0].accepted == 1) return mp.chat.err(player, ` Report has already been accepted.`);
                                else {
                                    var pid = mp.players.at(rows[0].OwnerId);
                                    if (pid) {
                                        const { admin_reports } = require('../models')
                                        admin_reports.update({
                                            accepted: 1,
                                            adminId: parseInt(player.id)
                                        }, { where: { id: parseInt(rows[0].id) } })
                                        mp.players.forEach((ps) => {
                                            if (ps.isAdmin > 0) {
                                                ps.call('requestBrowser', [`appSys.commit('clearReports')`])
                                                const { admin_reports } = require('../models')
                                                admin_reports.findAll({}).then((getReports) => {
                                                    if (getReports.length > 0) {
                                                        getReports.forEach((report) => {
                                                            ps.call('requestBrowser', [`appSys.dispatch('addReport', { id: ${report.id}, time: ${report.Time}, desc: '${report.Description}' });`])
                                                        })
                                                    }
                                                })
                                            };
                                        })
                                        if (pid.id == player.id) { mp.chat.report(pid, `Your report has been !{#78cc78}accepted!{white} by !{orange}${player.adminName}!{white}. Use /rr [message] to communicate.`); }
                                        if (pid.id != player.id) {
                                            mp.chat.report(player, `You have !{#78cc78f}accepted!{white} report with for player with ID ${pid.id}`)
                                            mp.chat.report(pid, `Your report has been !{#78cc78}accepted!{white} by !{orange}${player.adminName}!{white}. Use /rr [message] to communicate.`);
                                        };
                                    }
                                    else {
                                        const { admin_reports } = require('../models')
                                        admin_reports.destroy({ where: { id: rows[0].id } }).then(() => {
                                            mp.chat.err(player, ` Player is not in the server. Report deleted.`);
                                        })
                                    }
                                }
                            })
                        } catch (e) { mp.log(e) }
                        return
                    }
                    break;
                }
            case 'close':
                {
                    player.handlingR = false;
                    const { admin_reports } = require('../models')
                    admin_reports.findAll({}).then((reportCheck) => {
                        if (reportCheck.length == 0) return;
                        if (parseInt(reportCheck[0].OwnerId) == player.id) {
                            if (reportCheck[0].accepted == 1 && player.createdReport == 1) {
                                targetP = mp.players.at(parseInt(reportCheck[0].adminId))
                                if (targetP) {
                                    const { admin_reports } = require('../models')
                                    admin_reports.destroy({ where: { id: reportCheck[0].id } })
                                    player.createdReport = 0;
                                    mp.players.forEach((ps) => {
                                        if (ps.isAdmin > 0) {
                                            ps.call('requestBrowser', [`appSys.commit('clearReports')`])
                                            const { admin_reports } = require('../models')
                                            admin_reports.findAll({}).then((getReports) => {
                                                if (getReports.length > 0) {
                                                    getReports.forEach((report) => {
                                                        ps.call('requestBrowser', [`appSys.dispatch('addReport', { id: ${report.id}, time: ${report.Time}, desc: '${report.Description}' });`])
                                                    })
                                                }
                                            })
                                        };
                                    })
                                    if (targetP.id != player.id) {
                                        mp.chat.report(targetP, ` !{#ff4242}${player.adminName}!{white} has closed the report.`);
                                        mp.chat.report(player, ` You have closed the report.`);
                                    }
                                    else if (player.id === targetP.id) { mp.chat.aPush(targetP, ` You have closed your report.`) }
                                }

                                return
                            }
                            else {
                                const { admin_reports } = require('../models')
                                admin_reports.destroy({ where: { id: reportCheck[0].id } }).then(() => {
                                    mp.chat.report(player, ` You have closed your report.`);
                                    mp.players.forEach((ps) => {
                                        if (ps.isAdmin > 0) {
                                            ps.call('requestBrowser', [`appSys.commit('clearReports')`])
                                            const { admin_reports } = require('../models')
                                            admin_reports.findAll({}).then((getReports) => {
                                                if (getReports.length > 0) {
                                                    getReports.forEach((report) => {
                                                        ps.call('requestBrowser', [`appSys.dispatch('addReport', { id: ${report.id}, time: ${report.Time}, desc: '${report.Description}' });`])
                                                    })
                                                }
                                            })
                                        };
                                    })
                                    player.createdReport = 0;
                                })
                            }
                            return
                        }
                        if (parseInt(reportCheck[0].adminId) == player.id && player.isAdmin == 0) {
                            if (reportCheck[0].accepted == 1) {
                                targetA = mp.players.at(parseInt(reportCheck[0].OwnerId));
                                if (targetA) {
                                    const { admin_reports } = require('../models')
                                    admin_reports.destroy({ where: { adminId: player.id } })
                                    targetA.createdReport = 0;
                                    mp.players.forEach((ps) => {
                                        if (ps.isAdmin > 0) {
                                            ps.call('requestBrowser', [`appSys.commit('clearReports')`])
                                            const { admin_reports } = require('../models')
                                            admin_reports.findAll({}).then((getReports) => {
                                                if (getReports.length > 0) {
                                                    getReports.forEach((report) => {
                                                        ps.call('requestBrowser', [`appSys.dispatch('addReport', { id: ${report.id}, time: ${report.Time}, desc: '${report.Description}' });`])
                                                    })
                                                }
                                            })
                                        };
                                    })
                                    mp.chat.report(targetA, `Your report has been !{#ff4242}closed!{white} by !{#ff4242}${player.adminName}`);
                                }
                                return
                            }
                            else {
                                const { admin_reports } = require('../models')
                                admin_reports.destroy({ where: { adminId: player.id } }).then((success) => {
                                    mp.players.forEach((ps) => {
                                        if (ps.isAdmin > 0) {
                                            ps.call('requestBrowser', [`appSys.commit('clearReports')`])
                                            const { admin_reports } = require('../models')
                                            admin_reports.findAll({}).then((getReports) => {
                                                if (getReports.length > 0) {
                                                    getReports.forEach((report) => {
                                                        ps.call('requestBrowser', [`appSys.dispatch('addReport', { id: ${report.id}, time: ${report.Time}, desc: '${report.Description}' });`])
                                                    })
                                                }
                                            })
                                        };
                                    })
                                    mp.chat.report(player, `You have closed the report.`);
                                })
                            }
                        }
                        else {
                            const { admin_reports } = require('../models')
                            admin_reports.destroy({ where: { adminId: player.id } }).then((success) => {
                                mp.players.forEach((ps) => {
                                    if (ps.isAdmin > 0) {
                                        ps.call('requestBrowser', [`appSys.commit('clearReports')`])
                                        const { admin_reports } = require('../models')
                                        admin_reports.findAll({}).then((getReports) => {
                                            if (getReports.length > 0) {
                                                getReports.forEach((report) => {
                                                    ps.call('requestBrowser', [`appSys.dispatch('addReport', { id: ${report.id}, time: ${report.Time}, desc: '${report.Description}' });`])
                                                })
                                            }
                                        })
                                    };
                                })
                                mp.chat.report(player, `You have closed the report.`);
                            })
                        }
                    })

                    break;
                }
            case 'teleport':
                {
                    if (!player.isAdmin > 1) return;
                    const { admin_reports } = require('../models')
                    admin_reports.findAll({}, { where: { id: { id } } }).then((getPos) => {
                        if (player.adminDuty == false) {
                            mp.events.call('adutyStart', player);
                            var pid = mp.players.at(getPos[0].OwnerId);
                            if (pid) {
                                player.position = pid.position;
                            }
                        }
                        else {
                            var pid = mp.players.at(getPos[0].OwnerId);
                            if (pid) {
                                player.position = pid.position;
                            }
                        }
                    })
                    break;
                }
            case 'spectate':
                {
                    if (!player.isAdmin > 1) return;
                    const { admin_reports } = require('../models')
                    admin_reports.findAll({}, { where: { id: { id } } }).then((getPos) => {
                        if (!player.adminDuty && !player.fly) {
                            player.fly = true;
                            mp.events.call('adutyStart', player);
                            player.setVariable('adminFly', true);
                            //player.data.ispflying = 1;
                            player.data.isflying = 1;
                            player.call('fly:start')
                            player.call('rmname');
                            player.alpha = 0;
                            var pid = mp.players.at(getPos[0].OwnerId);
                            if (pid) {
                                player.position = pid.position;
                            }
                        }
                        else {
                            player.setVariable('adminFly', true);
                            //player.data.ispflying = 1;
                            player.data.isflying = 1;
                            player.call('fly:start')
                            player.call('rmname');
                            player.alpha = 0;
                            var pid = mp.players.at(getPos[0].OwnerId);
                            if (pid) {
                                player.position = pid.position;
                            }
                        }
                    })
                    break;
                }
            default:
                break;
        }
    },
    'alart': (player, event) => {
        if (player.uuid) {
            mp.core.msgAdmins(`Remote Event has been triggered with name ${event} by player with UUID ${player.uuid}`);
        } else if (!player.uuid) {
            mp.core.msgAdmins(`Potential middleware attack from player with IP: ${player.ip} SC: ${player.socialClub}`);
        }
    },
    'adminJailStart': (player, target, time, reason) => {
        if (!player.isAdmin > 2 && !player.adminDuty || !player.isAdmin > 7) return
        class adminJail {

            constructor() {
                this.playerId = target;
                this.jailTime = time;
                this.reason = reason;

                this.startAdminJail();

                mp.events.add({
                    'playerQuit': (player) => {
                        time = 0;
                    }
                })
            }

            startAdminJail() {

                var targetPlayer = mp.players.at(this.playerId);
                if (targetPlayer) {

                    targetPlayer.setVariable('adminJailed', true);
                    targetPlayer.call('startAdminJail', [time])
                    targetPlayer.setVariable('ajailReason', reason)
                    const { Accounts } = require("../models");
                    Accounts.update({
                        adminJailTime: parseInt(time),
                        adminJailReason: reason
                    }, { where: { id: targetPlayer.sqlID } })
                    targetPlayer.dimension = targetPlayer.id + 1;
                    targetPlayer.position = new mp.Vector3(3055, -4703.1, 15.3);

                }

                else {
                    mp.chat.err(player, `No player with this ID could be found.`);
                }

            }

        }
        const aJail = new adminJail();
    },
    'saveajail': (player, time) => {
        if (player.getVariable('adminJailed')) {
            const { Accounts } = require('../models')
            Accounts.update({
                adminJailTime: parseInt(time)
            }, { where: { id: player.sqlID } })
        }
    },
    'spectate': (player, id) => {
        var targetP = mp.players.at(id)
        if (player.isAdmin > 1 && player.adminDuty || player.isAdmin > 7 && targetP) {
            mp.events.call('flyStart', player);
            player.position = targetP.position;
        }
    },
    'playerQuit': async (player) => {
        const { admin_reports } = require('../models')
        const { Op } = require('sequelize');
        admin_reports.findAll({
            where: {
                [Op.or]: [
                    {
                        OwnerId: player.id
                    },
                    {
                        adminId: player.id
                    }
                ]
            }
        }).then((rCheck) => {
            if (rCheck.length > 0) {
                const { Op } = require('sequelize');
                admin_reports.destroy({
                    where: {
                        [Op.or]: [
                            {
                                OwnerId: player.id
                            },
                            {
                                adminId: player.id
                            }
                        ]
                    }
                })
            }
        }).catch((err) => mp.log(err))
    },
    'flyStart': async (player) => {
        if (player.adminDuty || player.isAdmin > 7) {
            player.fly = true;
            player.setVariable('adminFly', true);
            player.setVariable('adminRadar', true);
            player.data.isflying = 1;
            player.call('fly:start');
            player.call('requestBrowser', [`gui.notify.clearAll()`]);
            player.call('notifCreate', [`~g~Enabled~r~ fly`])
            player.call('requestBrowser', [`gui.notify.showNotification("Enabled Fly", false, true, 7000, 'fa-solid fa-triangle-exclamation')`])
            player.call('rmname');
            player.alpha = 0;
            return
        }
    },
    'flyStop': async (player) => {
        if (player.adminDuty || player.isAdmin > 7) {
            player.fly = false;
            player.setVariable('adminFly', false);
            player.setVariable('adminRadar', false);
            player.call('requestBrowser', [`gui.notify.clearAll()`]);
            player.call('notifCreate', [`~r~Disabled fly`])
            player.call('requestBrowser', [`gui.notify.showNotification("Disabled Fly", false, true, 7000, 'fa-solid fa-triangle-exclamation')`])
            player.data.isflying = 0;
            player.call('fly:stop')
            player.call('rmname')
            player.alpha = 255;
            return
        }
    },
    'staff:getCount': async (player) => {
        if (player.isAdmin > 0) {
            player.call('requestRoute', ['listMenu', false, false])
            var staffArr = []
            mp.players.forEach((ps) => {
                if (ps.getVariable('loggedIn') && ps.isAdmin > 0) {
                    staffArr.push(ps);
                    player.call('requestBrowser', [`appSys.commit('updateLists', {
                        menuName: 'Online Staff',
                        menuSub: 'Currently ${staffArr.length} staff online.',
                        tableOne: 'Name',
                        tableTwo: 'Duty',
                        tableThree: 'Ping',
                        icon: 'fa-solid fa-shield',
                        name: '${ps.adminName} [${ps.adminDuty ? '<font color="#96ffa2">On Duty</font>' : '<font color="#ff4242">Off Duty</font>'}] [${ps.ping}]',
                        id: ${ps.id},
                        button: false,
                        funcs: ''
                    });`])
                }
            })
        }
    },
    'staff:reports': async (player) => {
        if (player.isAdmin > 2) {
            player.call('requestRoute', ['reports', true, true]);
            player.call('cursor:Show');
            player.call('requestBrowser', [`appSys.commit('clearReports')`])
            const { admin_reports } = require('../models')
            admin_reports.findAll({}).then((getReports) => {
                if (getReports.length > 0) {
                    getReports.forEach((report) => {
                        player.call('requestBrowser', [`appSys.dispatch('addReport', { id: ${report.id}, time: ${report.Time}, desc: '${report.Description}' });`])
                    })
                }
            })
        }
    },
    'endAjail': async (player) => {
        const { Accounts } = require('../models')
        Accounts.update({
            adminJailTime: 0
        }, { where: { id: player.sqlID } }).then(() => {
            player.setVariable('adminJailed', false);
            player.call('clearAdminInter');
            player.dimension = 0;
            player.position = new mp.Vector3(-1037.6, -2732.8, 20.2)
            mp.chat.success(player, `You were released from admin jail.`)
            mp.players.forEach((ps) => {
                if (ps.isAdmin > 0) {
                    mp.chat.staffMsg(ps, `Player ${player.characterName} [${player.id}] was released from ajail`);
                }
            })
        })
    },
    'playerExitColshape': async (player, shape) => {
        if (shape == ajail && player.getVariable('adminJailed') == true) {
            player.position = new mp.Vector3(3055, -4703.1, 15.3);
        }
    },
    'adutyStart': async (player) => {
        if (!player.isAdmin > 2) return;
        try {
            player.adutyHp = player.health;
            if (player.vehicle) { player.aVehicleLast = player.vehicle };
            player.model = mp.joaat([player.adminPed]);
            if (player.aVehicleLast && player && player.vehicle) { player.putIntoVehicle(player.aVehicleLast, 0); }
            mp.players.forEach((ps) => {
                if (ps.isAdmin > 0 && ps.getVariable('toggledAdmin') === false) {
                    ps.outputChatBox(`!{#b1a1ff}[!{${player.adminColour}}${player.adminSt}!{white}!{#b1a1ff}]!{white} ${player.adminName} is on duty.`)
                }
            });
        } catch (e) { mp.log(e) }
        mp.events.call('player:giveWeapons', player);
        player.setVariable('adminDuty', true);
        player.setVariable('adminLevel', player.isAdmin)
        player.setVariable('adminName', `${player.adminName}`)
        player.setVariable('adutyPos', [JSON.stringify(player.position)]);
        player.adutyDim = player.dimension
        player.call('notifCreate', [`~r~You are now on duty as ~p~${player.adminName}`])
        player.adminDuty = true;
        mp.log(`${CONFIG.consoleRed}[ADMIN]${CONFIG.consoleWhite} ${player.adminName} is ${CONFIG.consoleGreen}On-Duty${CONFIG.consoleWhite}`)
        return
    },
    'adutyStop': async (player) => {
        if (!player.isAdmin > 2) return;
        if (player.fly) { mp.events.call('flyStop', player); }
        if (player.adutyHp) { player.health = parseInt(player.adutyHp) }
        try {
            mp.players.forEach((ps) => {
                if (ps.isAdmin > 0 && ps.getVariable('toggledAdmin') === false) {
                    ps.outputChatBox(`!{#b1a1ff}[!{${player.adminColour}}${player.adminSt}!{white}!{#b1a1ff}]!{white} ${player.adminName} is off duty.`)
                }
            });
        } catch (e) { mp.log(e) }
        if (player.vehicle) { player.aVehicleLast = player.vehicle };
        if (player.sex == 'female') {
            player.model = mp.joaat(['mp_f_freemode_01'])
            mp.events.call('player:setClothing', player);
            mp.events.call('player:giveWeapons', player);
            mp.events.call('player:setModel', player)
        }
        else {
            player.model = mp.joaat(['mp_m_freemode_01'])
            mp.events.call('player:setClothing', player);
            mp.events.call('player:giveWeapons', player);
            mp.events.call('player:setModel', player)
        }
        if (player.aVehicleLast && player && player.vehicle) { player.putIntoVehicle(player.aVehicleLast, 0); }
        player.setVariable('adminDuty', false);
        player.call('notifCreate', [`~r~You are now off admin duty.`])
        player.adminDuty = false
        mp.log(`${CONFIG.consoleRed}[ADMIN]${CONFIG.consoleWhite} ${player.adminName} is ${CONFIG.consoleRed}Off-Duty${CONFIG.consoleWhite}`)
        return
    },
    'veh:getData': async (player, vehicle) => {
        if (player.isAdmin > 2) {
            const vehicleName = await player.callProc('proc::vehicleName', [vehicle.model]);
            const dist = await player.callProc('proc:getDist', [vehicle]);
            if (vehicle.getVariable('sqlID')) {
                const { vehicles } = require('../models');
                vehicles.findAll({
                    where: { id: parseInt(vehicle.getVariable('sqlID')) }
                }).then((ve) => {
                    if (ve.length == 0) return;
                    const { characters } = require("../models");
                    characters.findAll({
                        where: { id: ve[0].OwnerId }
                    }).then((char) => {
                        if (char.length > 0) {
                            mp.chat.sendMsg(player, `<br><font color="#919191">===============================================<br><font color="yellow"> [Vehicle ID]<font color="orange"> ${vehicle.id}<br><font color="yellow"> [Vehicle Plate]<font color="orange"> ${vehicle.numberPlate}<br><font color="yellow"> [Vehicle Model]<font color="orange"> ${vehicleName}<br> <font color="yellow"> [SQLID]<font color="orange"> ${vehicle.getVariable('sqlID')}<br><font color="yellow"> [Owner Char]<font color="orange"> ${char[0].cName}<br><font color="yellow"> [Distance]<font color="orange"> ${dist} meters<br><font color="yellow"> [Data]<font color="orange"> ${vehicle.getVariable('vehData')}<br><font color="yellow"> [Tyre Status]<font color="orange"> ${vehicle.getVariable('currentTyres')}<br><font color="#919191">================================================`);
                        }
                        else {
                            mp.chat.sendMsg(player, `<br><font color="#919191">================================================<br><font color="yellow"> [Vehicle ID]<font color="orange"> ${vehicle.id}<br><font color="yellow"> [Vehicle Plate]<font color="orange"> ${vehicle.numberPlate}<br><font color="yellow"> [Vehicle Model]<font color="orange"> ${vehicleName}<br><font color="yellow"> [Owner Char]<font color="orange"> None<br> <font color="yellow"> [SQLID]<font color="orange"> ${vehicle.getVariable('sqlID')}<br><font color="yellow"> [Distance]<font color="orange"> ${dist} meters<br><font color="yellow"> [Data]<font color="orange"> ${vehicle.getVariable('vehData')}<br><font color="yellow"> [Tyre Status]<font color="orange"> ${vehicle.getVariable('currentTyres')}<br><font color="#919191">================================================`);
                        }
                        return
                    })
                })
            }
            else {
                mp.chat.sendMsg(player, `<br><font color="#919191">================================================<br><font color="yellow"> [Vehicle ID]<font color="orange"> ${vehicle.id}<br><font color="yellow"> [Vehicle Plate]<font color="orange"> ${vehicle.numberPlate}<br><font color="yellow"> [Vehicle Model]<font color="orange"> ${vehicleName}<br><br><font color="yellow"> [Distance]<font color="orange"> ${dist} meters<br><font color="yellow"> [Data]<font color="orange"> ${vehicle.getVariable('vehData')}<br><font color="yellow"> [Tyre Status]<font color="orange"> ${vehicle.getVariable('currentTyres')}<br><font color="#919191">================================================`);
                return
            }
        }
    },
    'server:CheatDetection': async (player, flag) => {
        var islogged = player.getVariable('loggedIn')
        if (islogged && player.uuid && player.cheatViolations) {
            if (player.isAdmin > 2 && player.adminDuty || player.isAdmin > 7) return
            player.cheatViolations.push(flag);

            if (player.cheatViolations.length > 6) {
                mp.players.forEach((ps) => { if (ps.isAdmin > 0 && ps.getVariable('toggledAdmin') === false) { mp.chat.ac(ps, `!{white}${player.characterName} [${player.id}] was kicked for maximum anticheat violations.`) } });
                mp.chat.ac(player, `You were kicked for maximum anti cheat violations permitted. This action has been logged.`);
                setTimeout(() => {
                    if (player) { player.kick() }
                }, 100);
                return;
            }
            if (flag == 'Disallowed weapon') {
                const date = new Date();
                let currentDate = date.toJSON();
                var fullReason = 'Disallowed Weapon (Anti-Cheat)';
                db.admin_punishments.create({
                    characterId: player.characterId,
                    accountId: player.sqlID,
                    adminName: 'Anti-Cheat',
                    adminId: -1,
                    action: 'BAN',
                    log: 'Weapon Violation (Anti-Cheat)',
                    time: mp.core.getUnixTimestamp(),
                    voided: false
                })

                db.server_bans.create({
                    IP: player.ip,
                    HWID: player.serial,
                    uuid: player.uuid == undefined ? 'Not Known' : player.uuid,
                    socialID: player.rgscId,
                    socialClub: player.socialClub,
                    username: player.name,
                    Reason: fullReason,
                    admin: 'Anti Cheat',
                    LiftTimestamp: -1,
                    issueDate: currentDate.slice(0, 10)
                }).then(() => {
                    db.Accounts.update({
                        banStatus: 1,
                    }, { where: { id: player.sqlID } }).then(() => {
                        player.setVariable('loggedIn', false)
                        player.call('client:loginHandler', ['banned'])
                        player.call('requestRoute', ['ban', true, true]);
                        player.call('requestBrowser', [`appSys.commit('setBanInfo', {
                                username: '${player.name}',
                                IP: '${player.ip}',
                                socialClub: '${player.socialClub}',
                                reason: '${fullReason}',
                                admin: '[Server Anti-Cheat]',
                                issueDate: '${currentDate.slice(0, 10)}',
                                liftTime: 'Ban is permanent'
                            });`])
                        player.setVariable('loggedIn', false)
                        player.dimension = 20;
                        mp.players.forEach((ps) => { if (ps.isAdmin > 0 && ps.getVariable('toggledAdmin') === false) { mp.chat.ac(ps, `!{white}${player.characterName} was banned for Disallowed Weapon. Time: !{#ff4242}permanent!{white}.`) } })
                    }).catch((err) => { mp.log(err) })
                })
                return;
            }
            const { admin_aclogs } = require('../models');
            admin_aclogs.create({
                characterName: player.characterName,
                characterId: player.characterId,
                flag: flag,
                unix: mp.core.getUnixTimestamp()
            })
            mp.log(`${CONFIG.consoleRed}[ANTI CHEAT]${CONFIG.consoleWhite} Detected ${flag} from ${player.characterName} SC: ${player.socialClub} | PING: ${player.ping}`)
            mp.players.forEach((ps) => { if (ps.isAdmin > 1 && ps.getVariable('toggledAdmin') === false) { mp.chat.ac(ps, `!{white}${flag} from ${player.characterName} [${player.id}] !{white} PING: !{#80ff8c}${player.ping}!{white}`) } })
        }
    },
    'server:cheatDetectTarget': async (player, target, flag) => {
        mp.players.forEach(async (ps) => {
            if (ps.isAdmin > 0 && ps.getVariable('toggledAdmin') === false) {
                const fps = await player.callProc('proc:getClientFPS');
                const { admin_aclogs } = require('../models');
                admin_aclogs.create({
                    characterName: target.characterName,
                    characterId: target.characterId,
                    flag: flag,
                    unix: mp.core.getUnixTimestamp()
                })
                mp.chat.ac(ps, `!{white}${flag} from ${target.characterName} [${target.id}] [FPS: !{#54a4ff}${fps}!{white} PING: !{#80ff8c}${target.ping}!{white}]`)
            }
        })
    },
    'damageLog': async (player, sourceEntity, sourcePlayer, targetEntity, weapon, boneIndex, damage) => {
        const { player_damageLogs } = require("../models");
        player_damageLogs.create({
            characterId: player.characterId,
            weapon: weapon,
            sourceId: sourcePlayer.characterId,
            dmg: damage,
            ingameId: player.id,
            unix: mp.core.getUnixTimestamp(),
        }).catch((err) => { mp.log(err) })
    },
    'playerJoin': async (player) => {
        player.fly = false;
        player.handlingR = false;
        player.setVariable('tabbedOut', false)
        function getUnixTimestamp() {
            return Math.round(Date.now() / 1000);
        }
        function formatUnixTimestamp(unixTimestamp) {
            let date = new Date(unixTimestamp * 1000);
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let seconds = date.getSeconds();
            return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
        try {
            const { server_bans } = require('../models');
            const { Op } = require('sequelize');
            server_bans.findAll({
                where: {
                    [Op.or]: [
                        { IP: player.ip },
                        { HWID: player.serial },
                        { socialID: player.rgscId },
                        { socialClub: player.socialClub }
                    ]
                }
            }).then((banCheck) => {
                if (banCheck.toString().length > 0) {
                    player.setVariable('banned', true)
                    if (banCheck[0].LiftTimestamp === -1) {
                        player.setVariable('loggedIn', false)
                        player.call('client:loginHandler', ['banned'])
                        player.call('requestBrowser', [`appSys.commit('setBanInfo', {
                                username: '${banCheck[0].username}',
                                IP: '${banCheck[0].IP}',
                                socialClub: '${banCheck[0].socialClub} Ref=#${banCheck[0].id}',
                                reason: '${banCheck[0].Reason}',
                                admin: '${banCheck[0].admin}',
                                issueDate: '${banCheck[0].issueDate}',
                                liftTime: 'Ban is permanent'
                            });`])
                        player.setVariable('loggedIn', false)
                        player.dimension = 20;
                        return
                    } else {
                        if (banCheck[0].LiftTimestamp > getUnixTimestamp()) {
                            player.setVariable('loggedIn', false)
                            player.call('client:loginHandler', ['banned'])
                            player.call('requestRoute', ['ban', true, true]);
                            player.call('requestBrowser', [`appSys.commit('setBanInfo', {
                                    username: '${banCheck[0].username}',
                                    IP: '${banCheck[0].IP}',
                                    socialClub: '${banCheck[0].socialClub} Ref=#${banCheck[0].id}',
                                    reason: '${banCheck[0].Reason}',
                                    admin: '${banCheck[0].admin}',
                                    issueDate: '${banCheck[0].issueDate}',
                                    liftTime: '${formatUnixTimestamp(banCheck[0].LiftTimestamp)}'
                                });`])
                            player.setVariable('loggedIn', false)
                            player.dimension = 20;
                            return
                        } else {
                            player.setVariable('banned', null)
                            const { server_bans } = require('../models');
                            server_bans.destroy({
                                where: {
                                    id: banCheck[0].id
                                }
                            })
                            const { Accounts } = require('../models')
                            Accounts.update({
                                banStatus: 0
                            },
                                {
                                    where: {
                                        username: banCheck[0].username
                                    }
                                }).catch((err) => { mp.log(err) })
                        }
                    }
                }
            }).catch((err) => { mp.log(err) })
        } catch (e) { mp.log(e) }
    },
});