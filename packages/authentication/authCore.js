const bcrypt = require('bcryptjs');
const db = require('../models');
const CONFIG = require('../CoreSystem/chatformatconf.js').CONFIG;
const saltRounds = 10;
const express = require('express')
const app = express()
const port = 5000
const nodemailer = require('nodemailer')
const getDateString = () => {
  const date = new Date()
  const h = '0' + date.getHours().toString()
  const m = '0' + date.getMinutes().toString()
  const s = '0' + date.getSeconds().toString()
  return `[${h.substr(h.length - 2)}:${m.substr(m.length - 2)}:${s.substr(s.length - 2)}]`
}

mp.events.add({
  incomingConnection: (ip, serial, rgscName, rgscId, gameType) => {
    mp.log(`${CONFIG.consoleYellow}[INCOMING]${CONFIG.consoleWhite} Player with IP: ${ip} RGSCNAME: ${rgscName} GAMETYPE: ${gameType}`)
  },
  playerJoin: async (player) => {
    let calledTimes = 0;

    const callProc = async (player, proc) => {
      try {
        const Res = await player.callProc(proc);
        return Res;
      } catch (err) {
        if(calledTimes < 3) {
          calledTimes++;
          return await callProc(player, proc);
        }
      }
    };
    const uuvid = await callProc(player, 'get:uuvid')

    if (uuvid != undefined) {
      player.dimension = (player.id) + 1;
      player.uuid = uuvid;
      const { Accounts } = require('../models')
      Accounts.findAll({ where: { lastIP: player.ip, socialClub: player.socialClub, socialClubId: player.rgscId, HWID: player.serial, autoLogin: 1, uuid: uuvid } }).then((acc) => {
        if (acc.length > 0) {
          mp.log(`${CONFIG.consoleGreen}[Auto Login]${CONFIG.consoleWhite} Account found for Username ${acc[0].username}`)
          player.canAutoLogin = acc[0].username;
          player.call('requestBrowser', [`appSys.commit('setCreds', {
            user: '${acc[0].username}',
            pass: 'dontstealpls'
          })`])
        }
      })
      const { server_bans } = require('../models')
      server_bans.findAll({ where: { uuid: player.uuid } }).then((banCheck) => {
        if (banCheck.length > 0) {
          function getUnixTimestamp() {
            return Math.round(Date.now() / 1000);
          }
          function formatUnixTimestamp(unixTimestamp) {
            let date = new Date(unixTimestamp * 1000);
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let seconds = date.getSeconds();
            return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
          }
          player.setVariable('banned', true)
          if (banCheck[0].LiftTimestamp === -1) {
            player.setVariable('loggedIn', false)
            player.call('client:loginHandler', ['banned'])
            player.call('requestBrowser', [`appSys.commit('setBanInfo', {
                    username: '${banCheck[0].username}',
                    IP: '${banCheck[0].IP}',
                    socialClub: '${banCheck[0].socialClub} Ref=#${banCheck[0].id}',
                    reason: '${banCheck[0].Reason}',
                    admin: '${banCheck[0].admin}',
                    issueDate: '${banCheck[0].issueDate}',
                    liftTime: 'Ban is permanent'
                  });`])
            player.setVariable('loggedIn', false)
            player.dimension = 20;
            return
          } else {
            if (banCheck[0].LiftTimestamp > getUnixTimestamp()) {
              player.setVariable('loggedIn', false)
              player.call('client:loginHandler', ['banned'])
              player.call('requestRoute', ['ban', true, true]);
              player.call('requestBrowser', [`appSys.commit('setBanInfo', {
                        username: '${banCheck[0].username}',
                        IP: '${banCheck[0].IP}',
                        socialClub: '${banCheck[0].socialClub} Ref=#${banCheck[0].id}',
                        reason: '${banCheck[0].Reason}',
                        admin: '${banCheck[0].admin}',
                        issueDate: '${banCheck[0].issueDate}',
                        liftTime: '${formatUnixTimestamp(banCheck[0].LiftTimestamp)}'
                      });`])
              player.setVariable('loggedIn', false)
              player.dimension = 20;
              return
            } else {
              player.setVariable('banned', null)
              const { server_bans } = require('../models');
              server_bans.destroy({
                where: {
                  id: banCheck[0].id
                }
              })
              const { Accounts } = require('../models')
              Accounts.update({
                banStatus: 0
              },
                {
                  where: {
                    username: banCheck[0].username
                  }
                }).catch((err) => { mp.log(err) })
            }
          }
        }
      })
    }
  },
  'uuvid:setter': (player) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    function generateString(length) {
      let result = ' ';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }

      return result;
    }
    var uuvid = generateString(200)

    const { server_uuids } = require('../models')
    server_uuids.create({
      banStatus: 0,
      data: uuvid,
      IP: player.ip,
      HWID: player.serial,
      socialClub: player.socialClub,
      socialClubId: player.rgscId
    }).then((info) => {
      var sqlid = JSON.parse(JSON.stringify(info)).id
      uuvid = uuvid + sqlid;
      server_uuids.update({
        data: uuvid
      }, { where: { id: sqlid } })
      mp.log(`${CONFIG.consoleBlue}[AUTH_UUID]${CONFIG.consoleWhite} a new UUID has been created ${CONFIG.consoleRed} ${uuvid}${CONFIG.consoleWhite}`)
      player.call('set:uvid', [uuvid])
      player.uuid = uuvid;
    })
  },
  'server:registerAccount': async (player, username, email, ref, password) => {
    if (username.length >= 3 && password.length >= 5) {
      if (!validEmail(email)) return player.call('requestBrowser', [`gui.notify.showNotification("Please enter a valid email address.", false, true, 15000, 'fa-solid fa-triangle-exclamation')`])

      if(ref != null && ref.length > 0) {
        db.account_referrals.findAll({ where: {refid: ref} }).then(async(refs) => {
          if(refs.length > 0) {
            try {
              const res = await attemptRegister(player, username, email, password);
              player.reference = ref;
              if (res) {
                mp.log(`${username} has registered a new account.`);
                attemptLogin(player, 0, username, password);
              }
            } catch (e) { errorHandler(e) };
            return;
          } else {
            player.call('requestBrowser', [`gui.notify.showNotification("You entered an invalid referral code.", false, true, 15000, 'fa-solid fa-triangle-exclamation')`])
          }
        })
        return;
      }

      try {
        const res = await attemptRegister(player, username, email, password);
        if (res) {
          mp.log(`${getDateString()} ${username} has registered a new account.`)
          attemptLogin(player, 0, username, password)
        }
      } catch (e) { errorHandler(e) };

    } else {
      player.call('requestBrowser', [`gui.notify.showNotification("Please enter valid credentials", false, true, 15000, 'fa-solid fa-triangle-exclamation')`])
    }
  },
  'server:loginAccount': async (player, autoLog, username, password) => {
    if (player.canAutoLogin) {
      loadAccount(player, player.canAutoLogin);
      const { Accounts } = require('../models')
      const uuvid = await player.callProc('get:uuvid')
      Accounts.update({ uuid: uuvid, autoLogin: autoLog }, { where: { username: player.canAutoLogin } }).catch((err) => { mp.log(err) })
      return;
    }
    const loggedAccount = mp.players.toArray().find(p => p.getVariable('username') === username)
    if (loggedAccount) {
      player.call('requestBrowser', [`gui.notify.showNotification("Please enter valid credentials", false, true, 15000, 'fa-solid fa-triangle-exclamation')`])
      return
    }
    attemptLogin(player, autoLog, username, password)
  },
  'server:registerOtp': async (player, otp) => {
    otpHandler(player, otp)
  },
  'load:character': async (player, name) => {
    const { characters } = require('../models')
    characters.findAll({ where: { OwnerId: player.sqlID, cName: name, banned: 0 } }).then((c) => {
      if (c.length > 0) {
        try {
          player.setVariable('loggedIn', true)
          player.call('client:loginHandler', ['success'])
          player.call('moveSkyCamera', [player, 'up', 1, false])
          player.call('freezePlayer')
          const { characters } = require('../models');
          characters.findAll({
            benchmark: true,
            logging: (sql, timingMs) => mp.chat.server(player, `Loaded in ${timingMs}ms`),
            where: { cName: name }
          }).then(async (char) => {
            if (char.length > 0) {
              player.call('requestBrowser', [`gui.notify.clearAll()`])
              player.characterId = char[0].id
              getVehicles(player);
              player.setVariable('ccid', char[0].id)
              mp.events.call('player:setClothing', player);
              player.moneyAmount = char[0].moneyAmount
              player.cashAmount = char[0].cashAmount
              player.sex = char[0].sex;
              player.setVariable('moneyValue', player.moneyAmount);
              player.setVariable('cashValue', player.cashAmount);
              player.dimension = 0
              player.thirst = char[0].thirst
              player.hunger = char[0].hunger
              player.setVariable('thirstAmount', player.thirst);
              player.setVariable('hungerAmount', player.hunger);
              player.characterName = char[0].cName.replace('_', ' ')
              mp.log(`${CONFIG.consolePurple}[AUTH]${CONFIG.consoleWhite} Character ${player.characterName} has been loaded successfully.`)
              player.health = parseInt(char[0].health)
              player.armour = parseInt(char[0].armour)
              player.factionFirst = char[0].factionOne
              player.factionSecond = char[0].factionTwo
              player.factionFirstLevel = char[0].factionOneLvl
              player.factionTwoLvl = char[0].factionTwoLvl
              player.maxVehs = char[0].maxVehicles;
              player.houses = char[0].maxHouses;
              player.debt = char[0].debt;
              player.salary = char[0].debt;
              player.job = char[0].job;
              player.injuredStatus = char[0].isInjured;
              player.injuredTimer = char[0].injuredTime;
              player.phoneData = char[0].phoneData;
              player.setVariable('phoneNumber', char[0].phoneData[0].phoneNumber);
              player.setVariable('phoneBattery', char[0].phoneData[1].battery);
              player.call('setEntityName', [player, player.characterName])
              player.setVariable('totalPlayTime', player.accTime);
              char[0].playTime === null ? player.playTime = 0 : player.playTime = char[0].playTime
              char[0].position === null || char[0].position == 0 ? player.position = new mp.Vector3(-1037.1, -2736.3, 13.8) : player.position = new mp.Vector3(JSON.parse(char[0].position))
              player.setVariable('toggledAdmin', false)
              player.setVariable('sid', player.id)
              player.adminDuty = false
              player.sid = player.id
              player.licenses = char[0].licenses
              player.setVariable('sql', player.sqlID)
              player.setVariable('characterName', player.characterName)
              player.setVariable('adminName', player.adminName);
              player.dimension = 0
              mp.chat.server(player, `!{white}Welcome back to the server !{#dcabff}${player.name}!{white}.`)
              mp.chat.server(player, '!{white}For server commands and general help view !{#dcabff}/help!{white}.')
              mp.chat.server(player, '!{white}Visit !{#dcabff}play.paramount-rp.com!{white} for server information.')
              if (player.isAdmin > 0) {
                mp.chat.staffMsg(player, `Welcome back, !{${player.adminColour}}${player.adminSt}!{white} ${player.adminName}!{white}`)
              }
              if (player.aJailTime > 0) {
                mp.chat.aPush(player, `You have ${Math.trunc(player.aJailTime / 60)} minutes remaining of your admin jail time for ${player.ajailReason}.`)
              }
              if (player.sex == 'female') {
                player.model = mp.joaat(['mp_f_freemode_01'])
              }
              else {
                player.model = mp.joaat(['mp_m_freemode_01'])
              }
              if (player.aJailTime !== 0) {
                player.dimension = 20;
                mp.events.call('adminJailStart', player, player.id, player.aJailTime, player.ajailReason)
              }
              if (player.injuredStatus === 1) {
                mp.events.call('startInjured', player, player.injuredTimer)
              }
              mp.events.call('player:setModel', player)
              player.call('moveSkyCamera', [player, 'down'])
              player.call('start:energy');
              db.server_connections.create({
                OwnerId: player.characterId,
                gameId: player.id,
                unix: Math.round(Date.now() / 1000),
                type: 'load'
              });
              db.characters.update({
                lastActive: mp.core.getUnixTimestamp()
              }, { where: {id: player.characterId} }).catch((err) => {mp.log(err)});
              player.setVariable('serverTime', `${mp.enviroment.getFormattedTime()}`);
            }
          }).catch((err) => { mp.log(err) })

        } catch (e) { mp.log(e) }
        return
      }
      else { return player.call('requestBrowser', [`gui.notify.showNotification("This character is currently banned.", true, false, false, 'fa-solid fa-triangle-exclamation')`]) }
    })
  },
  'previewCharacter': (player, name) => {
    const { characters } = require('../models')
    characters.findAll({ where: { cName: name, OwnerId: player.sqlID } }).then((char) => {
      if (char.length > 0) {
        player.characterId = char[0].id
        player.sex = char[0].sex
        if (player.sex == 'female') {
          player.model = mp.joaat(['mp_f_freemode_01'])
        }
        else {
          player.model = mp.joaat(['mp_m_freemode_01'])
        }
        mp.events.call('player:setClothing', player);
        mp.events.call('player:setModel', player);
      }
    })
  },
  'clearAccNotif': (player, index) => {
    if(player.sqlID) {
      db.Accounts.findAll({ where: player.sqlID }).then((acc) => {
        if(acc.length > 0) {
          player.call('requestBrowser', [`gui.notify.clearAll()`]);
          player.call('requestBrowser', [`gui.notify.showNotification("Cleared Notification.", false, true, 5000, 'fa-sharp fa-solid fa-circle-check')`]);
        }
      })
    }
  },
  'characterCreationStart': (player) => {
    if (player.sqlID) {
      const { characters } = require('../models')
      characters.findAll({ where: { OwnerId: player.sqlID } }).then((chars) => {
        if (chars.length < player.maxChars) {
          player.model = mp.joaat(['a_m_y_beach_03'])
          player.model = mp.joaat(['mp_m_freemode_01'])
          player.call('client:loginHandler', ['creation'])
        }
        else {
          player.call('requestBrowser', [`gui.notify.showNotification("You already have the max amount of character slots used. You can buy more with credits.", false, true, 15000, 'fa-solid fa-triangle-exclamation')`])
        }
      })
    }
  },
  'characterCreationFinish': async(player, data) => {
    var jsonOut = JSON.parse(data)
    player.characterName = JSON.parse(data).fName + '_' + JSON.parse(data).lName
    const pinNum = await bcrypt.hash("0000", saltRounds);
    db.characters.findAll({ where: { cName: player.characterName } }).then((charCheck) => {
      if (charCheck.length == 0) {
        db.characters.create({
          banned: 0,
          sex: jsonOut.gender,
          cName: player.characterName,
          lastActive: Math.round(Date.now() / 1000),
          health: 100,
          thirst: 100,
          licenses: "{}",
          pinNum: pinNum,
          factionOne: 0,
          factionTwo: 0,
          factionOneLvl: 0,
          factionTwoLvl: 0,
          hunger: 100,
          moneyAmount: 1200,
          cashAmount: 500,
          debt: 0,
          salary: 0,
          job: 'Unemployed',
          phoneData: "[]",
          maxVehicles: 6,
          maxHouses: 2,
          position: 0,
          isInjured: 0,
          injuredTime: 0,
          OwnerId: player.sqlID,
          playTime: 0
        }).then((char) => {
          var id = JSON.parse(JSON.stringify(char)).id
          const phoneData = [{"phoneNumber": `23${Math.floor(Math.random() * 99)}${id}`}, {"battery": 100}];
          db.characters.update({
            phoneData: phoneData
          }, { where: {id: id} });
          db.player_models.create({
            characterId: id,
            data: data
          }).then(() => {
            var clothingData = `{"mask": 0, "maskTexture": 0, "torso": 0, "Leg": 1, "LegTexture": 0, "bags": 0, "bagTexture": 0, "shoes": 9, "shoesTexture": 1, "acess": 0, "acessTexture": 0, "undershirt": 15, "undershirtTexture": 0, "armor": 0, "decals": 0, "decalsTexture": 0, "tops": 0, "topsTexture": 1}`;
            if (player.sex == 'male') {
              clothingData = `{"mask": 0, "maskTexture": 0, "torso": 0, "Leg": 1, "LegTexture": 0, "bags": 0, "bagTexture": 0, "shoes": 9, "shoesTexture": 1, "acess": 0, "acessTexture": 0, "undershirt": 15, "undershirtTexture": 0, "armor": 0, "decals": 0, "decalsTexture": 0, "tops": 0, "topsTexture": 1}`;
            }
            else if (player.sex == 'female') {
              clothingData = `{"mask": 0, "maskTexture": 0, "torso": 0, "Leg": 0, "LegTexture": 2, "bags": 0, "bagTexture": 0, "shoes": 1, "shoesTexture": 0, "acess": 0, "acessTexture": 0, "undershirt": 15, "undershirtTexture": 0, "armor": 0, "decals": 0, "decalsTexture": 0, "tops": 97, "topsTexture": 1}`;
            }
            db.player_clothes.create({
              OwnerId: id,
              data: clothingData
            }).catch((err) => { mp.log(err) })
            var count = 0;
            player.call('client:loginHandler', ['selection'])
            db.characters.findOne({ where: { OwnerId: player.sqlID } }).then((char) => {
              player.call('requestBrowser', [`appSys.commit('clearChars')`])
              player.characterId = parseInt(JSON.parse(JSON.stringify(char)).id);
              player.sex = JSON.parse(JSON.stringify(char)).sex;
              if (player.sex == 'female') {
                player.model = mp.joaat(['mp_f_freemode_01'])
              }
              else {
                player.model = mp.joaat(['mp_m_freemode_01'])
              }
              mp.events.call('player:setClothing', player);
              mp.events.call('player:setModel', player);
              db.characters.findAll({ where: { OwnerId: player.sqlID } }).then((chars) => {
                chars.forEach((cs) => {
                  var days = Math.trunc(cs.playTime / 1440)
                  if (days < 0) { days = 0 }
                  player.call('requestBrowser', [`appSys.commit('addChar', {
                    id: ${cs.id},
                    name: '${cs.cName}',
                    hours: '${days.toLocaleString('en-US')}',
                    bank: '${cs.moneyAmount.toLocaleString('en-US')}',
                    faction: 'None',
                    hp: ${cs.health},
                    lastPlayed: '${cs.lastActive}',
                    max: ${player.maxChars},
                    referral: '${player.reference}',
                    creation: '${player.accCreation}',
                    totalHours: ${Math.trunc(player.accTime / 60)},
                    adminPunishments: '${player.creditsAmount}',
                    accName: '${player.name}'
                  })`])
                  count++
                })
              })
            })
          })
        }).catch((err) => { mp.log(err) })
        mp.log(`${CONFIG.consolePurple}[AUTH]${CONFIG.consoleWhite} Character ${player.characterName} has been created successfully by user ${player.name}.`)
        return
      }
      if (charCheck.length > 0) {
        player.call('requestBrowser', [`gui.notify.showNotification("Character name is already taken.", false, true, 15000, 'fa-solid fa-triangle-exclamation')`]);
        return;
      }
    })
  },
  playerQuit: async (player) => {
    if (player.getVariable('loggedIn')) {
      db.server_connections.create({
        OwnerId: player.sqlID,
        gameId: player.id,
        unix: Math.round(Date.now() / 1000),
        type: 'quit'
      })
      db.characters.update({
        lastActive: mp.core.getUnixTimestamp()
      }, { where: {id: player.characterId} }).catch((err) => {mp.log((err))})
    }
    if (player.otpInter) { clearInterval(player.otpInter) };
    if (!player.getVariable('loggedIn') || player.getVariable('viewingDealer')) return;
    db.characters.update({
      position: JSON.stringify(player.position)
    },
      {
        where: {
          id: player.characterId
        }
      }).catch((err) => { mp.log(err) })
  },
  'server:loginHandler': (player, handle, username) => {
    successLoginHandle(player, handle, username);
  }
})

