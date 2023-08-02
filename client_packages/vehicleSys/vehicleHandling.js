/* const HandlingJson = require('http://package/vehicles/CustomHandling.json');
 */
/**
 * Check links for more info about handling:
 * https://forums.gta5-mods.com/topic/3842/tutorial-handling-meta 
 * https://wiki.rage.mp/index.php?title=Vehicle::setHandling
 */

const Handling = [
    {
        model: 'police4',
        //fMass :"2000.000000" ,
        fInitialDragCoeff :"4.00000" ,
        fPercentSubmerged :"90.000000" ,
        //vecCentreOfMassOffset x="0.000000" y="0.200000" z="0.000000" ,
        //vecInertiaMultiplier x="1.000000" y="1.600000" z="1.600000" ,
        fDriveBiasFront :"0.000000" ,
        nInitialDriveGears :"5" ,
        fInitialDriveForce :"0.280" ,
        fDriveInertia :"1.000000" ,
        fClutchChangeRateScaleUpShift :"1.600000" ,
        fClutchChangeRateScaleDownShift :"1.600000" ,
        fInitialDriveMaxFlatVel :"240.000000" ,
        fBrakeForce :"0.7000" ,
        fBrakeBiasFront :"0.6000" ,
        fHandBrakeForce :"0.800000" ,
        //fSteeringLock :"39.000000" ,
        fTractionCurveMax :"1.9000" ,
        fTractionCurveMin :"1.8000" ,
        fTractionCurveLateral :"22.500000" ,
        fTractionSpringDeltaMax :"0.2000" ,
        fLowSpeedTractionLossMult :"0.0000" ,
        fCamberStiffnesss :"0.05000" ,
        fTractionBiasFront :"0.480000" ,
        fTractionLossMult :"1.000000" ,
        //fSuspensionForce :"3.500000" ,
        //fSuspensionCompDamp :"2.600000" ,
        //fSuspensionReboundDamp :"3.300000" ,
        //fSuspensionUpperLimit :"0.080000" ,
        //fSuspensionLowerLimit :"-0.080000" ,
        //fSuspensionRaise :"0.000000" ,
        //fSuspensionBiasFront :"0.50000" ,
        fAntiRollBarForce :"0.00000" ,
        fAntiRollBarBiasFront :"0.600000" ,
        fRollCentreHeightFront :"0.340000" ,
        fRollCentreHeightRear :"0.350000" ,
        fCollisionDamageMult :"0.700000" ,
        fWeaponDamageMult :"1.000000" ,
        fDeformationDamageMult :"0.700000" ,
        fEngineDamageMult :"1.500000" ,
        fPetrolTankVolume :"65.000000" ,
        fOilVolume :"5.000000" ,
        fSeatOffsetDistX :"0.000000" ,
        fSeatOffsetDistY :"0.000000" ,
        fSeatOffsetDistZ :"0.000000" ,
        nMonetaryValue :"35000" 
    },
]

mp.events.add("entityStreamIn", (/**@type {VehicleMp}  */entity) => {
    if (entity.type !== "vehicle") return;

    const handlingData = Handling.find((handling) => mp.game.joaat(handling.model) === entity.model);
    if (!handlingData) return;

    /** 
        setHandling does not use the exact values from handling.meta for certain fields, these are as follows:

        fInitialDriveMaxFlatVel - handling.meta value / 3.6
        fBrakeBiasFront - handling.meta value * 2
        fSteeringLock - handling.meta value * 0.017453292
        fTractionCurveLateral - handling.meta value * 0.017453292
        fTractionBiasFront - handling.meta value * 2
        fSuspensionCompDamp - handling.meta value / 10
        fSuspensionReboundDamp - handling.meta value / 10
        fSuspensionBiasFront - handling.meta value * 2
        fAntiRollBarBiasFront - handling.meta value * 2
     */

    for (const key in handlingData) {
        if (key === "model") continue;
        entity.setHandling(key, handlingData[key]);
    }
});

