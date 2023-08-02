const db = require('../models');

const parkingAreas = [ // Arrays start with zero vector due to shared entity variables treating zero as a null
    new mp.Vector3(0, 0, 0),
    new mp.Vector3(213.8, -808.7, 31),
    new mp.Vector3(-73.3, -2004.9, 18.3),
    new mp.Vector3(-739.9, -66.4, 41.8),
    new mp.Vector3(83.8, 6420.7, 31.8),
    new mp.Vector3(-3237.5, 987.9, 12.5),
    new mp.Vector3(1524.4, 3766.5, 34.1),
    new mp.Vector3(-1652.6, -945.7, 7.9)
]

const vehicleSpawnPositions = [new mp.Vector3(0, 0, 0), new mp.Vector3(222.7, -801.4, 30.7), new mp.Vector3(-75.3, -2012.2, 18), new mp.Vector3(-744.9, -72.9, 41.8), new mp.Vector3(72.4, 6394, 31.2), new mp.Vector3(-3244.9, 989.3, 12.5), new mp.Vector3(1517.8, 3761.8, 34), new mp.Vector3(-1624.3, -946.8, 8.4)]

const parkingLots = [
    new mp.Vector3(0, 0, 0),
    new mp.Vector3(208.7, -809.3, 31),
    new mp.Vector3(-81.1, -2004.1, 18),
    new mp.Vector3(-746.1, -73.9, 41.8),
    new mp.Vector3(87.5, 6425.6, 31.4),
    new mp.Vector3(-3244, 990, 12.5),
    new mp.Vector3(1516.3, 3758.6, 34),
    new mp.Vector3(-1630.8, -942.2, 8.3)
]

parkingLots.forEach((lot) => {
    if(lot.x !== 0) {
        var uiCol = mp.colshapes.newRectangle(lot.x, lot.y, 6, 6)
        uiCol.setVariable('parkingLot', parkingLots.indexOf(lot))
        mp.markers.new(36, lot, 1,
            {
                direction: 0,
                rotation: 0,
                color: [158, 205, 235, 255],
                visible: true,
                dimension: 0
            });
    }
})

parkingAreas.forEach((parking) => {
    if(parking.x !== 0) {
        mp.blips.new(830, parking,
            {
                name: 'Vehicle Parking',
                color: 18,
                shortRange: true,
            });
        mp.markers.new(27, new mp.Vector3(parking.x, parking.y, parking.z-0.9), 1,
            {
                direction: 0,
                rotation: 0,
                color: [158, 205, 235, 255],
                visible: true,
                dimension: 0
            });
        var uiCol = mp.colshapes.newRectangle(parking.x, parking.y, 3, 3)
        uiCol.setVariable('parkingArea', parkingAreas.indexOf(parking))
    }
})

mp.cmds.add(['gotap'], async(player, val) => {
    if(!val) return mp.chat.info(player, `Use: /gotap [val]`)
    if(player.isAdmin > 7 && val >= 0 && val <= 7) {
        player.position = parkingAreas[val]
    }
})

