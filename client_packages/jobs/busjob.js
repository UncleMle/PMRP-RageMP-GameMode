let CONFIG = require('./jobs/busjobconf.js').CONFIG;
let location = new mp.Vector3(CONFIG.LOCATION.x, CONFIG.LOCATION.y, CONFIG.LOCATION.z);
let player = mp.players.local;
let chat = mp.gui.chat;

// Global blip & Checkpoint
mp.blips.new(513, location, {
    name:'LS Bus Job',
    scale: 1, 
    color: 55, 
    shortRange: true
})

let busLSjobStart = mp.checkpoints.new(1, new mp.Vector3(436, -645.9, 28.7), 1, {
    direction: new mp.Vector3(0, 0, 75),
    color: [255, 255, 255, 1],
    visible: true,
    dimension: 0
});


mp.events.add("playerEnterCheckpoint", (checkpoint) => {
    if(checkpoint == busLSjobStart) {
        mp.events.callRemote('setvar', 'busLSstart', true);
    }
});

mp.events.add("playerExitCheckpoint", (checkpoint) => {
    if(checkpoint == busLSjobStart) {
        mp.events.callRemote('setvar', 'busLSstart', false);
    }
});


// Job Start on key bind.
/*
mp.keys.bind(0x45, false, function () {
    let byCheck = player.getVariable('busLSstart');
    let startedJob = player.getVariable('buslsstart');
    let istyping = player.isTypingInTextChat;
    if(startedJob == true) return;
    if(byCheck && istyping == false){
        startBusRoute();
        mp.events.callRemote('buslsstart', true);
        chat.push(`4`);
    }
})
*/
async function startBusRoute() {
    var busArray = [new mp.Vector3(457.35, -654.24, 27.85), new mp.Vector3(458.58, -648.43, 28.18), new mp.Vector3(458.76, -640.02, 28.46)];
    var ran = Math.floor(Math.floor * busArray.length);
    const busSpawn = busArray[ran];
    chat.push(`44`)
    let busJobVehicle = mp.vehicles.new(mp.game.joaat('bus'), new mp.Vector3(busSpawn), {
        heading: 216,
        dimension: player.dimension,
        numberPlate: `BUS`
    });
    mp.events.callRemote('setvar', 'busLSVehicle', busJobVehicle);
}