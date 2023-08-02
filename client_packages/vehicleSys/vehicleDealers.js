const player = mp.players.local;
let dealerCam = null;
let oldPosition = null;
let targetVehicle = null;
let targetVehicleRot = -127;
let targetVehicleColour = 111;
let createdBlip = null;

class vehDealers {

    constructor() {
        const keys = {
            Y: 89,
            X: 88,
            Z: 90,
            rightArr: 190,
            leftArr: 189,
        }

        let keyVals = {
            rightArr: false,
            leftArr: false
        }

        mp.events.add({
            render: () => {
                if(targetVehicle != null) {
                    targetVehicle.freezePosition(true);
                    targetVehicle.setUndriveable(true);
                    targetVehicle.setEngineOn(true, false, false);
                    targetVehicle.setDirtLevel(0);
                    targetVehicle.setHeading(parseInt(targetVehicleRot));
                    targetVehicle.setColours(parseInt(targetVehicleColour), parseInt(targetVehicleColour));
                }

                if(dealerCam != null) {
                    mp.players.local.setAlpha(0);
                    player.freezePosition(true);

                    mp.events.call('tagSt', false);
                    mp.events.call('adminTags', false);
                    mp.players.local.hasHud = false;
                    mp.events.call('requestBrowser', `appSys.commit('showHud', false)`)
                    mp.game.ui.displayRadar(false);
                    mp.events.call('requestBrowser', `appSys.commit('speedoTog', false)`)
                    if(mp.players.local.getVariable('injured') == true) {
                        mp.events.call('stopInjuredMessage');
                    }

                    keyVals.rightArr = mp.game.controls.isControlPressed(32, keys.rightArr);
                    keyVals.leftArr = mp.game.controls.isControlPressed(32, keys.leftArr);
                }
            },
            playerEnterColshape: (shape) => {
                if(shape.getVariable('vehicleDealer')) {
                    player.isInDealer = shape.getVariable('vehicleDealer');
                    mp.events.call('requestBrowser', `gui.notify.showNotification("Press 'Y' to interact with this dealership.", true, false, false, 'fa-solid fa-circle-info')`);
                }
            },
            playerExitColshape: (shape) => {
                if(shape.getVariable('vehicleDealer')) {
                    player.isInDealer = null;
                    mp.events.call('requestBrowser', `gui.notify.clearAll()`);
                }
            },
            adjustDealerRot: (rot) => {
                if(targetVehicle) {
                    targetVehicle.setHeading(parseInt(rot));
                    targetVehicleRot = rot;
                }
            },
            vsetColour: (c1, c2) => {
                if(targetVehicle) {
                    targetVehicleColour = c1;
                    targetVehicle.setColours(c1, c2);
                }
            },
            closeDealerCam: () => {
                vdealers.closeCamera();
            },
            setDealerView: (name) => {
                vdealers.addDealerVehicle(name);
            },
            dealerModal: () => {
                mp.events.call('requestRoute', 'vehicledealer', true, true);
            },
            dealerPurchaseVehicleClient: (name) => {
                mp.events.callRemote('dealerPurchaseVehicle', name, targetVehicleColour);
            },
            blipLocationcreate(x, y, z, vehName) {
                if(createdBlip != null) return mp.events.call('requestBrowser', `gui.notify.showNotification("You must wait 30 seconds inbetween this action.", false, true, 8600, 'fa-solid fa-triangle-exclamation')`);
                createdBlip = mp.blips.new(225, new mp.Vector3(x, y, z),
                {
                        name: vehName,
                        alpha: 255,
                        color: 79,
                });
                mp.events.call('requestBrowser', `gui.notify.showNotification("${vehName}'s location has been marked on the map.", false, true, 8600, 'fa-solid fa-circle-info')`);
                setTimeout(() => {
                    if(createdBlip) { createdBlip.destroy(), createdBlip = null }
                }, 30000);
            }
        })

        mp.keys.bind(keys.Y, false, function () {
            if(player.isInDealer != null && !player.getVariable('injured') && player.currentRoute == '/' && !mp.players.local.isTypingInTextChat) {
                mp.events.callRemote('fetchDealerVehicles');
                oldPosition = player.position;
                mp.game.cam.doScreenFadeOut(600);
                setTimeout(() => {
                    vdealers.initDealer();
                }, 650);
            }
        });

    }

