let CONFIG = require('../CoreSystem/chatformatconf.js').CONFIG;
const LZString = require('../CoreSystem/compression.js');
let db = require('../models');

const ignoredClasses = [8, 9, 10, 11, 13, 14, 15, 16, 17, 21, 22]

const repairAreas = [
    new mp.Vector3(0, 0, 0),
    new mp.Vector3(-328, -137.6, 39),
]

const modviewAreas = [
    new mp.Vector3(0, 0, 0),
    new mp.Vector3(-346.9, -135.9, 39)
]

modviewAreas.forEach((area) => {
    if (area.x !== 0) {
        var modCol = mp.colshapes.newRectangle(area.x, area.y, 100, 100)
        modCol.setVariable('modView', modviewAreas.indexOf(area))
    }
})

mp.blips.new(544, repairAreas[1],
    {
        name: 'Los Santos Customs',
        shortRange: true,
    });

repairAreas.forEach((lot) => {
    if (lot.x !== 0) {
        var repairCol = mp.colshapes.newRectangle(lot.x, lot.y, 40, 40)
        repairCol.setVariable('lscRepair', repairAreas.indexOf(lot))
    }
})

mp.events.add({
    'playerEnterColshape': (player, shape) => {
        if (shape.getVariable('lscRepair')) {
            player.lscRepair = shape.getVariable('lscRepair');
            player.call('requestBrowser', [`gui.notify.showNotification("Use /vehrepair to repair your vehicle.", true, false, false, 'fa-solid fa-circle-info')`])
        }
        if (shape.getVariable('modView')) {
            player.modView = shape.getVariable('modView')
        }
    },
    'playerExitColshape': async (player, shape) => {
        if (shape.getVariable('lscRepair')) {
            player.lscRepair = null;
            player.call('requestBrowser', [`gui.notify.clearAll()`])
            const getRoute = await player.callProc('proc:getRoute');
            if (getRoute == 'vehcustom') { player.call('closeRoute') }
        }
        if (shape.getVariable('modView') && player.modView) {
            player.modView = null;
        }
    },
    'playerQuit': (player) => {
        if (player.isReparingV) {
            var targetVeh = player.isReparingV;
            if (targetVeh) {
                targetVeh.setVariable('beingRepaired', null)
            }
        }
    },
    'lsc:RepairVehicle': (player, vehicle) => {
        if (player.lscRepair) {
            mp.vehicles.forEachInRange(player.position, 5,
                async (veh) => {
                    if (veh.getVariable('sqlID') == vehicle) {
                        veh.setVariable('beingRepaired', true)
                        player.isReparingV = veh;
                        player.data.repairAnim = veh;
                        player.call('requestBrowser', [`gui.notify.showNotification("You have began repair work on this vehicle.", false, true, 15000, 'fa-solid fa-circle-info')`])
                        player.call('requestRoute', '/', true, true)
                        player.call('requestBrowser', [`gui.progressbar.startProgress('Repairing Vehicle...', 40)`])
                    }
                })
        }
        else if (!player.lscRepair) { return mp.chat.err(player, `You must be near the vehicle and in the LSC repair area to repair it.`) }
    },
    'lsc:finishRepair': (player, target, vehicle) => {
        if (vehicle && player.dist(vehicle.position) <= 4 && vehicle.getVariable('currentTyres') && vehicle.getVariable('sqlID') && vehicle.getVariable('vehData')) {
            vehicle.setVariable('beingRepaired', null)
            vehicle.repair();
            var currentData = JSON.parse(vehicle.getVariable('vehData'));
            currentData.Health = 1000;
            var currentTyres = vehicle.getVariable('currentTyres');
            for(var x = 0; x < currentTyres.length; x++) {
                currentTyres[x] = false;
            }
            vehicle.setVariable('currentTyres', currentTyres);
            db.vehicles.update({
                tyreStatus: currentTyres,
                data: JSON.stringify(currentData)
            }, { where: {id: vehicle.getVariable('sqlID')} }).catch((err) => {mp.log(err)});
            mp.chat.success(target, `You have repaired the vehicle succesfully!`)
            player.call('requestBrowser', [`gui.notify.showNotification("Finished repairing vehicle.", false, true, 10000, 'fa-solid fa-info-circle')`])
            player.isReparingV = null;
            player.call('closeRoute')
            return
        }
        else if (vehicle) { mp.chat.err(player, `You must be close to the vehicle to complete the repair.`), vehicle.setVariable('beingRepaired', null) }
    },
    'veh:saveMods': (player, vehicle, data) => {
        if (vehicle.getVariable('sqlID') && player.modView) {
            if (data !== '{}') {
                player.call('requestBrowser', [`gui.notify.clearAll()`])
                player.call('requestBrowser', [`gui.notify.showNotification("Saved vehicle mods successfully.", false, true, 10000, 'fa-solid fa-info-circle')`])
            }

            var arr = JSON.parse(data);

            db.savedMods.findAll({ where: { vehId: vehicle.getVariable('sqlID') } }).then((veh) => {
                if (veh.length > 0) {

                    arr.find((item, i) => {
                        if (item.name == 'Wheel Type') {
                            var newData = arr[i];

                            arr.splice(arr.indexOf(arr[i]), 1);

                            arr.unshift(newData);
                        }
                    })

                    db.savedMods.destroy({ where: { vehId: vehicle.getVariable('sqlID') } })
                    db.savedMods.create({
                        vehId: vehicle.getVariable('sqlID'),
                        OwnerId: player.characterId,
                        data: data.length == 0 ? '[]' : arr
                    }).catch((err) => { mp.log(err) })
                    return

                }
                else {

                    arr.find((item, i) => {
                        if (item.name == 'Wheel Type') {
                            var newData = arr[i];

                            arr.splice(arr.indexOf(arr[i]), 1);

                            arr.unshift(newData);
                        }
                    })

                    db.savedMods.create({
                        vehId: vehicle.getVariable('sqlID'),
                        OwnerId: player.characterId,
                        data: data.length == 0 ? '[]' : arr
                    }).catch((err) => { mp.log(err) })

                }
            })
        }
    },
    'veh:applyMod': (player, data) => {
        try {
            var jsonOut = JSON.parse(data);
            mp.vehicles.forEachInRange(player.position, 20,
                async(veh) => {
                    if(veh.getVariable('sqlID') == jsonOut.vehicleId) {
                        db.vehicle_mods.findAll({ where: {vehicleId: veh.getVariable('sqlID')} }).then((vehmod) => {
                            try {
                                if(vehmod.length > 0) {
                                    var currentData = vehmod[0].data;
                                    var idx = null;

                                    currentData.find(function(item, i) {
                                        if(item.modName == jsonOut.modName) {
                                            idx = i;
                                        }
                                    })

                                    if(idx != null) {
                                        currentData.splice(idx, 1);
                                    }

                                    currentData.push(JSON.parse(data));

                                    db.savedMods.findAll({ where: {vehId: jsonOut.vehicleId} }).then((vmods) => {
                                        if(vmods.length > 0) {
                                            var cdata = vmods[0].data;
                                            var idx = null;
                                            cdata.find(function(item, i) {
                                                if(item.name == jsonOut.modName) {
                                                    idx = i;
                                                }
                                            })
                                            if(idx != null) {
                                                cdata.splice(idx , 1);
                                                cdata.length == 0 ? db.savedMods.destroy({ where: {vehId: jsonOut.vehicleId} }) : db.savedMods.update({ data: cdata }, { where: {vehId: jsonOut.vehicleId} });
                                            }
                                        }
                                    })



                                    db.vehicle_mods.update({ data: currentData }, { where: {vehicleId: jsonOut.vehicleId} }).catch((err) => {mp.log(err)});


                                    setTimeout(() => {
                                        mp.events.call('vehicle:setMods', player, veh);
                                    }, 300);

                                    return;
                                } else if(vehmod.length == 0) {
                                    db.savedMods.findAll({ where: {vehId: jsonOut.vehicleId} }).then((vehmods) => {
                                        if(vehmods.length == 0) return;

                                        var currentData = vehmods[0].data;
                                        var idx = null;

                                        currentData.find(function(item, i) {
                                            if(item.modName == jsonOut.modName) {
                                                idx = i;
                                            }
                                        })
                                        if(idx != null) {
                                            currentData.splice(idx, 1);
                                            currentData.length == 0 ? db.savedMods.destroy({ where: {vehId: jsonOut.vehicleId} }) : db.savedMods.update({ data: currentData }, { where: {vehId: jsonOut.vehicleId} });
                                            return;
                                        }
                                    })

                                    db.vehicle_mods.create({
                                        vehicleId: jsonOut.vehicleId,
                                        data: [JSON.parse(data)],
                                    }).catch((err) => {mp.log(err)})
                                    setTimeout(() => {
                                        mp.events.call('vehicle:setMods', player, veh);
                                    }, 300);
                                    return;
                                }
                            } catch(e) { mp.log(e) }
                        })
                    }
                })
        } catch(e) { mp.log(e) }
    },
    'vehicle:setMods': (player, vehicle) => {
        try {
            if (vehicle.getVariable('sqlID')) {
                db.vehicle_mods.findAll({ where: { vehicleId: vehicle.getVariable('sqlID') } }).then((currentMods) => {
                    for (var x = 0; x <= 200; x++) {
                        vehicle.setMod(x, -1);
                        vehicle.setColor(111, 111);
                    }
                    setTimeout(() => {
                        if (currentMods.length > 0) {
                            var jsonOutput = currentMods[0].data;

                            var colours = []
                            jsonOutput.forEach(function (item, i) {
                                switch (item.modName) {
                                    case 'Pearlescent':
                                        {
                                            vehicle.pearlescentColor = item.modType;
                                            break;
                                        }
                                    case 'Wheel Type':
                                        {
                                            vehicle.wheelType = item.modType;
                                            break;
                                        }
                                    case 'Paint Primary':
                                        {
                                            colours.push(item.modType);
                                            break;
                                        }
                                    case 'Paint Secondary':
                                        {
                                            colours.push(item.modType);
                                            break;
                                        }
                                    case 'Window Tint':
                                        {
                                            vehicle.windowTint = parseInt(item.modType);
                                            break;
                                        }
                                    case 'Wheel':
                                        {
                                            setTimeout(() => {
                                                vehicle.setMod(parseInt(item.modId), parseInt(item.modType))
                                            }, 300);
                                            break;
                                        }
                                    default:
                                        vehicle.setMod(parseInt(item.modId), parseInt(item.modType))
                                        break;
                                }
                            })
                            vehicle.setColor(colours[0] == null ? 111 : colours[0], colours[1] == null ? 111 : colours[1])
                        }
                    }, 100);
                })
            }
        } catch (e) { mp.log(`${CONFIG.consoleRed}[Vehicle Mod Loading Error]: ${e} ${CONFIG.consoleWhite}`) }
    }
})

