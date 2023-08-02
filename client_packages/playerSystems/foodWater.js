class playerFoodWater {
    constructor() {
        this.energyInter = null;
        this.interTime = 390000; // 6.5 Minutes
        this.player = mp.players.local;

        mp.events.add({
            'render': () => {
                if(this.player.getVariable('playerHunger') && this.player.getVariable('playerThirst')) {

                }
            },
            'start:energy': () => {
                this.energyInter = setInterval(() => {
                    if(this.player.getVariable('loggedIn') && !this.player.getVariable('adminDuty')) {
                        mp.events.callRemote('player:removeHunger', 1);
                        mp.events.callRemote('player:removeThirst', 3);
                    }
                }, this.interTime);
            },
            'stop:energy': () => {
                if(this.energyInter) { clearInterval(this.energyInter) }
            }
        })
    }
}
new playerFoodWater()