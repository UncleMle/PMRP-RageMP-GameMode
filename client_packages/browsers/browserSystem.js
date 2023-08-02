var browserRoute = 0;
class browserSystem {
    constructor() {
        this.baseUrl = 'package://cefs/index.html'; // http://localhost:3000#/ Change on dev server to local
        this.base = mp.browsers.new(this.baseUrl);
        this.currentRoute = '/';
        this.IdleDate = new Date();
        this.direction = null;

        mp.events.add({
            'guiReady': () => {
                if(this.base) {
                    mp.gui.chat.show(false);
                    this.base.markAsChat();
                    mp.gui.chat.safeMode = true;
                }
            },
            'render': () => {
                mp.game.ui.hideHudComponentThisFrame(8); // Vehicle class
                mp.game.ui.hideHudComponentThisFrame(6); // Vehicle Name
                mp.game.ui.hideHudComponentThisFrame(7); // area name
                mp.game.ui.hideHudComponentThisFrame(9); // street name
                mp.game.ui.hideHudComponentThisFrame(3); // cash
                mp.game.graphics.disableVehicleDistantlights(true);
                mp.game.ui.setRadarZoom(1100);
                mp.game.player.setHealthRechargeMultiplier(0.0);

                // Remove AFK camera
                const dif = new Date().getTime() - this.IdleDate.getTime();
                const seconds = dif / 1000;
                if(Math.abs(seconds) > 29.5) {
                    mp.game.invoke(`0xF4F2C0D4EE209E20`); //Clear Idle Timer
                    this.IdleDate = new Date();
                }
                var position = mp.players.local.position;
                let getStreet = mp.game.pathfind.getStreetNameAtCoord(position.x, position.y, position.z, 0, 0);
                var zoneName = `${mp.game.ui.getLabelText(mp.game.zone.getNameOfZone(position.x, position.y, position.z))}`;
                var zoneTwo = `${mp.game.ui.getStreetNameFromHashKey(getStreet.streetName) ? `${mp.game.ui.getStreetNameFromHashKey(getStreet.streetName)}` : ''}`

                let heading = mp.players.local.getHeading();
                if(mp.players.local.heading != 0)
                {
                    if(heading < 45 || heading > 315)
                    {
                        this.direction = "N";
                    }
                    if(heading > 45 && heading < 135)
                    {
                        this.direction = "W";
                    }
                    if(heading > 135 && heading < 225)
                    {
                        this.direction = "S";
                    }
                    if(heading > 225 && heading < 315)
                    {
                        this.direction = "E";
                    }
                }

                if(this.base) {
                    if(mp.players.local.getVariable('banned')) {
                        this.setRoute('ban', true, true)
                        mp.gui.cursor.show(true, true);
                        mp.events.call('requestBrowser', `appSys.commit('showHud', false)`)
                        mp.gui.chat.show(false);
                        mp.game.ui.displayRadar(false);
                        mp.events.call('requestBrowser', `appSys.commit('speedoTog', false)`)
                    }
                    this.base.execute(`appSys.commit('updateHud', {
                        unix: ${Math.floor(new Date().getTime() / 1000)},
                        id: ${mp.players.local.remoteId},
                        voice: ${mp.voiceChat.muted},
                        radio: ${mp.players.local.getVariable('radio') ? true : false},
                        location: '${zoneName.replace(`'`, '')}',
                        players: ${mp.players.length},
                        money: ${mp.players.local.getVariable('cashValue')},
                        locationTwo: '${zoneTwo.replace(`'`, '')}',
                        direction: '${this.direction}',
                        fps: ${mp.players.local.frameRate ? mp.players.local.frameRate : '2000'}
                    })`)
                    this.base.execute(`appSys.commit('updateHungerThirst', {
                        hungerLvl: ${mp.players.local.getVariable('hungerAmount')},
                        thirstLvl: ${mp.players.local.getVariable('thirstAmount')}
                    })`)
                }
                if(!mp.players.local.getVariable('loggedIn')) {
                    mp.events.call('requestBrowser', `appSys.commit('showHud', false)`)
                    mp.gui.cursor.show(true, true);
                }
            },
            'requestBrowser': (name) => {
                if(this.base) {
                    if(mp.players.local.getVariable('devdebug') == true) {mp.gui.chat.push(name) }
                    this.base.execute(name);
                }
            },
            'requestRoute': (requestedRoute, cursor, chat) => {
                if(mp.players.local.getVariable('devdebug') == true) {mp.gui.chat.push(`${baseUrl}`) }
                this.setRoute(requestedRoute, cursor, chat)
                mp.players.local.currentRoute = requestedRoute;
            },
            'setPlayerProperty': (prop, casep) => {
                mp.storage.data.espConfig == undefined ? mp.storage.data.espConfig = [] : mp.storage.data.espConfig.push({ type: prop, value: casep });
                mp.players.local[prop] = casep;
            },
            'closeRoute': () => {
                this.setRoute('/', false)
                mp.events.call('requestBrowser', `appSys.commit('chatActive', true)`)
                mp.gui.cursor.show(false, false);
                mp.players.local.currentRoute = '/';
            },
            'chat:Msg': (msg) => {
                mp.events.call('requestBrowser', `gui.chat.push('${msg}')`)
            },
            'sendReport': (status, id) => {
                mp.events.callRemote('server:reportHandle', status, id);
            },
            'serverFunctionCEF': (name, argument) => {
                mp.events.callRemote(name, argument)
            },
            'client:sound': (type, lib) => {
                mp.game.audio.playSoundFrontend(-1, type, lib, true);
            },
            'createModalMenu': (icon, time, name, text, buttonText, buttonTwoText, buttonOne, buttonTwo, buttonOneArg, buttonTwoArg) => {
                if(mp.players.local.getVariable('devdebug')) {mp.gui.chat.push(`${icon} ${time} ${name} ${text} ${buttonText} ${buttonTwoText} ${buttonOne} ${buttonTwo} ${buttonOneArg} ${buttonTwoArg}`)}
                if(time == -1) {
                    mp.events.call('requestRoute', 'modal', true, true)
                    if(buttonText == null) {
                        mp.events.call('requestBrowser', `appSys.commit('updateModal', {
                            icon: '${icon}',
                            name: '${name}',
                            text: '${text}',
                        })`)
                        return
                    }
                    mp.events.call('requestBrowser', `appSys.commit('updateModal', {
                        icon: '${icon}',
                        name: '${name}',
                        text: '${text}',
                        buttonText: '${buttonText}',
                        buttonTwoText: '${buttonTwoText}',
                        buttonOne: '${buttonOne}',
                        buttonTwo: '${buttonTwo}',
                        buttonOneArg: '${buttonOneArg}',
                        buttonTwoArg: '${buttonTwoArg}'
                    })`)
                }
                else if(parseInt(time)) {
                    if(interStart) { clearInterval(interStart), totalTime = 0 }
                    var interStart = setInterval(removeTime, 1000);
                    var totalTime = time;
                    function removeTime() {
                        if(browserRoute != 'modal') { return clearInterval(interStart) }
                        mp.events.call('requestBrowser', `appSys.commit('updateModal', {
                            icon: '${icon}',
                            name: '${name}',
                            text: '${text}<br><br> [ Expires in ${Math.trunc(totalTime)} seconds ]',
                            buttonText: '${buttonText}',
                            buttonTwoText: '${buttonTwoText}',
                            buttonOne: '${buttonOne}',
                            buttonTwo: '${buttonTwo}',
                            buttonOneArg: '${buttonOneArg}',
                            buttonTwoArg: '${buttonTwoArg}'
                        })`)
                        if(totalTime <= 0) {
                            name == 'Vehicle Purchase' ? mp.events.call('dealerModal') : mp.events.call('closeRoute');
                            clearInterval(interStart)
                         }
                        totalTime--
                    }
                    mp.events.call('requestRoute', 'modal', true, true)
                    mp.events.call('requestBrowser', `appSys.commit('updateModal', {
                        icon: '${icon}',
                        name: '${name}',
                        text: '${text} [Expires in ${Math.trunc(totalTime)} seconds]',
                        buttonText: '${buttonText}',
                        buttonTwoText: '${buttonTwoText}',
                        buttonOne: '${buttonOne}',
                        buttonTwo: '${buttonTwo}',
                        buttonOneArg: '${buttonOneArg}',
                        buttonTwoArg: '${buttonTwoArg}'
                    })`)
                }
            },
            'client:buyVeh': (json) => {
                mp.events.callRemote('acceptVehicleOffer')
                if(mp.players.local.getVariable('devdebug')) {mp.gui.chat.push(`BUY: ${json}`)}
            },
            'client:denyVeh': (json) => {
                if(mp.players.local.getVariable('devdebug')) {mp.gui.chat.push(`DENY: ${json}`)}
                mp.events.callRemote('denyVehicleOffer')
            },
            'hudTog': (tog) => {
                if(tog) {
                    mp.events.call('requestBrowser', `appSys.commit('showHud', false)`)
                    mp.game.ui.displayRadar(false);
                    return
                }
                if(!tog) {
                    mp.events.call('requestBrowser', `appSys.commit('showHud', true)`)
                    mp.game.ui.displayRadar(true);
                }
            }
        })

        var playerPressed = false;
        // Online players count
        mp.keys.bind(221, false, function() {
            let istyping = mp.players.local.isTypingInTextChat;
            let islogged = mp.players.local.getVariable('loggedIn');
            if(istyping) return
            if(islogged && !mp.game.ui.isPauseMenuActive() && !mp.players.local.phoneStatus) {
                playerPressed = !playerPressed;

                if(playerPressed && mp.players.local.currentRoute == '/') {
                    mp.events.callRemote('player:getCount');
                }

                else if(mp.players.local.currentRoute == 'listMenu') {
                    mp.events.call('closeRoute')
                }
            }
        })

        // Online staff count
        var staffPress = false;
        mp.keys.bind(219, false, function() {
            let istyping = mp.players.local.isTypingInTextChat;
            let islogged = mp.players.local.getVariable('loggedIn');
            if(istyping) return
            if(islogged && !mp.game.ui.isPauseMenuActive() && !mp.players.local.phoneStatus) {
                staffPress = !staffPress;

                if(staffPress && mp.players.local.currentRoute == '/') {
                    mp.events.callRemote('staff:getCount');
                }

                else if(mp.players.local.currentRoute == 'listMenu') {
                    mp.events.call('closeRoute')
                }
            }
        })

        // Toggle Cursor script
        let f2Press = false;
        mp.keys.bind(0x71, false, function() {
            if(mp.players.local.canTogHud && mp.players.local.currentRoute != 'vehicledealer') return;
            let istyping = mp.players.local.isTypingInTextChat;
            var islogged = mp.players.local.getVariable('loggedIn')
            f2Press = !f2Press;
            if(istyping || !islogged) return
            if(f2Press && !mp.game.ui.isPauseMenuActive()) {
                mp.gui.cursor.show(true, true);
            }
            else {
                mp.gui.cursor.show(false, false);
            }
        })

        // Admin Reports
        mp.keys.bind(120, false, function() {
            let istyping = mp.players.local.isTypingInTextChat;
            let islogged = mp.players.local.getVariable('loggedIn');
            if(islogged && !istyping && !mp.game.ui.isPauseMenuActive() && !mp.players.local.phoneStatus) {
                mp.events.callRemote('staff:reports');
            }
        })

        mp.keys.bind(89, false, function () { // Y key
            if(mp.game.ui.isPauseMenuActive()) return;
            let istyping = mp.players.local.isTypingInTextChat;
            let islogged = mp.players.local.getVariable('loggedIn');
            if(istyping) return
            if(islogged && !istyping && !mp.players.local.vehicle) {
                mp.events.callRemote('getParkedVehicles', mp.players.local);
                mp.events.callRemote('getInsurancesVehs', mp.players.local);
                return;
            }
        })

        // Tog hud
        let pressed = false;
        mp.keys.bind(114, false, function () {
            if(mp.players.local.currentRoute == 'vehcustom' || mp.players.local.canTogHud) {return;}
            if(mp.game.ui.isPauseMenuActive()) {return;}
            let islogged = mp.players.local.getVariable('loggedIn');
            let istyping = mp.players.local.isTypingInTextChat;
            if(!islogged || istyping) return;
            pressed = !pressed;
            if(pressed) {
                mp.events.call('tagSt', false);
                mp.events.call('adminTags', false);
                mp.players.local.hasHud = false;
                mp.events.call('requestBrowser', `appSys.commit('showHud', false)`)
                mp.game.ui.displayRadar(false);
                mp.events.call('requestBrowser', `appSys.commit('speedoTog', false)`)
                if(mp.players.local.getVariable('injured') == true) {
                    mp.events.call('stopInjuredMessage');
                }
            }
            else {
                mp.events.call('tagSt', true)
                mp.events.call('adminTags', true)
                mp.game.ui.displayRadar(true);
                mp.players.local.hasHud = true;
                mp.events.call('requestBrowser', `appSys.commit('showHud', true)`)
                if(mp.players.local.vehicle) {mp.events.call('requestBrowser', `appSys.commit('speedoTog', true)`)}
                if(mp.players.local.getVariable('injured') == true) {
                    mp.events.call('showInjuredMessage');
                }
            }
        })

        // Inventory
        mp.keys.bind(73, false, function() {
            let istyping = mp.players.local.isTypingInTextChat;
            let islogged = mp.players.local.getVariable('loggedIn');
            if(islogged && !istyping && !mp.game.ui.isPauseMenuActive() && !mp.players.local.phoneStatus) {
                if(browserRoute == '/') {
                    mp.events.callRemote('server:getPlayerInventory');
                    return
                }
            }
        })

        // Inventory close on esc
        mp.keys.bind(27, false, function() {
            let istyping = mp.players.local.isTypingInTextChat;
            let islogged = mp.players.local.getVariable('loggedIn');
            if(islogged && !istyping && !mp.game.ui.isPauseMenuActive()) {
                if(browserRoute == 'inventory') {
                    mp.events.call('closeRoute')
                    return
                }
            }
        })

        // Alias toggles
        var aliasTog = false;
        mp.keys.bind(121, false, function() {
            let istyping = mp.players.local.isTypingInTextChat;
            let islogged = mp.players.local.getVariable('loggedIn');
            if(islogged && !istyping && !mp.game.ui.isPauseMenuActive()) {
                aliasTog = !aliasTog;
                if(aliasTog) {
                    mp.events.call('requestBrowser', `gui.notify.showNotification('You have toggled aliases for other players off.', false, true, 8000, 'fa-solid fa-circle-info')`)
                    mp.events.call('setPlayerProperty', 'aliasTog', true)
                    return
                }
                else if(!aliasTog){
                    mp.events.call('requestBrowser', `gui.notify.showNotification('You have toggled aliases for other players on.', false, true, 8000, 'fa-solid fa-circle-info')`)
                    mp.events.call('setPlayerProperty', 'aliasTog', false)
                 }

            }
        })

        // Get players current route
        mp.events.addProc({
            'proc:getRoute': () => {
                return this.currentRoute;
            }
        })

    }
z
    setRoute(route, cursor, chat) {
        if(this.base) {
            this.base.execute(`router.push('${route}')`)
            this.currentRoute = route;
            browserRoute = route;
        }
        if(cursor) {mp.gui.cursor.show(true, true);}
        if(chat) { mp.events.call('requestBrowser', `appSys.commit('chatActive', false)`) }
    }

}
new browserSystem()