    initDealer() {
        if(dealerCam != null) return;
        targetVehicleColour = 111;
        var camPos = new mp.Vector3(234.7, -997.9, -98.2);
        player.position = new mp.Vector3(230.7, -997.9, -98.2);

        player.canTogHud = true;
        dealerCam = mp.cameras.new('default', camPos, new mp.Vector3(0,0,0), 40);

        dealerCam.pointAtCoord(227.5, -987.2, -99);
        dealerCam.setActive(true);
        mp.game.cam.renderScriptCams(true, false, 0, true, false);

        mp.events.call('tagSt', false);
        mp.events.call('adminTags', false);
        mp.players.local.hasHud = false;
        mp.events.call('requestBrowser', `appSys.commit('showHud', false)`)
        mp.game.ui.displayRadar(false);
        mp.events.call('requestBrowser', `appSys.commit('speedoTog', false)`)
        if(mp.players.local.getVariable('injured') == true) {
            mp.events.call('stopInjuredMessage');
        }
        setTimeout(() => {
            mp.events.call('requestRoute', 'vehicledealer', true, true);
            mp.game.cam.doScreenFadeIn(1500);
        }, 3000);
    }

    addDealerVehicle(name) {
        name = mp.game.joaat(name);
        if(targetVehicle && targetVehicle.model == name) return;
        if(targetVehicle != null) {
            targetVehicle.destroy();
            targetVehicle = mp.vehicles.new(name, new mp.Vector3(227.5, -987.2, -99),
            {
                    heading: -127,
                    numberPlate: "DEALER",
                    locked: true,
                    engine: false,
                    dimension: player.remoteId+1
            });
            setTimeout(() => {
                targetVehicle.setColours(parseInt(targetVehicleColour), parseInt(targetVehicleColour));
                targetVehicle.setHeading(parseInt(targetVehicleRot));
            }, 50);

            return;
        } else {
            targetVehicle = mp.vehicles.new(name, new mp.Vector3(227.5, -987.2, -99),
            {
                    heading: -127,
                    numberPlate: "DEALER",
                    locked: true,
                    engine: false,
                    dimension: player.remoteId+1
            });
            setTimeout(() => {
                targetVehicle.setColours(parseInt(targetVehicleColour), parseInt(targetVehicleColour));
                targetVehicle.setHeading(parseInt(targetVehicleRot));
            }, 50);
        }
    }

    closeCamera() {
        if(dealerCam != null && oldPosition != null) {
            targetVehicle != null ? ( targetVehicle.destroy(), targetVehicle = null, targetVehicleRot = -127 ) : '_' ;
            dealerCam.destroy();
            dealerCam = null;
            player.position = oldPosition;
            player.canTogHud = false;

            player.setAlpha(255);
            mp.game.cam.renderScriptCams(false, false, 0, false, false);
            player.freezePosition(false);

            mp.events.call('closeRoute');
            mp.events.call('tagSt', true);
            mp.events.call('adminTags', true);
            mp.game.ui.displayRadar(true);
            mp.players.local.hasHud = true;
            mp.events.call('requestBrowser', `appSys.commit('showHud', true)`)
            if(mp.players.local.vehicle) {mp.events.call('requestBrowser', `appSys.commit('speedoTog', true)`)}
            if(mp.players.local.getVariable('injured') == true) {
                mp.events.call('showInjuredMessage');
            }
            mp.events.callRemote('closeDealer');
        }
    }

    pointAtBone(entity, bone) {
        const boneIndex = entity.getBoneIndexByName(bone);
        const bonePos = entity.getWorldPositionOfBone(boneIndex);
        dealerCam != null ? dealerCam.pointAtCoord(bonePos.x, bonePos.y, bonePos.z) : '_' ;
    }
}

var vdealers = new vehDealers();