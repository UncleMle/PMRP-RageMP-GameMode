mp.events.add({
    'client:repairInitial': (veh) => {
        mp.events.callRemote('lsc:RepairVehicle', veh)
    },
    'client:denyVehRepair': (vName) => {
        mp.events.call('requestBrowser', `gui.notify.showNotification("You denied repair for ${vName}", false, true, 15000, 'fa-solid fa-info-circle')`)
    },
    'render': () => {
        /*
        if(mp.players.local.vehicle && mp.players.local.vehicle.getVariable('beingRepaired')) {
            mp.players.local.vehicle.setUndriveable(true)
        }
        */
    },
    'playerEnterColshape': (shape) => { if(shape.getVariable('modView')) { mp.players.local.modView = true } },
    'playerExitColshape': (shape) => {
        if(shape.getVariable('lscRepair') && mp.players.local.isAnim) {
            mp.events.call('requestBrowser', `gui.progressbar.startProgress()`)
        }
        if(shape.getVariable('modView') && mp.players.local.currentBrowser == 'vehcustom') {
            mp.events.call('requestBrowser', `appSys.commit('showHud', true)`)
            mp.events.call('closeRoute')
        }
        if(shape.getVariable('modView')) { mp.players.local.modView = null }
    },
    'client:modsSave': (data) => {
        if(mp.players.local.vehicle && mp.players.local.modView && mp.players.local.vehicle.getVariable('sqlID')) {
            mp.events.callRemote('veh:saveMods', mp.players.local.vehicle, data);
        }
    },
    'veh:setMod': (modType, modIndex) => {
        if(mp.players.local.vehicle && mp.players.local.modView) {
            mp.players.local.vehicle.setMod(parseInt(modType), parseInt(modIndex))
        }
    },
    'veh:setColour': (c1, c2) => {
        if(mp.players.local.vehicle && mp.players.local.modView) {
            mp.players.local.vehicle.setColours(parseInt(c1), parseInt(c2))
        }
    },
    'veh:pearl': (c1) => {
        if(mp.players.local.vehicle && mp.players.local.modView) {
            mp.players.local.vehicle.setExtraColours(parseInt(c1), parseInt(1))
        }
    },
    'veh:setWheelType': (type) => {
        if(mp.players.local.vehicle && mp.players.local.modView) {
            mp.players.local.vehicle.setWheelType(parseInt(type));
        }
    },
    'veh:resetMods': () => {
        if(mp.players.local.vehicle) {
            mp.events.callRemote('vehicle:setMods', mp.players.local.vehicle)
        }
    }
})

mp.events.addDataHandler('repairAnim', function (entity, value, oldValue) {
    if (entity.type === 'player' && value) {
        entity.isAnim = true;
        mp.game.streaming.requestAnimDict(`mini@repair`);
        setTimeout(() => {
            entity.taskPlayAnim(`mini@repair`, `fixing_a_player`, 8.0, 1.0, -1, 1, 1.0, false, false, false);// 8.0, 1.0, -1, 1, 1.0, false, false, false);
        }, 200);
        setTimeout(() => {
            if (entity && value) {
                entity.clearTasks();
                mp.events.callRemote('lsc:finishRepair', entity, value)
                entity.isAnim = null;
            }
        }, 40000);
    }
})

mp.events.addProc('proc:getVehHP', (vehicle) => {
    return Math.trunc(vehicle.getBodyHealth() / 10);
})

mp.events.addProc('proc:getVehClass', (vehicle) => {
    return vehicle.getClass();
})