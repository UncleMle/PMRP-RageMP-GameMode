let CONFIG = require('../CoreSystem/chatformatconf.js').CONFIG;
const db = require('../models')
require('../CoreSystem/coreApi.js');

class vehDatabase {

    constructor() {

        this.despawnerTimer = 14400000;

        mp.events.add({
            'packagesLoaded': async() => {
                db.vehicles.findAll({
                    where: {
                        spawned: 1
                    }
                }).then((loadVehicles) => {
                    mp.log(`${CONFIG.consoleSeq}[Vehicles]${CONFIG.consoleWhite} All ${loadVehicles.length} vehicles were loaded into the world ${CONFIG.consoleGreen}successfully${CONFIG.consoleWhite}.`)
                    loadVehicles.forEach((vehs) => {
                        if(vehs.spawned == 1) {
                            var vehicle = mp.vehicles.new(mp.joaat(vehs.vehicleModel), new mp.Vector3(JSON.parse(vehs.position), {
                                dimension: 0,
                                locked: true,
                                engine: false
                            }));
                            vehicle.locked =  vehs.locked == 1 ? true : false;
                            vehicle.rotation = new mp.Vector3(0, 0, vehs.heading);
                            vehicle.numberPlate = vehs.numberPlate
                            vehicle.setVariable('sqlID', parseInt(vehs.id));
                            vehicle.setVariable('vehData', vehs.data);
                            vehicle.setVariable('isLocked', vehs.locked == 1 ? true : false);
                            vehicle.setVariable('currentTyres', vehs.tyreStatus);
                            vehicle.setVariable('vehDamage', JSON.parse(vehs.data).Health);
                            vehicle.setVariable('dirtLevel', vehs.dirtLevel != null ? vehs.dirtLevel : 0);
                            mp.events.call('vehicle:setMods', null, vehicle);
                        }
                    })
                })
            },
            'vehicleDeath': async(vehicle) => {
                if(vehicle.getVariable('sqlID') && vehicle.getVariable('vehData')) {
                    var currentData = JSON.parse(vehicle.getVariable('vehData'));
                    var currentTyres = JSON.parse(vehicle.getVariable('currentTyres'));

                    if(currentTyres) {
                        for(var x = 0; x < currentTyres.length; x++) {
                            currentTyres[x] = false;
                        }
                    }

                    currentData.Health = 100;
                    currentData.fuelLevel = 100;
                    db.vehicles.update({
                        tyreStatus: currentTyres == null ? "[]" : JSON.stringify(currentTyres),
                        data: JSON.stringify(currentData),
                        parked: 0,
                        spawned: 0,
                        heading: 29,
                        insurance: 1
                    }, {where: {id: vehicle.getVariable('sqlID')}})
                    db.vehicles.findAll({
                        where: {id: vehicle.getVariable('sqlID')}
                    }).then((ve) => {
                        vehicle.destroy();
                        if(ve.length > 0 && ve[0].OwnerId) {
                            var foundP = false;
                            mp.players.forEach(ps => {
                                if(ps.characterId == ve[0].OwnerId) {
                                    foundP = true;
                                    ps.outputChatBox(`!{#e993a0}[Vehicle Insurance]!{white} Your Vehicle ${ve[0].vehicleModelName} [${ve[0].numberPlate}] has been destroyed. You can pick it up from any insurance company for a retrieval fee.`);
                                }
                            })
                        }
                    })
                }
            },
        })

        setInterval(function() {
            mp.vehicles.forEach(async(veh) => {
                if(veh.getVariable('sqlID') && veh.getVariable('vehData')) {
                    var oldData = JSON.parse(veh.getVariable('vehData'));
                    db.vehicles.update({
                        heading: veh.rotation.z,
                        data: `{"fuelLevel": ${oldData.fuelLevel}, "Health": ${veh.engineHealth}, "DistanceKm": ${oldData.DistanceKm}}`,
                        position: JSON.stringify(veh.position)
                    }, {where: {id: parseInt(veh.getVariable('sqlID'))}})
                }
            })
        }, 3000);
    }

    findRotation(x1, y1, x2, y2) {
        const t = -(Math.atan2(x2 - x1, y2 - y1))* (180 / Math.PI);
        return t < 0 ? t + 360 : t
    }
}

const vDb = new vehDatabase();
