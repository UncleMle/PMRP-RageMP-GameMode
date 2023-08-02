class seatBelts {

    constructor() {
        this.player = mp.players.local
        this.key = 74 // J key
        this.PED_FLAG_CAN_FLY_THRU_WINDSCREEN = 32
        this.toggle = true;

        this.config = {
            blockedClasses: [13, 14, 15, 16, 21, 8],
        }

        mp.events.add({
            'toggleBelt': () => {
                if(mp.players.local) {
                    if(this.config.blockedClasses.indexOf(mp.players.local.vehicle.getClass()) !== -1) {return mp.events.call('requestBrowser', `gui.notify.showNotification("This vehicle doesn't have a seatbelt.", false, true, 7000, 'fa-solid fa-triangle-exclamation')`)}
                    else { this.toggleSeatBelt(); }
                }
            },
            "playerLeaveVehicle": (vehicle, seat) => {
                if(this.player.hasSBelt == true) {
                    this.toggle = true;
                    this.beltOff()
                }
            }
        })

        mp.keys.bind(this.key, true, function() {
            if(!mp.players.local.isTypingInTextChat) {
                mp.events.call('toggleBelt');
            }
        });

    }

    toggleSeatBelt() {
        this.toggle = !this.toggle;
        if(this.toggle) {
            if(this.player.vehicle) {
                this.beltOff();
            }
        }
        else if(!this.toggle) {
            if(this.player.vehicle) {
                this.beltOn();
            }
        }
    }

    beltOn() {
        this.player.hasSBelt = true
        this.player.setConfigFlag(this.PED_FLAG_CAN_FLY_THRU_WINDSCREEN, false);
        if(mp.players.local.getVariable('adminDuty')) {
            mp.events.call('notifCreate', '~r~Buckled Seatbelt')
            return
        }
        mp.events.call('ameCreate', 'Buckles seatbelt')
    }

    beltOff() {
        this.player.hasSBelt = false
        this.player.setConfigFlag(this.PED_FLAG_CAN_FLY_THRU_WINDSCREEN, true);
        if(mp.players.local.getVariable('adminDuty')) {
            mp.events.call('notifCreate', '~r~Unbuckled Seatbelt')
            return
        }
        mp.events.call('ameCreate', 'Unbuckles seatbelt')
    }

}

new seatBelts();