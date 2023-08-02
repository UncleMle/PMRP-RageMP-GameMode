let afkData = {};
var ps = mp.players.local;

mp.events.add({
    'clearAfkTimer': () => {
        clearTimeout(ps.afktimer);
    }
})

setInterval(function() {
    var islogged = ps.getVariable('loggedIn')
    var aduty = ps.getVariable('adminDuty')
    if(islogged) {
        if(aduty) return;
        ps.afkPos = ps.position;
    }
}, 10000);

setInterval(function() {
    var islogged = ps.getVariable('loggedIn');
        var aduty = ps.getVariable('adminDuty')
        var injured = ps.getVariable('injured');
        ps.afkPos = ps.position;
        if(ps.afkPos = ps.position && islogged && !injured) {
            if(aduty) return;
            kickTimer(ps);
            afkMath(ps);
        }
}, 900000);

async function afkMath(afkPlayer) {
    var ran1 = Math.floor(Math.random() * 9) + 1;
    var ran2 = Math.floor(Math.random() * 9) + 1;
    mp.events.call('requestBrowser', `gui.chat.push('<i class="fa-solid fa-keyboard" style="color:#ffa570"></i> <font color="#ffa570">Solve <font color="#75ff78">${ran1}</font> + <font color="#75ff78">${ran2}</font> or you will be <font color="#ff4d61">kicked</font> for AFK in two minutes. Use /afk [answer] to respond.</font>')`)
    afkData.answer = (ran1 + ran2);
    mp.events.callRemote('afkans', afkData.answer);
}

async function kickTimer(player) {
    player.afktimer = setTimeout(function() {
        mp.events.callRemote('kickP', player);
    }, 120000); // 120000 2 mins
}