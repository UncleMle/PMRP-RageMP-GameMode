let localPlayer = mp.players.local;

const bones = ['door_dside_f', 'door_pside_f', 'door_dside_r', 'door_pside_r', 'bonnet', 'boot'];
const names = ['door', 'door', 'door', 'door', 'hood', 'trunk', 'trunk'];
var wiArr = [];
var wiPos = 0;

let target = null;

const keys = {
  wheelDown: 14,
  wheelUp: 15
}

var keyVals = {
  wheelUp: false,
  wheelDown: false
}

const getClosestBone = (raycast) => {
  let data = [];
  bones.forEach((bone, index) => {
    const boneIndex = raycast.entity.getBoneIndexByName(bone);
    const bonePos = raycast.entity.getWorldPositionOfBone(boneIndex);

    if (bonePos) {
      data.push({
        id: index,
        boneIndex: boneIndex,
        name: bone,
        bonePos: bonePos,
        locked: !raycast.entity.doors[index] || !raycast.entity.doors[index] && !raycast.entity.isDoorFullyOpen(index) ? false : true,
        raycast: raycast,
        veh: raycast.entity,
        distance: mp.game.gameplay.getDistanceBetweenCoords(bonePos.x, bonePos.y, bonePos.z, raycast.position.x, raycast.position.y, raycast.position.z, false),
        pushTime: Date.now() / 1000
      });
    }
  })

  return data.sort((a, b) => a.distance - b.distance)[0];
}

const getLocalTargetVehicle = (range = 5.0) => {
  let startPosition = mp.players.local.getBoneCoords(12844, 0.5, 0, 0);
  const res = mp.game.graphics.getScreenActiveResolution(1, 1);
  const secondPoint = mp.game.graphics.screen2dToWorld3d([res.x / 2, res.y / 2, (2 | 4 | 8)]);
  if (!secondPoint) return null;

  startPosition.z -= 0.3;
  const target = mp.raycasting.testPointToPoint(startPosition, secondPoint, mp.players.local, (2 | 4 | 8 | 16));

  if (target && target.entity.type === 'vehicle' && mp.game.gameplay.getDistanceBetweenCoords(target.entity.position.x, target.entity.position.y, target.entity.position.z, mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z, false) < range) return target;
  return null;
}

const drawTarget3d = (pos, textureDict = "mpmissmarkers256", textureName = "corona_shade", scaleX = 0.005, scaleY = 0.01) => {
  const position = mp.game.graphics.world3dToScreen2d(pos);
  if (!position) return;
  mp.game.graphics.drawSprite(textureDict, textureName, position.x, position.y, scaleX, scaleY, 0, 0, 0, 0, 200);
}

let showed = false;
let player = mp.players.local;

mp.events.addDataHandler({
  'trunkAttach': function (entity, value) {
      if(entity.type == 'player') {
        if(value) {
          mp.game.streaming.requestAnimDict(`missfinale_c1@`);
          setTimeout(() => {
              if(!entity) return;
              entity.taskPlayAnim(`missfinale_c1@`, `lying_dead_player0`, 8.0, 1.0, -1, 0 + 1 + 32 + 16, 0.0, false, false, false)
          }, 100);
          return;
        } else {
          entity.clearTasks();
        }
      }
  }
})

