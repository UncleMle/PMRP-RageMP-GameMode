class deathSystem {

    constructor() {

        this.player = mp.players.local;
        this.streamedPlayers = []
        this.injuredInter = null;
        this.time = null;
        this.showInjured = null;
        this.nlrTime = 0;
        this.nlrInter = null;

        mp.events.add({
            'startDeath': (settime) => {
                this.time = settime;
                this.nlrTime = 1800 // Seconds (30 mins)
                this.showInjured = false;
                mp.players.local.canTogHud = true;
                mp.game.graphics.transitionToBlurred(100);
                mp.game.cam.setCamEffect(1);
                mp.events.call("ShowShardMessage", "~r~INJURED~w~", "You were injured.")//\n Reason: " + this.getReason());
                mp.game.graphics.startScreenEffect('DeathFailMichaelIn', 60000, true);
                mp.events.call('freezePlayer');
                mp.events.call('requestBrowser', `appSys.commit('showHud', false)`)
                mp.game.ui.displayRadar(false);
                mp.game.audio.playSoundFrontend(-1, "Bed", "WastedSounds", true);
                this.injuredInter = setInterval(() => {
                    if (this.player.getVariable('injured') == false) { clearInterval(this.injuredInter) }
                    this.time--;
                    mp.events.callRemote('saveDeathData', this.time);
                }, 1000);

                setTimeout(() => {
                    mp.game.graphics.transitionFromBlurred(100);
                    this.showInjured = true;
                    mp.events.call('requestBrowser', `appSys.commit('showHud', true)`)
                    mp.game.ui.displayRadar(true);
                    mp.players.local.canTogHud = null;
                }, 7000);
            },
            'entityStreamIn': (entity) => {
                if (entity.type == 'player' && entity.getVariable('injured') == true) {
                    this.streamedPlayers.push(entity);
                    mp.game.streaming.requestAnimDict(`combat@damage@writheidle_a`);
                    entity.taskPlayAnim(`combat@damage@writheidle_a`, `writhe_idle_a`, 8.0, 1.0, -1, 1, 1.0, false, false, false);
                }
            },
            'entityStreamOut': (entity) => {
                if (entity.type == 'player' && entity.getVariable('injured') == true) {
                    this.streamedPlayers.splice(1, entity);
                }
            },
            'endDeath': () => {
                mp.game.graphics.startScreenEffect('DeathFailMichaelIn', 1, false);
                clearInterval(this.injuredInter);
                //clearInterval(saveToDb);
                mp.events.callRemote('removeData');
                this.injuredTime = 900;
                this.nlrInter = setInterval(() => {
                    if (this.nlrTime == 0) { clearInterval(this.nlrInter) };
                    this.nlrTime--;
                }, 1000);
            },
            'stopInjuredMessage': () => {
                this.showInjured = false;
            },
            'showInjuredMessage': () => {
                this.showInjured = true;
            },
            'render': () => {
                if (this.player.getVariable('injured')) {
                    mp.game.controls.disableControlAction(0, 22, true) //Space
                    mp.game.controls.disableControlAction(0, 23, true) //Veh Enter
                    mp.game.controls.disableControlAction(0, 25, true) //Right Mouse
                    mp.game.controls.disableControlAction(0, 44, true) //Q
                    mp.game.controls.disableControlAction(2, 75, true) //Exit Vehicle
                    mp.game.controls.disableControlAction(2, 140, true) //R
                    mp.game.controls.disableControlAction(2, 141, true) //Left Mouse
                    mp.game.controls.disableControlAction(0, 30, true) //Move LR
                    mp.game.controls.disableControlAction(0, 31, true) //Move UD
                }
                mp.game.gameplay.setFadeOutAfterDeath(false);
                if (this.player.getVariable('injured') == true && this.showInjured && !this.player.getVariable('adminJailed')) {
                    mp.game.graphics.drawText(`~r~INJURED`, [0.5, 0.81], {
                        font: 4,
                        color: [255, 255, 255, 255],
                        scale: [0.6, 0.6],
                        outline: true
                    });
                    mp.game.graphics.drawText(`You will bleed out in ~HUD_COLOUR_ORANGE~${this.time}~w~ seconds.\n ${mp.players.local.getVariable('lastWepToHit') ? `Reason: ${mp.players.local.getVariable('lastWepToHit')}` : ``}`, [0.5, 0.85], {
                        font: 4,
                        color: [255, 255, 255, 255],
                        scale: [0.42, 0.42],
                        outline: true
                    });

                }
                if (this.player.getVariable('injured') == true && !this.player.getVariable('adminDuty')) {
                    //mp.game.controls.disableAllControlActions(2);
                    //mp.game.controls.disableAllControlActions(1);
                }
                if (!this.player.getVariable('loggedIn')) {
                    mp.game.controls.disableAllControlActions(2);
                    mp.game.controls.disableAllControlActions(1);
                }
            },
            'setEntityHp': (health) => {
                mp.gui.chat.push(`${health}`)
                this.player.setHealth(parseInt(health));
            },
            'respawnCam': (time) => {
                mp.events.call('hud:Off')
                mp.events.call('moveSkyCamera', 'up', 1, false);
                setTimeout(() => {
                    mp.events.call('moveSkyCamera', 'down')
                    mp.events.call('hud:On')
                }, parseInt(time));
            },
            'applyBls': () => {
                this.time = this.time + 1000;
            },
        })

        mp.events.addDataHandler({
            'injured': function (entity, value) {
                if (entity.type == 'player') {
                    switch (value) {
                        case true:
                            {
                                mp.game.streaming.requestAnimDict(`combat@damage@writheidle_a`);
                                setTimeout(() => {
                                    entity.taskPlayAnim(`combat@damage@writheidle_a`, `writhe_idle_a`, 8.0, 1.0, -1, 1, 1.0, false, false, false);
                                }, 200);
                                mp.events.call('hudAccessOff');
                                setTimeout(async () => {
                                    mp.events.call('hudAccessOn');
                                }, 8000);
                            }
                        default:
                            break;
                    }
                }
            }
        })

        mp.events.addProc({
            'proc:getLocation': (pos) => {
                let getStreet = null;
                let streetName = null;
                let crossingName = null;
                getStreet = mp.game.pathfind.getStreetNameAtCoord(pos.x, pos.y, pos.z, 0, 0);
                // Returns obj {"streetName": hash, crossingRoad: hash}

                streetName = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName);
                crossingName = mp.game.ui.getStreetNameFromHashKey(getStreet.crossingRoad);
                // Returns string, if exist

                return crossingName;
            },
            'proc:getNlrTime': () => {
                if (!this.player.getVariable('injured') && this.nlrTime > 0) {
                    return this.nlrTime;
                }
            },
            'proc:getRagdoll': () => {
                var ragDoll = this.player.isRagdoll();
                return ragDoll;
            },
            'proc:getHealth': (entity) => {
                var entityHealth = entity.getHealth();
                return entityHealth;
            }
        });


        mp.keys.bind(123, true, function () {
            if (this.player.getVariable('loggedIn') == true) {
                let d = new Date(),
                    h = d.getHours(),
                    m = d.getMinutes(),
                    s = d.getSeconds(),
                    month = d.getMonth() + 1,
                    year = d.getFullYear(),
                    day = d.getDate();

                h = h < 10 ? "0" + h : h;
                m = m < 10 ? "0" + m : m;
                s = s < 10 ? "0" + s : s;
                d = d < 10 ? "0" + d : d;
                month = month < 10 ? "0" + month : month;
                mp.gui.takeScreenshot(`screenshot_${day}_${month}_${year}_${h}_${m}_${s}.jpg`, 0, 100, 100);
                mp.events.call('success', `Saved screenshot as screenshot_${day}_${month}_${year}_${h}_${m}_${s}.jpg`);
            }
        });

        setInterval(() => {
            if (mp.players.local.getVariable('injured') == true && !mp.players.local.getVariable('adminDuty')) {
                mp.players.local.freezePosition(true);
            }
        }, 100);

        setInterval(() => {
            if (mp.players.local.getVariable('injured') == true) {
                mp.game.streaming.requestAnimDict(`combat@damage@writheidle_a`);
                mp.players.local.taskPlayAnim(`combat@damage@writheidle_a`, `writhe_idle_a`, 8.0, 1.0, -1, 1, 1.0, false, false, false);
            }
        }, 5000);

    }

    async getReason() {
        const pdmg = await this.player.getLastDamageBone(0)
        return pdmg;
    }

}

const death = new deathSystem();