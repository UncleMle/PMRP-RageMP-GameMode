const db = require('../models');
require('../CoreSystem/coreApi');
const CONFIG = require('../CoreSystem/chatformatconf').CONFIG;
const defaultVehicles = require('./defaultVehicles.json');

mp.events.add({
    packagesLoaded: () => {
        loadDealers();
    },
    playerQuit: (player) => {
        if (player.getVariable('loggedIn') && player.characterId) {
            db.characters.update({
                maxVehicles: player.maxVehs
            }, { where: { id: player.characterId } });
        }
    },
    playerEnterColshape: (player, shape) => {
        if (shape.getVariable('vehicleDealer')) {
            player.isInDealer = shape.getVariable('vehicleDealer');
        }
    },
    playerExitColshape: (player, shape) => {
        if (shape.getVariable('vehicleDealer')) {
            player.isInDealer = null;
        }
    },
    fetchPerformance: (player, spawnName) => {
        if (player.getVariable('viewingDealer') && player.viewedDealer) {
            db.player_dealerships.findAll({ where: { id: player.viewedDealer } }).then((dealer) => {
                if (dealer.length > 0) {
                    var currentData = dealer[0].currentVehicles;
                    var idx = null;

                    currentData.find(function (item, i) {
                        if (item.model == spawnName) {
                            idx = i;
                        }
                    })
                    if (idx != null) {
                        player.call('requestBrowser', [`appSys.commit('vehPerformance', {
                        engine: ${Math.floor(currentData[idx].maxAcceleration * 100)},
                        acceleration: ${Math.floor(currentData[idx].maxTraction * 10)},
                        brakes: ${Math.floor(currentData[idx].maxBraking * 10 / 0.2 + 10)},
                        topSpeed: ${Math.floor(currentData[idx].estimatedMaxSpeed)}
                    });`]);
                    }
                }
            })
        }
    },
    getVehPerformance: (player, vehicleName) => {
        if (!player.getVariable('loggedIn')) return;
        db.vehicle_data.findAll({ where: { id: 1 } }).then((data) => {
            data[0].data.forEach((data) => {
                if (data.model == vehicleName) {
                    player.call('requestBrowser', [`appSys.commit('vehPerformance', {
                    engine: ${Math.floor(data.maxAcceleration * 100)},
                    acceleration: ${Math.floor(data.maxTraction * 10)},
                    brakes: ${Math.floor(data.maxBraking * 10 / 0.2 + 10)},
                    topSpeed: ${Math.floor(data.estimatedMaxSpeed)}
                });`]);
                    return;
                }
            })
        })
    },
    fetchDealerVehicles: (player) => {
        if (player.isInDealer) {
            db.characters.update({ position: JSON.stringify(player.position) }, { where: { id: player.characterId } });
            player.call('requestBrowser', [`appSys.commit('clearDealer', {});`]);
            player.setVariable('viewingDealer', true);
            player.dimension = player.id + 1;
            db.player_dealerships.findAll({ where: { id: player.isInDealer } }).then((dealer) => {
                if (dealer.length > 0) {
                    player.viewedDealer = dealer[0].id;
                    if (!dealer[0].currentVehicles || dealer[0].currentVehicles.length == 0 || dealer[0].currentVehicles == "[]") return;
                    dealer[0].currentVehicles.forEach((vehicle) => {
                        player.call('requestBrowser', [`appSys.commit('setDealerVehicles', {
                        spawnName: '${vehicle.model}',
                        vehName: "${vehicle.displayName}",
                        price: ${vehicle.price == null ? 0 : vehicle.price},
                        stock: ${vehicle.stock}
                    });`]);
                    })
                }
            })
        }
    },
    dealerPurchaseVehicle: (player, vehicleName, colour) => {
        if (player.getVariable('viewingDealer') && player.viewedDealer && player.getVariable('loggedIn')) {
            db.player_dealerships.findAll({ where: { id: player.viewedDealer } }).then(async (dealer) => {
                if (dealer.length > 0) {

                    var foundVeh = false;

                    mp.vehicles.forEach((veh) => {
                        if ((veh.position.x >= JSON.parse(dealer[0].vehicleSpawnPosition).x - 2 && veh.position.x <= JSON.parse(dealer[0].vehicleSpawnPosition).x + 2) && (veh.position.y >= JSON.parse(dealer[0].vehicleSpawnPosition).y - 4 && veh.position.y <= JSON.parse(dealer[0].vehicleSpawnPosition).y + 4)) {
                            foundVeh = true;
                        }
                    });

                    player.call('requestBrowser', ['gui.notify.clearAll()']);
                    if (foundVeh) return player.call('requestBrowser', [`gui.notify.showNotification("Ensure the vehicles delivery path is clear of obstruction before purchase.", false, true, 8600, 'fa-solid fa-circle-info')`]);
                    if ((player.vehicles + 1) > player.maxVehs) return player.call('requestBrowser', [`gui.notify.showNotification("You are at the limit of ${player.maxVehs} vehicle's that you can own. You can purchase more vehicle slots with credits.", false, true, 8600, 'fa-solid fa-circle-info')`]);

                    var dealerData = dealer[0].currentVehicles;
                    var idx = null;
                    dealerData.forEach((item, i) => {
                        if (item.model == vehicleName) {
                            idx = i;
                        }
                    })

                    if (idx != null) {
                        var dealerVehicle = dealerData[idx];

                        if ((player.moneyAmount - dealerVehicle.price) < 0) return player.call('requestBrowser', [`gui.notify.showNotification("You have insufficient funds to cover this purchase.", false, true, 8600, 'fa-solid fa-circle-info')`]);
                        if (dealerVehicle.stock <= 0) return player.call('requestBrowser', [`gui.notify.showNotification("There is not enough stock of this vehicle for you to purchase.", false, true, 8600, 'fa-solid fa-circle-info')`]);
                        else {
                            dealerVehicle.stock -= 1;
                            player.vehicles += 1;

                            player.moneyAmount -= dealerVehicle.price;
                            player.setVariable('moneyValue', player.moneyAmount);

                            try {

                                db.characters.findAll({ where: { id: player.characterId } }).then((char) => {
                                    if (char.length > 0) {
                                        db.characters.update({
                                            moneyAmount: player.moneyAmount
                                        }, { where: { id: player.characterId } }).catch((err) => mp.log(err));
                                    }
                                })

                                db.player_dealerships.update({
                                    currentVehicles: dealerData
                                }, { where: { id: player.viewedDealer } }).catch((err) => { mp.log(err) });

                            } catch (e) { mp.log(e) }

                            player.dimension = 0;

                            player.call('closeDealerCam');

                            player.setVariable('viewingDealer', null);

                            buildVehicle(player, vehicleName, new mp.Vector3(JSON.parse(dealer[0].vehicleSpawnPosition)), 0, colour, colour);
                            player.call('requestBrowser', [`gui.notify.showNotification("Congratulations on purchasing a ${dealerVehicle.displayName} for the price of $${dealerVehicle.price == null ? 0 : dealerVehicle.price.toLocaleString('en-US')}.", false, true, 8600, 'fa-solid fa-circle-info')`]);
                            mp.chat.success(player, `You have purchased a ${dealerVehicle.displayName} for the price of $${dealerVehicle.price == null ? 0 : dealerVehicle.price.toLocaleString('en-US')}.`);
                        }

                    }
                }
            })
        }
    },
    closeDealer: (player) => {
        if (player.getVariable('viewingDealer')) {
            player.setVariable('viewingDealer', null);
            db.characters.update({
                position: JSON.stringify(player.position)
            }, { where: { id: player.characterId } }).catch((err) => { mp.log(err) });
            player.dimension = 0;
        }
    },
})

