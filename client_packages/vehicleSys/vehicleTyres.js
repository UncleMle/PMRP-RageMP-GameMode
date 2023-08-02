const player = mp.players.local;
class vehicleTyres {
    constructor() {

        mp.events.add({
            'playerEnterVehicle': (vehicle, seat) => {
                this.saveTyreStatus(vehicle);
            },
            'playerLeaveVehicle': (vehicle, seat) => {
                this.saveTyreStatus(vehicle);
            },
            'entityStreamIn': (entity) => {
                if (entity.type == 'vehicle' && entity.getVariable('currentTyres')) {
                    setTimeout(() => {
                        if(!entity) return;
                        JSON.parse(entity.getVariable('currentTyres')).forEach((value, i) => {
                            value == true ? entity.setTyreBurst(i, true, 1000) : '_';
                        })
                    }, 300);
                }
            }
        })

        mp.events.addDataHandler({
            'tyreSet': function (entity, value) {
                if (entity.type === 'vehicle' && value) {
                    JSON.parse(value).forEach((value, i) => {
                        value == true ? entity.setTyreBurst(i, true, 1000) : '_';
                    })
                }
            }
        })
    }

    saveTyreStatus(vehicle) {
        if (!vehicle) return;
        vehicle.tyres = [];

        for (var x = 0; x < 6; x++) {
            vehicle.tyres.push(vehicle.isTyreBurst(x, false));
        }

        mp.events.callRemote('updateTyreStatus', vehicle, `[` + vehicle.tyres + `]`);
        return vehicle.tyres;
    }
}
new vehicleTyres();