var loginBrowser, banBrowser, registerBrowser, selectionBrowser, otp, selectCam, loginCam;
//const Camera = require('packages://loginHandler/camera.js');
const player = mp.players.local;

if (mp.storage.data.uuvid === undefined)
    mp.events.callRemote('uuvid:setter');


mp.events.add({
    'set:uvid': (id) => {
        mp.storage.data.uuvid = id;
    },
})

mp.events.addProc('get:uuvid', () => {
    return mp.storage.data.uuvid;
});

mp.events.add('client:loginHandler', (handle) => {
    switch (handle) {
        case 'success':
            {
                mp.events.call('client:hideLoginScreen');
                break;
            }
        case 'registered':
            {
                //mp.events.call('client:hideLoginScreen');
                //mp.events.call('character');
                break;
            }
        case 'accountNotFound':
            {
                mp.events.call('requestBrowser', `gui.notify.showNotification("Incorrect credentials", false, true, 15000, 'fa-solid fa-triangle-exclamation')`)
                break;
            }
        case 'selection':
            {
                mp.game.cam.doScreenFadeIn(5000);
                mp.events.call('requestBrowser', `gui.notify.clearAll()`)
                if(mp.cameras.exists(loginCam)) {loginCam.delete();}
                mp.players.local.position = new mp.Vector3(-38.6, -590.5, 78.8);
                mp.players.local.setAlpha(255);
                mp.players.local.freezePosition(false);
                mp.game.graphics.transitionFromBlurred(100);
                let bodyCamStart = player.position;
                let camValues = { Angle: player.getRotation(2).z + 90, Dist: 2.6, Height: 0.2 };
                let pos = getCameraOffset(new mp.Vector3(bodyCamStart.x, bodyCamStart.y, bodyCamStart.z + camValues.Height), camValues.Angle, camValues.Dist);
                selectCam = new Camera('selectCam', new mp.Vector3(pos.x, pos.y, pos.z), bodyCamStart);
                mp.game.cam.renderScriptCams(true, false, 0, true, false);
                mp.events.call('requestRoute', 'charselect', true, true);
                break;
            }
        case 'creation':
            {
                mp.events.call('requestBrowser', `gui.notify.clearAll()`)
                if(mp.cameras.exists(loginCam)) {loginCam.delete();}
                mp.players.local.position = new mp.Vector3(-38.6, -590.5, 78.8);
                mp.players.local.setAlpha(255);
                mp.players.local.freezePosition(false);
                mp.game.graphics.transitionFromBlurred(100);
                let bodyCamStart = player.position;
                let camValues = { Angle: player.getRotation(2).z + 90, Dist: 2.6, Height: 0.2 };
                let pos = getCameraOffset(new mp.Vector3(bodyCamStart.x, bodyCamStart.y, bodyCamStart.z + camValues.Height), camValues.Angle, camValues.Dist);
                selectCam = new Camera('selectCam', new mp.Vector3(pos.x, pos.y, pos.z), bodyCamStart);
                mp.game.cam.renderScriptCams(true, false, 0, true, false);
                mp.events.call('requestRoute', 'creation', true, true);
                break;
            }
        case 'alreadyAccount':
            {
                mp.events.call('requestBrowser', `gui.notify.showNotification("Incorrect credentials", false, true, 15000, 'fa-solid fa-triangle-exclamation')`)
                break;
            }
        case 'taken':
            {
                mp.events.call('requestBrowser', `gui.notify.showNotification("Incorrect credentials", false, true, 15000, 'fa-solid fa-triangle-exclamation')`)
                break;
            }
        case 'invalidEmail':
            {
                mp.events.call('requestBrowser', `gui.notify.showNotification("Incorrect credentials", false, true, 15000, 'fa-solid fa-triangle-exclamation')`)

                break
            }
        case 'incorrectinfo':
            {
                mp.events.call('requestBrowser', `gui.notify.showNotification("Incorrect credentials", false, true, 15000, 'fa-solid fa-triangle-exclamation')`)

                break;
            }
        case 'takeninfo':
            {
                if(!mp.browsers.exists(loginBrowser)) {return;}
                loginBrowser.execute(`$('.taken-info').show(); $('#registerBtn').show();`);
                break;
            }
        case 'tooshort':
            {
                if(!mp.browsers.exists(loginBrowser)) {return;}
                loginBrowser.execute(`$('.short-info').show(); $('#registerBtn').show();`);
                break;
            }
        case 'otp:start':
            {
                mp.events.call('requestRoute', 'otp', true, true);
            }
        case 'logged':
            {
                mp.events.call('requestBrowser', [`gui.notify.showNotification("Incorrect credentials", false, true, 15000, 'fa-solid fa-triangle-exclamation')`])

                break;
            }
        case 'invalid-info':
            {
                mp.events.call('requestBrowser', [`gui.notify.showNotification("Incorrect credentials", false, true, 15000, 'fa-solid fa-triangle-exclamation')`])

                break;
            }
        case 'banned':
            {
                if(mp.cameras.exists(loginCam)) {loginCam.delete();};
                mp.events.call('client:enableLoginCamera')
                mp.gui.cursor.show(true, true);
                break;
            }
        default:
            {
                break;
            }
    }
});