mp.cmds.add(['vdealer'], async (player, fullText, optionOne, ...optionTwo) => {
    if (player.isAdmin > 7) {
        const options = ['add', "update", 'modifiy', 'del'];
        const secondOptions = ['name', 'sqlid', 'sqlid'];
        if (!optionOne) return mp.chat.info(player, `Use: /vdealer [${options.join('/')}] [${secondOptions.join('/')}]`);
        switch (optionOne) {
            case 'add':
                {
                    if (!optionTwo[0]) return mp.chat.info(player, `Use: /vdealer [add] [name]`);
                    try {
                        db.player_dealerships.create({
                            OwnerId: player.characterId,
                            currentVehicles: defaultVehicles,
                            moneyAmount: 0,
                            dealerName: optionTwo.join(' '),
                            dealerColour: '#FFFFFF',
                            position: JSON.stringify(player.position),
                            lastImport: mp.core.getUnixTimestamp(),
                            vehicleSpawnPosition: JSON.stringify(player.position)
                        }).then((newDealer) => {
                            mp.chat.aPush(player, `Created new dealership with sqlid: ${newDealer.id} name: ${newDealer.dealerName}`);
                            loadDealers();
                        })
                    } catch (e) { mp.log(e) }
                    break;
                }
            case 'update':
                {
                    if (!optionTwo[0]) return mp.chat.info(player, `Use: /vdealer [update] [item]`);



                    break;
                }
            default:
                mp.chat.info(player, `Enter one of the following parameters [${options.join('/')}] [${secondOptions.join('/')}]`);
                break;
        }
        return;
    }
    mp.chat.err(player, `${CONFIG.noauth}`);
})

