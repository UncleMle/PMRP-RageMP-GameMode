require('./radios.js')

mp.events.add("add_voice_listener", (player, target) =>
{
	if(target)
	{
		player.enableVoiceTo(target);
	}
});

mp.events.add("remove_voice_listener", (player, target) =>
{
	if(target)
	{
		player.disableVoiceTo(target);
	}
});


mp.events.add({
	'talking': (player, bool) => {
		switch(bool) {
			case true:
				{
					player.setVariable('talking', true);
					break;
				}
			case false:
				{
					player.setVariable('talking', false);
					break;
				}
			default:
				break;
		}
	},
	'radio': (player, bool) => {
		switch(bool) {
			case true:
				{
					player.setVariable('radio', true);
					break;
				}
			case false:
				{
					player.setVariable('radio', false);
					break;
				}
			default:
				break;
		}
	}
})
