const db = require('../models/');

let CONFIG = require('../CoreSystem/chatformatconf.js').CONFIG
let core = require('../CoreSystem/coreApi.js').core;

mp.events.add({
    'packagesLoaded': () => {
        var colLen = null;
        db.server_colshapes.findAll({}).then((col) => {
            if(col.length > 0) {
                colLen = col.length;
                var pos = JSON.parse(col[0].data).vertices;
            }
        })
    }
})

mp.cmds.add(['col'], (player, fullText, option, ...name) => {
    if(!option) return mp.chat.info(player, `Use: /col [add/remove/modify] [name/id]`)
    if(player.isAdmin > 7) {
        switch(option) {
            case 'add':
            {
                var position = player.position;
                var col = mp.colshapes.newRectangle(position.x, position.y, 10, 10, 0)
                player.outputChatBox('Created Colshape: '+JSON.stringify(col));

                break;
            }
            case 'modify':
            {

            }
            case 'remove':
            {

            }
            default:
                mp.chat.err(player, `Enter a valid option (add or remove)`)
        }
        return
    }
    mp.chat.err(player, `${CONFIG.noauth}`)
})