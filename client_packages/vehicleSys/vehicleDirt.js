const player = mp.players.local;

class vehicleDirt {
    updateVehicleDirt(vehicle) {
        if(!vehicle) return;
        mp.gui.chat.push(vehicle.getDirtLevel());
        mp.events.callRemote('updateDirtLevel', vehicle, vehicle.getDirtLevel());
    }

    constructor() {
        mp.events.add({
            'playerEnterVehicle': (vehicle) => {
                this.updateVehicleDirt(vehicle);
            },
            'playerLeaveVehicle': (vehicle) => {
                this.updateVehicleDirt(vehicle);
            },
            'entityStreamIn': (entity) => {
                if(entity.type == 'vehicle' && entity.getVariable('dirtLevel')) {
                    entity.setDirtLevel(entity.getVariable('dirtLevel') == null ? 0 : entity.getVariable('dirtLevel'));
                }
            }
        })

        mp.events.addDataHandler({
            'dirtLevel': function (entity, value) {
                if (entity.type === 'vehicle' && value) {
                    mp.gui.chat.push(value);
                    entity.setDirtLevel(value == null ? 0 : value);
                }
            }
        })
    }
}
var vDirt = new vehicleDirt();