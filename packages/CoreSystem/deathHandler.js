let CONFIG = require('./chatformatconf.js').CONFIG;
const db = require('../models');

let respawnTimer = 900000; // 15 minutes 900000
const hospitalCoords = [
    new mp.Vector3(340.6430969238281, -1396.09228515625, 32.50926971435547),
    new mp.Vector3(-450.0058288574219, -340.5953369140625, 34.50172805786133),
    new mp.Vector3(360.2090148925781, -585.2518920898438, 28.821245193481445),
    new mp.Vector3(1839.369140625, 3672.39794921875, 34.27670669555664),
    new mp.Vector3(-242.74436950683594, 6325.830078125, 32.426185607910156)
];

hospitalCoords.forEach((pos) => {
    mp.blips.new(61, pos,
    {
        name: 'Hospital',
        color: 75,
        shortRange: true,
    });
})

mp.events.add({
    "playerReady": (player) => {
        player.respawner = null;
    },
    "playerDeath": async(player, reason, killer) => {
        if(player.adminDuty || player.getVariable('adminJailed')) {
            player.spawn(player.position);
            return;
        }
        mp.players.forEach(async(ps) => {
            if(ps.isAdmin > 2) {
                if(reason == 133987706 || reason == 2741846334) {
                    mp.chat.ac(ps, `!{white} ${player.characterName} [${player.id}] died due to vehicle ${killer ? `from ${killer.characterName} [${killer.id}]` : ''}`)
                    mp.log(`${CONFIG.consoleRed}[AC]${CONFIG.consoleWhite} ${player.characterName} [${player.id}] died due to vehicle ${killer ? `from ${killer.characterName} [${killer.id}]` : ''}`)
                }
                if(killer && killer.weapon && reason !== (133987706 || 2741846334)) {
                    mp.chat.ac(ps, `!{white}${player.characterName} [${player.id}] [!{white} PING: !{#80ff8c}${player.ping}!{white}] was killed by ${killer.characterName} [${killer.id}] with ${player.getVariable('lastWepToHit') ? `${player.getVariable('lastWepToHit')}` : `not known`} [!{white} PING: !{#80ff8c}${killer.ping}!{white}]`)
                    mp.log(`${CONFIG.consoleRed}[AC]${CONFIG.consoleWhite} ${player.characterName} [${player.id}] [PING: ${player.ping}] was killed by ${killer.characterName} [${killer.id}] with ${player.getVariable('lastWepToHit') ? `${player.getVariable('lastWepToHit')}` : `not known`} [PING: ${killer.ping}]`)
                }
                else {
                    mp.chat.ac(ps, `!{white}${player.characterName} [${player.id}] [!{white} PING: !{#80ff8c}${player.ping}!{white}] was killed ( Last Hit: ${player.getVariable('lastWepToHit') ? `${player.getVariable('lastWepToHit')}` : `not known`} )`)
                    mp.log(`${CONFIG.consoleRed}[AC]${CONFIG.consoleWhite} ${player.characterName} [${player.id}] [PING: ${player.ping}] was killed ( Last Hit: ${player.getVariable('lastWepToHit') ? `${player.getVariable('lastWepToHit')}` : `not known`} ) `)
                }
            }
        })
        if(player.getVariable('adminJailed') == true) {
            player.spawn(new mp.Vector3(3055, -4703.1, 15.3));
            return;
        }
        startDeath(player);
        if(killer) {player.setVariable('killer', killer.characterId)}
    },
    'slayPlayer': async(player) => {
        player.injuredPos = player.position;
        respawnAtHospital(player);
    },
    "playerQuit": (player) => {
        if (player.respawner) clearTimeout(player.respawner);
    },
    'playerJoin': (player) => {
        player.setVariable('injured', false)
    },
    'startInjured': (player, time) => {
        injurePlayer(player, time);
        player.call('startDeath', [(time / 1000)]);
    },
    'saveDeathData': (player, time) => {
        db.characters.update({
            isInjured: 1,
            injuredTime: (time * 1000),
        }, { where: {id: player.characterId}})
    },
    'removeData': (player) => {
        db.characters.update({
            isInjured: 0,
            injuredTime: 0,
        }, {where: {id: player.characterId}})
    },
});

function startDeath(player) {
    if(player.getVariable('injured') == true) {
        respawnAtHospital(player);
    }
    else if(player.getVariable('injured') == false) {
        injurePlayer(player, respawnTimer);
        player.call('startDeath', [(respawnTimer / 1000)]);
    }
}

async function injurePlayer(player, respawnTime) {
    player.injuredPos = player.position;

    player.spawn(player.position);
    player.health = 50;
    player.call('freezePlayer');
    mp.chat.info(player, `You have been injured call 911 for medical assistance or you will bleed out in 15 minutes!`)
    player.setVariable('injured', true);

    player.respawner = setTimeout(() => {
        if(player.getVariable('injured') == false) {
            return;
        }
        player.stopAnimation();
        respawnAtHospital(player);
    }, respawnTime);
}

async function respawnAtHospital(player) {
    player.health = 100;
    clearTimeout(player.respawner)
    let closestHospital = 0;
    let minDist = 9999.0;

    for (let i = 0, max = hospitalCoords.length; i < max; i++) {
        let dist = player.dist(hospitalCoords[i]);
        if (dist < minDist) {
            minDist = dist;
            closestHospital = i;
        }
    }
    player.hunger = 100;
    player.thirst = 100;
    player.call('endDeath');
    player.call('unfreezePlayer');
    player.stopAnimation();
    player.outputChatBox(`!{#ff73a9}[Death]!{white} You have died and respawned at the nearest hostpital. !{red}NLR is now in effect!{white} and you must disregard the last 30 minutes of roleplay prior to your death.`)

    if(!player.getVariable('lastWepToHit')) {player.setVariable('lastWepToHit', 'Not known') }

    player.setVariable('injured', false);
    mp.events.call('removeData', player)

    player.setVariable('injured', false);
    player.setVariable('lastWepToHit', null)

    try {
        player.spawn(hospitalCoords[closestHospital]);
        player.setVariable('injured', false);
        mp.events.call('removeData', player)
        player.setVariable('injured', false);
        player.setVariable('lastWepToHit', null)
        player.hunger = 100;
        player.thirst = 100;
        player.call('endDeath');
        player.call('unfreezePlayer');
        player.stopAnimation();

        db.characters.update({
            position: JSON.stringify(player.position)
        }, { where: {id: player.characterId} })
    } catch(e) { mp.log(e) }
}