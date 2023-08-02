let player = mp.players.local;
let chat = mp.gui.chat;
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
const info = `!{yellow}[INFO]${greys} :!{white}`

mp.events.add({
    'robbery': () => {
        mp.game.streaming.requestAnimDict("random@shop_robbery");//preload the animation
        mp.players.local.taskPlayAnim("random@shop_robbery", "robbery_action_f", 8.0, 1.0, -1, 1, 1.0, false, false, false);
    },
    'keyfob': () => {
        mp.game.streaming.requestAnimDict("anim@mp_player_intmenu@key_fob@");
        setTimeout(() => {
            mp.players.local.taskPlayAnim(player, 'anim@mp_player_intmenu@key_fob@', 'fob_click', 51);
        }, 200);
        /*
        setTimeout(() => {
            try {
                animManager.cancelAnim(player);
            } catch (e) {
                console.error('Could not cancel car lock anim', e);
            }
        }, 600);
        */
    },
    'anim:stop': () => {
        if(mp.players.local.refueling) { return; }
        mp.players.local.clearTasks();
    },
    'animation': (p1, p2) => {
        /*
        mp.game.streaming.requestAnimDict("anim@mp_player_intmenu@key_fob@");
        entity.taskPlayAnim('anim@mp_player_intmenu@key_fob@', 'fob_click_fp', 8.0, 1.0,1110.0, 0+32+16, 0.0, false, false, false);
        setTimeout(async() => {
            entity.clearTasks();
            */
            mp.game.streaming.requestAnimDict(p1);
            mp.players.local.taskPlayAnim(p1, p2, 8.0, 1.0,1110.0, 0+32+16, 0.0, false, false, false);
    },
    'arrestAnim': (target) => {
        mp.players.local.taskArrest(target.handle);
    },
    'anim:test': (value1, value2) => {
        if(mp.players.local.refueling) { return; }
        if(mp.players.local.getVariable('adminDuty')) {mp.gui.chat.push(`${value1.toString()} ${value2.toString()}`)}
        mp.game.streaming.requestAnimDict(`${value1.toString()}`);
        setTimeout(() => {
            mp.players.local.taskPlayAnim(`${value1.toString()}`, `${value2.toString()}`, 8.0, 1.0, -1, 1, 1.0, false, false, false);// 8.0, 1.0, -1, 1, 1.0, false, false, false);
        }, 200);
    },
    'anim:move': (value1, value2) => {
        if(mp.players.local.refueling) { return; }
        if(mp.players.local.getVariable('adminDuty')) {mp.gui.chat.push(`${value1.toString()} ${value2.toString()}`)}
        mp.game.streaming.requestAnimDict(`${value1.toString()}`);
        setTimeout(() => {
            mp.players.local.taskPlayAnim(`${value1.toString()}`, `${value2.toString()}`, 8.0, 1.0, -1, 0 + 1 + 32 + 16, 0.0, false, false, false)
        }, 200);
    }
})

// ----- Pointing ------