async function attemptRegister(player, username, email, pass) {
  try {
    const { Accounts } = require('../models');
    const { Op } = require('sequelize')
    Accounts.findAll({
      where: {
        [Op.or]: [{ uuid: player.uuid }, { email: email }, { username: username }, { socialClub: player.socialClub }, { socialClubId: player.rgscId }, { HWID: player.serial.toString() }]
      }
    }).then(async (users) => {
      if (users.length > 0) { return player.call('requestBrowser', [`gui.notify.showNotification("You already have an account.", false, true, 15000, 'fa-solid fa-triangle-exclamation')`]) }
      else {
        player.otpStatus = true
        player.otp = Math.floor(Math.random() * 9000) + 1000

        mp.core.sendEmail(player, email, 'Paramount RP | OTP', `<h2>Hello ${username},</h2><p>Your one time password (OTP) is <b>${player.otp}</b><p>`);

        player.otpInter = setInterval(function () {
          if (!player.otpStatus) return
          player.otp = Math.floor(Math.random() * 9000) + 1000
          player.call('requestBrowser', [`gui.notify.showNotification("Your old OTP has expired please enter the new one sent.", false, true, 15000, 'fa-solid fa-triangle-exclamation')`])
          mp.core.sendEmail(player, email, 'Paramount RP | OTP', `<h2>Hello ${username},</h2><p>Your old time password (OTP) expired your new one is <b>${player.otp}</b><p>`);
        }, 30000)
        const hash = await bcrypt.hash(pass, saltRounds)
        player.pspHash = hash
        player.pspEmail = email
        player.pspUser = username

        player.call('requestRoute', ['otp', true, true])
      }
    }).catch((err) => { mp.log(err) })


  } catch (e) { errorHandler(e) }
}

