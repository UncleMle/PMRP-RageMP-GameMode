const weaponData = require("./weaponData");

const meleeAttachmentPos = new mp.Vector3(-0.07, 0.07, 0.110);
const meleeAttachmentRot = new mp.Vector3(37.0, 88.0, -3.0);


const PistolAttachmentPos = new mp.Vector3(-0.0800, -0.1000, 0.03);
const PistolAttachmentRot = new mp.Vector3(3, -8, 24);

const SMGAttachmentPos = new mp.Vector3(-0.08, -0.16, -0.01);
const SMGAttachmentRot = new mp.Vector3(0, 37.0, 3);

const ShotgunAttachmentPos = new mp.Vector3(-0.1, -0.15, 0.07);
const ShotgunAttachmentRot = new mp.Vector3(-1, 40, 3);

const RifleAttachmentPos = new mp.Vector3(0.0600, -0.1300, 0.0900); //new mp.Vector3(-0.1, -0.15, -0.13);
const RifleAttachmentRot = new mp.Vector3(0, 136.0000, 0); //new mp.Vector3(0.0, 0.0, 3.5);

const MicroSMGAttachmentPos = new mp.Vector3(-0, -0.17, 0.07); //new mp.Vector3(-0.1, -0.15, -0.13);
const MicroSMGAttachmentRot = new mp.Vector3(0, -115, -1); //new mp.Vector3(0.0, 0.0, 3.5);

const CarbineAttachmentPos = new mp.Vector3(0.10, -0.16, 0.01); //new mp.Vector3(-0.1, -0.15, -0.13);
const CarbineAttachmentRot = new mp.Vector3(0, 143, 0); //new mp.Vector3(0.0, 0.0, 3.5);

const RPGAttachmentPos = new mp.Vector3(0.22, -0.17, -0.08);
const RPGAttachmentRot = new mp.Vector3(-4, 21, -2);

const MGAttachmentPos = new mp.Vector3(-0.2, -0.17, 0.07);
const MGAttachmentRot = new mp.Vector3(6, 34, -4);

//const RPGAttachmentPos = new mp.Vector3(0.27, -0.18, 0.13); //new mp.Vector3(-0.1, -0.15, -0.13);
//const RPGAttachmentRot = new mp.Vector3(0, -1, 1); //new mp.Vector3(0.0, 0.0, 3.5);

/*
    Weapon names have to be uppercase!
    You can get attachment bone IDs from https://wiki.rage.mp/index.php?title=Bones
 */
