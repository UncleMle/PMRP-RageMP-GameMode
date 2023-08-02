/*
    krane#2890 for FiveM or RageMP development
*/

let CONFIG = require('./electrician/CONFIG.js').CONFIG;

let colshapes_entrances = [];
let raw_data_entrances = [];
let colshapes_exits = [];
let raw_data_exits = [];
let can_tp = true;
let timer = 0;
CONFIG.teleports.forEach((teleport) => {
    // colshape for each teleport, 5 second delay between teleports
    let colshape_entrance = mp.colshapes.newSphere(teleport[0].x, teleport[0].y, teleport[0].z, 1.5);
    let colshape_exit = mp.colshapes.newSphere(teleport[1].x, teleport[1].y, teleport[1].z, 1.5);
    colshapes_entrances.push(colshape_entrance);
    colshapes_exits.push(colshape_exit);
    raw_data_entrances.push(teleport[0]);
    raw_data_exits.push(teleport[1]);
});

mp.events.add("playerEnterColshape", (colshape) => {
    if (colshapes_entrances.includes(colshape)) {
        if (can_tp) {
            let index = colshapes_entrances.indexOf(colshape);
            let exit = raw_data_exits[index];
            mp.players.local.position = new mp.Vector3(exit.x, exit.y, exit.z);
            can_tp = false;
            timer = 3;
            let interval = setInterval(() => {
                timer--;
                if (timer < 0) {
                    clearInterval(interval);
                    can_tp = true;
                }
            }, 1000);
        }
    }
    if (colshapes_exits.includes(colshape)) {
        if (can_tp) {
            let index = colshapes_exits.indexOf(colshape);
            let entrance = raw_data_entrances[index];
            mp.players.local.position = new mp.Vector3(entrance.x, entrance.y, entrance.z);
            can_tp = false;
            timer = 3;
            let interval = setInterval(() => {
                timer--;
                if (timer < 0) {
                    clearInterval(interval);
                    can_tp = true;
                }
            }, 1000);
        }
    }
});