mp.cmds.add(['vehrepair'], async (player, arg) => {
    if (arg != null) return mp.chat.info(player, `Use: /vehrepair`)
    if (!player.lscRepair) return mp.chat.err(player, `You are not on duty or in the correct area to repair a vehicle.`)
    var vehArr = []
    mp.vehicles.forEachInRange(player.position, 4,
        (veh) => {
            if (veh.getVariable('sqlID') && !veh.getVariable('beingRepaired')) {
                vehArr.push(veh)
            }
        })
    if (vehArr.length > 0 && vehArr[0].doors) {
        let targetVeh = vehArr[0];
        if (targetVeh.getVariable('engineStatus')) return mp.chat.err(player, `Ensure the vehicles engine is turned off before you begin to repair it.`)
        const vehHp = await player.callProc('proc:getVehHP', [targetVeh]);
        if (vehHp == 100) { return mp.chat.err(player, `This vehicle is already in perfect nick.`) }
        var vehicleName = await player.callProc('proc::vehicleName', [targetVeh.model]);
        if (vehicleName == null || vehicleName == undefined || vehicleName == 'NULL') { vehicleName = `vehicle` }
        player.call('createModalMenu', ['fa-solid fa-toolbox', 60, 'LSC Repair', `Do you want to begin repair work on vehicle ${vehicleName}?`, 'Reject Repair', 'Accept Repair', 'client:denyVehRepair', 'client:repairInitial', vehicleName, vehArr[0].getVariable('sqlID')])
        return
    }
    else if (vehArr.length == 0) { return mp.chat.err(player, `There are no vehicles near you to repair.`) }
})

