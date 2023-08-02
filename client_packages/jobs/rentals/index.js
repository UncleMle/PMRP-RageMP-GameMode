const red = "!{#de3333}";
const greens = "!{#78cc78}";
const greys = "!{#9e9d9d}";
const blues = "!{#6dbce6}";
const me = "!{#dc7dff}";
const whites = "!{#ffffff}";
const errors = "!{#ff322b}ERROR!{grey} :!{white}"
const staffs = "!{#ff322b}[STAFF] !{grey}:!{white} ";
const pmrps = "[ !{#ca75ff}Paramount Roleplay !{#ffffff}] ";
const gold = "!{#FFD700}";
const lpink = "!{#dcabff}";
let leftVehTimer = 200;
let car_delete_interval = null;
let left_vehicle = null;


mp.keys.bind(0x45, false, function () {
    var isbyrental = mp.players.local.getVariable('byrental')
    let istyping = mp.players.local.isTypingInTextChat;
    var spawnedRental = mp.players.local.getVariable('spawnedRental')
    var pCash = mp.players.local.getVariable('pCash');
    if(istyping) return;
    if(isbyrental && spawnedRental == null || isbyrental && spawnedRental == false) {
        if(5000 >= pCash) return mp.game.ui.notifications.showWithPicture("Bank Withdrawl", "Fleeca Bank Services", `Your have insufficient funds to purchase this! Current funds ~g~$${pCash.toLocaleString("en-US")}`, "CHAR_BANK_FLEECA", 9, false, 0, 5);
        //mp.events.callRemote('spawnrental')
        mp.events.callRemote('removePlayerCash', 5000);
        //mp.gui.chat.push(`${greens}[SUCCESS]${greys} :${whites} You have rented a dilettante from the vehicle rental service for the fee of ${greens}$5000`)
        mp.game.ui.notifications.showWithPicture("Bank Withdrawl", "Fleeca Bank Services", `A withdrawal to AMC vehicle rental services has been made for ~g~$5000~w~. Previous funds ~g~$${pCash.toLocaleString("en-US")}`, "CHAR_BANK_FLEECA", 9, false, 0, 5);
        mp.events.callRemote('rentalVehicle')
        return
    }
})

function stopRental() {
    //const veh = mp.players.local.getVariable('rentalVehicle')
    //veh.destroy();
    mp.players.local.setVariable('spawnedRental', false)
    left_vehicle = false;
    mp.events.call('notif', ['Your rental vehicle has been returned to the rental service!'])
    notifs.execute("hide();")
}


mp.events.add("playerLeaveVehicle", (vehicle, seat) => {
    const veh = mp.players.local.getVariable('rentalVehicle')
    var spawnedRental = mp.players.local.getVariable('spawnedRental')
    if (spawnedRental) {
        if (vehicle == veh) {
            left_vehicle = true;
            car_delete_interval = setInterval(() => {
                leftVehTimer--;
                if (leftVehTimer < 0) {
                    clearInterval(car_delete_interval);
                    mp.events.callRemote('deleterental');
                    stopRental();
                }
            }, 1000);
        }
    }
})

mp.events.add('return', () => {
    clearInterval(car_delete_interval);
    mp.events.callRemote('deleterental');
    stopRental();
})

mp.events.add("playerEnterVehicle", (vehicle, seat) => {
    var isbyrental = mp.players.local.getVariable('isinrental')
    const veh = mp.players.local.getVariable('rentalVehicle')
    var spawnedRental = mp.players.local.getVariable('spawnedRental')
    if (spawnedRental) {
        if (vehicle == veh) {
            notifs.execute('hide();')
            left_vehicle = false;
            leftVehTimer = 200;
            clearInterval(car_delete_interval);
        }
    }
});

/*
setInterval(function() {
    var spawnedRental = mp.players.local.getVariable('spawnedRental')
    if(left_vehicle && spawnedRental) {
        mp.game.graphics.drawText(`Get back to your rental vehicle or it will be despawned! [${leftVehTimer} Seconds]`, [0.5, 0.01], {
            font: 0,
            color: [255, 255, 255, 255],
            scale: [0.3, 0.3],
            outline: true
        });
    }
}, 1100)
*/

setInterval(() => {
    vehs = mp.players.local.getVariable('rentalVehicle');
    var spawnedRental = mp.players.local.getVariable('spawnedRental')
    if(spawnedRental) { 
        var rentalBlip = mp.blips.new(225, vehs.position, {
            name: 'Your Rental Vehicle',
            color: 22,
            scale: 0.7,
            alpha: 255,
            dimension: mp.players.local.dimension,
        });
        setTimeout(() => {
            rentalBlip.destroy();            
        }, 999);
    }

}, 1000);



let notifs = mp.browsers.new("package://browsers/infoStatic/index.html");
notifs.execute(`hide();`);
setInterval(() => {
    var spawnedRental = mp.players.local.getVariable('spawnedRental')
    if(left_vehicle && spawnedRental) {
        notifs.execute(`show();`)
        var info = `Your rental vehicle will be returned in ${leftVehTimer} seconds!`
        notifs.execute(`update("${info}");`);
    }
}, 1000);

mp.events.add('showBrowserR', () => {
    notifs.execute(`show();`)
})

mp.events.add('hideBrowserR', () => {
    notifs.execute(`hide();`)
})

mp.events.add('rentalBrowserR', (stats) => {
    notifs.execute(`update("${stats}")`);
})

