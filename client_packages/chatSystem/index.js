let chatAllowed = true;

if (mp.storage.data.timeStamp === undefined)
    mp.storage.data.timeStamp = false;
if (mp.storage.data.pageSize === undefined)
    mp.storage.data.pageSize = 18;
if (mp.storage.data.fontSize === undefined)
    mp.storage.data.fontSize = 0.9;
if (mp.storage.data.toggleChat === undefined)
    mp.storage.data.toggleChat = true;

// Mark chat as active
/*
mp.gui.chat.show(false);
mp.players.local.isTyping = false;
let chat = mp.browsers.new('package://chatSystem/index.html');
chat.markAsChat();
*/
// Incredibily shitty code was improved but I haven't rewritten every event and command to use new event would ideally be a hud component in vue :)
/*
mp.events.add({
    "clearChat": () => {
        for(let i = 0; i < 110; i++) {
            chat.execute(`chatAPI.empty();`);
        }
    },
    'chat:active': (tog) => {
        chat.execute(`chatAPI.activate(${tog})`);
    },
    'chatOff': () => {
        chat.execute(`chatAPI.show(false)`)
    },
    'chatOn': () => {
        chat.execute(`chatAPI.show(true)`)
    },
    'adminTalk': (message) => {
        chat.execute(`chatAPI.adminPush('${message}')`);
    },
    'staffMsg': (message) => {
        chat.execute(`chatAPI.staffMsg('${message}')`);
    },
    'error': (message) => {
        chat.execute(`chatAPI.errorP('${message}')`);
    },
    'ann': (msg) => {
        chat.execute(`chatAPI.announce('${msg}');`);
    },
    'infos': (msg) => {
        chat.execute(`chatAPI.info('${msg}')`);
    },
    'ac': (msg) => {
        chat.execute(`chatAPI.ac('${msg}')`);
    },
    'afk': (msg) => {
        chat.execute(`chatAPI.afk('${msg}')`);
    },
    'ques': (msg) => {
        chat.execute(`chatAPI.question('${msg}')`);
    },
    'exit': (msg) => {
        chat.execute(`chatAPI.quit('${msg}')`)
    },
    'success': (msg) => {
        chat.execute(`chatAPI.suc('${msg}')`);
    },
    'report': (msg) => {
        chat.execute(`chatAPI.report('${msg}')`);
    },
    'mechat': (msg) => {
        chat.execute(`chatAPI.me('${msg}')`);
    },
    'ldo': (msg) => {
        chat.execute(`chatAPI.ldo('${msg}')`);
    },
    'dice': (msg) => {
        chat.execute(`chatAPI.dice('${msg}')`);
    },
    'server': (msg) => {
        chat.execute(`chatAPI.server('${msg}')`)
    },
    'pmgrey': (msg) => {
        chat.execute(`chatAPI.pmgrey('${msg}')`)
    },
    'pmgreen': (msg) => {
        chat.execute(`chatAPI.pmgreen('${msg}')`);
    },
    'sendMsg:chat': (icon, iconColor, message) => {
        chat.execute(`chatAPI.sendMessage('${icon}', '${iconColor}', '${message}')`)
    }
});
*/
// Set Data
/*
chat.execute(`setToggleTimestamp(${mp.storage.data.timeStamp});`);
chat.execute(`setPageSize(${mp.storage.data.pageSize});`);
chat.execute(`setFontSize(${mp.storage.data.fontSize});`);
chat.execute(`setToggleChat(${mp.storage.data.toggleChat});`);
*/

mp.events.add('setfont', (size) => {
    if(chat) {
        chat.execute(`setFontSize(${size});`);
    }
})

// Anti spam
mp.players.local.lastMessage = new Date().getTime();
mp.events.add("setLastMessage", (ms) => {
    mp.players.local.lastMessage = ms + 150;
    mp.events.callRemote('lastMsg', ms + 150);
});

mp.events.add("getutc", () => {
    var currentTime = new Date().getTime();
    mp.gui.chat.push(`!{#ffc421}* UTC !{#ffffff}Time: ${Date.now()} | ${Date.Date()}`);
});



// Clear chat event, call from server