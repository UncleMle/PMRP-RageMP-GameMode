const despawnTimer = 1800000; // 30 minutes (NLR time)
const player = mp.players.local;

/*
let entityManager = {
    corpses: [],
    vehicles: [],
    localPlayers: [],

    addLocal: function(player) {
        this.localPlayers.push(player);
    },

    removeLocal: function(player) {
        this.localPlayers.splice(player, 1);
    },

    addVeh: function(vehicle) {
        this.vehicles.push(vehicle);
    },

    removeVeh: function(vehicle) {
        this.vehicles.splice(vehicle, 1);
    },

    addCorpse: function(corpse) {
        this.corpses.push(corpse);
    },

    removeCorpse: function(corpse) {
        this.corpses.splice(corpse, 1);
    }
}

setInterval(() => {
    entityManager.vehicles.forEach((veh) => {
        entityManager.corpses.forEach((corpse) => {
            if(corpse && veh) {
                veh.setNoCollision(corpse.handle, false);
            }
        })
    })
}, 2000);

mp.peds.newLegacy = (hash, position, heading, streamIn, dimension) => {
    let ped = mp.peds.new(hash, position, heading, dimension);
    ped.streamInHandler = streamIn;
    return ped;
};

mp.events.add({
    "entityStreamIn": (entity) => {
        if(entity.type == 'vehicle') {
            entityManager.addVeh(entity);
        }
        if(entity.type == 'player') {
            entityManager.addLocal(entity);
        }
        if (entity.streamInHandler) {
            entity.streamInHandler(entity);
        }
        if(entity.type == 'ped') {
            entityManager.addCorpse(entity);
        }
    },
    'entityStreamOut': (entity) => {
        if(entity.type == 'vehicle') {
            entityManager.removeVeh(entity);
        }
        if(entity.type == 'player') {
            entityManager.removeLocal(entity);
        }
        if(entity.type == 'ped') {
            entityManager.removeCorpse(entity);
        }
    }
});

mp.events.add({
    'corpse:create': (pos, mask, hair, torso, leg, bags, shoes, acess, undershirt, armor, decals, tops, hats, glasses, ears, watches, bracelets) => {
        body = mp.peds.newLegacy(mp.game.joaat('mp_m_freemode_01'), new mp.Vector3(pos.x, pos.y, pos.z), pos.z, ped => {
            ped.freezePosition(true);
            ped.setProofs(false, false, false, false, false, false, false, false);
        }, 0);
        body.setComponentVariation(1, parseInt(mask), 0, 0);
        body.setComponentVariation(2, parseInt(hair), 0, 0);
        body.setComponentVariation(3, parseInt(torso), 0, 0);
        body.setComponentVariation(4, parseInt(leg), 0, 0);
        body.setComponentVariation(5, parseInt(bags), 0, 0);
        body.setComponentVariation(6, parseInt(shoes), 0, 0);
        body.setComponentVariation(7, parseInt(acess), 0, 0);
        body.setComponentVariation(8, parseInt(undershirt), 0, 0);
        body.setComponentVariation(9, parseInt(armor), 0, 0);
        body.setComponentVariation(10, parseInt(decals), 0, 0);
        body.setComponentVariation(11, parseInt(tops), 0, 0);    //mp.players.local.taskPlayAnim("dead", "dead_a", 8.0, 0, 600, 1, 1.0, false, false, false);
        body.setPropIndex(0, parseInt(hats), 0, true);
        body.setPropIndex(1, parseInt(glasses), 0, true);
        body.setPropIndex(2, parseInt(ears), 0, true);
        body.setPropIndex(6, parseInt(watches), 0, true);
        body.setPropIndex(7, parseInt(bracelets), 0, true);
        mp.game.streaming.requestAnimDict("dead"); //preload the animation
        body.taskPlayAnim("dead", "dead_a", 8.0, 1.0, -1, 1, 1.0, false, false, false);
        entityManager.addCorpse(body);
        setTimeout(() => {
            if(body) {
                entityManager.removeCorpse(body);
            }
        }, 20000);
    },
    'getPosName': () => {
        zoneName = mp.game.gxt.get(mp.game.zone.getNameOfZone(player.position.x, player.position.y, player.position.z));
        return zoneName;
    },
    'render': () => {
        // For Debug: mp.gui.chat.push(`${entityManager.vehicles.length} ${entityManager.corpses.length}`)
    }
})
*/