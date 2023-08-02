let player = mp.players.local;
let hired = null;
let truckData = {};
let playerTruck = player.getVariable('playerTruck');

const red = "!{#de3333}";
const greens = "!{#78cc78}";
const greys = "!{#9e9d9d}";
const blues = "!{#6dbce6}";
const me = "!{#dc7dff}";
const whites = "!{#ffffff}";
const errors = "!{#ff322b}ERROR:!{white}"
const staffs = "!{#ff322b}[Staff]:!{white} ";
const pmrps = "!{#ca75ff}[Paramount Roleplay]!{#ffffff}";
const gold = "!{#FFD700}";
const lpink = "!{#dcabff}";
const info = `!{yellow}[INFO]:!{white}`

// --------------------- Trailer Sync ---------------------


// ---------------------              ---------------------

mp.keys.bind(0x45, false, function () {
    let entered = mp.players.local.getVariable('truckerJob');
    let istyping = mp.players.local.isTypingInTextChat;
    if(istyping) return
    if(entered == "entered") {
        mp.events.call('trucker:startUI');
        mp.events.call('hideBrowserR');
    }
})

mp.events.add({
    'trucker:jobStart': () => {
        let hasJob = player.getVariable('startedJob');
        if(hasJob == 1) return;
        mp.events.callRemote('setvar', 'startedJob', 1);
        let currentJob = player.getVariable('currentJob')
        if(currentJob == 'trucker') return mp.gui.chat.push(`You are already employed as a trucker driver!`);
        player.setVariable('currentJob', 'trucker');
        mp.gui.chat.push(`${info} You are now employed as a trucker driver head to the red blip on the map to get started!`)
        hired = true;
        beginTrucker();
    },
    "playerEnterCheckpoint": (checkpoint) => {
        if(checkpoint == truckData.checkpointOne) {
            mp.events.callRemote('setvar', 'truckerStage', 1);
            mp.events.call('showBrowserR');
            mp.events.call('rentalBrowserR', [`Use 'E' to interact`])
        }
    },
    'playerExitCheckpoint': (checkpoint) => {
        if(checkpoint == truckData.checkpointOne) {
            mp.events.callRemote('setvar', 'truckerStage', 0);
            mp.events.call('hideBrowserR');
        }
    }
});

function beginTrucker() {
    truckData.checkpointOne = mp.checkpoints.new(1, new mp.Vector3(1230.1, -3204.3, 6), 1,
    {
        direction: new mp.Vector3(0, 0, 75),
        color: [ 255, 255, 255, 1 ],
        visible: true,
        dimension: 0
    })
    truckData.blipOne = mp.blips.new(1, new mp.Vector3(1230.1, -3204.3, 6),
    {
        name: `Pickup your truck from here.`,
        scale: 0.6,
        color: 1,
        alpha: 255,
    })
};


mp.keys.bind(0x45, false, function () {
    let entered = player.getVariable('truckerStage')
    let tStage = player.getVariable('tStage');
    if(tStage == 2) return;
    let istyping = player.isTypingInTextChat;
    if(entered == 2) return;
    if(istyping) return;
    if(entered == 1) {
        truckData.checkpointOne.destroy();
        truckData.blipOne.destroy();
        mp.events.callRemote('setvar', 'tStage', 2);
        mp.events.callRemote('spawnTruck')
        mp.events.call('notifs', ['Follow the waypoint to the load location.'])
        var totalfunc=3;
        route1();
        /*
        var randomnumber=Math.floor(Math.random()*totalfunc+(1));
        var func="route"+randomnumber;
        eval(func)();
        */
    }
});


function route1 () {
    if(hired) {
        truckData.checkpointR1C1 = mp.checkpoints.new(1, new mp.Vector3(1191.3, -3340.7, 5.8), 3,
        {
            direction: new mp.Vector3(0, 0, 75),
            color: [ 1, 1, 1, 1 ],
            visible: true,
            dimension: 0
        })
        truckData.blipB1R1 = mp.blips.new(1, new mp.Vector3(1191.3, -3340.7, 5.8), 
        {
            name: `Head over here to pickup your load.`,
            scale: 0.5,
            color: 2,
            alpha: 255,
        })
        truckData.blipB1R1.setRoute(true)        
    }
};


function route2 () {
    var playerTruck = player.getVariable('playerTruck');

    mp.gui.chat.push(`2`)
    return
}

function route3 () {
    var playerTruck = player.getVariable('playerTruck');
    mp.gui.chat.push(`3`)
    return
}

