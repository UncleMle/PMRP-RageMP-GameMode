var timer = 1000; // 1 sec
var saveDmg = 12000; // 9 sec
var targetVeh = null
var stallPlayer = null
var oldDmg = null

mp.events.add({
    'playerEnterVehicle': () => {
        if (mp.players.local.vehicle && !mp.players.local.vehicle.getVariable('isStalled')) {
            setInterval(damageCheck, 100)
            oldDmg = Math.floor(Math.trunc(mp.players.local.vehicle.getBodyHealth() / 10))
        }
    },
    'playerLeaveVehicle': () => {
        clearInterval(damageCheck)
    },
    'playerQuit': (player) => {
        if(player.stallVehicle) {
            var targetVeh = mp.vehicles.at(player.stallVehicle);
            if(targetVeh && targetVeh.getVariable('isStalled')) {
                mp.events.callRemote('setvehStall', targetVeh, false);
            }
        }
    }
})

function damageCheck() {
    if (mp.players.local.vehicle && mp.players.local.vehicle.getPedInSeat(-1) === mp.players.local.handle && mp.players.local.vehicle.getVariable('engineStatus') && !mp.players.local.vehicle.getVariable('isStalled') && !mp.players.local.getVariable('adminDuty')) {
        if((Math.floor(Math.trunc(mp.players.local.vehicle.getBodyHealth() / 10))) <= oldDmg - 11) {
            oldDmg = Math.floor(Math.trunc(mp.players.local.vehicle.getBodyHealth() / 10))
            mp.events.callRemote('setvehStall', mp.players.local.vehicle, true);
            mp.events.callRemote('updateVehicleHealth');
            targetVeh = mp.players.local.vehicle;
            stallPlayer = mp.players.local.handle;
            mp.players.local.stallVehicle = mp.players.local.vehicle.remoteId;
            mp.events.callRemote('engine:stop');
            mp.events.call('requestBrowser', `gui.notify.showNotification("You have stalled this vehicle!", false, true, 7000, 'fa-solid fa-triangle-exclamation')`)
            mp.events.call('notifCreate', '~r~You have stalled this vehicle!')
            setTimeout(() => {
                setInterval(damageCheck, 100);
                if (targetVeh) { mp.events.callRemote('setvehStall', targetVeh, false) }
            }, 15000);
            return
        }
        if((Math.floor(Math.trunc(mp.players.local.vehicle.getBodyHealth() / 10))) <= oldDmg - 4) {
            oldDmg = Math.floor(Math.trunc(mp.players.local.vehicle.getBodyHealth() / 10))
            mp.events.callRemote('setvehStall', mp.players.local.vehicle, true);
            mp.events.callRemote('updateVehicleHealth');
            targetVeh = mp.players.local.vehicle;
            stallPlayer = mp.players.local.handle;
            mp.players.local.stallVehicle = mp.players.local.vehicle.remoteId;
            mp.events.callRemote('engine:stop');
            mp.events.call('requestBrowser', `gui.notify.showNotification("You have stalled this vehicle!", false, true, 7000, 'fa-solid fa-triangle-exclamation')`)
            mp.events.call('notifCreate', '~r~You have stalled this vehicle!')
            setTimeout(() => {
                setInterval(damageCheck, 100);
                if (targetVeh) { mp.events.callRemote('setvehStall', targetVeh, false) }
            }, 8500);
            return
        }
    }
}