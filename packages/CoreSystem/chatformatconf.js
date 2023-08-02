const CONFIG = {
  ERROR: '!{red}[Error]!{white} ',
  red: '!{red}',
  chatProx: 20,
  adminProx: 55,
  exitProx: 40,
  doProx: 20,
  meProx: 20,
  ameTime: 9000, // Miliseconds
  oocProx: 30,
  whisperProx: 2,
  cashProx: 2,
  shoutProx: 40,
  orange: '!{#FFB14E}',
  LSPD: '!{#ff8447}',
  staffr: '!{#ff5454}',
  staffB: '!{#00C1FF}',
  server: '!{#dcabff}[Server]!{white} ',
  green: '!{#78cc78}',
  blue: '!{#6dbce6}',
  grey: '!{#919191}',
  faction: '!{#ffbf47}',
  vip: '!{#FFD700}[Vip]!{white} ',
  credits: '!{#FFD700}[Credits]!{white} ',
  noauth: 'You are not authorized to use this command!',
  lbue: '!{#00C1FF}',
  ac: '!{#de3333}[AC]!{white} ',
  me: '!{#dc7dff}',
  longdo: '!{#A781FF}', // #b1a1ff
  staff: '!{#b1a1ff}[Staff]!{white}!{#ff5454} ',
  staffChat: '!{#b1a1ff}[Staff Chat]!{white} ',
  ppink: '!{#b1a1ff}',
  pmrp: '!{#ca75ff}[Paramount Roleplay]!{#ffffff} ',
  report: '!{#00C1FF}[Report System]!{white} ',
  gold: '!{#FFD700}',
  lpink: '!{#dcabff}',
  info: '!{#c7ff5e}[Info]!{white} ',
  question: '!{#6dbce6}[Question System]!{white} ',
  consoleWhite: '\x1b[0m',
  consoleRed: '\x1b[38;5;9m',
  consoleYellow: '\x1b[33m',
  consoleGreen: '\x1b[32m',
  consoleYellow: '\x1b[33m',
  consoleBlue: '\x1b[34m',
  consolePurple: '\x1b[38;5;105m',
  consoleTurq: '\x1b[38;5;45m',
  consoleMagenta: '\u001b[35;1m',
  consoleSeq: '\x1b[38;5;14m'
}

mp.chat = {

  sendMsg: (player, message) => {
    player.call('chat:Msg', [`${message}`])
  },

  staffMsg: (player, msg) => {
    player.outputChatBox(`!{#c096ff}[Staff]!{white} ${msg}`)
  },

  server: (player, msg) => {
    player.outputChatBox(`!{#ac75ff}[Server]!{white} ${msg}`)
  },

  aPush: (player, msg) => {
    player.outputChatBox(`!{#ff4242}[Staff] ${msg}`)
  },

  err: (player, msg) => {
    player.call('requestBrowser', ['gui.notify.clearAll();']);
    player.call('requestBrowser', [`gui.notify.sendError("${msg}", 5700)`]);
  },

  info: (player, msg) => {
    player.outputChatBox(`!{#f0ff4a}[Info] ${msg}`)
  },

  ac: (player, msg) => {
    player.outputChatBox(`!{#ff4242}[Anti Cheat]!{white} ${msg}`)
  },

  question: (player, msg) => {
    player.outputChatBox(`!{#9799fc}[Question]!{white} ${msg}`)
  },

  quit: (player, msg) => {
    player.outputChatBox(`!{#dcabff}[Quit]!{white} ${msg}`)
  },

  success: (player, msg) => {
    player.call('requestBrowser', [`gui.notify.success("${msg}", 6500)`]);
  },

  report: (player, msg) => {
    player.outputChatBox(`!{#62a3fc}[Report]!{white} ${msg}`)
  },

  pmgrey: (player, msg) => {
    player.outputChatBox(`!{grey}[PM] ${msg}`)
  },

  pmgreen: (player, msg) => {
    player.outputChatBox(`!{#a4faa2}[PM] ${msg}`)
  }

}

exports.CONFIG = CONFIG;
