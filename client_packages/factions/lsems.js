

let pressed = false;
mp.keys.bind(0x45, false, function () {
    vehicle.setEngineOn(true, true, true);
    pressed = !pressed;
    var isbyfpark = mp.players.local.getVariable('isinpdfpark');
    if(isbyfpark && pressed) {
        mp.browsers.new("package://browsers/vehSpawn/index.html");
        mp.game.ui.setMinimapVisible(true);
        mp.gui.chat.activate(false);
        mp.gui.chat.show(false);
        setTimeout(() => { mp.gui.cursor.show(true, true); }, 500);
        mp.game.ui.displayRadar(false);
    }
    if(isbyfpark == false) {
        mp.game.ui.setMinimapVisible(false);
        mp.gui.chat.activate(true);
        mp.gui.chat.show(true);
        setTimeout(() => { mp.gui.cursor.show(false, false); }, 500);
        mp.game.ui.displayRadar(true);
    }
})

let siren = false
let localPlayer = mp.players.local;

mp.keys.bind(0x51, true, _ => {
    if (localPlayer.vehicle && localPlayer.vehicle.getPedInSeat(-1) === localPlayer.handle && localPlayer.vehicle.getClass() === 18) {
        localPlayer.vehicle.getVariable('silentMode');
        mp.events.callRemote('syncSirens', localPlayer.vehicle)
    }
});

mp.events.add('entityStreamIn', (entity) => {
    if (entity.type === 'vehicle' && entity.getClass() === 18 && entity.hasVariable('silentMode')) entity.getVariable('silentMode') ? entity.setSirenSound(true) : entity.setSirenSound(false);

});

mp.events.addDataHandler("silentMode", (entity, value) => {
    if (entity.type === "vehicle") entity.setSirenSound(value);
});

mp.events.add('client:spawnVeh', (vehName) => {
    mp.events.callRemote("server:spawnVeh", vehName);
});

// Browsers

let notifs = mp.browsers.new("package://browsers/infoStatic/index.html");
notifs.execute(`hide();`);

mp.events.add('showBrowserPD', () => {
    notifs.execute(`show();`)
})

mp.events.add('hideBrowserPD', () => {
    notifs.execute(`hide();`)
})

mp.events.add('staticBrowserPD', (stats) => {
    notifs.execute(`update("${stats}")`);
})