mp.events.add({
    "playerEnterColshape": (player, shape) => {
        if (shape.getVariable('parkingArea') && player.getVariable('loggedIn')) {
            if(!player.vehicle) { player.call('requestBrowser', [`gui.notify.showNotification("Press 'Y' to interact", true, false, false, 'fa-solid fa-circle-info')`]) }
            player.isInParking = shape.getVariable('parkingArea')
        }
        if(shape.getVariable('parkingLot') && player.getVariable('loggedIn')) {
            player.inParkingLot = shape.getVariable('parkingLot');
            if(player.vehicle) {
                player.call('requestBrowser', [`gui.notify.showNotification("Use /park to park the current vehicle you are in.", true, false, false, 'fa-solid fa-circle-info')`])
            }
        }
    },
    'playerExitColshape': async(player, shape) => {
        if (shape.getVariable('parkingArea') && player.getVariable('loggedIn')) {
            player.isInParking = null
            player.call('requestBrowser', [`gui.notify.clearAll()`])
            const getRoute = await player.callProc('proc:getRoute')
            if (getRoute == 'listMenu') {
                player.call('closeRoute');
            }
        }
        if(shape.getVariable('parkingLot') && player.getVariable('loggedIn')) {
            player.inParkingLot = null
            player.call('requestBrowser', [`gui.notify.clearAll()`])

        }
    },
    'playerExitVehicle': (player, vehicle) => {
        if(player.inParkingLot) {
            player.call('requestBrowser', [`gui.notify.clearAll()`])
        }
    },
    'playerEnterVehicle': (player, vehicle, seat) => {
        if(player.inParkingLot) {
            player.call('requestBrowser', [`gui.notify.showNotification("Use /park to park the current vehicle you are in.", true, false, false, 'fa-solid fa-circle-info')`])
        }
    },
    'getParkedVehicles': async (player) => {
        if(!player.isInParking) { return }
        const getRoute = await player.callProc('proc:getRoute')
        if (getRoute != '/') { return; }
        const { vehicles } = require('../models')
        vehicles.findAll({ where: { OwnerId: player.characterId, spawned: 0, parked: 1, insurance: 0, parkedArea: player.isInParking} }).then((getPlayerOwnedVehs) => {
            if (getPlayerOwnedVehs.length == 0) return mp.chat.err(player, `You have no vehicles in this parking.`)
            player.call('requestRoute', ['listMenu', true, true])
            var count = 1;
            getPlayerOwnedVehs.forEach((veh) => {
                player.call('requestBrowser', [`appSys.commit('updateLists', {
                    menuName: 'Parking',
                    menuSub: 'You have ${getPlayerOwnedVehs.length} vehicles in this parking.',
                    tableOne: 'Name',
                    icon: 'fa-solid fa-car',
                    name: '${veh.vehicleModelName}',
                    id: ${veh.id},
                    button: true,
                    funcs: 'unparkVehicle'
                    });`]);
                count++;
            })
        })
    },
    'unparkVehicle': async (player, id) => {
        if(!player.isInParking) { return }
        var vehInParking = false;
        mp.vehicles.forEachInRange(player.position, 120, (veh) => {
            if ( (veh.position.x >= vehicleSpawnPositions[player.isInParking].x-2 && veh.position.x <= vehicleSpawnPositions[player.isInParking].x+2) && (veh.position.y >= vehicleSpawnPositions[player.isInParking].y-4 && veh.position.y <= vehicleSpawnPositions[player.isInParking].y+4)) {
                vehInParking = true
            }
        })

        if(!vehInParking) {
            const { vehicles } = require('../models');
            vehicles.findAll({ benchmark: true, logging: (sql, timingMs) => player.getVariable('devdebug') ? mp.chat.server(player, `[Execution time: ${timingMs}ms]`) : '', where: { id: parseInt(id) } }).then((findVeh) => {
                if (findVeh.length == 0) return;
                var vehicle = mp.vehicles.new(mp.joaat(findVeh[0].vehicleModel), new mp.Vector3(JSON.parse(findVeh[0].position), {
                    dimension: 0,
                    locked: true,
                    engine: false
                }));
                vehicle.rotation = new mp.Vector3(0, 0, findVeh[0].heading);
                vehicle.setVariable('sqlID', parseInt(id));
                vehicles.update({
                    spawned: 1,
                    parked: 0,
                    insurance: 0,
                    parkedArea: 0
                }, { where: { id: parseInt(id) } })
                vehicle.setVariable('vehData', findVeh[0].data);
                vehicle.numberPlate = findVeh[0].numberPlate;
                mp.chat.success(player, `You have unparked your vehicle ${vehicle.numberPlate}`)
                vehicle.locked = true;
                mp.events.call('vehicle:setMods', player, vehicle);
                vehicle.setVariable('currentTyres', findVeh[0].tyreStatus);
                vehicle.setVariable('vehDamage', JSON.parse(findVeh[0].data).Health);
                vehicle.setVariable('dirtLevel', findVeh[0].dirtLevel != null ? findVeh[0].dirtLevel : 0);
                vehicle.data.tyreSet = findVeh[0].tyreStatus;
            })
        }
        else if(vehInParking) { return mp.chat.info(player, `There is a vehicle blocking the parking lot. Get some assistance to move the vehicle.`) }
    },
});

mp.events.addCommand({
    'park': async (player, arg) => {
        if (arg != undefined) return mp.chat.info(player, `Use: /park`)
        if (player.vehicle && player.vehicle.getVariable('sqlID') && player.inParkingLot) {
            var parkedArea = player.inParkingLot
            db.vehicles.findAll({ benchmark: true, logging: (sql, timingMs) => player.getVariable('devdebug') ? mp.chat.server(player, `[Execution time: ${timingMs}ms]`) : '', where: { id: player.vehicle.getVariable('sqlID') } }).then((veh) => {
                if (veh.length > 0 && veh[0].OwnerId == player.characterId) {
                    var currentData = JSON.parse(veh[0].data);
                    currentData.Health = player.vehicle.engineHealth;
                    db.vehicles.update({
                        data: JSON.stringify(currentData),
                        parked: 1,
                        parkedArea: parkedArea,
                        insurance: 0,
                        position: JSON.stringify(vehicleSpawnPositions[parkedArea]),
                        spawned: 0
                    }, { where: { id: player.vehicle.getVariable('sqlID') } }).then(() => { mp.chat.success(player, `You have parked your vehicle with plate: ${player.vehicle.numberPlate}`), player.vehicle.destroy() })
                }
                else { mp.chat.err(player, `You do not own this vehicle.`) }
            })
            return;
        }
    }
})