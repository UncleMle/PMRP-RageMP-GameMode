let player = mp.players.local;
const sound = "VEHICLE_LOCKED";
var vehicleArr = [];

class vehLock {

    constructor() {

        mp.events.add({
            'vehicle:flashLights': (vehicle, value) => {
                if (vehicle && value) {
                    vehicle.setIndicatorLights(1, true);
                    vehicle.setIndicatorLights(0, true);
                    setTimeout(() => {
                        vehicle.setIndicatorLights(1, false);
                        vehicle.setIndicatorLights(0, false);
                        setTimeout(() => {
                            vehicle.setIndicatorLights(1, true);
                            vehicle.setIndicatorLights(0, true);
                            setTimeout(() => {
                                vehicle.setIndicatorLights(1, false);
                                vehicle.setIndicatorLights(0, false);
                            }, 200);
                        }, 200);
                    }, 200);
                }
            }
        })

        mp.events.addDataHandler({
            'lightFlash': function (entity, value) {
                if (entity.type === 'vehicle') {
                    for (var x = 0; x < 7; x++) {
                        entity.setDoorShut(x, true);
                    }
                    mp.events.call('vehicle:flashLights', entity, value);
                }
            },
            'lockAnim:data': function (entity, value) {
                if (entity.type == 'player') {
                    if (value) {
                        mp.game.streaming.requestAnimDict("anim@mp_player_intmenu@key_fob@");
                        entity.taskPlayAnim('anim@mp_player_intmenu@key_fob@', 'fob_click_fp', 8.0, 1.0, 1110.0, 0 + 32 + 16, 0.0, false, false, false);
                        setTimeout(async () => {
                            if (!mp.players.at(entity.remoteId)) return;
                            entity.stopAnimTask('anim@mp_player_intmenu@key_fob@', "fob_click_fp", 3.0);
                            mp.events.callRemote('endLock:anim');
                        }, 1500);
                    }
                }
            }
        })

        mp.keys.bind(75, false, function () {
            if (player.getVariable('loggedIn') && !player.isTypingInTextChat) {
                mp.events.callRemote('try:vehicle', mp.players.local)
            }
        });

    }

}

const lock = new vehLock();
