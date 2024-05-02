const db = require('../models');
const CONFIG = require('../CoreSystem/chatformatconf.js').CONFIG;

mp.events.add({
    'packagesLoaded': () => {
        loadFuelStations();
    },
    'playerEnterColshape': (player, shape) => {
        if (shape.getVariable('fuelPump')) {
            player.data.pumpPush = shape.getVariable('drawPosition');

            var data = { id: shape.getVariable('fuelPump'), literage: shape.getVariable('fuelLevel'), litreCost: shape.getVariable('litreCost') };
            player.setVariable('fuelPumpData', JSON.stringify(data));

            player.getVariable('devdebug') ? player.outputChatBox(`Entered fuel pump with ID: ${shape.getVariable('fuelPump')}`) : '_';
        }
    },
    'playerExitColshape': (player, shape) => {
        if (shape.getVariable('fuelPump')) {
            player.getVariable('fuelPumpData') ? player.setVariable('fuelPumpData', null) : '_';
            player.getVariable('devdebug') ? player.outputChatBox(`Exited fuel pump with ID: ${shape.getVariable('fuelPump')}`) : '_';
        }
    },
    'fuel:anim': (player) => {
        player.setVariable('fuelAnimData', true);
    },
    'save:vehFuel': (player, veh, fuel, price, literage) => {
        player.setVariable('fuelAnimData', null);
        if (price == 0) return;
        if (player.getVariable('fuelPumpData') && veh.getVariable('sqlID')) {
            fuel > 100 ? fuel = 100 : '_';

            var vsqlid = veh.getVariable('sqlID');
            var currentVehicle = veh;
            var currentPrice = Math.trunc(price);
            var calc = player.moneyAmount - currentPrice;
            var playerData = JSON.parse(player.getVariable('fuelPumpData'))

            if (calc < 0) return mp.chat.err(player, `You have insufficient funds to cover this payment!`);
            else {

                db.player_fuelStations.findAll({ where: { id: playerData.id } }).then((fuelStation) => {
                    if (fuelStation.length > 0) {
                        if ((fuelStation[0].fuelAmount - literage) <= 0) return mp.chat.err(player, `This fuel station does not have enough fuel to refuel this vehicle.`);
                        else {
                            player.moneyAmount = calc;

                            db.characters.update({ moneyAmount: calc }, { where: { id: player.characterId } });
                            db.vehicles.findAll({ where: { id: veh.getVariable('sqlID') } }).then((veh) => {
                                if (veh.length > 0) {
                                    var vehData = JSON.parse(veh[0].data);
                                    vehData.fuelLevel = fuel;
                                    currentVehicle.setVariable('vehData', JSON.stringify(vehData));
                                    db.player_fuelStations.findAll({ where: { id: playerData.id } }).then((fuelStation) => {
                                        if (fuelStation.length > 0) { db.player_fuelStations.update({ fuelAmount: (fuelStation[0].fuelAmount - literage) }, { where: { id: playerData.id } }).catch((err) => { mp.log(err) }) };
                                    })
                                    db.vehicles.update({ data: JSON.stringify(vehData) }, { where: { id: vsqlid } });
                                    mp.chat.success(player, `You have paid a total of $${price.toLocaleString('en-US')} on ${roundNum(literage, 2)} liters to refuel vehicle [${currentVehicle.numberPlate}].`)
                                }
                            })
                        }
                    }
                })

            }
        }
    }
})

