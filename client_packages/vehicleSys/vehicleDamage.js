const player = mp.players.local;

class vehicleDmg {
    validateEnt(entity) {
        return entity.type == 'vehicle' && entity.getVariable('vehDamage') ? true : false;
    }

    updateHealth(entity, hp) {
        if(entity.type == 'vehicle') {
            entity.setEngineHealth(parseInt(hp));
            entity.setBodyHealth(parseInt(hp));
        }
    }

    setHealth(entity) {
        entity.type == 'vehicle' && entity.getVariable('sqlID') ? mp.events.callRemote('updateVehicleHealth') : false;
    }

    constructor() {

        mp.events.add({
            'entityStreamIn': (entity) => {
                if(this.validateEnt(entity)) {
                    this.updateHealth(entity, entity.getVariable('vehDamage'));
                }
            },
            'playerEnterVehicle': (vehicle, seat) => {
                this.setHealth(vehicle);
            },
            'render': () => {
                if(player.vehicle) {
                    if(player.vehicle.getBodyHealth() <= 150) {
                        player.vehicle.setUndriveable(true);
                    }
                    this.updateHealth(player.vehicle, player.vehicle.getBodyHealth());
                }
            }
        })

        mp.events.addDataHandler('vehDamage', (entity, value) => {
            if(entity.type == 'vehicle' && value) {
                this.updateHealth(entity, value);
            }
        })

    }
}

new vehicleDmg()