mp.events.add({
  'render': () => {
    mp.game.vehicle.setExperimentalAttachmentSyncEnabled(true);

    mp.vehicles.forEachInStreamRange((veh) => {
      if(veh.doors && mp.players.local.getVehicleIsTryingToEnter() != veh.handle) { // Allows default RAGE sync for player opening door.
        veh.doors.forEach((state, index) => {
          if (state) veh.setDoorOpen(index, false, true);
          else veh.setDoorShut(index, true);
        })
      }
    })

    if(mp.players.local.vehicle && mp.players.local.refueling) {
      mp.players.local.taskLeaveVehicle(mp.players.local.vehicle.handle, 0);
    }

    if (mp.players.local.vehicle) {
      mp.players.local.vehicle.setAlarm(true);
      mp.game.audio.setRadioToStationName("OFF");
      mp.game.audio.setUserRadioControlEnabled(false);
      if (isFlipped(mp.players.local.vehicle)) {
        mp.game.controls.disableControlAction(32, 59, true);
        mp.game.controls.disableControlAction(32, 60, true);
        mp.game.controls.disableControlAction(32, 61, true);
        mp.game.controls.disableControlAction(32, 62, true);
        mp.game.controls.disableControlAction(0, 59, true);
        mp.game.controls.disableControlAction(0, 60, true);
        mp.game.controls.disableControlAction(0, 61, true);
        mp.game.controls.disableControlAction(0, 62, true);
        mp.game.controls.disableControlAction(32, 63, true);
        mp.game.controls.disableControlAction(0, 63, true);
      }
    }

    keyVals.wheelDown = mp.game.controls.isControlPressed(0, keys.wheelDown);
    keyVals.wheelUp = mp.game.controls.isControlPressed(0, keys.wheelUp);

    if (!mp.players.local.vehicle && !mp.gui.cursor.visible && !mp.players.local.getVariable('injured') && mp.players.local.getVehicleIsTryingToEnter() == 0 && !mp.players.local.getVariable('trunkAttach')) {
      const raycast = getLocalTargetVehicle();
      if (raycast && raycast.entity.getDoorLockStatus() == 1 && raycast.entity.doors && !raycast.entity.getVariable('beingRepaired') && raycast.entity.getClass() !== 13 && raycast.entity.getClass() !== 8 && !mp.game.player.isFreeAiming() && mp.game.gameplay.getDistanceBetweenCoords(raycast.entity.position.x, raycast.entity.position.y, raycast.entity.position.z, mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z, false) < 4) {
        mp.game.ui.weaponWheelIgnoreSelection();
        mp.game.controls.disableControlAction(0, 37, true);
        target = getClosestBone(raycast);
        if (!target) return;

        const bonePos = raycast.entity.getWorldPositionOfBone(target.boneIndex);

        wiArr[0] = `${target.locked ? `Close ${names[bones.indexOf(target.name)]}` : `Open ${names[bones.indexOf(target.name)]}`}`;

        switch(names[bones.indexOf(target.name)]) {
          case 'trunk':
          {
            wiArr[1] = `View Storage`;
            mp.players.local.getVariable('carryInfo') ? wiArr[2] = `Place Into Trunk` : wiArr[2] = 'Enter Trunk' ;
            mp.players.local.getVariable('adminDuty') ? wiArr[2] = `~r~[Staff] View Vehicle information` : wiArr.length = 3;
            break;
          }
          case 'hood':
          {
            wiArr[1] = `Inspect Engine`;
            break;
          }
          default:
            (wiArr.length = 1, wiPos = 0 );
            break;
        }

        if(keyVals.wheelUp) {
          if(wiPos >= wiArr.length-1) { return wiPos = wiArr.length-1; };
          wiPos++;
        }
        if(keyVals.wheelDown) {
          if(wiPos <= 0) { return wiPos = 0};
          wiPos--;
        }

        var dist = mp.game.system.vdist(mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z, bonePos.x, bonePos.y, bonePos.z);
        wiArr.forEach((item, i) => {
          mp.game.graphics.drawText((i == wiPos ? '~y~E~w~ ' : '~c~') + item, [bonePos.x, bonePos.y, bonePos.z - (i > 0 ? i / 7 : 0)], {
            scale: [0.3, 0.3],
            outline: false,
            color: [255, 255, 255, (255 - dist*80)],
            font: 4
          });
        })

      }
    }

    if (player.vehicle && player.vehicle.getPedInSeat(-1) === player.handle && mp.players.local.vehicle.getVariable('vehData') || player.vehicle && player.vehicle.getPedInSeat(0) === player.handle && mp.players.local.vehicle.getVariable('vehData')) {
      if (showed === false) {
        mp.events.call('requestBrowser', `appSys.commit('speedoTog', true)`)
        showed = true;
      }

      let vel1 = player.vehicle.getSpeed() * 3.6;
      let vel = (vel1).toFixed(0)
      let gas = player.vehicle.getBodyHealth();
      let v = gas.toString();
      var fuel = `${Math.trunc(JSON.parse(mp.players.local.vehicle.getVariable('vehData')).fuelLevel)}`
      mp.events.call('requestBrowser', `appSys.commit('updateSpeedo', {
                vehHealth: '${Math.floor(Math.trunc(player.vehicle.getBodyHealth() / 10))}',
                vehSpeed: '${vel}',
                vehicleFuel: '${fuel}',
                vehRpm: ${player.vehicle.getVariable('engineStatus') ? player.vehicle.rpm : 0}
              })`)
    }
    else {
      if (showed) {
        mp.events.call('requestBrowser', `appSys.commit('speedoTog', false)`)
        showed = false;
      }
    }
  },
  'client.vehicles.sync.doors': (entity, doors) => {
    if (entity.type !== 'vehicle') return;

    entity.doors = JSON.parse(doors);
    entity.doors.forEach((state, index) => {
      if (state) entity.setDoorOpen(index, false, true);
      else entity.setDoorShut(index, true);
    })
  },
  'client.door.shut': (entity, doors) => {
    if (entity.type !== 'vehicle') return;
    entity.doors = JSON.parse(doors);
    entity.doors.forEach((state, index) => {
      if (state) {
        entity.setDoorShut(index, true);
      }
    })
  },
  'entityStreamIn': (entity) => {
    if(entity.getVariable('trunkAttach')) {
      mp.game.streaming.requestAnimDict(`missfinale_c1@`);
      setTimeout(() => {
          if(!entity) return;
          entity.taskPlayAnim(`missfinale_c1@`, `lying_dead_player0`, 8.0, 1.0, -1, 0 + 1 + 32 + 16, 0.0, false, false, false)
      }, 100);
      return;
    }
    if (entity.type !== 'vehicle' || !entity.getVariable('sqlID')) return;
    entity.doors = [0, 0, 0, 0, 0, 0, 0];
    mp.events.callRemote('server.vehicles.get.sync.doors', entity);
  },
  'alarmV': () => {
    if (mp.players.local.vehicle) {
      mp.players.local.vehicle.setAlarm(true);
    }
  }

});

