const player = mp.players.local;

if(mp.storage.data.phoneSettings == null) {
    mp.storage.data.phoneSettings = {
        silentMode: false,
        wallpaper: '',
        lightMode: false
    }
}

mp.events.call('requestBrowser', `appSys.commit('setSettingsData', {
    silentMode: ${mp.storage.data.phoneSettings.silentMode},
    wallpaper: "${mp.storage.data.phoneSettings.wallpaper}",
    lightMode: ${mp.storage.data.phoneSettings.lightMode}
})`);

const keys = {
    ALT: 19,
    wheelDown: 14,
    wheelUp: 15,
    SPACE: 22
}

var keyVals = {
    ALT: false,
    wheelUp: false,
    wheelDown: false,
    SPACE: false
}

class playerPhone {
    constructor() {
        mp.events.add({
            'render': () => {
                if(!player.getVariable('serverTime') || !player.getVariable('loggedIn')) return;
                mp.events.call('requestBrowser', `appSys.commit('setPhoneData', {
                    time: '${player.getVariable('serverTime')}',
                    cursor: ${mp.gui.cursor.visible},
                    battery: ${player.getVariable('phoneBattery')}
                });`);

                keyVals.ALT = mp.game.controls.isControlPressed(0, keys.ALT);
                keyVals.wheelUp = mp.game.controls.isControlPressed(0, keys.wheelUp);
                keyVals.wheelDown = mp.game.controls.isControlPressed(0, keys.wheelDown);
                keyVals.SPACE = mp.game.controls.isControlPressed(0, keys.SPACE);

                if(keyVals.ALT && (keyVals.wheelDown || keyVals.wheelUp)) {
                    mp.game.ui.weaponWheelIgnoreSelection();
                    mp.game.controls.disableControlAction(0, 37, true);
                }

                mp.events.call('requestBrowser', `appSys.commit('setPhoneKeys', {
                    alt: ${keyVals.ALT},
                    wheelUp: ${keyVals.wheelUp},
                    wheelDown: ${keyVals.wheelDown},
                    space: ${keyVals.SPACE},
                    staff: ${player.getVariable('adminLevel')}
                })`);
            },
            'equipPhone': (tog) => {
                if(tog) {
                    mp.events.callRemote('phoneAnim', true);
                } else {
                    mp.events.callRemote('phoneAnim', null);
                }
            },
            'setPhoneSetting': (prop, value) => {
                mp.storage.data.phoneSettings[prop] = value;
            },
            'entityStreamIn': (entity) => {
                if(entity.getVariable('phoneAnim') && entity.type == 'player') {
                    mp.game.streaming.requestAnimDict("cellphone@");

                    entity.mobilePhone = mp.objects.new('p_amb_phone_01', entity.position, {
                        rotation: new mp.Vector3(0, 0, 0),
                        alpha: 255,
                        dimension: entity.dimension
                    });

                    setTimeout(() => {
                        var pos = new mp.Vector3(0.1500, 0.02, -0.02);
                        var rot = new mp.Vector3(71, 96.0, 169);

                        entity.taskPlayAnim("cellphone@", "cellphone_text_read_base", 8.0, 1.0, -1, 0 + 1 + 32 + 16, 0.0, false, false, false)
                        entity.mobilePhone.attachTo(entity.handle, 71, pos.x, pos.y, pos.z, rot.x, rot.y, rot.z, true, true, false, false, 0, true);
                    }, 200);
                }
                if(entity.getVariable('phoneAnim:call') && entity.type == 'player') {
                    mp.game.streaming.requestAnimDict("cellphone@");

                    setTimeout(() => {
                        entity.taskPlayAnim("cellphone@", "cellphone_call_listen_base", 8.0, 1.0, -1, 0 + 1 + 32 + 16, 0.0, false, false, false)
                    }, 200);
                }
            },
            'entityStreamOut': (entity) => {
                if(entity.getVariable('phoneAnim') && entity.mobilePhone) {
                    entity.mobilePhone.destroy();
                }
            }
        })

        mp.events.addDataHandler({
            'phoneAnim': (entity, value) => {
                if(entity.type == 'player' && value != null) {
                    mp.game.streaming.requestAnimDict("cellphone@");
                    setTimeout(() => {
                        entity.taskPlayAnim("cellphone@", "cellphone_text_read_base", 8.0, 1.0, -1, 0 + 1 + 32 + 16, 0.0, false, false, false)
                    }, 200);

                    entity.mobilePhone = mp.objects.new('p_amb_phone_01', entity.position, {
                        rotation: new mp.Vector3(0, 0, 0),
                        alpha: 255,
                        dimension: entity.dimension
                    });

                    setTimeout(() => {
                        entity.mobilePhone.attachTo(entity.handle, 71, 0.1500, 0.02, -0.02, 71, 96.0, 169, true, true, false, false, 0, true);
                    }, 200);

                } else {
                    if(entity.mobilePhone) { entity.mobilePhone.destroy(); }
                    entity.clearTasks();
                }
            },
            'phoneAnim:call': (entity, value) => {
                if(entity.type == 'player' && value != null) {
                    mp.game.streaming.requestAnimDict("cellphone@");
                    setTimeout(() => {
                        entity.taskPlayAnim("cellphone@", "cellphone_call_listen_base", 8.0, 1.0, -1, 0 + 1 + 32 + 16, 0.0, false, false, false)
                    }, 200);

                } else if(entity.type == 'player') {
                    entity.clearTasks();

                    mp.game.streaming.requestAnimDict("cellphone@");
                    setTimeout(() => {
                        entity.taskPlayAnim("cellphone@", "cellphone_text_read_base", 8.0, 1.0, -1, 0 + 1 + 32 + 16, 0.0, false, false, false)
                    }, 200);
                }
            }
        })

        setInterval(() => {
            if(player.getVariable('phoneBattery') && !player.getVariable('phoneBattery') <= 0 && player.getVariable('loggedIn')) {
                mp.events.callRemote('phoneBatteryRemove');
            }
        }, 99000);
    }
}

let phoneSys = new playerPhone();