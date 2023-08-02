const player = mp.players.local;
var coordOne = null;

class vehicleDistance {

    getDistance(coordOne, coordTwo) {
        if(!coordOne || !coordTwo) return;
        var vdist = mp.game.system.vdist(coordOne.x, coordOne.y, coordOne.z, coordTwo.x, coordTwo.y, coordTwo.z);
        return vdist;
    }

    constructor() {

        mp.events.add({
            'playerEnterVehicle': (vehicle) => {
                if (vehicle.getVariable('sqlID')) {
                    coordOne = vehicle.position;
                }
            },
            'playerLeaveVehicle': (vehicle) => {
                if(vehicle != null) {
                    vehicle && coordOne && vehicle.getVariable('sqlID') && this.getDistance(coordOne, vehicle.position) > 0 ? (mp.events.callRemote('updateDistance', vehicle, this.getDistance(coordOne, vehicle.position)), coordOne = vehicle.position ) : '_' ;
                }
            }
        })

    }
}

var vehDist = new vehicleDistance();