function checkpointEnterHandler(checkpoint) {
    var playerTruck = player.getVariable('playerTruck');
    if(truckData.checkpointR1C1 !== null && checkpoint == truckData.checkpointR1C1) {
        if(player.vehicle && player.vehicle == playerTruck) {
            mp.events.call('notifs', ['Your truck is now being loaded with resources!']);
            var disable = true;
            setInterval(() => {
                if(disable && player.vehicle !== null) player.vehicle.freezePosition(true);
                if(disable) mp.game.controls.disableAllControlActions(0);
            }, 1);
            setTimeout(() => {
                disable = false;
                if(player.vehicle) {
                    player.vehicle.freezePosition(false);
                }
            }, 10000);
            truckData.checkpointR1C1.destroy();
            truckData.blipB1R1.destroy();
            truckData.checkpointR1C2 = mp.checkpoints.new(1, new mp.Vector3(1007.9, -2510.3, 28.3), 3,
            {
                direction: new mp.Vector3(0, 0, 75),
                color: [ 1, 1, 1, 1 ],
                visible: true,
                dimension: 0
            })
            truckData.blipB2R1 = mp.blips.new(1, new mp.Vector3(1007.9, -2510.3, 28.3),
            {
                name: `Head over here to pickup your load.`,
                scale: 0.5,
                color: 2,
                alpha: 255,
            })
            truckData.blipB2R1.setRoute(true)        
        }
    }
    if(truckData.checkpointR1C2 !== null && checkpoint == truckData.checkpointR1C2) {
        if(player.vehicle && player.vehicle == playerTruck) {
            mp.events.call('notifs', ['Your truck is now being loaded up with resources!']);
            var disable = true;
            setInterval(() => {
                if(disable && player.vehicle !== null) player.vehicle.freezePosition(true);
                if(disable) mp.game.controls.disableAllControlActions(0);
            }, 1);
            setTimeout(() => {
                disable = false;
                if(player.vehicle) {
                    player.vehicle.freezePosition(false);
                }
            }, 10000);
            truckData.checkpointR1C2.destroy();
            truckData.blipB2R1.destroy();
            truckData.checkpointR1C3 = mp.checkpoints.new(1, new mp.Vector3(2908.8, 4385.3, 50.3), 3,
            {
                direction: new mp.Vector3(0, 0, 75),
                color: [ 1, 1, 1, 1 ],
                visible: true,
                dimension: 0
            })
            truckData.blipB2R3 = mp.blips.new(1, new mp.Vector3(2908.8, 4385.3, 50.3),
            {
                name: `Head over here to unload your resources.`,
                scale: 0.5,
                color: 1,
                alpha: 255,
            })
            truckData.blipB2R3.setRoute(true)        
        }
    }
    if(truckData.checkpointR1C3 !== null && checkpoint == truckData.checkpointR1C3) {
        if(player.vehicle && player.vehicle == playerTruck) {
            mp.events.call('notifs', ['The resources from your truck are now being unloaded.']);
            var disable = true;
            setInterval(() => {
                if(disable && player.vehicle !== null) player.vehicle.freezePosition(true);
                if(disable) mp.game.controls.disableAllControlActions(0);
            }, 1);
            setTimeout(() => {
                disable = false;
                if(player.vehicle) {
                    player.vehicle.freezePosition(false);
                }
            }, 10000);
            truckData.checkpointR1C3.destroy();
            truckData.blipB2R3.destroy();
            truckData.checkpointR1C4 = mp.checkpoints.new(1, new mp.Vector3(-143.9, 6353.7, 31.5), 3,
            {
                direction: new mp.Vector3(0, 0, 75),
                color: [ 1, 1, 1, 1 ],
                visible: true,
                dimension: 0
            })
            truckData.blipB2R4 = mp.blips.new(1, new mp.Vector3(-143.9, 6353.7, 31.5),
            {
                name: `Head over here to unload your resources.`,
                scale: 0.5,
                color: 1,
                alpha: 255,
            })
            truckData.blipB2R4.setRoute(true)        
        }
    }

    if(truckData.checkpointR1C4 !== null && checkpoint == truckData.checkpointR1C4) {
        if(player.vehicle && player.vehicle == playerTruck) {
            mp.events.call('notifs', ['The resources from your truck are now being unloaded.']);
            var disable = true;
            setInterval(() => {
                if(disable && player.vehicle !== null) player.vehicle.freezePosition(true);
                if(disable) mp.game.controls.disableAllControlActions(0);
            }, 1);
            setTimeout(() => {
                disable = false;
                if(player.vehicle) {
                    player.vehicle.freezePosition(false);
                }
            }, 10000);
            truckData.checkpointR1C4.destroy();
            truckData.blipB2R4.destroy();
            truckData.checkpointR1C5 = mp.checkpoints.new(1, new mp.Vector3(1245.9, -3135.5, 5.6), 3,
            {
                direction: new mp.Vector3(0, 0, 75),
                color: [ 1, 1, 1, 1 ],
                visible: true,
                dimension: 0
            })
            truckData.blipB2R5 = mp.blips.new(1, new mp.Vector3(1245.9, -3135.5, 5.6),
            {
                name: `Return your truck to the logistics company.`,
                scale: 0.5,
                color: 73,
                alpha: 255,
            })
            truckData.blipB2R5.setRoute(true)        
        }
    }
    if(truckData.checkpointR1C5 !== null && checkpoint == truckData.checkpointR1C5) {
        if(player.vehicle && player.vehicle == playerTruck) {
            mp.events.call('notifs', ['Your work truck has been returned to the logistics company.']);
            mp.gui.chat.push(`${greens}[JOB SALARY] ${greys}:!{white} You have finished your trucking job and earned ${greens}$8,500!{white}!`)
            var disable = true;
            truckData.checkpointR1C5.destroy();
            truckData.blipB2R5.destroy();    
            mp.events.callRemote('deleteWorkTruck')
            hired = false;
            var pCash = mp.players.local.getVariable('moneyValue');
            mp.game.ui.notifications.showWithPicture("Bank Deposit", "Fleeca Bank Services", `A deposit from Steven's Logitical services has been made in value of ~g~$8500~w~. Previous account funds ~g~$${pCash.toLocaleString("en-US")}`, "CHAR_BANK_FLEECA", 9, false, 0, 5);
            mp.events.callRemote('addPlayerCash', 8500);
        }
    }
}