async function otpHandler(player, otp) {
  if (player.otp == null) { return };
  if (player.otp == otp) {
    clearInterval(player.otpInter)
    finalRegisterInitilzation(player)
  } else {
    player.call('requestBrowser', [`gui.notify.showNotification("You entered an invalid OTP code.", false, true, 15000, 'fa-solid fa-triangle-exclamation')`])
  }
}

async function finalRegisterInitilzation(player) {
  const { Accounts } = require('../models');
  Accounts.create({
    uuid: player.uuid == undefined ? 0 : player.uuid,
    autoLogin: 0,
    playTime: 0,
    username: player.pspUser,
    adminStatus: 0,
    vipStatus: 0,
    credits: 0,
    banStatus: 0,
    maxCharacters: 2,
    notifications: '[]',
    aName: 'notset',
    aPed: 'notset',
    adminJailTime: 0,
    adminJailReason: 'notset',
    password: player.pspHash,
    email: player.pspEmail,
    lastIP: player.ip,
    socialClub: player.socialClub,
    socialClubId: player.rgscId,
    HWID: player.serial,
    adminDimension: 0
  }).then(() => {
    if(player.reference) {
      db.account_referrals.findAll({ where: {refid: player.reference} }).then((acc) => {
        if(acc.length > 0) {
          db.Accounts.findAll({ where: {id: acc[0].accountId} }).then((account) => {
            if(account.length > 0) {
              db.Accounts.update({
                credits: (account[0].credits + 200)
              }, { where: {id: acc[0].accountId} });
              db.account_referrals.update({
                uses: (acc[0].uses + 1)
              }, {where: {accountId: acc[0].accountId}})
            }
          })
        }
      })
    }

    loadAccount(player, player.pspUser)
  }).catch((err) => { mp.log(err) })
}

