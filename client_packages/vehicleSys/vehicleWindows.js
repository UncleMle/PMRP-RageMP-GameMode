class windowSystem {
    constructor() {

        mp.events.addDataHandler({
            'vehicleWindows': (entity, value) => {
                if(entity && value) {
                    this.applyWindow(entity, value);
                }
            }
        })

        mp.events.add({
            'entityStreamIn': (entity) => {
                if(entity.getVariable('vehicleWindows')) {
                    this.applyWindow(entity, entity.getVariable('vehicleWindows'));
                }
            },
            'render': () => {
                mp.vehicles.forEachInStreamRange((veh) => {
                    if(veh.getVariable('vehicleWindows')) {
                        this.applyWindow(veh, veh.getVariable('vehicleWindows'));
                    }
                })
            }
        })
    }

    applyWindow(entity, array) {
        array.forEach((window, i) => {
            window.opened ? entity.rollDownWindow(i) : entity.rollUpWindow(i);
        })
    }
}

new windowSystem();