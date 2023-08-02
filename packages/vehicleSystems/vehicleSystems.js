const db = require('../models');
require('../CoreSystem/coreApi');
const LZString = require('../CoreSystem/compression');

class vehicleSystems {
    constructor() {
        this.db = require('../models');
        this.CONFIG = require('../CoreSystem/chatformatconf.js').CONFIG;

        mp.events.add({
            'syncSirens': (player, vehicle) => {
                if (vehicle && mp.vehicles.exists(vehicle.id)) vehicle.setVariable('silentMode', !vehicle.getVariable('silentMode'))
            },
            'entityCreated': (entity) => {
                if (entity.type == 'vehicle') {
                    entity.doors = [0, 0, 0, 0, 0, 0, 0]
                }
            },
            'server.vehicles.sync.doors': (player, vehicle, doors) => {
                vehicle.doors = JSON.parse(doors);
                mp.players.call(player.streamedPlayers, 'client.vehicles.sync.doors', [vehicle, JSON.stringify(vehicle.doors)]);
                player.call('client.vehicles.sync.doors', [vehicle, JSON.stringify(vehicle.doors)]);
            },
            'server.vehicles.get.sync.doors': (player, vehicle) => {
                if (typeof vehicle.doors == 'object') {
                    player.call('client.vehicles.sync.doors', [vehicle, JSON.stringify(vehicle.doors)]);
                }
            },
            'shutDoors': (vehicle) => {
                if(typeof vehicle.doors == 'object') {
                    mp.players.call('client.door.shut', [vehicle, JSON.stringify(vehicle.doors)]);
                }
            },
            "fpsync.update": (player, camPitch, camHeading) => {
                mp.players.call(player.streamedPlayers, "fpsync.update", [player.id, camPitch, camHeading]);

            },
            "pointingStop": (player) => {
                player.stopAnimation();
            },
            "toggleIndicator": (player, indicatorID) => {
                let vehicle = player.vehicle;
                if (vehicle) {
                    switch (indicatorID) {
                        case 0:
                            {
                                vehicle.data.IndicatorRight = !vehicle.data.IndicatorRight;
                            }
                        break;

                        case 1:
                            {
                                vehicle.data.IndicatorLeft = !vehicle.data.IndicatorLeft;
                                break;
                            }
                        default:
                            {
                                break;
                            }
                    }
                }
            },
            'engine:start': (player) => {
                if(player.vehicle) {
                    player.vehicle.setVariable('engineStatus', true);
                }
            },
            'engine:stop': (player) => {
                if(player.vehicle) {
                    player.vehicle.setVariable('engineStatus', false);
                }
            },
            'seatBelt:on': (player) => {
                player.setVariable('seatBeltStatus', true);
            },
            'seatBelt:off': (player) => {
                player.setVariable('seatBeltStatus', false);
            },
            'setPedSeat': (player) => {
                player.setVariable('seatID', player.seat);
            },
            'updateVehicleHealth': (player) => {
                if(player.vehicle && player.vehicle.getVariable('sqlID')) {
                  if(!player.vehicle) return;
                  this.db.vehicles.findAll({ where: {id: player.vehicle.getVariable('sqlID')} }).then((veh) => {
                        if(veh.length > 0 && !(player.vehicle.engineHealth <= 0)) {
                            var currentData = JSON.parse(veh[0].data);
                            currentData.Health = player.vehicle.engineHealth;
                            this.db.vehicles.update({ data: JSON.stringify(currentData) }, { where: {id: player.vehicle.getVariable('sqlID')} }).catch((err) => {mp.log(err)})
                        }
                    })
                }
            },
            'playerEnterVehicle': (player, vehicle, seat) => {
              if(vehicle.getVariable('isLocked') && !player.adminDuty && !player.isAdmin > 7) {
                player.removeFromVehicle();
              }
            },
            'updateDistance': (player, vehicle, distance) => {
                if(vehicle.getVariable('sqlID') && vehicle.getVariable('vehData')) {
                    var currentData = JSON.parse(vehicle.getVariable('vehData'));
                    currentData.DistanceKm = currentData.DistanceKm + distance/1000;
                    this.db.vehicles.update({ data: JSON.stringify(currentData) }, { where: {id: vehicle.getVariable('sqlID')} }).catch((err) => {mp.log(err)});
                    vehicle.setVariable('vehData', JSON.stringify(currentData));
                }
            },
            'updateTyreStatus': (player, vehicle, arr) => {
                if(vehicle.getVariable('sqlID') && player.getVariable('loggedIn')) {
                    vehicle.setVariable('currentTyres', arr);
                    this.db.vehicles.update({
                        tyreStatus: arr
                     }, { where: {id: vehicle.getVariable('sqlID')} }).catch((err) => {mp.log(err)});
                }
            },
            'changeVehicleFuel': async (player, vehicle, speed, vehClass) => {
                if (vehicle && speed > 0 && vehicle.getVariable('sqlID')) {
                    this.db.vehicles.findAll({ where: { id: vehicle.getVariable('sqlID') } }).then((ve) => {
                        if (ve.length > 0 && ve[0].data) {
                            this.db.server_fuelMultipliers.findAll({ where: { vehicleClass: vehClass } }).then((vehInfo) => {
                                if(vehInfo.length > 0) {
                                    const speedChanges = [100, 139, 160, 200];
                                    var newData = JSON.parse(ve[0].data);
                                    var fuelDifference = vehInfo[0].multiplier;
                                    var indx = null;

                                    speedChanges.forEach((speedvals, i) => {
                                        if(speed > speedvals) {
                                            indx = i;
                                        }
                                    })

                                    indx != null ? fuelDifference = fuelDifference + speedChanges[indx]*0.003 : fuelDifference;
                                    newData.fuelLevel = JSON.parse(ve[0].data).fuelLevel - fuelDifference;

                                    if(newData.fuelLevel <= 0) { newData.fuelLevel = 0; }

                                    vehicle.setVariable('vehData', JSON.stringify(newData));
                                    this.db.vehicles.update({ data: JSON.stringify(newData) }, { where: {id: vehicle.getVariable('sqlID')} }).catch((err) => {mp.log(err)})
                                    return;
                                }
                                else {
                                    mp.log(`Vehicle with fuel multipler was not found in database. Vehicle class is ${vehClass}`)
                                    var fuelData = JSON.parse(vehicle.getVariable('vehData'))
                                    fuelData.fuelLevel -= 0.07;

                                    vehicle.setVariable('vehData', JSON.stringify(fuelData));
                                    this.db.vehicles.update({ data: JSON.stringify(fuelData) }, { where: {id: vehicle.getVariable('sqlID')} }).catch((err) => {mp.log(err)})
                                    return;
                                }
                            })
                        }
                        else {
                            vehicle.setVariable('vehData', `{"fuelLevel": 0, "Health": 100, "DistanceKm": 0}`)
                            this.db.vehicles.update({
                                data: `{"fuelLevel": 0, "Health": 100, "DistanceKm": 0}`
                            }, { where: { id: vehicle.getVariable('sqlID') } })
                        }
                    }).catch((err) => { mp.log(err); })
                }
            },
            'sellVehicle': async(player, data) => {
              if(!player.getVariable('loggedIn') || !data) return;
              data = LZString.decompress(data);
              data = JSON.parse(data);
              if(!mp.players.at(data.playerId)) return mp.chat.err(player, `This player is not online`);
              if(data.playerId == player.id) return mp.chat.err(player, `You cannot sell this vehicle to yourself`);
              if (data.sellPrice == 0) return mp.chat.err(player, `You cannot sell a vehicle for $0`);
              var foundP = false;
              mp.players.forEachInRange(player.position, 20,
                async(ps) => {
                  if(ps.vehicle && player.vehicle && ps.vehicle.getVariable('sqlID') == player.vehicle.getVariable('sqlID') && ps.id == data.playerId && player.vehicle.getVariable('sqlID') == data.vehicleId) {
                    foundP = true;
                    const currentRoute = await ps.callProc('proc:getRoute')
                    if (currentRoute == 'modal' && ps.getVariable('vehOffer')) return mp.chat.err(player, `Player is currently reviewing a vehicle offer.`)
                    db.vehicles.findAll({ where: {id: data.vehicleId, OwnerId: player.characterId} }).then(async(veh) => {
                      if(veh.length > 0) {
                        var offerObj = {
                          vehicleId: veh[0].id,
                          OwnerId: player.characterId,
                          price: data.sellPrice,
                          OfferTime: mp.core.getUnixTimestamp(),
                          vehicleName: veh[0].vehicleModelName
                        }
                        player.call('closeRoute');
                        ps.setVariable('vehOffer', JSON.stringify(offerObj));
                        ps.call('createModalMenu', ['fa-solid fa-car', 30, 'Vehicle Offer', `Player [${player.id}] offered you their ${veh[0].vehicleModelName} <font color="#ffef63">[${veh[0].numberPlate}]</font> for <font color="#7bff63">$${parseInt(data.sellPrice).toLocaleString('en-US')}</font>`, 'Deny Vehicle', 'Accept Vehicle', 'client:denyVeh', 'client:buyVeh', `${ps.getVariable('vehOffer')}`, `${ps.getVariable('vehOffer')}`])
                        mp.chat.success(player, `You offered your vehicle [${veh[0].numberPlate}] for $${parseInt(data.sellPrice).toLocaleString('en-US')} to Player [${ps.id}]`)

                      }
                    })
                  }
                })
                !foundP ? mp.chat.err(player, `No player was found in within range and inside of the vehicle you want to sell.`) : "";
            },
            'acceptVehicleOffer': (player) => {
              if (!player.vehicle || !player.vehicle.getVariable('sqlID') == JSON.parse(player.getVariable('vehOffer')).vehicleId) return mp.chat.err(player, `You must be in the vehicle offered to accept the offer.`)
              if (player.getVariable('vehOffer') && player.vehicle && player.vehicle.getVariable('sqlID') == JSON.parse(player.getVariable('vehOffer')).vehicleId && JSON.parse(player.getVariable('vehOffer')).OwnerId != player.characterId) {
                var json = JSON.parse(player.getVariable('vehOffer'))
                if ((mp.core.getUnixTimestamp() - json.OfferTime) > 65) { return mp.players.forEach((ps) => { if (ps.isAdmin > 0) { mp.chat.ac(player, `!{red}[SEVERE]!{white} ${player.characterName} [${player.id}] attempted to trigger a !{orange}VEHICLE / MONEY DUPE EVENT!{white} from the server whilst not having correct authorization to do so.`) } }) }
                var priceCalc = player.moneyAmount - json.price;
                if (priceCalc < 0) { return player.call('requestBrowser', [`gui.notify.showNotification("You have insufficient funds for this purchase!", false, true, 15000, 'fa-solid fa-circle-exclamation')`]) }
                else {
                  player.moneyAmount = priceCalc;
                  db.characters.findAll({ where: { id: json.OwnerId } }).then((ps) => {
                    var newMoney = ps[0].moneyAmount + parseInt(json.price)
                    mp.players.forEach(ps => {if(ps.characterId == json.OwnerId) {ps.setVariable('moneyValue', newMoney);}})
                    db.characters.update({
                      moneyAmount: parseInt(newMoney)
                    }, { where: { id: json.OwnerId } }).catch(err => {mp.log(err)})
                  })

                  db.characters.update({
                    moneyAmount: priceCalc
                  }, { where: { id: player.characterId } }).then(() => {
                    player.setVariable('moneyValue', priceCalc);
                    mp.chat.success(player, `You brought vehicle [${player.vehicle.numberPlate}] for $${json.price.toLocaleString('en-US')}`)
                    mp.players.forEach((ps) => {
                      if (ps.getVariable('loggedIn') && ps.vehicle == player.vehicle && ps.characterId == json.OwnerId) {
                        mp.chat.success(ps, `Player [${player.id}] brought your vehicle [${ps.vehicle.numberPlate}] for $${json.price.toLocaleString('en-US')}`)
                        ps.moneyAmount = ps.moneyAmount + parseInt(json.price)
                      }
                    })
                    db.vehicles.update({
                      OwnerId: player.characterId
                    }, { where: { id: player.vehicle.getVariable('sqlID') } })
                  }).catch((err) => { mp.log(err) })
                }
              }
            },
            'try:vehicle': async (player) => {
                mp.vehicles.forEachInRange(player.position, 4,
                    async (vehicle) => {
                        if (player.adminDuty && vehicle.locked) {
                            this.unlockVeh(player, vehicle);
                            return;
                        }
                        if (player.adminDuty && !vehicle.locked) {
                            this.lockVeh(player, vehicle);
                            return
                        }
                        if (vehicle.getVariable('sqlID')) {
                            this.db.vehicles.findAll({ where: { id: vehicle.getVariable('sqlID') } }).then((ve) => {
                                if (ve.length > 0 && ve[0].OwnerId == player.characterId) {
                                    if (vehicle.locked) { this.unlockVeh(player, vehicle) }
                                    else if (!vehicle.locked) { this.lockVeh(player, vehicle) }
                                }
                                else {
                                    this.db.vehicle_keys.findAll({ where: { vehicleId: vehicle.getVariable('sqlID'), characterId: player.characterId } }).then((ve) => {
                                        if (ve.length > 0) {
                                            if (vehicle.locked) { this.unlockVeh(player, vehicle) }
                                            else if (!vehicle.locked) { this.lockVeh(player, vehicle) }
                                        }
                                    })
                                }
                            })
                        }
                    }
                )
            },
            'keyDataUpdate': (player, id) => {
                this.db.vehicle_keys.findAll({ where: {id: id} }).then((vehkey) => {
                    if(vehkey.length > 0) {
                        this.db.vehicle_keys.destroy({ where: {id: id} }).catch((err) => {mp.log(err)});
                    }
                })
            },
            'vehicleAddKey': (player, data) => {
              data = LZString.decompress(data);
                if(data.length == 0 || !player.getVariable('loggedIn')) return mp.core.msgAdmins(`Potential middleware attack from player [${player.id}] Logged In: ${player.getVariable('loggedIn')} SQLID: ${player.characterId}`);
                var currentData = JSON.parse(data);
                this.db.vehicles.findAll({ where: {id: currentData.vehicleId, OwnerId: player.characterId} }).then((vehicle) => {
                    if(vehicle.length > 0) {
                        var targetPlayer = mp.players.at(currentData.playerId);
                        if(targetPlayer == player) return mp.chat.err(player, `You cannot give keys to yourself.`);
                        if(!targetPlayer || !targetPlayer.getVariable('loggedIn')) return mp.chat.err(player, `This player is not online`);
                        if(player.dist(targetPlayer.position) > 20) return mp.chat.err(player, `This player is not in range`);
                        else {
                            this.db.vehicle_keys.findAll({ where: {vehicleId: currentData.vehicleId, characterId: targetPlayer.characterId } }).then((vehKey) => {
                                if(vehKey.length > 0) {
                                    return mp.chat.err(player, `This player already has keys to this vehicle`);
                                } else {
                                    this.db.vehicle_keys.create({
                                        nickName: currentData.playerNick,
                                        vehicleId: currentData.vehicleId,
                                        characterId: targetPlayer.characterId
                                    });
                                    player.call('closeRoute');
                                    mp.chat.success(player, `You gave a set of keys to Player [${targetPlayer.id}]`);
                                    mp.chat.info(targetPlayer, `You were given a set of vehicle keys from Player [${player.id}]`);
                                }
                            })
                        }
                    }
                })
            },
            'updateDirtLevel': (player, vehicle, level) => {
              if(vehicle.getVariable('sqlID') && mp.vehicles.at(vehicle.id)) {
                db.vehicles.findAll({ where: {id: vehicle.getVariable('sqlID')} }).then(veh => {
                  if(veh.length > 0) {
                    db.vehicles.update({
                      dirtLevel: level
                    }, { where: {id: vehicle.getVariable('sqlID')} });
                    vehicle.setVariable('dirtLevel', level);
                  }
                })
              }
            },
            'attachToTrunk': (player, vehicle) => {
                if(player.getVariable('loggedIn') && !vehicle.getVariable('lockStatus') && player.dist(vehicle.position) < 10) {
                    console.log(`${player.getVariable('carryInfo')}`);
                    if(player.getVariable('carryInfo')) {
                        var target = player.getVariable('carryInfo')
                        if(!target) return;
                        mp.events.call('player:stopCarry', player);
                        target.setVariable('trunkAttach', vehicle.id);
                        player.call('notifCreate', [`~w~You have placed player [${target.id}] inside of this vehicle's trunk.`]);
                        target.call('notifCreate', [`~w~You were placed into this vehicle's trunk by player [${player.id}].`]);
                        return;
                    }

                    player.setVariable('trunkAttach', vehicle.id);
                    player.call('notifCreate', [`~w~You have entered this vehicle's trunk use ~y~X~w~ to exit it`]);
                }
            },
            'removeFromTrunk': (player) => {
                if(player.getVariable('trunkAttach')) {
                    player.setVariable('trunkAttach', null);
                    player.call('notifCreate', [`~w~You have ~g~exited~w~ this vehicle's trunk.`]);
                }
            },
            'setvehStall': (player, vehicle, toggle) => {
                if (!vehicle) return;
                if (toggle) {
                    player.setVariable('stalledVehicle', vehicle);
                    vehicle.setVariable('isStalled', true)
                }
                else if (!toggle) {
                    player.setVariable('stalledVehicle', null);
                    vehicle.setVariable('isStalled', false)
                }
            },
            'playerQuit': (player) => {
                if(player.getVariable('stalledVehicle')) {
                    var targetVeh = player.getVariable('stalledVehicle');
                    targetVeh && targetVeh.dist(player.position) <= 6 && targetVeh.getVariable('isStalled') ? targetVeh.setVariable('isStalled', false) : '_' ;
                }
            },
            'endLock:anim': (player) => {
                player.setVariable('lockAnim:data', false);
            },
            'manageVehicle': (player, id) => {
                if(!player.getVariable('loggedIn')) return;
                this.db.vehicles.findAll({ where: {OwnerId: player.characterId, id: id} }).then((vehicle) => {
                    if(vehicle.length > 0) {
                        player.call('requestBrowser', [`appSys.commit('flushVehData')`]);
                        player.call('requestRoute', ['myvehicles', true, true]);
                        var veh = vehicle[0];

                        let data = {
                            sqlID: veh.id,
                            spawned: veh.spawned,
                            location: JSON.parse(veh.position),
                            plate: veh.numberPlate,
                            modelName: veh.vehicleModelName,
                            model: veh.vehicleModel,
                            fuelLevel: JSON.parse(veh.data).fuelLevel,
                            distance: JSON.parse(veh.data).DistanceKm,
                            lastActive: veh.updatedAt,
                            createdAt: veh.createdAt
                        }

                        player.call('requestBrowser', [`appSys.commit('setVehicleData', {
                            vehicleData: '${JSON.stringify(data)}',
                        });`]);

                        this.db.vehicle_keys.findAll({ where: {vehicleId: id} }).then((carkey) => {
                            if(carkey.length > 0) {
                                carkey.forEach((key) => {
                                    player.call('requestBrowser', [`appSys.commit('setKeyData', {
                                        keyData: ${JSON.stringify(key)}
                                    });`]);
                                })
                            }
                        })
                    }
                })
            },
            'requestList': (player) => {
                if(!player.getVariable('loggedIn')) return;
                this.db.vehicles.findAll({ where: {OwnerId: player.characterId} }).then((vehicles) => {
                    if(vehicles.length > 0) {
                        player.call('requestRoute', ['listMenu', true, true]);
                        vehicles.forEach((veh) => {
                            player.call('requestBrowser', [`appSys.commit('updateLists', {
                                menuName: 'Your vehicles',
                                menuSub: 'You have ${vehicles.length} vehicles.',
                                tableOne: 'Name',
                                icon: 'fa-solid fa-car',
                                name: '${player.adminDuty ? `<font style="color:grey; font-size:15px; float:left;">#${veh.id}</font> ${veh.vehicleModelName}` : veh.vehicleModelName}',
                                id: ${veh.id},
                                button: true,
                                funcs: 'manageVehicle'
                              });`]);
                        })
                        return;
                    } else {
                        mp.chat.err(player, `You do not have any vehicles.`);
                        return;
                    }
                })
            }
        }),

        mp.cmds.add(['sellvehicle', 'sellv', 'vsell'], async (player, fullText, id, ...amount) => {
          if (!id || !amount || amount.length == 0) return mp.chat.info(player, `Use: /sellvehicle [Name/ID] [amount]`)
          if (amount == 0) return mp.chat.err(player, `You cannot sell a vehicle for $0`);
          if (id.match(/\W/) || amount.toString().match(/\W/) || !Number.isInteger(parseInt(amount))) return mp.chat.err(player, `Special characters are not permitted within arguments for this command.`)
          var targetPlayer = mp.core.idOrName(player, id);
          if (targetPlayer && player.vehicle && targetPlayer.vehicle && targetPlayer.vehicle == player.vehicle && targetPlayer.vehicle.getVariable('sqlID')) {
            if (targetPlayer.id == player.id) return mp.chat.err(player, `You cannot sell a vehicle to yourself.`)
            const currentRoute = await targetPlayer.callProc('proc:getRoute')
            if (currentRoute == 'modal' && targetPlayer.getVariable('vehOffer')) return mp.chat.err(player, `Player is currently reviewing a vehicle offer.`)
            const { vehicles } = require('../models')
            vehicles.findAll({ where: { id: player.vehicle.getVariable('sqlID'), OwnerId: player.characterId } }).then(async (veh) => {
              if (veh.length > 0) {
                const vehicleName = await targetPlayer.callProc('proc::vehicleName', [targetPlayer.vehicle.model]);
                if (vehicleName == null) { vehicleName == 'Not Known' }
                targetPlayer.setVariable('vehOffer', `{"vehicleId": ${targetPlayer.vehicle.getVariable('sqlID')}, "OwnerId": ${player.characterId}, "price": ${parseInt(amount)}, "OfferTime": ${mp.core.getUnixTimestamp()}}`)
                targetPlayer.call('createModalMenu', ['fa-solid fa-car', 30, 'Vehicle Offer', `Player [${player.id}] offered you their ${vehicleName} !{#ffef63}[${targetPlayer.vehicle.numberPlate}]!{white} for !{#7bff63}$${parseInt(amount).toLocaleString('en-US')}!{white}`, 'Deny Vehicle', 'Accept Vehicle', 'client:denyVeh', 'client:buyVeh', `${targetPlayer.getVariable('vehOffer')}`, `${targetPlayer.getVariable('vehOffer')}`])
                mp.chat.sendMsg(player, 'fa-solid fa-car', '#73ffe5', `You offered your vehicle [${player.vehicle.numberPlate}] for $${parseInt(amount).toLocaleString('en-US')} to Player [${targetPlayer.id}]`)
                return
              }
              else if (veh.length == 0) { return mp.chat.err(player, `You do not own this vehicle.`) }
            })
            return
          }
          else { mp.chat.err(player, `No player was found within range and inside of the vehicle you want to sell.`) }
        }),

        mp.cmds.add(['vfuel'], (player, fullText, option, ...secondOption) => {
            if(!option) return mp.chat.info(player, `Use: /vfuel [add/modify/remove] [Add/Modify: vehicleClass] [Add/Multiply: multiplier]`)
            if(player.isAdmin > 7) {
                switch(option) {
                    case 'add':
                    {
                        if(!secondOption[0] || !secondOption[1]) return mp.chat.err(player, `Missing parameters [vehicleClass] or [multiplier]`);
                        this.db.server_fuelMultipliers.findAll({ where: {vehicleClass: secondOption[0]} }).then((fuelMulti) => {
                            if(fuelMulti.length > 0) {
                                return mp.chat.err(player, `A multipler for vehicle class [${secondOption[0]}] is already within the database use the modify parameter instead.`);
                            }
                            else if(fuelMulti.length == 0) {
                                this.db.server_fuelMultipliers.create({
                                    vehicleClass: secondOption[0],
                                    multiplier: secondOption[1]
                                }).then((info) => {
                                    var sqlid = JSON.parse(JSON.stringify(info)).id
                                    mp.chat.aPush(player, `You have created a new fuel modifier for vehicle class [${secondOption[0]}] with value [${secondOption[1]}] (#${sqlid})`);
                                }).catch((err) => {mp.log(err)})
                            }
                        })
                        break;
                    }
                    case 'modify':
                    {
                        if(!secondOption[0] || !secondOption[1]) return mp.chat.err(player, `Missing parameters [vehicleClass] or [multiplier]`);
                        this.db.server_fuelMultipliers.findAll({ where: {vehicleClass: secondOption[0]} }).then((fuelMulti) => {
                            if(fuelMulti.length > 0) {
                                this.db.server_fuelMultipliers.update({
                                    multiplier: secondOption[1]
                                }, { where: { vehicleClass: secondOption[0] } }).then(() => {
                                    mp.chat.aPush(player, `You modifed fuel multipler with sqlid: ${fuelMulti[0].id} to a value of ${secondOption[1]}`);
                                }).catch((err) => {mp.log(err)})
                            }
                            else return mp.chat.err(player, `No fuel multipler for vehicle class [${secondOption[0]}] was found use the [add] parameter.`);
                        })
                        break;
                    }
                    case 'remove':
                    {
                        if(!secondOption[0]) return mp.chat.err(player, `Missing parameter [vehicleClass]`);
                        this.db.server_fuelMultipliers.findAll({ where: { vehicleClass: secondOption[0] } }).then((fuelMulti) => {
                            if(fuelMulti.length > 0) {
                                this.db.server_fuelMultipliers.destroy( { where: { vehicleClass: secondOption[0] } } ).then(() => {
                                    mp.chat.aPush(player, `Deleted fuel multipler with sqlid ${fuelMulti[0].id}`);
                                })
                                return
                            }
                            else return mp.chat.err(player, `No entry with vehicle class [${secondOption[0]}] was found.`);
                        })
                    }
                    default:
                        mp.chat.err(player, `Select a valid parameter.`)
                        break;
                }
                return
            }
            mp.chat.err(player, `${this.CONFIG.noauth}`)
        })

        mp.cmds.add(['window', 'vwindow', 'vw'], (player, index) => {
            if (!index || !(index >= 0 && index <= 3)) return mp.chat.info(player, 'Use: /window [value(0-3)]');
            if (!player.vehicle) return mp.chat.err(player, 'You must be in a vehicle to use this command!');
            if(!player.vehicle.windows) {
                player.vehicle.windows = [];
                for(var x = 0; x < 4; x++) {
                    player.vehicle.windows.push({ window: x, opened: false });
                }

                player.vehicle.windows[index] = { window: index, opened: true };
                player.call('ameCreate', [`Rolled down window ${index}`])
                player.vehicle.setVariable('vehicleWindows', player.vehicle.windows);
            }
            else if(player.vehicle.windows) {
                player.vehicle.windows[index].opened ? player.vehicle.windows[index].opened = false : player.vehicle.windows[index].opened = true;
                player.call('ameCreate', [`${player.vehicle.windows[index].opened ? 'Rolled down' : 'Rolled up'} window ${index}`])
                player.vehicle.setVariable('vehicleWindows', player.vehicle.windows);
            }
        })

        mp.cmds.add(['mv', 'myvehicles'], (player, arg) => {
            if(arg != null) return mp.chat.info(player, `Use: /myvehicles`);
            mp.events.call('requestList', player);
        })

    }


    unlockVeh(player, vehicle) {
      if(!vehicle.getVariable('sqlID')) return;
      vehicle.setVariable('isLocked', false);
      player.adminDuty ? '_' : player.setVariable('lockAnim:data', true);
      vehicle.locked = false;
      player.adminDuty ? player.call('notifCreate', ['~r~Unlocked vehicle']) :player.call('ameCreate', ['Unlocks the vehicle.']);
      db.vehicles.update({ locked: 0 }, { where: {id: vehicle.getVariable('sqlID')} })
    }

    lockVeh(player, vehicle) {
      if(!vehicle.getVariable('sqlID')) return;
      vehicle.setVariable('lightFlash', true);
      if(vehicle.doors) {
        for(var x = 0; x < vehicle.doors.length; x++) {
          vehicle.doors[x] = false;
        }
      }
      vehicle.setVariable('isLocked', true);
      player.adminDuty ? player.call('notifCreate', ['~r~Locked vehicle']) :player.call('ameCreate', ['Locks the vehicle.']);
      player.adminDuty ? '_' : player.setVariable('lockAnim:data', true);
      vehicle.locked = true;
      mp.events.call('shutDoors', vehicle);
      db.vehicles.update({ locked: 1 }, { where: {id: vehicle.getVariable('sqlID')} })
    }
}
new vehicleSystems();

// Vehicle data should be saved into db.
const VehicleData = [
        {
          "displayName": "V-STR",
          "manufacturer": "Albany",
          "price": 642500,
          "weightKG": 1878,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 126.25,
          "gameMaxSpeedKPH": 159.25,
          "model": "vstr",
          "hash": 1456336509,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.236114501953125,
          "maxBraking": 0.625,
          "maxTraction": 2.5799999237060547,
          "maxAcceleration": 0.3790000081062317
        },
        {
          "displayName": "Buccaneer (Gang)",
          "manufacturer": "Albany",
          "price": 60000,
          "weightKG": 1600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 113,
          "gameMaxSpeedKPH": 146,
          "model": "buccaneer",
          "hash": 3612755468,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.55555725097656,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.2800000011920929
        },
        {
          "displayName": "Hermes",
          "manufacturer": "Albany",
          "price": 267500,
          "weightKG": 1300,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 117.75,
          "gameMaxSpeedKPH": 137,
          "model": "hermes",
          "hash": 15219735,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.05555725097656,
          "maxBraking": 0.7749999761581421,
          "maxTraction": 2.375,
          "maxAcceleration": 0.2849999964237213

        },
        {
          "displayName": "Police Roadcruiser",
          "manufacturer": "Albany",
          "price": 100000,
          "weightKG": 1800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 100.5,
          "gameMaxSpeedKPH": 140,
          "model": "policeold2",
          "hash": 2515846680,
          "class": {
            "id": 18,
            "name": "Emergency"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.20000000298023224

        },
        {
          "displayName": "Cavalcade II",
          "manufacturer": "Albany",
          "price": 35000,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 98,
          "gameMaxSpeedKPH": 127,
          "model": "cavalcade2",
          "hash": 3505073125,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 35.27777862548828,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.899999976158142,
          "maxAcceleration": 0.20000000298023224

        },
        {
          "displayName": "Cavalcade",
          "manufacturer": "Albany",
          "price": 30000,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 98,
          "gameMaxSpeedKPH": 127,
          "model": "cavalcade",
          "hash": 2006918058,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 35.27777862548828,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.899999976158142,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Roosevelt Valor",
          "manufacturer": "Albany",
          "price": 491000,
          "weightKG": 2420,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 98.5,
          "gameMaxSpeedKPH": 125,
          "model": "btype3",
          "hash": 3692679425,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 6,
          "maxPassengers": 5,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 34.722225189208984,
          "maxBraking": 0.550000011920929,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Roosevelt",
          "manufacturer": "Albany",
          "price": 375000,
          "weightKG": 2400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 98.5,
          "gameMaxSpeedKPH": 125,
          "model": "btype",
          "hash": 117401876,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 6,
          "maxPassengers": 5,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 34.722225189208984,
          "maxBraking": 0.550000011920929,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Manana",
          "manufacturer": "Albany",
          "price": 83000,
          "weightKG": 2100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 98.25,
          "gameMaxSpeedKPH": 130,
          "model": "manana",
          "hash": 2170765704,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.25,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Fränken Stange",
          "manufacturer": "Albany",
          "price": 275000,
          "weightKG": 1800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 106.5,
          "gameMaxSpeedKPH": 135,
          "model": "btype2",
          "hash": 3463132580,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.550000011920929,
          "maxTraction": 1.940000057220459,
          "maxAcceleration": 0.35499998927116394
        },
        {
          "displayName": "Alpha",
          "manufacturer": "Albany",
          "price": 75000,
          "weightKG": 1800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 117.75,
          "gameMaxSpeedKPH": 150,
          "model": "alpha",
          "hash": 767087018,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 1,
          "maxTraction": 2.5,
          "maxAcceleration": 0.33000001311302185
        },
        {
          "displayName": "Washington",
          "manufacturer": "Albany",
          "price": 7500,
          "weightKG": 1800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 108,
          "gameMaxSpeedKPH": 140,
          "model": "washington",
          "hash": 1777363799,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.450000047683716,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Primo Custom",
          "manufacturer": "Albany",
          "price": 200000,
          "weightKG": 1800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 103,
          "gameMaxSpeedKPH": 140,
          "model": "primo2",
          "hash": 2254540506,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.3499999046325684,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Primo",
          "manufacturer": "Albany",
          "price": 4500,
          "weightKG": 1800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 103,
          "gameMaxSpeedKPH": 140,
          "model": "primo",
          "hash": 3144368207,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.3499999046325684,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Emperor",
          "manufacturer": "Albany",
          "price": 60000,
          "weightKG": 1900,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 90.5,
          "gameMaxSpeedKPH": 120,
          "model": "emperor",
          "hash": 3609690755,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 33.333335876464844,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.899999976158142,
          "maxAcceleration": 0.14000000059604645
        },
        {
          "displayName": "Emperor II",
          "manufacturer": "Albany",
          "price": 60000,
          "weightKG": 1900,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 90.5,
          "gameMaxSpeedKPH": 120,
          "model": "emperor2",
          "hash": 2411965148,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 33.333335876464844,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.899999976158142,
          "maxAcceleration": 0.14000000059604645
        },
        {
          "displayName": "Emperor III",
          "manufacturer": "Albany",
          "price": 100000,
          "weightKG": 1900,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 90.5,
          "gameMaxSpeedKPH": 120,
          "model": "emperor3",
          "hash": 3053254478,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 33.333335876464844,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.899999976158142,
          "maxAcceleration": 0.14000000059604645
        },
        {
          "displayName": "Virgo",
          "manufacturer": "Albany",
          "price": 97500,
          "weightKG": 2200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 97.5,
          "gameMaxSpeedKPH": 134,
          "model": "virgo",
          "hash": 3796912450,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.222225189208984,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.20999999344348907
        },
        {
          "displayName": "Lurcher",
          "manufacturer": "Albany",
          "price": 325000,
          "weightKG": 1800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 114.25,
          "gameMaxSpeedKPH": 146,
          "model": "lurcher",
          "hash": 2068293287,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.55555725097656,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.28999999165534973
        },
        {
          "displayName": "Buccaneer Custom",
          "manufacturer": "Albany",
          "price": 195000,
          "weightKG": 1600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 113,
          "gameMaxSpeedKPH": 146,
          "model": "buccaneer2",
          "hash": 3281516360,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.55555725097656,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.2800000011920929
        },
        {
          "displayName": "Nightmare ZR 380",
          "manufacturer": "Annis",
          "price": 1069320,
          "weightKG": 1600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 140.5,
          "gameMaxSpeedKPH": 158,
          "model": "zr3803",
          "hash": 2816263004,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 43.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.5,
          "maxAcceleration": 0.3499999940395355
        },
        {
          "displayName": "Future Shock ZR 380",
          "manufacturer": "Annis",
          "price": 1069320,
          "weightKG": 1600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 140.5,
          "gameMaxSpeedKPH": 158,
          "model": "zr3802",
          "hash": 3188846534,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 43.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.5,
          "maxAcceleration": 0.3499999940395355
        },
        {
          "displayName": "Hellion",
          "manufacturer": "Annis",
          "price": 417500,
          "weightKG": 1900,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 103.5,
          "gameMaxSpeedKPH": 133.5,
          "model": "hellion",
          "hash": 3932816511,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.083335876464844,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 2,
          "maxAcceleration": 0.25
        },
        {
          "displayName": "S80RR",
          "manufacturer": "Annis",
          "price": 1287500,
          "weightKG": 900,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 123,
          "gameMaxSpeedKPH": 162.25,
          "model": "s80",
          "hash": 3970348707,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 45.0694465637207,
          "maxBraking": 1.25,
          "maxTraction": 39.126251220703125,
          "maxAcceleration": 0.3725000023841858
        },
        {
          "displayName": "Apocalypse ZR 380",
          "manufacturer": "Annis",
          "price": 1069320,
          "weightKG": 1600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 140.5,
          "gameMaxSpeedKPH": 158,
          "model": "zr380",
          "hash": 540101442,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 43.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.5,
          "maxAcceleration": 0.3499999940395355
        },
        {
          "displayName": "Savestra",
          "manufacturer": "Annis",
          "price": 495000,
          "weightKG": 880,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 117,
          "gameMaxSpeedKPH": 140,
          "model": "savestra",
          "hash": 903794909,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.23749999701976776
        },
        {
          "displayName": "RE-7B",
          "manufacturer": "Annis",
          "price": 1237500,
          "weightKG": 880,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 123.5,
          "gameMaxSpeedKPH": 161,
          "model": "le7b",
          "hash": 3062131285,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.722225189208984,
          "maxBraking": 1.100000023841858,
          "maxTraction": 3.0082998275756836,
          "maxAcceleration": 0.3709999918937683
        },
        {
          "displayName": "Elegy RH8",
          "manufacturer": "Annis",
          "price": 47500,
          "weightKG": 1700,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 118.5,
          "gameMaxSpeedKPH": 152,
          "model": "elegy2",
          "hash": 3728579874,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 42.222225189208984,
          "maxBraking": 0.5,
          "maxTraction": 2.700000047683716,
          "maxAcceleration": 0.33000001311302185
        },
        {
          "displayName": "Elegy Retro Custom",
          "manufacturer": "Annis",
          "price": 452000,
          "weightKG": 1450,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 115.25,
          "gameMaxSpeedKPH": 148,
          "model": "elegy",
          "hash": 196747873,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.111114501953125,
          "maxBraking": 1,
          "maxTraction": 2.700000047683716,
          "maxAcceleration": 0.33000001311302185
        },
        {
          "displayName": "Nightmare Bruiser",
          "manufacturer": "Benefactor",
          "price": 804500,
          "weightKG": 6000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 110.5,
          "gameMaxSpeedKPH": 130,
          "model": "bruiser3",
          "hash": 2252616474,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.5,
          "maxTraction": 1.75,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "Future Shock Bruiser",
          "manufacturer": "Benefactor",
          "price": 804500,
          "weightKG": 6000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 110.5,
          "gameMaxSpeedKPH": 130,
          "model": "bruiser2",
          "hash": 2600885406,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.5,
          "maxTraction": 1.75,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "Dubsta 2",
          "manufacturer": "Benefactor",
          "price": 200000,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 102,
          "gameMaxSpeedKPH": 140,
          "model": "dubsta2",
          "hash": 3900892662,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Krieger",
          "manufacturer": "Benefactor",
          "price": 1437500,
          "weightKG": 1250,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 127.25,
          "gameMaxSpeedKPH": 161.8,
          "model": "krieger",
          "hash": 3630826055,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.9444465637207,
          "maxBraking": 1.1200000047683716,
          "maxTraction": 29.55875015258789,
          "maxAcceleration": 0.37400001287460327
        },
        {
          "displayName": "Schlagen GT",
          "manufacturer": "Benefactor",
          "price": 650000,
          "weightKG": 1550,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 125.5,
          "gameMaxSpeedKPH": 159.2,
          "model": "schlagen",
          "hash": 3787471536,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.222225189208984,
          "maxBraking": 0.800000011920929,
          "maxTraction": 15.625,
          "maxAcceleration": 0.3700000047683716
        },
        {
          "displayName": "Apocalypse Bruiser",
          "manufacturer": "Benefactor",
          "price": 804500,
          "weightKG": 6000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 110.5,
          "gameMaxSpeedKPH": 130,
          "model": "bruiser",
          "hash": 668439077,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.5,
          "maxTraction": 1.75,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "Terrorbyte",
          "manufacturer": "Benefactor",
          "price": 687500,
          "weightKG": 10000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 87.25,
          "gameMaxSpeedKPH": 120,
          "model": "terbyte",
          "hash": 2306538597,
          "class": {
            "id": 20,
            "name": "Commercial"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 33.333335876464844,
          "maxBraking": 0.25,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Streiter",
          "manufacturer": "Benefactor",
          "price": 250000,
          "weightKG": 2010,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 111.25,
          "gameMaxSpeedKPH": 140,
          "model": "streiter",
          "hash": 1741861769,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.0799999237060547,
          "maxAcceleration": 0.21250000596046448
        },
        {
          "displayName": "XLS (Armored)",
          "manufacturer": "Benefactor",
          "price": 261000,
          "weightKG": 3000,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 108.25,
          "gameMaxSpeedKPH": 132,
          "model": "xls2",
          "hash": 3862958888,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.66666793823242,
          "maxBraking": 0.5899999737739563,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.26499998569488525
        },
        {
          "displayName": "XLS",
          "manufacturer": "Benefactor",
          "price": 126500,
          "weightKG": 2600,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 106,
          "gameMaxSpeedKPH": 132,
          "model": "xls",
          "hash": 1203490606,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.66666793823242,
          "maxBraking": 0.5799999833106995,
          "maxTraction": 2,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "Serrano",
          "manufacturer": "Benefactor",
          "price": 30000,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 101.5,
          "gameMaxSpeedKPH": 130,
          "model": "serrano",
          "hash": 1337041428,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Dubsta",
          "manufacturer": "Benefactor",
          "price": 200000,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 102,
          "gameMaxSpeedKPH": 140,
          "model": "dubsta",
          "hash": 1177543287,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Stirling GT",
          "manufacturer": "Benefactor",
          "price": 487500,
          "weightKG": 1330,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 112,
          "gameMaxSpeedKPH": 138,
          "model": "feltzer3",
          "hash": 2728226064,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 38.333335876464844,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.3499999046325684,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Surano",
          "manufacturer": "Benefactor",
          "price": 50000,
          "weightKG": 1600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 121,
          "gameMaxSpeedKPH": 155,
          "model": "surano",
          "hash": 384071873,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.05555725097656,
          "maxBraking": 1,
          "maxTraction": 2.549999952316284,
          "maxAcceleration": 0.3400000035762787
        },
        {
          "displayName": "Schwartzer",
          "manufacturer": "Benefactor",
          "price": 40000,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 117,
          "gameMaxSpeedKPH": 147,
          "model": "schwarzer",
          "hash": 3548084598,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.833335876464844,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.299999952316284,
          "maxAcceleration": 0.28999999165534973
        },
        {
          "displayName": "Schafter V12",
          "manufacturer": "Benefactor",
          "price": 58000,
          "weightKG": 1500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 124.25,
          "gameMaxSpeedKPH": 150,
          "model": "schafter3",
          "hash": 2809443750,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 0.949999988079071,
          "maxTraction": 2.549999952316284,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Schafter LWB",
          "manufacturer": "Benefactor",
          "price": 104000,
          "weightKG": 1850,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 109.5,
          "gameMaxSpeedKPH": 142,
          "model": "schafter4",
          "hash": 1489967196,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 39.4444465637207,
          "maxBraking": 0.8500000238418579,
          "maxTraction": 2.549999952316284,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Feltzer",
          "manufacturer": "Benefactor",
          "price": 72500,
          "weightKG": 1450,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 119.5,
          "gameMaxSpeedKPH": 153,
          "model": "feltzer2",
          "hash": 2299640309,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 42.500003814697266,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.6500000953674316,
          "maxAcceleration": 0.3400000035762787
        },
        {
          "displayName": "Turreted Limo",
          "manufacturer": "Benefactor",
          "price": 825000,
          "weightKG": 3750,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 89.5,
          "gameMaxSpeedKPH": 125,
          "model": "limo2",
          "hash": 4180339789,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 5,
          "maxPassengers": 4,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 34.722225189208984,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.174999952316284,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Schafter V12 (Armored)",
          "manufacturer": "Benefactor",
          "price": 162500,
          "weightKG": 1650,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 123.5,
          "gameMaxSpeedKPH": 150,
          "model": "schafter5",
          "hash": 3406724313,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 0.9200000166893005,
          "maxTraction": 2.549999952316284,
          "maxAcceleration": 0.28999999165534973
        },
        {
          "displayName": "Schafter LWB (Armored)",
          "manufacturer": "Benefactor",
          "price": 219000,
          "weightKG": 2000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 109.25,
          "gameMaxSpeedKPH": 142,
          "model": "schafter6",
          "hash": 1922255844,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 39.4444465637207,
          "maxBraking": 0.8199999928474426,
          "maxTraction": 2.549999952316284,
          "maxAcceleration": 0.1850000023841858
        },
        {
          "displayName": "Schafter",
          "manufacturer": "Benefactor",
          "price": 32500,
          "weightKG": 1600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 110.25,
          "gameMaxSpeedKPH": 145,
          "model": "schafter2",
          "hash": 3039514899,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.549999952316284,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Glendale",
          "manufacturer": "Benefactor",
          "price": 100000,
          "weightKG": 1600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 107,
          "gameMaxSpeedKPH": 147,
          "model": "glendale",
          "hash": 75131841,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.833335876464844,
          "maxBraking": 0.6499999761581421,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.23499999940395355
        },
        {
          "displayName": "Dubsta 6x6",
          "manufacturer": "Benefactor",
          "price": 124500,
          "weightKG": 3500,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 103.25,
          "gameMaxSpeedKPH": 137,
          "model": "dubsta3",
          "hash": 3057713523,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 6,
          "maxPassengers": 5,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 38.05555725097656,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2,
          "maxAcceleration": 0.2800000011920929
        },
        {
          "displayName": "Panto",
          "manufacturer": "Benefactor",
          "price": 42500,
          "weightKG": 800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 100.25,
          "gameMaxSpeedKPH": 132,
          "model": "panto",
          "hash": 3863274624,
          "class": {
            "id": 0,
            "name": "Compacts"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.66666793823242,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.9700000286102295,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Space Docker",
          "manufacturer": "BF",
          "price": 100000,
          "weightKG": 2000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 86.5,
          "gameMaxSpeedKPH": 135,
          "model": "dune2",
          "hash": 534258863,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.6299999952316284,
          "maxTraction": 2,
          "maxAcceleration": 0.23999999463558197
        },
        {
          "displayName": "Surfer",
          "manufacturer": "BF",
          "price": 5500,
          "weightKG": 2500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 67.25,
          "gameMaxSpeedKPH": 100,
          "model": "surfer",
          "hash": 699456151,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 1.5499999523162842,
          "maxAcceleration": 0.10000000149011612
        },
        {
          "displayName": "Surfer II",
          "manufacturer": "BF",
          "price": 5500,
          "weightKG": 2500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 67.25,
          "gameMaxSpeedKPH": 100,
          "model": "surfer2",
          "hash": 2983726598,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 1.5499999523162842,
          "maxAcceleration": 0.10000000149011612
        },
        {
          "displayName": "Raptor",
          "manufacturer": "BF",
          "price": 324000,
          "weightKG": 500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 103.25,
          "gameMaxSpeedKPH": 140,
          "model": "raptor",
          "hash": 3620039993,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 2.5999999046325684,
          "maxAcceleration": 0.29499998688697815
        },
        {
          "displayName": "Ramp Buggy",
          "manufacturer": "BF",
          "price": 1596000,
          "weightKG": 1000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 113,
          "gameMaxSpeedKPH": 150,
          "model": "dune4",
          "hash": 3467805257,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 1,
          "maxTraction": 2.8355002403259277,
          "maxAcceleration": 0.3240000009536743
        },
        {
          "displayName": "Ramp Buggy II",
          "manufacturer": "BF",
          "price": 1596000,
          "weightKG": 1000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 113,
          "gameMaxSpeedKPH": 150,
          "model": "dune5",
          "hash": 3982671785,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 1,
          "maxTraction": 2.8355002403259277,
          "maxAcceleration": 0.3199999928474426
        },
        {
          "displayName": "Injection",
          "manufacturer": "BF",
          "price": 8000,
          "weightKG": 1800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 106.5,
          "gameMaxSpeedKPH": 130,
          "model": "bfinjection",
          "hash": 1126868326,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6200000047683716,
          "maxTraction": 1.850000023841858,
          "maxAcceleration": 0.2199999988079071
        },
        {
          "displayName": "Dune FAV",
          "manufacturer": "BF",
          "price": 565250,
          "weightKG": 1800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 99.75,
          "gameMaxSpeedKPH": 135,
          "model": "dune3",
          "hash": 1897744184,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.6299999952316284,
          "maxTraction": 2.200000047683716,
          "maxAcceleration": 0.25
        },
        {
          "displayName": "Dune Buggy",
          "manufacturer": "BF",
          "price": 10000,
          "weightKG": 1800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 100.75,
          "gameMaxSpeedKPH": 135,
          "model": "dune",
          "hash": 2633113103,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.6299999952316284,
          "maxTraction": 2.200000047683716,
          "maxAcceleration": 0.25
        },
        {
          "displayName": "Bifta",
          "manufacturer": "BF",
          "price": 37500,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 107.25,
          "gameMaxSpeedKPH": 136,
          "model": "bifta",
          "hash": 3945366167,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.77777862548828,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "Prairie",
          "manufacturer": "Bollokan",
          "price": 12500,
          "weightKG": 1400,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 103.25,
          "gameMaxSpeedKPH": 135,
          "model": "prairie",
          "hash": 2844316578,
          "class": {
            "id": 0,
            "name": "Compacts"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.2199999988079071
        },
        {
          "displayName": "Nightmare Sasquatch",
          "manufacturer": "Bravado",
          "price": 765437.5,
          "weightKG": 4400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 121.25,
          "gameMaxSpeedKPH": 130,
          "model": "monster5",
          "hash": 3579220348,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6499999761581421,
          "maxTraction": 2.2750000953674316,
          "maxAcceleration": 0.4099999964237213
        },
        {
          "displayName": "Future Shock Sasquatch",
          "manufacturer": "Bravado",
          "price": 765437.5,
          "weightKG": 4400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 121.25,
          "gameMaxSpeedKPH": 130,
          "model": "monster4",
          "hash": 840387324,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6499999761581421,
          "maxTraction": 2.2750000953674316,
          "maxAcceleration": 0.4099999964237213
        },
        {
          "displayName": "Gauntlet Hellfire",
          "manufacturer": "Bravado",
          "price": 372500,
          "weightKG": 1940,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 125.25,
          "gameMaxSpeedKPH": 155,
          "model": "gauntlet4",
          "hash": 1934384720,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.05555725097656,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.3499999046325684,
          "maxAcceleration": 0.36000001430511475
        },
        {
          "displayName": "Gauntlet Classic",
          "manufacturer": "Bravado",
          "price": 307500,
          "weightKG": 1350,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 109.75,
          "gameMaxSpeedKPH": 142,
          "model": "gauntlet3",
          "hash": 722226637,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 39.4444465637207,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.5,
          "maxAcceleration": 0.2800000011920929
        },
        {
          "displayName": "Apocalypse Sasquatch",
          "manufacturer": "Bravado",
          "price": 765437.5,
          "weightKG": 4400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 121.25,
          "gameMaxSpeedKPH": 130,
          "model": "monster3",
          "hash": 1721676810,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6499999761581421,
          "maxTraction": 2.2750000953674316,
          "maxAcceleration": 0.4099999964237213
        },
        {
          "displayName": "Youga Classic",
          "manufacturer": "Bravado",
          "price": 67500,
          "weightKG": 2500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 91,
          "gameMaxSpeedKPH": 120,
          "model": "youga2",
          "hash": 1026149675,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 33.333335876464844,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 1.7999999523162842,
          "maxAcceleration": 0.14000000059604645
        },
        {
          "displayName": "Youga",
          "manufacturer": "Bravado",
          "price": 8000,
          "weightKG": 2500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 96.5,
          "gameMaxSpeedKPH": 120,
          "model": "youga",
          "hash": 65402552,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 33.333335876464844,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 1.7999999523162842,
          "maxAcceleration": 0.14000000059604645
        },
        {
          "displayName": "Rumpo Custom",
          "manufacturer": "Bravado",
          "price": 65000,
          "weightKG": 2250,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 98.75,
          "gameMaxSpeedKPH": 130,
          "model": "rumpo3",
          "hash": 1475773103,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 2,
          "maxAcceleration": 0.18000000715255737
        },
        {
          "displayName": "Rumpo",
          "manufacturer": "Bravado",
          "price": 6500,
          "weightKG": 2500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 99.25,
          "gameMaxSpeedKPH": 130,
          "model": "rumpo",
          "hash": 1162065741,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.17000000178813934
        },
        {
          "displayName": "Rumpo II",
          "manufacturer": "Bravado",
          "price": 6500,
          "weightKG": 2500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 99.25,
          "gameMaxSpeedKPH": 130,
          "model": "rumpo2",
          "hash": 2518351607,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.17000000178813934
        },
        {
          "displayName": "Paradise",
          "manufacturer": "Bravado",
          "price": 12500,
          "weightKG": 2500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 99.25,
          "gameMaxSpeedKPH": 130,
          "model": "paradise",
          "hash": 1488164764,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.17000000178813934
        },
        {
          "displayName": "Bison",
          "manufacturer": "Bravado",
          "price": 15000,
          "weightKG": 2100,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 98.5,
          "gameMaxSpeedKPH": 130,
          "model": "bison",
          "hash": 4278019151,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 6,
          "maxPassengers": 5,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Bison II",
          "manufacturer": "Bravado",
          "price": 15000,
          "weightKG": 2100,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 98.5,
          "gameMaxSpeedKPH": 130,
          "model": "bison2",
          "hash": 2072156101,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Bison III",
          "manufacturer": "Bravado",
          "price": 15000,
          "weightKG": 2100,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 98.5,
          "gameMaxSpeedKPH": 130,
          "model": "bison3",
          "hash": 1739845664,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Gresley",
          "manufacturer": "Bravado",
          "price": 14500,
          "weightKG": 2200,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 100.75,
          "gameMaxSpeedKPH": 135,
          "model": "gresley",
          "hash": 2751205197,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.899999976158142,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Banshee 900R",
          "manufacturer": "Bravado",
          "price": 282500,
          "weightKG": 1150,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 131,
          "gameMaxSpeedKPH": 150,
          "model": "banshee2",
          "hash": 633712403,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.33333206176758,
          "maxBraking": 1,
          "maxTraction": 2.5,
          "maxAcceleration": 0.36139997839927673
        },
        {
          "displayName": "Verlierer",
          "manufacturer": "Bravado",
          "price": 347500,
          "weightKG": 1100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 121.75,
          "gameMaxSpeedKPH": 150,
          "model": "verlierer2",
          "hash": 1102544804,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 1,
          "maxTraction": 2.430000066757202,
          "maxAcceleration": 0.33500000834465027
        },
        {
          "displayName": "Sprunk Buffalo",
          "manufacturer": "Bravado",
          "price": 267500,
          "weightKG": 1550,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 116,
          "gameMaxSpeedKPH": 147,
          "model": "buffalo3",
          "hash": 237764926,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 40.833335876464844,
          "maxBraking": 1,
          "maxTraction": 2.450000047683716,
          "maxAcceleration": 0.3100000023841858
        },
        {
          "displayName": "Buffalo S",
          "manufacturer": "Bravado",
          "price": 48000,
          "weightKG": 1650,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 112.25,
          "gameMaxSpeedKPH": 145,
          "model": "buffalo2",
          "hash": 736902334,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.450000047683716,
          "maxAcceleration": 0.28999999165534973
        },
        {
          "displayName": "Buffalo",
          "manufacturer": "Bravado",
          "price": 17500,
          "weightKG": 1650,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 112.25,
          "gameMaxSpeedKPH": 145,
          "model": "buffalo",
          "hash": 3990165190,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.450000047683716,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Banshee",
          "manufacturer": "Bravado",
          "price": 52500,
          "weightKG": 1200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 117.75,
          "gameMaxSpeedKPH": 148,
          "model": "banshee",
          "hash": 3253274834,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.111114501953125,
          "maxBraking": 1,
          "maxTraction": 2.4200000762939453,
          "maxAcceleration": 0.3400000035762787
        },
        {
          "displayName": "Duneloader",
          "manufacturer": "Bravado",
          "price": 58000,
          "weightKG": 2100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 79.5,
          "gameMaxSpeedKPH": 100,
          "model": "dloader",
          "hash": 1770332643,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.7000000476837158,
          "maxAcceleration": 0.17000000178813934
        },
        {
          "displayName": "Rat-Truck",
          "manufacturer": "Bravado",
          "price": 18750,
          "weightKG": 1200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 105.25,
          "gameMaxSpeedKPH": 135,
          "model": "ratloader2",
          "hash": 3705788919,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.699999988079071,
          "maxTraction": 1.75,
          "maxAcceleration": 0.23999999463558197
        },
        {
          "displayName": "Rat-Loader",
          "manufacturer": "Bravado",
          "price": 3000,
          "weightKG": 1200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 102.5,
          "gameMaxSpeedKPH": 135,
          "model": "ratloader",
          "hash": 3627815886,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 1.649999976158142,
          "maxAcceleration": 0.2199999988079071
        },
        {
          "displayName": "Redwood Gauntlet",
          "manufacturer": "Bravado",
          "price": 115000,
          "weightKG": 1500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 117.25,
          "gameMaxSpeedKPH": 147,
          "model": "gauntlet2",
          "hash": 349315417,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 40.833335876464844,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.509999990463257,
          "maxAcceleration": 0.3149999976158142
        },
        {
          "displayName": "Gauntlet",
          "manufacturer": "Bravado",
          "price": 16000,
          "weightKG": 1600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 113.25,
          "gameMaxSpeedKPH": 145,
          "model": "gauntlet",
          "hash": 2494797253,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.5,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Half-track",
          "manufacturer": "Bravado",
          "price": 1127175,
          "weightKG": 10000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 58.25,
          "gameMaxSpeedKPH": 75,
          "model": "halftrack",
          "hash": 4262731174,
          "class": {
            "id": 19,
            "name": "Military"
          },
          "seats": 3,
          "maxPassengers": 2,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 20.83333396911621,
          "maxBraking": 0.20000000298023224,
          "maxTraction": 2.299999952316284,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Police Cruiser (Buffalo)",
          "manufacturer": "Bravado",
          "price": 100000,
          "weightKG": 1650,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 107.5,
          "gameMaxSpeedKPH": 145,
          "model": "police2",
          "hash": 2667966721,
          "class": {
            "id": 18,
            "name": "Emergency"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.4000000953674316,
          "maxAcceleration": 0.2800000011920929
        },
        {
          "displayName": "FIB (Buffalo)",
          "manufacturer": "Bravado",
          "price": 100000,
          "weightKG": 1650,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 105.75,
          "gameMaxSpeedKPH": 145,
          "model": "fbi",
          "hash": 1127131465,
          "class": {
            "id": 18,
            "name": "Emergency"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.450000047683716,
          "maxAcceleration": 0.2800000011920929
        },
        {
          "displayName": "Boxville (LSDWP)",
          "manufacturer": "Brute",
          "price": 199000,
          "weightKG": 5500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 71.25,
          "gameMaxSpeedKPH": 100,
          "model": "boxville",
          "hash": 2307837162,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 6,
          "maxPassengers": 5,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.25,
          "maxTraction": 1.5499999523162842,
          "maxAcceleration": 0.10999999940395355
        },
        {
          "displayName": "Boxville",
          "manufacturer": "Brute",
          "price": 100000,
          "weightKG": 5500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 71.25,
          "gameMaxSpeedKPH": 100,
          "model": "boxville2",
          "hash": 4061868990,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 6,
          "maxPassengers": 5,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.25,
          "maxTraction": 1.5499999523162842,
          "maxAcceleration": 0.10999999940395355
        },
        {
          "displayName": "Boxville II",
          "manufacturer": "Brute",
          "price": 100000,
          "weightKG": 5500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 71.25,
          "gameMaxSpeedKPH": 100,
          "model": "boxville3",
          "hash": 121658888,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.25,
          "maxTraction": 1.5499999523162842,
          "maxAcceleration": 0.10999999940395355
        },
        {
          "displayName": "Tipper II",
          "manufacturer": "Brute",
          "price": 100000,
          "weightKG": 5500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 73,
          "gameMaxSpeedKPH": 100,
          "model": "tiptruck2",
          "hash": 3347205726,
          "class": {
            "id": 10,
            "name": "Industrial"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.25,
          "maxTraction": 1.600000023841858,
          "maxAcceleration": 0.10999999940395355
        },
        {
          "displayName": "Taco Van",
          "manufacturer": "Brute",
          "price": 45000,
          "weightKG": 5500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 71,
          "gameMaxSpeedKPH": 100,
          "model": "taco",
          "hash": 1951180813,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.25,
          "maxTraction": 1.5499999523162842,
          "maxAcceleration": 0.10999999940395355
        },
        {
          "displayName": "Pony",
          "manufacturer": "Brute",
          "price": 85000,
          "weightKG": 2500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 90.5,
          "gameMaxSpeedKPH": 130,
          "model": "pony",
          "hash": 4175309224,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Pony II",
          "manufacturer": "Brute",
          "price": 100000,
          "weightKG": 2500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 90.5,
          "gameMaxSpeedKPH": 130,
          "model": "pony2",
          "hash": 943752001,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Camper",
          "manufacturer": "Brute",
          "price": 150000,
          "weightKG": 4000,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 72.75,
          "gameMaxSpeedKPH": 100,
          "model": "camper",
          "hash": 1876516712,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.25,
          "maxTraction": 1.5,
          "maxAcceleration": 0.11999999731779099
        },
        {
          "displayName": "Boxville (Armored)",
          "manufacturer": "Brute",
          "price": 1463000,
          "weightKG": 7500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 87,
          "gameMaxSpeedKPH": 120,
          "model": "boxville5",
          "hash": 682434785,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 5,
          "maxPassengers": 4,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 33.333335876464844,
          "maxBraking": 0.3499999940395355,
          "maxTraction": 2.174999952316284,
          "maxAcceleration": 0.3199999928474426
        },
        {
          "displayName": "Boxville (Post OP)",
          "manufacturer": "Brute",
          "price": 29925,
          "weightKG": 5500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 71.25,
          "gameMaxSpeedKPH": 100,
          "model": "boxville4",
          "hash": 444171386,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 6,
          "maxPassengers": 5,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.25,
          "maxTraction": 1.5499999523162842,
          "maxAcceleration": 0.10999999940395355
        },
        {
          "displayName": "Utility Truck (Cherry Picker)",
          "manufacturer": "Brute",
          "price": 100000,
          "weightKG": 7500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 77,
          "gameMaxSpeedKPH": 115,
          "model": "utillitruck",
          "hash": 516990260,
          "class": {
            "id": 11,
            "name": "Utility"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 31.944446563720703,
          "maxBraking": 0.25,
          "maxTraction": 1.600000023841858,
          "maxAcceleration": 0.11999999731779099
        },
        {
          "displayName": "Utility Truck",
          "manufacturer": "Brute",
          "price": 100000,
          "weightKG": 6500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 77,
          "gameMaxSpeedKPH": 115,
          "model": "utillitruck2",
          "hash": 887537515,
          "class": {
            "id": 11,
            "name": "Utility"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 31.944446563720703,
          "maxBraking": 0.25,
          "maxTraction": 1.600000023841858,
          "maxAcceleration": 0.11999999731779099
        },
        {
          "displayName": "Tour Bus",
          "manufacturer": "Brute",
          "price": 100000,
          "weightKG": 5500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 65,
          "gameMaxSpeedKPH": 110,
          "model": "tourbus",
          "hash": 1941029835,
          "class": {
            "id": 17,
            "name": "Service"
          },
          "seats": 10,
          "maxPassengers": 9,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 30.555557250976562,
          "maxBraking": 0.25,
          "maxTraction": 1.5499999523162842,
          "maxAcceleration": 0.11999999731779099
        },
        {
          "displayName": "Rental Shuttle Bus",
          "manufacturer": "Brute",
          "price": 15000,
          "weightKG": 5500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 65,
          "gameMaxSpeedKPH": 110,
          "model": "rentalbus",
          "hash": 3196165219,
          "class": {
            "id": 17,
            "name": "Service"
          },
          "seats": 10,
          "maxPassengers": 9,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 30.555557250976562,
          "maxBraking": 0.25,
          "maxTraction": 1.5499999523162842,
          "maxAcceleration": 0.11999999731779099
        },
        {
          "displayName": "Dashound",
          "manufacturer": "Brute",
          "price": 262500,
          "weightKG": 8500,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 71.75,
          "gameMaxSpeedKPH": 100,
          "model": "coach",
          "hash": 2222034228,
          "class": {
            "id": 17,
            "name": "Service"
          },
          "seats": 10,
          "maxPassengers": 9,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.25,
          "maxTraction": 1.4500000476837158,
          "maxAcceleration": 0.11999999731779099
        },
        {
          "displayName": "Bus",
          "manufacturer": "Brute",
          "price": 250000,
          "weightKG": 9000,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 65,
          "gameMaxSpeedKPH": 100,
          "model": "bus",
          "hash": 3581397346,
          "class": {
            "id": 17,
            "name": "Service"
          },
          "seats": 16,
          "maxPassengers": 15,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.3499999940395355,
          "maxTraction": 1.4500000476837158,
          "maxAcceleration": 0.11999999731779099
        },
        {
          "displayName": "Airport Bus",
          "manufacturer": "Brute",
          "price": 275000,
          "weightKG": 9000,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 65,
          "gameMaxSpeedKPH": 100,
          "model": "airbus",
          "hash": 1283517198,
          "class": {
            "id": 17,
            "name": "Service"
          },
          "seats": 16,
          "maxPassengers": 15,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.25,
          "maxTraction": 1.4500000476837158,
          "maxAcceleration": 0.11999999731779099
        },
        {
          "displayName": "Tipper",
          "manufacturer": "Brute",
          "price": 100000,
          "weightKG": 5500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 70.5,
          "gameMaxSpeedKPH": 100,
          "model": "tiptruck",
          "hash": 48339065,
          "class": {
            "id": 10,
            "name": "Industrial"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.25,
          "maxTraction": 1.600000023841858,
          "maxAcceleration": 0.10999999940395355
        },
        {
          "displayName": "Police Riot",
          "manufacturer": "Brute",
          "price": 100000,
          "weightKG": 6500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 86.5,
          "gameMaxSpeedKPH": 120,
          "model": "riot",
          "hash": 3089277354,
          "class": {
            "id": 18,
            "name": "Emergency"
          },
          "seats": 8,
          "maxPassengers": 7,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 33.333335876464844,
          "maxBraking": 0.25,
          "maxTraction": 1.649999976158142,
          "maxAcceleration": 0.11999999731779099
        },
        {
          "displayName": "Ambulance",
          "manufacturer": "Brute",
          "price": 100000,
          "weightKG": 2500,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 97.75,
          "gameMaxSpeedKPH": 140,
          "model": "ambulance",
          "hash": 1171614426,
          "class": {
            "id": 18,
            "name": "Emergency"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.18000000715255737
        },
        {
          "displayName": "Stockade",
          "manufacturer": "Brute",
          "price": 1120000,
          "weightKG": 6500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 83.5,
          "gameMaxSpeedKPH": 120,
          "model": "stockade",
          "hash": 1747439474,
          "class": {
            "id": 20,
            "name": "Commercial"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 33.333335876464844,
          "maxBraking": 0.25,
          "maxTraction": 1.649999976158142,
          "maxAcceleration": 0.11999999731779099
        },
        {
          "displayName": "Stockade II",
          "manufacturer": "Brute",
          "price": 1120000,
          "weightKG": 6500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 83.5,
          "gameMaxSpeedKPH": 120,
          "model": "stockade3",
          "hash": 4080511798,
          "class": {
            "id": 20,
            "name": "Commercial"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 33.333335876464844,
          "maxBraking": 0.25,
          "maxTraction": 1.649999976158142,
          "maxAcceleration": 0.11999999731779099
        },
        {
          "displayName": "Pyro",
          "manufacturer": "Buckingham",
          "price": 2227750,
          "weightKG": 4000,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 222.75,
          "gameMaxSpeedKPH": 328.6,
          "model": "pyro",
          "hash": 2908775872,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 100,
          "maxBraking": 11.269999504089355,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 11.270000457763672
        },
        {
          "displayName": "Howard NX-25",
          "manufacturer": "Buckingham",
          "price": 648375,
          "weightKG": 450,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 203.75,
          "gameMaxSpeedKPH": 184.4,
          "model": "howard",
          "hash": 3287439187,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 100,
          "maxBraking": 20.579999923706055,
          "maxTraction": 1.149999976158142,
          "maxAcceleration": 20.579999923706055
        },
        {
          "displayName": "Vestra",
          "manufacturer": "Buckingham",
          "price": 475000,
          "weightKG": 5000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 163.75,
          "gameMaxSpeedKPH": 141,
          "model": "vestra",
          "hash": 1341619767,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 97.1397476196289,
          "maxBraking": 8.758119583129883,
          "maxTraction": 1.149999976158142,
          "maxAcceleration": 9.016000747680664
        },
        {
          "displayName": "Shamal",
          "manufacturer": "Buckingham",
          "price": 575000,
          "weightKG": 6400,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 159,
          "gameMaxSpeedKPH": 326.2,
          "model": "shamal",
          "hash": 3080461301,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 10,
          "maxPassengers": 9,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 90.61445617675781,
          "maxBraking": 7.1929755210876465,
          "maxTraction": 1.149999976158142,
          "maxAcceleration": 7.938000202178955
        },
        {
          "displayName": "Nimbus",
          "manufacturer": "Buckingham",
          "price": 950000,
          "weightKG": 6500,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 165,
          "gameMaxSpeedKPH": 328.2,
          "model": "nimbus",
          "hash": 2999939664,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 8,
          "maxPassengers": 7,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 94.55620574951172,
          "maxBraking": 7.691201686859131,
          "maxTraction": 1.149999976158142,
          "maxAcceleration": 8.133999824523926
        },
        {
          "displayName": "MilJet",
          "manufacturer": "Buckingham",
          "price": 850000,
          "weightKG": 6400,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 161.25,
          "gameMaxSpeedKPH": 140,
          "model": "miljet",
          "hash": 165154707,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 16,
          "maxPassengers": 15,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 91.83216857910156,
          "maxBraking": 7.46962833404541,
          "maxTraction": 1.5,
          "maxAcceleration": 8.133999824523926
        },
        {
          "displayName": "Luxor Deluxe",
          "manufacturer": "Buckingham",
          "price": 5000000,
          "weightKG": 6500,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 159.5,
          "gameMaxSpeedKPH": 326.2,
          "model": "luxor2",
          "hash": 3080673438,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 8,
          "maxPassengers": 7,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 91.22515106201172,
          "maxBraking": 7.33085298538208,
          "maxTraction": 1.149999976158142,
          "maxAcceleration": 8.03600025177002
        },
        {
          "displayName": "Luxor",
          "manufacturer": "Buckingham",
          "price": 812500,
          "weightKG": 6400,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 159,
          "gameMaxSpeedKPH": 326.2,
          "model": "luxor",
          "hash": 621481054,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 10,
          "maxPassengers": 9,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 90.61445617675781,
          "maxBraking": 7.1929755210876465,
          "maxTraction": 1.149999976158142,
          "maxAcceleration": 7.938000202178955
        },
        {
          "displayName": "Alpha-Z1",
          "manufacturer": "Buckingham",
          "price": 1060675,
          "weightKG": 450,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 201.5,
          "gameMaxSpeedKPH": 184.4,
          "model": "alphaz1",
          "hash": 2771347558,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 100,
          "maxBraking": 20.579999923706055,
          "maxTraction": 1.149999976158142,
          "maxAcceleration": 20.579999923706055
        },
        {
          "displayName": "Volatus",
          "manufacturer": "Buckingham",
          "price": 1147500,
          "weightKG": 8000,
          "drivetrain": null,
          "realMaxSpeedMPH": 161.25,
          "gameMaxSpeedKPH": 160,
          "model": "volatus",
          "hash": 2449479409,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 59.240413665771484,
          "maxBraking": 3.193058490753174,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 5.390000343322754
        },
        {
          "displayName": "Valkyrie",
          "manufacturer": "Buckingham",
          "price": 1895250,
          "weightKG": 6500,
          "drivetrain": null,
          "realMaxSpeedMPH": 145,
          "gameMaxSpeedKPH": 165,
          "model": "valkyrie",
          "hash": 2694714877,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 54.72616195678711,
          "maxBraking": 2.8424768447875977,
          "maxTraction": 1.600000023841858,
          "maxAcceleration": 5.193999767303467
        },
        {
          "displayName": "Valkyrie II",
          "manufacturer": "Buckingham",
          "price": 1895250,
          "weightKG": 6500,
          "drivetrain": null,
          "realMaxSpeedMPH": 145,
          "gameMaxSpeedKPH": 165,
          "model": "valkyrie2",
          "hash": 1543134283,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 54.72616195678711,
          "maxBraking": 2.8424768447875977,
          "maxTraction": 1.600000023841858,
          "maxAcceleration": 5.193999767303467
        },
        {
          "displayName": "Swift Deluxe",
          "manufacturer": "Buckingham",
          "price": 2575000,
          "weightKG": 6500,
          "drivetrain": null,
          "realMaxSpeedMPH": 157.75,
          "gameMaxSpeedKPH": 160,
          "model": "swift2",
          "hash": 1075432268,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 58.8757209777832,
          "maxBraking": 3.25994873046875,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 5.5370001792907715
        },
        {
          "displayName": "Swift",
          "manufacturer": "Buckingham",
          "price": 750000,
          "weightKG": 6500,
          "drivetrain": null,
          "realMaxSpeedMPH": 156.5,
          "gameMaxSpeedKPH": 160,
          "model": "swift",
          "hash": 3955379698,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 58.23143768310547,
          "maxBraking": 3.167207956314087,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 5.439000129699707
        },
        {
          "displayName": "SuperVolito Carbon",
          "manufacturer": "Buckingham",
          "price": 1665000,
          "weightKG": 6500,
          "drivetrain": null,
          "realMaxSpeedMPH": 148.75,
          "gameMaxSpeedKPH": 160,
          "model": "supervolito2",
          "hash": 2623428164,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 61.96861267089844,
          "maxBraking": 3.491931438446045,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 5.635000228881836
        },
        {
          "displayName": "SuperVolito",
          "manufacturer": "Buckingham",
          "price": 1056500,
          "weightKG": 6500,
          "drivetrain": null,
          "realMaxSpeedMPH": 148.75,
          "gameMaxSpeedKPH": 160,
          "model": "supervolito",
          "hash": 710198397,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 61.96861267089844,
          "maxBraking": 3.491931438446045,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 5.635000228881836
        },
        {
          "displayName": "Police Maverick",
          "manufacturer": "Buckingham",
          "price": 100000,
          "weightKG": 6500,
          "drivetrain": null,
          "realMaxSpeedMPH": 144,
          "gameMaxSpeedKPH": 160,
          "model": "polmav",
          "hash": 353883353,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 56.596221923828125,
          "maxBraking": 2.9396073818206787,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 5.193999767303467
        },
        {
          "displayName": "Maverick",
          "manufacturer": "Buckingham",
          "price": 390000,
          "weightKG": 6500,
          "drivetrain": null,
          "realMaxSpeedMPH": 140.25,
          "gameMaxSpeedKPH": 160,
          "model": "maverick",
          "hash": 2634305738,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 54.067535400390625,
          "maxBraking": 2.7552812099456787,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 5.095999717712402
        },
        {
          "displayName": "Tug",
          "manufacturer": "Buckingham",
          "price": 625000,
          "weightKG": 12200,
          "drivetrain": null,
          "realMaxSpeedMPH": 18.5,
          "gameMaxSpeedKPH": 18,
          "model": "tug",
          "hash": 2194326579,
          "class": {
            "id": 14,
            "name": "Boats"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 5,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 0,
          "maxAcceleration": 2.200000047683716
        },
        {
          "displayName": "Freecrawler",
          "manufacturer": "Canis",
          "price": 298500,
          "weightKG": 2000,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 99.75,
          "gameMaxSpeedKPH": 135,
          "model": "freecrawler",
          "hash": 4240635011,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.23999999463558197
        },
        {
          "displayName": "Kamacho",
          "manufacturer": "Canis",
          "price": 172500,
          "weightKG": 2350,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 116.75,
          "gameMaxSpeedKPH": 134,
          "model": "kamacho",
          "hash": 4173521127,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 37.222225189208984,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 2,
          "maxAcceleration": 0.2549999952316284
        },
        {
          "displayName": "Seminole",
          "manufacturer": "Canis",
          "price": 15000,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 97.5,
          "gameMaxSpeedKPH": 130,
          "model": "seminole",
          "hash": 1221512915,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.18000000715255737
        },
        {
          "displayName": "Mesa",
          "manufacturer": "Canis",
          "price": 75000,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 95,
          "gameMaxSpeedKPH": 130,
          "model": "mesa",
          "hash": 914654722,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 2,
          "maxAcceleration": 0.17000000178813934
        },
        {
          "displayName": "Mesa II",
          "manufacturer": "Canis",
          "price": 100000,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 95,
          "gameMaxSpeedKPH": 130,
          "model": "mesa2",
          "hash": 3546958660,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 2,
          "maxAcceleration": 0.17000000178813934
        },
        {
          "displayName": "Mesa (Merryweather)",
          "manufacturer": "Canis",
          "price": 43500,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 99.75,
          "gameMaxSpeedKPH": 130,
          "model": "mesa3",
          "hash": 2230595153,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 2,
          "maxAcceleration": 0.17000000178813934
        },
        {
          "displayName": "Kalahari",
          "manufacturer": "Canis",
          "price": 20000,
          "weightKG": 800,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 90.75,
          "gameMaxSpeedKPH": 120,
          "model": "kalahari",
          "hash": 92612664,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 33.333335876464844,
          "maxBraking": 1,
          "maxTraction": 1.7799999713897705,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "Bodhi",
          "manufacturer": "Canis",
          "price": 12500,
          "weightKG": 2600,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 98.75,
          "gameMaxSpeedKPH": 134,
          "model": "bodhi2",
          "hash": 2859047862,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.222225189208984,
          "maxBraking": 1.100000023841858,
          "maxTraction": 2.25,
          "maxAcceleration": 0.2150000035762787
        },
        {
          "displayName": "Crusader",
          "manufacturer": "Canis",
          "price": 112500,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 91.25,
          "gameMaxSpeedKPH": 130,
          "model": "crusader",
          "hash": 321739290,
          "class": {
            "id": 19,
            "name": "Military"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 1.899999976158142,
          "maxAcceleration": 0.18000000715255737
        },
        {
          "displayName": "Romero Hearse",
          "manufacturer": "Chariot",
          "price": 22500,
          "weightKG": 2000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 89.5,
          "gameMaxSpeedKPH": 125,
          "model": "romero",
          "hash": 627094268,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 34.722225189208984,
          "maxBraking": 0.5,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.15000000596046448
        },
        {
          "displayName": "Taipan",
          "manufacturer": "Cheval",
          "price": 990000,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 126.25,
          "gameMaxSpeedKPH": 170.25,
          "model": "taipan",
          "hash": 3160260734,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 47.29166793823242,
          "maxBraking": 1,
          "maxTraction": 13.779999732971191,
          "maxAcceleration": 0.3569999933242798
        },
        {
          "displayName": "Surge",
          "manufacturer": "Cheval",
          "price": 19000,
          "weightKG": 1800,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 93.5,
          "gameMaxSpeedKPH": 140,
          "model": "surge",
          "hash": 2400073108,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.10000000149011612
        },
        {
          "displayName": "Fugitive",
          "manufacturer": "Cheval",
          "price": 12000,
          "weightKG": 1600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 107.75,
          "gameMaxSpeedKPH": 145,
          "model": "fugitive",
          "hash": 1909141499,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.5,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Marshall",
          "manufacturer": "Cheval",
          "price": 250000,
          "weightKG": 4000,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 80.25,
          "gameMaxSpeedKPH": 110,
          "model": "marshall",
          "hash": 1233534620,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 30.555557250976562,
          "maxBraking": 0.6499999761581421,
          "maxTraction": 2.25,
          "maxAcceleration": 0.4000000059604645
        },
        {
          "displayName": "Picador",
          "manufacturer": "Cheval",
          "price": 4500,
          "weightKG": 1600,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 102.5,
          "gameMaxSpeedKPH": 135,
          "model": "picador",
          "hash": 1507916787,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.2199999988079071
        },
        {
          "displayName": "Raiden",
          "manufacturer": "Coil",
          "price": 687500,
          "weightKG": 2100,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 113.25,
          "gameMaxSpeedKPH": 156.25,
          "model": "raiden",
          "hash": 2765724541,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.40277862548828,
          "maxBraking": 1.2999999523162842,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.24500000476837158
        },
        {
          "displayName": "Cyclone",
          "manufacturer": "Coil",
          "price": 945000,
          "weightKG": 1800,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 116.25,
          "gameMaxSpeedKPH": 158,
          "model": "cyclone",
          "hash": 1392481335,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.88888931274414,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 2.25,
          "maxAcceleration": 0.27250000834465027
        },
        {
          "displayName": "Voltic",
          "manufacturer": "Coil",
          "price": 75000,
          "weightKG": 1030,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 106,
          "gameMaxSpeedKPH": 145,
          "model": "voltic",
          "hash": 2672523198,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 1,
          "maxTraction": 2.5299999713897705,
          "maxAcceleration": 0.18000000715255737
        },
        {
          "displayName": "Rocket Voltic",
          "manufacturer": "Coil",
          "price": 1915200,
          "weightKG": 1200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 124.5,
          "gameMaxSpeedKPH": 145,
          "model": "voltic2",
          "hash": 989294410,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 1,
          "maxTraction": 2.5299999713897705,
          "maxAcceleration": 0.18000000715255737
        },
        {
          "displayName": "Brawler",
          "manufacturer": "Coil",
          "price": 357500,
          "weightKG": 2100,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 117.75,
          "gameMaxSpeedKPH": 140,
          "model": "brawler",
          "hash": 2815302597,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.8799999952316284,
          "maxTraction": 1.9199999570846558,
          "maxAcceleration": 0.2800000011920929
        },
        {
          "displayName": "Drift Yosemite",
          "manufacturer": "Declasse",
          "price": 654000,
          "weightKG": 1200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 108.25,
          "gameMaxSpeedKPH": 140,
          "model": "yosemite2",
          "hash": 1693751655,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.8500000238418579,
          "maxTraction": 2.625,
          "maxAcceleration": 0.39500001072883606
        },
        {
          "displayName": "Bugstars Burrito",
          "manufacturer": "Declasse",
          "price": 299250,
          "weightKG": 2500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 90.75,
          "gameMaxSpeedKPH": 130,
          "model": "burrito2",
          "hash": 3387490166,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Nightmare Impaler",
          "manufacturer": "Declasse",
          "price": 604750,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 130,
          "gameMaxSpeedKPH": 155,
          "model": "impaler4",
          "hash": 2550461639,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 43.05555725097656,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.4000000953674316,
          "maxAcceleration": 0.3799999952316284
        },
        {
          "displayName": "Nightmare Brutus",
          "manufacturer": "Declasse",
          "price": 1333325,
          "weightKG": 3500,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 123.5,
          "gameMaxSpeedKPH": 140,
          "model": "brutus3",
          "hash": 2038858402,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Future Shock Impaler",
          "manufacturer": "Declasse",
          "price": 604750,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 130,
          "gameMaxSpeedKPH": 155,
          "model": "impaler3",
          "hash": 2370166601,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 43.05555725097656,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.4000000953674316,
          "maxAcceleration": 0.3799999952316284
        },
        {
          "displayName": "Future Shock Brutus",
          "manufacturer": "Declasse",
          "price": 1333325,
          "weightKG": 3500,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 123.5,
          "gameMaxSpeedKPH": 140,
          "model": "brutus2",
          "hash": 2403970600,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Tornado Mariachi",
          "manufacturer": "Declasse",
          "price": 300000,
          "weightKG": 2100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 91.25,
          "gameMaxSpeedKPH": 130,
          "model": "tornado4",
          "hash": 2261744861,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.25,
          "maxTraction": 1.7999999523162842,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Lost Gang Burrito",
          "manufacturer": "Declasse",
          "price": 40000,
          "weightKG": 2500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 105.25,
          "gameMaxSpeedKPH": 130,
          "model": "gburrito",
          "hash": 2549763894,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Vamos",
          "manufacturer": "Declasse",
          "price": 298000,
          "weightKG": 1380,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 112.25,
          "gameMaxSpeedKPH": 145,
          "model": "vamos",
          "hash": 4245851645,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.5,
          "maxTraction": 2.25,
          "maxAcceleration": 0.33000001311302185
        },
        {
          "displayName": "Tulip",
          "manufacturer": "Declasse",
          "price": 359000,
          "weightKG": 1545,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 112.75,
          "gameMaxSpeedKPH": 147.5,
          "model": "tulip",
          "hash": 1456744817,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.972225189208984,
          "maxBraking": 0.5,
          "maxTraction": 2.25,
          "maxAcceleration": 0.3199999928474426
        },
        {
          "displayName": "Apocalypse Brutus",
          "manufacturer": "Declasse",
          "price": 1333325,
          "weightKG": 3500,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 123.5,
          "gameMaxSpeedKPH": 140,
          "model": "brutus",
          "hash": 2139203625,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Apocalypse Impaler",
          "manufacturer": "Declasse",
          "price": 604750,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 130,
          "gameMaxSpeedKPH": 155,
          "model": "impaler2",
          "hash": 1009171724,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 43.05555725097656,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.4000000953674316,
          "maxAcceleration": 0.3799999952316284
        },
        {
          "displayName": "Impaler",
          "manufacturer": "Declasse",
          "price": 165917.5,
          "weightKG": 1550,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 115.5,
          "gameMaxSpeedKPH": 151,
          "model": "impaler",
          "hash": 2198276962,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.9444465637207,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.3499999046325684,
          "maxAcceleration": 0.3100000023841858
        },
        {
          "displayName": "Scramjet",
          "manufacturer": "Declasse",
          "price": 2314200,
          "weightKG": 1600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 137,
          "gameMaxSpeedKPH": 160,
          "model": "scramjet",
          "hash": 3656405053,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 44.4444465637207,
          "maxBraking": 0.949999988079071,
          "maxTraction": 2.700000047683716,
          "maxAcceleration": 0.4000000059604645
        },
        {
          "displayName": "Hotring Sabre",
          "manufacturer": "Declasse",
          "price": 415000,
          "weightKG": 1508,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 121.75,
          "gameMaxSpeedKPH": 159,
          "model": "hotring",
          "hash": 1115909093,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.16666793823242,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.549999952316284,
          "maxAcceleration": 0.33500000834465027
        },
        {
          "displayName": "Yosemite",
          "manufacturer": "Declasse",
          "price": 242500,
          "weightKG": 1300,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 117,
          "gameMaxSpeedKPH": 137,
          "model": "yosemite",
          "hash": 1871995513,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.05555725097656,
          "maxBraking": 0.75,
          "maxTraction": 2.375,
          "maxAcceleration": 0.2849999964237213
        },
        {
          "displayName": "Police Rancher",
          "manufacturer": "Declasse",
          "price": 100000,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 89.5,
          "gameMaxSpeedKPH": 130,
          "model": "policeold1",
          "hash": 2758042359,
          "class": {
            "id": 18,
            "name": "Emergency"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.800000011920929,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.18000000715255737
        },
        {
          "displayName": "Gang Burrito",
          "manufacturer": "Declasse",
          "price": 43225,
          "weightKG": 2500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 105.25,
          "gameMaxSpeedKPH": 130,
          "model": "gburrito2",
          "hash": 296357396,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.18000000715255737
        },
        {
          "displayName": "Burrito",
          "manufacturer": "Declasse",
          "price": 90000,
          "weightKG": 2500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 90.75,
          "gameMaxSpeedKPH": 130,
          "model": "burrito",
          "hash": 2948279460,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Burrito II",
          "manufacturer": "Declasse",
          "price": 90000,
          "weightKG": 2500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 90.75,
          "gameMaxSpeedKPH": 130,
          "model": "burrito3",
          "hash": 2551651283,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Burrito III",
          "manufacturer": "Declasse",
          "price": 90000,
          "weightKG": 2500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 90.75,
          "gameMaxSpeedKPH": 130,
          "model": "burrito4",
          "hash": 893081117,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Burrito IV",
          "manufacturer": "Declasse",
          "price": 100000,
          "weightKG": 2500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 90.75,
          "gameMaxSpeedKPH": 130,
          "model": "burrito5",
          "hash": 1132262048,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Granger",
          "manufacturer": "Declasse",
          "price": 17500,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 101.5,
          "gameMaxSpeedKPH": 140,
          "model": "granger",
          "hash": 2519238556,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 8,
          "maxPassengers": 7,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.1899999976158142
        },
        {
          "displayName": "Tornado Rat Rod",
          "manufacturer": "Declasse",
          "price": 189000,
          "weightKG": 2100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 98.75,
          "gameMaxSpeedKPH": 130,
          "model": "tornado6",
          "hash": 2736567667,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.25,
          "maxTraction": 2,
          "maxAcceleration": 0.2800000011920929
        },
        {
          "displayName": "Tornado Custom",
          "manufacturer": "Declasse",
          "price": 187500,
          "weightKG": 2200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 98.25,
          "gameMaxSpeedKPH": 130,
          "model": "tornado5",
          "hash": 2497353967,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.2549999952316284,
          "maxTraction": 1.850000023841858,
          "maxAcceleration": 0.16099999845027924
        },
        {
          "displayName": "Tornado Convertible",
          "manufacturer": "Declasse",
          "price": 200000,
          "weightKG": 2100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 98.25,
          "gameMaxSpeedKPH": 130,
          "model": "tornado2",
          "hash": 1531094468,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.25,
          "maxTraction": 1.7999999523162842,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Tornado",
          "manufacturer": "Declasse",
          "price": 15000,
          "weightKG": 2100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 98.25,
          "gameMaxSpeedKPH": 130,
          "model": "tornado",
          "hash": 464687292,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.25,
          "maxTraction": 1.7999999523162842,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Tornado Rusty",
          "manufacturer": "Declasse",
          "price": 15000,
          "weightKG": 2100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 98.25,
          "gameMaxSpeedKPH": 130,
          "model": "tornado3",
          "hash": 1762279763,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.25,
          "maxTraction": 1.7999999523162842,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Mamba",
          "manufacturer": "Declasse",
          "price": 497500,
          "weightKG": 1160,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 117,
          "gameMaxSpeedKPH": 148,
          "model": "mamba",
          "hash": 2634021974,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.111114501953125,
          "maxBraking": 0.5,
          "maxTraction": 2.5,
          "maxAcceleration": 0.3400000035762787
        },
        {
          "displayName": "Drift Tampa",
          "manufacturer": "Declasse",
          "price": 497500,
          "weightKG": 1100,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 114.25,
          "gameMaxSpeedKPH": 150,
          "model": "tampa2",
          "hash": 3223586949,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 0.5,
          "maxTraction": 2.25,
          "maxAcceleration": 0.33000001311302185
        },
        {
          "displayName": "Premier",
          "manufacturer": "Declasse",
          "price": 5000,
          "weightKG": 1600,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 104.75,
          "gameMaxSpeedKPH": 145,
          "model": "premier",
          "hash": 2411098011,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Asea",
          "manufacturer": "Declasse",
          "price": 6000,
          "weightKG": 1400,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 104.75,
          "gameMaxSpeedKPH": 145,
          "model": "asea",
          "hash": 2485144969,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Asea II",
          "manufacturer": "Declasse",
          "price": 6000,
          "weightKG": 1400,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 104.75,
          "gameMaxSpeedKPH": 145,
          "model": "asea2",
          "hash": 2487343317,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Rancher XL",
          "manufacturer": "Declasse",
          "price": 4500,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 96,
          "gameMaxSpeedKPH": 130,
          "model": "rancherxl",
          "hash": 1645267888,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.800000011920929,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.18000000715255737
        },
        {
          "displayName": "Voodoo Custom",
          "manufacturer": "Declasse",
          "price": 210000,
          "weightKG": 2100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 100.75,
          "gameMaxSpeedKPH": 130,
          "model": "voodoo",
          "hash": 2006667053,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.699999988079071,
          "maxTraction": 1.850000023841858,
          "maxAcceleration": 0.18000000715255737
        },
        {
          "displayName": "Voodoo",
          "manufacturer": "Declasse",
          "price": 2750,
          "weightKG": 2100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 99,
          "gameMaxSpeedKPH": 130,
          "model": "voodoo2",
          "hash": 523724515,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.25,
          "maxTraction": 1.850000023841858,
          "maxAcceleration": 0.17000000178813934
        },
        {
          "displayName": "Vigero",
          "manufacturer": "Declasse",
          "price": 10500,
          "weightKG": 1800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 112,
          "gameMaxSpeedKPH": 140,
          "model": "vigero",
          "hash": 3469130167,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.28999999165534973
        },
        {
          "displayName": "Weaponized Tampa",
          "manufacturer": "Declasse",
          "price": 1054025,
          "weightKG": 1400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 112.25,
          "gameMaxSpeedKPH": 145,
          "model": "tampa3",
          "hash": 3084515313,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.5,
          "maxTraction": 2.25,
          "maxAcceleration": 0.33000001311302185
        },
        {
          "displayName": "Tampa",
          "manufacturer": "Declasse",
          "price": 187500,
          "weightKG": 1200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 105.5,
          "gameMaxSpeedKPH": 140,
          "model": "tampa",
          "hash": 972671128,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.25,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Burger Shot Stallion",
          "manufacturer": "Declasse",
          "price": 138500,
          "weightKG": 1650,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 113.25,
          "gameMaxSpeedKPH": 144,
          "model": "stalion2",
          "hash": 3893323758,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 40,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.25,
          "maxAcceleration": 0.3100000023841858
        },
        {
          "displayName": "Stallion",
          "manufacturer": "Declasse",
          "price": 35500,
          "weightKG": 1650,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 110.25,
          "gameMaxSpeedKPH": 144,
          "model": "stalion",
          "hash": 1923400478,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.25,
          "maxAcceleration": 0.28999999165534973
        },
        {
          "displayName": "Sabre Turbo Custom",
          "manufacturer": "Declasse",
          "price": 245000,
          "weightKG": 1300,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 121.25,
          "gameMaxSpeedKPH": 140,
          "model": "sabregt2",
          "hash": 223258115,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.8199999928474426,
          "maxTraction": 2.259999990463257,
          "maxAcceleration": 0.28200000524520874
        },
        {
          "displayName": "Sabre Turbo",
          "manufacturer": "Declasse",
          "price": 7500,
          "weightKG": 1200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 110.75,
          "gameMaxSpeedKPH": 140,
          "model": "sabregt",
          "hash": 2609945748,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.25,
          "maxAcceleration": 0.2800000011920929
        },
        {
          "displayName": "Moonbeam Custom",
          "manufacturer": "Declasse",
          "price": 185000,
          "weightKG": 2400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 102,
          "gameMaxSpeedKPH": 125,
          "model": "moonbeam2",
          "hash": 1896491931,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 34.722225189208984,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 2,
          "maxAcceleration": 0.20999999344348907
        },
        {
          "displayName": "Moonbeam",
          "manufacturer": "Declasse",
          "price": 16250,
          "weightKG": 2400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 102,
          "gameMaxSpeedKPH": 125,
          "model": "moonbeam",
          "hash": 525509695,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 34.722225189208984,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 2,
          "maxAcceleration": 0.20999999344348907
        },
        {
          "displayName": "Sheriff SUV",
          "manufacturer": "Declasse",
          "price": 100000,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 96,
          "gameMaxSpeedKPH": 140,
          "model": "sheriff2",
          "hash": 1922257928,
          "class": {
            "id": 18,
            "name": "Emergency"
          },
          "seats": 8,
          "maxPassengers": 7,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Police Transporter",
          "manufacturer": "Declasse",
          "price": 100000,
          "weightKG": 2500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 90.75,
          "gameMaxSpeedKPH": 130,
          "model": "policet",
          "hash": 456714581,
          "class": {
            "id": 18,
            "name": "Emergency"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Park Ranger",
          "manufacturer": "Declasse",
          "price": 100000,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 96,
          "gameMaxSpeedKPH": 135,
          "model": "pranger",
          "hash": 741586030,
          "class": {
            "id": 18,
            "name": "Emergency"
          },
          "seats": 8,
          "maxPassengers": 7,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Lifeguard Granger",
          "manufacturer": "Declasse",
          "price": 432500,
          "weightKG": 2400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 95.25,
          "gameMaxSpeedKPH": 140,
          "model": "lguard",
          "hash": 469291905,
          "class": {
            "id": 18,
            "name": "Emergency"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "FIB (SUV)",
          "manufacturer": "Declasse",
          "price": 100000,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 96,
          "gameMaxSpeedKPH": 140,
          "model": "fbi2",
          "hash": 2647026068,
          "class": {
            "id": 18,
            "name": "Emergency"
          },
          "seats": 8,
          "maxPassengers": 7,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Rhapsody",
          "manufacturer": "Declasse",
          "price": 70000,
          "weightKG": 1350,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 102.25,
          "gameMaxSpeedKPH": 133,
          "model": "rhapsody",
          "hash": 841808271,
          "class": {
            "id": 0,
            "name": "Compacts"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.9444465637207,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.23000000417232513
        },
        {
          "displayName": "JB 700W",
          "manufacturer": "Dewbauchee",
          "price": 735000,
          "weightKG": 1600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 119.25,
          "gameMaxSpeedKPH": 150,
          "model": "jb7002",
          "hash": 394110044,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "Rapid GT Classic",
          "manufacturer": "Dewbauchee",
          "price": 442500,
          "weightKG": 1570,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 119.75,
          "gameMaxSpeedKPH": 149.5,
          "model": "rapidgt3",
          "hash": 2049897956,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.52777862548828,
          "maxBraking": 0.5,
          "maxTraction": 2.5999999046325684,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Vagner",
          "manufacturer": "Dewbauchee",
          "price": 767500,
          "weightKG": 1000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 126.75,
          "gameMaxSpeedKPH": 160.9,
          "model": "vagner",
          "hash": 1939284556,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.6944465637207,
          "maxBraking": 1.1200000047683716,
          "maxTraction": 3.0256502628326416,
          "maxAcceleration": 0.3700000047683716
        },
        {
          "displayName": "JB 700",
          "manufacturer": "Dewbauchee",
          "price": 175000,
          "weightKG": 1600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 119.25,
          "gameMaxSpeedKPH": 150,
          "model": "jb700",
          "hash": 1051415893,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "Specter Custom",
          "manufacturer": "Dewbauchee",
          "price": 126000,
          "weightKG": 1450,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 121.25,
          "gameMaxSpeedKPH": 155.2,
          "model": "specter2",
          "hash": 1074745671,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 43.11111068725586,
          "maxBraking": 1.100000023841858,
          "maxTraction": 2.8335375785827637,
          "maxAcceleration": 0.33000001311302185
        },
        {
          "displayName": "Specter",
          "manufacturer": "Dewbauchee",
          "price": 299500,
          "weightKG": 1550,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 121.25,
          "gameMaxSpeedKPH": 155,
          "model": "specter",
          "hash": 1886268224,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.05555725097656,
          "maxBraking": 1,
          "maxTraction": 2.619999885559082,
          "maxAcceleration": 0.3199999928474426
        },
        {
          "displayName": "Seven-70",
          "manufacturer": "Dewbauchee",
          "price": 347500,
          "weightKG": 1650,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 123.5,
          "gameMaxSpeedKPH": 159,
          "model": "seven70",
          "hash": 2537130571,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.16666793823242,
          "maxBraking": 1,
          "maxTraction": 2.559999942779541,
          "maxAcceleration": 0.33500000834465027
        },
        {
          "displayName": "Rapid GT Sports",
          "manufacturer": "Dewbauchee",
          "price": 70000,
          "weightKG": 1600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 119.5,
          "gameMaxSpeedKPH": 152,
          "model": "rapidgt2",
          "hash": 1737773231,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 42.222225189208984,
          "maxBraking": 1,
          "maxTraction": 2.450000047683716,
          "maxAcceleration": 0.36000001430511475
        },
        {
          "displayName": "Rapid GT",
          "manufacturer": "Dewbauchee",
          "price": 66000,
          "weightKG": 1600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 119.5,
          "gameMaxSpeedKPH": 152,
          "model": "rapidgt",
          "hash": 2360515092,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 42.222225189208984,
          "maxBraking": 1,
          "maxTraction": 2.450000047683716,
          "maxAcceleration": 0.36000001430511475
        },
        {
          "displayName": "Massacro (Racecar)",
          "manufacturer": "Dewbauchee",
          "price": 192500,
          "weightKG": 1700,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 121.75,
          "gameMaxSpeedKPH": 156.199997,
          "model": "massacro2",
          "hash": 3663206819,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 43.38888931274414,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.430000066757202,
          "maxAcceleration": 0.36399999260902405
        },
        {
          "displayName": "Massacro",
          "manufacturer": "Dewbauchee",
          "price": 137500,
          "weightKG": 1700,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 121.75,
          "gameMaxSpeedKPH": 156.199997,
          "model": "massacro",
          "hash": 4152024626,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.38888931274414,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.4200000762939453,
          "maxAcceleration": 0.36399999260902405
        },
        {
          "displayName": "Exemplar",
          "manufacturer": "Dewbauchee",
          "price": 600000,
          "weightKG": 1800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 117.25,
          "gameMaxSpeedKPH": 145,
          "model": "exemplar",
          "hash": 4289813342,
          "class": {
            "id": 3,
            "name": "Coupes"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.5999999046325684,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "Blista Kanjo",
          "manufacturer": "Dinka",
          "price": 290000,
          "weightKG": 1150,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 109.25,
          "gameMaxSpeedKPH": 140,
          "model": "kanjo",
          "hash": 409049982,
          "class": {
            "id": 0,
            "name": "Compacts"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.5,
          "maxTraction": 1.9700000286102295,
          "maxAcceleration": 0.3199999928474426
        },
        {
          "displayName": "Sugoi",
          "manufacturer": "Dinka",
          "price": 612000,
          "weightKG": 1380,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 119.25,
          "gameMaxSpeedKPH": 156,
          "model": "sugoi",
          "hash": 987469656,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.333335876464844,
          "maxBraking": 0.8500000238418579,
          "maxTraction": 12.076499938964844,
          "maxAcceleration": 0.3100000023841858
        },
        {
          "displayName": "Jester Classic",
          "manufacturer": "Dinka",
          "price": 395000,
          "weightKG": 1600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 119.75,
          "gameMaxSpeedKPH": 156,
          "model": "jester3",
          "hash": 4080061290,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.333335876464844,
          "maxBraking": 0.949999988079071,
          "maxTraction": 2.575000047683716,
          "maxAcceleration": 0.3199999928474426
        },
        {
          "displayName": "Jester (Racecar)",
          "manufacturer": "Dinka",
          "price": 175000,
          "weightKG": 1300,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 119.25,
          "gameMaxSpeedKPH": 158,
          "model": "jester2",
          "hash": 3188613414,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 43.88888931274414,
          "maxBraking": 0.949999988079071,
          "maxTraction": 2.569999933242798,
          "maxAcceleration": 0.3100000023841858
        },
        {
          "displayName": "Jester",
          "manufacturer": "Dinka",
          "price": 120000,
          "weightKG": 1300,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 118.75,
          "gameMaxSpeedKPH": 158,
          "model": "jester",
          "hash": 2997294755,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.88888931274414,
          "maxBraking": 0.949999988079071,
          "maxTraction": 2.549999952316284,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Go Go Monkey Blista",
          "manufacturer": "Dinka",
          "price": 100000,
          "weightKG": 1050,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 103,
          "gameMaxSpeedKPH": 132,
          "model": "blista3",
          "hash": 3703315515,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.66666793823242,
          "maxBraking": 0.550000011920929,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.23000000417232513
        },
        {
          "displayName": "Blista Compact",
          "manufacturer": "Dinka",
          "price": 21000,
          "weightKG": 1050,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 103,
          "gameMaxSpeedKPH": 132,
          "model": "blista2",
          "hash": 1039032026,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.66666793823242,
          "maxBraking": 0.550000011920929,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.23000000417232513
        },
        {
          "displayName": "Vindicator",
          "manufacturer": "Dinka",
          "price": 315000,
          "weightKG": 280,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 121.25,
          "gameMaxSpeedKPH": 148,
          "model": "vindicator",
          "hash": 2941886209,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.111114501953125,
          "maxBraking": 1.5199999809265137,
          "maxTraction": 1.9800000190734863,
          "maxAcceleration": 0.2630000114440918
        },
        {
          "displayName": "Thrust",
          "manufacturer": "Dinka",
          "price": 37500,
          "weightKG": 270,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 118.25,
          "gameMaxSpeedKPH": 152,
          "model": "thrust",
          "hash": 1836027715,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 42.222225189208984,
          "maxBraking": 1.5,
          "maxTraction": 1.9800000190734863,
          "maxAcceleration": 0.26499998569488525
        },
        {
          "displayName": "Enduro",
          "manufacturer": "Dinka",
          "price": 24000,
          "weightKG": 220,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 107.25,
          "gameMaxSpeedKPH": 119,
          "model": "enduro",
          "hash": 1753414259,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 33.05555725097656,
          "maxBraking": 1.0499999523162842,
          "maxTraction": 2.1600000858306885,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Double-T",
          "manufacturer": "Dinka",
          "price": 6000,
          "weightKG": 200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 118,
          "gameMaxSpeedKPH": 147,
          "model": "double",
          "hash": 2623969160,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.833335876464844,
          "maxBraking": 1.399999976158142,
          "maxTraction": 2.180000066757202,
          "maxAcceleration": 0.3100000023841858
        },
        {
          "displayName": "Akuma",
          "manufacturer": "Dinka",
          "price": 4500,
          "weightKG": 250,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 121.25,
          "gameMaxSpeedKPH": 145,
          "model": "akuma",
          "hash": 1672195559,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.4000000059604645
        },
        {
          "displayName": "Blista",
          "manufacturer": "Dinka",
          "price": 8000,
          "weightKG": 1200,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 104.5,
          "gameMaxSpeedKPH": 135,
          "model": "blista",
          "hash": 3950024287,
          "class": {
            "id": 0,
            "name": "Compacts"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.23000000417232513
        },
        {
          "displayName": "Marquis",
          "manufacturer": "Dinka",
          "price": 206995,
          "weightKG": 12200,
          "drivetrain": null,
          "realMaxSpeedMPH": 26.25,
          "gameMaxSpeedKPH": 30,
          "model": "marquis",
          "hash": 3251507587,
          "class": {
            "id": 14,
            "name": "Boats"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 8.333333969116211,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 0,
          "maxAcceleration": 2.5
        },
        {
          "displayName": "Landstalker",
          "manufacturer": "Dundreary",
          "price": 29000,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 99.25,
          "gameMaxSpeedKPH": 135,
          "model": "landstalker",
          "hash": 1269098716,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.18000000715255737
        },
        {
          "displayName": "Stretch",
          "manufacturer": "Dundreary",
          "price": 15000,
          "weightKG": 2400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 94.25,
          "gameMaxSpeedKPH": 135,
          "model": "stretch",
          "hash": 2333339779,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 6,
          "maxPassengers": 5,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.800000011920929,
          "maxTraction": 1.850000023841858,
          "maxAcceleration": 0.17000000178813934
        },
        {
          "displayName": "Regina",
          "manufacturer": "Dundreary",
          "price": 4000,
          "weightKG": 1900,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 86.25,
          "gameMaxSpeedKPH": 120,
          "model": "regina",
          "hash": 4280472072,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 33.333335876464844,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.899999976158142,
          "maxAcceleration": 0.14000000059604645
        },
        {
          "displayName": "Virgo Classic Custom",
          "manufacturer": "Dundreary",
          "price": 120000,
          "weightKG": 2300,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 104,
          "gameMaxSpeedKPH": 134,
          "model": "virgo2",
          "hash": 3395457658,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.222225189208984,
          "maxBraking": 0.7200000286102295,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.210999995470047
        },
        {
          "displayName": "Virgo Classic",
          "manufacturer": "Dundreary",
          "price": 82500,
          "weightKG": 2200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 96.75,
          "gameMaxSpeedKPH": 134,
          "model": "virgo3",
          "hash": 16646064,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.222225189208984,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.20999999344348907
        },
        {
          "displayName": "Habanero",
          "manufacturer": "Emperor",
          "price": 21000,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 104.75,
          "gameMaxSpeedKPH": 137,
          "model": "habanero",
          "hash": 884422927,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.05555725097656,
          "maxBraking": 0.25,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.18000000715255737
        },
        {
          "displayName": "ETR1",
          "manufacturer": "Emperor",
          "price": 997500,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 120.75,
          "gameMaxSpeedKPH": 158.5,
          "model": "sheava",
          "hash": 819197656,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.02777862548828,
          "maxBraking": 1,
          "maxTraction": 2.9282500743865967,
          "maxAcceleration": 0.33000001311302185
        },
        {
          "displayName": "Paragon R (Armored)",
          "manufacturer": "Enus",
          "price": 100000,
          "weightKG": 2555,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": null,
          "gameMaxSpeedKPH": 160,
          "model": "paragon2",
          "hash": 1416466158,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 44.4444465637207,
          "maxBraking": 0.949999988079071,
          "maxTraction": 2.674999952316284,
          "maxAcceleration": 0.32749998569488525
        },
        {
          "displayName": "Paragon R",
          "manufacturer": "Enus",
          "price": 452500,
          "weightKG": 2415,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 123.25,
          "gameMaxSpeedKPH": 159.9,
          "model": "paragon",
          "hash": 3847255899,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.41666793823242,
          "maxBraking": 1,
          "maxTraction": 2.674999952316284,
          "maxAcceleration": 0.32899999618530273
        },
        {
          "displayName": "Stafford",
          "manufacturer": "Enus",
          "price": 636000,
          "weightKG": 2110,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 93.5,
          "gameMaxSpeedKPH": 120,
          "model": "stafford",
          "hash": 321186144,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 33.333335876464844,
          "maxBraking": 0.44999998807907104,
          "maxTraction": 2,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Huntley S",
          "manufacturer": "Enus",
          "price": 97500,
          "weightKG": 2500,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 108.25,
          "gameMaxSpeedKPH": 136,
          "model": "huntley",
          "hash": 486987393,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.77777862548828,
          "maxBraking": 0.550000011920929,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.26499998569488525
        },
        {
          "displayName": "Super Diamond",
          "manufacturer": "Enus",
          "price": 125000,
          "weightKG": 2800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 111.75,
          "gameMaxSpeedKPH": 145,
          "model": "superd",
          "hash": 1123216662,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "Cognoscenti 55 (Armored)",
          "manufacturer": "Enus",
          "price": 198000,
          "weightKG": 2600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 112.25,
          "gameMaxSpeedKPH": 145,
          "model": "cog552",
          "hash": 704435172,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.550000011920929,
          "maxTraction": 2.200000047683716,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "Cognoscenti 55",
          "manufacturer": "Enus",
          "price": 77000,
          "weightKG": 2500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 112.5,
          "gameMaxSpeedKPH": 145,
          "model": "cog55",
          "hash": 906642318,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.5699999928474426,
          "maxTraction": 2.200000047683716,
          "maxAcceleration": 0.26499998569488525
        },
        {
          "displayName": "Cognoscenti (Armored)",
          "manufacturer": "Enus",
          "price": 279000,
          "weightKG": 2800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 109.75,
          "gameMaxSpeedKPH": 140,
          "model": "cognoscenti2",
          "hash": 3690124666,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.5199999809265137,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.2549999952316284
        },
        {
          "displayName": "Cognoscenti",
          "manufacturer": "Enus",
          "price": 127000,
          "weightKG": 2700,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 110,
          "gameMaxSpeedKPH": 140,
          "model": "cognoscenti",
          "hash": 2264796000,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.550000011920929,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "Windsor Drop",
          "manufacturer": "Enus",
          "price": 1000000,
          "weightKG": 3000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 118,
          "gameMaxSpeedKPH": 150,
          "model": "windsor2",
          "hash": 2364918497,
          "class": {
            "id": 3,
            "name": "Coupes"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.200000047683716,
          "maxAcceleration": 0.27900001406669617
        },
        {
          "displayName": "Windsor",
          "manufacturer": "Enus",
          "price": 890000,
          "weightKG": 2800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 118,
          "gameMaxSpeedKPH": 150,
          "model": "windsor",
          "hash": 1581459400,
          "class": {
            "id": 3,
            "name": "Coupes"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.200000047683716,
          "maxAcceleration": 0.2800000011920929
        },
        {
          "displayName": "Cognoscenti Cabrio",
          "manufacturer": "Enus",
          "price": 92500,
          "weightKG": 2100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 110,
          "gameMaxSpeedKPH": 145,
          "model": "cogcabrio",
          "hash": 330661258,
          "class": {
            "id": 3,
            "name": "Coupes"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.299999952316284,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "FQ 2",
          "manufacturer": "Fathom",
          "price": 25000,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 104,
          "gameMaxSpeedKPH": 135,
          "model": "fq2",
          "hash": 3157435195,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.25,
          "maxTraction": 2,
          "maxAcceleration": 0.18000000715255737
        },
        {
          "displayName": "Baller LE LWB (Armored)",
          "manufacturer": "Gallivanter",
          "price": 256500,
          "weightKG": 2550,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 107.75,
          "gameMaxSpeedKPH": 135,
          "model": "baller6",
          "hash": 666166960,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.550000011920929,
          "maxTraction": 2,
          "maxAcceleration": 0.26499998569488525
        },
        {
          "displayName": "Baller LE LWB",
          "manufacturer": "Gallivanter",
          "price": 123500,
          "weightKG": 2450,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 108.25,
          "gameMaxSpeedKPH": 135,
          "model": "baller4",
          "hash": 634118882,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.5699999928474426,
          "maxTraction": 2,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Baller LE (Armored)",
          "manufacturer": "Gallivanter",
          "price": 187000,
          "weightKG": 2275,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 108.25,
          "gameMaxSpeedKPH": 135,
          "model": "baller5",
          "hash": 470404958,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.5799999833106995,
          "maxTraction": 2,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Baller LE",
          "manufacturer": "Gallivanter",
          "price": 74500,
          "weightKG": 2175,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 108.75,
          "gameMaxSpeedKPH": 135,
          "model": "baller3",
          "hash": 1878062887,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2,
          "maxAcceleration": 0.2750000059604645
        },
        {
          "displayName": "Baller II",
          "manufacturer": "Gallivanter",
          "price": 90000,
          "weightKG": 2200,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 108.25,
          "gameMaxSpeedKPH": 135,
          "model": "baller2",
          "hash": 142944341,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Baller",
          "manufacturer": "Gallivanter",
          "price": 90000,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 100,
          "gameMaxSpeedKPH": 130,
          "model": "baller",
          "hash": 3486135912,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.899999976158142,
          "maxAcceleration": 0.20999999344348907
        },
        {
          "displayName": "Furia",
          "manufacturer": "Grotti",
          "price": 1370000,
          "weightKG": 1898,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 122,
          "gameMaxSpeedKPH": 161.2,
          "model": "furia",
          "hash": 960812448,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.77777862548828,
          "maxBraking": 1,
          "maxTraction": 2.700000047683716,
          "maxAcceleration": 0.36500000953674316
        },
        {
          "displayName": "Itali GTO",
          "manufacturer": "Grotti",
          "price": 982500,
          "weightKG": 1520,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 127.75,
          "gameMaxSpeedKPH": 161.2,
          "model": "italigto",
          "hash": 3963499524,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.77777862548828,
          "maxBraking": 1.100000023841858,
          "maxTraction": 2.619999885559082,
          "maxAcceleration": 0.4000000059604645
        },
        {
          "displayName": "GT500",
          "manufacturer": "Grotti",
          "price": 392500,
          "weightKG": 800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 110.75,
          "gameMaxSpeedKPH": 140.2,
          "model": "gt500",
          "hash": 2215179066,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.9444465637207,
          "maxBraking": 0.7699999809265137,
          "maxTraction": 2.200000047683716,
          "maxAcceleration": 0.28999999165534973
        },
        {
          "displayName": "Vigilante",
          "manufacturer": "Grotti",
          "price": 1875000,
          "weightKG": 7500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 147,
          "gameMaxSpeedKPH": 160.02,
          "model": "vigilante",
          "hash": 3052358707,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 44.45000457763672,
          "maxBraking": 1.0199999809265137,
          "maxTraction": 2.7750000953674316,
          "maxAcceleration": 0.375
        },
        {
          "displayName": "X80 Proto",
          "manufacturer": "Grotti",
          "price": 1350000,
          "weightKG": 900,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 127.5,
          "gameMaxSpeedKPH": 161,
          "model": "prototipo",
          "hash": 2123327359,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.722225189208984,
          "maxBraking": 1.100000023841858,
          "maxTraction": 2.700000047683716,
          "maxAcceleration": 0.375
        },
        {
          "displayName": "Visione",
          "manufacturer": "Grotti",
          "price": 1125000,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 125.25,
          "gameMaxSpeedKPH": 160,
          "model": "visione",
          "hash": 3296789504,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.4444465637207,
          "maxBraking": 1.0199999809265137,
          "maxTraction": 2.942500114440918,
          "maxAcceleration": 0.35499998927116394
        },
        {
          "displayName": "Turismo R",
          "manufacturer": "Grotti",
          "price": 250000,
          "weightKG": 1350,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 121.75,
          "gameMaxSpeedKPH": 155,
          "model": "turismor",
          "hash": 408192225,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.05555725097656,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 2.640000104904175,
          "maxAcceleration": 0.3529999852180481
        },
        {
          "displayName": "Cheetah",
          "manufacturer": "Grotti",
          "price": 325000,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 120.25,
          "gameMaxSpeedKPH": 153,
          "model": "cheetah",
          "hash": 2983812512,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 42.500003814697266,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.6500000953674316,
          "maxAcceleration": 0.3199999928474426
        },
        {
          "displayName": "Turismo Classic",
          "manufacturer": "Grotti",
          "price": 352500,
          "weightKG": 1100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 120.75,
          "gameMaxSpeedKPH": 152.5,
          "model": "turismo2",
          "hash": 3312836369,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 42.361114501953125,
          "maxBraking": 0.5,
          "maxTraction": 2.6500000953674316,
          "maxAcceleration": 0.3400000035762787
        },
        {
          "displayName": "Stinger GT",
          "manufacturer": "Grotti",
          "price": 437500,
          "weightKG": 1100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 112,
          "gameMaxSpeedKPH": 145,
          "model": "stingergt",
          "hash": 2196019706,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "Stinger",
          "manufacturer": "Grotti",
          "price": 425000,
          "weightKG": 1100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 112,
          "gameMaxSpeedKPH": 145,
          "model": "stinger",
          "hash": 1545842587,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "Cheetah Classic",
          "manufacturer": "Grotti",
          "price": 432500,
          "weightKG": 1500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 120.25,
          "gameMaxSpeedKPH": 152,
          "model": "cheetah2",
          "hash": 223240013,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 42.222225189208984,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.6500000953674316,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Carbonizzare",
          "manufacturer": "Grotti",
          "price": 97500,
          "weightKG": 1600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 119.5,
          "gameMaxSpeedKPH": 158,
          "model": "carbonizzare",
          "hash": 2072687711,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.380000114440918,
          "maxAcceleration": 0.3499999940395355
        },
        {
          "displayName": "Bestia GTS",
          "manufacturer": "Grotti",
          "price": 305000,
          "weightKG": 1800,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 118.75,
          "gameMaxSpeedKPH": 155,
          "model": "bestiagts",
          "hash": 1274868363,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.05555725097656,
          "maxBraking": 1,
          "maxTraction": 2.4200000762939453,
          "maxAcceleration": 0.3199999928474426
        },
        {
          "displayName": "Brioso R/A",
          "manufacturer": "Grotti",
          "price": 77500,
          "weightKG": 850,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 103.75,
          "gameMaxSpeedKPH": 135,
          "model": "brioso",
          "hash": 1549126457,
          "class": {
            "id": 0,
            "name": "Compacts"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.299999952316284,
          "maxAcceleration": 0.28999999165534973
        },
        {
          "displayName": "Ruston",
          "manufacturer": "Hijak",
          "price": 215000,
          "weightKG": 800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 116.25,
          "gameMaxSpeedKPH": 148,
          "model": "ruston",
          "hash": 719660200,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.111114501953125,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 2.7046496868133545,
          "maxAcceleration": 0.32499998807907104
        },
        {
          "displayName": "Khamelion",
          "manufacturer": "Hijak",
          "price": 50000,
          "weightKG": 1800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 102.25,
          "gameMaxSpeedKPH": 140,
          "model": "khamelion",
          "hash": 544021352,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.5999999046325684,
          "maxAcceleration": 0.15000000596046448
        },
        {
          "displayName": "Nightmare Scarab",
          "manufacturer": "HVY",
          "price": 1538145,
          "weightKG": 5000,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 119.5,
          "gameMaxSpeedKPH": 100,
          "model": "scarab3",
          "hash": 3715219435,
          "class": {
            "id": 19,
            "name": "Military"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.25,
          "maxAcceleration": 0.10000000149011612
        },
        {
          "displayName": "Future Shock Scarab",
          "manufacturer": "HVY",
          "price": 1538145,
          "weightKG": 5000,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 119.5,
          "gameMaxSpeedKPH": 100,
          "model": "scarab2",
          "hash": 1542143200,
          "class": {
            "id": 19,
            "name": "Military"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.25,
          "maxAcceleration": 0.10000000149011612
        },
        {
          "displayName": "Apocalypse Scarab",
          "manufacturer": "HVY",
          "price": 1538145,
          "weightKG": 5000,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 119.5,
          "gameMaxSpeedKPH": 100,
          "model": "scarab",
          "hash": 3147997943,
          "class": {
            "id": 19,
            "name": "Military"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.25,
          "maxAcceleration": 0.10000000149011612
        },
        {
          "displayName": "Menacer",
          "manufacturer": "HVY",
          "price": 887500,
          "weightKG": 5600,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 94.25,
          "gameMaxSpeedKPH": 130,
          "model": "menacer",
          "hash": 2044532910,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 5,
          "maxPassengers": 4,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Mixer II",
          "manufacturer": "HVY",
          "price": 100000,
          "weightKG": 6000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 84.5,
          "gameMaxSpeedKPH": 110,
          "model": "mixer2",
          "hash": 475220373,
          "class": {
            "id": 10,
            "name": "Industrial"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 30.555557250976562,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 1.600000023841858,
          "maxAcceleration": 0.10999999940395355
        },
        {
          "displayName": "Chernobog",
          "manufacturer": "HVY",
          "price": 1655850,
          "weightKG": 40000,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 70.25,
          "gameMaxSpeedKPH": 95,
          "model": "chernobog",
          "hash": 3602674979,
          "class": {
            "id": 19,
            "name": "Military"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 26.38888931274414,
          "maxBraking": 0.10000000149011612,
          "maxTraction": 2,
          "maxAcceleration": 0.11999999731779099
        },
        {
          "displayName": "Ripley",
          "manufacturer": "HVY",
          "price": 100000,
          "weightKG": 9500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 55.5,
          "gameMaxSpeedKPH": 70,
          "model": "ripley",
          "hash": 3448987385,
          "class": {
            "id": 11,
            "name": "Utility"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 19.44444465637207,
          "maxBraking": 0.20000000298023224,
          "maxTraction": 1.350000023841858,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Forklift",
          "manufacturer": "HVY",
          "price": 100000,
          "weightKG": 6000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 35.5,
          "gameMaxSpeedKPH": 30,
          "model": "forklift",
          "hash": 1491375716,
          "class": {
            "id": 11,
            "name": "Utility"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 8.333333969116211,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 1.149999976158142,
          "maxAcceleration": 0.18000000715255737
        },
        {
          "displayName": "Docktug",
          "manufacturer": "HVY",
          "price": 100000,
          "weightKG": 10400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 56,
          "gameMaxSpeedKPH": 80,
          "model": "docktug",
          "hash": 3410276810,
          "class": {
            "id": 11,
            "name": "Utility"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 22.22222328186035,
          "maxBraking": 0.5,
          "maxTraction": 1.399999976158142,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Airtug",
          "manufacturer": "HVY",
          "price": 100000,
          "weightKG": 1400,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 29.25,
          "gameMaxSpeedKPH": 40,
          "model": "airtug",
          "hash": 1560980623,
          "class": {
            "id": 11,
            "name": "Utility"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 11.111111640930176,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 1.149999976158142,
          "maxAcceleration": 0.05999999865889549
        },
        {
          "displayName": "Nightshark",
          "manufacturer": "HVY",
          "price": 622500,
          "weightKG": 4400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 104.75,
          "gameMaxSpeedKPH": 140,
          "model": "nightshark",
          "hash": 433954513,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.75,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Insurgent Pick-up Custom",
          "manufacturer": "HVY",
          "price": 101250,
          "weightKG": 8600,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 99.25,
          "gameMaxSpeedKPH": 130,
          "model": "insurgent3",
          "hash": 2370534026,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 9,
          "maxPassengers": 8,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2,
          "maxAcceleration": 0.23999999463558197
        },
        {
          "displayName": "Insurgent Pick-up",
          "manufacturer": "HVY",
          "price": 897750,
          "weightKG": 8600,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 91.5,
          "gameMaxSpeedKPH": 130,
          "model": "insurgent",
          "hash": 2434067162,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 9,
          "maxPassengers": 8,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2,
          "maxAcceleration": 0.23999999463558197
        },
        {
          "displayName": "Insurgent",
          "manufacturer": "HVY",
          "price": 448875,
          "weightKG": 8600,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 98.25,
          "gameMaxSpeedKPH": 130,
          "model": "insurgent2",
          "hash": 2071877360,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 6,
          "maxPassengers": 5,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2,
          "maxAcceleration": 0.23999999463558197
        },
        {
          "displayName": "Barracks Semi",
          "manufacturer": "HVY",
          "price": 100000,
          "weightKG": 10000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 82.5,
          "gameMaxSpeedKPH": 110,
          "model": "barracks2",
          "hash": 1074326203,
          "class": {
            "id": 19,
            "name": "Military"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 30.555557250976562,
          "maxBraking": 1,
          "maxTraction": 1.5499999523162842,
          "maxAcceleration": 0.23000000417232513
        },
        {
          "displayName": "Barracks",
          "manufacturer": "HVY",
          "price": 225000,
          "weightKG": 9000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 82.5,
          "gameMaxSpeedKPH": 110,
          "model": "barracks",
          "hash": 3471458123,
          "class": {
            "id": 19,
            "name": "Military"
          },
          "seats": 10,
          "maxPassengers": 9,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 30.555557250976562,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 1.649999976158142,
          "maxAcceleration": 0.10999999940395355
        },
        {
          "displayName": "Barracks II",
          "manufacturer": "HVY",
          "price": 225000,
          "weightKG": 9000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 82.5,
          "gameMaxSpeedKPH": 110,
          "model": "barracks3",
          "hash": 630371791,
          "class": {
            "id": 19,
            "name": "Military"
          },
          "seats": 10,
          "maxPassengers": 9,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 30.555557250976562,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 1.649999976158142,
          "maxAcceleration": 0.10999999940395355
        },
        {
          "displayName": "APC Tank",
          "manufacturer": "HVY",
          "price": 1546125,
          "weightKG": 10600,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 63,
          "gameMaxSpeedKPH": 97,
          "model": "apc",
          "hash": 562680400,
          "class": {
            "id": 19,
            "name": "Military"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 26.944446563720703,
          "maxBraking": 0.20000000298023224,
          "maxTraction": 2.4000000953674316,
          "maxAcceleration": 0.20999999344348907
        },
        {
          "displayName": "Mixer",
          "manufacturer": "HVY",
          "price": 100000,
          "weightKG": 6000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 84.5,
          "gameMaxSpeedKPH": 110,
          "model": "mixer",
          "hash": 3510150843,
          "class": {
            "id": 10,
            "name": "Industrial"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 30.555557250976562,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 1.600000023841858,
          "maxAcceleration": 0.10999999940395355
        },
        {
          "displayName": "Dump",
          "manufacturer": "HVY",
          "price": 500000,
          "weightKG": 35000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 32,
          "gameMaxSpeedKPH": 43,
          "model": "dump",
          "hash": 2164484578,
          "class": {
            "id": 10,
            "name": "Industrial"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 11.94444465637207,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 1.4500000476837158,
          "maxAcceleration": 0.1899999976158142
        },
        {
          "displayName": "Dozer",
          "manufacturer": "HVY",
          "price": 100000,
          "weightKG": 20000,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 11,
          "gameMaxSpeedKPH": 15,
          "model": "bulldozer",
          "hash": 1886712733,
          "class": {
            "id": 10,
            "name": "Industrial"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 4.1666669845581055,
          "maxBraking": 0.20000000298023224,
          "maxTraction": 1.100000023841858,
          "maxAcceleration": 0.14000000059604645
        },
        {
          "displayName": "Dock Handler",
          "manufacturer": "HVY",
          "price": 100000,
          "weightKG": 6000,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 31.75,
          "gameMaxSpeedKPH": 25,
          "model": "handler",
          "hash": 444583674,
          "class": {
            "id": 10,
            "name": "Industrial"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 6.94444465637207,
          "maxBraking": 0.10000000149011612,
          "maxTraction": 1.850000023841858,
          "maxAcceleration": 0.14000000059604645
        },
        {
          "displayName": "Cutter",
          "manufacturer": "HVY",
          "price": 100000,
          "weightKG": 25000,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 30.25,
          "gameMaxSpeedKPH": 40,
          "model": "cutter",
          "hash": 3288047904,
          "class": {
            "id": 10,
            "name": "Industrial"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 11.111111640930176,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 1.6200000047683716,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Skylift",
          "manufacturer": "HVY",
          "price": 100000,
          "weightKG": 10000,
          "drivetrain": null,
          "realMaxSpeedMPH": 115,
          "gameMaxSpeedKPH": 160,
          "model": "skylift",
          "hash": 1044954915,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 47.93147277832031,
          "maxBraking": 2.2546963691711426,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 4.703999996185303
        },
        {
          "displayName": "Biff",
          "manufacturer": "HVY",
          "price": 100000,
          "weightKG": 9000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 83.5,
          "gameMaxSpeedKPH": 110,
          "model": "biff",
          "hash": 850991848,
          "class": {
            "id": 20,
            "name": "Commercial"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 30.555557250976562,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 1.649999976158142,
          "maxAcceleration": 0.11999999731779099
        },
        {
          "displayName": "Deluxo",
          "manufacturer": "Imponte",
          "price": 2360750,
          "weightKG": 1600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 127.25,
          "gameMaxSpeedKPH": 140,
          "model": "deluxo",
          "hash": 1483171323,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.22750000655651093
        },
        {
          "displayName": "Ruiner 2000",
          "manufacturer": "Imponte",
          "price": 2872800,
          "weightKG": 1300,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 119,
          "gameMaxSpeedKPH": 152,
          "model": "ruiner2",
          "hash": 941494461,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 42.222225189208984,
          "maxBraking": 1,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.33000001311302185
        },
        {
          "displayName": "Ruiner",
          "manufacturer": "Imponte",
          "price": 5000,
          "weightKG": 1300,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 118.75,
          "gameMaxSpeedKPH": 145,
          "model": "ruiner",
          "hash": 4067225593,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.200000047683716,
          "maxAcceleration": 0.2800000011920929
        },
        {
          "displayName": "Ruiner II",
          "manufacturer": "Imponte",
          "price": 5000,
          "weightKG": 1300,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 118.75,
          "gameMaxSpeedKPH": 145,
          "model": "ruiner3",
          "hash": 777714999,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.200000047683716,
          "maxAcceleration": 0.2800000011920929
        },
        {
          "displayName": "Phoenix",
          "manufacturer": "Imponte",
          "price": 170000,
          "weightKG": 1700,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 113,
          "gameMaxSpeedKPH": 145,
          "model": "phoenix",
          "hash": 2199527893,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.2800000011920929
        },
        {
          "displayName": "Nightshade",
          "manufacturer": "Imponte",
          "price": 292500,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 104.5,
          "gameMaxSpeedKPH": 145,
          "model": "nightshade",
          "hash": 2351681756,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.25,
          "maxAcceleration": 0.25
        },
        {
          "displayName": "Dukes",
          "manufacturer": "Imponte",
          "price": 31000,
          "weightKG": 1600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 112.5,
          "gameMaxSpeedKPH": 144,
          "model": "dukes",
          "hash": 723973206,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.25,
          "maxAcceleration": 0.3199999928474426
        },
        {
          "displayName": "Duke O'Death",
          "manufacturer": "Imponte",
          "price": 332500,
          "weightKG": 5000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 114.25,
          "gameMaxSpeedKPH": 152,
          "model": "dukes2",
          "hash": 3968823444,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 42.222225189208984,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.259999990463257,
          "maxAcceleration": 0.3499999940395355
        },
        {
          "displayName": "Coquette Classic",
          "manufacturer": "Invetero",
          "price": 332500,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 118,
          "gameMaxSpeedKPH": 151,
          "model": "coquette2",
          "hash": 1011753235,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.9444465637207,
          "maxBraking": 0.5,
          "maxTraction": 2.299999952316284,
          "maxAcceleration": 0.3400000035762787
        },
        {
          "displayName": "Coquette",
          "manufacturer": "Invetero",
          "price": 69000,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 119.25,
          "gameMaxSpeedKPH": 152,
          "model": "coquette",
          "hash": 108773431,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 42.222225189208984,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.549999952316284,
          "maxAcceleration": 0.33000001311302185
        },
        {
          "displayName": "Coquette BlackFin",
          "manufacturer": "Invetero",
          "price": 347500,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 114.25,
          "gameMaxSpeedKPH": 151,
          "model": "coquette3",
          "hash": 784565758,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.9444465637207,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.25,
          "maxAcceleration": 0.28999999165534973
        },
        {
          "displayName": "Lawn Mower",
          "manufacturer": "Jacksheepe",
          "price": 100000,
          "weightKG": 400,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 14.75,
          "gameMaxSpeedKPH": 20,
          "model": "mower",
          "hash": 1783355638,
          "class": {
            "id": 11,
            "name": "Utility"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 5.555555820465088,
          "maxBraking": 0.5,
          "maxTraction": 1.350000023841858,
          "maxAcceleration": 0.05000000074505806
        },
        {
          "displayName": "Trashmaster",
          "manufacturer": "JoBuilt",
          "price": 100000,
          "weightKG": 9000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 82.5,
          "gameMaxSpeedKPH": 110,
          "model": "trash",
          "hash": 1917016601,
          "class": {
            "id": 17,
            "name": "Service"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 30.555557250976562,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 1.5499999523162842,
          "maxAcceleration": 0.12999999523162842
        },
        {
          "displayName": "Trashmaster II",
          "manufacturer": "JoBuilt",
          "price": 100000,
          "weightKG": 9000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 82.5,
          "gameMaxSpeedKPH": 110,
          "model": "trash2",
          "hash": 3039269212,
          "class": {
            "id": 17,
            "name": "Service"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 30.555557250976562,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 1.5499999523162842,
          "maxAcceleration": 0.12999999523162842
        },
        {
          "displayName": "Velum 5-Seater",
          "manufacturer": "JoBuilt",
          "price": 661675,
          "weightKG": 5000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 139.75,
          "gameMaxSpeedKPH": 268.7,
          "model": "velum2",
          "hash": 1077420264,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 5,
          "maxPassengers": 4,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 74.63624572753906,
          "maxBraking": 4.169180393218994,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 5.585999965667725
        },
        {
          "displayName": "Velum",
          "manufacturer": "JoBuilt",
          "price": 225000,
          "weightKG": 5000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 139.75,
          "gameMaxSpeedKPH": 268.7,
          "model": "velum",
          "hash": 2621610858,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 74.63624572753906,
          "maxBraking": 4.169180393218994,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 5.585999965667725
        },
        {
          "displayName": "P-996 Lazer",
          "manufacturer": "JoBuilt",
          "price": 3250000,
          "weightKG": 8000,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 195,
          "gameMaxSpeedKPH": 328.6,
          "model": "lazer",
          "hash": 3013282534,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 91.28709411621094,
          "maxBraking": 17.892271041870117,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 19.600000381469727
        },
        {
          "displayName": "Mammatus",
          "manufacturer": "JoBuilt",
          "price": 150000,
          "weightKG": 2000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 132.25,
          "gameMaxSpeedKPH": 250,
          "model": "mammatus",
          "hash": 2548391185,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 69.36756134033203,
          "maxBraking": 3.39901065826416,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 4.900000095367432
        },
        {
          "displayName": "Rubble",
          "manufacturer": "JoBuilt",
          "price": 100000,
          "weightKG": 6500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 77.5,
          "gameMaxSpeedKPH": 100,
          "model": "rubble",
          "hash": 2589662668,
          "class": {
            "id": 10,
            "name": "Industrial"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.25,
          "maxTraction": 1.600000023841858,
          "maxAcceleration": 0.14000000059604645
        },
        {
          "displayName": "Phantom Wedge",
          "manufacturer": "JoBuilt",
          "price": 1276800,
          "weightKG": 14000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 98.5,
          "gameMaxSpeedKPH": 130,
          "model": "phantom2",
          "hash": 2645431192,
          "class": {
            "id": 20,
            "name": "Commercial"
          },
          "seats": 5,
          "maxPassengers": 4,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.8500000238418579,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Phantom Custom",
          "manufacturer": "JoBuilt",
          "price": 612500,
          "weightKG": 12000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 103.5,
          "gameMaxSpeedKPH": 130,
          "model": "phantom3",
          "hash": 177270108,
          "class": {
            "id": 20,
            "name": "Commercial"
          },
          "seats": 5,
          "maxPassengers": 4,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.8500000238418579,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Phantom",
          "manufacturer": "JoBuilt",
          "price": 250000,
          "weightKG": 12000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 82.5,
          "gameMaxSpeedKPH": 123,
          "model": "phantom",
          "hash": 2157618379,
          "class": {
            "id": 20,
            "name": "Commercial"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 34.16666793823242,
          "maxBraking": 0.800000011920929,
          "maxTraction": 1.649999976158142,
          "maxAcceleration": 0.20999999344348907
        },
        {
          "displayName": "Hauler Custom",
          "manufacturer": "JoBuilt",
          "price": 700000,
          "weightKG": 11000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 102,
          "gameMaxSpeedKPH": 130,
          "model": "hauler2",
          "hash": 387748548,
          "class": {
            "id": 20,
            "name": "Commercial"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.8500000238418579,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.3199999928474426
        },
        {
          "displayName": "Hauler",
          "manufacturer": "JoBuilt",
          "price": 250000,
          "weightKG": 9000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 73.25,
          "gameMaxSpeedKPH": 115,
          "model": "hauler",
          "hash": 1518533038,
          "class": {
            "id": 20,
            "name": "Commercial"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 31.944446563720703,
          "maxBraking": 0.800000011920929,
          "maxTraction": 1.5499999523162842,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Sultan Classic",
          "manufacturer": "Karin",
          "price": 859000,
          "weightKG": 1100,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 116.5,
          "gameMaxSpeedKPH": 145,
          "model": "sultan2",
          "hash": 872704284,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.5,
          "maxTraction": 2.494999885559082,
          "maxAcceleration": 0.33000001311302185
        },
        {
          "displayName": "Everon",
          "manufacturer": "Karin",
          "price": 737500,
          "weightKG": 3250,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 106.5,
          "gameMaxSpeedKPH": 136,
          "model": "everon",
          "hash": 2538945576,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.77777862548828,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.29499998688697815
        },
        {
          "displayName": "Dilettante (Patrol)",
          "manufacturer": "Karin",
          "price": 100000,
          "weightKG": 1400,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 88.5,
          "gameMaxSpeedKPH": 130,
          "model": "dilettante2",
          "hash": 1682114128,
          "class": {
            "id": 0,
            "name": "Compacts"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.7599999904632568,
          "maxAcceleration": 0.10000000149011612
        },
        {
          "displayName": "190z",
          "manufacturer": "Karin",
          "price": 450000,
          "weightKG": 1100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 109.75,
          "gameMaxSpeedKPH": 140,
          "model": "z190",
          "hash": 838982985,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.949999988079071,
          "maxTraction": 2.299999952316284,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "BeeJay XL",
          "manufacturer": "Karin",
          "price": 13500,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 96.75,
          "gameMaxSpeedKPH": 130,
          "model": "bjxl",
          "hash": 850565707,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.1899999976158142
        },
        {
          "displayName": "Sultan RS",
          "manufacturer": "Karin",
          "price": 397500,
          "weightKG": 1250,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 117.25,
          "gameMaxSpeedKPH": 148,
          "model": "sultanrs",
          "hash": 3999278268,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.111114501953125,
          "maxBraking": 1,
          "maxTraction": 2.5,
          "maxAcceleration": 0.33000001311302185
        },
        {
          "displayName": "Sultan",
          "manufacturer": "Karin",
          "price": 6000,
          "weightKG": 1400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 115.75,
          "gameMaxSpeedKPH": 145,
          "model": "sultan",
          "hash": 970598228,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 2.3499999046325684,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "Kuruma (Armored)",
          "manufacturer": "Karin",
          "price": 349125,
          "weightKG": 3200,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 109.75,
          "gameMaxSpeedKPH": 140,
          "model": "kuruma2",
          "hash": 410882957,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.5,
          "maxTraction": 2.25,
          "maxAcceleration": 0.3100000023841858
        },
        {
          "displayName": "Kuruma",
          "manufacturer": "Karin",
          "price": 63175,
          "weightKG": 1500,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 112,
          "gameMaxSpeedKPH": 143,
          "model": "kuruma",
          "hash": 2922118804,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 39.722225189208984,
          "maxBraking": 0.5,
          "maxTraction": 2.450000047683716,
          "maxAcceleration": 0.3100000023841858
        },
        {
          "displayName": "Futo",
          "manufacturer": "Karin",
          "price": 4500,
          "weightKG": 900,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 119.25,
          "gameMaxSpeedKPH": 135,
          "model": "futo",
          "hash": 2016857647,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.5,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.28999999165534973
        },
        {
          "displayName": "Intruder",
          "manufacturer": "Karin",
          "price": 8000,
          "weightKG": 1600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 106,
          "gameMaxSpeedKPH": 145,
          "model": "intruder",
          "hash": 886934177,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.3499999046325684,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Asterope",
          "manufacturer": "Karin",
          "price": 13000,
          "weightKG": 1500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 105,
          "gameMaxSpeedKPH": 145,
          "model": "asterope",
          "hash": 2391954683,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.5,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Technical Custom",
          "manufacturer": "Karin",
          "price": 71250,
          "weightKG": 3200,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 101.5,
          "gameMaxSpeedKPH": 130,
          "model": "technical3",
          "hash": 1356124575,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 3,
          "maxPassengers": 2,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.130000114440918,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Technical Aqua",
          "manufacturer": "Karin",
          "price": 744800,
          "weightKG": 3200,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 93,
          "gameMaxSpeedKPH": 130,
          "model": "technical2",
          "hash": 1180875963,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 3,
          "maxPassengers": 2,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.130000114440918,
          "maxAcceleration": 0.25
        },
        {
          "displayName": "Technical",
          "manufacturer": "Karin",
          "price": 631750,
          "weightKG": 3200,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 93,
          "gameMaxSpeedKPH": 130,
          "model": "technical",
          "hash": 2198148358,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 3,
          "maxPassengers": 2,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.130000114440918,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Rusty Rebel",
          "manufacturer": "Karin",
          "price": 1500,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 100,
          "gameMaxSpeedKPH": 130,
          "model": "rebel",
          "hash": 3087195462,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Rebel",
          "manufacturer": "Karin",
          "price": 11000,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 100,
          "gameMaxSpeedKPH": 130,
          "model": "rebel2",
          "hash": 2249373259,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Dilettante",
          "manufacturer": "Karin",
          "price": 12500,
          "weightKG": 1400,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 88.5,
          "gameMaxSpeedKPH": 130,
          "model": "dilettante",
          "hash": 3164157193,
          "class": {
            "id": 0,
            "name": "Compacts"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.7599999904632568,
          "maxAcceleration": 0.10000000149011612
        },
        {
          "displayName": "Kraken",
          "manufacturer": "Kraken Submersibles",
          "price": 662500,
          "weightKG": 2800,
          "drivetrain": null,
          "realMaxSpeedMPH": 20.75,
          "gameMaxSpeedKPH": 75,
          "model": "submersible2",
          "hash": 3228633070,
          "class": {
            "id": 14,
            "name": "Boats"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 20.83333396911621,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 0,
          "maxAcceleration": 10
        },
        {
          "displayName": "Komoda",
          "manufacturer": "Lampadati",
          "price": 850000,
          "weightKG": 1575,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 123,
          "gameMaxSpeedKPH": 156,
          "model": "komoda",
          "hash": 3460613305,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.333335876464844,
          "maxBraking": 0.949999988079071,
          "maxTraction": 2.690000057220459,
          "maxAcceleration": 0.367000013589859
        },
        {
          "displayName": "Novak",
          "manufacturer": "Lampadati",
          "price": 304000,
          "weightKG": 2100,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 126,
          "gameMaxSpeedKPH": 153,
          "model": "novak",
          "hash": 2465530446,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 42.500003814697266,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.299999952316284,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Michelli GT",
          "manufacturer": "Lampadati",
          "price": 612500,
          "weightKG": 840,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 106.5,
          "gameMaxSpeedKPH": 140,
          "model": "michelli",
          "hash": 1046206681,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.75,
          "maxTraction": 2.299999952316284,
          "maxAcceleration": 0.2824999988079071
        },
        {
          "displayName": "Viseris",
          "manufacturer": "Lampadati",
          "price": 437500,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 124.25,
          "gameMaxSpeedKPH": 155.5,
          "model": "viseris",
          "hash": 3903371924,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.1944465637207,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.299999952316284,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Pigalle",
          "manufacturer": "Lampadati",
          "price": 200000,
          "weightKG": 1500,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 121.25,
          "gameMaxSpeedKPH": 149,
          "model": "pigalle",
          "hash": 1078682497,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.38888931274414,
          "maxBraking": 0.8500000238418579,
          "maxTraction": 2.359999895095825,
          "maxAcceleration": 0.26499998569488525
        },
        {
          "displayName": "Casco",
          "manufacturer": "Lampadati",
          "price": 452200,
          "weightKG": 1100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 120,
          "gameMaxSpeedKPH": 151,
          "model": "casco",
          "hash": 941800958,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.9444465637207,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.299999952316284,
          "maxAcceleration": 0.3199999928474426
        },
        {
          "displayName": "Tropos Rallye",
          "manufacturer": "Lampadati",
          "price": 408000,
          "weightKG": 800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 119.5,
          "gameMaxSpeedKPH": 152,
          "model": "tropos",
          "hash": 1887331236,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 42.222225189208984,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.22499999403953552
        },
        {
          "displayName": "Furore GT",
          "manufacturer": "Lampadati",
          "price": 224000,
          "weightKG": 1350,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 120.25,
          "gameMaxSpeedKPH": 152,
          "model": "furoregt",
          "hash": 3205927392,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 42.222225189208984,
          "maxBraking": 1,
          "maxTraction": 2.559999942779541,
          "maxAcceleration": 0.33500000834465027
        },
        {
          "displayName": "Felon GT",
          "manufacturer": "Lampadati",
          "price": 47500,
          "weightKG": 1850,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 110.5,
          "gameMaxSpeedKPH": 145,
          "model": "felon2",
          "hash": 4205676014,
          "class": {
            "id": 3,
            "name": "Coupes"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.5,
          "maxAcceleration": 0.23999999463558197
        },
        {
          "displayName": "Felon",
          "manufacturer": "Lampadati",
          "price": 45000,
          "weightKG": 1800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 113.75,
          "gameMaxSpeedKPH": 145,
          "model": "felon",
          "hash": 3903372712,
          "class": {
            "id": 3,
            "name": "Coupes"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.549999952316284,
          "maxAcceleration": 0.23999999463558197
        },
        {
          "displayName": "Toro",
          "manufacturer": "Lampadati",
          "price": 875000,
          "weightKG": 1100,
          "drivetrain": null,
          "realMaxSpeedMPH": 50.25,
          "gameMaxSpeedKPH": 133,
          "model": "toro",
          "hash": 1070967343,
          "class": {
            "id": 14,
            "name": "Boats"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.9444465637207,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 0,
          "maxAcceleration": 18
        },
        {
          "displayName": "Toro II",
          "manufacturer": "Lampadati",
          "price": 875000,
          "weightKG": 1100,
          "drivetrain": null,
          "realMaxSpeedMPH": 50.25,
          "gameMaxSpeedKPH": 133,
          "model": "toro2",
          "hash": 908897389,
          "class": {
            "id": 14,
            "name": "Boats"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.9444465637207,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 0,
          "maxAcceleration": 18
        },
        {
          "displayName": "Sanctus",
          "manufacturer": "LCC",
          "price": 997500,
          "weightKG": 250,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 112,
          "gameMaxSpeedKPH": 144,
          "model": "sanctus",
          "hash": 1491277511,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40,
          "maxBraking": 1,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.4050000011920929
        },
        {
          "displayName": "Innovation",
          "manufacturer": "LCC",
          "price": 46250,
          "weightKG": 250,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 110,
          "gameMaxSpeedKPH": 135,
          "model": "innovation",
          "hash": 4135840458,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 1,
          "maxTraction": 1.899999976158142,
          "maxAcceleration": 0.3199999928474426
        },
        {
          "displayName": "Hexer",
          "manufacturer": "LCC",
          "price": 7500,
          "weightKG": 250,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 104.75,
          "gameMaxSpeedKPH": 135,
          "model": "hexer",
          "hash": 301427732,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 1,
          "maxTraction": 1.850000023841858,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "Avarus",
          "manufacturer": "LCC",
          "price": 58000,
          "weightKG": 230,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 107.5,
          "gameMaxSpeedKPH": 135,
          "model": "avarus",
          "hash": 2179174271,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 1,
          "maxTraction": 1.850000023841858,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Mule Custom",
          "manufacturer": "Maibatsu",
          "price": 47880,
          "weightKG": 6000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 76.25,
          "gameMaxSpeedKPH": 100,
          "model": "mule4",
          "hash": 1945374990,
          "class": {
            "id": 20,
            "name": "Commercial"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.25,
          "maxTraction": 1.5,
          "maxAcceleration": 0.10999999940395355
        },
        {
          "displayName": "Mule (Armored)",
          "manufacturer": "Maibatsu",
          "price": 21612.5,
          "weightKG": 12500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 72.75,
          "gameMaxSpeedKPH": 100,
          "model": "mule3",
          "hash": 2242229361,
          "class": {
            "id": 20,
            "name": "Commercial"
          },
          "seats": 6,
          "maxPassengers": 5,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.25,
          "maxTraction": 1.5,
          "maxAcceleration": 0.17000000178813934
        },
        {
          "displayName": "Penumbra",
          "manufacturer": "Maibatsu",
          "price": 12000,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 105.25,
          "gameMaxSpeedKPH": 140,
          "model": "penumbra",
          "hash": 3917501776,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.25,
          "maxAcceleration": 0.2199999988079071
        },
        {
          "displayName": "Sanchez (Livery)",
          "manufacturer": "Maibatsu",
          "price": 3500,
          "weightKG": 220,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 119.5,
          "gameMaxSpeedKPH": 118,
          "model": "sanchez",
          "hash": 788045382,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.51388931274414,
          "maxBraking": 1.100000023841858,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.32899999618530273
        },
        {
          "displayName": "Sanchez",
          "manufacturer": "Maibatsu",
          "price": 4000,
          "weightKG": 220,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 119.5,
          "gameMaxSpeedKPH": 118,
          "model": "sanchez2",
          "hash": 2841686334,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.51388931274414,
          "maxBraking": 1.100000023841858,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.32899999618530273
        },
        {
          "displayName": "Manchez",
          "manufacturer": "Maibatsu",
          "price": 33500,
          "weightKG": 190,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 113.5,
          "gameMaxSpeedKPH": 145,
          "model": "manchez",
          "hash": 2771538552,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.29499998688697815
        },
        {
          "displayName": "Frogger",
          "manufacturer": "Maibatsu",
          "price": 650000,
          "weightKG": 7000,
          "drivetrain": null,
          "realMaxSpeedMPH": 148.5,
          "gameMaxSpeedKPH": 160,
          "model": "frogger",
          "hash": 744705981,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 56.66811752319336,
          "maxBraking": 3.1099462509155273,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 5.48799991607666
        },
        {
          "displayName": "Frogger II",
          "manufacturer": "Maibatsu",
          "price": 650000,
          "weightKG": 7000,
          "drivetrain": null,
          "realMaxSpeedMPH": 148.5,
          "gameMaxSpeedKPH": 160,
          "model": "frogger2",
          "hash": 1949211328,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 56.66811752319336,
          "maxBraking": 3.1099462509155273,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 5.48799991607666
        },
        {
          "displayName": "Mule",
          "manufacturer": "Maibatsu",
          "price": 13500,
          "weightKG": 5500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 70.25,
          "gameMaxSpeedKPH": 100,
          "model": "mule",
          "hash": 904750859,
          "class": {
            "id": 20,
            "name": "Commercial"
          },
          "seats": 6,
          "maxPassengers": 5,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.25,
          "maxTraction": 1.5,
          "maxAcceleration": 0.10999999940395355
        },
        {
          "displayName": "Mule II",
          "manufacturer": "Maibatsu",
          "price": 13500,
          "weightKG": 5500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 70.25,
          "gameMaxSpeedKPH": 100,
          "model": "mule2",
          "hash": 3244501995,
          "class": {
            "id": 20,
            "name": "Commercial"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.25,
          "maxTraction": 1.5,
          "maxAcceleration": 0.10999999940395355
        },
        {
          "displayName": "Patriot Stretch",
          "manufacturer": "Mammoth",
          "price": 305900,
          "weightKG": 5500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 96.25,
          "gameMaxSpeedKPH": 130,
          "model": "patriot2",
          "hash": 3874056184,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 6,
          "maxPassengers": 5,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.3199999928474426,
          "maxTraction": 1.600000023841858,
          "maxAcceleration": 0.18000000715255737
        },
        {
          "displayName": "Avenger",
          "manufacturer": "Mammoth",
          "price": 1725000,
          "weightKG": 18000,
          "drivetrain": null,
          "realMaxSpeedMPH": 178.5,
          "gameMaxSpeedKPH": 250,
          "model": "avenger",
          "hash": 2176659152,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 3,
          "maxPassengers": 2,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 95.98338317871094,
          "maxBraking": 8.465734481811523,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 8.819999694824219
        },
        {
          "displayName": "Thruster Jetpack",
          "manufacturer": "Mammoth",
          "price": 1828750,
          "weightKG": 301,
          "drivetrain": null,
          "realMaxSpeedMPH": 126,
          "gameMaxSpeedKPH": 160,
          "model": "thruster",
          "hash": 1489874736,
          "class": {
            "id": 19,
            "name": "Military"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 57.539886474609375,
          "maxBraking": 3.9472362995147705,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 6.860000133514404
        },
        {
          "displayName": "Mogul",
          "manufacturer": "Mammoth",
          "price": 1562750,
          "weightKG": 5000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 155.75,
          "gameMaxSpeedKPH": 276.5,
          "model": "mogul",
          "hash": 3545667823,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 3,
          "maxPassengers": 2,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 76.79570770263672,
          "maxBraking": 4.51558780670166,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 5.880000114440918
        },
        {
          "displayName": "Patriot",
          "manufacturer": "Mammoth",
          "price": 25000,
          "weightKG": 3500,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 98.25,
          "gameMaxSpeedKPH": 130,
          "model": "patriot",
          "hash": 3486509883,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.3199999928474426,
          "maxTraction": 1.7000000476837158,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Tula",
          "manufacturer": "Mammoth",
          "price": 2586850,
          "weightKG": 2000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 150,
          "gameMaxSpeedKPH": 250,
          "model": "tula",
          "hash": 1043222410,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 5,
          "maxPassengers": 4,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 69.36756134033203,
          "maxBraking": 3.39901065826416,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 4.900000095367432
        },
        {
          "displayName": "Hydra",
          "manufacturer": "Mammoth",
          "price": 1995000,
          "weightKG": 8000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 209.25,
          "gameMaxSpeedKPH": 327,
          "model": "hydra",
          "hash": 970385471,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 109.7642593383789,
          "maxBraking": 9.681206703186035,
          "maxTraction": 1.149999976158142,
          "maxAcceleration": 8.819999694824219
        },
        {
          "displayName": "Dodo",
          "manufacturer": "Mammoth",
          "price": 250000,
          "weightKG": 2000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 134.25,
          "gameMaxSpeedKPH": 250,
          "model": "dodo",
          "hash": 3393804037,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 69.36756134033203,
          "maxBraking": 3.39901065826416,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 4.900000095367432
        },
        {
          "displayName": "Asbo",
          "manufacturer": "Maxwell",
          "price": 204000,
          "weightKG": 1030,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 96.5,
          "gameMaxSpeedKPH": 126,
          "model": "asbo",
          "hash": 1118611807,
          "class": {
            "id": 0,
            "name": "Compacts"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 35,
          "maxBraking": 0.4699999988079071,
          "maxTraction": 1.9199999570846558,
          "maxAcceleration": 0.23399999737739563
        },
        {
          "displayName": "Vagrant",
          "manufacturer": "Maxwell",
          "price": 1107000,
          "weightKG": 670,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 122.5,
          "gameMaxSpeedKPH": 149.65,
          "model": "vagrant",
          "hash": 740289177,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.5694465637207,
          "maxBraking": 0.625,
          "maxTraction": 2.3499999046325684,
          "maxAcceleration": 0.33250001072883606
        },
        {
          "displayName": "Nightmare Cerberus",
          "manufacturer": "MTL",
          "price": 1935150,
          "weightKG": 6500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 106.25,
          "gameMaxSpeedKPH": 122,
          "model": "cerberus3",
          "hash": 1909700336,
          "class": {
            "id": 20,
            "name": "Commercial"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 33.88888931274414,
          "maxBraking": 0.25,
          "maxTraction": 1.7000000476837158,
          "maxAcceleration": 0.1899999976158142
        },
        {
          "displayName": "Future Shock Cerberus",
          "manufacturer": "MTL",
          "price": 1935150,
          "weightKG": 6500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 106.25,
          "gameMaxSpeedKPH": 122,
          "model": "cerberus2",
          "hash": 679453769,
          "class": {
            "id": 20,
            "name": "Commercial"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 33.88888931274414,
          "maxBraking": 0.25,
          "maxTraction": 1.7000000476837158,
          "maxAcceleration": 0.1899999976158142
        },
        {
          "displayName": "Apocalypse Cerberus",
          "manufacturer": "MTL",
          "price": 1935150,
          "weightKG": 6500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 106.25,
          "gameMaxSpeedKPH": 122,
          "model": "cerberus",
          "hash": 3493417227,
          "class": {
            "id": 20,
            "name": "Commercial"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 33.88888931274414,
          "maxBraking": 0.25,
          "maxTraction": 1.7000000476837158,
          "maxAcceleration": 0.1899999976158142
        },
        {
          "displayName": "Pounder Custom",
          "manufacturer": "MTL",
          "price": 160265,
          "weightKG": 5500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 95.75,
          "gameMaxSpeedKPH": 120,
          "model": "pounder2",
          "hash": 1653666139,
          "class": {
            "id": 20,
            "name": "Commercial"
          },
          "seats": 8,
          "maxPassengers": 7,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 33.333335876464844,
          "maxBraking": 0.25,
          "maxTraction": 1.5,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Wastelander",
          "manufacturer": "MTL",
          "price": 329175,
          "weightKG": 7000,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 89.75,
          "gameMaxSpeedKPH": 125,
          "model": "wastelander",
          "hash": 2382949506,
          "class": {
            "id": 17,
            "name": "Service"
          },
          "seats": 6,
          "maxPassengers": 5,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 34.722225189208984,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.299999952316284,
          "maxAcceleration": 0.33000001311302185
        },
        {
          "displayName": "Dune",
          "manufacturer": "MTL",
          "price": 650000,
          "weightKG": 7000,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 91.5,
          "gameMaxSpeedKPH": 125,
          "model": "rallytruck",
          "hash": 2191146052,
          "class": {
            "id": 17,
            "name": "Service"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 34.722225189208984,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.299999952316284,
          "maxAcceleration": 0.33000001311302185
        },
        {
          "displayName": "Brickade",
          "manufacturer": "MTL",
          "price": 550000,
          "weightKG": 14000,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 83.5,
          "gameMaxSpeedKPH": 105,
          "model": "brickade",
          "hash": 3989239879,
          "class": {
            "id": 17,
            "name": "Service"
          },
          "seats": 6,
          "maxPassengers": 5,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 29.166667938232422,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 2,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Flatbed",
          "manufacturer": "MTL",
          "price": 95000,
          "weightKG": 6500,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 76.25,
          "gameMaxSpeedKPH": 130,
          "model": "flatbed",
          "hash": 1353720154,
          "class": {
            "id": 10,
            "name": "Industrial"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.25,
          "maxTraction": 1.649999976158142,
          "maxAcceleration": 0.14000000059604645
        },
        {
          "displayName": "Fire Truck",
          "manufacturer": "MTL",
          "price": 1647500,
          "weightKG": 7500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 96,
          "gameMaxSpeedKPH": 130,
          "model": "firetruk",
          "hash": 1938952078,
          "class": {
            "id": 18,
            "name": "Emergency"
          },
          "seats": 8,
          "maxPassengers": 7,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.5,
          "maxTraction": 1.7000000476837158,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Pounder",
          "manufacturer": "MTL",
          "price": 100000,
          "weightKG": 5500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 85.75,
          "gameMaxSpeedKPH": 120,
          "model": "pounder",
          "hash": 2112052861,
          "class": {
            "id": 20,
            "name": "Commercial"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 33.333335876464844,
          "maxBraking": 0.25,
          "maxTraction": 1.649999976158142,
          "maxAcceleration": 0.14000000059604645
        },
        {
          "displayName": "Packer",
          "manufacturer": "MTL",
          "price": 250000,
          "weightKG": 12000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 85.5,
          "gameMaxSpeedKPH": 120,
          "model": "packer",
          "hash": 569305213,
          "class": {
            "id": 20,
            "name": "Commercial"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 33.333335876464844,
          "maxBraking": 0.800000011920929,
          "maxTraction": 1.5499999523162842,
          "maxAcceleration": 0.20999999344348907
        },
        {
          "displayName": "Outlaw",
          "manufacturer": "Nagasaki",
          "price": 634000,
          "weightKG": 850,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": null,
          "gameMaxSpeedKPH": 117,
          "model": "outlaw",
          "hash": 408825843,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 32.5,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.0250000953674316,
          "maxAcceleration": 0.4749999940395355
        },
        {
          "displayName": "Caddy (Utility)",
          "manufacturer": "Nagasaki",
          "price": 42500,
          "weightKG": 600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 67,
          "gameMaxSpeedKPH": 65,
          "model": "caddy3",
          "hash": 3525819835,
          "class": {
            "id": 11,
            "name": "Utility"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 18.055557250976562,
          "maxBraking": 0.20000000298023224,
          "maxTraction": 1.4500000476837158,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Caddy (Bunker)",
          "manufacturer": "Nagasaki",
          "price": 60000,
          "weightKG": 600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 48.25,
          "gameMaxSpeedKPH": 65,
          "model": "caddy2",
          "hash": 3757070668,
          "class": {
            "id": 11,
            "name": "Utility"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 18.055557250976562,
          "maxBraking": 0.20000000298023224,
          "maxTraction": 1.4500000476837158,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Caddy",
          "manufacturer": "Nagasaki",
          "price": 20000,
          "weightKG": 600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 67,
          "gameMaxSpeedKPH": 65,
          "model": "caddy",
          "hash": 1147287684,
          "class": {
            "id": 11,
            "name": "Utility"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 18.055557250976562,
          "maxBraking": 0.20000000298023224,
          "maxTraction": 1.5,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Street Blazer",
          "manufacturer": "Nagasaki",
          "price": 40500,
          "weightKG": 550,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 100,
          "gameMaxSpeedKPH": 125,
          "model": "blazer4",
          "hash": 3854198872,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 34.722225189208984,
          "maxBraking": 1,
          "maxTraction": 2.700000047683716,
          "maxAcceleration": 0.25
        },
        {
          "displayName": "Hot Rod Blazer",
          "manufacturer": "Nagasaki",
          "price": 34500,
          "weightKG": 600,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 98.75,
          "gameMaxSpeedKPH": 120,
          "model": "blazer3",
          "hash": 3025077634,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 33.333335876464844,
          "maxBraking": 1,
          "maxTraction": 2.5999999046325684,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Blazer Lifeguard",
          "manufacturer": "Nagasaki",
          "price": 31000,
          "weightKG": 650,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 78.75,
          "gameMaxSpeedKPH": 110,
          "model": "blazer2",
          "hash": 4246935337,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 30.555557250976562,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2,
          "maxAcceleration": 0.11999999731779099
        },
        {
          "displayName": "Blazer Aqua",
          "manufacturer": "Nagasaki",
          "price": 877800,
          "weightKG": 550,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 98.75,
          "gameMaxSpeedKPH": 125,
          "model": "blazer5",
          "hash": 2704629607,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 34.722225189208984,
          "maxBraking": 1,
          "maxTraction": 2.700000047683716,
          "maxAcceleration": 0.2720000147819519
        },
        {
          "displayName": "Blazer",
          "manufacturer": "Nagasaki",
          "price": 4000,
          "weightKG": 600,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 98.75,
          "gameMaxSpeedKPH": 120,
          "model": "blazer",
          "hash": 2166734073,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 33.333335876464844,
          "maxBraking": 1,
          "maxTraction": 2.5999999046325684,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Shotaro",
          "manufacturer": "Nagasaki",
          "price": 1112500,
          "weightKG": 230,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 123.75,
          "gameMaxSpeedKPH": 159.5,
          "model": "shotaro",
          "hash": 3889340782,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 44.30555725097656,
          "maxBraking": 1.399999976158142,
          "maxTraction": 2.700000047683716,
          "maxAcceleration": 0.4000000059604645
        },
        {
          "displayName": "Stryder",
          "manufacturer": "Nagasaki",
          "price": 335000,
          "weightKG": null,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": null,
          "gameMaxSpeedKPH": null,
          "model": "stryder",
          "hash": 301304410,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 2.450000047683716,
          "maxAcceleration": 0.36000001430511475
        },
        {
          "displayName": "Chimera",
          "manufacturer": "Nagasaki",
          "price": 105000,
          "weightKG": 401,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 103,
          "gameMaxSpeedKPH": 135,
          "model": "chimera",
          "hash": 6774487,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 1,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.2750000059604645
        },
        {
          "displayName": "Carbon RS",
          "manufacturer": "Nagasaki",
          "price": 20000,
          "weightKG": 250,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 124.25,
          "gameMaxSpeedKPH": 145,
          "model": "carbonrs",
          "hash": 11251904,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 1.2999999523162842,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "BF400",
          "manufacturer": "Nagasaki",
          "price": 47500,
          "weightKG": 150,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 137,
          "gameMaxSpeedKPH": 145,
          "model": "bf400",
          "hash": 86520421,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 1.100000023841858,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.28999999165534973
        },
        {
          "displayName": "Havok",
          "manufacturer": "Nagasaki",
          "price": 1150450,
          "weightKG": 1000,
          "drivetrain": null,
          "realMaxSpeedMPH": 154.25,
          "gameMaxSpeedKPH": 160,
          "model": "havok",
          "hash": 2310691317,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 57.9072265625,
          "maxBraking": 3.121199607849121,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 5.390000343322754
        },
        {
          "displayName": "Buzzard Attack Chopper",
          "manufacturer": "Nagasaki",
          "price": 875000,
          "weightKG": 3800,
          "drivetrain": null,
          "realMaxSpeedMPH": 145,
          "gameMaxSpeedKPH": 160,
          "model": "buzzard",
          "hash": 788747387,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 57.9072265625,
          "maxBraking": 3.121199607849121,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 5.390000343322754
        },
        {
          "displayName": "Buzzard",
          "manufacturer": "Nagasaki",
          "price": 100000,
          "weightKG": 3800,
          "drivetrain": null,
          "realMaxSpeedMPH": 145,
          "gameMaxSpeedKPH": 160,
          "model": "buzzard2",
          "hash": 745926877,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 57.9072265625,
          "maxBraking": 3.121199607849121,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 5.390000343322754
        },
        {
          "displayName": "Dinghy (2-seater)",
          "manufacturer": "Nagasaki",
          "price": 100000,
          "weightKG": 2000,
          "drivetrain": null,
          "realMaxSpeedMPH": 71.5,
          "gameMaxSpeedKPH": 125,
          "model": "dinghy2",
          "hash": 276773164,
          "class": {
            "id": 14,
            "name": "Boats"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 34.722225189208984,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 0,
          "maxAcceleration": 16
        },
        {
          "displayName": "Dinghy",
          "manufacturer": "Nagasaki",
          "price": 83125,
          "weightKG": 2000,
          "drivetrain": null,
          "realMaxSpeedMPH": 71.5,
          "gameMaxSpeedKPH": 125,
          "model": "dinghy",
          "hash": 1033245328,
          "class": {
            "id": 14,
            "name": "Boats"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 34.722225189208984,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 0,
          "maxAcceleration": 16
        },
        {
          "displayName": "Dinghy II",
          "manufacturer": "Nagasaki",
          "price": 83125,
          "weightKG": 2000,
          "drivetrain": null,
          "realMaxSpeedMPH": 71.5,
          "gameMaxSpeedKPH": 125,
          "model": "dinghy3",
          "hash": 509498602,
          "class": {
            "id": 14,
            "name": "Boats"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 34.722225189208984,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 0,
          "maxAcceleration": 16
        },
        {
          "displayName": "Dinghy III",
          "manufacturer": "Nagasaki",
          "price": 83125,
          "weightKG": 2000,
          "drivetrain": null,
          "realMaxSpeedMPH": 71.5,
          "gameMaxSpeedKPH": 125,
          "model": "dinghy4",
          "hash": 867467158,
          "class": {
            "id": 14,
            "name": "Boats"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 34.722225189208984,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 0,
          "maxAcceleration": 16
        },
        {
          "displayName": "Invade and Persuade RC Tank",
          "manufacturer": null,
          "price": 1137500,
          "weightKG": 500,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": null,
          "gameMaxSpeedKPH": 37,
          "model": "minitank",
          "hash": 3040635986,
          "class": {
            "id": 19,
            "name": "Military"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 10.277778625488281,
          "maxBraking": 0.15000000596046448,
          "maxTraction": 2,
          "maxAcceleration": 0.05999999865889549
        },
        {
          "displayName": "RC Bandito",
          "manufacturer": null,
          "price": 795000,
          "weightKG": 85,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 60,
          "gameMaxSpeedKPH": 80,
          "model": "rcbandito",
          "hash": 4008920556,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 22.22222328186035,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.950000047683716,
          "maxAcceleration": 0.14000000059604645
        },
        {
          "displayName": "B-11 Strikeforce",
          "manufacturer": null,
          "price": 1900000,
          "weightKG": 14000,
          "drivetrain": null,
          "realMaxSpeedMPH": 163.75,
          "gameMaxSpeedKPH": 254.6,
          "model": "strikeforce",
          "hash": 1692272545,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 70.71067810058594,
          "maxBraking": 11.087433815002441,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 15.680000305175781
        },
        {
          "displayName": "Blimp",
          "manufacturer": null,
          "price": 595175,
          "weightKG": 12000,
          "drivetrain": null,
          "realMaxSpeedMPH": 105,
          "gameMaxSpeedKPH": 160,
          "model": "blimp3",
          "hash": 3987008919,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 70,
          "maxBraking": 3.978800058364868,
          "maxTraction": 0.6499999761581421,
          "maxAcceleration": 5.684000015258789
        },
        {
          "displayName": "Festival Bus",
          "manufacturer": null,
          "price": 921025,
          "weightKG": 8000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 59.75,
          "gameMaxSpeedKPH": 90,
          "model": "pbus2",
          "hash": 345756458,
          "class": {
            "id": 17,
            "name": "Service"
          },
          "seats": 11,
          "maxPassengers": 10,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 25.000001907348633,
          "maxBraking": 0.25,
          "maxTraction": 1.149999976158142,
          "maxAcceleration": 0.12999999523162842
        },
        {
          "displayName": "Sea Sparrow",
          "manufacturer": null,
          "price": 907500,
          "weightKG": 3500,
          "drivetrain": null,
          "realMaxSpeedMPH": 153.75,
          "gameMaxSpeedKPH": 160,
          "model": "seasparrow",
          "hash": 3568198617,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 56.596221923828125,
          "maxBraking": 2.9396073818206787,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 5.193999767303467
        },
        {
          "displayName": "TM-02 Khanjali Tank",
          "manufacturer": null,
          "price": 1925175,
          "weightKG": 30000,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 42,
          "gameMaxSpeedKPH": 57,
          "model": "khanjali",
          "hash": 2859440138,
          "class": {
            "id": 19,
            "name": "Military"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 15.833333969116211,
          "maxBraking": 0.20000000298023224,
          "maxTraction": 2.549999952316284,
          "maxAcceleration": 0.10000000149011612
        },
        {
          "displayName": "RCV",
          "manufacturer": null,
          "price": 1562750,
          "weightKG": 12500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 96.75,
          "gameMaxSpeedKPH": 125,
          "model": "riot2",
          "hash": 2601952180,
          "class": {
            "id": 18,
            "name": "Emergency"
          },
          "seats": 6,
          "maxPassengers": 5,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 34.722225189208984,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 1.75,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Barrage",
          "manufacturer": null,
          "price": 1060675,
          "weightKG": 2500,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 108.75,
          "gameMaxSpeedKPH": 135,
          "model": "barrage",
          "hash": 4081974053,
          "class": {
            "id": 19,
            "name": "Military"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.8500000238418579,
          "maxTraction": 1.75,
          "maxAcceleration": 0.2224999964237213
        },
        {
          "displayName": "Volatol",
          "manufacturer": null,
          "price": 1862000,
          "weightKG": 40000,
          "drivetrain": null,
          "realMaxSpeedMPH": 165.5,
          "gameMaxSpeedKPH": 250,
          "model": "volatol",
          "hash": 447548909,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 80.27928161621094,
          "maxBraking": 5.113790035247803,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 6.369999885559082
        },
        {
          "displayName": "Akula",
          "manufacturer": null,
          "price": 1852025,
          "weightKG": 8000,
          "drivetrain": null,
          "realMaxSpeedMPH": 157.25,
          "gameMaxSpeedKPH": 160,
          "model": "akula",
          "hash": 1181327175,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 61.0891227722168,
          "maxBraking": 3.5920403003692627,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 5.880000114440918
        },
        {
          "displayName": "FH-1 Hunter",
          "manufacturer": null,
          "price": 2061500,
          "weightKG": 6000,
          "drivetrain": null,
          "realMaxSpeedMPH": 141.5,
          "gameMaxSpeedKPH": 160,
          "model": "hunter",
          "hash": 4252008158,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 58.554256439208984,
          "maxBraking": 3.2134575843811035,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 5.48799991607666
        },
        {
          "displayName": "P-45 Nokota",
          "manufacturer": null,
          "price": 1326675,
          "weightKG": 3200,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 201,
          "gameMaxSpeedKPH": 328.6,
          "model": "nokota",
          "hash": 1036591958,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 87.70580291748047,
          "maxBraking": 12.892753601074219,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 14.700000762939453
        },
        {
          "displayName": "Mobile Operations Center (Trailer)",
          "manufacturer": null,
          "price": 612500,
          "weightKG": 13500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 88.5,
          "gameMaxSpeedKPH": null,
          "model": "trailerlarge",
          "hash": 1502869817,
          "class": {
            "id": 11,
            "name": "Utility"
          },
          "seats": 3,
          "maxPassengers": 2,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 29.166667938232422,
          "maxBraking": 0.699999988079071,
          "maxTraction": 3.299999952316284,
          "maxAcceleration": 0
        },
        {
          "displayName": "RM-10 Bombushka",
          "manufacturer": null,
          "price": 2959250,
          "weightKG": 30100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 84.5,
          "gameMaxSpeedKPH": 281.5,
          "model": "bombushka",
          "hash": 4262088844,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 6,
          "maxPassengers": 5,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.51483917236328,
          "maxBraking": 1.968150019645691,
          "maxTraction": 0.8500000238418579,
          "maxAcceleration": 5.390000343322754
        },
        {
          "displayName": "Metro Train",
          "manufacturer": null,
          "price": 100000,
          "weightKG": 25000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": null,
          "gameMaxSpeedKPH": 80,
          "model": "metrotrain",
          "hash": 868868440,
          "class": {
            "id": 21,
            "name": "Trains"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 22.22222328186035,
          "maxBraking": 5,
          "maxTraction": 2.5,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Freight Train",
          "manufacturer": null,
          "price": 100000,
          "weightKG": 25084,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": null,
          "gameMaxSpeedKPH": 80,
          "model": "freight",
          "hash": 1030400667,
          "class": {
            "id": 21,
            "name": "Trains"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 22.22222328186035,
          "maxBraking": 5,
          "maxTraction": 2.5,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Cable Car",
          "manufacturer": null,
          "price": 100000,
          "weightKG": null,
          "drivetrain": null,
          "realMaxSpeedMPH": null,
          "gameMaxSpeedKPH": null,
          "model": "cablecar",
          "hash": 3334677549,
          "class": {
            "id": 21,
            "name": "Trains"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 22.22222328186035,
          "maxBraking": 5,
          "maxTraction": 2.5,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Cargo Plane",
          "manufacturer": null,
          "price": 100000,
          "weightKG": 38000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 139.25,
          "gameMaxSpeedKPH": 284,
          "model": "cargoplane",
          "hash": 368211810,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 78.90234375,
          "maxBraking": 4.87143087387085,
          "maxTraction": 0.8500000238418579,
          "maxAcceleration": 6.174000263214111
        },
        {
          "displayName": "Xero Blimp",
          "manufacturer": null,
          "price": 100000,
          "weightKG": 12000,
          "drivetrain": null,
          "realMaxSpeedMPH": 105,
          "gameMaxSpeedKPH": 160,
          "model": "blimp2",
          "hash": 3681241380,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 70,
          "maxBraking": 4.253200054168701,
          "maxTraction": 0.6499999761581421,
          "maxAcceleration": 6.076000213623047
        },
        {
          "displayName": "V-65 Molotok",
          "manufacturer": null,
          "price": 2394000,
          "weightKG": 3200,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 207.75,
          "gameMaxSpeedKPH": 328.6,
          "model": "molotok",
          "hash": 1565978651,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 91.28709411621094,
          "maxBraking": 13.419203758239746,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 14.700000762939453
        },
        {
          "displayName": "Titan",
          "manufacturer": null,
          "price": 1000000,
          "weightKG": 38000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 133.25,
          "gameMaxSpeedKPH": 281.5,
          "model": "titan",
          "hash": 1981688531,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 10,
          "maxPassengers": 9,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 78.20576477050781,
          "maxBraking": 4.751782417297363,
          "maxTraction": 0.8500000238418579,
          "maxAcceleration": 6.076000213623047
        },
        {
          "displayName": "LF-22 Starling",
          "manufacturer": null,
          "price": 1828750,
          "weightKG": 2000,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 187.75,
          "gameMaxSpeedKPH": 284.4,
          "model": "starling",
          "hash": 2594093022,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 87.5,
          "maxBraking": 10.71875,
          "maxTraction": 1.149999976158142,
          "maxAcceleration": 12.25
        },
        {
          "displayName": "Jet",
          "manufacturer": null,
          "price": 100000,
          "weightKG": 38000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 142,
          "gameMaxSpeedKPH": 284,
          "model": "jet",
          "hash": 1058115860,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 78.90234375,
          "maxBraking": 4.87143087387085,
          "maxTraction": 1.600000023841858,
          "maxAcceleration": 6.174000263214111
        },
        {
          "displayName": "Atomic Blimp",
          "manufacturer": null,
          "price": 100000,
          "weightKG": 12000,
          "drivetrain": null,
          "realMaxSpeedMPH": 105,
          "gameMaxSpeedKPH": 160,
          "model": "blimp",
          "hash": 4143991942,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 70,
          "maxBraking": 3.978800058364868,
          "maxTraction": 0.6499999761581421,
          "maxAcceleration": 5.684000015258789
        },
        {
          "displayName": "Rhino Tank",
          "manufacturer": null,
          "price": 750000,
          "weightKG": 60000,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 40.5,
          "gameMaxSpeedKPH": 55,
          "model": "rhino",
          "hash": 782665360,
          "class": {
            "id": 19,
            "name": "Military"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 15.277778625488281,
          "maxBraking": 0.20000000298023224,
          "maxTraction": 2.5,
          "maxAcceleration": 0.10999999940395355
        },
        {
          "displayName": "Savage",
          "manufacturer": null,
          "price": 1296750,
          "weightKG": 14000,
          "drivetrain": null,
          "realMaxSpeedMPH": 144.5,
          "gameMaxSpeedKPH": 160,
          "model": "savage",
          "hash": 4212341271,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 65.19527435302734,
          "maxBraking": 2.9901158809661865,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 4.586400032043457
        },
        {
          "displayName": "Whippet Race Bike",
          "manufacturer": null,
          "price": 5000,
          "weightKG": 110,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 47,
          "gameMaxSpeedKPH": 63,
          "model": "tribike",
          "hash": 1127861609,
          "class": {
            "id": 13,
            "name": "Cycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 17.5,
          "maxBraking": 2.5,
          "maxTraction": 1.850000023841858,
          "maxAcceleration": 0.13500000536441803
        },
        {
          "displayName": "Tri-Cycles Race Bike",
          "manufacturer": null,
          "price": 5000,
          "weightKG": 110,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 47,
          "gameMaxSpeedKPH": 63,
          "model": "tribike3",
          "hash": 3894672200,
          "class": {
            "id": 13,
            "name": "Cycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 17.5,
          "maxBraking": 2.5,
          "maxTraction": 1.850000023841858,
          "maxAcceleration": 0.13500000536441803
        },
        {
          "displayName": "Scorcher",
          "manufacturer": null,
          "price": 1000,
          "weightKG": 115,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 38.25,
          "gameMaxSpeedKPH": 55,
          "model": "scorcher",
          "hash": 4108429845,
          "class": {
            "id": 13,
            "name": "Cycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 15.277778625488281,
          "maxBraking": 2.799999952316284,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.17000000178813934
        },
        {
          "displayName": "Fixter",
          "manufacturer": null,
          "price": 2000,
          "weightKG": 110,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 44.25,
          "gameMaxSpeedKPH": 63,
          "model": "fixter",
          "hash": 3458454463,
          "class": {
            "id": 13,
            "name": "Cycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 17.5,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 1.850000023841858,
          "maxAcceleration": 0.13500000536441803
        },
        {
          "displayName": "Endurex Race Bike",
          "manufacturer": null,
          "price": 5000,
          "weightKG": 110,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 47,
          "gameMaxSpeedKPH": 63,
          "model": "tribike2",
          "hash": 3061159916,
          "class": {
            "id": 13,
            "name": "Cycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 17.5,
          "maxBraking": 2.5,
          "maxTraction": 1.850000023841858,
          "maxAcceleration": 0.13500000536441803
        },
        {
          "displayName": "Cruiser",
          "manufacturer": null,
          "price": 400,
          "weightKG": 120,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 33.5,
          "gameMaxSpeedKPH": 45,
          "model": "cruiser",
          "hash": 448402357,
          "class": {
            "id": 13,
            "name": "Cycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 12.500000953674316,
          "maxBraking": 2.799999952316284,
          "maxTraction": 1.7999999523162842,
          "maxAcceleration": 0.07999999821186066
        },
        {
          "displayName": "BMX",
          "manufacturer": null,
          "price": 400,
          "weightKG": 105,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 35.25,
          "gameMaxSpeedKPH": 50,
          "model": "bmx",
          "hash": 1131912276,
          "class": {
            "id": 13,
            "name": "Cycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 13.88888931274414,
          "maxBraking": 3,
          "maxTraction": 1.850000023841858,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Submersible",
          "manufacturer": null,
          "price": 100000,
          "weightKG": 3000,
          "drivetrain": null,
          "realMaxSpeedMPH": 19.75,
          "gameMaxSpeedKPH": 75,
          "model": "submersible",
          "hash": 771711535,
          "class": {
            "id": 14,
            "name": "Boats"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 20.83333396911621,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 0,
          "maxAcceleration": 8
        },
        {
          "displayName": "Police Predator",
          "manufacturer": null,
          "price": 100000,
          "weightKG": 2500,
          "drivetrain": null,
          "realMaxSpeedMPH": 48.5,
          "gameMaxSpeedKPH": 120,
          "model": "predator",
          "hash": 3806844075,
          "class": {
            "id": 14,
            "name": "Boats"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 33.333335876464844,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 0,
          "maxAcceleration": 14
        },
        {
          "displayName": "8F Drafter",
          "manufacturer": "Obey",
          "price": 359000,
          "weightKG": 1650,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 117.5,
          "gameMaxSpeedKPH": 150,
          "model": "drafter",
          "hash": 686471183,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 1,
          "maxTraction": 2.694999933242798,
          "maxAcceleration": 0.34200000762939453
        },
        {
          "displayName": "Rocoto",
          "manufacturer": "Obey",
          "price": 42500,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 107.5,
          "gameMaxSpeedKPH": 139,
          "model": "rocoto",
          "hash": 2136773105,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.611114501953125,
          "maxBraking": 0.25,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.1899999976158142
        },
        {
          "displayName": "Omnis",
          "manufacturer": "Obey",
          "price": 350500,
          "weightKG": 1090,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 112.5,
          "gameMaxSpeedKPH": 152,
          "model": "omnis",
          "hash": 3517794615,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 42.222225189208984,
          "maxBraking": 1,
          "maxTraction": 2.140000104904175,
          "maxAcceleration": 0.3050000071525574
        },
        {
          "displayName": "9F Cabrio",
          "manufacturer": "Obey",
          "price": 65000,
          "weightKG": 1300,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 119.75,
          "gameMaxSpeedKPH": 155,
          "model": "ninef2",
          "hash": 2833484545,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.05555725097656,
          "maxBraking": 1,
          "maxTraction": 2.549999952316284,
          "maxAcceleration": 0.33000001311302185
        },
        {
          "displayName": "9F",
          "manufacturer": "Obey",
          "price": 60000,
          "weightKG": 1300,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 119.75,
          "gameMaxSpeedKPH": 155,
          "model": "ninef",
          "hash": 1032823388,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.05555725097656,
          "maxBraking": 1,
          "maxTraction": 2.549999952316284,
          "maxAcceleration": 0.33000001311302185
        },
        {
          "displayName": "Tailgater",
          "manufacturer": "Obey",
          "price": 27500,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 104.75,
          "gameMaxSpeedKPH": 145,
          "model": "tailgater",
          "hash": 3286105550,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.549999952316284,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "R88 (Formula 2 Car)",
          "manufacturer": "Ocelot",
          "price": 1757500,
          "weightKG": null,
          "drivetrain": null,
          "realMaxSpeedMPH": null,
          "gameMaxSpeedKPH": null,
          "model": "formula2",
          "hash": 2334210311,
          "class": {
            "id": 22
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 45.13888931274414,
          "maxBraking": 1.25,
          "maxTraction": 3.2654998302459717,
          "maxAcceleration": 0.7450000047683716
        },
        {
          "displayName": "Jugular",
          "manufacturer": "Ocelot",
          "price": 612500,
          "weightKG": 1745,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 126.5,
          "gameMaxSpeedKPH": 157.5,
          "model": "jugular",
          "hash": 4086055493,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.750003814697266,
          "maxBraking": 1.100000023841858,
          "maxTraction": 20.959999084472656,
          "maxAcceleration": 0.3779999911785126
        },
        {
          "displayName": "Locust",
          "manufacturer": "Ocelot",
          "price": 812500,
          "weightKG": 920,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 119.75,
          "gameMaxSpeedKPH": 154.7,
          "model": "locust",
          "hash": 3353694737,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 42.972225189208984,
          "maxBraking": 1,
          "maxTraction": 21.479999542236328,
          "maxAcceleration": 0.33399999141693115
        },
        {
          "displayName": "Swinger",
          "manufacturer": "Ocelot",
          "price": 454500,
          "weightKG": 900,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 118.25,
          "gameMaxSpeedKPH": 160,
          "model": "swinger",
          "hash": 500482303,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.4444465637207,
          "maxBraking": 0.9950000047683716,
          "maxTraction": 2.4000000953674316,
          "maxAcceleration": 0.38999998569488525
        },
        {
          "displayName": "Stromberg",
          "manufacturer": "Ocelot",
          "price": 1592675,
          "weightKG": 1300,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 112.75,
          "gameMaxSpeedKPH": 150,
          "model": "stromberg",
          "hash": 886810209,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 1,
          "maxTraction": 2.5,
          "maxAcceleration": 0.28999999165534973
        },
        {
          "displayName": "Pariah",
          "manufacturer": "Ocelot",
          "price": 710000,
          "weightKG": 1500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 136,
          "gameMaxSpeedKPH": 155.1,
          "model": "pariah",
          "hash": 867799010,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.083335876464844,
          "maxBraking": 1,
          "maxTraction": 2.625,
          "maxAcceleration": 0.32100000977516174
        },
        {
          "displayName": "XA-21",
          "manufacturer": "Ocelot",
          "price": 1187500,
          "weightKG": 1450,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 122.5,
          "gameMaxSpeedKPH": 159.2,
          "model": "xa21",
          "hash": 917809321,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.222225189208984,
          "maxBraking": 1.100000023841858,
          "maxTraction": 2.680000066757202,
          "maxAcceleration": 0.36399999260902405
        },
        {
          "displayName": "Penetrator",
          "manufacturer": "Ocelot",
          "price": 440000,
          "weightKG": 1470,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 124,
          "gameMaxSpeedKPH": 159.5,
          "model": "penetrator",
          "hash": 2536829930,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.30555725097656,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.5799999237060547,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Ardent",
          "manufacturer": "Ocelot",
          "price": 575000,
          "weightKG": 1200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 117.75,
          "gameMaxSpeedKPH": 148,
          "model": "ardent",
          "hash": 159274291,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.111114501953125,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.6500000953674316,
          "maxAcceleration": 0.2849999964237213
        },
        {
          "displayName": "Lynx",
          "manufacturer": "Ocelot",
          "price": 867500,
          "weightKG": 1725,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 121.5,
          "gameMaxSpeedKPH": 157,
          "model": "lynx",
          "hash": 482197771,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.611114501953125,
          "maxBraking": 1,
          "maxTraction": 2.559999942779541,
          "maxAcceleration": 0.3149999976158142
        },
        {
          "displayName": "Jackal",
          "manufacturer": "Ocelot",
          "price": 30000,
          "weightKG": 1800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 113.5,
          "gameMaxSpeedKPH": 142.5,
          "model": "jackal",
          "hash": 3670438162,
          "class": {
            "id": 3,
            "name": "Coupes"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 39.583335876464844,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.5999999046325684,
          "maxAcceleration": 0.2199999988079071
        },
        {
          "displayName": "F620",
          "manufacturer": "Ocelot",
          "price": 40000,
          "weightKG": 1800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 117.5,
          "gameMaxSpeedKPH": 145,
          "model": "f620",
          "hash": 3703357000,
          "class": {
            "id": 3,
            "name": "Coupes"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.5,
          "maxAcceleration": 0.23999999463558197
        },
        {
          "displayName": "Imorgon",
          "manufacturer": "Overflod",
          "price": 1082500,
          "weightKG": 1600,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 107.25,
          "gameMaxSpeedKPH": 148.5,
          "model": "imorgon",
          "hash": 3162245632,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 41.250003814697266,
          "maxBraking": 0.8349999785423279,
          "maxTraction": 25.33049964904785,
          "maxAcceleration": 0.6600000262260437
        },
        {
          "displayName": "Tyrant",
          "manufacturer": "Overflod",
          "price": 1257500,
          "weightKG": 1175,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 127,
          "gameMaxSpeedKPH": 165,
          "model": "tyrant",
          "hash": 3918533058,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 45.833335876464844,
          "maxBraking": 1,
          "maxTraction": 31.625,
          "maxAcceleration": 0.3400000035762787
        },
        {
          "displayName": "Entity XXR",
          "manufacturer": "Overflod",
          "price": 1152500,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 128,
          "gameMaxSpeedKPH": 170,
          "model": "entity2",
          "hash": 2174267100,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 47.222225189208984,
          "maxBraking": 1,
          "maxTraction": 19.736249923706055,
          "maxAcceleration": 0.35499998927116394
        },
        {
          "displayName": "Autarch",
          "manufacturer": "Overflod",
          "price": 977500,
          "weightKG": 1300,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 125.5,
          "gameMaxSpeedKPH": 161,
          "model": "autarch",
          "hash": 3981782132,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.722225189208984,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 30.634122848510742,
          "maxAcceleration": 0.37700000405311584
        },
        {
          "displayName": "Entity XF",
          "manufacturer": "Overflod",
          "price": 397500,
          "weightKG": 1500,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 121.5,
          "gameMaxSpeedKPH": 155,
          "model": "entityxf",
          "hash": 3003014393,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.05555725097656,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.75,
          "maxAcceleration": 0.33000001311302185
        },
        {
          "displayName": "Zorrusso",
          "manufacturer": "Pegassi",
          "price": 962500,
          "weightKG": 1300,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 124.25,
          "gameMaxSpeedKPH": 161,
          "model": "zorrusso",
          "hash": 3612858749,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.722225189208984,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 30.417198181152344,
          "maxAcceleration": 0.37450000643730164
        },
        {
          "displayName": "Toros",
          "manufacturer": "Pegassi",
          "price": 249000,
          "weightKG": 2200,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 127.5,
          "gameMaxSpeedKPH": 155,
          "model": "toros",
          "hash": 3126015148,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.05555725097656,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.299999952316284,
          "maxAcceleration": 0.3199999928474426
        },
        {
          "displayName": "Oppressor MK II",
          "manufacturer": "Pegassi",
          "price": 1945125,
          "weightKG": 220,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 127.75,
          "gameMaxSpeedKPH": 148,
          "model": "oppressor2",
          "hash": 2069146067,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 41.111114501953125,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.3799999952316284
        },
        {
          "displayName": "Tezeract",
          "manufacturer": "Pegassi",
          "price": 1412500,
          "weightKG": 1800,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 125.5,
          "gameMaxSpeedKPH": 169,
          "model": "tezeract",
          "hash": 1031562256,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 46.9444465637207,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 18.06999969482422,
          "maxAcceleration": 0.13750000298023224
        },
        {
          "displayName": "Zentorno",
          "manufacturer": "Pegassi",
          "price": 362500,
          "weightKG": 1500,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 122,
          "gameMaxSpeedKPH": 159,
          "model": "zentorno",
          "hash": 2891838741,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.16666793823242,
          "maxBraking": 1,
          "maxTraction": 2.6500000953674316,
          "maxAcceleration": 0.3540000021457672
        },
        {
          "displayName": "Vacca",
          "manufacturer": "Pegassi",
          "price": 120000,
          "weightKG": 1200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 120.25,
          "gameMaxSpeedKPH": 152,
          "model": "vacca",
          "hash": 338562499,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 42.222225189208984,
          "maxBraking": 1,
          "maxTraction": 2.5999999046325684,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Tempesta",
          "manufacturer": "Pegassi",
          "price": 664500,
          "weightKG": 1422,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 121.25,
          "gameMaxSpeedKPH": 157,
          "model": "tempesta",
          "hash": 272929391,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.611114501953125,
          "maxBraking": 1,
          "maxTraction": 2.6500000953674316,
          "maxAcceleration": 0.36000001430511475
        },
        {
          "displayName": "Reaper",
          "manufacturer": "Pegassi",
          "price": 797500,
          "weightKG": 1300,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 121.75,
          "gameMaxSpeedKPH": 159,
          "model": "reaper",
          "hash": 234062309,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.16666793823242,
          "maxBraking": 1.100000023841858,
          "maxTraction": 2.6700000762939453,
          "maxAcceleration": 0.36500000953674316
        },
        {
          "displayName": "Osiris",
          "manufacturer": "Pegassi",
          "price": 975000,
          "weightKG": 1350,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 122,
          "gameMaxSpeedKPH": 159.1,
          "model": "osiris",
          "hash": 1987142870,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.1944465637207,
          "maxBraking": 1.0499999523162842,
          "maxTraction": 2.6600000858306885,
          "maxAcceleration": 0.36000001430511475
        },
        {
          "displayName": "Infernus",
          "manufacturer": "Pegassi",
          "price": 220000,
          "weightKG": 1200,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 117.75,
          "gameMaxSpeedKPH": 150,
          "model": "infernus",
          "hash": 418536135,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 0.5,
          "maxTraction": 2.6500000953674316,
          "maxAcceleration": 0.3400000035762787
        },
        {
          "displayName": "Torero",
          "manufacturer": "Pegassi",
          "price": 499000,
          "weightKG": 1470,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 116.5,
          "gameMaxSpeedKPH": 149.5,
          "model": "torero",
          "hash": 1504306544,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.52777862548828,
          "maxBraking": 0.5,
          "maxTraction": 2.5999999046325684,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Monroe",
          "manufacturer": "Pegassi",
          "price": 245000,
          "weightKG": 1200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 122,
          "gameMaxSpeedKPH": 150,
          "model": "monroe",
          "hash": 3861591579,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 0.6499999761581421,
          "maxTraction": 2.200000047683716,
          "maxAcceleration": 0.2800000011920929
        },
        {
          "displayName": "Infernus Classic",
          "manufacturer": "Pegassi",
          "price": 457500,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 118,
          "gameMaxSpeedKPH": 149.5,
          "model": "infernus2",
          "hash": 2889029532,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.52777862548828,
          "maxBraking": 0.5,
          "maxTraction": 2.634999990463257,
          "maxAcceleration": 0.33000001311302185
        },
        {
          "displayName": "Ultralight",
          "manufacturer": "Pegassi",
          "price": 332500,
          "weightKG": 250,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 73.25,
          "gameMaxSpeedKPH": 78.6,
          "model": "microlight",
          "hash": 2531412055,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 30.151134490966797,
          "maxBraking": 4.136735916137695,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 13.720000267028809
        },
        {
          "displayName": "Vortex",
          "manufacturer": "Pegassi",
          "price": 178000,
          "weightKG": 190,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 115.75,
          "gameMaxSpeedKPH": 148,
          "model": "vortex",
          "hash": 3685342204,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.111114501953125,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.4025000035762787
        },
        {
          "displayName": "Ruffian",
          "manufacturer": "Pegassi",
          "price": 5000,
          "weightKG": 250,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 127,
          "gameMaxSpeedKPH": 140,
          "model": "ruffian",
          "hash": 3401388520,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 1.100000023841858,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.3400000035762787
        },
        {
          "displayName": "Oppressor",
          "manufacturer": "Pegassi",
          "price": 1762250,
          "weightKG": 190,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 140,
          "gameMaxSpeedKPH": 148,
          "model": "oppressor",
          "hash": 884483972,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 41.111114501953125,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 2.125,
          "maxAcceleration": 0.4000000059604645
        },
        {
          "displayName": "FCR 1000 Custom",
          "manufacturer": "Pegassi",
          "price": 98000,
          "weightKG": 200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 112.5,
          "gameMaxSpeedKPH": 140.2,
          "model": "fcr2",
          "hash": 3537231886,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.9444465637207,
          "maxBraking": 1.25,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.3100000023841858
        },
        {
          "displayName": "FCR 1000",
          "manufacturer": "Pegassi",
          "price": 67500,
          "weightKG": 210,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 112,
          "gameMaxSpeedKPH": 140,
          "model": "fcr",
          "hash": 627535535,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.3050000071525574
        },
        {
          "displayName": "Faggio Sport",
          "manufacturer": "Pegassi",
          "price": 23750,
          "weightKG": 110,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 76.75,
          "gameMaxSpeedKPH": 95,
          "model": "faggio",
          "hash": 2452219115,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 26.38888931274414,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 1.7000000476837158,
          "maxAcceleration": 0.19750000536441803
        },
        {
          "displayName": "Faggio Mod",
          "manufacturer": "Pegassi",
          "price": 27500,
          "weightKG": 100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 74.25,
          "gameMaxSpeedKPH": 90,
          "model": "faggio3",
          "hash": 3005788552,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 25.000001907348633,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 1.7000000476837158,
          "maxAcceleration": 0.19499999284744263
        },
        {
          "displayName": "Faggio",
          "manufacturer": "Pegassi",
          "price": 2500,
          "weightKG": 100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 103.25,
          "gameMaxSpeedKPH": 90,
          "model": "faggio2",
          "hash": 55628203,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 25.000001907348633,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 1.600000023841858,
          "maxAcceleration": 0.10000000149011612
        },
        {
          "displayName": "Esskey",
          "manufacturer": "Pegassi",
          "price": 132000,
          "weightKG": 190,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 112.75,
          "gameMaxSpeedKPH": 145,
          "model": "esskey",
          "hash": 2035069708,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.29499998688697815
        },
        {
          "displayName": "Bati 801RR",
          "manufacturer": "Pegassi",
          "price": 7500,
          "weightKG": 230,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 135,
          "gameMaxSpeedKPH": 150,
          "model": "bati2",
          "hash": 3403504941,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 1.399999976158142,
          "maxTraction": 2.319999933242798,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Bati 801",
          "manufacturer": "Pegassi",
          "price": 7500,
          "weightKG": 230,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 135,
          "gameMaxSpeedKPH": 150,
          "model": "bati",
          "hash": 4180675781,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 1.399999976158142,
          "maxTraction": 2.319999933242798,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Speeder",
          "manufacturer": "Pegassi",
          "price": 162500,
          "weightKG": 2400,
          "drivetrain": null,
          "realMaxSpeedMPH": 68.25,
          "gameMaxSpeedKPH": 133,
          "model": "speeder",
          "hash": 231083307,
          "class": {
            "id": 14,
            "name": "Boats"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.9444465637207,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 0,
          "maxAcceleration": 16
        },
        {
          "displayName": "Speeder II",
          "manufacturer": "Pegassi",
          "price": 162500,
          "weightKG": 2400,
          "drivetrain": null,
          "realMaxSpeedMPH": 68.25,
          "gameMaxSpeedKPH": 133,
          "model": "speeder2",
          "hash": 437538602,
          "class": {
            "id": 14,
            "name": "Boats"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.9444465637207,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 0,
          "maxAcceleration": 16
        },
        {
          "displayName": "Comet SR",
          "manufacturer": "Pfister",
          "price": 572500,
          "weightKG": 1550,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 122,
          "gameMaxSpeedKPH": 157.5,
          "model": "comet5",
          "hash": 661493923,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.750003814697266,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 23.962499618530273,
          "maxAcceleration": 0.3199999928474426
        },
        {
          "displayName": "Neon",
          "manufacturer": "Pfister",
          "price": 750000,
          "weightKG": 2000,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 114,
          "gameMaxSpeedKPH": 156.5,
          "model": "neon",
          "hash": 2445973230,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.472225189208984,
          "maxBraking": 1.2999999523162842,
          "maxTraction": 2.2750000953674316,
          "maxAcceleration": 0.25049999356269836
        },
        {
          "displayName": "Comet Safari",
          "manufacturer": "Pfister",
          "price": 355000,
          "weightKG": 1150,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 120,
          "gameMaxSpeedKPH": 152,
          "model": "comet4",
          "hash": 1561920505,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 42.222225189208984,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.29249998927116394
        },
        {
          "displayName": "811",
          "manufacturer": "Pfister",
          "price": 567500,
          "weightKG": 1600,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 132.5,
          "gameMaxSpeedKPH": 159.3,
          "model": "pfister811",
          "hash": 2465164804,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.250003814697266,
          "maxBraking": 1.1200000047683716,
          "maxTraction": 2.687999963760376,
          "maxAcceleration": 0.35600000619888306
        },
        {
          "displayName": "Comet Retro Custom",
          "manufacturer": "Pfister",
          "price": 322500,
          "weightKG": 1200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 121.25,
          "gameMaxSpeedKPH": 152,
          "model": "comet3",
          "hash": 2272483501,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 42.222225189208984,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.9714999198913574,
          "maxAcceleration": 0.3400000035762787
        },
        {
          "displayName": "Comet",
          "manufacturer": "Pfister",
          "price": 50000,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 119.5,
          "gameMaxSpeedKPH": 152,
          "model": "comet2",
          "hash": 3249425686,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 42.222225189208984,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.5999999046325684,
          "maxAcceleration": 0.3400000035762787
        },
        {
          "displayName": "Deveste Eight",
          "manufacturer": "Principe",
          "price": 897500,
          "weightKG": 2300,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 131.75,
          "gameMaxSpeedKPH": 170,
          "model": "deveste",
          "hash": 1591739866,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 47.222225189208984,
          "maxBraking": 1,
          "maxTraction": 2.7249999046325684,
          "maxAcceleration": 0.41999998688697815
        },
        {
          "displayName": "Nemesis",
          "manufacturer": "Principe",
          "price": 6000,
          "weightKG": 250,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 111.25,
          "gameMaxSpeedKPH": 140,
          "model": "nemesis",
          "hash": 3660088182,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Lectro",
          "manufacturer": "Principe",
          "price": 498750,
          "weightKG": 250,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 109.25,
          "gameMaxSpeedKPH": 140,
          "model": "lectro",
          "hash": 640818791,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.2800000011920929
        },
        {
          "displayName": "Diabolus Custom",
          "manufacturer": "Principe",
          "price": 122500,
          "weightKG": 210,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 115.25,
          "gameMaxSpeedKPH": 142.6,
          "model": "diablous2",
          "hash": 1790834270,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 39.611114501953125,
          "maxBraking": 1.25,
          "maxTraction": 2,
          "maxAcceleration": 0.3199999928474426
        },
        {
          "displayName": "Diabolus",
          "manufacturer": "Principe",
          "price": 84500,
          "weightKG": 220,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 114.25,
          "gameMaxSpeedKPH": 142.5,
          "model": "diablous",
          "hash": 4055125828,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 39.583335876464844,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.31200000643730164
        },
        {
          "displayName": "PR4 (Formula 1 Car)",
          "manufacturer": "Progen",
          "price": 1757500,
          "weightKG": 505,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": null,
          "gameMaxSpeedKPH": 162.5,
          "model": "formula",
          "hash": 340154634,
          "class": {
            "id": 22
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 45.13888931274414,
          "maxBraking": 1.25,
          "maxTraction": 3.4075000286102295,
          "maxAcceleration": 0.75
        },
        {
          "displayName": "Emerus",
          "manufacturer": "Progen",
          "price": 1375000,
          "weightKG": 1198,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 127.25,
          "gameMaxSpeedKPH": 161.3,
          "model": "emerus",
          "hash": 1323778901,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.80555725097656,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 36.834999084472656,
          "maxAcceleration": 0.3779999911785126
        },
        {
          "displayName": "Tyrus",
          "manufacturer": "Progen",
          "price": 1275000,
          "weightKG": 915,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 123.5,
          "gameMaxSpeedKPH": 161,
          "model": "tyrus",
          "hash": 2067820283,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.722225189208984,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 2.9998161792755127,
          "maxAcceleration": 0.3709999918937683
        },
        {
          "displayName": "T20",
          "manufacturer": "Progen",
          "price": 1100000,
          "weightKG": 1395,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 122.25,
          "gameMaxSpeedKPH": 159.3,
          "model": "t20",
          "hash": 1663218586,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.250003814697266,
          "maxBraking": 1.100000023841858,
          "maxTraction": 2.680000066757202,
          "maxAcceleration": 0.36500000953674316
        },
        {
          "displayName": "Itali GTB Custom",
          "manufacturer": "Progen",
          "price": 247500,
          "weightKG": 1600,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 127,
          "gameMaxSpeedKPH": 159.2,
          "model": "italigtb2",
          "hash": 3812247419,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.222225189208984,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 2.68387508392334,
          "maxAcceleration": 0.3400000035762787
        },
        {
          "displayName": "Itali GTB",
          "manufacturer": "Progen",
          "price": 594500,
          "weightKG": 1800,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 126.25,
          "gameMaxSpeedKPH": 159,
          "model": "italigtb",
          "hash": 2246633323,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.16666793823242,
          "maxBraking": 1.100000023841858,
          "maxTraction": 2.5,
          "maxAcceleration": 0.33649998903274536
        },
        {
          "displayName": "GP1",
          "manufacturer": "Progen",
          "price": 630000,
          "weightKG": 1100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 123.75,
          "gameMaxSpeedKPH": 160.5,
          "model": "gp1",
          "hash": 1234311532,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.583335876464844,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 2.797250270843506,
          "maxAcceleration": 0.3700000047683716
        },
        {
          "displayName": "Zhaba",
          "manufacturer": "RUNE",
          "price": 1200000,
          "weightKG": 1600,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": null,
          "gameMaxSpeedKPH": 92.5,
          "model": "zhaba",
          "hash": 1284356689,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 25.694446563720703,
          "maxBraking": 0.800000011920929,
          "maxTraction": 1.899999976158142,
          "maxAcceleration": 0.18000000715255737
        },
        {
          "displayName": "Cheburek",
          "manufacturer": "RUNE",
          "price": 72500,
          "weightKG": 1100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 108.75,
          "gameMaxSpeedKPH": 140,
          "model": "cheburek",
          "hash": 3306466016,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.25,
          "maxAcceleration": 0.26499998569488525
        },
        {
          "displayName": "Deviant",
          "manufacturer": "Schyster",
          "price": 256000,
          "weightKG": 1500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 108.5,
          "gameMaxSpeedKPH": 145,
          "model": "deviant",
          "hash": 1279262537,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.5,
          "maxTraction": 2.25,
          "maxAcceleration": 0.28999999165534973
        },
        {
          "displayName": "Fusilade",
          "manufacturer": "Schyster",
          "price": 18000,
          "weightKG": 1500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 117.75,
          "gameMaxSpeedKPH": 149,
          "model": "fusilade",
          "hash": 499169875,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.38888931274414,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.450000047683716,
          "maxAcceleration": 0.3199999928474426
        },
        {
          "displayName": "Vader",
          "manufacturer": "Shitzu",
          "price": 4500,
          "weightKG": 230,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 107.75,
          "gameMaxSpeedKPH": 140,
          "model": "vader",
          "hash": 4154065143,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 1.100000023841858,
          "maxTraction": 1.899999976158142,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "PCJ 600",
          "manufacturer": "Shitzu",
          "price": 4500,
          "weightKG": 250,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 106.75,
          "gameMaxSpeedKPH": 130,
          "model": "pcj",
          "hash": 3385765638,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 1.2999999523162842,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "Hakuchou Drag Bike",
          "manufacturer": "Shitzu",
          "price": 488000,
          "weightKG": 270,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 126.5,
          "gameMaxSpeedKPH": 159,
          "model": "hakuchou2",
          "hash": 4039289119,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.16666793823242,
          "maxBraking": 1.399999976158142,
          "maxTraction": 2.9000000953674316,
          "maxAcceleration": 0.42500001192092896
        },
        {
          "displayName": "Hakuchou",
          "manufacturer": "Shitzu",
          "price": 41000,
          "weightKG": 250,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 134,
          "gameMaxSpeedKPH": 152,
          "model": "hakuchou",
          "hash": 1265391242,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 42.222225189208984,
          "maxBraking": 1.399999976158142,
          "maxTraction": 2.299999952316284,
          "maxAcceleration": 0.3149999976158142
        },
        {
          "displayName": "Defiler",
          "manufacturer": "Shitzu",
          "price": 206000,
          "weightKG": 200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 117,
          "gameMaxSpeedKPH": 148,
          "model": "defiler",
          "hash": 822018448,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.111114501953125,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 0.4050000011920929
        },
        {
          "displayName": "Tropic",
          "manufacturer": "Shitzu",
          "price": 11000,
          "weightKG": 2000,
          "drivetrain": null,
          "realMaxSpeedMPH": 63.25,
          "gameMaxSpeedKPH": 115,
          "model": "tropic",
          "hash": 290013743,
          "class": {
            "id": 14,
            "name": "Boats"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 31.944446563720703,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 0,
          "maxAcceleration": 13
        },
        {
          "displayName": "Tropic II",
          "manufacturer": "Shitzu",
          "price": 11000,
          "weightKG": 2000,
          "drivetrain": null,
          "realMaxSpeedMPH": 63.25,
          "gameMaxSpeedKPH": 115,
          "model": "tropic2",
          "hash": 1448677353,
          "class": {
            "id": 14,
            "name": "Boats"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 31.944446563720703,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 0,
          "maxAcceleration": 13
        },
        {
          "displayName": "Suntrap",
          "manufacturer": "Shitzu",
          "price": 12580,
          "weightKG": 2500,
          "drivetrain": null,
          "realMaxSpeedMPH": 51,
          "gameMaxSpeedKPH": 110,
          "model": "suntrap",
          "hash": 4012021193,
          "class": {
            "id": 14,
            "name": "Boats"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 30.555557250976562,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 0,
          "maxAcceleration": 11.5
        },
        {
          "displayName": "Squalo",
          "manufacturer": "Shitzu",
          "price": 98310.5,
          "weightKG": 3000,
          "drivetrain": null,
          "realMaxSpeedMPH": 65.75,
          "gameMaxSpeedKPH": 110,
          "model": "squalo",
          "hash": 400514754,
          "class": {
            "id": 14,
            "name": "Boats"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 30.555557250976562,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 0,
          "maxAcceleration": 11.5
        },
        {
          "displayName": "Jetmax",
          "manufacturer": "Shitzu",
          "price": 149500,
          "weightKG": 2000,
          "drivetrain": null,
          "realMaxSpeedMPH": 70,
          "gameMaxSpeedKPH": 135,
          "model": "jetmax",
          "hash": 861409633,
          "class": {
            "id": 14,
            "name": "Boats"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 0,
          "maxAcceleration": 17
        },
        {
          "displayName": "Seashark Lifeguard",
          "manufacturer": "Speedophile",
          "price": 8449.5,
          "weightKG": 400,
          "drivetrain": null,
          "realMaxSpeedMPH": 67,
          "gameMaxSpeedKPH": 130,
          "model": "seashark2",
          "hash": 3678636260,
          "class": {
            "id": 14,
            "name": "Boats"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 0,
          "maxAcceleration": 12.5
        },
        {
          "displayName": "Seashark",
          "manufacturer": "Speedophile",
          "price": 8449.5,
          "weightKG": 400,
          "drivetrain": null,
          "realMaxSpeedMPH": 67,
          "gameMaxSpeedKPH": 130,
          "model": "seashark",
          "hash": 3264692260,
          "class": {
            "id": 14,
            "name": "Boats"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 0,
          "maxAcceleration": 12.5
        },
        {
          "displayName": "Seashark II",
          "manufacturer": "Speedophile",
          "price": 8449.5,
          "weightKG": 400,
          "drivetrain": null,
          "realMaxSpeedMPH": 67,
          "gameMaxSpeedKPH": 130,
          "model": "seashark3",
          "hash": 3983945033,
          "class": {
            "id": 14,
            "name": "Boats"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 0,
          "maxAcceleration": 12.5
        },
        {
          "displayName": "Tractor",
          "manufacturer": "Stanley",
          "price": 100000,
          "weightKG": 2400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 28.5,
          "gameMaxSpeedKPH": 40,
          "model": "tractor",
          "hash": 1641462412,
          "class": {
            "id": 11,
            "name": "Utility"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 11.111111640930176,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 1.2000000476837158,
          "maxAcceleration": 0.07999999821186066
        },
        {
          "displayName": "Fieldmaster",
          "manufacturer": "Stanley",
          "price": 100000,
          "weightKG": 6500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 33.25,
          "gameMaxSpeedKPH": 45,
          "model": "tractor2",
          "hash": 2218488798,
          "class": {
            "id": 11,
            "name": "Utility"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 12.500000953674316,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 1.7000000476837158,
          "maxAcceleration": 0.15000000596046448
        },
        {
          "displayName": "Fieldmaster II",
          "manufacturer": "Stanley",
          "price": 100000,
          "weightKG": 6500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 33.25,
          "gameMaxSpeedKPH": 45,
          "model": "tractor3",
          "hash": 1445631933,
          "class": {
            "id": 11,
            "name": "Utility"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 12.500000953674316,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 1.7000000476837158,
          "maxAcceleration": 0.15000000596046448
        },
        {
          "displayName": "Thrax",
          "manufacturer": "Truffade",
          "price": 1162500,
          "weightKG": 1960,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 124,
          "gameMaxSpeedKPH": 158.5,
          "model": "thrax",
          "hash": 1044193113,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.02777862548828,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 33.183998107910156,
          "maxAcceleration": 0.3400000035762787
        },
        {
          "displayName": "Nero Custom",
          "manufacturer": "Truffade",
          "price": 302500,
          "weightKG": 1800,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 127.25,
          "gameMaxSpeedKPH": 160.2,
          "model": "nero2",
          "hash": 1093792632,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 44.5,
          "maxBraking": 1.100000023841858,
          "maxTraction": 2.674999952316284,
          "maxAcceleration": 0.34005001187324524
        },
        {
          "displayName": "Nero",
          "manufacturer": "Truffade",
          "price": 720000,
          "weightKG": 1995,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 126.5,
          "gameMaxSpeedKPH": 160,
          "model": "nero",
          "hash": 1034187331,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.4444465637207,
          "maxBraking": 1,
          "maxTraction": 2.6500000953674316,
          "maxAcceleration": 0.3375000059604645
        },
        {
          "displayName": "Adder",
          "manufacturer": "Truffade",
          "price": 500000,
          "weightKG": 1800,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 124.75,
          "gameMaxSpeedKPH": 160,
          "model": "adder",
          "hash": 3078201489,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.4444465637207,
          "maxBraking": 1,
          "maxTraction": 2.5,
          "maxAcceleration": 0.3199999928474426
        },
        {
          "displayName": "Z-Type",
          "manufacturer": "Truffade",
          "price": 475000,
          "weightKG": 1000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 126.25,
          "gameMaxSpeedKPH": 154,
          "model": "ztype",
          "hash": 758895617,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 42.77777862548828,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.299999952316284,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Rebla GTS",
          "manufacturer": "Ubermacht",
          "price": 587500,
          "weightKG": 2185,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 123.5,
          "gameMaxSpeedKPH": 157.5,
          "model": "rebla",
          "hash": 83136452,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 43.750003814697266,
          "maxBraking": 0.8500000238418579,
          "maxTraction": 2.194999933242798,
          "maxAcceleration": 0.33500000834465027
        },
        {
          "displayName": "Zion Classic",
          "manufacturer": "Ubermacht",
          "price": 406000,
          "weightKG": 1450,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 113.75,
          "gameMaxSpeedKPH": 149,
          "model": "zion3",
          "hash": 1862507111,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.38888931274414,
          "maxBraking": 0.8500000238418579,
          "maxTraction": 2.3499999046325684,
          "maxAcceleration": 0.3050000071525574
        },
        {
          "displayName": "Revolter",
          "manufacturer": "Ubermacht",
          "price": 805000,
          "weightKG": 2600,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 115.5,
          "gameMaxSpeedKPH": 140,
          "model": "revolter",
          "hash": 3884762073,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.25,
          "maxAcceleration": 0.3499999940395355
        },
        {
          "displayName": "Sentinel Classic",
          "manufacturer": "Ubermacht",
          "price": 325000,
          "weightKG": 1100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 117.25,
          "gameMaxSpeedKPH": 140,
          "model": "sentinel3",
          "hash": 1104234922,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.25,
          "maxAcceleration": 0.26499998569488525
        },
        {
          "displayName": "SC1",
          "manufacturer": "Ubermacht",
          "price": 801500,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 120.75,
          "gameMaxSpeedKPH": 159,
          "model": "sc1",
          "hash": 1352136073,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.16666793823242,
          "maxBraking": 1.1200000047683716,
          "maxTraction": 2.6500000953674316,
          "maxAcceleration": 0.3100000023841858
        },
        {
          "displayName": "Zion Cabrio",
          "manufacturer": "Ubermacht",
          "price": 32500,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 117,
          "gameMaxSpeedKPH": 145,
          "model": "zion2",
          "hash": 3101863448,
          "class": {
            "id": 3,
            "name": "Coupes"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.5999999046325684,
          "maxAcceleration": 0.2199999988079071
        },
        {
          "displayName": "Zion",
          "manufacturer": "Ubermacht",
          "price": 30000,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 117,
          "gameMaxSpeedKPH": 145,
          "model": "zion",
          "hash": 3172678083,
          "class": {
            "id": 3,
            "name": "Coupes"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.5999999046325684,
          "maxAcceleration": 0.2199999988079071
        },
        {
          "displayName": "Sentinel XS",
          "manufacturer": "Ubermacht",
          "price": 30000,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 117.25,
          "gameMaxSpeedKPH": 142,
          "model": "sentinel",
          "hash": 1349725314,
          "class": {
            "id": 3,
            "name": "Coupes"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 39.4444465637207,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.450000047683716,
          "maxAcceleration": 0.20999999344348907
        },
        {
          "displayName": "Sentinel",
          "manufacturer": "Ubermacht",
          "price": 47500,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 112,
          "gameMaxSpeedKPH": 142,
          "model": "sentinel2",
          "hash": 873639469,
          "class": {
            "id": 3,
            "name": "Coupes"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 39.4444465637207,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.450000047683716,
          "maxAcceleration": 0.20999999344348907
        },
        {
          "displayName": "Oracle XS",
          "manufacturer": "Ubermacht",
          "price": 41000,
          "weightKG": 1850,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 114,
          "gameMaxSpeedKPH": 150,
          "model": "oracle",
          "hash": 1348744438,
          "class": {
            "id": 3,
            "name": "Coupes"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.25,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "Oracle",
          "manufacturer": "Ubermacht",
          "price": 40000,
          "weightKG": 1900,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 115,
          "gameMaxSpeedKPH": 150,
          "model": "oracle2",
          "hash": 3783366066,
          "class": {
            "id": 3,
            "name": "Coupes"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.25,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Retinue MK II",
          "manufacturer": "Vapid",
          "price": 810000,
          "weightKG": 950,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 120.5,
          "gameMaxSpeedKPH": 145,
          "model": "retinue2",
          "hash": 2031587082,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.7200000286102295,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.2775000035762787
        },
        {
          "displayName": "Nightmare Slamvan",
          "manufacturer": "Vapid",
          "price": 660937.5,
          "weightKG": 1245,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 121,
          "gameMaxSpeedKPH": 135.5,
          "model": "slamvan6",
          "hash": 1742022738,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 37.63888931274414,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 1.850000023841858,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Nightmare Imperator",
          "manufacturer": "Vapid",
          "price": 1142470,
          "weightKG": 2000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 132.75,
          "gameMaxSpeedKPH": 150,
          "model": "imperator3",
          "hash": 3539435063,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 0.5,
          "maxTraction": 2.25,
          "maxAcceleration": 0.36500000953674316
        },
        {
          "displayName": "Nightmare Dominator",
          "manufacturer": "Vapid",
          "price": 566000,
          "weightKG": 1550,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 131,
          "gameMaxSpeedKPH": 150,
          "model": "dominator6",
          "hash": 3001042683,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.3499999046325684,
          "maxAcceleration": 0.375
        },
        {
          "displayName": "Future Shock Slamvan",
          "manufacturer": "Vapid",
          "price": 660937.5,
          "weightKG": 1245,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 121,
          "gameMaxSpeedKPH": 135.5,
          "model": "slamvan5",
          "hash": 373261600,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 37.63888931274414,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 1.850000023841858,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Future Shock Imperator",
          "manufacturer": "Vapid",
          "price": 1142470,
          "weightKG": 2000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 132.75,
          "gameMaxSpeedKPH": 150,
          "model": "imperator2",
          "hash": 1637620610,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 0.5,
          "maxTraction": 2.25,
          "maxAcceleration": 0.36500000953674316
        },
        {
          "displayName": "Future Shock Dominator",
          "manufacturer": "Vapid",
          "price": 566000,
          "weightKG": 1550,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 131,
          "gameMaxSpeedKPH": 150,
          "model": "dominator5",
          "hash": 2919906639,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.3499999046325684,
          "maxAcceleration": 0.375
        },
        {
          "displayName": "Lost Slamvan",
          "manufacturer": "Vapid",
          "price": 170000,
          "weightKG": 1200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 108,
          "gameMaxSpeedKPH": 135,
          "model": "slamvan2",
          "hash": 833469436,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.699999988079071,
          "maxTraction": 1.850000023841858,
          "maxAcceleration": 0.25
        },
        {
          "displayName": "Peyote Gasser",
          "manufacturer": "Vapid",
          "price": 402500,
          "weightKG": 2100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 118,
          "gameMaxSpeedKPH": 148.5,
          "model": "peyote2",
          "hash": 2490551588,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.250003814697266,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.259999990463257,
          "maxAcceleration": 0.34450000524520874
        },
        {
          "displayName": "Caracara 4x4",
          "manufacturer": "Vapid",
          "price": 437500,
          "weightKG": 2480,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 103.25,
          "gameMaxSpeedKPH": 138,
          "model": "caracara2",
          "hash": 2945871676,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.333335876464844,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Clique",
          "manufacturer": "Vapid",
          "price": 454500,
          "weightKG": 1250,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 117.5,
          "gameMaxSpeedKPH": 150,
          "model": "clique",
          "hash": 2728360112,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 0.8500000238418579,
          "maxTraction": 2.3499999046325684,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Apocalypse Imperator",
          "manufacturer": "Vapid",
          "price": 1142470,
          "weightKG": 2000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 132.75,
          "gameMaxSpeedKPH": 150,
          "model": "imperator",
          "hash": 444994115,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 0.5,
          "maxTraction": 2.25,
          "maxAcceleration": 0.36500000953674316
        },
        {
          "displayName": "Apocalypse Slamvan",
          "manufacturer": "Vapid",
          "price": 660937.5,
          "weightKG": 1245,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 121,
          "gameMaxSpeedKPH": 135.5,
          "model": "slamvan4",
          "hash": 2233918197,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 37.63888931274414,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 1.850000023841858,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Apocalypse Dominator",
          "manufacturer": "Vapid",
          "price": 566000,
          "weightKG": 1550,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 131,
          "gameMaxSpeedKPH": 150,
          "model": "dominator4",
          "hash": 3606777648,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.3499999046325684,
          "maxAcceleration": 0.375
        },
        {
          "displayName": "Speedo Custom",
          "manufacturer": "Vapid",
          "price": 100000,
          "weightKG": 2500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 105,
          "gameMaxSpeedKPH": 130,
          "model": "speedo4",
          "hash": 219613597,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6499999761581421,
          "maxTraction": 1.899999976158142,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Clown Van",
          "manufacturer": "Vapid",
          "price": 100000,
          "weightKG": 2500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 94.75,
          "gameMaxSpeedKPH": 130,
          "model": "speedo2",
          "hash": 728614474,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.7999999523162842,
          "maxAcceleration": 0.18000000715255737
        },
        {
          "displayName": "Dominator GTX",
          "manufacturer": "Vapid",
          "price": 362500,
          "weightKG": 1670,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 108.5,
          "gameMaxSpeedKPH": 145.5,
          "model": "dominator3",
          "hash": 3308022675,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.41666793823242,
          "maxBraking": 0.5,
          "maxTraction": 2.569999933242798,
          "maxAcceleration": 0.33500000834465027
        },
        {
          "displayName": "Flash GT",
          "manufacturer": "Vapid",
          "price": 837500,
          "weightKG": 1200,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 116.25,
          "gameMaxSpeedKPH": 152,
          "model": "flashgt",
          "hash": 3035832600,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 42.222225189208984,
          "maxBraking": 1,
          "maxTraction": 19.600000381469727,
          "maxAcceleration": 0.3199999928474426
        },
        {
          "displayName": "Caracara",
          "manufacturer": "Vapid",
          "price": 887500,
          "weightKG": 3500,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 100.75,
          "gameMaxSpeedKPH": 135,
          "model": "caracara",
          "hash": 1254014755,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 5,
          "maxPassengers": 4,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.27000001072883606,
          "maxTraction": 2.25,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Ellie",
          "manufacturer": "Vapid",
          "price": 282500,
          "weightKG": 1370,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 106.5,
          "gameMaxSpeedKPH": 140.5,
          "model": "ellie",
          "hash": 3027423925,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 39.02777862548828,
          "maxBraking": 0.5,
          "maxTraction": 2.549999952316284,
          "maxAcceleration": 0.32499998807907104
        },
        {
          "displayName": "GB200",
          "manufacturer": "Vapid",
          "price": 470000,
          "weightKG": 1180,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 114.25,
          "gameMaxSpeedKPH": 152,
          "model": "gb200",
          "hash": 1909189272,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 42.222225189208984,
          "maxBraking": 1,
          "maxTraction": 14.375,
          "maxAcceleration": 0.3149999976158142
        },
        {
          "displayName": "Hustler",
          "manufacturer": "Vapid",
          "price": 312500,
          "weightKG": 1000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 121.25,
          "gameMaxSpeedKPH": 140,
          "model": "hustler",
          "hash": 600450546,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.4300000071525574,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Riata",
          "manufacturer": "Vapid",
          "price": 190000,
          "weightKG": 2300,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 104,
          "gameMaxSpeedKPH": 135,
          "model": "riata",
          "hash": 2762269779,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.25
        },
        {
          "displayName": "Speedo",
          "manufacturer": "Vapid",
          "price": 110000,
          "weightKG": 2500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 94.75,
          "gameMaxSpeedKPH": 130,
          "model": "speedo",
          "hash": 3484649228,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.7999999523162842,
          "maxAcceleration": 0.18000000715255737
        },
        {
          "displayName": "Minivan Custom",
          "manufacturer": "Vapid",
          "price": 165000,
          "weightKG": 2200,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 95.5,
          "gameMaxSpeedKPH": 125,
          "model": "minivan2",
          "hash": 3168702960,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 34.722225189208984,
          "maxBraking": 0.44999998807907104,
          "maxTraction": 1.9249999523162842,
          "maxAcceleration": 0.15000000596046448
        },
        {
          "displayName": "Minivan",
          "manufacturer": "Vapid",
          "price": 15000,
          "weightKG": 2000,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 94.75,
          "gameMaxSpeedKPH": 125,
          "model": "minivan",
          "hash": 3984502180,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 34.722225189208984,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 1.899999976158142,
          "maxAcceleration": 0.15000000596046448
        },
        {
          "displayName": "Bobcat XL",
          "manufacturer": "Vapid",
          "price": 11500,
          "weightKG": 2600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 95.5,
          "gameMaxSpeedKPH": 130,
          "model": "bobcatxl",
          "hash": 1069929536,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.800000011920929,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.18000000715255737
        },
        {
          "displayName": "Utility Truck (Contender)",
          "manufacturer": "Vapid",
          "price": 100000,
          "weightKG": 3500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 77,
          "gameMaxSpeedKPH": 115,
          "model": "utillitruck3",
          "hash": 2132890591,
          "class": {
            "id": 11,
            "name": "Utility"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 31.944446563720703,
          "maxBraking": 0.25,
          "maxTraction": 1.600000023841858,
          "maxAcceleration": 0.11999999731779099
        },
        {
          "displayName": "Tow Truck (Large)",
          "manufacturer": "Vapid",
          "price": 100000,
          "weightKG": 5000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 81.75,
          "gameMaxSpeedKPH": 105,
          "model": "towtruck",
          "hash": 2971866336,
          "class": {
            "id": 11,
            "name": "Utility"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 29.166667938232422,
          "maxBraking": 0.25,
          "maxTraction": 1.600000023841858,
          "maxAcceleration": 0.15000000596046448
        },
        {
          "displayName": "Tow Truck",
          "manufacturer": "Vapid",
          "price": 100000,
          "weightKG": 5000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 85.75,
          "gameMaxSpeedKPH": 100,
          "model": "towtruck2",
          "hash": 3852654278,
          "class": {
            "id": 11,
            "name": "Utility"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.25,
          "maxTraction": 1.4500000476837158,
          "maxAcceleration": 0.15000000596046448
        },
        {
          "displayName": "Scrap Truck",
          "manufacturer": "Vapid",
          "price": 100000,
          "weightKG": 5000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 77.75,
          "gameMaxSpeedKPH": 105,
          "model": "scrap",
          "hash": 2594165727,
          "class": {
            "id": 11,
            "name": "Utility"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 29.166667938232422,
          "maxBraking": 0.25,
          "maxTraction": 1.600000023841858,
          "maxAcceleration": 0.12999999523162842
        },
        {
          "displayName": "Sadler",
          "manufacturer": "Vapid",
          "price": 17500,
          "weightKG": 2100,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 100,
          "gameMaxSpeedKPH": 130,
          "model": "sadler",
          "hash": 3695398481,
          "class": {
            "id": 11,
            "name": "Utility"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Sadler II",
          "manufacturer": "Vapid",
          "price": 17500,
          "weightKG": 2100,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 100,
          "gameMaxSpeedKPH": 130,
          "model": "sadler2",
          "hash": 734217681,
          "class": {
            "id": 11,
            "name": "Utility"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Radius",
          "manufacturer": "Vapid",
          "price": 16000,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 104.5,
          "gameMaxSpeedKPH": 140,
          "model": "radi",
          "hash": 2643899483,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.25,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Contender",
          "manufacturer": "Vapid",
          "price": 125000,
          "weightKG": 2750,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 109,
          "gameMaxSpeedKPH": 135,
          "model": "contender",
          "hash": 683047626,
          "class": {
            "id": 2,
            "name": "SUVs"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "FMJ",
          "manufacturer": "Vapid",
          "price": 875000,
          "weightKG": 1315,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 125,
          "gameMaxSpeedKPH": 158.4,
          "model": "fmj",
          "hash": 1426219628,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44,
          "maxBraking": 1.100000023841858,
          "maxTraction": 2.700000047683716,
          "maxAcceleration": 0.36550000309944153
        },
        {
          "displayName": "Bullet",
          "manufacturer": "Vapid",
          "price": 77500,
          "weightKG": 1100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 118.75,
          "gameMaxSpeedKPH": 152,
          "model": "bullet",
          "hash": 2598821281,
          "class": {
            "id": 7,
            "name": "Super"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 42.222225189208984,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.549999952316284,
          "maxAcceleration": 0.33000001311302185
        },
        {
          "displayName": "Retinue",
          "manufacturer": "Vapid",
          "price": 307500,
          "weightKG": 900,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 116.5,
          "gameMaxSpeedKPH": 140,
          "model": "retinue",
          "hash": 1841130506,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.699999988079071,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.22750000655651093
        },
        {
          "displayName": "Peyote",
          "manufacturer": "Vapid",
          "price": 80000,
          "weightKG": 2100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 98.25,
          "gameMaxSpeedKPH": 130,
          "model": "peyote",
          "hash": 1830407356,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.25,
          "maxTraction": 1.850000023841858,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Taxi",
          "manufacturer": "Vapid",
          "price": 100000,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 102,
          "gameMaxSpeedKPH": 143,
          "model": "taxi",
          "hash": 3338918751,
          "class": {
            "id": 17,
            "name": "Service"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 39.722225189208984,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.549999952316284,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Stanier",
          "manufacturer": "Vapid",
          "price": 5000,
          "weightKG": 1800,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 108,
          "gameMaxSpeedKPH": 140,
          "model": "stanier",
          "hash": 2817386317,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.450000047683716,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Trophy Truck",
          "manufacturer": "Vapid",
          "price": 275000,
          "weightKG": 2200,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 107,
          "gameMaxSpeedKPH": 140,
          "model": "trophytruck",
          "hash": 101905590,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 2.5,
          "maxAcceleration": 0.33899998664855957
        },
        {
          "displayName": "Liberator",
          "manufacturer": "Vapid",
          "price": 278255.5,
          "weightKG": 4000,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 80.25,
          "gameMaxSpeedKPH": 110,
          "model": "monster",
          "hash": 3449006043,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 30.555557250976562,
          "maxBraking": 0.6499999761581421,
          "maxTraction": 2.25,
          "maxAcceleration": 0.4000000059604645
        },
        {
          "displayName": "Sandking XL",
          "manufacturer": "Vapid",
          "price": 22500,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 99,
          "gameMaxSpeedKPH": 130,
          "model": "sandking",
          "hash": 3105951696,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Sandking SWB",
          "manufacturer": "Vapid",
          "price": 19000,
          "weightKG": 2400,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 99,
          "gameMaxSpeedKPH": 130,
          "model": "sandking2",
          "hash": 989381445,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Desert Raid",
          "manufacturer": "Vapid",
          "price": 347500,
          "weightKG": 2200,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 106.5,
          "gameMaxSpeedKPH": 140,
          "model": "trophytruck2",
          "hash": 3631668194,
          "class": {
            "id": 9,
            "name": "Off-road"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 2.5,
          "maxAcceleration": 0.33899998664855957
        },
        {
          "displayName": "Slamvan Custom",
          "manufacturer": "Vapid",
          "price": 197125,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 117.5,
          "gameMaxSpeedKPH": 135,
          "model": "slamvan3",
          "hash": 1119641113,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.3499999046325684,
          "maxAcceleration": 0.25
        },
        {
          "displayName": "Slamvan",
          "manufacturer": "Vapid",
          "price": 24750,
          "weightKG": 1200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 108,
          "gameMaxSpeedKPH": 135,
          "model": "slamvan",
          "hash": 729783779,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.649999976158142,
          "maxAcceleration": 0.24500000476837158
        },
        {
          "displayName": "Hotknife",
          "manufacturer": "Vapid",
          "price": 45000,
          "weightKG": 700,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 109.5,
          "gameMaxSpeedKPH": 140,
          "model": "hotknife",
          "hash": 37348240,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.4300000071525574,
          "maxTraction": 1.850000023841858,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Pißwasser Dominator",
          "manufacturer": "Vapid",
          "price": 157500,
          "weightKG": 1500,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 126.5,
          "gameMaxSpeedKPH": 147,
          "model": "dominator2",
          "hash": 3379262425,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 40.833335876464844,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.299999952316284,
          "maxAcceleration": 0.3100000023841858
        },
        {
          "displayName": "Dominator",
          "manufacturer": "Vapid",
          "price": 17500,
          "weightKG": 1600,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 120.25,
          "gameMaxSpeedKPH": 145,
          "model": "dominator",
          "hash": 80636076,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.25,
          "maxAcceleration": 0.28999999165534973
        },
        {
          "displayName": "Chino Custom",
          "manufacturer": "Vapid",
          "price": 90000,
          "weightKG": 2400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 95.5,
          "gameMaxSpeedKPH": 130,
          "model": "chino2",
          "hash": 2933279331,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.069999933242798,
          "maxAcceleration": 0.20999999344348907
        },
        {
          "displayName": "Chino",
          "manufacturer": "Vapid",
          "price": 112500,
          "weightKG": 2300,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 94.25,
          "gameMaxSpeedKPH": 130,
          "model": "chino",
          "hash": 349605904,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Blade",
          "manufacturer": "Vapid",
          "price": 80000,
          "weightKG": 1200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 109.75,
          "gameMaxSpeedKPH": 145,
          "model": "blade",
          "hash": 3089165662,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.2300000190734863,
          "maxAcceleration": 0.3240000009536743
        },
        {
          "displayName": "Guardian",
          "manufacturer": "Vapid",
          "price": 187500,
          "weightKG": 3800,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 100.5,
          "gameMaxSpeedKPH": 130,
          "model": "guardian",
          "hash": 2186977100,
          "class": {
            "id": 10,
            "name": "Industrial"
          },
          "seats": 6,
          "maxPassengers": 5,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2,
          "maxAcceleration": 0.20999999344348907
        },
        {
          "displayName": "Unmarked Cruiser",
          "manufacturer": "Vapid",
          "price": 100000,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 102.75,
          "gameMaxSpeedKPH": 145,
          "model": "police4",
          "hash": 2321795001,
          "class": {
            "id": 18,
            "name": "Emergency"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.549999952316284,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Sheriff Cruiser",
          "manufacturer": "Vapid",
          "price": 100000,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 101.75,
          "gameMaxSpeedKPH": 145,
          "model": "sheriff",
          "hash": 2611638396,
          "class": {
            "id": 18,
            "name": "Emergency"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.25,
          "maxAcceleration": 0.23999999463558197
        },
        {
          "displayName": "Police Prison Bus",
          "manufacturer": "Vapid",
          "price": 365750,
          "weightKG": 9000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 65.25,
          "gameMaxSpeedKPH": 90,
          "model": "pbus",
          "hash": 2287941233,
          "class": {
            "id": 18,
            "name": "Emergency"
          },
          "seats": 11,
          "maxPassengers": 10,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 25.000001907348633,
          "maxBraking": 0.25,
          "maxTraction": 1.350000023841858,
          "maxAcceleration": 0.14000000059604645
        },
        {
          "displayName": "Police Cruiser (Interceptor)",
          "manufacturer": "Vapid",
          "price": 100000,
          "weightKG": 1450,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 109.25,
          "gameMaxSpeedKPH": 150,
          "model": "police3",
          "hash": 1912215274,
          "class": {
            "id": 18,
            "name": "Emergency"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 41.66666793823242,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 2.569999933242798,
          "maxAcceleration": 0.30000001192092896
        },
        {
          "displayName": "Police Cruiser",
          "manufacturer": "Vapid",
          "price": 100000,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 102.75,
          "gameMaxSpeedKPH": 145,
          "model": "police",
          "hash": 2046537925,
          "class": {
            "id": 18,
            "name": "Emergency"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 40.27777862548828,
          "maxBraking": 0.8999999761581421,
          "maxTraction": 2.549999952316284,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Benson",
          "manufacturer": "Vapid",
          "price": 100000,
          "weightKG": 7000,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 89.75,
          "gameMaxSpeedKPH": 130,
          "model": "benson",
          "hash": 2053223216,
          "class": {
            "id": 20,
            "name": "Commercial"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 0.25,
          "maxTraction": 1.75,
          "maxAcceleration": 0.1599999964237213
        },
        {
          "displayName": "Anti-Aircraft Trailer",
          "manufacturer": "Vom Feuer",
          "price": 931000,
          "weightKG": 1000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 88.25,
          "gameMaxSpeedKPH": null,
          "model": "trailersmall2",
          "hash": 2413121211,
          "class": {
            "id": 19,
            "name": "Military"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 29.166667938232422,
          "maxBraking": 0.699999988079071,
          "maxTraction": 3.700000047683716,
          "maxAcceleration": 0
        },
        {
          "displayName": "Nebula Turbo",
          "manufacturer": "Vulcar",
          "price": 398500,
          "weightKG": 1320,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 101,
          "gameMaxSpeedKPH": 138,
          "model": "nebula",
          "hash": 3412338231,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.333335876464844,
          "maxBraking": 0.5,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.23999999463558197
        },
        {
          "displayName": "Fagaloa",
          "manufacturer": "Vulcar",
          "price": 167500,
          "weightKG": 1100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 87.5,
          "gameMaxSpeedKPH": 120,
          "model": "fagaloa",
          "hash": 1617472902,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 33.333335876464844,
          "maxBraking": 0.7749999761581421,
          "maxTraction": 2.375,
          "maxAcceleration": 0.20999999344348907
        },
        {
          "displayName": "Warrener",
          "manufacturer": "Vulcar",
          "price": 60000,
          "weightKG": 1300,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 103.25,
          "gameMaxSpeedKPH": 140,
          "model": "warrener",
          "hash": 1373123368,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.949999988079071,
          "maxTraction": 2.1600000858306885,
          "maxAcceleration": 0.24500000476837158
        },
        {
          "displayName": "Ingot",
          "manufacturer": "Vulcar",
          "price": 4500,
          "weightKG": 1400,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 90,
          "gameMaxSpeedKPH": 125,
          "model": "ingot",
          "hash": 3005245074,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 34.722225189208984,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.14000000059604645
        },
        {
          "displayName": "Neo",
          "manufacturer": "Vysser",
          "price": 937500,
          "weightKG": 1390,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 125.75,
          "gameMaxSpeedKPH": 160.85,
          "model": "neo",
          "hash": 2674840994,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 44.68056106567383,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 2.619999885559082,
          "maxAcceleration": 0.3869999945163727
        },
        {
          "displayName": "Nightmare Issi",
          "manufacturer": "Weeny",
          "price": 544500,
          "weightKG": 1200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 124.25,
          "gameMaxSpeedKPH": 140,
          "model": "issi6",
          "hash": 1239571361,
          "class": {
            "id": 0,
            "name": "Compacts"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 2,
          "maxAcceleration": 0.3400000035762787
        },
        {
          "displayName": "Future Shock Issi",
          "manufacturer": "Weeny",
          "price": 544500,
          "weightKG": 1200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 124.25,
          "gameMaxSpeedKPH": 140,
          "model": "issi5",
          "hash": 1537277726,
          "class": {
            "id": 0,
            "name": "Compacts"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 2,
          "maxAcceleration": 0.3400000035762787
        },
        {
          "displayName": "Dynasty",
          "manufacturer": "Weeny",
          "price": 225000,
          "weightKG": 1100,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 93.5,
          "gameMaxSpeedKPH": 118,
          "model": "dynasty",
          "hash": 310284501,
          "class": {
            "id": 5,
            "name": "Sports Classics"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 32.77777862548828,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 1.7000000476837158,
          "maxAcceleration": 0.18000000715255737
        },
        {
          "displayName": "Issi Sport",
          "manufacturer": "Weeny",
          "price": 448500,
          "weightKG": 1000,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 114.25,
          "gameMaxSpeedKPH": 148,
          "model": "issi7",
          "hash": 1854776567,
          "class": {
            "id": 6,
            "name": "Sports"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 41.111114501953125,
          "maxBraking": 1,
          "maxTraction": 20.399999618530273,
          "maxAcceleration": 0.3050000071525574
        },
        {
          "displayName": "Apocalypse Issi",
          "manufacturer": "Weeny",
          "price": 544500,
          "weightKG": 1200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 124.25,
          "gameMaxSpeedKPH": 140,
          "model": "issi4",
          "hash": 628003514,
          "class": {
            "id": 0,
            "name": "Compacts"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.4000000059604645,
          "maxTraction": 2,
          "maxAcceleration": 0.3400000035762787
        },
        {
          "displayName": "Issi Classic",
          "manufacturer": "Weeny",
          "price": 180000,
          "weightKG": 650,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 95.25,
          "gameMaxSpeedKPH": 125,
          "model": "issi3",
          "hash": 931280609,
          "class": {
            "id": 0,
            "name": "Compacts"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 34.722225189208984,
          "maxBraking": 0.30000001192092896,
          "maxTraction": 2,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "Issi",
          "manufacturer": "Weeny",
          "price": 9000,
          "weightKG": 1200,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 104.25,
          "gameMaxSpeedKPH": 135,
          "model": "issi2",
          "hash": 3117103977,
          "class": {
            "id": 0,
            "name": "Compacts"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.23000000417232513
        },
        {
          "displayName": "Nightmare Deathbike",
          "manufacturer": "Western",
          "price": 634500,
          "weightKG": 135,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 150,
          "gameMaxSpeedKPH": 147,
          "model": "deathbike3",
          "hash": 2920466844,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 40.833335876464844,
          "maxBraking": 1.100000023841858,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.3125
        },
        {
          "displayName": "Future Shock Deathbike",
          "manufacturer": "Western",
          "price": 634500,
          "weightKG": 135,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 150,
          "gameMaxSpeedKPH": 147,
          "model": "deathbike2",
          "hash": 2482017624,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 40.833335876464844,
          "maxBraking": 1.100000023841858,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.3125
        },
        {
          "displayName": "Rampant Rocket Tricycle",
          "manufacturer": "Western",
          "price": 462500,
          "weightKG": 1140,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 106,
          "gameMaxSpeedKPH": 142,
          "model": "rrocket",
          "hash": 916547552,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 39.4444465637207,
          "maxBraking": 1,
          "maxTraction": 2.0999999046325684,
          "maxAcceleration": 0.38199999928474426
        },
        {
          "displayName": "Apocalypse Deathbike",
          "manufacturer": "Western",
          "price": 634500,
          "weightKG": 135,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 150,
          "gameMaxSpeedKPH": 147,
          "model": "deathbike",
          "hash": 4267640610,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 40.833335876464844,
          "maxBraking": 1.100000023841858,
          "maxTraction": 2.049999952316284,
          "maxAcceleration": 0.3125
        },
        {
          "displayName": "Zombie Chopper",
          "manufacturer": "Western",
          "price": 61000,
          "weightKG": 225,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 113.75,
          "gameMaxSpeedKPH": 137,
          "model": "zombieb",
          "hash": 3724934023,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.05555725097656,
          "maxBraking": 0.800000011920929,
          "maxTraction": 1.875,
          "maxAcceleration": 0.28999999165534973
        },
        {
          "displayName": "Zombie Bobber",
          "manufacturer": "Western",
          "price": 49500,
          "weightKG": 225,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 113.75,
          "gameMaxSpeedKPH": 137,
          "model": "zombiea",
          "hash": 3285698347,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.05555725097656,
          "maxBraking": 0.800000011920929,
          "maxTraction": 1.875,
          "maxAcceleration": 0.28999999165534973
        },
        {
          "displayName": "Wolfsbane",
          "manufacturer": "Western",
          "price": 47500,
          "weightKG": 180,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 101.5,
          "gameMaxSpeedKPH": 130,
          "model": "wolfsbane",
          "hash": 3676349299,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 1.649999976158142,
          "maxAcceleration": 0.2150000035762787
        },
        {
          "displayName": "Sovereign",
          "manufacturer": "Western",
          "price": 45000,
          "weightKG": 250,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 106.25,
          "gameMaxSpeedKPH": 135,
          "model": "sovereign",
          "hash": 743478836,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 1.100000023841858,
          "maxTraction": 1.899999976158142,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Rat Bike",
          "manufacturer": "Western",
          "price": 24000,
          "weightKG": 180,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 123.5,
          "gameMaxSpeedKPH": 130,
          "model": "ratbike",
          "hash": 1873600305,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 1.649999976158142,
          "maxAcceleration": 0.2150000035762787
        },
        {
          "displayName": "Nightblade",
          "manufacturer": "Western",
          "price": 50000,
          "weightKG": 205,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 114.25,
          "gameMaxSpeedKPH": 142,
          "model": "nightblade",
          "hash": 2688780135,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 39.4444465637207,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 1.9500000476837158,
          "maxAcceleration": 0.3100000023841858
        },
        {
          "displayName": "Gargoyle",
          "manufacturer": "Western",
          "price": 60000,
          "weightKG": 135,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 125,
          "gameMaxSpeedKPH": 147,
          "model": "gargoyle",
          "hash": 741090084,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.833335876464844,
          "maxBraking": 1.100000023841858,
          "maxTraction": 2.25,
          "maxAcceleration": 0.3125
        },
        {
          "displayName": "Daemon Custom",
          "manufacturer": "Western",
          "price": 72500,
          "weightKG": 250,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 107,
          "gameMaxSpeedKPH": 135,
          "model": "daemon2",
          "hash": 2890830793,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.850000023841858,
          "maxAcceleration": 0.2619999945163727
        },
        {
          "displayName": "Daemon",
          "manufacturer": "Western",
          "price": 100000,
          "weightKG": 250,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 107,
          "gameMaxSpeedKPH": 135,
          "model": "daemon",
          "hash": 2006142190,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 1.850000023841858,
          "maxAcceleration": 0.25999999046325684
        },
        {
          "displayName": "Cliffhanger",
          "manufacturer": "Western",
          "price": 112500,
          "weightKG": 140,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 124.75,
          "gameMaxSpeedKPH": 147.5,
          "model": "cliffhanger",
          "hash": 390201602,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 40.972225189208984,
          "maxBraking": 1.100000023841858,
          "maxTraction": 2.25,
          "maxAcceleration": 0.3179999887943268
        },
        {
          "displayName": "Bagger",
          "manufacturer": "Western",
          "price": 8000,
          "weightKG": 230,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 98,
          "gameMaxSpeedKPH": 130,
          "model": "bagger",
          "hash": 2154536131,
          "class": {
            "id": 8,
            "name": "Motorcycles"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 36.111114501953125,
          "maxBraking": 1.2000000476837158,
          "maxTraction": 1.649999976158142,
          "maxAcceleration": 0.20999999344348907
        },
        {
          "displayName": "Police Bike",
          "manufacturer": "Western",
          "price": 100000,
          "weightKG": 250,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 100.5,
          "gameMaxSpeedKPH": 135,
          "model": "policeb",
          "hash": 4260343491,
          "class": {
            "id": 18,
            "name": "Emergency"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 1.100000023841858,
          "maxTraction": 1.899999976158142,
          "maxAcceleration": 0.27000001072883606
        },
        {
          "displayName": "Cargobob Jetsam",
          "manufacturer": "Western Company",
          "price": 997500,
          "weightKG": 15000,
          "drivetrain": null,
          "realMaxSpeedMPH": 99.5,
          "gameMaxSpeedKPH": 160,
          "model": "cargobob2",
          "hash": 1621617168,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 10,
          "maxPassengers": 9,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 49.919960021972656,
          "maxBraking": 2.494999647140503,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 4.998000144958496
        },
        {
          "displayName": "Seabreeze",
          "manufacturer": "Western Company",
          "price": 565250,
          "weightKG": 3000,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 191.75,
          "gameMaxSpeedKPH": 328.6,
          "model": "seabreeze",
          "hash": 3902291871,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 81.649658203125,
          "maxBraking": 16.40341567993164,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 20.09000015258789
        },
        {
          "displayName": "Rogue",
          "manufacturer": "Western Company",
          "price": 798000,
          "weightKG": 4200,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 219.5,
          "gameMaxSpeedKPH": 328.6,
          "model": "rogue",
          "hash": 3319621991,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 100,
          "maxBraking": 9.800000190734863,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 9.800000190734863
        },
        {
          "displayName": "Mallard",
          "manufacturer": "Western Company",
          "price": 125000,
          "weightKG": 1000,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 140.25,
          "gameMaxSpeedKPH": 284.4,
          "model": "stunt",
          "hash": 2172210288,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 79.05693817138672,
          "maxBraking": 7.747579574584961,
          "maxTraction": 1.149999976158142,
          "maxAcceleration": 9.800000190734863
        },
        {
          "displayName": "Duster",
          "manufacturer": "Western Company",
          "price": 137500,
          "weightKG": 2000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 144,
          "gameMaxSpeedKPH": 249.8,
          "model": "duster",
          "hash": 970356638,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 69.36756134033203,
          "maxBraking": 3.39901065826416,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 4.900000095367432
        },
        {
          "displayName": "Cuban 800",
          "manufacturer": "Western Company",
          "price": 120000,
          "weightKG": 5000,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 142,
          "gameMaxSpeedKPH": 276.5,
          "model": "cuban800",
          "hash": 3650256867,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 76.79570770263672,
          "maxBraking": 4.51558780670166,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 5.880000114440918
        },
        {
          "displayName": "Besra",
          "manufacturer": "Western Company",
          "price": 575000,
          "weightKG": 8000,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 189.25,
          "gameMaxSpeedKPH": 328.6,
          "model": "besra",
          "hash": 1824333165,
          "class": {
            "id": 16,
            "name": "Planes"
          },
          "seats": 1,
          "maxPassengers": 0,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 87.70580291748047,
          "maxBraking": 18.4796142578125,
          "maxTraction": 2.1500000953674316,
          "maxAcceleration": 21.07000160217285
        },
        {
          "displayName": "Cargobob",
          "manufacturer": "Western Company",
          "price": 895000,
          "weightKG": 15000,
          "drivetrain": null,
          "realMaxSpeedMPH": 99.5,
          "gameMaxSpeedKPH": 160,
          "model": "cargobob",
          "hash": 4244420235,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 10,
          "maxPassengers": 9,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 49.919960021972656,
          "maxBraking": 2.494999647140503,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 4.998000144958496
        },
        {
          "displayName": "Cargobob II",
          "manufacturer": "Western Company",
          "price": 895000,
          "weightKG": 15000,
          "drivetrain": null,
          "realMaxSpeedMPH": 99.5,
          "gameMaxSpeedKPH": 160,
          "model": "cargobob3",
          "hash": 1394036463,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 10,
          "maxPassengers": 9,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 49.919960021972656,
          "maxBraking": 2.494999647140503,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 4.998000144958496
        },
        {
          "displayName": "Cargobob III",
          "manufacturer": "Western Company",
          "price": 895000,
          "weightKG": 15000,
          "drivetrain": null,
          "realMaxSpeedMPH": 99.5,
          "gameMaxSpeedKPH": 160,
          "model": "cargobob4",
          "hash": 2025593404,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 49.919960021972656,
          "maxBraking": 2.494999647140503,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 4.998000144958496
        },
        {
          "displayName": "Annihilator",
          "manufacturer": "Western Company",
          "price": 912500,
          "weightKG": 13000,
          "drivetrain": null,
          "realMaxSpeedMPH": 115.25,
          "gameMaxSpeedKPH": 160,
          "model": "annihilator",
          "hash": 837858166,
          "class": {
            "id": 15,
            "name": "Helicopters"
          },
          "seats": 6,
          "maxPassengers": 5,
          "inDealership": false, "stock": 200,
          "estimatedMaxSpeed": 47.25648880004883,
          "maxBraking": 2.176633834838867,
          "maxTraction": 1.2999999523162842,
          "maxAcceleration": 4.605999946594238
        },
        {
          "displayName": "Faction Custom Donk",
          "manufacturer": "Willard",
          "price": 347500,
          "weightKG": 1400,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 97.5,
          "gameMaxSpeedKPH": 140,
          "model": "faction3",
          "hash": 2255212070,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.3499999046325684,
          "maxAcceleration": 0.20000000298023224
        },
        {
          "displayName": "Faction Custom",
          "manufacturer": "Willard",
          "price": 167500,
          "weightKG": 1200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 110.75,
          "gameMaxSpeedKPH": 140,
          "model": "faction2",
          "hash": 2504420315,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.25,
          "maxAcceleration": 0.2800000011920929
        },
        {
          "displayName": "Faction",
          "manufacturer": "Willard",
          "price": 18000,
          "weightKG": 1200,
          "drivetrain": "RWD",
          "realMaxSpeedMPH": 110.75,
          "gameMaxSpeedKPH": 140,
          "model": "faction",
          "hash": 2175389151,
          "class": {
            "id": 4,
            "name": "Muscle"
          },
          "seats": 2,
          "maxPassengers": 1,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 38.88888931274414,
          "maxBraking": 0.800000011920929,
          "maxTraction": 2.25,
          "maxAcceleration": 0.2800000011920929
        },
        {
          "displayName": "Journey",
          "manufacturer": "Zirconium",
          "price": 7500,
          "weightKG": 4000,
          "drivetrain": "FWD",
          "realMaxSpeedMPH": 74.25,
          "gameMaxSpeedKPH": 100,
          "model": "journey",
          "hash": 4174679674,
          "class": {
            "id": 12,
            "name": "Vans"
          },
          "seats": 6,
          "maxPassengers": 5,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 27.77777862548828,
          "maxBraking": 0.25,
          "maxTraction": 1.399999976158142,
          "maxAcceleration": 0.12999999523162842
        },
        {
          "displayName": "Stratum",
          "manufacturer": "Zirconium",
          "price": 5000,
          "weightKG": 1800,
          "drivetrain": "AWD",
          "realMaxSpeedMPH": 104.75,
          "gameMaxSpeedKPH": 135,
          "model": "stratum",
          "hash": 1723137093,
          "class": {
            "id": 1,
            "name": "Sedans"
          },
          "seats": 4,
          "maxPassengers": 3,
          "inDealership": true, "stock": 200,
          "estimatedMaxSpeed": 37.5,
          "maxBraking": 0.6000000238418579,
          "maxTraction": 2.200000047683716,
          "maxAcceleration": 0.20999999344348907
        }
    ]

const VehicleDataMeta = {
    '0': {
        max: {
            seats: 4,
            estimatedMaxSpeed: 38.88888931274414,
            maxBraking: 0.6000000238418579,
            maxTraction: 2.299999952316284,
            maxAcceleration: 0.3400000035762787
        },
        min: {
            seats: 2,
            estimatedMaxSpeed: 34.722225189208984,
            maxBraking: 0.30000001192092896,
            maxTraction: 1.7599999904632568,
            maxAcceleration: 0.10000000149011612
        }
    },
    '1': {
        max: {
            seats: 6,
            estimatedMaxSpeed: 41.66666793823242,
            maxBraking: 0.949999988079071,
            maxTraction: 2.549999952316284,
            maxAcceleration: 0.28999999165534973
        },
        min: {
            seats: 2,
            estimatedMaxSpeed: 33.333335876464844,
            maxBraking: 0.4000000059604645,
            maxTraction: 1.850000023841858,
            maxAcceleration: 0.10000000149011612
        }
    },
    '2': {
        max: {
            seats: 8,
            estimatedMaxSpeed: 43.750003814697266,
            maxBraking: 0.8500000238418579,
            maxTraction: 2.299999952316284,
            maxAcceleration: 0.33500000834465027
        },
        min: {
            seats: 4,
            estimatedMaxSpeed: 35.27777862548828,
            maxBraking: 0.25,
            maxTraction: 1.600000023841858,
            maxAcceleration: 0.17000000178813934
        }
    },
    '3': {
        max: {
            seats: 4,
            estimatedMaxSpeed: 41.66666793823242,
            maxBraking: 0.8999999761581421,
            maxTraction: 2.5999999046325684,
            maxAcceleration: 0.2800000011920929
        },
        min: {
            seats: 2,
            estimatedMaxSpeed: 39.4444465637207,
            maxBraking: 0.6000000238418579,
            maxTraction: 2.200000047683716,
            maxAcceleration: 0.20999999344348907
        }
    },
    '4': {
        max: {
            seats: 4,
            estimatedMaxSpeed: 43.05555725097656,
            maxBraking: 1,
            maxTraction: 2.625,
            maxAcceleration: 0.39500001072883606
        },
        min: {
            seats: 2,
            estimatedMaxSpeed: 34.722225189208984,
            maxBraking: 0.25,
            maxTraction: 1.649999976158142,
            maxAcceleration: 0.17000000178813934
        }
    },
    '5': {
        max: {
            seats: 6,
            estimatedMaxSpeed: 44.4444465637207,
            maxBraking: 1,
            maxTraction: 2.6500000953674316,
            maxAcceleration: 0.38999998569488525
        },
        min: {
            seats: 2,
            estimatedMaxSpeed: 32.77777862548828,
            maxBraking: 0.25,
            maxTraction: 1.7000000476837158,
            maxAcceleration: 0.1599999964237213
        }
    },
    '6': {
        max: {
            seats: 4,
            estimatedMaxSpeed: 44.77777862548828,
            maxBraking: 1.2999999523162842,
            maxTraction: 25.33049964904785,
            maxAcceleration: 0.6600000262260437
        },
        min: {
            seats: 2,
            estimatedMaxSpeed: 36.66666793823242,
            maxBraking: 0.4000000059604645,
            maxTraction: 2.049999952316284,
            maxAcceleration: 0.15000000596046448
        }
    },
    '7': {
        max: {
            seats: 2,
            estimatedMaxSpeed: 47.29166793823242,
            maxBraking: 1.25,
            maxTraction: 39.126251220703125,
            maxAcceleration: 0.41999998688697815
        },
        min: {
            seats: 1,
            estimatedMaxSpeed: 40.27777862548828,
            maxBraking: 0.5,
            maxTraction: 2.25,
            maxAcceleration: 0.13750000298023224
        }
    },
    '8': {
        max: {
            seats: 2,
            estimatedMaxSpeed: 44.30555725097656,
            maxBraking: 1.5199999809265137,
            maxTraction: 2.9000000953674316,
            maxAcceleration: 0.42500001192092896
        },
        min: {
            seats: 1,
            estimatedMaxSpeed: 25.000001907348633,
            maxBraking: 0.4000000059604645,
            maxTraction: 1.600000023841858,
            maxAcceleration: 0.10000000149011612
        }
    },
    '9': {
        max: {
            seats: 9,
            estimatedMaxSpeed: 41.66666793823242,
            maxBraking: 1.100000023841858,
            maxTraction: 2.950000047683716,
            maxAcceleration: 0.4749999940395355
        },
        min: {
            seats: 1,
            estimatedMaxSpeed: 22.22222328186035,
            maxBraking: 0.27000001072883606,
            maxTraction: 1.7000000476837158,
            maxAcceleration: 0.11999999731779099
        }
    },
    '10': {
        max: {
            seats: 6,
            estimatedMaxSpeed: 36.111114501953125,
            maxBraking: 0.6000000238418579,
            maxTraction: 2,
            maxAcceleration: 0.20999999344348907
        },
        min: {
            seats: 1,
            estimatedMaxSpeed: 4.1666669845581055,
            maxBraking: 0.10000000149011612,
            maxTraction: 1.100000023841858,
            maxAcceleration: 0.10999999940395355
        }
    },
    '11': {
        max: {
            seats: 4,
            estimatedMaxSpeed: 36.111114501953125,
            maxBraking: 0.699999988079071,
            maxTraction: 3.299999952316284,
            maxAcceleration: 0.30000001192092896
        },
        min: {
            seats: 0,
            estimatedMaxSpeed: 5.555555820465088,
            maxBraking: 0.20000000298023224,
            maxTraction: 1.149999976158142,
            maxAcceleration: 0
        }
    },
    '12': {
        max: {
            seats: 6,
            estimatedMaxSpeed: 38.88888931274414,
            maxBraking: 0.800000011920929,
            maxTraction: 2.174999952316284,
            maxAcceleration: 0.3199999928474426
        },
        min: {
            seats: 1,
            estimatedMaxSpeed: 27.77777862548828,
            maxBraking: 0.25,
            maxTraction: 1.399999976158142,
            maxAcceleration: 0.10000000149011612
        }
    },
    '13': {
        max: {
            seats: 1,
            estimatedMaxSpeed: 17.5,
            maxBraking: 3,
            maxTraction: 2.049999952316284,
            maxAcceleration: 0.17000000178813934
        },
        min: {
            seats: 1,
            estimatedMaxSpeed: 12.500000953674316,
            maxBraking: 0.4000000059604645,
            maxTraction: 1.7999999523162842,
            maxAcceleration: 0.07999999821186066
        }
    },
    '14': {
        max: {
            seats: 4,
            estimatedMaxSpeed: 37.5,
            maxBraking: 0.4000000059604645,
            maxTraction: 0,
            maxAcceleration: 18
        },
        min: {
            seats: 1,
            estimatedMaxSpeed: 5,
            maxBraking: 0.4000000059604645,
            maxTraction: 0,
            maxAcceleration: 2.200000047683716
        }
    },
    '15': {
        max: {
            seats: 10,
            estimatedMaxSpeed: 65.19527435302734,
            maxBraking: 3.5920403003692627,
            maxTraction: 1.600000023841858,
            maxAcceleration: 5.880000114440918
        },
        min: {
            seats: 1,
            estimatedMaxSpeed: 47.25648880004883,
            maxBraking: 2.176633834838867,
            maxTraction: 1.2999999523162842,
            maxAcceleration: 4.586400032043457
        }
    },
    '16': {
        max: {
            seats: 16,
            estimatedMaxSpeed: 109.7642593383789,
            maxBraking: 20.579999923706055,
            maxTraction: 2.1500000953674316,
            maxAcceleration: 21.07000160217285
        },
        min: {
            seats: 1,
            estimatedMaxSpeed: 30.151134490966797,
            maxBraking: 1.968150019645691,
            maxTraction: 0.6499999761581421,
            maxAcceleration: 4.900000095367432
        }
    },
    '17': {
        max: {
            seats: 16,
            estimatedMaxSpeed: 39.722225189208984,
            maxBraking: 0.8999999761581421,
            maxTraction: 2.549999952316284,
            maxAcceleration: 0.33000001311302185
        },
        min: {
            seats: 2,
            estimatedMaxSpeed: 25.000001907348633,
            maxBraking: 0.25,
            maxTraction: 1.149999976158142,
            maxAcceleration: 0.11999999731779099
        }
    },
    '18': {
        max: {
            seats: 11,
            estimatedMaxSpeed: 41.66666793823242,
            maxBraking: 1.2000000476837158,
            maxTraction: 2.569999933242798,
            maxAcceleration: 0.30000001192092896
        },
        min: {
            seats: 1,
            estimatedMaxSpeed: 25.000001907348633,
            maxBraking: 0.25,
            maxTraction: 1.350000023841858,
            maxAcceleration: 0.11999999731779099
        }
    },
    '19': {
        max: {
            seats: 10,
            estimatedMaxSpeed: 57.539886474609375,
            maxBraking: 3.9472362995147705,
            maxTraction: 3.700000047683716,
            maxAcceleration: 6.860000133514404
        },
        min: {
            seats: 1,
            estimatedMaxSpeed: 10.277778625488281,
            maxBraking: 0.10000000149011612,
            maxTraction: 1.2999999523162842,
            maxAcceleration: 0
        }
    },
    '20': {
        max: {
            seats: 8,
            estimatedMaxSpeed: 36.111114501953125,
            maxBraking: 0.8500000238418579,
            maxTraction: 2.049999952316284,
            maxAcceleration: 0.3199999928474426
        },
        min: {
            seats: 2,
            estimatedMaxSpeed: 27.77777862548828,
            maxBraking: 0.25,
            maxTraction: 1.5,
            maxAcceleration: 0.10999999940395355
        }
    },
    '21': {
        max: {
            seats: 4,
            estimatedMaxSpeed: 22.22222328186035,
            maxBraking: 5,
            maxTraction: 2.5,
            maxAcceleration: 0.20000000298023224
        },
        min: {
            seats: 0,
            estimatedMaxSpeed: 22.22222328186035,
            maxBraking: 5,
            maxTraction: 2.5,
            maxAcceleration: 0.20000000298023224
        }
    },
    '22': {
        max: {
            seats: 1,
            estimatedMaxSpeed: 45.13888931274414,
            maxBraking: 1.25,
            maxTraction: 3.4075000286102295,
            maxAcceleration: 0.75
        },
        min: {
            seats: 1,
            estimatedMaxSpeed: 45.13888931274414,
            maxBraking: 1.25,
            maxTraction: 3.2654998302459717,
            maxAcceleration: 0.7450000047683716
        }
    }
};

const VehicleDataClasses = [
    { id: 0, name: 'Compacts' },
    { id: 1, name: 'Sedans' },
    { id: 2, name: 'SUVs' },
    { id: 3, name: 'Coupes' },
    { id: 4, name: 'Muscle' },
    { id: 5, name: 'Sports Classics' },
    { id: 6, name: 'Sports' },
    { id: 7, name: 'Super' },
    { id: 8, name: 'Motorcycles' },
    { id: 9, name: 'Off-road' },
    { id: 10, name: 'Industrial' },
    { id: 11, name: 'Utility' },
    { id: 12, name: 'Vans' },
    { id: 13, name: 'Cycles' },
    { id: 14, name: 'Boats' },
    { id: 15, name: 'Helicopters' },
    { id: 16, name: 'Planes' },
    { id: 17, name: 'Service' },
    { id: 18, name: 'Emergency' },
    { id: 19, name: 'Military' },
    { id: 20, name: 'Commercial' },
    { id: 21, name: 'Trains' },
    { id: 22, name: 'Formula' }
];