class nametagSys {
	constructor() {
		const maxDistance = 25 * 25;
		var ameTimer = null;
		mp.players.local.isTyping = false;
		mp.nametags.enabled = false;
		mp.players.local.isTabbed = false;
		this.streamedPlayers = {};
		this.tagSt = true;
		this.opacity = 225;
		this.x = 0.5;
		this.scale = 0.55;
		this.ameNot = null;

		mp.events.add({
			tagSt: (bool) => {
				if (bool) {
					this.tagSt = true;
				} else if (!bool) {
					this.tagSt = false;
				}
			},
			chatActive: (bool) => {
				mp.players.local.isTyping = bool;
			},
			entityStreamIn: async (entity) => {
				if (entity.type == "player") {
					mp.events.callRemote("requestNickName", entity);
					mp.events.callRemote("player:setClothing", entity);

					await mp.game.waitAsync(150);

					mp.events.callRemote("player:setModel", entity);
				}
				if (mp.players.local.getVariable("devdebug") == true) {
					mp.gui.chat.push(
						`entity Type: ${entity.type} Id: [${entity.remoteId}] was streamed.`
					);
					mp.console.logInfo(`${JSON.stringify(entity)}`, true, true);
				}
			},
			entityStreamOut: (entity) => {
				if (mp.players.local.getVariable("devdebug") == true) {
					mp.console.logInfo(`${JSON.stringify(entity)}`, true, true);
					mp.gui.chat.push(
						`entity Type: ${entity.type} Id: [${entity.remoteId}] was streamed out.`
					);
				}
			},
			setEntityName: (entity, name) => {
				if (entity.type == "player") {
					entity.nickName = name;
				}
			},
			render: (nametags) => {
				const graphics = mp.game.graphics;
				const screenRes = graphics.getScreenResolution(0, 0);
				if (mp.players.local.notifMsg) {
					mp.game.graphics.drawText(mp.players.local.notifMsg, [0.5, this.x], {
						font: 4,
						color: [220, 125, 225, this.opacity],
						scale: [this.scale, this.scale],
						outline: false,
					});
				}

				if (mp.players.local.ameMsg) {
					mp.game.graphics.drawText(mp.players.local.ameMsg, [0.5, this.x], {
						font: 4,
						color: [220, 125, 225, this.opacity],
						scale: [this.scale, this.scale],
						outline: false,
					});
				}
				nametags.forEach((nametag) => {
					if (!mp.players.local.getVariable("loggedIn") || !this.tagSt) return;
					let [player, x, y, distance] = nametag;
					if (mp.players.local.getVariable("devdebug")) {
						mp.console.logInfo(`${JSON.stringify(player)}`, true, true);
					}
					let isflying = player.getVariable("adminFly");
					let onaduty = player.getVariable("adminDuty");
					let aname = player.getVariable("adminName");
					let sid = player.getVariable("sid");
					let crouched = player.getVariable("crouched");
					let tabbed = player.getVariable("tabbedOut");

					if (distance <= maxDistance) {
						let scale = distance / maxDistance;
						if (scale < 0.6) scale = 0.6;

						var health = player.getHealth();
						health = health < 100 ? 0 : (health - 100) / 100;

						y -= scale * (0.005 * (screenRes.y / 1080));
						if (isflying) return;
						if (crouched) return;

						if (tabbed && !player.isTypingInTextChat) {
							graphics.drawText(
								`~HUD_COLOUR_PURPLELIGHT~Tabbed out~w~`,
								[x, y / 1.1],
								{
									font: 4,
									color: [200, 200, 200, 210],
									scale: [0.35, 0.35],
									outline: true,
								}
							);
						}

						if (player.getVariable("talkMsg")) {
							graphics.drawText(
								`${player.getVariable("talkMsg")}`,
								[x, y / 1.2],
								{
									font: 4,
									color: [92, 255, 111, 150],
									scale: [0.27, 0.27],
									outline: true,
								}
							);
						}

						if (player.isTypingInTextChat) {
							graphics.drawText(`Typing...`, [x, y / 1.1], {
								font: 4,
								color: [200, 200, 200, 150],
								scale: [0.3, 0.3],
								outline: true,
							});
						}

						if (player.getVariable("ameMsg") != null) {
							graphics.drawText(
								`${player.getVariable("ameMsg")}`,
								[x, y * 1.1],
								{
									font: 4,
									color: [220, 125, 225, 255],
									scale: [0.3, 0.3],
									outline: true,
								}
							);
						}

						if (
							mp.players.local.getVariable("adminDuty") == true &&
							mp.players.local.getVariable("adminFly") == true
						) {
							return;
						}

						if (player.getVariable("talking") == true) {
							graphics.requestStreamedTextureDict("mplobby", true);
							graphics.drawSprite(
								"mplobby",
								"mp_charcard_stats_icons9",
								x,
								y * 1.3,
								0.012,
								0.012,
								0,
								255,
								255,
								255,
								255
							);
						}

						if (onaduty) {
							graphics.drawText(
								`~w~<font color="#ca75ff">[Staff]</font> ${aname}`,
								[x, y],
								{
									font: 4,
									color: [255, 255, 255, 255],
									scale: [0.45, 0.45],
									outline: true,
								}
							);
							return;
						}

						if (mp.players.local.aliasTog) {
							graphics.drawText(
								`${player.getVariable("totalPlayTime") &&
									player.getVariable("totalPlayTime") < 2880
									? "~g~(New Player)~w~~n~"
									: ""
								} ~HUD_COLOUR_PURPLELIGHT~#${sid}~w~`,
								[x, y],
								{
									font: 4,
									color: [255, 255, 255, 255],
									scale: [0.3, 0.3],
									outline: false,
								}
							);
						}
						if (!mp.players.local.aliasTog) {
							graphics.drawText(
								`${player.getVariable("totalPlayTime") &&
									player.getVariable("totalPlayTime") < 2880
									? "~g~(New Player)~w~~n~"
									: ""
								} ${player.nickName
									? `~HUD_COLOUR_PURPLELIGHT~#${sid}~w~ ${player.nickName}`
									: `~HUD_COLOUR_PURPLELIGHT~#${sid}~w~`
								}`,
								[x, y],
								{
									font: 4,
									color: [255, 255, 255, 255],
									scale: [0.3, 0.3],
									outline: false,
								}
							);
						}

						if (player.getVariable("injured") == true) {
							graphics.requestStreamedTextureDict("mpinventory", true);
							graphics.drawSprite(
								"mpinventory",
								"survival",
								x,
								y / 1.009,
								0.023,
								0.023,
								0,
								255,
								117,
								117,
								255
							);
						}
					}
				});
			},
			ameCreate: (message) => {

				(this.opacity = 255), (this.x = 0.5), (this.scale = 0.55);
				mp.players.local.ameMsg = null;
				mp.players.local.notifMsg = null;
				mp.events.callRemote("ameMsg", null);

				if (ameTimer) {
					clearInterval(ameTimer);
					ameTimer = undefined;
				}

				if (this.ameNot) {
					clearInterval(this.ameNot);
					this.ameNot = undefined;
				}

				var ameText = "* " + message.toString().replace(/~/, "") + " *";
				mp.players.local.ameMsg = ameText;
				mp.events.callRemote("ameMsg", ameText);
				ameTimer = setInterval(async () => {
					mp.players.local.ameMsg = null;

					if (!ameTimer) return;
					clearInterval(ameTimer);
					ameTimer = undefined;
				}, 6500);
				this.ameNot = setInterval(() => {
					if (this.opacity < 0 && this.ameNot) {
						clearInterval(this.ameNot);
						this.ameNot = undefined;
					}

					if (this.x > 0.62) {
						mp.players.local.ameMsg = null;

						if (this.ameNot) {
							clearInterval(this.ameNot);
							this.ameNot = undefined;
						}
					}
					this.opacity = this.opacity - 1;
					this.x = this.x + 0.0005;
					this.scale = this.scale - 0.0007;
				}, 10);
			},
			notifCreate: (message) => {

				if (ameTimer) {
					clearInterval(ameTimer);
					ameTimer = undefined;
				}

				if (this.ameNot) {
					clearInterval(this.ameNot);
					this.ameNot = undefined;
				}

				(this.opacity = 255), (this.x = 0.5), (this.scale = 0.55);
				mp.players.local.ameMsg = null;
				mp.players.local.notifMsg = null;

				var notifTxt = message;
				mp.players.local.notifMsg = notifTxt;

				ameTimer = setInterval(async () => {
					mp.players.local.notifMsg = null;
				}, 6500);
				this.ameNot = setInterval(() => {
					if (this.opacity < 0 && this.ameNot) {
						clearInterval(this.ameNot);
						this.ameNot = undefined;
					}

					if (this.x > 0.62) {
						mp.players.local.notifMsg = null;

						if (this.ameNot) {
							clearInterval(this.ameNot);
							this.ameNot = undefined;
						}
					}

					this.opacity = this.opacity - 1;
					this.x = this.x + 0.0005;
					this.scale = this.scale - 0.0007;
				}, 10);
			},
		});

		mp.events.addProc({
			"proc:getAlias": (target) => {
				if (target.type == "player" && target.nickName != undefined) {
					return target.nickName;
				}
			},
		});

		setInterval(() => {
			if (!mp.system.isFocused) {
				mp.events.callRemote("setTabbed", true);
			} else {
				mp.events.callRemote("setTabbed", false);
			}
		}, 1000);
	}
}

const nameTag = new nametagSys();