async function attemptLogin(player, autoLogin, username, password) {
  try {
    const { Accounts } = require('../models');
    Accounts.findAll({
      where: {
        username: username
      }
    }).then(async (users) => {
      if (users.length > 0) {
        const res = await bcrypt.compare(password, users[0].password)
        if (res) {
          loadAccount(player, username)
          const { Accounts } = require('../models')
          Accounts.update({ autoLogin: autoLogin }, { where: { username: username } }).catch((err) => { mp.log(err) })
          return
        } else {
          player.call('client:loginHandler', ['incorrectinfo'])
        }
      }
      else {
        player.call('client:loginHandler', ['accountNotFound'])
      }
    }).catch((err) => { mp.log(err) })

  } catch (e) { errorHandler(e) }
}

function errorHandler(e) {
  if (e.sql) {
    mp.log(`[MySQL] ERROR: ${e.sqlMessage}\n[MySQL] QUERY: ${e.sql}`)
  } else {
    mp.log(`Error: ${e}`)
  }
}

async function successLoginHandle(player, handle, username) {
  mp.events.call('server:loginAccount', player, username)
}

function validEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}


setInterval(function () {
  mp.players.forEach(async (player) => {
    if (player.getVariable('loggedIn') && !player.getVariable('viewingDealer')) {
      const { characters } = require('../models');
      characters.update(
        {
          position: JSON.stringify(player.position),
        },
        {
          where:
          {
            id: player.characterId
          }
        }
      )
    }
  })
}, 5000)

