class serverShops {
    constructor() {

        const CONFIG = require('./chatformatconf.js').CONFIG
        this.colShapeMngr = [];

        mp.events.add({
            'packagesLoaded': () => {
                const { server_shops } = require('../models')
                server_shops.findAll({
                    benchmark: true,
                    logging: (sql, timingMs) => mp.log(`${CONFIG.consoleGreen}[SHOPS]${CONFIG.consoleWhite} Loaded all shops into the server [Executed in ${timingMs} ms]`),
                }).then((shops) => {
                    if(shops.length > 0) {
                        shops.forEach((shop) => {
                            mp.labels.new(`Shop: ${shop.shopName} ID: ${shop.id}`, new mp.Vector3(JSON.parse(shop.position)),
                            {
                                font: 4,
                                drawDistance: 30,
                                color: [255, 0, 0, 255],
                                dimension: 0
                            });
                            mp.blips.new(59, new mp.Vector3(JSON.parse(shop.position)),
                            {
                                name: shop.shopName,
                                shortRange: true,
                            });
                            let staticPed = mp.peds.new(mp.joaat('a_m_y_vinewood_01'), new mp.Vector3(JSON.parse(shop.position)),
                            {
                                dynamic: false, // still server-side but not sync'ed anymore
                                frozen: true,
                                invincible: true
                            });
                            staticPed.setVariable('storePed', shop.id);
                            var shopCol = mp.colshapes.newRectangle(JSON.parse(shop.position).x, JSON.parse(shop.position).y, 5, 5, 0)
                            this.colShapeMngr.push(shopCol);
                        })
                    }
                })
            },
            'playerEnterColshape': (player, shape) => {
                this.colShapeMngr.forEach((shop) => {
                    if(shop == shape) {
                        player.setVariable('inStore', true);
                    }
                })
            },
            'playerExitColshape': (player, shape) => {
                this.colShapeMngr.forEach((shop) => {
                    if(shop == shape) {
                        player.setVariable('inStore', false);
                    }
                })
            }
        })

        mp.cmds.add(['robstore', 'robshop'], async(player) => {
            if(player.getVariable('inStore') == true) {
                const checkStore = await player.callProc('proc:checkRobPed')
                if(checkStore) {
                    if(this.robInterval) { clearInterval(this.robInterval) }
                    this.robInterval = setInterval(() => {
                        player.setVariable('robStore:data', true)
                        player.setVariable('isRobbingStore', true);
                        const { server_shops } = require('../models')
                        server_shops.findAll({ where: {id: checkStore.getVariable('storePed')} }).then((shop) => {
                            if(shop[0].moneyAmount < 0) {
                                clearInterval(this.robInterval)
                                player.setVariable('robStore:data', false)
                                mp.chat.info(player, `You have robbed this store for all of its money.`)
                                const { characters } = require('../models')
                                characters.update({
                                    moneyAmount: parseInt(player.moneyAmount)
                                }, {where: {id: player.characterId}})
                            }
                            if(shop.length > 0) {
                                server_shops.update({
                                    moneyAmount: shop[0].moneyAmount - 50
                                }, { where: {id: checkStore.getVariable('storePed')} }).then(() => {
                                    player.moneyAmount = player.moneyAmount + 50;
                                    player.call('notifCreate', ['~g~$50'])
                                })
                             }
                        })
                    }, 3000);
                }
             }
        })

    }
 }
 new serverShops()