mp.cmds.add(['fuelstation'], async (player, fullText, option, ...secondOption) => {
    if (!option) return mp.chat.info(player, `Use: /fuelstation [add/modifiy/remove/refuel/empty] [modifiy/remove/refuel/empty: SQLID | add: name] [modifiy: pumpposition (bool) ]`)
    if (player.isAdmin > 7) {
        const allParams = ['add', 'modifiy', 'remove', 'refuel', 'empty']
        switch (option) {
            case 'add':
                {
                    if (!secondOption[0]) return mp.chat.err(player, `Missing parameter [name]`);
                    db.player_fuelStations.create({
                        OwnerId: player.characterId,
                        name: secondOption[0],
                        position: JSON.parse(player.position),
                        fuelAmount: 23400,
                        litreCost: 2.64,
                        moneyAmount: 0,
                        pumpPositions: [
                            player.position
                        ]
                    }).then((info) => {
                        var sqlid = info.id;
                        mp.chat.aPush(player, `Created new fuel station with SQLID: ${sqlid} NAME: ${secondOption[0]}`);
                        loadFuelStations(), mp.chat.aPush(player, "Fuel stations have been reloaded.")
                    })

                    break;
                }
            case 'modifiy':
                {
                    if (!secondOption[0]) return mp.chat.err(player, `Missing parameter [sqlid]`);
                    db.player_fuelStations.findAll({ where: { id: secondOption[0] } }).then((fuelStation) => {
                        if (fuelStation.length > 0) {
                            var pumpData = fuelStation[0].pumpPositions;

                            if (pumpData.length == 0 || pumpData == '[]') {
                                var newData = `[` + JSON.stringify(player.position) + `]`;
                                pumpData = newData;

                                db.player_fuelStations.update({
                                    pumpPositions: JSON.parse(pumpData)
                                }, { where: { id: secondOption[0] } }).then(() => {
                                    mp.chat.aPush(player, `Added new pump position for fuel station with SQLID: ${fuelStation[0].id} Pump Position index is ${pumpData.indexOf(JSON.stringify(player.position))}`);
                                    return;
                                }).then(() => { loadFuelStations() })
                                return;
                            } else {
                                pumpData.push(player.position);

                                db.player_fuelStations.update({
                                    pumpPositions: pumpData
                                }, { where: { id: secondOption[0] } }).then(() => {
                                    mp.chat.aPush(player, `Added new pump position for fuel station with SQLID: ${fuelStation[0].id} Pump Position index is ${pumpData.indexOf(JSON.stringify(player.position))}`);
                                    return;
                                }).then(() => { loadFuelStations() })
                                return;
                            }
                        }
                        else return mp.chat.err(player, `No fuel station with that SQLID was found.`)
                    })

                    break;
                }
            case 'remove':
                {
                    if (!secondOption[0]) return mp.chat.err(player, `Missing parameter [sqlid]`);
                    db.player_fuelStations.findAll({ where: { id: secondOption[0] } }).then((fuelstation) => {
                        if (fuelstation.length > 0) {
                            db.player_fuelStations.destroy({ where: { id: secondOption[0] } }).then(() => {
                                mp.chat.aPush(player, `Deleted fuel station with SQLID: ${secondOption[0]}`)
                                loadFuelStations();
                            })
                        }
                        else return mp.chat.err(player, `No fuel station with that SQLID was found.`);
                    }).catch((err) => { mp.log(err) });

                    break;
                }
            case 'empty':
                {
                    if (!secondOption[0]) return mp.chat.err(player, `Missing parameter [sqlid]`);
                    db.player_fuelStations.findAll({ where: { id: secondOption[0] } }).then((fuelstation) => {
                        if (fuelstation.length > 0) {
                            mp.colshapes.forEach((col) => {
                                if (col.getVariable('fuelPump')) {
                                    col.setVariable('fuelLevel', 0);
                                    db.player_fuelStations.update({
                                        fuelAmount: 0
                                    }, { where: { id: col.getVariable('fuelPump') } }).catch((err) => { mp.log(err) });
                                }
                            })
                            mp.chat.aPush(player, `You emptied fuel station with SQLID: ${secondOption[0]}`);
                        }
                    })
                    break;
                }
            case 'refuel':
                {
                    if (!secondOption[0]) return mp.chat.err(player, `Missing parameter [sqlid]`);
                    db.player_fuelStations.findAll({ where: { id: secondOption[0] } }).then((fuelstation) => {
                        if (fuelstation.length > 0) {
                            mp.colshapes.forEach((col) => {
                                if (col.getVariable('fuelPump')) {
                                    col.setVariable('fuelLevel', 23400);
                                    db.player_fuelStations.update({
                                        fuelAmount: 23400
                                    }, { where: { id: col.getVariable('fuelPump') } }).catch((err) => { mp.log(err) });
                                }
                            })
                            mp.chat.aPush(player, `You refuelled fuel station with SQLID: ${secondOption[0]}`);
                        }
                    })
                    break;
                }
            default:
                mp.chat.err(player, `Enter a valid parameter from [${allParams.join('/')}]`)
                break;
        }
        return
    }
    mp.chat.err(player, `${CONFIG.noauth}`)
})


async function loadFuelStations() {
    db.player_fuelStations.findAll({}).then((fuelStation) => {
        if (fuelStation.length > 0) {
            fuelStation.forEach((station) => {
                const pumpPositions = station.pumpPositions;

                pumpPositions.length == 0 || pumpPositions == '[]' ? '' : pumpPositions.forEach((pos) => {
                    var pumpCol = mp.colshapes.newRectangle(pos.x, pos.y, 2, 2, 0);
                    pumpCol.setVariable('fuelPump', station.id);
                    pumpCol.setVariable('fuelLevel', station.fuelAmount);
                    pumpCol.setVariable('litreCost', station.litreCost);

                    var posObj = {
                        x: pos.x,
                        y: pos.y,
                        z: pos.z
                    }

                    pumpCol.setVariable('drawPosition', JSON.stringify(posObj))

                })

                mp.blips.new(361, new mp.Vector3(station.position.x, station.position.y, station.position.z),
                    {
                        name: 'Petrol Station',
                        color: 59,
                        shortRange: true,
                    });

            })
            mp.log(`${CONFIG.consoleTurq}[Fuel Stations]${CONFIG.consoleWhite} All ${fuelStation.length} ${fuelStation.length == 1 ? 'fuel station were loaded successfully' : 'fuel stations where loaded successfully.'}`)
        }
    })
}

function roundNum(x, y) {
    var factor = Math.pow(10, y + 1);
    x = Math.round(Math.round(x * factor) / 10);
    return x / (factor / 10);
}