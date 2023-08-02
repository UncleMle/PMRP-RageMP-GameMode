const localplayer = mp.players.local;
const Use3d 		= true;
const UseAutoVolume = false;
const MaxRange 		= 20;
const VoiceVol 		= 1.0;
const VoiceChatKey 	= 78; // N
var text = ''
var talkingArr = []

const controlsIds = {
    F5: 327,
    W: 32, // 232
    S: 33, // 31, 219, 233, 268, 269
    A: 34, // 234
    E: 38,
    Q: 44,
	Z: 20,
    D: 35, // 30, 218, 235, 266, 267
    Space: 321,
    LCtrl: 326,
	LShift: 61,
};

mp.events.add({
	'entityStreamIn': (entity) => {
		if(entity.type == 'player' && entity.getVariable('talking') == true) {
			entity.playFacialAnim("mic_chatter", "mp_facial");
		}
		if(entity.type == 'player' && entity.getVariable('radio')) {
			mp.game.streaming.requestAnimDict(`random@arrests`);
			entity.taskPlayAnim(`random@arrests`, `generic_radio_chatter`, 8.0, 1.0, -1, 0 + 1 + 32 + 16, 0.0, false, false, false)
			entity.playFacialAnim("mic_chatter", "mp_facial");
		}
	},
	'resetVOIP': () => {
		mp.voiceChat.cleanupAndReload(true, true, true);
	},
	'entityStreamOut': (entity) => {
		if(entity.type == 'player' && entity.getVariable('talking')) {
			entity.playFacialAnim("mood_normal_1", "facials@gen_male@variations@normal");
		}
	},
	'render': () => {
		if(mp.players.local.getVariable('voicemuted') == true) {
			mp.game.graphics.drawText(`~r~You have been voice muted by ${mp.players.local.getVariable('voicemuteadmin')}`, [0.5, 0.5], {
				font: 4,
				color: [255, 255, 255, 255],
				scale: [0.5, 0.5],
				outline: true
			});
		}
		mp.players.forEachInRange(mp.players.local.position, 20,
			async(ps) => {
				/*
				if(ps.getVariable('radio') || ps.getVariable('talking')) {
					var inx = talkingArr.indexOf(ps.remoteId)
					if(inx) { talkingArr.splice(ps.remoteId, 1), talkingArr.push(ps.remoteId) }
					else if(!inx) { talkingArr.push(ps.remoteId) }
					mp.game.graphics.drawText(`~g~${talkingArr}`, [0.15, 0.45], {
						font: 4,
						color: [255, 255, 255, 255],
						scale: [0.3, 0.3],
						outline: true
					});
				}
				*/
				//else { text='' }
				/*
				if(ps.getVariable('talking') == true && ps.remoteId != mp.players.local.remoteId) {
					mp.game.graphics.drawText(`${count}. ${ps.getVariable('adminDuty') && ps.getVariable('adminName') ? `~w~<font color="#ca75ff">[Staff]</font> ${ps.getVariable('adminName')}` : `~g~${ps.nickName ? `${ps.nickName}` : 'Player'} [${ps.remoteId}]`}`, [0.15, 0.45], {
						font: 4,
						color: [255, 255, 255, 255],
						scale: [0.3, 0.3],
						outline: true
					});
					count++;
				}
				*/
			})
	}
})


mp.events.addDataHandler('talking', function (entity, value, oldValue) {
    if (entity.type === 'player' && value != null) {
		if(value) {
			entity.playFacialAnim("mic_chatter", "mp_facial");
		}
		if(!value) {
			entity.playFacialAnim("mood_normal_1", "facials@gen_male@variations@normal");
		}
    }
})

// Mute voice
mp.keys.bind(VoiceChatKey, false, function() {
	if(localplayer.getVariable('loggedIn') && !localplayer.isTypingInTextChat && !localplayer.getVariable('voicemute') == true) {
		mp.voiceChat.muted = true;
		mp.events.callRemote('talking', false)
	}
});

// Unmute voice
mp.keys.bind(VoiceChatKey, true, function() {
	if(localplayer.getVariable('loggedIn') && !localplayer.isTypingInTextChat && !localplayer.getVariable('voicemute') == true) {
		mp.voiceChat.muted = false;
		mp.events.callRemote('talking', true)
	}
});

var count = 1;
mp.keys.bind(90, false, function() {
	const controls = mp.game.controls;
	if(controls.isControlPressed(0, controlsIds.LShift) && localplayer.getVariable('loggedIn')) {
		mp.events.callRemote('voip', count)
		if(count > 3) {mp.events.callRemote('voip', 1); return count = 1;}
		count++;
	}
});

let g_voiceMgr =
{
	listeners: [],

	add: function(player)
	{
		this.listeners.push(player);

		player.isListening = true;
		mp.events.callRemote("add_voice_listener", player);

		if(UseAutoVolume)
		{
			player.voiceAutoVolume = true;
		}
		else
		{
			player.voiceVolume = 1.0;
		}

		if(Use3d)
		{
			player.voice3d = true;
		}
	},

	remove: function(player, notify)
	{
		let idx = this.listeners.indexOf(player);

		if(idx !== -1)
			this.listeners.splice(idx, 1);

		player.isListening = false;

		if(notify)
		{
			mp.events.callRemote("remove_voice_listener", player);
		}
	}
};

mp.events.add("playerQuit", (player) =>
{
	if(player.isListening)
	{
		g_voiceMgr.remove(player, false);
	}
});

setInterval(() =>
{
	let localPlayer = mp.players.local;
	let localPos = localPlayer.position;

	mp.players.forEachInStreamRange(player =>
	{
		if(player != localPlayer)
		{
			if(!player.isListening)
			{
				const playerPos = player.position;
				let dist = mp.game.system.vdist(playerPos.x, playerPos.y, playerPos.z, localPos.x, localPos.y, localPos.z);

				if(dist <= MaxRange)
				{
					g_voiceMgr.add(player);
				}
			}
		}
	});

	g_voiceMgr.listeners.forEach((player) =>
	{
		if(player.handle !== 0)
		{
			const playerPos = player.position;
			let dist = mp.game.system.vdist(playerPos.x, playerPos.y, playerPos.z, localPos.x, localPos.y, localPos.z);

			if(dist > MaxRange)
			{
				g_voiceMgr.remove(player, true);
			}
			else if(!UseAutoVolume)
			{
				player.voiceVolume = 1 - (dist / MaxRange);
			}
		}
		else
		{
			g_voiceMgr.remove(player, true);
		}
	});
}, 500);