setInterval(emptyVehCheck);
setInterval(playerVehAttach);

var playerVehAttach = setInterval(() => {
  mp.players.forEachInStreamRange((ps) => {
    if(ps.getVariable('trunkAttach')) {
      var targetVeh = mp.vehicles.at(ps.getVariable('trunkAttach'));
      if(targetVeh) {
        const boneIndex = targetVeh.getBoneIndexByName("boot");

        targetVeh.setNoCollision(ps.handle, false);
        ps.attachTo(targetVeh.handle, boneIndex, 0, 0, 0, 0, 0, 0.0, false, false, false, false, 2, false);

        element.ped = mp.peds.new(ps.model, ps.position, 0);
        mp.game.invoke("0xE952D6431689AD9A", ps.handle, element.ped.handle);

        element.ped.attachTo(targetVeh.handle, boneIndex, 0, 0, 0, 0, 0, 0.0, false, false, false, false, 2, false);
        ps.attachTo(element.ped.handle, boneIndex, 0, 0, 0, 0, 0, 0.0, false, false, false, false, 2, false);

      }
      return;
    } else {
      targetVeh.setNoCollision(ps.handle, true);
    }
  })
}, 10);

var emptyVehCheck = setInterval(() => {
  mp.vehicles.forEachInStreamRange((veh) => {
    if (veh.getPedInSeat(-1) == 0 && !veh.getVariable('engineStatus') && !veh.getVariable('vehFreeze') && mp.players.local.getVariable('protectedArea') && veh.getVariable('isLocked')) {
      veh.freezePosition(true);
      return;
    } else {
      veh.freezePosition(false);
    }
  })
}, 1500);

var viewTimeout = null;
mp.keys.bind(69, true, () => {
  if (!mp.gui.cursor.visible && target && target.pushTime + 1 >= Date.now() / 1000 && target.veh.doesExist()) {
    interactionHandler(target, wiArr[wiPos]);
  }
});