mp.events.add({
    'client:registerData': (username, email, ref, password) => {
        mp.events.callRemote("server:registerAccount", username, email, ref, password);
    },
    'client:loginData': (autoLog, username, password) => {
        mp.events.callRemote("server:loginAccount", autoLog, username, password);
    },
    'client:otpData': (otp) => {
        mp.events.callRemote('server:registerOtp', otp);
    },
    'entity:Invis': (targetEntity) => {
        targetEntity.position = new mp.Vector3(-38.6, -510.5, 78.8);
    },
    'client:enableLoginCamera': () => {
        loginCam = new Camera('loginCam', new mp.Vector3(-79.9, -1079.5, 310.2), new mp.Vector3(-74.8, -819.2, 326.2));
        loginCam.startMoving(7100.0);
        loginCam.setActive(true);
        mp.players.local.position = new mp.Vector3(-811.6, 174.9, 76.8);
        mp.players.local.freezePosition(true);
        mp.players.local.setAlpha(0);
        mp.game.cam.renderScriptCams(true, false, 0, true, false);
        mp.game.graphics.transitionToBlurred(100);

    },
    'chatstop': () => {
        setTimeout(() => {
        }, 3000);
    },
    'client:disableLoginCamera': () => {
        if(mp.cameras.exists(loginCam)) {loginCam.delete();}
        mp.players.local.setAlpha(255);
        mp.game.cam.renderScriptCams(false, false, 0, false, false);
        mp.players.local.freezePosition(false);
        mp.game.graphics.transitionFromBlurred(100);
        /*
        setTimeout(() => {
            mp.discord.update(`Playing on Paramount Roleplay`, `Playing as ${mp.players.local.nickName} [${mp.players.local.remoteId}]`)
        }, 3000);
        */
    },
    'client:hideLoginScreen': () => {
        mp.events.call('requestRoute', '/', true, false);
        mp.players.local.setAlpha(255);
        mp.players.local.freezePosition(false);
        mp.game.ui.setMinimapVisible(false);
        mp.gui.cursor.show(false, false);
        mp.game.ui.displayRadar(true);
        mp.events.call("client:disableLoginCamera");
    },
    'client:banscreen': () => {
        loginBrowser = mp.browsers.new('package://browsers/login/ban.html');
        mp.players.local.freezePosition(true);
        mp.game.ui.setMinimapVisible(true);
        ;
        setTimeout(() => { mp.gui.cursor.show(true, true); }, 500);
        mp.game.ui.displayRadar(false);
    },
    'hudShow': () => {
        mp.game.ui.displayRadar(true);
    },
    'hudHide': () => {
        mp.game.ui.displayRadar(false);
    },
    'client:showLoginScreen': () => {
        mp.events.call('requestRoute', 'login', true, true);
        mp.players.local.freezePosition(true);
        mp.game.ui.setMinimapVisible(true);
        mp.players.local.position = new mp.Vector3(-4076.5, 818, 8.4);
        ;
        mp.players.local.setAlpha(0);
        setTimeout(() => { mp.gui.cursor.show(true, true); }, 500);
        mp.game.ui.displayRadar(false);
        mp.events.call('client:enableLoginCamera');
    },
    'sel': () => {
        if(mp.browsers.exists(loginBrowser)) {loginBrowser.destroy();};
        if(mp.browsers.exists(registerBrowser)) {registerBrowser.destroy();};
        selectionBrowser = mp.browsers.new('package://browsers/characterSelection/index.html');
    },
    'client:Cname': (cname) => {
        mp.events.callRemote('setcname', cname);
    }

});


const CLEAR_FOCUS = "0x31B73D1EA9F01DA2";

class Camera {
    static Current_Cam = null;

    constructor(identifier, position, pointAtCoord) {
        this.identifier = identifier;
        this.position = position;
        this.pointAtCoord = pointAtCoord;
        this.camera = null;
        this.isMoving = false;
        this.range = 220;
        this.speed = 1.4;
        this.create();
        Camera.Current_Cam = this;
    }

