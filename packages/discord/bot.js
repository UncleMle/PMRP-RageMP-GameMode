const { Client, GatewayIntentBits, channelLink, messageLink, disableValidators, embedLength, ActivityType } = require('discord.js')
const { EmbedBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.Guilds, GatewayIntentBits.GuildBans, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent,] });
const db = require('../models');
const config = require("./config.json")
const token = config.token;
var webscrape = require('webscrape');

var scraper = webscrape.default();
let online = "0/1000";
let myServerName = config.serverName;
let minutesForUpdate = config.timerDelayInMinutes;
var charactersLen = null;
var vehiclesLen = null;
var accountsLen = null;
var count = 0;
client.login(token);

client.on('ready', () => {
  console.log("Bot started watching the RAGEMP CDN and PMRP database.")
  client.user.setUsername(myServerName);
  timer = setInterval(() => {
    scrapOnline();
  }, 60000 * minutesForUpdate);

});

async function consoleMsg(msg) {
  const channel = client.channels.cache.find(channel => channel.name === 'server-console')
  channel.send(msg)
}

const cmds = ["vinfo", "help", "getsqlid", "playerinfo", 'getnamebyunix', 'accountinfo']

const prefix = config.prefix;

client.on("messageCreate", (message) => {
  if (!message.content.startsWith(prefix)) return;
  if (!message.channelId == '1046810772577210390') return message.channel.send('This command cannot be used in this channel.')
  if (message.member.roles.cache.some(role => role.name === 'Server Staff') && message.channelId == config.channelId) {
    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();

    if (message.content.startsWith(`${prefix}vinfo`)) {
      if (args == undefined || args == null || args.length == 0) return message.channel.send(`Use: !vinfo **SQLID**`)
      const { vehicles } = require('../models')
      vehicles.findAll({ where: { id: args } }).then((veh) => {
        if (veh.length > 0) {
          message.channel.send(`***Vehicle Information:***` + "```" + JSON.stringify(veh[0]) + '```')
          return
        }
        message.channel.send(`No vehicle with this SQLID was found.`)
      }).catch((err) => { console.log(err) })
    }

    if (message.content.startsWith(`${prefix}getnamebyunix`)) {
      if (!args[0] || !args[1]) return message.channel.send(`Use: !getnamebyunix **[In Game ID] [UNIX]**`)
      db.server_connections.findAll({ where: { gameId: args[0] } }).then((load) => {
        if (load.length == 0) {
          const embedMsg = new EmbedBuilder()
            .setColor(0xFF3131)
            .setTitle(`No entry for game ID ${args[0]} was found in database.`)
          message.channel.send({ embeds: [embedMsg] });
          return
        }
        var oldest = JSON.stringify(load[0].unix)
        var newest = JSON.stringify(load[load.length - 1].unix)
        if (args[1] >= oldest && args[1] <= newest) {
          db.characters.findAll({ where: { id: load[0].OwnerId } }).then((char) => {
            if(char.length == 0) return;
            const embedMsg = new EmbedBuilder()
              .setColor(0xc467ff)
              .setTitle(`Character Name: ${char[0].cName == null ? '_' : char[0].cName}`)
              .setDescription(`Char Ref #${char[0].id} | Unix: ${args[1]}`);
            message.channel.send({ embeds: [embedMsg] });
          })
        }
        else {
          const embedMsg = new EmbedBuilder()
            .setColor(0xFF3131)
            .setTitle(`No entry was found with parameters: UNIX = ${args[1]} ID = ${args[0]}`)
          message.channel.send({ embeds: [embedMsg] });
        }
      })
    }

    if (message.content.startsWith(`${prefix}accountinfo`)) {
      if (!args[0]) return message.channel.send(`Use: !accountinfo ${api.formatArg('Character Name Format: Fname_Lname')}`)
      db.characters.findAll({ where: { cName: args[0] } }).then((char) => {
        if (char.length > 0) {
          db.Accounts.findAll({ where: { id: char[0].OwnerId } }).then((acc) => {
            const adminRanks = ['None', 'Support', 'Senior Support', 'Moderator', 'Senior Moderator', 'Administrator', 'Senior Administrator', 'Head Administrator', 'Immortal']
            const accInfoEmbed = new EmbedBuilder()
            .setColor(0xc467ff)
            .setTitle('Account Information')
            .setDescription('Information for user ***'+ acc[0].username+'***')
            .addFields(
              { name: 'SQLID', value: `${acc[0].id}`, inline: true },
              { name: 'Admin Level', value: adminRanks[acc[0].adminStatus], inline: true },
              { name: 'Register Date', value: `${acc[0].createdAt}`, inline: true },
              { name: 'Credits', value: `${acc[0].credits}`, inline: true },
              { name: 'Email', value: `${acc[0].email}`, inline: true },
              { name: 'Max Characters', value: `${acc[0].maxCharacters}`, inline: true },
              { name: 'Total Characters', value: `${acc[0].maxCharacters}`, inline: true },
              { name: 'Ban Status', value: `${acc[0].banStatus == 1 ? 'Account is banned' : 'Account not banned.'}`, inline: true },
              { name: 'Vip Status', value: `${acc[0].vipStatus == 1 ? 'Account currently has VIP' : `Account doesn't have VIP.`}`, inline: true },
              { name: 'User HWID', value: '``'+acc[0].HWID+'``', inline: true },
              { name: 'User UUID', value: '``'+acc[0].uuid+'``', inline: true }
            )
            .setTimestamp()
            message.channel.send({ embeds: [accInfoEmbed] });
          })
          return
        }
        else {
          const errEmbed = new EmbedBuilder()
            .setColor(0xFF3131)
            .setTitle(`No character name entry for ${args[0]} was found.`)
            message.channel.send({ embeds: [errEmbed] });
          }
      })
    }

    if (message.content.startsWith(`${prefix}getsqlid`)) {
      if (args == undefined || args == null || args.length == 0) return message.channel.send(`Use: !getsqlid **number plate**`)
      db.vehicles.findAll({ where: { numberPlate: args } }).then((veh) => {
        if (veh.length > 0) {
          message.channel.send(`SQLID: ***${veh[0].id}***`)
          return
        }
        message.channel.send(`No vehicle with this number plate was found.`)
      }).catch((err) => { console.log(err) })
    }

    if (message.content.startsWith(`${prefix}help`)) {
      var count = 0;
      cmds.forEach((cmd) => { message.channel.send(count + '. ``' + prefix + cmd + '``'), count++ })
    }

    if (message.content.startsWith(`${prefix}playerinfo`)) {

      if (args == undefined || args == null || args.length == 0) return message.channel.send(`Use: !playerinfo **CharacterName (Format: Fname_Lname)**`)
      db.characters.findAll({ where: { cName: args } }).then((char) => {
        if (char.length > 0) {
          message.channel.send('***Player Info:*** ```' + JSON.stringify(char[0]) + '```')
          return
        }
        message.channel.send(`Character with name: ${args} was not found.`)
      })
    }


    if (message.content.startsWith(`${prefix}banuuid`)) {
      if (args == undefined || args == null || args.length == 0 || !args[1]) return message.channel.send(`Use: !banuuid **[SQLID] [Reason]**`)
      db.server_uuids.findAll({ where: { id: args[0], banStatus: 0 } }).then((uuid) => {
        if (uuid.length > 0) {
          const { server_bans } = require('../models')
          server_uuids.update({ banStatus: 1 }, { where: {id: args[0]} })
          server_bans.create({
            IP: uuid[0].IP,
            HWID: uuid[0].HWID,
            uuid: uuid[0].data,
            socialClub: uuid[0].socialClub,
            socialID: uuid[0].socialClubId,
            username: uuid[0].socialClub,
            Reason: args[1],
            admin: '[DC] '+message.member.user.tag,
            issueDate: new Date().toJSON().slice(0, 10),
            LiftTimestamp: -1
        }).then(() => {
          db.Accounts.findAll({ where: {uuid: uuid[0].data} }).then((acc) => {
            if(acc.length > 0) {
              Accounts.update({ banStatus: 1 }, { where: {uuid: uuid[0].data} } ).catch((err) => {console.log(err)})
              message.channel.send(`<@${message.member.id}>`)
              const banInfo = new EmbedBuilder()
              .setColor(0xc467ff)
              .setTitle('UUID Ban information')
              .setDescription(`Banned by ${message.member.user.tag}. (Account was found)`)
              .addFields(
                { name: 'UUID', value: '``'+uuid[0].data+'``', inline: true },
                { name: 'Username', value: `${acc[0].username}`, inline: true },
                { name: 'Email', value: `${acc[0].email}`, inline: true },
                { name: 'IP Address', value: `${uuid[0].IP}`, inline: true },
                { name: 'HWID Address', value: +'``'+uuid[0].HWID+'``', inline: true },
                { name: 'Social Club', value: `${uuid[0].socialClub}`, inline: true },
                { name: 'Social Club ID', value: `${uuid[0].socialClubId}`, inline: true }
              )
              .setTimestamp()
              message.channel.send({ embeds: [banInfo] });
            }
            else if(acc.length == 0) {
              message.channel.send(`<@${message.member.id}>`)
              const banInfo = new EmbedBuilder()
              .setColor(0xc467ff)
              .setTitle('UUID Ban information')
              .setDescription(`Banned by ${message.member.user.tag}. (Account not found)`)
              .addFields(
                { name: 'UUID', value: '``'+uuid[0].data+'``', inline: true },
                { name: 'IP Address', value: `${uuid[0].IP}`, inline: true },
                { name: 'HWID Address', value: +'``'+uuid[0].HWID+'``', inline: true },
                { name: 'Social Club', value: `${uuid[0].socialClub}`, inline: true },
                { name: 'Social Club ID', value: `${uuid[0].socialClubId}`, inline: true }
              )
              .setTimestamp()
              message.channel.send({ embeds: [banInfo] });
            }
          })
        })
          return
        } else if(uuid.length == 0) {
          const errEmbed = new EmbedBuilder()
          .setColor(0xFF3131)
          .setTitle(`UUID with SQLID ${args[0]} could not be found or is already banned. `)
          message.channel.send({ embeds: [errEmbed] });
        }})
    }

    if (message.content.startsWith(`${prefix}unban`)) {
      if (args == undefined || args == null || args.length == 0) return message.channel.send(`Use: !unban **[banid]**`)
      db.server_bans.findAll({ where: {id: args[0]} }).then((baninfo) => {
        if(baninfo.length > 0) {
          const { Accounts } = require('../models')
          const { server_uuids } = require('../models')
          server_uuids.findAll({ where: { data: baninfo[0].uuid } }).then((ban) => { if(ban.length > 0) { server_uuids.update({ banStatus: 0 }, { where: { data: baninfo[0].uuid } }) } })
          Accounts.findAll({ where: {uuid: baninfo[0].uuid} }).then(() => {
            Accounts.update({ banStatus: 0 }, { where: { uuid: baninfo[0].uuid } })
            server_bans.destroy({ where: { id: args[0] } }).then(() => {
              const errEmbed = new EmbedBuilder()
              .setColor(0xFF3131)
              .setTitle(`Ban for user ${baninfo[0].username} was lifted successfully.`)
              message.channel.send({ embeds: [errEmbed] });
            })
          }).catch((err) => {console.log(err)})
        }
        else if(baninfo.length == 0) {
          const errEmbed = new EmbedBuilder()
          .setColor(0xFF3131)
          .setTitle(`No ban with ID: ${args[0]} was found.`)
          message.channel.send({ embeds: [errEmbed] });
          return
        }
      })
    }

    return
  }
});


async function scrapOnline() {
  try {
    const result = await scraper.get('https://cdn.rage.mp/master/');
    if (result) {
      const servers = JSON.parse(result.body);
      let server = Object.values(servers).find((el) => el.name.includes(myServerName) === true);
      if (server !== undefined) {
        const { vehicles } = require('../models')
        const { characters } = require('../models')
        const { Accounts } = require('../models')
        vehicles.findAll({}).then((veh) => { vehiclesLen = veh.length })
        characters.findAll({}).then((char) => { charactersLen = char.length })
        Accounts.findAll({}).then((acc) => { accountsLen = acc.length })
        online = server.players;
        const statuses = [`${online == 1 ? online + ' player' : online + ' players'}`, `${charactersLen} registered characters`, `${vehiclesLen} total vehicles`, `${accountsLen} accounts registered with the server`, `paramountroleplay.com`]
        if (count > statuses.length - 1) { count = 0 }
        UpdateChannelName(statuses[count++])

      } else {
        client.user.setPresence({
          activities: [{ name: `server offline` }],
          status: 'WATCHING',
        })
      }
    }
  } catch (error) {
    console.log(error)
  }

}
function UpdateChannelName(tempOnline = "0/1000") {
  let cache = client.channels.cache;
  let date = new Date();

  client.user.setPresence({
    activities: [{ name: `${tempOnline} `, type: ActivityType.Watching }],
    status: 'idle',
  });
}

const api = {
  formatArg: function (argument) {
    return '**' + argument + '**'
  }
}
