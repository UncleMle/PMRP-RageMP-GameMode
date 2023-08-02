class weaponSystem {
  constructor() {
    this.player = mp.players.local;
    this.CPED_CONFIG_FLAG_DisableMelee = 122;
    this.chat = mp.gui.chat;

    const settings = {
      "recoilSettings": {
        "-1074790547": {
          "name": "AK-47",
          "explosion": 0.021,
          "xVector": 0.4,
          "yVector": 1.2
        },
        "-86904375": {
          "name": "Carbine Rifle MK2",
          "explosion": 0.021,
          "xVector": 0.26,
          "yVector": 0.35
        },
        "-2084633992": {
          "name": "Carbine Rifle",
          "explosion": 0.021,
          "xVector": 0.21,
          "yVector": 0.35
        },
        "736523883": {
          "name": "SMG",
          "explosion": 0.030,
          "xVector": 0.299,
          "yVector": 0.25
        },
        "324215364": {
          "name": "SMG Micro",
          "explosion": 0.0169,
          "xVector": 0.179,
          "yVector": 0.25
        },
        "487013001": {
          "name": "Pump Shotgun",
          "explosion": 0.020,
          "xVector": 0.29,
          "yVector": 0.25
        },
      }
    }


    mp.events.add({
      render: () => {
        if(mp.game.weapon.isPedArmed(mp.players.local.handle, 6)) {
          mp.game.player.setLockon(false);
        } else {
          mp.game.player.setLockon(true);
        }

        mp.game1.weapon.unequipEmptyWeapons = false
        if (this.player.vehicle && this.player.vehicle.getPedInSeat(-1) === this.player.handle && !mp.players.local.getVariable('adminDuty') && !(mp.players.local.getVariable('adminLevel') > 7)) {
          mp.game.controls.disableControlAction(1, 25, true)
          mp.game.controls.disableControlAction(1, 67, true)
          mp.game.controls.disableControlAction(1, 114, true)
          mp.game.controls.disableControlAction(1, 68, true)
          mp.game.controls.disableControlAction(0, 24, true) // Shift (Primary Group)
          mp.game.controls.disableControlAction(0, 69, true) // Control (Primary Group)
          mp.game.controls.disableControlAction(0, 70, true) // Control (Primary Group)
          mp.game.controls.disableControlAction(0, 92, true) // Control (Primary Group)
          mp.game.controls.disableControlAction(0, 140, true) // Control (Primary Group)
          mp.game.controls.disableControlAction(0, 141, true) // Control (Primary Group)
          mp.game.controls.disableControlAction(0, 142, true) // Control (Primary Group)
          mp.game.controls.disableControlAction(0, 257, true) // Control (Primary Group)
          mp.game.controls.disableControlAction(0, 263, true) // Control (Primary Group)
          mp.game.controls.disableControlAction(0, 265, true) // Control (Primary Group)
          mp.game.controls.disableControlAction(0, 68, true) // Use inputGroup 32 in case you are not sure, it seems to have the whole collection of control actions.
          mp.game.controls.disableControlAction(0, 70, true)
        }
      },
      weaponSave: (oldWeapon, newWeapon) => {
        // this.weapon_hash = mp.players.local.weapon; // returns weapon as a hash => uint
        // this.ammoWeapon  = mp.players.local.getWeaponAmmo(this.weapon_hash); // returns ur wep ammo
        mp.gui.chat.push(`${mp.players.local.getAmmoInClip(oldWeapon)} ${mp.players.local.getWeaponAmmo(oldWeapon)} ${oldWeapon}`)
      },
      syncAnimFromPlayer: (sourcePlayer, dict, anim) => {
        sourcePlayer.taskPlayAnim(dict, anim, 8.0, 1.0, 1110.0, 0 + 32 + 16, 0.0, false, false, false)
      },
      playerWeaponShot: () => {
        if (this.player.getVariable('devdebug') == true) {
          mp.gui.chat.push(`${mp.players.local.getAmmoInClip(mp.players.local.weapon)} ${mp.players.local.getWeaponAmmo(mp.players.local.weapon)} ${mp.players.local.weapon}`)
        }
        //mp.events.callRemote('saveWeaponAmmo', mp.players.local.weapon, mp.players.local.getWeaponAmmo(mp.players.local.weapon))
        const weaponHash = mp.game.invoke('0x0A6DB4965674D243', mp.players.local.handle);

        if (!mp.players.local.getVariable('adminDuty')) {
          for (var x = 1; x <= Object.keys(settings.recoilSettings).length; x++) {
            if (settings.recoilSettings[weaponHash] != undefined) {
              this.applyRecoil(settings.recoilSettings[weaponHash].explosion, settings.recoilSettings[weaponHash].xVector, settings.recoilSettings[weaponHash].yVector);
              return;
            } else {
              this.applyRecoil(0.021, 0.029, 0.025);
            }
          }
        }
      }
    })
    mp.events.addDataHandler({
      weaponSwitchAnim: (entity, value) => {
        if (entity.type == 'player' && value) {
          this.playAnim(entity)
          setTimeout(async () => {
            entity.clearTasks()
          }, 1500)
        }
      }
    })
    mp.events.addProc({
      'proc:getAmmoClip': (weapon) => {
        const ammoClip = mp.players.local.getAmmoInClip(weapon)
        return ammoClip
      },
      'proc:getAmmoWeapon': (weapon) => {
        const ammoWeapon = mp.players.local.getWeaponAmmo(weapon)
        return ammoWeapon
      },
      'proc:getHealth': (entity) => {
        const entityHealth = entity.getHealth()
        return entityHealth
      }
    })
  }

  playAnim(entity) {
    mp.game.streaming.requestAnimDict('reaction@intimidation@1h')
    entity.taskPlayAnim('reaction@intimidation@1h', 'intro', 8.0, 1.0, 1110.0, 0 + 32 + 16, 0.0, false, false, false)
  }

  getShot(source, target, bone) {
    try {
      const weaponHash = mp.game.invoke(GET_SELECTED_PED_WEAPON, source.handle)
      let dmg = getWeaponDamage(weaponHash)
      if (dmg > 0) {
        if (bone === 16 || bone === 18) dmg = dmg * 2
        if (bone === 6 || bone === 8 || bone === 4 || bone === 10) dmg = dmg / 2
        target.applyDamageTo(dmg, true)
        mp.events.callRemote('S:hitReg', dmg, source.remoteId)
      }
    } catch (error) {
      target.applyDamageTo(1, true)
    }
  }

  applyRecoil(explosion, xVec, yVec) {
    mp.game.cam.shakeGameplayCam('SMALL_EXPLOSION_SHAKE', explosion);
    const campos = mp.game.cam.getGameplayCamRot(0);
    mp.game.cam.setGameplayCamRelativePitch(campos.x + xVec, campos.y + yVec);
    return;
  }
}

new weaponSystem();
