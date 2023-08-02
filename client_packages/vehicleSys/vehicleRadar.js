/*
class vehicleRadar {
    constructor() {
        this.player = mp.players.local;
        this.pos = mp.players.local.position;
        this.allowedVehicles = [
            2157618379,
            3211609992,
            2046537925,
            461626102
        ]
        this.target = null

        mp.events.add({

            'render': () => {
                //mp.players.local.vehicle.getVariable('engineStatus')
                //if(this.player.vehicle) {mp.gui.chat.push(`${mp.players.local.vehicle.getVariable('hasRadar')}`)}
                if(this.player.vehicle) { //&& !this.allowedVehicles.indexOf(this.player.vehicle.getClass()) == -1) {
                    mp.game.graphics.drawText(`Speed: ${this.target ? this.target.entity.model : 'Not known'} Plate: ${this.target ? this.target.entity.numberPlate : ''}`, [0.5, 0.5], {
                        scale: [0.3, 0.3],
                        outline: false,
                        color: [255, 255, 255, 255],
                        font: 4
                    });
                    mp.vehicles.forEachInStreamRange((ve) => {
                        var vdist = Math.floor(mp.game.system.vdist(this.pos.x, this.pos.y, this.pos.z, ve.position.x, ve.position.y, ve.position.z))
                        if(10 <= vdist) {
                            this.target = mp.raycasting.testPointToPoint(ve.position, this.player.vehicle.position, [this.player, this.player.vehicle], [1, 16]);
                            mp.game.graphics.drawLine(this.player.vehicle.position.x, this.player.vehicle.position.y, this.player.vehicle.position.z, this.target.entity.position.x, this.target.entity.position.y, this.target.entity.position.z, 155, 255, 245, 255);
                        }
                    })
                }

            },

            'playerEnterVehicle': (vehicle, seat) => {
                if(!vehicle.getVariable('hasRadar') == true) {
                    //mp.gui.chat.push(`${vehicle.model}`)
                    this.allowedVehicles.forEach((veh) => {
                        if(veh == vehicle.model) {
                            mp.events.callRemote('setRadar', this.player, vehicle)
                            mp.gui.chat.push(`${veh}`)
                        }
                    })
                 }
            }

        })
    }
}
new vehicleRadar()
*/