/*
let playerGear = 1;
let localPlayer = mp.players.local;
let ShiftNow = false;
let gearText = null;
let toggle = false;
let blockedClasses = [8, 14, 15, 16] // blocked vehicle classes for manual transmission

// Gear Manager
function setPlayerGear(state) {
    if (state) {
        if (playerGear < 5) {
            playerGear += 1;
        }
    } else {
        if (playerGear > -1) {
            playerGear -= 1;
        }
    }
}

function manualTransmission() {
    let vehicle = localPlayer.vehicle;

    if (!vehicle) { // reset manual settings
        playerGear = 1;
        toggle = false;
    } 

    if (vehicle && toggle) {
        let vehSpeed = vehicle.getSpeed();
        let FirstMax = 11.0;
        let SecondMax = 21.0;
        let ThirdMax = 31.0;
        let FourthMax = 40.5;

        // Ensures realistic gear
        if (vehSpeed > 0 && playerGear > -1) mp.game.controls.disableControlAction(27, 72, true);
        else if (playerGear === -1) mp.game.controls.disableControlAction(27, 71, true);

        if (playerGear !== -1 && mp.game.controls.isControlPressed(27, 72)) {
            if (vehSpeed > 0) {
                vehSpeed -= 1.0;
            } 
        };

        // Gears switching cases
        switch (playerGear) {
    
            // Neutral
            case 0:
                {
                    mp.game.controls.disableControlAction(27, 71, true);
                    mp.game.controls.disableControlAction(27, 72, true);
                }
                break;

            // Gear 1
            case 1:
                {
                    if (vehSpeed > FirstMax) {
                        vehicle.setMaxSpeed(vehSpeed);
                    } else {
                        vehicle.setMaxSpeed(FirstMax);
                    }
                    if (vehSpeed > FirstMax - 1) {
                        ShiftNow = true;
                    } else {
                        ShiftNow = false;
                    }
                }
                break;
            // Gear 2
            case 2:
                {
                    if (vehSpeed > SecondMax) {
                        vehicle.setMaxSpeed(vehSpeed);
                    } else {
                        vehicle.setMaxSpeed(SecondMax);
                    }
                    if (vehSpeed > SecondMax - 1) {
                        ShiftNow = true;
                    } else {
                        ShiftNow = false;
                    }
                }
                break;
            // Gear 3
            case 3:
                {
                    if (vehSpeed > ThirdMax) {
                        vehicle.setMaxSpeed(vehSpeed);
                    } else {
                        vehicle.setMaxSpeed(ThirdMax);
                    }
                    if (vehSpeed > ThirdMax - 1) {
                        ShiftNow = true;
                    } else {
                        ShiftNow = false;
                    }
                }
                break;
            // Gear 4
            case 4:
                {
                    if (vehSpeed > FourthMax) {
                        vehicle.setMaxSpeed(vehSpeed);
                    } else {
                        vehicle.setMaxSpeed(FourthMax);
                    }
                    if (vehSpeed > FourthMax - 1) {
                        ShiftNow = true;
                    } else {
                        ShiftNow = false;
                    }
                }
                break;
            // Gear 5
            case 5:
                {
                    let maxSpeed = mp.game.vehicle.getVehicleModelMaxSpeed(vehicle.model);
                    vehicle.setMaxSpeed(maxSpeed);
                    ShiftNow = false;
                }
        }

        // Gear safety checking
        if (playerGear === 2 && vehSpeed <= FirstMax - 2.1) {
            if (mp.game.controls.isControlPressed(27, 71)) {
                vehicle.setMaxSpeed(FirstMax);
                mp.game.graphics.notify('~r~Shifted ~w~ to fast');
            }
        } else if (playerGear === 3 && vehSpeed <= SecondMax - 2.1) {
            if (mp.game.controls.isControlPressed(27, 71)) {
                vehicle.setEngineOn(false, false, false);
                mp.game.graphics.notify('~r~Shifted ~w~ to fast');
            }
        } else if (playerGear === 4 && vehSpeed <= ThirdMax - 2.1) {
            if (mp.game.controls.isControlPressed(27, 71)) {
                vehicle.setEngineOn(false, false, false);
                mp.game.graphics.notify('~r~Shifted ~w~ to fast');
            }
        } else if (playerGear === 5 && vehSpeed <= FourthMax - 2.1) {
            if (mp.game.controls.isControlPressed(27, 71)) {
                vehicle.setEngineOn(false, false, false);
                mp.game.graphics.notify('~r~Shifted ~w~ to fast');
            }
        }

        if (playerGear !== 1 && vehicle.isStopped()) {
            if (mp.game.controls.isControlPressed(27, 71)) {
                vehicle.setEngineOn(false, false, false);
                mp.game.graphics.notify('~w~Engine ~r~ fail!');
            }
        }

        // Gear text manager
        switch (playerGear) {
            case 0:
                gearText = 'N';
                break;
            case -1:
                gearText = 'R';
                break;
            default:
                gearText = playerGear;
        };

        // Display hud manual transmission.
        if (gearText)
            mp.game.graphics.drawText(`Gear: ${gearText}`, [0.22, 0.8], {
                font: 0,
                color: [255, 255, 255, 185],
                scale: [0.35, 0.35],
                outline: false
            });

        if (ShiftNow)
        mp.game.graphics.drawText(`ShiftNow`, [0.22, 0.83], {
            font: 0,
            color: [0, 255, 127, 185],
            scale: [0.35, 0.35],
            outline: false
        });

        mp.game.graphics.drawText(`${(vehSpeed * 3.6).toFixed(0)} KM/H`, [0.22, 0.86], {
            font: 0,
            color: [255, 255, 255, 185],
            scale: [0.35, 0.35],
            outline: false
        });

        mp.game.graphics.drawText(`Press ~g~I ~w~to shift gear`, [0.27, 0.89], {
            font: 0,
            color: [255, 255, 255, 185],
            scale: [0.35, 0.35],
            outline: false
        });

        mp.game.graphics.drawText(`Press ~r~O ~w~to lower gear`, [0.28, 0.92], {
            font: 0,
            color: [255, 255, 255, 185],
            scale: [0.35, 0.35],
            outline: false
        });
    }
};

//NUMPAD_ADD
mp.keys.bind(73, false, function () {
    if (localPlayer.vehicle) setPlayerGear(true);
});

//NUMPAD_SUBTRACT
mp.keys.bind(79, false, function () {
    if (localPlayer.vehicle) setPlayerGear(false);
});

mp.events.add('render', manualTransmission);
mp.events.add("playerCommand", (command) => {
	const args = command.split(/[ ]+/);
	const commandName = args.splice(0, 1)[0];
    let text;
    
    // toggle manual command
	if (commandName === "manual") {
        if (!localPlayer.vehicle) return mp.game.graphics.notify("You're not in a vehicle to toggle manual");
        if (!validVehicle(localPlayer.vehicle)) return mp.game.graphics.notify("You're not allowed to toggle manual on that vehicle type");
        toggle ? text = 'Manual has been ~r~disabled' : text = 'Manual has been ~g~enabled';
        toggle = !toggle; 
        mp.game.graphics.notify(text);
	} 
});

// Check vehicle class validity 
function validVehicle (vehicle) {
    let vehClass = vehicle.getClass();
    if (blockedClasses.includes(vehClass)) return false;
    return true;
}
*/
