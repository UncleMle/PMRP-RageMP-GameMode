class pedMngr {
    constructor() {
        this.robbablePeds = [];
        this.robbing = false;

        mp.events.add({
            'render': () => {
                this.robbablePeds.forEach((ped) => {
                    var clientP = mp.players.local.position
                    var dist = Math.floor(mp.game.system.vdist(clientP.x, clientP.y, clientP.z, ped.position.x, ped.position.y, ped.position.z))
                    if(mp.game.player.isFreeAimingAtEntity(ped.handle) && dist <= 5) {
                        ped.taskHandsUp(-1, -1, 0, true);
                        this.robbing = true;
                        ped.canBeRobbed = true;
                    }
                    else { ped.clearTasks(), this.robbing = false, ped.canBeRobbed = false }
                })
            },
            'entityStreamIn': (entity) => {
                if(entity.type == 'ped' && entity.getVariable('storePed')) {
                    this.robbablePeds.push(entity);
                 }
                 /*
                 if((entity.type) == 'ped' || 'player' && entity.getVariable('robStore:data') == true) {
                    mp.game.streaming.requestAnimDict(`oddjobs@shop_robbery@rob_till`);
                    entity.taskPlayAnim(`oddjobs@shop_robbery@rob_till`, `loop`, 8.0, 1.0, -1, 1, 1.0, false, false, false);
                 }
                 */
            },
            'entityStreamOut': (entity) => {
                if(entity.type == 'ped' && entity.getVariable('storePed')) {
                    this.robbablePeds.splice(1, entity);
                }
                /*
                if((entity.type) == 'ped' || 'player' && entity.getVariable('robStore:data') == true) {
                    entity.clearTasks()
                }
                */
            }
        })

        mp.events.addDataHandler({
            'robStore:data': function(entity, value) {
                if(entity.type == 'player') {
                    if(value) {
                        mp.game.streaming.requestAnimDict(`oddjobs@shop_robbery@rob_till`);
                        entity.taskPlayAnim(`oddjobs@shop_robbery@rob_till`, `loop`, 8.0, 1.0, -1, 1, 1.0, false, false, false);
                     }
                    else if(!value) { entity.clearTasks() }
                }
            }
        })

        mp.events.addProc({
            'proc:checkRobPed': () => {
                this.robbablePeds.forEach((ped) => {
                    var clientP = mp.players.local.position
                    var dist = Math.floor(mp.game.system.vdist(clientP.x, clientP.y, clientP.z, ped.position.x, ped.position.y, ped.position.z))
                    if(ped.canBeRobbed == true && dist <= 5 && ped.getVariable('storeId')) {
                        return ped;
                    }
                    else { return false }
                })
            },
            'proc:getDist': (entity) => {
                var ppos = mp.players.local.position;
                var dist = Math.floor(mp.game.system.vdist(ppos.x, ppos.y, ppos.z, entity.position.x, entity.position.y, entity.position.z))
                return dist;
            }
        })

        setInterval(() => {
            if(this.robbing) {mp.events.callRemote('setvar', 'robbingStore', true);}
        }, 3000);
    }
}
new pedMngr()