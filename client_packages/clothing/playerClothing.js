const player = mp.players.local;

mp.events.add({
    'setClothes': (mask, hair, torso, leg, bags, shoes, acess, undershirt, armor, decals, tops) => {
        player.setComponentVariation(1, parseInt(mask), 0, 0);
        player.setComponentVariation(2, parseInt(hair), 0, 0);
        player.setComponentVariation(3, parseInt(torso), 0, 0);
        player.setComponentVariation(4, parseInt(leg), 0, 0);
        player.setComponentVariation(5, parseInt(bags), 0, 0);
        player.setComponentVariation(6, parseInt(shoes), 0, 0);
        player.setComponentVariation(7, parseInt(acess), 0, 0);
        player.setComponentVariation(8, parseInt(undershirt), 0, 0);
        player.setComponentVariation(9, parseInt(armor), 0, 0);
        player.setComponentVariation(10, parseInt(decals), 0, 0);
        player.setComponentVariation(11, parseInt(tops), 0, 0);
    },
    'setProps': (hats, glasses, ears, watches, bracelets) => {
        player.setPropIndex(0, parseInt(hats), 0, true);
        player.setPropIndex(1, parseInt(glasses), 0, true);
        player.setPropIndex(2, parseInt(ears), 0, true);
        player.setPropIndex(6, parseInt(watches), 0, true);
        player.setPropIndex(7, parseInt(bracelets), 0, true);
    }
})