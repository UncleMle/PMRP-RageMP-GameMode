let player = mp.players.local;
var hudToggle = true;
let hud, hud2, notif, page, adminReports, vmenu, vue, truckerNotif, progressBrowser, phone, listMenu , characterCreation, characterSelection;
let getStreet;
let street = null;
let streetName;
let crossingName;
let zoneName;
let direction;
let IdleDate = new Date();

/*
// Notifications NATIVES
const Natives = {
    IS_RADAR_HIDDEN: "0x157F93B036700462",
    IS_RADAR_ENABLED: "0xAF754F20EB5CD51A",
    SET_TEXT_OUTLINE: "0x2513DFB0FB8400FE"
};
const allBrowsers = {
    hud: hud,
    hud2: hud2,
}
const MINIMAP = mp.game.graphics.requestScaleformMovie('MINIMAP');
const _SET_NOTIFICATION_COLOR_NEXT = "0x39BBF623FC803EAC";
const _SET_NOTIFICATION_BACKGROUND_COLOR = "0x92F0DA1E27DB96DC";
const maxStringLength = 99;

// Compass Script for HUD
setInterval(() => {

    const position = mp.players.local.position;
    let getStreet = mp.game.pathfind.getStreetNameAtCoord(position.x, position.y, position.z, 0, 0);
    zoneName = mp.game.ui.getLabelText(mp.game.zone.getNameOfZone(position.x, position.y, position.z));
    streetName = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName);
    //if (getStreet.crossingRoad && getStreet.crossingRoad != getStreet.streetName) streetName += ` / ${mp.game.ui.getStreetNameFromHashKey(getStreet.crossingRoad)}`;

    //mp.gui.chat.push(`${zoneName} ${streetName} ${getStreet} `)
/*
    getStreet = mp.game.pathfind.getStreetNameAtCoord(player.position.x, player.position.y, player.position.z, 0, 0);
    // Returns obj {"streetName": hash, crossingRoad: hash}

    streetName = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName);
    crossingName = mp.game.ui.getStreetNameFromHashKey(getStreet.crossingRoad);
    // Returns string, if exist

    zoneName = mp.game.gxt.get(mp.game.zone.getNameOfZone(player.position.x, player.position.y, player.position.z));



    let heading = player.getHeading();
    if(player.heading != 0)
    {
        if(heading < 45 || heading > 315)
        {
            direction = "N";
        }
        if(heading > 45 && heading < 135)
        {
            direction = "W";
        }
        if(heading > 135 && heading < 225)
        {
            direction = "S";
        }
        if(heading > 225 && heading < 315)
        {
            direction = "E";
        }
    }
}, 10);

let lastFrameCount = getFrameCount();
let fps = 0;

setInterval(() => {
    fps = getFrameCount() - lastFrameCount;
    lastFrameCount = getFrameCount();
}, 1000);

function getFps() {
    return fps;
}

function getFrameCount() {
    return mp.game.invoke('0xFC8202EFC642E6F2')
}

mp.events.add({
    'showLocation': () => {
        if(mp.browsers.exists(street)) return street.destroy();
        street = mp.browsers.new("package://browsers/hud/index.html");
    },
    'location:hide': () => {
        if(mp.browsers.exists(street)) {street.destroy();}
    },
    'hud:On': () => {
        if(mp.browsers.exists(hud2)) {hud2.destroy();};
        if(mp.browsers.exists(hud)) {hud.destroy();};
        if(mp.browsers.exists(street)) {street.destroy();};
        street = mp.browsers.new("package://browsers/hud/index.html");
        hud2 = mp.browsers.new("package://browsers/hud/bars.html")
        hud = mp.browsers.new("package://browsers/headimg/popup.html")
        mp.events.call('speedo:show');
        mp.events.call('chatOn');
        mp.game.ui.displayRadar(true);
    },
    'hud:Off': () => {
        if(mp.browsers.exists(hud2)) {hud2.destroy();};
        if(mp.browsers.exists(hud)) {hud.destroy();};
        if(mp.browsers.exists(street)) {street.destroy();};
        mp.events.call('speedo:hide');
        mp.events.call('chatOff');
        mp.game.ui.displayRadar(false);
    },
    'trucker:startUI': () => {
        if(mp.browsers.exists(truckerNotif)) return truckerNotif.destroy();
        truckerNotif = mp.browsers.new('package://browsers/trucker/index.html');
        mp.gui.cursor.show(true, true);
    },
    'trucker:stopUI': () => {
        if(mp.browsers.exists(truckerNotif)) {
            truckerNotif.execute(`hide();`);
            setTimeout(() => {
                truckerNotif.destroy();
            }, 600);
        }
    },
    'playerBrowser:destroy': () => {
        if(mp.browsers.exists(listMenu)) {listMenu.destroy();}
        mp.events.call('chat:active', true)
    },
    'stats:destroy': () => {
        if(mp.browsers.exists(page)) {page.destroy();}
        mp.events.call('chat:active', true)
    },
    'client:adminSystem': () => {
        if(mp.browsers.exists(adminReports)) {return;};
        if(mp.browsers.exists(page)) {return;};
        if(mp.browsers.exists(listMenu)) {listMenu.destroy();};
        mp.events.call('chat:active', false)
        adminReports = mp.browsers.new('package://browsers/adminSystem/index.html');
        mp.events.call('cursor:Show');
    },
    'add:report': (accepted, rank, rid, id, type, desc) => {
        if(mp.browsers.exists(adminReports)) {
            switch(rank) {
                case 1:
                    {
                        adminReports.execute(`addReportSupport(${accepted}, ${rid}, ${id}, '${type}', '${desc}');`);
                        break;
                    }
                case 2:
                    {
                        adminReports.execute(`addReportMod(${accepted}, ${rid}, ${id}, '${type}', '${desc}');`);
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
        }
    },
    'report:sync': () => {
        // When admin makes action this is called from server (Clears table & inserts new reports) | NEEDs optimization
        if(mp.browsers.exists(adminReports)) {
            adminReports.execute(`clear();`);
            mp.events.callRemote('staff:reports');
        }
    },
    'adminSystem:destroy': () => {
        if(mp.browsers.exists(adminReports)) {adminReports.destroy()}
        mp.events.call('chat:active', true)
    },
    'sendAdmin': (id, status) => {
        mp.events.callRemote('sendReport', id, status);
    },
    'characterCreation:Hide': () => {
        characterCreation = mp.browsers.new('package://characterCreator/html/index.html');
    },
    'stats:Page': () => {
        if(mp.browsers.exists(adminReports)) {return;};
        if(mp.browsers.exists(page)) {return;};
        if(mp.browsers.exists(listMenu)) {listMenu.destroy()};
        mp.gui.cursor.show(true, true);
        mp.events.call('chat:active', false)
        page = mp.browsers.new('package://browsers/page/stats.html');
        mp.events.add('stats:insert', (cname, id, bank, cash, credits, phone, job, time, salary, debt, vehicle, char, house) => {
            page.execute(`update("${cname}", "${id}", "${bank}", "${cash}", "${credits}", "${phone}", "${job}", "${time}", "${salary}", "${debt}", "${vehicle}", "${char}", "${house}");`);
        })
    },
    'parkingList:add': (count, amount, id, name, lastActive) => {
        if(mp.browsers.exists(listMenu)) {
            var vehicleName = mp.game.ui.getLabelText(mp.game.vehicle.getDisplayNameFromVehicleModel(lastActive));
            listMenu.execute(`addVehicle(${count}, ${amount}, ${id}, '${name}', '${vehicleName}');`);
        }
    },
    'helpMenu:add': (count, command) => {
        if(mp.browsers.exists(listMenu)) {
            listMenu.execute(`addList(${count}, '${command}')`)
        }
    },
    'insuranceList:add': (count, amount, id, name, lastActive) => {
        if(mp.browsers.exists(listMenu)) {
            var vehicleName = mp.game.ui.getLabelText(mp.game.vehicle.getDisplayNameFromVehicleModel(lastActive));
            listMenu.execute(`addInsurance(${count}, ${amount}, ${id}, '${name}', '${vehicleName}');`);
        }
    },
    'listMenu:show': () => {
        if(mp.browsers.exists(page)) {return;}
        if(mp.browsers.exists(adminReports)) {return;};
        if(mp.browsers.exists(listMenu)) {return};
        mp.gui.cursor.show(true, true);
        mp.events.call('chat:active', false)
        listMenu = mp.browsers.new('package://browsers/listMenu/index.html')
    },
    'listMenu:addSpec': (count, name, id) => {
        if(mp.browsers.exists(listMenu)) {
            listMenu.execute(`sMenu(${count}, '${name}', ${id})`);
        }
    },
    'vmenu:destroy': () => {
        if(mp.browsers.exists(vmenu)) {
            vmenu.destroy();
            mp.gui.chat.show(true);
        }
    },
    'vmenu:addVeh': (id, name) => {
        if(mp.browsers.exists(vmenu)) {
            var vehicleName = mp.game.ui.getLabelText(mp.game.vehicle.getDisplayNameFromVehicleModel(name));
            vmenu.execute(`addVehicle(${id}, '${vehicleName}')`)
        }
    },
    'vmenu:show': () => {
        if(mp.browsers.exists(page)) {return;}
        if(mp.browsers.exists(adminReports)) {return;};
        if(mp.browsers.exists(listMenu)) {return};
        mp.gui.cursor.show(true, true);
        mp.gui.chat.show(false);
        vmenu = mp.browsers.new('package://browsers/vmenu/index.html')
    },
    'getVehicle': (id, handle) => {
        switch(handle) {
            case 'unpark':
                {
                    mp.events.callRemote('unparkVehicle', id);
                    break;
                }
            case 'insurance':
                {
                    mp.events.callRemote('getVFromInsurance', id);
                    break;
                }
            default:
                break;
        }
    },
    'player:add': (num, count, id, ping) => {
        if(mp.browsers.exists(listMenu)) {
            listMenu.execute(`add(${num}, ${count}, "${id}", "${ping}")`);
        }
    },
    'staff:count': () => {
        if(mp.browsers.exists(page)) {return;}
        if(mp.browsers.exists(adminReports)) {return;};
        if(mp.browsers.exists(listMenu)) {return};
        mp.gui.cursor.show(true, true);
        mp.events.call('chat:active', false)
        listMenu = mp.browsers.new('package://browsers/listMenu/index.html');
    },
    'staff:add': (num, name, aduty, ping) => {
        if(mp.browsers.exists(listMenu)) {
            mp.gui.cursor.show(true, true);
            listMenu.execute(`staff("${num}", "${name}", ${aduty}, "${ping}");`);
        }
    },
    'cursor:Show': () => {
        mp.gui.cursor.show(true, true);
    },
    'cursor:Hide': () => {
        mp.gui.cursor.show(false, false);
    },
    'sound': () => {
        //mp.game.audio.playSoundFrontend(-1, "Beep_Red", "DLC_HEIST_HACKING_SNAKE_SOUNDS", true);
        mp.game.audio.playSoundFrontend(-1, "Menu_Accept", "Phone_SoundSet_Default", true);
        //mp.game.audio.playSoundFrontend(-1, "ERROR", "HUD_AMMO_SHOP_SOUNDSET", true);
        //mp.game.audio.playSoundFrontend(-1, "FAMILY_1_CAR_BREAKDOWN", "FAMILY_1_CAR_BREAKDOWN_ADDITIONAL", true);
    },
    'playSound': (var1, var2) => {
        mp.game.audio.playSoundFrontend(-1, `${var1}`, `${var2}`, true);
    },
    'notifs': (info) => {
        if(mp.browsers.exists(notif)) {notif.destroy();};
        notif = mp.browsers.new("package://browsers/info/index.html");
        notif.execute(`update("${info}");`);
        //mp.game.audio.playSoundFrontend(-1, "Beep_Red", "DLC_HEIST_HACKING_SNAKE_SOUNDS", true);
        mp.events.call('sound');
    },
    'render': () => {
        // Input values into bars HUD.
        // Remove default gta hp / armour + street / area on HUD
        mp.game.ui.hideHudComponentThisFrame(20); // weapon stats
        mp.game.ui.hideHudComponentThisFrame(3); // cash
        mp.game.ui.hideHudComponentThisFrame(2); // weapon icon
        mp.game.ui.hideHudComponentThisFrame(8); // Vehicle class
        mp.game.ui.hideHudComponentThisFrame(6); // Vehicle Name
        mp.game.ui.hideHudComponentThisFrame(7); // area name
        mp.game.ui.hideHudComponentThisFrame(9); // street name
        mp.game.ui.setRadarZoom(1100);
        mp.game.graphics.pushScaleformMovieFunction(MINIMAP, "SETUP_HEALTH_ARMOUR");
        mp.game.graphics.pushScaleformMovieFunctionParameterInt(3);
        mp.game.graphics.popScaleformMovieFunctionVoid();
        mp.game.graphics.disableVehicleDistantlights(true);
        // --
        if (mp.game.invoke(Natives.IS_RADAR_ENABLED) && !mp.game.invoke(Natives.IS_RADAR_HIDDEN)) {
            if(mp.browsers.exists(street) == false) return;
            if(street == null) return;
            let crossing;
            //if(crossingName != "") { crossing = `/ ${crossingName}`; } else { crossing = ""; }
            var unix = `${mp.players.local.getVariable('sid')} | ${Math.floor(new Date().getTime() / 1000)} | FPS ${getFps()} | PLAYERS ${mp.players.length}`;
            //street.execute(`update('${streetName}', '${mp.players.local.getVariable('voipLvl')}', '${crossing}', '${zoneName}', '${direction}', '${unix}');`);
            //update('${streetName}', '20', '${crossing}', '${zoneName}', '${direction}', '${unx}');
            street.execute(`update('${streetName}', '${mp.players.local.getVariable('voipLvl')}', '', '${zoneName}', '${direction}', '${unix}');`);
        }
        if(mp.browsers.exists(hud2)) {
            var currentHealth = mp.players.local.getHealth();
            var currentArmour = mp.players.local.getArmour();
            var currentThirst = mp.players.local.getVariable('thirstAmount');
            var currentHunger = mp.players.local.getVariable('hungerAmount');
            hud2.execute(`update(${currentHealth}, ${currentArmour}, ${parseInt(currentThirst)}, ${parseInt(currentHunger)});`);
        }
        // Remove AFK camera
        const dif = new Date().getTime() - IdleDate.getTime();
        const seconds = dif / 1000;

        if (Math.abs(seconds) > 29.5) {
            mp.game.invoke(`0xF4F2C0D4EE209E20`); //Clear Idle Timer
            IdleDate = new Date();
        }

        if(!mp.voiceChat.muted && mp.browsers.exists((hud2))) {
            hud2.execute(`voiceActive();`)
        }
        else {
            if(!mp.browsers.exists(hud2)) return
            hud2.execute(`voiceHide();`);
        }
    },
    'show:populatedArea': () => {
        if(mp.browsers.exists(street)) {
            street.execute(`showpa();`);
        }
    },
    'hide:populatedArea': () => {
        if(mp.browsers.exists(street)) {
            street.execute(`hidepa();`);
        }
    },
    'loadChar': (cname) => {
        mp.events.callRemote('load:character', cname);
    },
    'console': (info) => {
        mp.events.callRemote('console', [info])
    },
    'chat:On': () => {
        mp.gui.chat.show(true);
    },
    'chat:Off': () => {
        mp.gui.chat.show(false);
    },
    'BN_Show': (message, flashing = false, textColor = -1, bgColor = -1, flashColor = [77, 77, 77, 200]) => {
        if (textColor > -1) mp.game.invoke(_SET_NOTIFICATION_COLOR_NEXT, textColor);
        if (bgColor > -1) mp.game.invoke(_SET_NOTIFICATION_BACKGROUND_COLOR, bgColor);
        if (flashing) mp.game.ui.setNotificationFlashColor(flashColor[0], flashColor[1], flashColor[2], flashColor[3]);

        mp.game.ui.setNotificationTextEntry("CELL_EMAIL_BCON");
        for (let i = 0, msgLen = message.length; i < msgLen; i += maxStringLength) mp.game.ui.addTextComponentSubstringPlayerName(message.substr(i, Math.min(maxStringLength, message.length - i)));
        mp.game.ui.drawNotification(flashing, true);
    },
    'BN_ShowWithPicture': (title, sender, message, notifPic, icon = 0, flashing = false, textColor = -1, bgColor = -1, flashColor = [77, 77, 77, 200]) => {
        if (textColor > -1) mp.game.invoke(_SET_NOTIFICATION_COLOR_NEXT, textColor);
        if (bgColor > -1) mp.game.invoke(_SET_NOTIFICATION_BACKGROUND_COLOR, bgColor);
        if (flashing) mp.game.ui.setNotificationFlashColor(flashColor[0], flashColor[1], flashColor[2], flashColor[3]);

        mp.game.ui.setNotificationTextEntry("CELL_EMAIL_BCON");
        for (let i = 0, msgLen = message.length; i < msgLen; i += maxStringLength) mp.game.ui.addTextComponentSubstringPlayerName(message.substr(i, Math.min(maxStringLength, message.length - i)));
        mp.game.ui.setNotificationMessage(notifPic, notifPic, flashing, icon, title, sender);
        mp.game.ui.drawNotification(false, true);
    },
    'progress:start': (time, task, direction, event, params) => {
        if (progressBrowser == null) {
            progressBrowser = mp.browsers.new("package://browsers/progress/progress.html");
            progressBrowser.execute(`runBar('${time}','${task}','${direction}','${event}','${params}');`);
        } else {
            // handler ()
        }
    },
    'progress:end': (direction, event, params) => {
        if(mp.browsers.exists(progressBrowser)) {progressBrowser.destroy();}
        progressBrowser = null;
        if (direction === 'server') {
            mp.events.callRemote(event, params);
        } else {
            mp.events.call(event, params);
        }
    },
    'listMenu:spec': (id) => {
        mp.events.callRemote('spectate', id);
    },
    'hudAccessOff': () => {
        hudToggle = false;
    },
    'hudAccessOn': () => {
        hudToggle = true;
    }
})

mp.game.ui.notifications = {
    show: (message, flashing = false, textColor = -1, bgColor = -1, flashColor = [77, 77, 77, 200]) => mp.events.call("BN_Show", message, flashing, textColor, bgColor, flashColor),
    showWithPicture: (title, sender, message, notifPic, icon = 0, flashing = false, textColor = -1, bgColor = -1, flashColor = [77, 77, 77, 200]) => mp.events.call("BN_ShowWithPicture", title, sender, message, notifPic, icon, flashing, textColor, bgColor, flashColor)
};

// Toggle Hud Script
let pressed = false;
mp.keys.bind(0x72, false, function () {
    if(hudToggle === false) {return;}
    if(mp.players.local.getVariable('accessHud') == false) {return;}
    if(mp.browsers.exists(page)) {return;}
    if(mp.browsers.exists(adminReports)) {return;};
    if(mp.browsers.exists(listMenu)) {return};
    if(mp.browsers.exists(vmenu)) {return;}
    if(mp.game.ui.isPauseMenuActive()) {return;}
    let islogged = mp.players.local.getVariable('loggedIn');
    let istyping = mp.players.local.isTypingInTextChat;
    pressed = !pressed
    if(pressed && islogged && !istyping) {
        mp.events.call('hud:Off');
        mp.events.call('tagSt', false)
        mp.events.call('adminTags', false)
        mp.players.local.hasHud = false;
        if(mp.players.local.getVariable('injured') == true) {
            mp.events.call('stopInjuredMessage');
        }
    }
    else {
        if(!islogged && !istyping) return;
        mp.events.call('hud:On');
        mp.events.call('tagSt', true)
        mp.events.call('adminTags', true)
        mp.players.local.hasHud = true;
        if(mp.players.local.getVariable('injured') == true) {
            mp.events.call('showInjuredMessage');
        }
    }
})
// Toggle Cursor script
let f2Press = false;
mp.keys.bind(0x71, false, function() {
    let istyping = mp.players.local.isTypingInTextChat;
    var islogged = mp.players.local.getVariable('loggedIn')
    f2Press = !f2Press;
    if(istyping || !islogged) return
    if(f2Press && !mp.game.ui.isPauseMenuActive()) {
        mp.gui.cursor.show(true, true);
    }
    else {
        mp.gui.cursor.show(false, false);
    }
})

// Admin Reports
mp.keys.bind(120, false, function() {
    let istyping = mp.players.local.isTypingInTextChat;
    let islogged = mp.players.local.getVariable('loggedIn');
    if(islogged && !istyping && !mp.browsers.exists(adminReports) && !mp.game.ui.isPauseMenuActive()) {
        mp.events.callRemote('staff:reports');
    }
})

mp.keys.bind(89, false, function () { // Y key
    if(mp.game.ui.isPauseMenuActive()) return;
    let istyping = mp.players.local.isTypingInTextChat;
    let islogged = mp.players.local.getVariable('loggedIn');
    if(istyping || mp.browsers.exists(listMenu) || mp.browsers.exists(vmenu)) return
    if(islogged && !istyping && mp.players.local.getVariable('parkingUI') && !mp.browsers.exists(listMenu)) {
        mp.events.callRemote('getParkedVehicles', mp.players.local);
        return;
    }
    if(islogged && !istyping && mp.players.local.getVariable('morsUI') && !mp.browsers.exists(listMenu)) {
        mp.events.callRemote('getInsurancesVehs', mp.players.local);
        return;
    }
})
*/