function checkpointExitHandler(checkpoint) {
    if(checkpoint.checkpointR1C1 !== null && checkpoint == truckData.checkpointR1C1) {
        if(player.vehicle && player.vehicle == playerTruck) {
        }
    }
}

mp.events.add({
    "playerEnterCheckpoint": checkpointEnterHandler, 
    "playerExitCheckpoint": checkpointExitHandler,
    'spawnTruck': () => {
        let truck = mp.vehicles.new(mp.game.joaat('phantom'), mp.players.local.position,
        {
            heading: 0,
            numberPlate: "TRAIc"
        });
        let trailer = mp.vehicles.new(mp.game.joaat('trailers4'), mp.players.local.position,
        {
            heading: 0,
            numberPlate: "TRAILER"
        });
        attachTrailerByVehicle(truck,trailer);
    }
});




// Trailer Sync

let trailers = {};
async function attachTrailerByVehicle(truck, trailer) {
	let reAttachInterval = setInterval(() => {
        if(mp.vehicles.exists(truck)) {
            if(truck.getVariable("TRAILER") != null){
                mp.events.call("Create::Trailer", truck, truck.position);
                if(mp.vehicles.exists(trailer)) {
                    trailer.setCanBeVisiblyDamaged(false);       //no damages
                    trailer.setCanBreak(false);                  //can break
                    trailer.setDeformationFixed();               //fixed deformation
                    trailer.setDirtLevel(0);                     //clear
                    trailer.setDisablePetrolTankDamage(true);    //disable fueltank damage
                    trailer.setDisablePetrolTankFires(true);     //disable fire fuel
                    trailer.setInvincible(true);                 //godmode
                }
                else {
                    if(reAttachInterval) clearInterval(reAttachInterval);
                }
            }
        }
        else {
            if(reAttachInterval) clearInterval(reAttachInterval);
        }
	}, 1000);
};
mp.events.add({
    'Create::Trailer': (truck, position) => {
        if(trailers[truck.remoteId] != null) {
            setTimeout(() => {
                truck.attachToTrailer(trailers[truck.remoteId].handle, 1000);
            }, 50);
            return;
        }
      let trailer = mp.vehicles.new(mp.game.joaat(truck.getVariable("TRAILER")), position,
        {
            heading: truck.getHeading(),
            numberPlate: "TRAILER"
        });
        trailers[truck.remoteId] = trailer;
        if(trailer != null){
            setTimeout(() => {
                truck.attachToTrailer(trailer.handle, 1000);
                attachTrailerByVehicle(truck, trailer);
            }, 200);
        }
        else {
            mp.gui.chat.push(`There was an error syncing your trailer!`);
            return;
        }
    },
    'entityStreamIn': (entity) => {
        if(entity && mp.vehicles.exists(entity)){
            if(entity.type == "vehicle"){
                if(entity.getVariable("TRAILER") != null){
                    mp.events.call("Create::Trailer", entity, entity.position);
                }
            }
        }
    },
    'entityStreamOut': (entity) => {
        if(entity && mp.vehicles.exists(entity)){
            if(entity.type == "vehicle"){
                if(entity.getVariable("TRAILER") != null){
                    if(trailers[entity.remoteId] != null) {
                      trailers[entity.remoteId].destroy();
                      trailers[entity.remoteId] = null;
                    }
                }
            }
        }
    }
});



