setInterval(() => {
  mp.players.forEach((ps) => {
    if (ps.getVariable('loggedIn') && !ps.getVariable('adminDuty')) {
      const { characters } = require('../models')
      characters.update({
        health: parseInt(ps.health),
      }, { where: { id: ps.characterId } })
    }
  })
}, 3000);


async function loadAccount(player, username) {
  try {
    const { Accounts } = require('../models');
    Accounts.findAll({
      where: {
        username: username
      }
    }).then(async (rows) => {
      getRef(player, rows[0].id);
      Accounts.update({ uuid: player.uuid, lastIP: player.ip, HWID: player.serial, socialClub: player.socialClub, socialClubId: player.rgscId }, { where: { username: username } }).catch((err) => { mp.log(err) })
      const adminRanks = ['None', 'Support', 'Senior Support', 'Moderator', 'Senior Moderator', 'Administrator', 'Senior Administrator', 'Head Administrator', 'Immortal']
      const adminColours = ['', '#ff00fa', '#9666ff', '#37db63', '#018a35', '#ff6363', '#ff0000', '#00bbff', '#c096ff']
      if (rows.length != 0) {
        player.sqlID = rows[0].id;
        player.name = username
        if (rows[0].banStatus == 1) {
          const fullReason = 'Logging into banned accounts.'
          const { server_bans } = require('../models')
          server_bans.create({
            IP: player.ip,
            HWID: player.serial,
            uuid: player.uuid == undefined ? 'Not Known' : player.uuid,
            socialID: player.rgscId,
            socialClub: player.socialClub,
            username: player.name,
            Reason: fullReason,
            admin: 'Server',
            LiftTimestamp: -1,
            issueDate: new Date().toJSON().slice(0, 10)
          }).then(() => {
            player.setVariable('loggedIn', false)
            player.call('client:loginHandler', ['banned'])
            const date = new Date()
            const currentDate = date.toJSON()
            player.call('recieveBan', [player.name, player.ip, player.socialClub, 'Server', fullReason, currentDate.slice(0, 10), '!{red} Ban is permanent !{white}'])
            player.call('requestRoute', ['ban', true, true]);
            player.call('requestBrowser', [`appSys.commit('setBanInfo', {
                username: '${player.name}',
                IP: '${player.ip}',
                socialClub: '${player.socialClub}',
                reason: '${fullReason}',
                admin: 'Server',
                issueDate: '${currentDate.slice(0, 10)}',
                liftTime: 'Ban is permanent'
              });`])
            player.setVariable('loggedIn', false)
            player.dimension = 20
            return
          })
          return
        }
        player.isAdmin = rows[0].adminStatus;
        player.accCreation = rows[0].createdAt;
        player.adminName = rows[0].aName;
        player.name = username;
        player.emailAddress = rows[0].email;
        player.adminSt = adminRanks[rows[0].adminStatus];
        player.adminColour = adminColours[rows[0].adminStatus];
        player.isInJail = rows[0].isJailed;
        player.jailTime = rows[0].JailTime;
        player.adminPed = rows[0].aPed;
        player.isBanned = rows[0].banStatus;
        player.emailA = rows[0].email;
        player.pass = rows[0].password;
        player.LastActv = rows[0].lastActive;
        player.vip = rows[0].vipStatus;
        player.creditsAmount = rows[0].credits;
        player.maxChars = rows[0].maxCharacters;
        player.accTime = rows[0].playTime;
        player.aJailTime = rows[0].adminJailTime;
        player.ajailReason = rows[0].adminJailReason;
        player.setVariable('username', username);
        player.setVariable('adminLevel', rows[0].adminStatus);
        player.cheatViolations = [];
      }

      db.characters.findAll({
        where: {
          OwnerId: parseInt(player.sqlID)
        }
      }).then(async (chars) => {
        db.characters.findAll({ where: {OwnerId: player.sqlID} }).then((c) => { player.characters = c.length });

        if (chars.length == 0) {
          mp.log(`${CONFIG.consolePurple}[AUTH]${CONFIG.consoleWhite} ${username} has logged into the server!`)
          player.call('client:loginHandler', ['selection'])
          player.call('entity:Invis', [player]);
          player.call('requestBrowser', [`appSys.commit('addChar', {
            referral: '${player.reference}',
            creation: '${player.accCreation}',
            totalHours: ${Math.trunc(player.accTime / 60)},
            adminPunishments: ${player.creditsAmount},
            accName: '${player.name}'
            })`]);
          return
        } else {
          mp.log(`${CONFIG.consolePurple}[AUTH]${CONFIG.consoleWhite} ${username} has logged into the server!`)
          player.call('client:loginHandler', ['selection'])
          let count = 1
          chars.forEach((cs) => {
            var days = Math.trunc(cs.playTime / 1440)
            if (days < 0) { days = 0 }
            player.call('requestBrowser', [`appSys.commit('addChar', {
              id: ${cs.id},
              name: '${cs.cName}',
              hours: '${days.toLocaleString('en-US')}',
              bank: '${cs.moneyAmount.toLocaleString('en-US')}',
              faction: 'None',
              hp: ${cs.health},
              lastPlayed: '${cs.lastActive}',
              max: ${player.maxChars},
              referral: '${player.reference}',
              creation: '${player.accCreation}',
              totalHours: ${Math.trunc(player.accTime / 60)},
              adminPunishments: ${player.creditsAmount},
              accName: '${player.name}'
              })`])
            count++
          })
          db.characters.findAll({ where: { OwnerId: player.sqlID } }).then((char) => {
            var character = char.sort((a, b) => b.lastActive - a.lastActive);

            player.characterId = parseInt(character[0].id);
            player.sex = character[0].sex;
            if (player.sex == 'female') {
              player.model = mp.joaat(['mp_f_freemode_01'])
            } else {
              player.model = mp.joaat(['mp_m_freemode_01'])
            }
            mp.events.call('player:setClothing', player);
            mp.events.call('player:setModel', player);

          })
        }
      }).catch((err) => { mp.log(err) })
    })
  } catch (e) { errorHandler(e) };
}

function getRef(player, sqlid) {
  db.account_referrals.findAll({ where: { accountId: sqlid } }).then((ref) => {
    if(ref.length > 0) {
      player.reference = ref[0].refid;
      return;
    } else if(ref.length == 0) {
      var ref = mp.core.generateString(5)+sqlid;
      db.account_referrals.create({
        accountId: sqlid,
        uses: 0,
        refid: ref,
        settime: mp.core.getUnixTimestamp()
      }).catch((err) => {mp.log(err)})
      player.reference = ref;
    }
  })
}

function getVehicles(player) {
  if(player.characterId) {
    db.vehicles.findAll({ where: {OwnerId: player.characterId} }).then((vehicle) => {
      player.vehicles = vehicle.length;
    })
  }
}