const insurancesUIs = [
    new mp.Vector3(0, 0, 0),
    new mp.Vector3(-836.9, -273.9, 38.8),
    new mp.Vector3(-227.8, 6333.4, 32.4)
]

const insuranceSpawns = [
    new mp.Vector3(0, 0, 0),
    new mp.Vector3(-862.4, -264, 40),
    new mp.Vector3(-219.1, 6342.9, 32.2)
]

insurancesUIs.forEach((insur) => {
    if(insur.x !== 0) {
        mp.blips.new(380, insur,
            {
                name: 'Vehicle Insurance',
                color: 23,
                shortRange: true,
            });
            mp.markers.new(27, new mp.Vector3(insur.x, insur.y, insur.z-0.9), 1,
            {
                direction: 0,
                rotation: 0,
                color: [233, 146, 159, 255],
                visible: true,
                dimension: 0
            });
            var insuranceUICol = mp.colshapes.newRectangle(insur.x, insur.y, 3, 3)
            insuranceUICol.setVariable('insuranceUI', insurancesUIs.indexOf(insur))
    }
})

mp.events.add({
    'playerEnterColshape': (player, shape) => {
        if(shape.getVariable('insuranceUI')) {
            player.inInsuranceUI = shape.getVariable('insuranceUI')
            if(!player.vehicle) { player.call('requestBrowser', [`gui.notify.showNotification("Press 'Y' to interact", true, false, false, 'fa-solid fa-circle-info')`]) }
        }
    },
    'playerExitColshape': (player, shape) => {
        if(shape.getVariable('insuranceUI')) {
            player.call('closeRoute')
            player.call('requestBrowser', [`gui.notify.clearAll()`])
            player.inInsuranceUI = null
        }
    },
    'getInsurancesVehs': async(player) => {
        if(!player.inInsuranceUI) return;

        const getRoute = await player.callProc('proc:getRoute')
        if(getRoute != '/') { return; }
        const { vehicles } = require('../models')
        vehicles.findAll({ where: {OwnerId: player.characterId, parked: 0, spawned: 0, insurance: 1} }).then((getVehicles) => {
            if(getVehicles.length == 0) return mp.chat.err(player, `You have no vehicles in insurance.`)
            player.call('requestRoute', ['listMenu', true, true]);
            var count = 1;
            getVehicles.forEach((veh) => {
                player.call('requestBrowser', [`appSys.commit('updateLists', {
                    menuName: 'Vehicle Insurance',
                    menuSub: 'You have ${getVehicles.length} in insurance.',
                    tableOne: 'Name',
                    icon: 'fa-solid fa-car-burst',
                    name: '${veh.vehicleModelName}',
                    id: ${veh.id},
                    button: true,
                    funcs: 'getVFromInsurance'
                    });`]);
                count++;
            })
        }).catch((err) => {mp.log((err));})
    },
    'getVFromInsurance': async(player, id) => {
        if(!player.inInsuranceUI) {return}
        var vehInParking = false;
        mp.vehicles.forEachInRange(player.position, 120, (veh) => {
            if ( (veh.position.x >= insuranceSpawns[player.inInsuranceUI].x-2 && veh.position.x <= insuranceSpawns[player.inInsuranceUI].x+2) && (veh.position.y >= insuranceSpawns[player.inInsuranceUI].y-2 && veh.position.y <= insuranceSpawns[player.inInsuranceUI].y+2)) {
                vehInParking = true
            }
        })

        if(vehInParking) { return mp.chat.info(player, `There is a vehicle blocking the insurance lot. Get some assistance to move the vehicle.`)}


        const { vehicles } = require('../models')
        vehicles.findAll({ benchmark: true, logging: (sql, timingMs) => player.getVariable('devdebug') ? mp.chat.server(player, `[Execution time: ${timingMs}ms]`) : '', where: {id: parseInt(id)} }).then((findVeh) => {
            var vehicle = mp.vehicles.new(mp.joaat(findVeh[0].vehicleModel), insuranceSpawns[player.inInsuranceUI], {
                dimension: 0,
                locked: true,
                engine: false
            });
            vehicle.rotation = new mp.Vector3(0, 0, findVeh[0].heading);
            vehicle.setVariable('sqlID', parseInt(findVeh[0].id));
            vehicles.update({
                spawned: 1,
                parked: 0,
                insurance: 0
            }, {where: {id: parseInt(id)}})
            vehicle.setVariable('vehData', findVeh[0].data)
            vehicle.numberPlate = findVeh[0].numberPlate;
            mp.chat.success(player, `You have retrieved your vehicle ${vehicle.numberPlate} from the vehicle insurance.`)
            vehicle.locked = true;
            mp.events.call('vehicle:setMods', player, vehicle);
            vehicle.data.setterHP = JSON.parse(vehicle.getVariable('vehData')).Health;
            vehicle.setVariable('currentTyres', findVeh[0].tyreStatus);
            vehicle.setVariable('dirtLevel', findVeh[0].dirtLevel != null ? findVeh[0].dirtLevel : 0);
            vehicle.data.tyreSet = findVeh[0].tyreStatus;
        })
    },
})