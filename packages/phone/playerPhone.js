const LZString = require('../CoreSystem/compression');
const db = require('../models');
const CONFIG = require('../CoreSystem/chatformatconf').CONFIG;
const services = ['police', 'ems'];

mp.events.add({
    'phoneBatteryRemove': (player) => {
        if(player.getVariable('loggedIn') && player.getVariable('phoneBattery') && !player.getVariable('phoneBattery') <= 0 && !player.adminDuty) {
            player.setVariable('phoneBattery', player.getVariable('phoneBattery') - 1);
            player.phoneData[1].battery = player.getVariable('phoneBattery');
            db.characters.update({
                phoneData: player.phoneData
            }, { where: {id: player.characterId} });
        }
    },
    'updateAppData': (player, app) => {
        if(!player.getVariable('loggedIn')) return;
        switch(app) {
            case 'banking':
            {
                db.banking_logs.findAll({ where: {OwnerId: player.characterId} }).then(log => {
                    log.length > 0 ? log = log.sort((a, b) => b.time - a.time) : "" ;

                    player.call('requestBrowser', [`appSys.commit('setAppData', {
                        characterName: '${player.characterName}',
                        moneyAmount: ${player.moneyAmount},
                        cashAmount: ${player.cashAmount},
                        bankingLogs: '${JSON.stringify(log)}'
                    })`]);
                })
            }
        }
    },
    'sendMoneyToPlayer': (player, data) => {
        if(!player.getVariable('loggedIn')) return;
        new Promise((resolve, reject) => {
            if(data) { resolve(data) }
            else { reject() }
        }).then((data) => {
            data = JSON.parse(data);

            db.characters.findAll({ where: {cName: data.selectedPlayer } }).then(char => {
                if(char.length > 0) {
                    var interest = 1.03;

                    if(char[0].id == player.characterId) return mp.chat.err(player, `You cannot transfer money to yourself`);
                    var calc = player.moneyAmount - parseInt(data.moneyEntered) ;
                    if(calc < 0) return mp.chat.err(player, `You have insufficient funds to complete this action`);
                    player.moneyAmount = calc;
                    player.setVariable('moneyValue', calc);

                    db.characters.update({
                        moneyAmount: calc
                    }, { where: {id: player.characterId} }).catch(err => mp.log(err));

                    db.characters.update({
                        moneyAmount: char[0].moneyAmount + parseInt(Math.floor(data.moneyEntered/interest))
                    }, { where: {id: char[0].id} }).catch(err => mp.log(err));

                    mp.core.addBankingLog(player.characterId, 'Cash Send', 0, parseInt(data.moneyEntered));
                    mp.core.addBankingLog(char[0].id, 'Cash Send', 1, parseInt(Math.floor(data.moneyEntered/interest)));

                    mp.players.forEach(ps => {
                        if(ps.characterId == char[0].id) {
                            ps.moneyAmount = ps.moneyAmount + data.moneyAmount;
                            ps.setVariable('moneyValue', ps.moneyAmount);

                            player.call('requestBrowser', ['gui.notify.clearAll()']);
                            mp.chat.success(player, `${player.characterName} has just transferred you $${parseInt(Math.floor(data.moneyEntered/interest)).toLocaleString('en-US')}.`);
                        }
                    })

                    player.call('requestBrowser', ['gui.notify.clearAll()']);
                    mp.chat.success(player, `You transferred a total of $${parseInt(Math.floor(data.moneyEntered/interest)).toLocaleString('en-US')} to ${char[0].cName}`);

                    mp.events.call('updateAppData', player, 'banking');
                    return;
                } else {
                    mp.chat.err(player, `No character was found.`);
                }
            })

        })
    },
    'phoneAnim': (player, tog) => {
        tog ? player.setVariable('phoneAnim', true) : player.setVariable('phoneAnim', null);
    },
    'phoneCall:handler': (player, callNum) => {
        if(!parseInt(callNum) || !player.getVariable('loggedIn')) return;
        callNum = parseInt(callNum);

        if(player.emergencyCall || player.emergencyService || player.getVariable('phoneAnim:call')) return mp.chat.err(player, `You already have an active phone call cancel it before starting a new one.`);


        db.phone_logs.create({
            OwnerId: player.characterId,
            action: 'Call',
            log: `Call to ${callNum}`,
            number: callNum,
            time: mp.core.getUnixTimestamp()
        }).catch(err => {mp.log(err)});

        switch(callNum) {
            case 911:
            {
                player.setVariable('phoneAnim:call', true);
                player.emergencyCall = true;
                player.outputChatBox(`!{#008AD8}[Dispatch]!{white} You have called 911. Type one of the following services in chat: ${services.join(' , ')} or type 'both' in order to request both services. You can also type 'cancel' in order to cancel your call to emergency services. `);
                break;
            }
            default:
            {
                player.setVariable('phoneAnim:call', true);
                db.characters.findAll({}).then(char => {
                    char.forEach(phone => {
                        if(phone.phoneData[0].phoneNumber == callNum) {
                            mp.players.forEach(ps => {
                                if(ps.characterId == char[0].id) {
                                    mp.chat.success(player, `Number was found.`);
                                }
                            })
                        }
                    })
                })
                break;
            }
        }
    },
    'playerChat': (player, message) => {
        if(player.emergencyCall) {
            if(message == 'cancel') {
                player.emergencyCall = null;
                player.outputChatBox(`!{#008AD8}[Dispatch]!{white} You have !{red}cancelled!{white} your call to emergency services.`);
                player.setVariable('phoneAnim:call', null);
            }

            services.forEach(service => {
                if(service === message) {
                    player.emergencyCall = null;
                    player.emergencyService = service;
                    player.outputChatBox(`!{#008AD8}[Dispatch]!{white} You have called the service ${service} use /calldesc to describe the situation.`);
                    return;
                }
            })
        }
    },
    'fetchRecents': (player) => {
        if(!player.getVariable('loggedIn')) return;
        db.phone_logs.findAll({ where: {OwnerId: player.characterId} }).then(phoneCall => {
            phoneCall.length > 0 ? phoneCall = phoneCall.sort((a, b) => b.time - a.time) : "" ;

            player.call('requestBrowser', [`appSys.commit('setPhoneRecents', {
                data: ${JSON.stringify(phoneCall)}
            })`]);
        })
    }
})

mp.cmds.add(['calldesc'], async(player, calldesc) => {
    if(!calldesc) return mp.chat.info(player, `Use: /calldesc [description]`);
    if(player.emergencyService) {
        player.emergencyService = null;
        player.outputChatBox(`!{#008AD8}[Dispatch]!{white} Your call has been registered succesfully please be patient whilst a unit arrives to your location.`);
        player.setVariable('phoneAnim:call', null);
        return;
    }
    mp.chat.err(player, `You do not have an active call to dispatch.`);
})

mp.cmds.add(['rp'], async(player, arg) => {
    if(arg != null) return mp.chat.info(player, `Use: /rp`);
    if(player.isAdmin > 7) {
        player.setVariable('phoneBattery', 100);
        player.phoneData[1].battery = player.getVariable('phoneBattery');
        db.characters.update({
            phoneData: player.phoneData
        }, { where: {id: player.characterId} });
        mp.chat.aPush(player, `You have recharged your phone.`);
        return;
    }
    mp.chat.err(player, `${CONFIG.noauth}`);
})