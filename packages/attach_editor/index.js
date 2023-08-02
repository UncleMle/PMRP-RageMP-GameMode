const fs = require('fs');

const objectsList = [
    'prop_fishing_rod_01',
    'prop_ld_fireaxe',
    'w_ar_assaultrifle',
    'w_sg_pumpshotgun',
    'w_sb_pdw',
    'w_ar_carbinerifle',
    'w_sb_microsmg',
    'w_sb_smg',
    'w_lr_rpg',
    'w_pi_pistol50',
    'w_mg_combatmg',
    'w_mg_minigun',
    'w_lr_rpg',
    'w_me_nightstick',
    'prop_cs_fuel_nozle',
    'p_amb_phone_01'
];

const bodyParts = [{
        name: 'Skel root',
        id: 0
    },

    {
        name: 'Right hand',
        id: 57005
    },

    {
        name: 'SKEL_Spine_Root',
        id: 57597
    },

    {
        name: 'SKEL_ROOT',
        id: 0
    },

    {
        name: 'Right Back',
        id: 24818
    },

    {
        name: 'SKEL_Pelvis',
        id: 11816
    },
    {
        name: 'SKEL_Spine1',
        id: 24816
    },
    {
        name: 'SKEL_Spine2',
        id: 24817
    },
    {
        name: 'SKEL_Spine3',
        id: 24818
    },

    {
        name: 'Left hand',
        id: 18905
    },

    {
        name: 'SKEL_L_Foot',
        id: 14201
    },

    {
        name: 'RB_L_ThighRoll',
        id: 23639
    },

    {
        name: 'SKEL_R_Thigh',
        id: 51826
    },

    {
        name: 'SKEL_L_Thigh',
        id: 58271
    },

    {
        name: 'Head',
        id: 12844
    }
];


mp.events.addCommand('attach', (player, _, object, body) => {
    if(player.isAdmin > 7) {
        let len = objectsList.length;

        if (object == undefined) {
            mp.chat.info(player, `Use: /attach [Object ID] [Bone ID]`)

            let msg = '';

            for (let i = 0; i < len; i++) {
                msg += '(' + i + ')' + objectsList[i] + ' | ';
            }
            player.outputChatBox(msg);
            return;
        }

        let id = parseInt(object);
        if (id < 0 || id > len) {
            return;
        }

        let lenBody = bodyParts.length;

        if (body == undefined) {
            let msg = '';

            for (let i = 0; i < lenBody; i++) {
                msg += '(' + i + ')' + bodyParts[i].name + ' | ';
            }
            player.outputChatBox(msg);
            return;
        }

        let bodyID = parseInt(body);
        if (bodyID < 0 || bodyID > lenBody) {
            return;
        }

        player.call("attachObject", [objectsList[id], bodyParts[bodyID].id]);
    }
})

mp.events.add('finishAttach', (player, object) => {

    let objectJSON = JSON.parse(object);
    let text = `{ ${objectJSON.object}, ${objectJSON.body}, ${objectJSON.x.toFixed(4)}, ${objectJSON.y.toFixed(4)}, ${objectJSON.z.toFixed(4)}, ${objectJSON.rx.toFixed(4)}, ${objectJSON.ry.toFixed(4)}, ${objectJSON.rz.toFixed(4)} },\r\n`;

    player.outputChatBox(text);

    fs.appendFile('./attachments.txt', text, err => {

        if (err) {
            console.error(err)
            return
        }
    });
});