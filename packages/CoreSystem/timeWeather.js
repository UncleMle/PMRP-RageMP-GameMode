let timeData = [];
let code;
let CONFIG = require('./chatformatconf.js').CONFIG;

mp.events.add({
  'packagesLoaded': () => {
    timeData.push({currentTimeHour: 12, currentTimeMinute: 12, currentTimeSecond: 12, enabled: true});
    setInterval(() => {
      if(timeData[0].enabled == false) {
        mp.players.forEach(ps => {
        if(ps.getVariable('loggedIn')) {
          ps.setVariable('serverTime', `${mp.enviroment.getFormattedTime()}`);
        }
      });
      return;
      }
      var d = new Date();
      var h1 = d.getUTCHours();
      var m1 = d.getUTCMinutes();
      var s1 = d.getUTCSeconds();
      var ms = d.getUTCMilliseconds();

      hour = (Math.floor(m1/2) + h1 * 6) %24;
      min =  (Math.floor(s1/2) + m1 * 30) % 60;
      sec =  (Math.floor(ms*0.03) + s1 * 30) % 60;

      timeData.length = 0;
      timeData.push({ currentTimeHour: hour, currentTimeMinute: min, currentTimeSecond: sec, enabled: true });
      mp.players.forEach(ps => {
        if(ps.getVariable('loggedIn')) {
          ps.setVariable('serverTime', `${mp.enviroment.getFormattedTime()}`);
        }
      })
      mp.world.time.set(hour, min, sec);
    }, 10000);
    mp.log(`${CONFIG.consoleBlue}[Time]${CONFIG.consoleWhite} Loaded time sync successfully.`);
  }
});

mp.cmds.add(['timesync'], async(player, arg) => {
  if(arg != null) return mp.chat.info(player, `Use: /timesync`)
  if(player.isAdmin > 7) {
    switch(timeData[0].enabled) {
      case true:
      {
        timeData[0].enabled = false;
        mp.chat.aPush(player, `!{white}You have !{red}disabled!{white} time sync`);
        break;
      }
      case false:
      {
        timeData[0].enabled = true;
        mp.chat.aPush(player, `!{white}You have !{green}enabled!{white} time sync`);

      }
      default: break;
    }
    return;
  }
  mp.chat.err(player, `${CONFIG.noauth}`)
})

mp.cmds.add(['settime'], async(player, time) => {
  if(!time) return mp.chat.info(player, `Use: /settime [hour]`)
  if(player.isAdmin > 7) {
    timeData[0].currentTimeHour = time;
    timeData[0].currentTimeMinute = time;
    timeData[0].currentTimeSecond = time;
    mp.chat.aPush(player, `!{white}Set world time to: ${time}`)
    mp.world.time.set(time, time, time);
    return
  }
  mp.chat.err(player, `${CONFIG.noauth}`)
})

mp.enviroment = {
  getTimeData: () => {
    return timeData;
  },
  getWeatherStatus: () => {
    return code == null ? -1 : code;
  },
  getFormattedTime: () => {
    return `${timeData[0].currentTimeHour < 10 ? "0"+timeData[0].currentTimeHour : timeData[0].currentTimeHour}:${timeData[0].currentTimeMinute < 10 ? "0"+timeData[0].currentTimeMinute : timeData[0].currentTimeMinute}`;
  }
}

var getJSON = require('get-json');
const url = 'https://api.weatherapi.com/v1/current.json?key=b2c5eeb06177482f96e150152232306&q=la';

setInterval(() => {
getJSON(url)
  .then(json => {
    code = json.current.condition.code;
    switch (code) {
        case 1000:
          mp.world.weather = 'EXTRASUNNY'
          break;
        case 1003:
          mp.world.weather = 'CLOUDS'
          break;
        case 1006:
          mp.world.weather = 'CLOUDS'
          break;
        case 1066 || 1063 || 1225:
          mp.world.weather = 'Windy Light Snow'
          break;
        case 1135:
          mp.world.weather = 'FOGGY'
          break;
        case 1183:
          mp.world.weather = 'RAIN'
          break;
        case 1189:
          mp.world.weather = 'RAIN'
          break;
        case 1273:
          mp.world.weather = 'THUNDER'
          break;
        default:
          mp.world.weather = 'CLEAR'
      }

    mp.log(`${CONFIG.consoleYellow}[WEATHER]${CONFIG.consoleWhite} Synced to ${json.current.condition.text} (Code ${code})`);
  })
  .catch(function(err){
    mp.log(`${CONFIG.consoleRed}[ERROR]${CONFIG.consoleWhite}`, err)
  });
}, 600000)