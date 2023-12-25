const PED_FLAG_STOP_ENGINE_TURNING = 429;
const player = mp.players.local;
var tog = true;
let sound = null;

let vehicleMgr = {
    vehicles: [],

    add: function (vehicle) {
        this.vehicles.push(vehicle);
    },

    remove: function (vehicle) {
        this.vehicles.splice(vehicle, 1);
    }
}

mp.events.add({
    'render': () => {
        if (mp.players.local.vehicle && mp.players.local.vehicle.getVariable('engineStatus') == false && mp.players.local.vehicle.getPedInSeat(-1) === mp.players.local.handle) {
            if (mp.players.local.vehicle.getVariable('isStalled')) {
                mp.game.graphics.drawText(`~r~Vehicle is now stalled.`, [0.5, 0.92], {
                    font: 4,
                    color: [255, 255, 255, 170],
                    scale: [0.4, 0.4],
                    outline: false
                });
            }
            else {
                mp.game.graphics.drawText(`Vehicle's engine is turned off use ~y~Y~w~ to start it.`, [0.5, 0.92], {
                    font: 4,
                    color: [255, 255, 255, 170],
                    scale: [0.4, 0.4],
                    outline: false
                });
            }
        }
        mp.players.local.setConfigFlag(PED_FLAG_STOP_ENGINE_TURNING, true);
        mp.game.vehicle.defaultEngineBehaviour = false;

    },
    'soundStart': (file) => {
        sound = mp.game.audio.playSound3D(`http://2.126.190.118/audio/${file}.mp3`, mp.players.local.position, 20, 1, 0);
        mp.gui.chat.push(`${JSON.stringify(sound)}`)
        //sound.destroy(); // Destroys the sound
        //sound.pause(); // Pauses the sound
        //sound.resume(); // Resumes the sound
    },
    'soundStop': () => {
        if(sound) { sound.pause() }
    },
    'soundResume': () => {
        if(sound) { sound.resume() }
    },
    "entityStreamIn": (entity) => {
        if (entity.type == 'vehicle') {
            vehicleMgr.add(entity);
            if (entity.getVariable('engineStatus') == true) {
                entity.setEngineOn(true, false, false);
            }
            if (!entity.getVariable('engineStatus')) {
                entity.setEngineOn(false, false, false);
                entity.setUndriveable(true);
            }
        }
    },
    'entityStreamOut': (entity) => {
        if (entity.type == 'vehicle') {
            vehicleMgr.remove(entity);
        }
    },
    "playerEnterVehicle": (player, vehicle, seat) => {
        if (mp.players.local.vehicle.getVariable('engineStatus') == true) {
            mp.players.local.vehicle.setEngineOn(true, true, false);
        }
        else if (!mp.players.local.vehicle.getVariable('engineStatus')) {
        }
    },
});

// Engine bind (Handled Server side)
mp.keys.bind(89, false, async function () {
    if (!mp.players.local.vehicle || mp.players.local.isTypingInTextChat) return;
    if (mp.players.local.vehicle.getVariable('beingRepaired')) return mp.events.call('notifCreate', '~w~Vehicle is being ~r~repaired~w~ you cannot start it.')
    if (!mp.players.local.vehicle.getVariable('engineStatus') && mp.players.local.vehicle.getPedInSeat(-1) === mp.players.local.handle) {
        if (mp.players.local.getVariable('adminDuty')) {
            mp.events.callRemote('engine:start');
            mp.events.call('notifCreate', '~r~Started engine.')
            return
        }
        if (mp.players.local.getVariable('injured') || mp.players.local.getVariable('carryInfo')) { return }

        mp.events.call('ameCreate', `Attempts to start the ${getVehName(mp.players.local.vehicle.model)}'s engine.`);

        await mp.game.waitAsync(1500);

        if (!mp.players.local.vehicle) return;
        // Totalled vehicle
        if (mp.players.local.vehicle.getVariable('isStalled')) { return mp.events.call('notifCreate', '~w~Vehicle is ~r~stalled~w~ due to damage try again.') }
        if (Math.floor(Math.trunc(mp.players.local.vehicle.getBodyHealth() / 10)) < 15) {
            return mp.events.call('requestBrowser', `gui.notify.showNotification("This vehicle is completely broken down call LSC for assistance", false, true, 7000, 'fa-solid fa-triangle-exclamation')`)
        }
        mp.events.call('ameCreate', `Starts the ${getVehName(mp.players.local.vehicle.model)}'s engine.`);
        mp.events.callRemote('engine:start');

    }
    if (mp.players.local.vehicle.getVariable('engineStatus') && mp.players.local.vehicle.getPedInSeat(-1) === mp.players.local.handle) {
        if (!mp.players.local.vehicle) return;
        if (mp.players.local.getVariable('adminDuty')) {
            mp.events.callRemote('engine:stop');
            mp.events.call('notifCreate', '~r~Stopped engine.')
            return
        }
        mp.events.call('ameCreate', `Turns off the ${getVehName(mp.players.local.vehicle.model)}'s engine.`);
        mp.events.callRemote('engine:stop');
    }
});


mp.events.addDataHandler({
    'engineStatus': function (entity, value, oldValue) {
        if (entity.type === 'vehicle') {
            if (value) {
                entity.setEngineOn(true, false, false);
            }
            if (!value) {
                entity.setEngineOn(false, true, false);
                entity.setUndriveable(true);
            }
        }
    }
})

setInterval(function () { removeVehFuel() }, 1000);

/*
setInterval(() => {
    vehicleMgr.vehicles.forEach((veh) => {
        if (veh.getVariable('engineStatus')) {
            veh.setEngineOn(true, true, false);
        }
    })
}, 500);
*/

function removeVehFuel() {
    if (player.vehicle && player.vehicle.getPedInSeat(-1) === player.handle) {
        var speed = mp.players.local.vehicle.getSpeed();
        mp.events.callRemote('removeFuel', player.vehicle, speed);
    }
}

function getVehName(name) {
    var vehicleName = mp.game.ui.getLabelText(mp.game.vehicle.getDisplayNameFromVehicleModel(name));
    if (vehicleName == null || vehicleName == undefined || vehicleName == 'NULL') { vehicleName = `vehicle` }
    return vehicleName;
}