function interactionHandler(target, handle) {
  switch(handle) {
    case 'Enter Trunk':
    {
      if(!target.veh.doors[5] || target.veh.doors[5] == 0) {
        mp.events.call('requestBrowser', `gui.notify.clearAll()`);
        mp.events.call('requestBrowser', `gui.notify.showNotification("You must have the vehicle's trunk open to enter it.", false, true, 15000, 'fa-solid fa-info-circle')`);
        return;
      }

      mp.events.callRemote('attachToTrunk', target.veh);
      break;
    }
    case 'Place Into Trunk':
    {
      if(!target.veh.doors[5] || target.veh.doors[5] == 0) {
        mp.events.call('requestBrowser', `gui.notify.clearAll()`);
        mp.events.call('requestBrowser', `gui.notify.showNotification("You must have the vehicle's trunk player someone inside of it.", false, true, 15000, 'fa-solid fa-info-circle')`);
        return;
      }

      mp.events.callRemote('attachToTrunk', target.veh);
      break;
    }
    case 'Inspect Engine':
    {
      mp.gui.chat.push(`!{#f0ff4a}[Info]!{#f0ff4a} ${getVehName(target.veh.model)}'s engine would feel slightly warm to the touch.`);
      break;
    }
    case 'View Storage':
    {
      if(!target.veh.doors[5] || target.veh.doors[5] == 0) {
        mp.events.call('requestBrowser', `gui.notify.clearAll()`);
        mp.events.call('requestBrowser', `gui.notify.showNotification("You must have the vehicle's trunk open to view the storage.", false, true, 15000, 'fa-solid fa-info-circle')`);
        return;
      }

      viewTimeout != null ? clearTimeout(viewTimeout) : '_';

      mp.events.call('notifCreate', '~w~This vehicle has ~r~nothing~w~ in its trunk.');
      break;
    }
    case '~r~[Staff] View Vehicle information':
    {
      if(mp.players.local.getVariable('adminDuty')) {
        mp.events.callRemote('veh:getData', target.veh);
      }
      break;
    }
    default:
      target.veh.doors[target.id] = !target.veh.doors[target.id];
      mp.events.call('ameCreate', `${target.veh.doors[target.id] == true ? 'Opens' : 'Closes'} the ${getVehName(target.veh.model)}'s ${names[bones.indexOf(target.name)]}`);
      mp.events.callRemote('server.vehicles.sync.doors', target.veh, JSON.stringify(target.veh.doors));
      break;
   }
}

function getDist(entityOne, entityTwo) {
  if(!entityOne || !entityOne) return;
  var vdist = Math.floor(mp.game.system.vdist(entityOne.position.x, entityOne.position.y, entityOne.position.z, entityTwo.position.x, entityTwo.position.y, entityTwo.position.z))
  return vdist;
}

function getVehName(name) {
  var vehicleName = mp.game.ui.getLabelText(mp.game.vehicle.getDisplayNameFromVehicleModel(name));
  if (vehicleName == null || vehicleName == undefined || vehicleName == 'NULL') { vehicleName = `vehicle` }
  return vehicleName;
}

mp.keys.bind(0x51, true, _ => {
  if (localPlayer.vehicle && localPlayer.vehicle.getPedInSeat(-1) === localPlayer.handle && localPlayer.vehicle.getClass() === 18) {
    localPlayer.vehicle.getVariable('silentMode');
    mp.events.call('ameCreate', `Turns their vehicle's siren ${localPlayer.vehicle.getVariable('silentMode') == true ? 'on' : 'off'}`);
    mp.events.callRemote('syncSirens', localPlayer.vehicle)
  }
});

mp.events.add('entityStreamIn', (entity) => {
  if (entity.type === 'vehicle' && entity.getClass() === 18 && entity.hasVariable('silentMode')) entity.getVariable('silentMode') ? entity.setSirenSound(true) : entity.setSirenSound(false);
});

mp.events.addDataHandler("silentMode", (entity, value) => {
  if (entity.type === "vehicle") entity.setSirenSound(value);
});

function isFlipped(vehicle) {
  if (Math.trunc(vehicle.getRotation(2).y) > 80 && Math.trunc(Math.sign(vehicle.getRotation(2).y)) === 1 || Math.trunc(vehicle.getRotation(2).y) < -80 && Math.trunc(Math.sign(vehicle.getRotation(2).y)) === -1) {
    return true;
  }
}

const calcDist = (v1, v2) => {
  return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2) + Math.pow(v1.z - v2.z, 2));
};

const getClosestVehicleInRange = (range) => {
  if (mp.gui.cursor.visible) return;
  let closestVehicle = null;
  let closestDistance = range + 1;
  const position = mp.players.local.position;
  mp.vehicles.forEachInRange(position, range, (vehicle) => {
    const distToPlayer = calcDist(position, vehicle.position);
    if (distToPlayer < closestDistance) {
      closestVehicle = vehicle;
      closestDistance = distToPlayer;
    }
  });
  return closestVehicle;
}

mp.game.controls.useDefaultVehicleEntering = false;



