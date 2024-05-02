class clothingStores {
    constructor() {
        require('../CoreSystem/coreApi')
        const CONFIG = require('../CoreSystem/chatformatconf').CONFIG
        this.colShapeMngr = []
        const db = require('../models');

        mp.events.add({
            'packagesLoaded': () => {
                const { clothing_stores } = require('../models')
                clothing_stores.findAll({
                    benchmark: true,
                    logging: (sql, timingMs) => mp.log(`${CONFIG.consoleGreen}[CLOTHING SHOPS]${CONFIG.consoleWhite} Loaded all clothing shops into the server [Executed in ${timingMs} ms]`),
                }).then((clothesShops) => {
                    if (clothesShops.length > 0) {
                        clothesShops.forEach((shop) => {

                        })
                    }
                })
            },
            'playerEnterColshape': (player, shape) => {
                this.colShapeMngr.forEach((shop) => {
                    if (shop == shape) {
                        player.setVariable('inClothingStore', true);
                        player.call('requestBrowser', [`gui.notify.showNotification("Press 'Y' to interact with clothing store.", true, false, false, 'fa-solid fa-circle-info')`])
                    }
                })
            },
            'playerExitColshape': async (player, shape) => {
                this.colShapeMngr.forEach(async (shop) => {
                    if (shop == shape) {
                        player.setVariable('inClothingStore', false);
                        if (!player.adminDuty) { mp.events.call('previewCharacter', player, player.characterName) }
                        player.call('requestBrowser', [`gui.notify.clearAll()`])
                        const getRoute = await player.callProc('proc:getRoute')
                        if (getRoute == 'clothing') {
                            mp.events.call('resetClothes:server', player)
                            player.call('closeRoute');
                        }
                    }
                })
            },
            'clothingChange:sync': async (player, cid, draw, texture) => {
                if (cid == 11) {
                    const torsoDataMale = require('./torsoDataM.json');
                    const torsoDataFemale = require('./torsoDataF.json');
                    const models = [mp.joaat('mp_m_freemode_01'), mp.joaat('mp_f_freemode_01')]
                    if (player.model == models[0]) {
                        if (torsoDataMale[draw] === undefined || torsoDataMale[draw][texture] === undefined) {
                            return;
                        } else {
                            mp.players.forEachInRange(player.position, 200,
                                async (ps) => {
                                    if (torsoDataMale[draw][texture].BestTorsoDrawable != -1) ps.call('setTorso', [player, 3, torsoDataMale[draw][texture].BestTorsoDrawable, torsoDataMale[draw][texture].BestTorsoTexture]);
                                    ps.call('setEntComponents', [player, cid, draw, texture])
                                })
                        }
                    } else if (player.model == models[1]) {
                        if (torsoDataFemale[draw] === undefined || torsoDataFemale[draw][texture] === undefined) {
                            return;
                        } else {
                            mp.players.forEachInRange(player.position, 200,
                                async (ps) => {
                                    if (torsoDataFemale[draw][texture].BestTorsoDrawable != -1) ps.call('setTorso', [player, 3, torsoDataFemale[draw][texture].BestTorsoDrawable, torsoDataFemale[draw][texture].BestTorsoTexture]);
                                    ps.call('setEntComponents', [player, cid, draw, texture])
                                })
                        }
                    }
                } else if (cid != 11) {
                    mp.players.forEachInRange(player.position, 200,
                        async (ps) => {
                            ps.call('setEntComponents', [player, cid, draw, texture])
                        })
                }
            },
            'playerBuyClothes:server': (player, componentId, type, texture, torso) => {
                mp.players.forEachInRange(player.position, 200,
                    async (ps) => {
                        if (ps.getVariable('loggedIn')) {
                            ps.call('setEntityClothes', [player, componentId, type, texture])
                        }
                    })
                const { player_clothes } = require('../models')
                player_clothes.findAll({ where: { OwnerId: player.characterId } }).then((clothes) => {
                    if (clothes.length > 0) {
                        const json = JSON.parse(clothes[0].data)
                        switch (componentId) {
                            case 1: {
                                var data = `{"mask": ${parseInt(type)}, "maskTexture": ${texture}, "torso": ${torso}, "Leg": ${json.Leg}, "LegTexture": ${json.LegTexture}, "bags": ${json.bags}, "bagTexture": ${json.bagTexture}, "shoes": ${json.shoes}, "shoesTexture": ${json.shoesTexture}, "acess": ${json.acess}, "acessTexture": ${json.acessTexture}, "undershirt": ${json.undershirt}, "undershirtTexture": ${json.undershirtTexture}, "armor": ${json.armor}, "decals": ${json.decals}, "decalsTexture": ${json.decalsTexture}, "tops": ${json.tops}, "topsTexture": ${json.topsTexture}}`
                                player_clothes.update({
                                    data: data
                                }, { where: { OwnerId: player.characterId } }).then(() => {
                                    player.call('requestBrowser', [`gui.notify.showNotification("You have purchased a new mask for $300", false, true, 3000, 'fa-solid fa-circle-info')`])
                                    mp.events.call('player:setClothing', player)
                                })
                                break;
                            }
                            case 3: {
                                var data = `{"mask": ${json.mask}, "maskTexture": ${json.maskTexture}, "torso": ${torso}, "Leg": ${json.Leg}, "LegTexture": ${json.LegTexture}, "bags": ${json.bags}, "bagTexture": ${json.bagTexture}, "shoes": ${json.shoes}, "shoesTexture": ${json.shoesTexture}, "acess": ${json.acess}, "acessTexture": ${json.acessTexture}, "undershirt": ${json.undershirt}, "undershirtTexture": ${json.undershirtTexture}, "armor": ${json.armor}, "decals": ${json.decals}, "decalsTexture": ${json.decalsTexture}, "tops": ${json.tops}, "topsTexture": ${json.topsTexture}}`
                                player_clothes.update({
                                    data: data
                                }, { where: { OwnerId: player.characterId } }).then(() => {
                                    player.call('requestBrowser', [`gui.notify.showNotification("You have purchased a new Torso item for $50", false, true, 3000, 'fa-solid fa-circle-info')`])
                                    mp.events.call('player:setClothing', player)
                                })
                                break;
                            }
                            case 4: {
                                var data = `{"mask": ${json.mask}, "maskTexture": ${json.maskTexture}, "torso": ${torso}, "Leg": ${type}, "LegTexture": ${texture}, "bags": ${json.bags}, "bagTexture": ${json.bagTexture}, "shoes": ${json.shoes}, "shoesTexture": ${json.shoesTexture}, "acess": ${json.acess}, "acessTexture": ${json.acessTexture}, "undershirt": ${json.undershirt}, "undershirtTexture": ${json.undershirtTexture}, "armor": ${json.armor}, "decals": ${json.decals}, "decalsTexture": ${json.decalsTexture}, "tops": ${json.tops}, "topsTexture": ${json.topsTexture}}`
                                player_clothes.update({
                                    data: data
                                }, { where: { OwnerId: player.characterId } }).then(() => {
                                    player.call('requestBrowser', [`gui.notify.showNotification("You have purchased a new Leg item for $200", false, true, 3000, 'fa-solid fa-circle-info')`])
                                    mp.events.call('player:setClothing', player)
                                })
                                break;
                            }
                            case 5: {
                                var data = `{"mask": ${json.mask}, "maskTexture": ${json.maskTexture}, "torso": ${torso}, "Leg": ${json.Leg}, "LegTexture": ${json.LegTexture}, "bags": ${type}, "bagTexture": ${texture}, "shoes": ${json.shoes}, "shoesTexture": ${json.shoesTexture}, "acess": ${json.acess}, "acessTexture": ${json.acessTexture}, "undershirt": ${json.undershirt}, "undershirtTexture": ${json.undershirtTexture}, "armor": ${json.armor}, "decals": ${json.decals}, "decalsTexture": ${json.decalsTexture}, "tops": ${json.tops}, "topsTexture": ${json.topsTexture}}`
                                player_clothes.update({
                                    data: data
                                }, { where: { OwnerId: player.characterId } }).then(() => {
                                    player.call('requestBrowser', [`gui.notify.showNotification("You have purchased a new bag item for $600", false, true, 3000, 'fa-solid fa-circle-info')`])
                                    mp.events.call('player:setClothing', player)
                                })
                                break;
                            }
                            case 6: {
                                var data = `{"mask": ${json.mask}, "maskTexture": ${json.maskTexture}, "torso": ${torso}, "Leg": ${json.Leg}, "LegTexture": ${json.LegTexture}, "bags": ${json.bags}, "bagTexture": ${json.bagTexture}, "shoes": ${type}, "shoesTexture": ${texture}, "acess": ${json.acess}, "acessTexture": ${json.acessTexture}, "undershirt": ${json.undershirt}, "undershirtTexture": ${json.undershirtTexture}, "armor": ${json.armor}, "decals": ${json.decals}, "decalsTexture": ${json.decalsTexture}, "tops": ${json.tops}, "topsTexture": ${json.topsTexture}}`
                                player_clothes.update({
                                    data: data
                                }, { where: { OwnerId: player.characterId } }).then(() => {
                                    player.call('requestBrowser', [`gui.notify.showNotification("You have purchased a new shoe item for $600", false, true, 3000, 'fa-solid fa-circle-info')`])
                                    mp.events.call('player:setClothing', player)
                                })
                                break;
                            }
                            case 7: {
                                var data = `{"mask": ${json.mask}, "maskTexture": ${json.maskTexture}, "torso": ${torso}, "Leg": ${json.Leg}, "LegTexture": ${json.LegTexture}, "bags": ${json.bags}, "bagTexture": ${json.bagTexture}, "shoes": ${json.shoes}, "shoesTexture": ${json.shoesTexture}, "acess": ${type}, "acessTexture": ${texture}, "undershirt": ${json.undershirt}, "undershirtTexture": ${json.undershirtTexture}, "armor": ${json.armor}, "decals": ${json.decals}, "decalsTexture": ${json.decalsTexture}, "tops": ${json.tops}, "topsTexture": ${json.topsTexture}}`
                                player_clothes.update({
                                    data: data
                                }, { where: { OwnerId: player.characterId } }).then(() => {
                                    player.call('requestBrowser', [`gui.notify.showNotification("You have purchased a new accessory item for $1900", false, true, 3000, 'fa-solid fa-circle-info')`])
                                    mp.events.call('player:setClothing', player)
                                })
                                break;
                            }
                            case 8: {
                                var data = `{"mask": ${json.mask}, "maskTexture": ${json.maskTexture}, "torso": ${torso}, "Leg": ${json.Leg}, "LegTexture": ${json.LegTexture}, "bags": ${json.bags}, "bagTexture": ${json.bagTexture}, "shoes": ${json.shoes}, "shoesTexture": ${json.shoesTexture}, "acess": ${json.acess}, "acessTexture": ${json.acessTexture}, "undershirt": ${type}, "undershirtTexture": ${texture}, "armor": ${json.armor}, "decals": ${json.decals}, "decalsTexture": ${json.decalsTexture}, "tops": ${json.tops}, "topsTexture": ${json.topsTexture}}`
                                player_clothes.update({
                                    data: data
                                }, { where: { OwnerId: player.characterId } }).then(() => {
                                    player.call('requestBrowser', [`gui.notify.showNotification("You have purchased a new undershirt item for $250", false, true, 3000, 'fa-solid fa-circle-info')`])
                                    mp.events.call('player:setClothing', player)
                                })
                                break;
                            }
                            case 11: {
                                var data = `{"mask": ${json.mask}, "maskTexture": ${json.maskTexture}, "torso": ${torso}, "Leg": ${json.Leg}, "LegTexture": ${json.LegTexture}, "bags": ${json.bags}, "bagTexture": ${json.bagTexture}, "shoes": ${json.shoes}, "shoesTexture": ${json.shoesTexture}, "acess": ${json.acess}, "acessTexture": ${json.acessTexture}, "undershirt": ${json.undershirt}, "undershirtTexture": ${json.undershirtTexture}, "armor": ${json.armor}, "decals": ${json.decals}, "decalsTexture": ${json.decalsTexture}, "tops": ${type}, "topsTexture": ${texture}}`
                                player_clothes.update({
                                    data: data
                                }, { where: { OwnerId: player.characterId } }).then(() => {
                                    player.call('requestBrowser', [`gui.notify.showNotification("You have purchased a new top item for $600", false, true, 3000, 'fa-solid fa-circle-info')`])
                                    mp.events.call('player:setClothing', player)
                                })
                                break;
                            }
                            default:
                                break;
                        }
                    }
                })
            },
        })

        mp.cmds.add(['clothing'], async (player, name) => {
            if (!name) return mp.chat.info(player, `Use: /clothing [name]`);
            if (player.isAdmin > 7) {
                let shop = await db.clothing_stores.create({
                    OwnerId: player.characterId,
                    clothingName: name,
                    moneyAmount: 0,
                    items: "[]",
                    lastRobbery: 0,
                    position: JSON.stringify(player.position)
                });

                this.loadShop(shop);
                mp.chat.aPush(player, `Created new clothing store with name ${name} id ${shop.id}`);
            }
        });
    }

    loadShop(shop) {
        mp.labels.new(`~c~'~w~Y~c~'~w~ to interact. Clothing Store: ${shop.clothingName} ID: ${shop.id}`, new mp.Vector3(JSON.parse(shop.position)),
            {
                font: 4,
                drawDistance: 30,
                color: [255, 0, 0, 255],
                dimension: 0
            });
        mp.blips.new(73, new mp.Vector3(JSON.parse(shop.position)),
            {
                name: shop.shopName,
                color: 63,
                shortRange: true,
            });
        let staticPed = mp.peds.new(mp.joaat('csb_anita'), new mp.Vector3(JSON.parse(shop.position)),
            {
                dynamic: false,
                frozen: true,
                invincible: true
            });
        var shopCol = mp.colshapes.newRectangle(JSON.parse(shop.position).x, JSON.parse(shop.position).y, 7, 7, 0)
        this.colShapeMngr.push(shopCol)
    }
}
new clothingStores()