    create() {
        if(Camera.Current_Cam !== null && mp.cameras.exists(this.camera)) {
            camera.delete();
        }
        this.camera = mp.cameras.new(this.identifier, this.position, new mp.Vector3(0, 0, 0), 40);
        this.camera.pointAtCoord(this.pointAtCoord.x, this.pointAtCoord.y, this.pointAtCoord.z);
        this.camera.setMotionBlurStrength(1000);
        this.setActive();
    }

    setActive() {
        this.camera.setActive(true);
        mp.game.cam.renderScriptCams(true, false, 0, false, false);
        mp.game.streaming.setFocusArea(this.position.x, this.position.y, this.position.z, 0, 0, 0);
    }

    startMoving(range) {
        this.isMoving = true;
        this.range = range;
    }

    stopMoving() {
        this.isMoving = false;
        this.range = 0.0;
    }

    delete() {
        this.camera.destroy();
        mp.game.cam.renderScriptCams(false, false, 0, false, false);
        mp.game.invoke(CLEAR_FOCUS);
        Camera.Current_Cam = null;
    }
}

mp.events.add('render', () => {
    const time = mp.game.invoke("0xE625BEABBAFFDAB9");
    if (time !== 0 && cutsceneEnded == false) {

        if (time > 12000 && time < 22000 && CharacterName !== false) {
            mp.game.graphics.drawText("We hope you enjoy your stay ~o~" + CharacterName, [0.19895833730697632, 0.1657407432794571], {

                font: 1,

                color: [255, 255, 255, 255],

                scale: [1.0, 1.0],

                outline: true

            });
            mp.game.graphics.drawText("Welcome to ~g~" + ServerName, [0.20208333432674408, 0.09351851791143417], {

                font: 1,

                color: [255, 255, 255, 255],

                scale: [1, 1],

                outline: true

            });
        }

        if (time > 26000) {
            cutsceneEnded = true;
            mp.events.call("doneCutscene");
        }
    }
    if(!mp.players.local.getVariable('loggedIn')) {
        mp.game.controls.disableAllControlActions(1);
        mp.game.controls.disableAllControlActions(2);
        mp.players.local.freezePosition(true);
    }
    if(Camera.Current_Cam === null || !Camera.Current_Cam.isMoving) return;
    let position = Camera.Current_Cam.camera.getCoord();

    Camera.Current_Cam.camera.setCoord(position.x + Camera.Current_Cam.speed, position.y, position.z);

    if(position.x + Camera.Current_Cam.speed >= Camera.Current_Cam.position.x + (Camera.Current_Cam.range/2)
        || position.x + Camera.Current_Cam.speed <= Camera.Current_Cam.position.x - (Camera.Current_Cam.range/2)) {

            Camera.Current_Cam.speed *= -1;
    }
})

exports = Camera;

const Natives = {
    SWITCH_OUT_PLAYER: '0xAAB3200ED59016BC',
    SWITCH_IN_PLAYER: '0xD8295AF639FD9CB8',
    IS_PLAYER_SWITCH_IN_PROGRESS: '0xD9D2CFFF49FAB35F'
};
let gui;

mp.events.add('moveSkyCamera', moveFromToAir);

function moveFromToAir(player, moveTo, switchType, showGui) {

   switch (moveTo) {
       case 'up':
            if (showGui == false) {
                gui = 'false';
            };
            mp.game.invoke(Natives.SWITCH_OUT_PLAYER, player.handle, 0, parseInt(switchType));
           break;
       case 'down':
            if (gui == 'false') {
                checkCamInAir();
                ;
            };
            mp.game.invoke(Natives.SWITCH_IN_PLAYER, player.handle);
           break;

       default:
           break;
   }
}

// Checks whether the camera is in the air. If so, then reset the timer
function checkCamInAir() {
    if (mp.game.invoke(Natives.IS_PLAYER_SWITCH_IN_PROGRESS)) {
        mp.players.local.canTogHud = true;
        setTimeout(() => {
            checkCamInAir();
        }, 400);
    } else {
        mp.events.callRemote('welcomeStart', mp.players.local);
        mp.game.ui.displayRadar(true);
        mp.players.local.hasHud = true;
        mp.events.call('requestBrowser', `appSys.commit('showHud', true)`);
        mp.events.call('requestBrowser', `appSys.commit('chatActive', true)`)
        mp.events.call('unfreezePlayer');
        mp.players.local.canTogHud = null;
        gui = 'true';
    }
}

getCameraOffset = (pos, angle, dist) => {
    angle = angle * 0.0174533;
    pos.y = pos.y + dist * Math.sin(angle);
    pos.x = pos.x + dist * Math.cos(angle);
    return pos;
}