async function loadDealers() {
    mp.blips.forEach((blip) => {
        if (blip.name == 'Vehicle Dealership') {
            blip.destroy();
        }
    });
    mp.colshapes.forEach((shape) => {
        if (shape.getVariable('vehicleDealer')) {
            shape.destroy();
        }
    })

    db.player_dealerships.findAll({}).then(dealer => {
        if (dealer.length == 0) return;
        dealer.forEach((dealer) => {
            var dealerPos = JSON.parse(dealer.position);

            mp.blips.new(523, new mp.Vector3(dealerPos), {
                name: 'Vehicle Dealership',
                color: 50,
                shortRange: true
            })
            var dealerCol = mp.colshapes.newRectangle(dealerPos.x, dealerPos.y, 2, 2);
            dealerCol.setVariable('vehicleDealer', dealer.id);

            mp.markers.new(27, new mp.Vector3(dealerPos.x, dealerPos.y, dealerPos.z - 0.9), 1,
                {
                    direction: 0,
                    rotation: 0,
                    color: [138, 108, 226, 255],
                    visible: true,
                    dimension: 0
                });
        });
    }).catch((err) => { mp.log(err) });
}

async function buildVehicle(player, vehicleName, position, dimension, colourOne, colourTwo) {
    var veh = mp.vehicles.new(mp.joaat(vehicleName), position, {
        dimension: dimension,
        numberPlate: `null`
    });

    veh.locked = true;

    const vName = await player.callProc('proc::vehicleName', [veh.model]);

    db.vehicles.create({
        vehicleModel: vehicleName,
        vehicleModelName: vName == null ? 'Vehicle' : vName,
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
        veh.setVariable('isLocked', true);
        veh.locked = true;
        var numPlate = `${mp.core.genPlate(2).toUpperCase()}${car.id}`;
        veh.numberPlate = numPlate;

        var modData = [{ "id": 0, "modId": 66, "modName": "Paint Primary", "modType": colourOne, "modPrice": 0, "vehicleId": car.id }, { "id": 0, "modId": 66, "modName": "Paint Secondary", "modType": colourTwo, "modPrice": 0, "vehicleId": car.id }];

        db.vehicle_mods.create({
            vehicleId: car.id,
            data: modData
        }).catch((err) => { mp.log(err) });

        setTimeout(() => {
            if (veh) {
                veh.setColor(parseInt(colourOne), parseInt(colourTwo));
            }
        }, 100);
        db.vehicles.update({
            numberPlate: numPlate
        }, { where: { id: car.id } }).then(() => {
            mp.log(`${CONFIG.consoleSeq}[DEALERSHIP]${CONFIG.consoleWhite} ${player.characterName} spawned in a ${vehicleName} SQLID: ${veh.getVariable('sqlID')}`)
            return car.id;
        })
    });
}