mp.keys.bind(71, false, () => {
  if (mp.players.local.vehicle === null && mp.gui.cursor.visible === false) {
    const driverSeatId = -1;
    const playerPos = mp.players.local.position;
    const vehicle = getClosestVehicleInRange(6);
    if (mp.gui.cursor.visible) return;
    if (!vehicle) return;
    if (vehicle.isAVehicle() && !mp.gui.cursor.visible) {
      if (vehicle.getVariable('locked') === true) {
        return;
      }

      if (mp.game.vehicle.isThisModelABike(vehicle.model) && !vehicle.getVariable('locked')) {
        if (vehicle.isSeatFree(0) && !mp.gui.cursor.visible) {
          mp.players.local.taskEnterVehicle(vehicle.handle, 5000, 0, 2.0, 1, 0);
        }
        return;
      }
      if (mp.players.local.getVariable('adminDuty') == true) {
        var ppos = mp.players.local.position
        var targetVehicle = mp.game.vehicle.getClosestVehicle(ppos.x, ppos.y, ppos.z, 30, 0, 70);
        if (!targetVehicle) return;
        mp.game.invoke('0x9A7D091411C5F684', mp.players.local.handle, targetVehicle.handle, -1);
        return;
      }

      const seatRear = vehicle.getBoneIndexByName('seat_r');
      const seatFrontPassenger = vehicle.getBoneIndexByName('seat_pside_f');
      const seatRearDriver = vehicle.getBoneIndexByName('seat_dside_r');
      const seatRearDriver1 = vehicle.getBoneIndexByName('seat_dside_r1');
      const seatRearDriver2 = vehicle.getBoneIndexByName('seat_dside_r2');
      const seatRearDriver3 = vehicle.getBoneIndexByName('seat_dside_r3');
      const seatRearDriver4 = vehicle.getBoneIndexByName('seat_dside_r4');
      const seatRearDriver5 = vehicle.getBoneIndexByName('seat_dside_r5');
      const seatRearDriver6 = vehicle.getBoneIndexByName('seat_dside_r6');
      const seatRearDriver7 = vehicle.getBoneIndexByName('seat_dside_r7');
      const seatRearPassenger = vehicle.getBoneIndexByName('seat_pside_r');
      const seatRearPassenger1 = vehicle.getBoneIndexByName('seat_pside_r1');
      const seatRearPassenger2 = vehicle.getBoneIndexByName('seat_pside_r2');
      const seatRearPassenger3 = vehicle.getBoneIndexByName('seat_pside_r3');
      const seatRearPassenger4 = vehicle.getBoneIndexByName('seat_pside_r4');
      const seatRearPassenger5 = vehicle.getBoneIndexByName('seat_pside_r5');
      const seatRearPassenger6 = vehicle.getBoneIndexByName('seat_pside_r6');
      const seatRearPassenger7 = vehicle.getBoneIndexByName('seat_pside_r7');

      const seatRearPosition = seatRear === -1 ? null : vehicle.getWorldPositionOfBone(seatRear);
      const seatFrontPassengerPosition = seatFrontPassenger === -1 ? null : vehicle.getWorldPositionOfBone(seatFrontPassenger);
      const seatRearDriverPosition = seatRearDriver === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver);
      const seatRearDriver1Position = seatRearDriver1 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver1);
      const seatRearDriver2Position = seatRearDriver2 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver2);
      const seatRearDriver3Position = seatRearDriver3 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver3);
      const seatRearDriver4Position = seatRearDriver4 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver4);
      const seatRearDriver5Position = seatRearDriver5 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver5);
      const seatRearDriver6Position = seatRearDriver6 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver6);
      const seatRearDriver7Position = seatRearDriver7 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver7);
      const seatRearPassengerPosition = seatRearPassenger === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger);
      const seatRearPassenger1Position = seatRearPassenger1 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger1);
      const seatRearPassenger2Position = seatRearPassenger2 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger2);
      const seatRearPassenger3Position = seatRearPassenger3 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger3);
      const seatRearPassenger4Position = seatRearPassenger4 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger4);
      const seatRearPassenger5Position = seatRearPassenger5 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger5);
      const seatRearPassenger6Position = seatRearPassenger6 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger6);
      const seatRearPassenger7Position = seatRearPassenger7 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger7);

      let closestFreeSeatNumber = -1;
      let seatIndex = driverSeatId;
      let closestSeatDistance = Number.MAX_SAFE_INTEGER;
      let calculatedDistance = null;

      calculatedDistance = seatRearPosition === null ? null : calcDist(playerPos, seatRearPosition);
      seatIndex = seatRear === -1 ? seatIndex : seatIndex + 1;
      if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
        closestSeatDistance = calculatedDistance;
        closestFreeSeatNumber = seatIndex;
      }

      calculatedDistance = seatFrontPassengerPosition === null ? null : calcDist(playerPos, seatFrontPassengerPosition);
      seatIndex = seatFrontPassenger === -1 ? seatIndex : seatIndex + 1;
      if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
        closestSeatDistance = calculatedDistance;
        closestFreeSeatNumber = seatIndex;
      }

      calculatedDistance = seatRearDriverPosition === null ? null : calcDist(playerPos, seatRearDriverPosition);
      seatIndex = seatRearDriver === -1 ? seatIndex : seatIndex + 1;
      if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
        closestSeatDistance = calculatedDistance;
        closestFreeSeatNumber = seatIndex;
      }

      calculatedDistance = seatRearPassengerPosition === null ? null : calcDist(playerPos, seatRearPassengerPosition);
      seatIndex = seatRearPassenger === -1 ? seatIndex : seatIndex + 1;
      if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
        closestSeatDistance = calculatedDistance;
        closestFreeSeatNumber = seatIndex;
      }

      calculatedDistance = seatRearDriver1Position === null ? null : calcDist(playerPos, seatRearDriver1Position);
      seatIndex = seatRearDriver1 === -1 ? seatIndex : seatIndex + 1; // 3
      if (!vehicle.isSeatFree(seatIndex - 2) || mp.keys.isDown(17)) {
        if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
          closestSeatDistance = calculatedDistance;
          closestFreeSeatNumber = seatIndex;
        }
      }

      calculatedDistance = seatRearPassenger1Position === null ? null : calcDist(playerPos, seatRearPassenger1Position);
      seatIndex = seatRearPassenger1 === -1 ? seatIndex : seatIndex + 1; // 4
      if (!vehicle.isSeatFree(seatIndex - 2) || mp.keys.isDown(17)) {
        if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
          closestSeatDistance = calculatedDistance;
          closestFreeSeatNumber = seatIndex;
        }
      }

      calculatedDistance = seatRearDriver2Position === null ? null : calcDist(playerPos, seatRearDriver2Position);
      seatIndex = seatRearDriver2 === -1 ? seatIndex : seatIndex + 1; // 5
      if (!vehicle.isSeatFree(seatIndex - 4) || mp.keys.isDown(17)) {
        if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
          closestSeatDistance = calculatedDistance;
          closestFreeSeatNumber = seatIndex;
        }
      }

      calculatedDistance = seatRearPassenger2Position === null ? null : calcDist(playerPos, seatRearPassenger2Position);
      seatIndex = seatRearPassenger2 === -1 ? seatIndex : seatIndex + 1; // 6
      if (!vehicle.isSeatFree(seatIndex - 4) || mp.keys.isDown(17)) {
        if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
          closestSeatDistance = calculatedDistance;
          closestFreeSeatNumber = seatIndex;
        }
      }

      calculatedDistance = seatRearDriver3Position === null ? null : calcDist(playerPos, seatRearDriver3Position);
      seatIndex = seatRearDriver3 === -1 ? seatIndex : seatIndex + 1;
      if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
        closestSeatDistance = calculatedDistance;
        closestFreeSeatNumber = seatIndex;
      }

      calculatedDistance = seatRearPassenger3Position === null ? null : calcDist(playerPos, seatRearPassenger3Position);
      seatIndex = seatRearPassenger3 === -1 ? seatIndex : seatIndex + 1;
      if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
        closestSeatDistance = calculatedDistance;
        closestFreeSeatNumber = seatIndex;
      }

      calculatedDistance = seatRearDriver4Position === null ? null : calcDist(playerPos, seatRearDriver4Position);
      seatIndex = seatRearDriver4 === -1 ? seatIndex : seatIndex + 1;
      if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
        closestSeatDistance = calculatedDistance;
        closestFreeSeatNumber = seatIndex;
      }

      calculatedDistance = seatRearPassenger4Position === null ? null : calcDist(playerPos, seatRearPassenger4Position);
      seatIndex = seatRearPassenger4 === -1 ? seatIndex : seatIndex + 1;
      if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
        closestSeatDistance = calculatedDistance;
        closestFreeSeatNumber = seatIndex;
      }

      calculatedDistance = seatRearDriver5Position === null ? null : calcDist(playerPos, seatRearDriver5Position);
      seatIndex = seatRearDriver5 === -1 ? seatIndex : seatIndex + 1;
      if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
        closestSeatDistance = calculatedDistance;
        closestFreeSeatNumber = seatIndex;
      }

      calculatedDistance = seatRearPassenger5Position === null ? null : calcDist(playerPos, seatRearPassenger5Position);
      seatIndex = seatRearPassenger5 === -1 ? seatIndex : seatIndex + 1;
      if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
        closestSeatDistance = calculatedDistance;
        closestFreeSeatNumber = seatIndex;
      }

      calculatedDistance = seatRearDriver6Position === null ? null : calcDist(playerPos, seatRearDriver6Position);
      seatIndex = seatRearDriver6 === -1 ? seatIndex : seatIndex + 1;
      if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
        closestSeatDistance = calculatedDistance;
        closestFreeSeatNumber = seatIndex;
      }

      calculatedDistance = seatRearPassenger6Position === null ? null : calcDist(playerPos, seatRearPassenger6Position);
      seatIndex = seatRearPassenger6 === -1 ? seatIndex : seatIndex + 1;
      if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
        closestSeatDistance = calculatedDistance;
        closestFreeSeatNumber = seatIndex;
      }

      calculatedDistance = seatRearDriver7Position === null ? null : calcDist(playerPos, seatRearDriver7Position);
      seatIndex = seatRearDriver7 === -1 ? seatIndex : seatIndex + 1;
      if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
        closestSeatDistance = calculatedDistance;
        closestFreeSeatNumber = seatIndex;
      }

      calculatedDistance = seatRearPassenger7Position === null ? null : calcDist(playerPos, seatRearPassenger7Position);
      seatIndex = seatRearPassenger7 === -1 ? seatIndex : seatIndex + 1;
      if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
        closestSeatDistance = calculatedDistance;
        closestFreeSeatNumber = seatIndex;
      }

      if (closestFreeSeatNumber === -1) {
        return;
      }

      const lastAnimatableSeatOverrides = {
        [mp.game.joaat('journey')]: driverSeatId + 1,
        [mp.game.joaat('journey2')]: driverSeatId + 1
      };

      let lastAnimatableSeatIndex = driverSeatId + 3;
      if (lastAnimatableSeatOverrides[vehicle.model] !== undefined) {
        lastAnimatableSeatIndex = lastAnimatableSeatOverrides[vehicle.model];
      }

      if (closestFreeSeatNumber <= lastAnimatableSeatIndex) {
        mp.players.local.taskEnterVehicle(vehicle.handle, 5000, closestFreeSeatNumber, 2.0, 1, 0);
      } else {
        mp.game.invoke('0x9A7D091411C5F684', mp.players.local.handle, vehicle.handle, closestFreeSeatNumber);
      }
    }
  }
});

mp.keys.bind(0x46, false, function () {
  const vehHandle = mp.players.local.getVehicleIsTryingToEnter();
  if (vehHandle) {
    const vehicle = mp.vehicles.atHandle(vehHandle);
    if (!vehicle) return;

    if (vehicle.getDoorLockStatus() === 2) {
      let seat = -1;
      let e = 0;

      var interval = setInterval(() => {
        if (e === 15) {
          clearInterval(interval);
          return;
        }

        if (vehicle.getDoorLockStatus() === 1) {
          let data = mp.game.vehicle.getVehicleModelMaxNumberOfPassengers(vehicle.model);

          for (let i = -1, l = data; i < l; i++) {
            let isFree = vehicle.isSeatFree(i);

            if (isFree) {
              seat = i;
              localPlayer.taskEnterVehicle(vehicle.handle, 5000, seat, 2, 1, 0);
              clearInterval(interval);
              return;
            }
          }
        }
        e++;
      }, 200);
    }
  }
});

mp.events.addProc({
  'proc::vehicleName': (model) => {
    const vehicleName = mp.game.ui.getLabelText(mp.game.vehicle.getDisplayNameFromVehicleModel(model));
    return vehicleName;
  },
});