class vehFuel {
    constructor() {
        this.fuelInter = null;
        const player = mp.players.local;
        var pumpDraws = [];
        var targetRay = null;
        var fuelInterval = null;

        const keys = {
            E: 69,
            Y: 89,
            MPY: 246,
            SHIFT: 21,
            CAPS: 20,
            SPACE: 22,
            X: 354
        };

        var keyVals = {
            SPACE: false,
            MPY: false,
            SHIFT: false,
            CAPS: false,
            X: false,
        }

        mp.events.add({
            'playerLeaveVehicle': (vehicle, seat) => {
                if (this.fuelInter) { clearInterval(this.fuelInter) }
            },
            'playerEnterVehicle': (vehicle, seat) => {
                this.fuelInter = setInterval(() => {
                    var speed = vehicle.getSpeed() * 3.6;
                    if(speed > 0 && vehicle.getVariable('engineStatus')) {
                        this.callFuel(vehicle, Math.trunc(speed));
                    }
                }, 15000);
            },
            'playerQuit': (player) => {
                if(player.fuelObject) {
                    player.fuelObject.destroy();
                }
            },
            'render': () => {
                if (player.vehicle && player.vehicle.getVariable('vehData')) {
                    var vData = JSON.parse(player.vehicle.getVariable('vehData'));
                    if (vData.fuelLevel == 0) {
                        player.vehicle.setUndriveable(true);
                    }
                }

                keyVals.SHIFT = mp.game.controls.isControlPressed(0, keys.SHIFT);
                keyVals.SPACE = mp.game.controls.isControlPressed(0, keys.SPACE);
                keyVals.X = mp.game.controls.isControlPressed(0, keys.X);
                keyVals.MPY = mp.game.controls.isControlPressed(0, keys.MPY);

                pumpDraws.forEach((pos) => {
                    if (this.getDistProperty(player, pos) < 2 && !player.vehicle && !player.refueling) {
                        player.getVariable('devdebug') ? mp.game.graphics.drawLine(player.position.x, player.position.y, player.position.z, pos.x, pos.y, pos.z, 244, 155, 255, 255) : '_';
                        targetRay = mp.raycasting.testPointToPoint(pos, player.position, [player], [1, 16]);
                        const gPos = mp.game.graphics.world3dToScreen2d(pos);
                        if(!gPos || !pos) return;
                        mp.game.graphics.requestStreamedTextureDict("3dtextures", true);
                        mp.game.graphics.drawSprite("3dtextures", "mpgroundlogo_bikers", gPos.x, gPos.y * 1.12, 0.05, 0.05, 0, 255, 255, 255, 255);
                        mp.game.graphics.drawText("Press ~y~Y~w~ to interact with this pump.", [pos.x, pos.y, pos.z], {
                            scale: [0.3, 0.3],
                            outline: false,
                            color: [255, 255, 255, 255],
                            font: 4
                        });
                    }
                })

            },
            'entityStreamIn': (entity) => {
                if(entity.getVariable('fuelAnimData') && entity.fuelObject) {
                    mp.game.streaming.requestAnimDict('timetable@gardener@filling_can');
                    setTimeout(() => {
                        entity.taskPlayAnim('timetable@gardener@filling_can', 'gar_ig_5_filling_can', 8.0, 1.0, -1, 1, 1.0, false, false, false);
                    }, 100);

                    entity.fuelObject ? entity.fuelObject.destroy() : '_';

                    entity.fuelObject = mp.objects.new('prop_cs_fuel_nozle', entity.position, {
                        rotation: new mp.Vector3(0, 0, 0),
                        alpha: 255,
                        dimension: entity.dimension
                    });

                    setTimeout(() => {
                        if(entity.fuelObject == null) return;
                        var boneIdx = entity.getBoneIndex(18905);
                        entity.fuelObject.attachTo(entity.handle, boneIdx, 0.11, 0.02, 0.02, -80.0, -90.0, 15.0, true, true, false, false, 0, true);
                    }, 200);
                }
            }
        })

        mp.keys.bind(keys.Y, false, () => {
            if (player.getVariable('fuelPumpData') != null && targetRay != null && !player.vehicle && !player.isTypingInTextChat && !player.refueling) {
                mp.vehicles.forEachInStreamRange((veh) => {
                    if (this.getDist(player, veh) <= 3 && veh.getVariable('vehData')) {

                        if(JSON.parse(player.getVariable('fuelPumpData')).literage <= 0) {
                            mp.events.call('requestBrowser', `gui.notify.clearAll()`);
                            mp.events.call('requestBrowser', `gui.notify.showNotification("This fuel station has ran out of fuel.", false, true, 15000, 'fa-solid fa-info-circle')`);
                            return;
                        }

                        if(veh.getVariable('engineStatus') || veh.getVariable('isLocked')) {
                            mp.events.call('requestBrowser', `gui.notify.clearAll()`);
                            mp.events.call('requestBrowser', `gui.notify.showNotification("Ensure that the vehicle is unlocked and that the vehicle's engine is turned off.", false, true, 15000, 'fa-solid fa-info-circle')`);
                            return;
                        }

                        player.hasFuelUI = true;

                        mp.events.call('requestBrowser', `gui.fuelscreen.updateDisplay("0", "0")`)
                        mp.events.call('notifCreate', '~w~Press and hold ~y~SHIFT~w~ to being pumping fuel.')
                        setTimeout(() => {
                            player.hasFuelUI ? mp.events.call('notifCreate', '~w~Press and hold ~y~Y~w~ to stop pumping fuel.') : '_';
                        }, 3000);
                        mp.events.call('requestBrowser', `gui.fuelscreen.fuelToggle(true)`);
                        mp.events.callRemote('fuel:anim');
                        player.refueling = true;
                        player.freezePosition(true);

                        if (fuelInterval) clearInterval(fuelInterval);

                        var vehFuel = JSON.parse(veh.getVariable('vehData')).fuelLevel;
                        var literage = 0;
                        var price = 0;

                        fuelInterval = setInterval(() => {
                            if(!mp.vehicles.at(veh.remoteId)) return clearInterval(fuelInterval);
                            if(veh.getVariable('engineStatus') || veh.getVariable('isLocked') || this.getDist(player, veh) > 3) {
                                this.stopRefuel(player, `Vehicle was ~r~locked~w~ or the ignition was ~r~switched on~w~.`)
                                return clearInterval(fuelInterval), mp.events.callRemote('save:vehFuel', veh, vehFuel, price, literage);
                            }
                            if (vehFuel >= 100) {
                                vehFuel > 100 ? vehFuel = 100 : '_';
                                clearInterval(fuelInterval);
                                this.stopRefuel(player, `This vehicle's fuel tank is full.`);
                                mp.events.callRemote('save:vehFuel', veh, vehFuel, price, literage);
                                return;
                            }
                            if (keyVals.MPY) {
                                clearInterval(fuelInterval);
                                this.stopRefuel(player, 'You have ~r~stopped~w~ pumping fuel.');
                                mp.events.callRemote('save:vehFuel', veh, vehFuel, price, literage);
                                return;
                            }
                            if (keyVals.SHIFT) {
                                if(this.getDist(player, veh) > 3) {
                                    clearInterval(fuelInterval);
                                    this.stopRefuel(player, `You have ~r~stopped refuelling~w~ the vehicle is out of range.`);
                                    mp.events.callRemote('save:vehFuel', veh, vehFuel, price, literage);
                                    return;
                                }
                                var ran = (Math.random() * 3);
                                vehFuel = (vehFuel + ran);
                                literage = (literage + ran);
                                price = price + JSON.parse(player.getVariable('fuelPumpData')).litreCost;
                                mp.events.call('requestBrowser', `gui.fuelscreen.updateDisplay("${this.roundNum(vehFuel, 3)}", "${this.roundNum(price, 2)}")`)
                            }
                        }, 1000);
                    }
                })
            }
        })

        mp.events.addDataHandler({
            'pumpPush': function (entity, value) {
                if (value && entity.type == 'player') {
                    player.getVariable('devdebug') ? mp.events.call('notifCreate', '~r~Data handler pumpPush triggered') : '_';

                    if (pumpDraws.length != 0) {
                        var idx = null;
                        var jsonPush = JSON.parse(value);

                        pumpDraws.find(function (item, i) {
                            if (item.x == jsonPush.x) {
                                idx = i;
                            }
                        })

                        idx != null ? ( pumpDraws.splice(idx, 1), pumpDraws.push({ "x": jsonPush.x, "y": jsonPush.y, "z": jsonPush.z }) ) : ( pumpDraws.push({ "x": jsonPush.x, "y": jsonPush.y, "z": jsonPush.z }) )
                    }
                    else if (pumpDraws.length == 0) {
                        var jsonPush = JSON.parse(value);

                        pumpDraws.push({ "x": jsonPush.x, "y": jsonPush.y, "z": jsonPush.z });
                    }
                }
            },
            'fuelAnimData': function (entity, value) {
                if (value != null && entity.type == 'player') {
                    mp.game.streaming.requestAnimDict('timetable@gardener@filling_can');
                    setTimeout(() => {
                        entity.taskPlayAnim('timetable@gardener@filling_can', 'gar_ig_5_filling_can', 8.0, 1.0, -1, 1, 1.0, false, false, false);
                    }, 100);

                    entity.fuelObject ? entity.fuelObject.destroy() : '_';

                    entity.fuelObject = mp.objects.new('prop_cs_fuel_nozle', entity.position, {
                        rotation: new mp.Vector3(0, 0, 0),
                        alpha: 255,
                        dimension: entity.dimension
                    });

                    setTimeout(() => {
                        var boneIdx = entity.getBoneIndex(18905);
                        entity.fuelObject.attachTo(entity.handle, boneIdx, 0.11, 0.02, 0.02, -80.0, -90.0, 15.0, true, true, false, false, 0, true);
                    }, 200);

                    return;
                }
                else if(value == null) {
                    entity.clearTasks()
                    if(entity.fuelObject != undefined) {
                        entity.fuelObject.destroy();
                        entity.fuelObject = null;
                    }
                }
            }
        })
    }