let pointing =
  {
      active: false,
      interval: null,
      lastSent: 0,
      start: function () {
        if (!this.active) {
            if(mp.players.local.getVariable('injured') || mp.players.local.refueling) return;
              this.active = true;

              mp.game.streaming.requestAnimDict("anim@mp_point");

              while (!mp.game.streaming.hasAnimDictLoaded("anim@mp_point")) {
                  mp.game.wait(0);
              }
              mp.game.invoke("0x0725a4ccfded9a70", mp.players.local.handle, 0, 1, 1, 1);
              mp.players.local.setConfigFlag(36, true)
              mp.players.local.taskMoveNetwork("task_mp_pointing", 0.5, false, "anim@mp_point", 24);
              mp.game.streaming.removeAnimDict("anim@mp_point");

              this.interval = setInterval(this.process.bind(this), 0);
          }
      },

      stop: function () {
          if (this.active) {
              clearInterval(this.interval);
              this.interval = null;

              this.active = false;



              mp.game.invoke("0xd01015c7316ae176", mp.players.local.handle, "Stop");

              if (!mp.players.local.isInjured()) {
                mp.players.local.clearTasks();
              }
              if (!mp.players.local.isInAnyVehicle(true)) {
                  mp.game.invoke("0x0725a4ccfded9a70", mp.players.local.handle, 1, 1, 1, 1);
              }
              mp.players.local.setConfigFlag(36, false);
              mp.players.local.clearTasks();


          }
      },

      gameplayCam: mp.cameras.new("gameplay"),
      lastSync: 0,

      getRelativePitch: function () {
          let camRot = this.gameplayCam.getRot(2);

          return camRot.x - mp.players.local.getPitch();
      },

      process: function () {
          if (this.active) {
              mp.game.invoke("0x921ce12c489c4c41", mp.players.local.handle);

              let camPitch = this.getRelativePitch();

              if (camPitch < -70.0) {
                  camPitch = -70.0;
              }
              else if (camPitch > 42.0) {
                  camPitch = 42.0;
              }
              camPitch = (camPitch + 70.0) / 112.0;

              let camHeading = mp.game.cam.getGameplayCamRelativeHeading();

              let cosCamHeading = mp.game.system.cos(camHeading);
              let sinCamHeading = mp.game.system.sin(camHeading);

              if (camHeading < -180.0) {
                  camHeading = -180.0;
              }
              else if (camHeading > 180.0) {
                  camHeading = 180.0;
              }
              camHeading = (camHeading + 180.0) / 360.0;

              let coords = mp.players.local.getOffsetFromGivenWorldCoords((cosCamHeading * -0.2) - (sinCamHeading * (0.4 * camHeading + 0.3)), (sinCamHeading * -0.2) + (cosCamHeading * (0.4 * camHeading + 0.3)), 0.6);
              let blocked = (typeof mp.raycasting.testPointToPoint([coords.x, coords.y, coords.z - 0.2], [coords.x, coords.y, coords.z + 0.2], mp.players.local.handle, 7) !== 'undefined');

              mp.game.invoke('0xd5bb4025ae449a4e', mp.players.local.handle, "Pitch", camPitch)
              mp.game.invoke('0xd5bb4025ae449a4e', mp.players.local.handle, "Heading", camHeading * -1.0 + 1.0)
              mp.game.invoke('0xb0a6cfd2c69c1088', mp.players.local.handle, "isBlocked", blocked)
              mp.game.invoke('0xb0a6cfd2c69c1088', mp.players.local.handle, "isFirstPerson", mp.game.invoke('0xee778f8c7e1142e2', mp.game.invoke('0x19cafa3c87f7c2ff')) == 4)

              if ((Date.now() - this.lastSent) > 100) {
                  this.lastSent = Date.now();
                  mp.events.callRemote("fpsync.update", camPitch, camHeading);
              }
          }
      }
  }

  mp.events.add("fpsync.update", (id, camPitch, camHeading) => {
      let netPlayer = getPlayerByRemoteId(parseInt(id));
      if (netPlayer != null) {
          if (netPlayer != mp.players.local) {
              netPlayer.lastReceivedPointing = Date.now();

              if (!netPlayer.pointingInterval) {
                  netPlayer.pointingInterval = setInterval((function () {
                      if ((Date.now() - netPlayer.lastReceivedPointing) > 1000) {
                          clearInterval(netPlayer.pointingInterval);

                          netPlayer.lastReceivedPointing = undefined;
                          netPlayer.pointingInterval = undefined;

                          mp.game.invoke("0xd01015c7316ae176", netPlayer.handle, "Stop");


                          if (!netPlayer.isInAnyVehicle(true)) {
                              mp.game.invoke("0x0725a4ccfded9a70", netPlayer.handle, 1, 1, 1, 1);
                          }
                          netPlayer.setConfigFlag(36, false);

                      }
                  }).bind(netPlayer), 500);

                  mp.game.streaming.requestAnimDict("anim@mp_point");

                  while (!mp.game.streaming.hasAnimDictLoaded("anim@mp_point")) {
                      mp.game.wait(0);
                  }



                  mp.game.invoke("0x0725a4ccfded9a70", netPlayer.handle, 0, 1, 1, 1);
                  netPlayer.setConfigFlag(36, true)
                  netPlayer.taskMoveNetwork("task_mp_pointing", 0.5, false, "anim@mp_point", 24);
                  mp.game.streaming.removeAnimDict("anim@mp_point");
              }

              mp.game.invoke('0xd5bb4025ae449a4e', netPlayer.handle, "Pitch", camPitch)
              mp.game.invoke('0xd5bb4025ae449a4e', netPlayer.handle, "Heading", camHeading * -1.0 + 1.0)
              mp.game.invoke('0xb0a6cfd2c69c1088', netPlayer.handle, "isBlocked", 0);
              mp.game.invoke('0xb0a6cfd2c69c1088', netPlayer.handle, "isFirstPerson", 0);
          }
      }
  });

  mp.keys.bind(0x42, true, () => {
      if ( !mp.gui.cursor.visible && !mp.players.local.getVariable('injured')) {
          pointing.start();
      }
  });

  mp.keys.bind(0x42, false, () => {
      pointing.stop();

  });
  function getPlayerByRemoteId(remoteId) {
      let pla = mp.players.atRemoteId(remoteId);
      if (pla == undefined || pla == null) {
          return null;
      }
      return pla;
  }


