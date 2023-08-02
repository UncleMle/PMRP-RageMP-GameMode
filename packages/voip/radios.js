mp.cmds.add(['setfreq'], (player, radioFreq) => {
    if(!radioFreq || typeof(radioFreq) !== 'number') return mp.chat.info(player, `Use: /setfreq [freq(Between 1000 - 9000)]`)
    if(radioFreq >= 1000 && radioFreq <= 9000) {
        if(player.getVariable('radioFrequency')) {
            radioManager.remove(player, parseInt(player.getVariable('radioFrequency')))
            radioManager.add(player, parseInt(radioFreq))
            mp.chat.success(player, `You have joined frequency ${radioFreq}`)

        }
        player.setVariable('radioFrequency', parseInt(radioFreq))

        return
    }
    else return mp.chat.err(player, `Enter a valid radio frequency`)
})

var radioManager = {
    radioArrays: [],

    add(player, freq) {
        if(this.radioArrays.find(freqs => freqs === freq)) {
            return
        }
        else { this.radioArrays.push(freq) }
    },

    remove(player, freq) {
        const index = this.radioArrays.indexOf(freq)
        if(index !== -1) {
            this.radioArrays.splice(freq, 1)
        }
    }
}

mp.cmds.add(['voiptest'], (player, id) => {
    if(!id) return
    var targetP = mp.core.idOrName(player, id)
    if(targetP) {
        mp.chat.success(player, `Enabled voice to ${targetP.characterName}`)
        player.enableVoiceTo(targetP);
    }
})