mp.cmds.add(['mods', 'modview', 'vehmods'], (player, arg) => {
    if (arg != null) return mp.chat.info(player, `Use: /mods`)
    if (player.modView && player.vehicle && player.seat == 0 && player.vehicle.getVariable('sqlID')) {
        player.call('requestBrowser', [`gui.notify.clearAll()`]);
        player.call('hudTog', [true]);
        db.savedMods.findAll({ where: { vehId: player.vehicle.getVariable('sqlID') } }).then((mods) => {
            if (mods.length > 0 && mods[0].data !== '[]') {
                player.call('requestBrowser', [`appSys.commit('setBasket', { json: ${mods[0].data} });`]);
                player.call('requestRoute', ['vehcustom', true, true]);
                return;
            }
            else { player.call('requestRoute', ['vehcustom', true, true]) }
        })
        return
    }
    mp.chat.err(player, `You are not on duty or in the correct area to use this command.`)
})

mp.cmds.add(['viewmods'], (player, plate) => {
    if (plate == null) {
        if (player.vehicle && player.vehicle.getVariable('sqlID')) {
            plate = player.vehicle.numberPlate
        }
        else if (!player.vehicle) {
            return mp.chat.info(player, `Use: /viewmods [Current Vehicle / plate]`)
        }
    }
    if (player.modView) {
        var foundVehicle = null;
        mp.vehicles.forEachInRange(player.position, 4,
            (veh) => {
                if (veh.getVariable('sqlID') && veh.numberPlate == plate) {
                    foundVehicle = veh;
                }
            })
        if (foundVehicle) {
            db.savedMods.findAll({ where: { vehId: foundVehicle.getVariable('sqlID') } }).then((mods) => {
                if (mods.length > 0 && mods[0].data !== '[]' && mods[0].data.length > 0) {
                    player.call('requestRoute', ['listMenu', true, true])
                    var modArray = mods[0].data
                    modArray.forEach(function (mod, i) {
                        var selectInfo = `{"id": ${i}, "vehicleId": ${foundVehicle.getVariable('sqlID')}, "modName": "${mod.name}", "modId": ${mod.modId}, "modType": ${mod.type},"modPrice": ${mod.price}}`
                        player.call('requestBrowser', [`appSys.commit('updateLists', {
                            menuName: 'View Mods',
                            menuSub: 'Vehicle has ${modArray.length == 1 ? `${modArray.length} mod applied.` : `${modArray.length} mods applied.`}',
                            tableOne: 'Name',
                            tableTwo: 'ID',
                            icon: 'fa-solid fa-screwdriver-wrench',
                            name: '${mod.name.replace(`'`, '')} (${i})',
                            id: '${selectInfo}',
                            button: true,
                            funcs: 'veh:applyMod'
                        });`]);
                        return
                    })
                }
                else {
                    mp.chat.err(player, `Vehicle [${plate}] has no current pending modifications.`)
                }
            })
        }
        else if (!foundVehicle) { return mp.chat.err(player, `No vehicle was found.`) }
        return
    }
    mp.chat.err(player, `You are not on duty or in the correct area to use this command.`)
})