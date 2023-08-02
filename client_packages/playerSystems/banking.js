const keys = {
    Y: 89,
    X: 88,
    Z: 90,
    rightArr: 190,
    leftArr: 189,
}

const player = mp.players.local;

class bankingSystems {
    constructor() {
        mp.events.add({
            'render': () => {
                if(player.currentRoute == 'atmmenu') {
                    mp.game.controls.disableAllControlActions(0);
                }
            },
            'playerExitColshape': (shape) => {
                if(shape.getVariable('atm') && player.currentRoute == 'atmmenu') {
                    mp.events.call('closeRoute');
                }
            },
        })

        mp.keys.bind(keys.Y, false, function() {
            if(player.currentRoute == 'atmmenu') return;

            if(player.getVariable('byAtm') && !player.getVariable('isInjured') && !player.isTypingInTextChat && !player.vehicle) {
                mp.events.call('requestBrowser', `appSys.commit('setBankUiType', {
                    type: 'atm'
                })`);
                mp.events.call('requestRoute', 'atmmenu', true, true);
                return;
            }
            if(player.getVariable('byBank') && !player.getVariable('isInjured') && !player.isTypingInTextChat && !player.vehicle) {
                mp.events.callRemote('setBankInfo');
                mp.events.call('requestBrowser', `appSys.commit('setBankUiType', {
                    type: 'bank'
                })`);
                mp.events.call('requestRoute', 'atmmenu', true, true);
                return;
            }
        })
    }
}

var atmSys = new bankingSystems();