    callFuel(vehicle, speed) {
        mp.events.callRemote('kmCalc', vehicle, speed);
        mp.events.callRemote('changeVehicleFuel', vehicle, speed, vehicle.getClass());
    }

    getDist(entityOne, entityTwo) {
        var vdist = Math.floor(mp.game.system.vdist(entityOne.position.x, entityOne.position.y, entityOne.position.z, entityTwo.position.x, entityTwo.position.y, entityTwo.position.z))
        return vdist;
    }

    getDistProperty(entityOne, entityTwo) {
        var vdist = Math.floor(mp.game.system.vdist(entityOne.position.x, entityOne.position.y, entityOne.position.z, entityTwo.x, entityTwo.y, entityTwo.z))
        return vdist;
    }

    attachRope(entityOne, entityTwo) {
        mp.game.invoke('0x9B9039DBF2D258C1'); // loadRopeTextures
        let rope = mp.game.invoke('0xE832D760399EB220', entityOne.position.x, entityOne.position.y, entityOne.position.z, 0, 0, 0, 30, 6, 30, 0.1, 0.5, false, false, true, 1.0, false, 0); // addRope

        entityOne.rope = rope;
        mp.game.rope.attachEntitiesToRope(rope, entityOne.handle, entityTwo.handle, entityOne.position.x, entityOne.position.y, entityOne.position.z, entityTwo.position.x, entityTwo.position.y, entityTwo.position.z, 20, false, false, 0, 0);

        mp.game.invoke('0x710311ADF0E20730', rope);  // activatePhysics
        return rope;
    }

    stopRefuel(player, reason) {
        player.hasFuelUI = false;
        mp.events.call('requestBrowser', `gui.fuelscreen.fuelToggle(false)`);
        mp.events.call('notifCreate', `~w~${reason}`)
        player.freezePosition(false);
        setTimeout(() => {
            player.refueling = false;
        }, 1500);
    }

    roundNum(x, y) {
        var factor = Math.pow(10, y + 1);
        x = Math.round(Math.round(x * factor) / 10);
        return x / (factor / 10);
    }
}
new vehFuel()