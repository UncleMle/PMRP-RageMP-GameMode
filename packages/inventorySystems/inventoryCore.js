class inventorySystem {
    constructor() {
        let inventoryItems = require('./inventoryItems.json')

        mp.events.add({
            'server:getPlayerInventory': async(player) => {
                const currentRoute = await player.callProc('proc:getRoute')
                if(currentRoute == 'inventory' || currentRoute !== '/') { return }
                if(player.getVariable('loggedIn')) {
                    const { inventory_items } = require('../models')
                    inventory_items.findAll({ where: {OwnerId: player.characterId} }).then((inventory) => {
                        if(inventory.length > 0) {
                            player.call('requestBrowser', [`appSys.commit('clearInventory')`])
                            player.call('requestRoute', ['inventory', true, true])
                            inventory.forEach((inven) => {
                                player.call('requestBrowser', [`appSys.commit('addInventoryItem', {
                                    id: ${inven.id},
                                    name: '${inven.itemName}',
                                    img: '${inventoryItems.items[inven.itemId].img}',
                                    equipped: 0
                                })`])
                            })
                        }
                    })
                }
            }
        })

        mp.log(`All ${Object.keys(inventoryItems.items).length} inventory items where loaded: `)
        for(var x = 1; x <= Object.keys(inventoryItems.items).length; x++) {
            mp.log(`ID: ${x}. ${JSON.stringify(inventoryItems.items[x])}`)
        }

        mp.cmds.add(['giveitem'], async(player, fullText, id, itemId) => {
            if(!id || !itemId) return mp.chat.info(player, `Use: /giveitem [Name/ID] [itemId]`)
            if(player.isAdmin > 7) {
                var targetPlayer = mp.core.idOrName(player, id)
                if(targetPlayer) {
                    if(inventoryItems.items[parseInt(itemId)]) {
                        const { inventory_items } = require('../models')
                        inventory_items.create({
                            OwnerId: targetPlayer.characterId,
                            itemId: parseInt(itemId),
                            itemName: inventoryItems.items[parseInt(itemId)].name,
                            equipped: 0
                        }).then(() => {
                            mp.chat.aPush(player, `You gave player ${targetPlayer.characterName} [${targetPlayer.id}] item ${inventoryItems.items[parseInt(itemId)].name} ID: ${parseInt(itemId)}`)
                            mp.chat.aPush(player, `You were given a ${inventoryItems.items[parseInt(itemId)].name} by admin ${player.adminName}`)
                        })
                    }
                    else { return mp.chat.err(player, `Enter a valid inventory item index.`) }
                    return
                }
                else return mp.chat.err(player, `No player was found.`)

            }
        }),

        mp.cmds.add(['getitems'], (player, arg) => {
            if(arg != null) return mp.chat.info(player, `Use: /getitems`)
            if(player.isAdmin > 7) {
                for(var x = 1; x <= Object.keys(inventoryItems.items).length; x++) {
                    mp.chat.aPush(player, `ID: ${x} ${JSON.stringify(inventoryItems.items[x])}`)
                }
            }
        })

    }
}
new inventorySystem()