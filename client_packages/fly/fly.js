const controlsIds = {
    F5: 327,
    W: 32, // 232
    S: 33, // 31, 219, 233, 268, 269
    A: 34, // 234
    E: 38,
    Q: 44,
    D: 35, // 30, 218, 235, 266, 267
    Space: 321,
    LCtrl: 326,
};
let player = mp.players.local;
global.fly = {
    flying: false, f: 11.0, w: 1.0, h: 1.0, point_distance: 1000,
};
global.gameplayCam = mp.cameras.new('gameplay');


let direction = null;
let coords = null;

function pointingAt(distance) {
    const farAway = new mp.Vector3((direction.x * distance) + (coords.x), (direction.y * distance) + (coords.y), (direction.z * distance) + (coords.z));

    const result = mp.raycasting.testPointToPoint(coords, farAway, [1, 16]);
    if (result === undefined) {
        return 'undefined';
    }
    return result;
}

mp.events.add('fly:stop', () => {
    const position = mp.players.local.position;
    player.setAlpha(255);
    player.freezePosition(false);
    player.setInvincible(false);
    mp.players.local.setCoordsNoOffset(position.x, position.y, position.z, false, false, false);
    mp.vehicles.forEach(veh => {
        veh.setNoCollision(mp.players.local.handle, true);
    });
})

mp.events.add('fly:start', () => {
    fly.flying = !fly.flying;
    player.freezePosition(true);
    player.setInvincible(true);
    player.setAlpha(0);
});

mp.events.add('render', () => {
    const controls = mp.game.controls;
    const fly = global.fly;
    direction = global.gameplayCam.getDirection();
    coords = global.gameplayCam.getCoord();

    if (mp.players.local.getVariable('adminFly') == true) {
        let updated = false;
        player.setAlpha(0);
        mp.vehicles.forEach(veh => {
            veh.setNoCollision(mp.players.local.handle, false);
        });
        const position = mp.players.local.position;
        if (controls.isControlPressed(0, controlsIds.W)) {
            if (fly.f < 8.0) { fly.f *= 11.025; }

            position.x += direction.x / (fly.f / 7);
            position.y += direction.y / (fly.f / 7);
            position.z += direction.z / (fly.f / 7);
            updated = true;
        } else if (controls.isControlPressed(0, controlsIds.S)) {
            if (fly.f < 8.0) { fly.f *= 11.025; }

            position.x -= direction.x / (fly.f / 8);
            position.y -= direction.y / (fly.f / 8);
            position.z -= direction.z / (fly.f / 8);
            updated = true;
        }
        else if(controls.isControlPressed(0, controlsIds.LCtrl)) {
            if (fly.f < 8.0) { fly.f *= 11.025; }

            position.x += direction.x / (fly.f / 60);
            position.y += direction.y / (fly.f / 60);
            position.z += direction.z / (fly.f / 60);
            updated = true;
        }
        else {
            fly.f = 2.0;
        }

        if (controls.isControlPressed(0, controlsIds.A)) {
            if (fly.l < 8.0) { fly.l *= 11.025; }

            position.x += (-direction.y) / (fly.l / 7);
            position.y += direction.x / (fly.l / 7);
            updated = true;
        } else if (controls.isControlPressed(0, controlsIds.D)) {
            if (fly.l < 8.0) { fly.l *= 11.025; }

            position.x -= (-direction.y) / (fly.l / 8);
            position.y -= direction.x / (fly.l / 8);
            updated = true;
        } else {
            fly.l = 2.0;
        }

        if (controls.isControlPressed(0, controlsIds.E)) {
            if (fly.h < 8.0) { fly.h *= 11.025; }

            position.z += (fly.h / 55);
            updated = true;
        } else if (controls.isControlPressed(0, controlsIds.Q)) {
            if (fly.h < 8.0) { fly.h *= 11.025; }

            position.z -= (fly.h / 55);
            updated = true;
        } else {
            fly.h = 2.0;
        }

        if (updated) {
            mp.players.local.setCoordsNoOffset(position.x, position.y, position.z, false, false, false);
        }
    }
});

