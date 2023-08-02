// mute radio
mp.keys.bind(77, false, function() {
	if(localplayer.getVariable('loggedIn') && !localplayer.isTypingInTextChat && !localplayer.getVariable('voicemute') == true) {
		mp.voiceChat.muted = true;
        mp.players.local.clearTasks();
		mp.events.callRemote('radio', false)
	}
});

// Unmute radio
mp.keys.bind(77, true, function() {
	if(localplayer.getVariable('loggedIn') && !localplayer.isTypingInTextChat && !localplayer.getVariable('voicemute') == true && !localplayer.getVariable('injured')) {
		mp.voiceChat.muted = false;
        mp.game.streaming.requestAnimDict(`random@arrests`);
        mp.players.local.taskPlayAnim(`random@arrests`, `generic_radio_chatter`, 8.0, 1.0, -1, 0 + 1 + 32 + 16, 0.0, false, false, false)
		mp.events.callRemote('radio', true)
	}
});

mp.events.add({
    'entityStreamIn': (entity) => {
		if(entity.type == 'player' && entity.getVariable('radio')) {
			mp.game.streaming.requestAnimDict(`random@arrests`);
			entity.taskPlayAnim(`random@arrests`, `generic_radio_chatter`, 8.0, 1.0, -1, 0 + 1 + 32 + 16, 0.0, false, false, false)
			entity.playFacialAnim("mic_chatter", "mp_facial");
		}
		else if(entity.type == 'player' && !entity.getVariable('radio') || !entity.getVariable('talking')) {
			entity.playFacialAnim("mood_normal_1", "facials@gen_male@variations@normal");
		}
	},
    'playerQuit': (player) => {
        if(player.hasRadio) {
            radioManager.remove(player)
        }
    },
    'changeRadio': (player, frequency) => {

    }
})

mp.events.addDataHandler('radio', function (entity, value, oldValue) {
    if (entity.type === 'player' && value != null) {
		if(value) {
			mp.game.streaming.requestAnimDict(`random@arrests`);
			entity.playFacialAnim("mic_chatter", "mp_facial");
			entity.taskPlayAnim(`random@arrests`, `generic_radio_chatter`, 8.0, 1.0, -1, 0 + 1 + 32 + 16, 0.0, false, false, false)
		}
		if(!value) {
			entity.clearTasks()
			entity.playFacialAnim("mood_normal_1", "facials@gen_male@variations@normal");
		}
    }
})