const movementClipSet = "move_ped_crouched";
const strafeClipSet = "move_ped_crouched_strafing";
const clipSetSwitchTime = 0.25;

const loadClipSet = (clipSetName) => {
    mp.game.streaming.requestClipSet(clipSetName);
    while (!mp.game.streaming.hasClipSetLoaded(clipSetName)) mp.game.wait(0);
};

// load clip sets
loadClipSet(movementClipSet);
loadClipSet(strafeClipSet);

// apply clip sets if streamed player is crouching
mp.events.add("entityStreamIn", (entity) => {
    if (entity.type === "player" && entity.getVariable("isCrouched")) {
        entity.setMovementClipset(movementClipSet, clipSetSwitchTime);
        entity.setStrafeClipset(strafeClipSet);
    }
    if(entity.type == 'player' && entity.getVariable('handsAnimData')) {
        mp.game.streaming.requestAnimDict(`random@mugging3`);
        entity.taskPlayAnim(`random@mugging3`, `handsup_standing_base`, 8.0, 1.0, -1, 0 + 1 + 32 + 16, 0.0, false, false, false)
    }
});

// apply/reset clip sets when isCrouched changes for a streamed player
mp.events.addDataHandler("isCrouched", (entity, value) => {
    if (entity.type === "player") {
        if (value) {
            entity.setMovementClipset(movementClipSet, clipSetSwitchTime);
            entity.setStrafeClipset(strafeClipSet);
        } else {
            entity.resetMovementClipset(clipSetSwitchTime);
            entity.resetStrafeClipset();
        }
    }
});

// CAPS key to toggle crouching
mp.keys.bind(223, false, () => {
    if(mp.players.local.isTypingInTextChat) return;
    mp.events.callRemote("toggleCrouch");
});

var handsup = false;
mp.keys.bind(88, false, () => {
    if(mp.players.local.getVariable('trunkAttach')) {
        mp.events.callRemote('removeFromTrunk');
        return;
    }
    if(mp.players.local.getVariable('adminDuty')) {
        return mp.players.local.clearTasks();
    }
    if(mp.players.local.isTypingInTextChat || !mp.players.local.getVariable('loggedIn') || mp.players.local.getVariable('injured') || mp.players.local.currentRoute != '/' || mp.players.local.phoneStatus) return;
    if(mp.players.local.getVariable('carryInfo')) {
        mp.events.callRemote('player:stopCarry');
        mp.events.call('notifCreate', `~w~Dropped player ~g~successfully`)
        return;
    }
    if(mp.players.local.vehicle) return;
    handsup = !handsup
    if(handsup) {
        mp.events.callRemote('task:handsUp');
    } else {
        mp.events.callRemote('task:stopHands');
    }
})

mp.events.addDataHandler({
    'handsAnimData': function (entity, value) {
        if(entity.type === 'player') {
            if(value == null) {
                setTimeout(() => {
                    if(!entity) return;
                    entity.clearTasks();
                }, 100);
                return;
            }

            mp.game.streaming.requestAnimDict(`random@mugging3`);
            setTimeout(() => {
                if(!entity) return;
                entity.taskPlayAnim(`random@mugging3`, `handsup_standing_base`, 8.0, 1.0, -1, 0 + 1 + 32 + 16, 0.0, false, false, false)
            }, 100);
        }
    }
})