const weaponAttachmentData = {
    // Melee
    "WEAPON_NIGHTSTICK": { Slot: "SKEL_R_Thigh", AttachBone: 51826, AttachPosition: meleeAttachmentPos, AttachRotation: meleeAttachmentRot },

    // Pistols
    "WEAPON_PISTOL": { Slot: "RIGHT_THIGH", AttachBone: 11816, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_PISTOL_MK2": { Slot: "RIGHT_THIGH", AttachBone: 11816, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_COMBATPISTOL": { Slot: "RIGHT_THIGH", AttachBone: 11816, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_APPISTOL": { Slot: "RIGHT_THIGH", AttachBone: 11816, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_STUNGUN": { Slot: "RIGHT_THIGH", AttachBone: 11816, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_PISTOL50": { Slot: "RIGHT_THIGH", AttachBone: 11816, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_SNSPISTOL": { Slot: "RIGHT_THIGH", AttachBone: 11816, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_SNSPISTOL_MK2": { Slot: "RIGHT_THIGH", AttachBone: 11816, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_HEAVYPISTOL": { Slot: "RIGHT_THIGH", AttachBone: 11816, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_VINTAGEPISTOL": { Slot: "RIGHT_THIGH", AttachBone: 11816, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_REVOLVER": { Slot: "RIGHT_THIGH", AttachBone: 11816, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_REVOLVER_MK2": { Slot: "RIGHT_THIGH", AttachBone: 11816, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_DOUBLEACTION": { Slot: "RIGHT_THIGH", AttachBone: 11816, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },
    "WEAPON_RAYPISTOL": { Slot: "RIGHT_THIGH", AttachBone: 11816, AttachPosition: PistolAttachmentPos, AttachRotation: PistolAttachmentRot },

    // Submachine Guns
    "WEAPON_MICROSMG": { Slot: "LEFT_THIGH", AttachBone: 11816, AttachPosition: MicroSMGAttachmentPos, AttachRotation: MicroSMGAttachmentRot },
    "WEAPON_SMG": { Slot: "LEFT_THIGH", AttachBone: 24818, AttachPosition: SMGAttachmentPos, AttachRotation: SMGAttachmentRot },
    "WEAPON_SMG_MK2": { Slot: "LEFT_THIGH", AttachBone: 24818, AttachPosition: SMGAttachmentPos, AttachRotation: SMGAttachmentRot },
    "WEAPON_ASSAULTSMG": { Slot: "LEFT_THIGH", AttachBone: 24818, AttachPosition: SMGAttachmentPos, AttachRotation: SMGAttachmentRot },
    "WEAPON_COMBATPDW": { Slot: "LEFT_THIGH", AttachBone: 24818, AttachPosition: SMGAttachmentPos, AttachRotation: SMGAttachmentRot },
    "WEAPON_MACHINEPISTOL": { Slot: "LEFT_THIGH", AttachBone: 24818, AttachPosition: SMGAttachmentPos, AttachRotation: SMGAttachmentRot },
    "WEAPON_MINISMG": { Slot: "LEFT_THIGH", AttachBone: 24818, AttachPosition: SMGAttachmentPos, AttachRotation: SMGAttachmentRot },

    // Shotguns
    "WEAPON_PUMPSHOTGUN": { Slot: "LEFT_BACK", AttachBone: 24818, AttachPosition: ShotgunAttachmentPos, AttachRotation: ShotgunAttachmentRot },
    "WEAPON_PUMPSHOTGUN_MK2": { Slot: "LEFT_BACK", AttachBone: 24818, AttachPosition: ShotgunAttachmentPos, AttachRotation: ShotgunAttachmentRot },
    "WEAPON_SAWNOFFSHOTGUN": { Slot: "LEFT_BACK", AttachBone: 24818, AttachPosition: ShotgunAttachmentPos, AttachRotation: ShotgunAttachmentRot },
    "WEAPON_ASSAULTSHOTGUN": { Slot: "LEFT_BACK", AttachBone: 24818, AttachPosition: ShotgunAttachmentPos, AttachRotation: ShotgunAttachmentRot },
    "WEAPON_BULLPUPSHOTGUN": { Slot: "LEFT_BACK", AttachBone: 24818, AttachPosition: ShotgunAttachmentPos, AttachRotation: ShotgunAttachmentRot },
    "WEAPON_HEAVYSHOTGUN": { Slot: "LEFT_BACK", AttachBone: 24818, AttachPosition: ShotgunAttachmentPos, AttachRotation: ShotgunAttachmentRot },

    // Rifles
    "WEAPON_ASSAULTRIFLE": { Slot: "RIGHT_BACK", AttachBone: 24818, AttachPosition: RifleAttachmentPos, AttachRotation: RifleAttachmentRot },
    "WEAPON_ASSAULTRIFLE_MK2": { Slot: "RIGHT_BACK", AttachBone: 24818, AttachPosition: RifleAttachmentPos, AttachRotation: RifleAttachmentRot },
    "WEAPON_CARBINERIFLE": { Slot: "RIGHT_BACK", AttachBone: 24818, AttachPosition: CarbineAttachmentPos, AttachRotation: CarbineAttachmentRot },
    "WEAPON_CARBINERIFLE_MK2": { Slot: "RIGHT_BACK", AttachBone: 24818, AttachPosition: RifleAttachmentPos, AttachRotation: RifleAttachmentRot },
    "WEAPON_SPECIALCARBINE": { Slot: "RIGHT_BACK", AttachBone: 24818, AttachPosition: RifleAttachmentPos, AttachRotation: RifleAttachmentRot },
    "WEAPON_SPECIALCARBINE_MK2": { Slot: "RIGHT_BACK", AttachBone: 24818, AttachPosition: RifleAttachmentPos, AttachRotation: RifleAttachmentRot },
    "WEAPON_MARKSMANRIFLE": { Slot: "RIGHT_BACK", AttachBone: 24818, AttachPosition: RifleAttachmentPos, AttachRotation: RifleAttachmentRot },
    "WEAPON_MARKSMANRIFLE_MK2": { Slot: "RIGHT_BACK", AttachBone: 24818, AttachPosition: RifleAttachmentPos, AttachRotation: RifleAttachmentRot },

    // Snipers
    //"WEAPON_HEAYSNIPER_MK2": { Slot: "RIGHT_BACK", AttachBone: 24818, AttachPosition: SniperAttachmentPos, AttachRotation: SniperAttachmentRot },

    // RPGs
    "WEAPON_RPG": { Slot: "RIGHT_BACK", AttachBone: 24818, AttachPosition: RPGAttachmentPos, AttachRotation: RPGAttachmentRot },

    //MGs
    "WEAPON_MINIGUN": { Slot: "RIGHT_BACK", AttachBone: 24818, AttachPosition: MGAttachmentPos, AttachRotation: MGAttachmentRot },


};

// Update weaponAttachmentData with attachment name and model
for (let weapon in weaponAttachmentData) {
    let hash = mp.joaat(weapon);

    if (weaponData[hash]) {
        weaponAttachmentData[weapon].AttachName = `WDSP_${weaponData[hash].HashKey}`;
        weaponAttachmentData[weapon].AttachModel = weaponData[hash].ModelHashKey;
    } else {
        console.log(`[!] ${weapon} not found in weapon data file and will cause issues, remove it from weaponAttachmentData.`);
    }
}

mp.events.add("playerReady", (player) => {
    player._bodyWeapons = {};
    player.call("registerWeaponAttachments", [JSON.stringify(weaponAttachmentData)]);
});

mp.events.add("playerWeaponChange", (player, oldWeapon, newWeapon) => {
    if(player.adminDuty) { return; }
    if (weaponData[oldWeapon]) {
        let oldWeaponKey = weaponData[oldWeapon].HashKey;
        if (weaponAttachmentData[oldWeaponKey]) {
            // Remove the attached weapon that is occupying the slot
            let slot = weaponAttachmentData[oldWeaponKey].Slot;
            if (player._bodyWeapons[slot] && player.hasAttachment(player._bodyWeapons[slot])) player.addAttachment(player._bodyWeapons[slot], true);

            // Attach the updated old weapon
            let attachName = weaponAttachmentData[oldWeaponKey].AttachName;
            player.addAttachment(attachName, false);
            player._bodyWeapons[slot] = attachName;
        }
    }

    if (weaponData[newWeapon]) {
        let newWeaponKey = weaponData[newWeapon].HashKey;
        if (weaponAttachmentData[newWeaponKey]) {
            // De-attach the new/current weapon (if attached)
            let slot = weaponAttachmentData[newWeaponKey].Slot;
            let attachName = weaponAttachmentData[newWeaponKey].AttachName;

            if (player._bodyWeapons[slot] === attachName) {
                if (player.hasAttachment(attachName)) player.addAttachment(attachName, true);
                delete player._bodyWeapons[slot];
            }
        }
    }
});