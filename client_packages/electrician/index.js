/*
    krane#2890 for FiveM or RageMP development
*/

let CONFIG = require('./electrician/CONFIG.js').CONFIG;
require('./electrician/teleport_to_inaccesible.js');

let mission_data = {};
let garage_blip = null;
let garage_marker = null;
let is_working = false;

let car_delete_interval = null;
let outside_car_timer = 500;
let is_hired = false;
let left_vehicle = false;
let work_van = null;
let Electrician_Ped = mp.peds.new(mp.game.joaat(CONFIG.NPC.model), new mp.Vector3(CONFIG.NPC.x, CONFIG.NPC.y, CONFIG.NPC.z), CONFIG.NPC.heading, mp.players.local.dimension);
Electrician_Ped.freezePosition(true);
Electrician_Ped.setInvincible(true);

mp.labels.new("Electrician", new mp.Vector3(CONFIG.NPC.x, CONFIG.NPC.y, CONFIG.NPC.z + 1.0), {
    los: false,
    font: 4,
    drawDistance: 10,
    color: [255, 255, 255, 255],
    dimension: 0
});

mp.blips.new(643, new mp.Vector3(CONFIG.NPC.x, CONFIG.NPC.y, CONFIG.NPC.z), {
    name: "Electrician",
    color: 0,
    shortRange: true,
    dimension: 0
});

function stop_working() {
    is_hired = false;
    left_vehicle = false;
    work_van.destroy();
    work_van = null;
    garage_blip.destroy();
    garage_marker.destroy();

    if (car_delete_interval) {
        clearInterval(car_delete_interval);
    }
    if (mission_data.blip) {
        mission_data.blip.destroy();
    }
    if (mission_data.marker) {
        mission_data.marker.destroy();
    }
    if (mission_data.text) {
        mission_data.text.destroy();
    }
    is_working = false;
}

function hire() {
    is_hired = true;
    let Player = mp.players.local;
    Player.clearTasksImmediately();
    Player.taskTurnToFaceCoord(CONFIG.NPC.x, CONFIG.NPC.y, CONFIG.NPC.z, 0);
    Player.playFacialAnim("mic_chatter", "mp_facial");
    setTimeout(() => {
        Player.clearTasksImmediately();
    }, 1000);
    enable_garage();
}

function spawn_car() {
    //spawn van
    work_van = mp.vehicles.new(mp.game.joaat("burrito3"), new mp.Vector3(CONFIG.Garage.x, CONFIG.Garage.y, CONFIG.Garage.z), {
        numberPlate: "ELECTR",
    });
    setTimeout(() => {
        mp.players.local.setIntoVehicle(work_van.handle, -1);
    }, 500);
}

function enable_garage() {
    garage_blip = mp.blips.new(357, new mp.Vector3(CONFIG.Garage.x, CONFIG.Garage.y, CONFIG.Garage.z), {
        name: "Garage Electrician",
        color: 0,
        shortRange: true,
        dimension: 0,
        scale: 0.7,
    });

    garage_marker = mp.markers.new(1, new mp.Vector3(CONFIG.Garage.x, CONFIG.Garage.y, CONFIG.Garage.z - 1.0), 0.7, {
        color: [255, 0, 0, 100],
        visible: true,
        dimension: 0
    });
}

function get_new_mission() {
    mission_data.mission = CONFIG.broken_panels[Math.floor(Math.random() * CONFIG.broken_panels.length)];

    mission_data.blip = mp.blips.new(1, new mp.Vector3(mission_data.mission.x, mission_data.mission.y, mission_data.mission.z), {
        name: "Electrician",
        color: 5,
        shortRange: true,
        dimension: 0,
        scale: 0.7,
    });
    mission_data.blip.setRoute(true);

    mission_data.marker = mp.markers.new(1, new mp.Vector3(mission_data.mission.x, mission_data.mission.y, mission_data.mission.z - 1.0), 0.7, {
        color: [200, 160, 0, 100],
        visible: true,
        dimension: 0
    });

    mission_data.text = mp.labels.new("Repair the panel", new mp.Vector3(mission_data.mission.x, mission_data.mission.y, mission_data.mission.z), {
        los: false,
        font: 4,
        drawDistance: 10,
        color: [255, 255, 255, 255],
        dimension: 0
    });


}

function start_job() {
    is_working = true;
    mp.players.local.freezePosition(true);
    mp.players.local.taskTurnToFaceCoord(mission_data.mission.x, mission_data.mission.y, mission_data.mission.z, 0);
    mp.players.local.taskStartScenarioInPlace("WORLD_HUMAN_WELDING", 0, true);
    setTimeout(() => {
        mp.players.local.clearTasksImmediately();
        mission_data.blip.destroy();
        mission_data.marker.destroy();
        mission_data.text.destroy();
        mp.players.local.freezePosition(false);
        get_new_mission();
        is_working = false;
    }, 10000);

}

mp.keys.bind(0x45, true, function() {

    if (mp.game.system.vdist(CONFIG.Garage.x, CONFIG.Garage.y, CONFIG.Garage.z, mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z) < 2.0) {
        if (is_hired) {
            spawn_car();
            get_new_mission();
        }
    }
    if (mp.game.system.vdist(CONFIG.NPC.x, CONFIG.NPC.y, CONFIG.NPC.z, mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z) < 2.0) {
        hire();
    }

    if (mp.game.system.vdist(mission_data.mission.x, mission_data.mission.y, mission_data.mission.z, mp.players.local.position.x, mp.players.local.position.y, mp.players.local.position.z) < 2.0) {
        if (is_hired) {
            start_job();
        }
    }
});

mp.events.add("playerLeaveVehicle", (vehicle, seat) => {
    if (is_hired) {
        if (vehicle == work_van) {
            left_vehicle = true;

            car_delete_interval = setInterval(() => {
                outside_car_timer--;
                if (outside_car_timer < 0) {
                    clearInterval(car_delete_interval);
                    stop_working();
                }
            }, 1000);
        }
    }
})

mp.events.add("playerEnterVehicle", (vehicle, seat) => {
    if (is_hired) {
        if (vehicle == work_van) {
            left_vehicle = false;
            outside_car_timer = 20;
            clearInterval(car_delete_interval);
        }
    }
});

mp.events.add("render", () => {
    if (is_hired) {
        if (left_vehicle) {
            mp.game.graphics.drawText(`Get back inside the vehicle or you lose your job: ${outside_car_timer}s left.`, [0.5, 0.01], {
                font: 0,
                color: [255, 255, 255, 255],
                scale: [0.3, 0.3],
                outline: true
            });
        }
    }
});