const CONFIG = require("./chatformatconf.js").CONFIG;
const db = require("../models");

mp.cmds.add(["dc", "disconnect"], (player, arg) => {
	if (arg != null) return mp.chat.info(player, "Use: /disconnect");
	player.kick();
}),
	mp.cmds.add(
		["nick", "alias", "remember"],
		(player, fullText, target, ...name) => {
			class aliasSystem {
				constructor() {
					if (target == null || name == null)
						return mp.chat.info(player, "Use: /nick [id] [name]");
					if (target == player.id)
						return mp.chat.err(player, `You cannot alias yourself.`);
					if (
						name.length > 0 &&
						name != "" &&
						name != " " &&
						name != "  " &&
						name != "   " &&
						name != "    "
					) {
						this.entryString = name.join(" ");
						this.entryString.toString().replace(/~/, "");
						mp.players.forEachInRange(player.position, 50, async (ps) => {
							if (target == ps.sid && ps.id != player.id) {
								const { alias_names } = require("../models");
								alias_names
									.findAll({
										where: {
											OwnerId: player.characterId,
											TargetId: ps.characterId,
										},
									})
									.then((checkAlias) => {
										if (checkAlias.length > 0) {
											const { alias_names } = require("../models");
											alias_names
												.update(
													{
														aliasName: this.entryString,
													},
													{
														where: {
															OwnerId: player.characterId,
															TargetId: ps.characterId,
														},
													}
												)
												.then(() => {
													player.call("setEntityName", [ps, this.entryString]);
													mp.chat.success(
														player,
														`Updated alias for Player #${ps.id} to ${this.entryString}`
													);
												})
												.catch((err) => {
													mp.log(err);
												});
										} else if (checkAlias.length == 0) {
											const { alias_names } = require("../models");
											alias_names
												.create({
													OwnerId: player.characterId,
													TargetId: ps.characterId,
													aliasName: this.entryString,
												})
												.then(() => {
													player.call("setEntityName", [ps, this.entryString]);
													mp.chat.success(
														player,
														`Set alias for Player #${ps.id} to ${this.entryString}`
													);
												})
												.catch((err) => {
													mp.log(err);
												});
										}
									});
							}
						});
					}
				}
			}
			new aliasSystem();
		}
	),
	mp.cmds.add(["help"], (player) => {
		mp.cmds.getCmds().forEach((command) => {
			mp.chat.info(player, "/" + command);
		});
	});
mp.cmds.add(["removealias", "removenick"], (player, target) => {
	if (!target) return mp.chat.info(player, "Use: /removenick [id]");
	mp.players.forEachInRange(player.position, 50, async (ps) => {
		if (ps.id == target && ps.characterId) {
			const { alias_names } = require("../models");
			alias_names
				.findAll({
					where: {
						OwnerId: player.characterId,
						TargetId: ps.characterId,
					},
				})
				.then((name) => {
					if (name.length > 0) {
						const { alias_names } = require("../models");
						alias_names
							.destroy({
								where: {
									OwnerId: player.characterId,
									TargetId: ps.characterId,
								},
							})
							.then(() => {
								mp.chat.success(player, `Removed alias for Player #${ps.id}`);
								player.call("setEntityName", [ps, undefined]);
							});
					}
				})
				.catch((err) => {
					mp.log(err);
				});
		}
	});
}),
	mp.cmds.add(
		["time"],
		(player, arg) => {
			if (arg != null) return mp.chat.info(player, "Use: /time");
			function getUnixTimestamp() {
				return Math.round(Date.now() / 1000);
			}
			function formatUnixTimestamp(unixTimestamp) {
				const date = new Date(unixTimestamp * 1000);
				const hours = date.getHours();
				const minutes = date.getMinutes();
				const seconds = date.getSeconds();
				return `${date.getDate()}/${
					date.getMonth() + 1
				}/${date.getFullYear()} ${hours < 10 ? "0" : ""}${hours}:${
					minutes < 10 ? "0" : ""
				}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
			}
			mp.chat.info(
				player,
				`Current UTC Time: ${formatUnixTimestamp(
					getUnixTimestamp()
				)} | ${getUnixTimestamp()} | ${
					mp.enviroment.getTimeData()[0].currentTimeHour
				}:${mp.enviroment.getTimeData()[0].currentTimeMinute}:${
					mp.enviroment.getTimeData()[0].currentTimeSecond
				}`
			);
		},
		mp.cmds.add(
			["s", "shout"],
			(player, message) => {
				if (message == null)
					return mp.chat.info(player, "Use: /shout [message]");
				if (player.getVariable("injured") == true)
					return mp.chat.err(player, "You cannot shout whilst injured.");
				if (
					message.length > 0 &&
					message != "" &&
					message != " " &&
					message != "  " &&
					message != "   " &&
					message != "    "
				) {
					player.call("talkMsgCreate", [message]);
					mp.players.forEachInRange(
						player.position,
						CONFIG.shoutProx,
						async (ps) => {
							let localPlayerName = await ps.callProc("proc:getAlias", [
								player,
							]);
							if (localPlayerName === undefined) {
								localPlayerName = "Player";
							}
							player.call("ameCreate", ["Shouts."]);
							if (player.id == ps.id) {
								ps.outputChatBox(
									`${player.characterName} ${
										CONFIG.grey
									}shouts:!{white} ${message.toUpperCase()}`
								);
							}
							if (ps.id != player.id) {
								ps.outputChatBox(
									`${localPlayerName} !{#c0b3ef}#${player.sid} ${
										CONFIG.grey
									}shouts:!{white} ${message.toUpperCase()}`
								);
							}
						}
					);
				}
			},
			mp.cmds.add(["low", "quiet"], async (player, message) => {
				if (!message) return mp.chat.info(player, "Use: /low [message]");
				if (
					message.length > 0 &&
					message != "" &&
					message != " " &&
					message != "  " &&
					message != "   " &&
					message != "    "
				) {
					mp.players.forEachInRange(player.position, 5, async (ps) => {
						let localPlayerName = await ps.callProc("proc:getAlias", [player]);
						if (localPlayerName === undefined) {
							localPlayerName = "Player";
						}
						player.call("ameCreate", ["Talks quietly."]);
						if (player.id == ps.id) {
							ps.outputChatBox(
								`${player.characterName} ${CONFIG.grey}quietly says:!{white} ${message}`
							);
						}
						if (ps.id != player.id) {
							ps.outputChatBox(
								`${localPlayerName} !{#c0b3ef}#${player.sid} ${CONFIG.grey}quietly says:!{white} ${message}`
							);
						}
					});
				}
			}),
			mp.cmds.add(["q", "question", "ask"], (player, message) => {
				if (message == null) return mp.chat.info(player, "Use: /q [message]");
				if (player.createdQuestion == 1)
					return mp.chat.err(player, "You still have a pending question");
				player.createdQuestion = 1;
				player.question = message;
				mp.chat.question(
					player,
					"Your question has been !{#78cc78}submitted!{white} for online staff members to answer."
				);
				mp.players.forEach((ps) => {
					if (ps.isAdmin > 0 && ps.getVariable("toggledAdmin") === false) {
						mp.chat.question(
							ps,
							`!{grey}ID: !{orange}[!{white}${player.id}!{orange}]!{grey} | Question: !{orange}[!{white}${message}!{orange}]`
						);
					}
				});
			}),
			mp.cmds.add(
				["respq", "respondquestion"],
				(player, fullText, id, ...message) => {
					if (id == null || message == null)
						return mp.chat.info(player, "Use: /respq [id] [message]");
					if (player.isAdmin == 0)
						return mp.chat.info(player, `${CONFIG.noauth}`);
					const targetP = mp.players.at(id);
					if (targetP && targetP.createdQuestion === 1) {
						mp.players.forEach((ps) => {
							if (ps.getVariable("loggedIn")) {
								mp.chat.question(
									ps,
									`!{grey}((!{white} Player !{#c0b3ef}#${id} !{grey}asks:!{white} ${targetP.question} !{grey}))`
								);
								mp.chat.question(
									ps,
									`!{grey}((!{red} ${
										player.adminName
									}!{white} !{grey}responds:!{white} ${message.join(
										" "
									)} !{grey}))`
								);
							}
						});
						targetP.createdQuestion = 0;
						targetP.question = "undefined";
					} else {
						mp.chat.err(player, "Specified question was not found.");
					}
				},
				mp.cmds.add(["cw", "carwhisper"], (player, message) => {
					if (message == null || message.length == 0)
						return mp.chat.info(player, "Use: /cw [message]");
					if (player.vehicle) {
						mp.players.forEach(async (ps) => {
							if (ps.vehicle && ps.vehicle == player.vehicle) {
								player.call("ameCreate", ["Talks in the vehicle."]);
								let localPlayerName = await ps.callProc("proc:getAlias", [
									player,
								]);
								if (localPlayerName === undefined) {
									localPlayerName = "Player";
								}
								if (player.id == ps.id) {
									ps.outputChatBox(
										`${CONFIG.orange}* [In car] ${player.characterName} ${
											CONFIG.grey
										}says:!{white} ${
											message[0].toUpperCase() + message.slice(1)
										}`
									);
								}
								if (ps.id != player.id) {
									ps.outputChatBox(
										`${CONFIG.orange}* [In car] ${localPlayerName} !{#c0b3ef}#${
											player.id
										} ${CONFIG.grey}says:!{white} ${
											message[0].toUpperCase() + message.slice(1)
										}`
									);
								}
							}
						});
						return;
					}
					mp.chat.err(player, "Your not in a vehicle!");
				}),
				mp.cmds.add(["ame"], (player, message) => {
					if (message == null || message.length == 0)
						return mp.chat.info(player, "Use: /ame [message]");
					if (message.length > 150)
						return mp.chat.err(
							player,
							"AME messages cannot be longer then 150 characters."
						);
					player.call("ameCreate", [message]);
				}),
				mp.cmds.add(["givecash"], async (player, fullText, id, ...cash) => {
					if (id == null || cash == null)
						return mp.chat.info(player, "Use: /givecash [id] [amount]");
					if (parseInt(cash) > 100000) return;
					mp.players.forEachInRange(player.position, CONFIG.cashProx, (ps) => {
						if (id == ps.id && parseInt(cash) && id != player.id) {
							var calc = player.cashAmount - parseInt(cash);
							if (calc >= 0) {
								player.cashAmount = calc;
								ps.cashAmount = ps.cashAmount + parseInt(cash);
								const { characters } = require("../models");
								characters
									.update(
										{
											cashAmount: player.cashAmount,
										},
										{ where: { id: player.characterId } }
									)
									.then(() => {
										characters
											.update(
												{
													cashAmount: ps.cashAmount,
												},
												{ where: { id: ps.characterId } }
											)
											.then(async () => {
												let localPlayerName = await player.callProc(
													"proc:getAlias",
													[ps]
												);
												if (localPlayerName === undefined) {
													localPlayerName = "Player";
												}
												let localPlayerNameTwo = await ps.callProc(
													"proc:getAlias",
													[player]
												);
												if (localPlayerNameTwo === undefined) {
													localPlayerNameTwo = "Player";
												}
												mp.chat.success(
													player,
													`You handed ${localPlayerName} $${cash.toLocaleString(
														"en-US"
													)} in cash.`
												);
												mp.chat.success(
													ps,
													`You were given $${cash.toLocaleString(
														"en-US"
													)} in cash by ${localPlayerNameTwo}.`
												);
												player.call("ameCreate", [
													`Hands over some cash to Player #${ps.id}`,
												]);
											})
											.catch((err) => {
												mp.log(err);
											});
									});
							}
						}
					});
				}),
				mp.cmds.add(["stats", "info"], async (player, arg) => {
					if (arg != undefined || arg != null)
						return mp.chat.info(player, "Use: /stats");
					player.call("requestRoute", ["stats", true, true]);
					player.call("requestBrowser", [
						`appSys.commit('updateStats', {
            name: '${player.characterName}',
            id: ${player.id},
            bank: '${player.moneyAmount.toLocaleString("en-US")}',
            cash: '${player.cashAmount.toLocaleString("en-US")}',
            credits: '${player.creditsAmount.toLocaleString("en-US")}',
            phone: '${player.getVariable("phoneNumber")}',
            occupation: 'notset',
            hours: ${Math.round(player.playTime / 60)},
            salary: 0,
            debt: 0,
            vehicles: ${player.vehicles},
            characters: ${player.characters},
            houses: 0
            });`,
					]);
				}),
				mp.cmds.add(["w", "whisper"], (player, fullText, id, ...message) => {
					if (id == null || message == null || message.length == 0)
						return mp.chat.info(player, "Use: /w or /whisper [id] [message]");
					if (
						message.length > 0 &&
						message != "" &&
						message != " " &&
						message != "  " &&
						message != "   " &&
						message != "    "
					) {
						mp.players.forEachInRange(
							player.position,
							CONFIG.whisperProx,
							async (ps) => {
								if (id == ps.sid && id != player.sid) {
									let localPlayerName = await ps.callProc("proc:getAlias", [
										player,
									]);
									if (localPlayerName === undefined) {
										localPlayerName = "Player";
									}
									player.outputChatBox(
										`${CONFIG.orange}* You Whisper:!{white} ${message.join(
											" "
										)}`
									);
									ps.outputChatBox(
										`${CONFIG.orange}* ${localPlayerName} !{#c0b3ef}#${
											player.id
										}${CONFIG.orange} whispers:!{white} ${message.join(" ")}`
									);
									player.call("ameCreate", [`Whispers to Player [${ps.id}]`]);
								}
							}
						);
					}
				}),
				mp.cmds.add(["vr", "voicereset"], (player, channel) => {
					if (!channel) return mp.chat.info(player, "Use: /vr [channel]");
					if (channel == 0) {
						player.call("resetVOIP");
						mp.chat.success(player, "You reset your voice chat.");
					} else {
						mp.chat.err(player, "Select a valid channel to reset.");
					}
				}),
				mp.cmds.add(["b", "ooc", "o"], async (player, message) => {
					if (message == null || message.length == 0)
						return mp.chat.info(player, "Use: /b [message]");
					if (
						message.length > 0 &&
						message != "" &&
						message != " " &&
						message != "  " &&
						message != "   " &&
						message != "    "
					) {
						mp.players.forEachInRange(
							player.position,
							CONFIG.oocProx,
							async (ps) => {
								let localPlayerName = await ps.callProc("proc:getAlias", [
									player,
								]);
								if (localPlayerName === undefined) {
									localPlayerName = "Player";
								}
								if (ps.adminDuty) {
									ps.outputChatBox(
										`!{#B777FF}(( !{white} ${player.characterName} !{#c0b3ef}#${
											player.id
										} !{#B777FF}says:!{white} ${
											message[0].toUpperCase() + message.slice(1)
										} !{#B777FF}))`
									);
									return;
								}
								if (player.id == ps.id) {
									ps.outputChatBox(
										`!{#B777FF}(( !{white} ${
											player.characterName
										} !{#B777FF}says:!{white} ${
											message[0].toUpperCase() + message.slice(1)
										} !{#B777FF}))`
									);
								}
								if (ps.id != player.id) {
									ps.outputChatBox(
										`!{#B777FF}(( !{white} ${localPlayerName} !{#c0b3ef}#${
											player.id
										} !{#B777FF}says:!{white} ${
											message[0].toUpperCase() + message.slice(1)
										} !{#B777FF}))`
									);
								}
							}
						);
					}
				}),
				mp.cmds.add(["help"], (player, arg) => {
					if (arg != null) return mp.chat.info(player, "Use: /help");
					mp.cmds.getCmds(player);
				}),
				mp.cmds.add(["dice", "roll"], (player, value = 6) => {
					const dice = Math.floor(Math.random() * value) + 1;
					if (value > 0 && value <= 100) {
						mp.players.forEachInRange(
							player.position,
							CONFIG.meProx,
							async (ps) => {
								let localPlayerName = await ps.callProc("proc:getAlias", [
									player,
								]);
								if (localPlayerName === undefined) {
									localPlayerName = "Player";
								}
								if (ps.adminDuty) {
									mp.chat.sendMsg(
										ps,
										"fa-solid fa-dice",
										"#66d0fa",
										`!{white}${player.characterName} !{#c0b3ef}#${player.id}!{white} rolled a ${value} sided dice and scored a ${dice}!`
									);
									return;
								}
								if (player.id == ps.id) {
									mp.chat.sendMsg(
										player,
										"fa-solid fa-dice",
										"#66d0fa",
										`!{white}You rolled a ${value} sided dice and scored a ${dice}`
									);
								}
								if (ps.id != player.id) {
									mp.chat.sendMsg(
										player,
										"fa-solid fa-dice",
										"#66d0fa",
										`!{white}${localPlayerName} !{#c0b3ef}#${player.id}!{white} rolled a ${value} sided dice and scored a ${dice}!`
									);
								}
							}
						);
					}
				}),
				mp.cmds.add(["me"], (player, message) => {
					if (message == null || message.length == 0)
						return mp.chat.info(player, "Use: /me [message]");
					if (
						message.length > 0 &&
						message != "" &&
						message != " " &&
						message != "  " &&
						message != "   " &&
						message != "    "
					) {
						mp.players.forEachInRange(
							player.position,
							CONFIG.meProx,
							async (ps) => {
								let localPlayerName = await ps.callProc("proc:getAlias", [
									player,
								]);
								if (localPlayerName === undefined) {
									localPlayerName = "Player";
								}
								if (ps.adminDuty) {
									ps.outputChatBox(
										`!{#ff9cf2}* ${player.characterName} !{#c0b3ef}#${player.id}!{#ff9cf2} ${message}`
									);
									return;
								}
								if (player.id == ps.id) {
									player.outputChatBox(
										`!{#ff9cf2}* ${player.characterName} ${message}`
									);
								}
								if (ps.id != player.id) {
									ps.outputChatBox(
										`!{#ff9cf2}* ${localPlayerName} !{#c0b3ef}#${player.id}!{#ff9cf2} ${message}`
									);
								}
							}
						);
					}
				}),
				mp.cmds.add(["do"], (player, message) => {
					if (message == null || message.length == 0)
						return mp.chat.info(player, "Use: /do [message]");
					if (
						message.length > 0 &&
						message != "" &&
						message != " " &&
						message != "  " &&
						message != "   " &&
						message != "    "
					) {
						mp.players.forEachInRange(
							player.position,
							CONFIG.doProx,
							async (ps) => {
								let localPlayerName = await ps.callProc("proc:getAlias", [
									player,
								]);
								if (localPlayerName === undefined) {
									localPlayerName = "Player";
								}
								if (ps.adminDuty) {
									ps.outputChatBox(
										`!{#ff9cf2}* ${message} ( ${player.characterName} !{#c0b3ef}#${player.id}!{#ff9cf2} )`
									);
									return;
								}
								if (player.id == ps.id) {
									player.outputChatBox(
										`!{#ff9cf2}* ${message} ( ${player.characterName} )`
									);
								}
								if (ps.id != player.id) {
									ps.outputChatBox(
										`!{#ff9cf2}* ${message} ( ${localPlayerName} !{#c0b3ef}#${player.id}!{#ff9cf2} )`
									);
								}
							}
						);
					}
				}),
				mp.cmds.add(["longdo", "ldo"], (player, fullText, id, ...message) => {
					if (fullText == null || id == null || message.length == 0)
						return mp.chat.info(player, "Use: /longdo [Name/ID] [message]");
					var targetPlayer = mp.core.idOrName(player, id);
					if (targetPlayer == player) {
						return mp.chat.err(
							player,
							`You cannot send a longdo message to yourself.`
						);
					}
					if (targetPlayer) {
						mp.chat.sendMsg(
							player,
							"fa-solid fa-comments",
							"#8466e2",
							`!{#8466e2}${message.join(" ")} ( ${player.characterName} )`
						);
						mp.chat.sendMsg(
							targetPlayer,
							"fa-solid fa-comments",
							"#8466e2",
							`!{#8466e2}${message.join(" ")} ( !{#c0b3ef}#${
								player.id
							}!{#8466e2} ${
								player.characterName
							} ) (( !{#fff652}Use: /ldo [Name/ID] [message] to respond!{#8466e2} ))`
						);
						return;
					} else if (!targetPlayer) {
						mp.chat.err(player, `Player could not be found.`);
					}
				}),
				mp.cmds.add(
					["pm", "privatemessage"],
					async (player, fullText, id, ...message) => {
						if (!fullText || !id || message.length == 0)
							return mp.chat.info(player, "Use: /pm [Name/ID] [message]");
						var targetPlayer = mp.core.idOrName(player, id);
						if (targetPlayer == player)
							return mp.chat.err(player, `You cannot PM yourself.`);
						if (targetPlayer && targetPlayer != player) {
							let localPlayerNameTwo = await player.callProc("proc:getAlias", [
								targetPlayer,
							]);
							if (localPlayerNameTwo === undefined) {
								localPlayerNameTwo = "Player";
							}
							let localPlayerName = await targetPlayer.callProc(
								"proc:getAlias",
								[player]
							);
							if (localPlayerName === undefined) {
								localPlayerName = "Player";
							}
							mp.chat.pmgrey(
								player,
								`!{grey}PM from you to ${localPlayerNameTwo} #${
									targetPlayer.id
								} ((!{white} ${message.join(" ")}!{grey} ))`
							);
							mp.chat.pmgreen(
								targetPlayer,
								`!{#a4faa2}PM From ${localPlayerName} !{#c0b3ef}#${
									player.id
								}!{#919191}: !{#919191}((!{white} ${message.join(
									" "
								)} !{#919191}))  ((!{#fff652} Use: /pmb [message] to respond !{#919191}))`
							);
							targetPlayer.setVariable("lastPm", player.characterId);
						} else {
							mp.chat.err(player, `No player was found.`);
						}
					}
				),
				mp.cmds.add(["pmb", "pmback"], async (player, message) => {
					if (!message) return mp.chat.info(player, `Use: /pmb [message]`);
					if (player.getVariable("lastPm")) {
						mp.players.forEach(async (ps) => {
							if (ps.characterId == player.getVariable("lastPm")) {
								let localPlayerNameTwo = await player.callProc(
									"proc:getAlias",
									[ps]
								);
								if (localPlayerNameTwo === undefined) {
									localPlayerNameTwo = "Player";
								}
								let localPlayerName = await ps.callProc("proc:getAlias", [
									player,
								]);
								if (localPlayerName === undefined) {
									localPlayerName = "Player";
								}
								mp.chat.pmgrey(
									player,
									`!{grey}PM from you to ${localPlayerNameTwo} #${ps.id} !{grey}((!{white} ${message} !{grey}))`
								);
								mp.chat.pmgreen(
									ps,
									`!{#a4faa2}PM From ${localPlayerName} !{#c0b3ef}#${player.id}!{#919191}: !{#919191}((!{white} ${message} !{#919191}))  ((!{#fff652} Use: /pmb [message] to respond !{#919191}))`
								);
								ps.setVariable("lastPm", player.characterId);
							}
						});
					}
				}),
				mp.cmds.add(
					["apm", "adminprivatemessage"],
					(player, fullText, id, ...message) => {
						if (!fullText || !id || !message || message.length == 0)
							return mp.chat.info(player, "Use: /apm [Name/ID] [message]");
						if (player.isAdmin > 2) {
							var targetPlayer = mp.core.idOrName(player, id);
							if (targetPlayer == player)
								return mp.chat.err(player, `You cannot PM yourself.`);
							if (targetPlayer && targetPlayer != player) {
								mp.chat.aPush(
									player,
									`ADMIN from you to ${targetPlayer.characterName} #${
										targetPlayer.id
									} (( ${message.join(" ")} ))`
								);
								mp.chat.aPush(
									targetPlayer,
									`ADMIN ${player.adminName} [${
										player.id
									}] to you: (( !{white}${message.join(
										" "
									)}!{white} !{#ff4242})) !{#ff4242}((!{#fff652} Use: /pmb [message] to respond !{#ff4242}))`
								);
								targetPlayer.setVariable("lastPm", player.characterId);
							} else {
								mp.chat.err(player, `No player was found.`);
							}
							return;
						}
						mp.chat.err(player, `${CONFIG.noauth}`);
					}
				),
				mp.cmds.add(["resync"], async (player, arg) => {
					if (arg != undefined) return mp.chat.info(player, "Use: /resync");
					mp.events.call("player:setClothing", player);
					mp.events.call("player:setModel", player);
					mp.chat.success(player, "Clothes resynced!");
				}),
				mp.cmds.add(["removekeys"], async (player, target) => {
					if (!target) return mp.chat.info(player, `Use: /removekeys [id]`);
					mp.players.forEachInRange(player.position, 30, async (ps) => {
						if (
							ps.vehicle &&
							player.vehicle &&
							ps.vehicle == player.vehicle &&
							player.vehicle.getVariable("sqlID") &&
							ps.id == parseInt(target) &&
							ps.id != player.id
						) {
							const { vehicles } = require("../models");
							vehicles
								.findAll({ where: { id: player.vehicle.getVariable("sqlID") } })
								.then((ve) => {
									if (ve[0].OwnerId == player.characterId) {
										const { vehicle_keys } = require("../models");
										vehicle_keys
											.findAll({
												where: {
													vehicleId: player.vehicle.getVariable("sqlID"),
												},
												characterId: ps.characterId,
											})
											.then(async (len) => {
												if (len.length != 0) {
													vehicle_keys
														.destroy({
															where: {
																vehicleId: player.vehicle.getVariable("sqlID"),
																characterId: ps.characterId,
															},
														})
														.then(async () => {
															let localPlayerName = await player.callProc(
																"proc:getAlias",
																[ps]
															);
															if (localPlayerName === undefined) {
																localPlayerName = "Player";
															}
															let localPlayerNameTwo = await ps.callProc(
																"proc:getAlias",
																[player]
															);
															if (localPlayerNameTwo === undefined) {
																localPlayerNameTwo = "Player";
															}
															mp.chat.success(
																player,
																`You have taken ${localPlayerName}'s #${ps.id} keys to your vehicle.`
															);
															mp.chat.info(
																ps,
																`${localPlayerNameTwo} has taken your set of keys to their vehicle.`
															);
														})
														.catch((err) => {
															mp.log(err);
														});
												} else {
													mp.chat.err(
														player,
														`This player does not have keys to this vehicle.`
													);
												}
											});
									}
								});
						}
					});
				}),
				mp.cmds.add(["anim"], async (player, fullText, anim, ...animLib) => {
					if (!anim || !animLib || animLib.length == 0)
						return mp.chat.info(player, `Use: /anim [anim] [animLib]`);
					player.call("anim:test", [anim, animLib]);
				}),
				mp.cmds.add(["twerk"], (player, arg) => {
					if (player.getVariable("injured")) {
						return mp.chat.err(
							player,
							`You cannot use this action whilst injured.`
						);
					}
					if (arg != null) return mp.chat.info(player, `Use: /twerk`);
					player.call("notifCreate", ["~g~Successfully started animation"]);
					player.call("anim:test", [
						"mini@strip_club@private_dance@part3",
						"priv_dance_p3",
					]);
				}),
				mp.cmds.add(["dance"], (player, value) => {
					if (player.getVariable("injured")) {
						return mp.chat.err(
							player,
							`You cannot use this action whilst injured.`
						);
					}
					if (!value) {
						return mp.chat.info(player, `Use: /dance (0-4)`);
					}
					if (parseInt(value) && value > 0 && value <= 4) {
						player.call("notifCreate", ["~g~Successfully started animation"]);
						if (parseInt(value) == 1) {
							player.call("anim:test", [
								"special_ped@mountain_dancer@monologue_1@monologue_1a",
								"mtn_dnc_if_you_want_to_get_to_heaven",
							]);
						}
						if (parseInt(value) == 2) {
							player.call("anim:test", [
								"special_ped@mountain_dancer@monologue_2@monologue_2a",
								"mnt_dnc_angel",
							]);
						}
						if (parseInt(value) == 3) {
							player.call("anim:test", [
								"special_ped@mountain_dancer@monologue_3@monologue_3a",
								"mnt_dnc_buttwag",
							]);
						}
						if (parseInt(value) == 4) {
							player.call("anim:test", [
								"amb@world_human_partying@female@partying_cellphone@idle_a",
								"idle_a",
							]);
						}
					}
				}),
				mp.cmds.add(["carsex"], (player, value) => {
					if (player.getVariable("injured")) {
						return mp.chat.err(
							player,
							`You cannot use this action whilst injured.`
						);
					}
					if (!value) {
						return mp.chat.info(player, `Use: /carsex (0-2)`);
					}
					if (parseInt(value) && value > 0 && value <= 2) {
						player.call("notifCreate", ["~g~Successfully started animation"]);
						if (parseInt(value) == 1) {
							player.call("anim:test", [
								"oddjobs@assassinate@vice@sex",
								"frontseat_carsex_loop_f",
							]);
						}
						if (parseInt(value) == 2) {
							player.call("anim:test", [
								"oddjobs@assassinate@vice@sex",
								"frontseat_carsex_loop_m",
							]);
						}
					}
				}),
				mp.cmds.add(["sit"], (player, arg) => {
					if (player.getVariable("injured")) {
						return mp.chat.err(
							player,
							`You cannot use this action whilst injured.`
						);
					}
					if (arg != null) {
						return mp.chat.info(player, `Use: /sit`);
					}
					player.call("notifCreate", ["~g~Successfully started animation"]);
					player.call("anim:test", [
						"amb@prop_human_seat_chair@female@arms_folded@idle_a",
						"idle_c",
					]);
				}),
				mp.cmds.add(["kneel"], (player, arg) => {
					if (player.getVariable("injured")) {
						return mp.chat.err(
							player,
							`You cannot use this action whilst injured.`
						);
					}
					if (arg != null) return mp.chat.info(player, `Use: /kneel`);
					player.call("notifCreate", ["~g~Successfully started animation"]);
					player.call("anim:test", ["amb@medic@standing@kneel@base", "base"]);
				}),
				mp.cmds.add(["notes"], (player, arg) => {
					if (player.getVariable("injured")) {
						return mp.chat.err(
							player,
							`You cannot use this action whilst injured.`
						);
					}
					if (arg != null) return mp.chat.info(player, `Use: /notes`);
					player.call("notifCreate", ["~g~Successfully started animation"]);
					player.call("anim:move", [
						"amb@medic@standing@timeofdeath@base",
						"base",
					]);
				}),
				mp.cmds.add(["logout"], async (player, arg) => {
					if (arg != null) return mp.chat.info(player, "Use: /logout");
					if (player.getVariable("loggedIn") == true) {
						if (player.adminDuty) {
							return mp.chat.err(
								player,
								`You cannot logout whilst on admin duty!`
							);
						}
						mp.players.forEachInRange(
							player.position,
							CONFIG.exitProx,
							(ps) => {
								if (ps.getVariable("loggedIn") == true) {
									mp.chat.quit(
										ps,
										`!{white}Player !{#c0b3ef}#${player.id}!{white} has !{red}logged out!{white} to authentication.!{white}`
									);
								}
							}
						);
						for (var variableKey in player && variableKey != player.rpcIdx) {
							if (
								player.hasOwnProperty(variableKey) &&
								variableKey != player.rpcIdx
							) {
								delete player[variableKey];
							}
						}

						player.setVariable("adminFly", false);
						player.setVariable("adminRadar", false);
						player.call("requestBrowser", [`appSys.commit('clearChars')`]);
						player.setVariable("adminDuty", false);
						player.setVariable("loggedIn", false);
						player.setVariable("username", null);
						player.dimension = player.id + 1;
						player.call("client:showLoginScreen");
						player.call("clearChat");
						player.call("hud:Off");
					}
				}),
				mp.cmds.add(["dist"], async (player, id) => {
					if (!id) return mp.chat.info(player, `Use: /dist [Name/ID/SQLID]`);
					if (player.isAdmin > 7) {
						var targetPlayer = mp.core.idOrName(player, id);
						if (targetPlayer) {
							mp.chat.aPush(
								player,
								`Distance: ${player.dist(
									targetPlayer.position
								)} meters. For player ${targetPlayer.characterName}.`
							);
							return;
						} else if (!targetPlayer) {
							mp.vehicles.forEach((veh) => {
								if (
									veh.getVariable("sqlID") &&
									veh.getVariable("sqlID") == id
								) {
									mp.chat.aPush(
										player,
										`Distance: ${player.dist(
											veh.position
										)} meters. For Veh with sqlid ${veh.getVariable("sqlID")}`
									);
									return;
								}
							});
						}
						return;
					}
					mp.chat.err(player, `${CONFIG.noauth}`);
				}),
				mp.cmds.add(["compress"], (player, string) => {
					if (!player.isAdmin > 7 || !string) return;
					mp.core.compressStringToClient(player, string, "getDeString");
				}),
				mp.cmds.add(["afk"], (player, answer) => {
					if (!answer) return mp.chat.info(player, "Use: /afk [answer]");
					if (player.getVariable("afkAnswer")) {
						if (player.getVariable("afkAnswer") == answer) {
							mp.chat.success(player, "Your AFK timer has been reset.");
							player.call("clearAfkTimer");
							player.setVariable("afkAnswer", null);
							return;
						}
						if (player.getVariable("afkAnswer") != answer) {
							mp.chat.err(player, "Incorrect answer try again.");
						}
					} else {
						mp.chat.err(player, "You are not considered to be afk.");
					}
				}),
				mp.cmds.add(["nlrtimer"], async (player, arg) => {
					if (arg != undefined) return mp.chat.info(player, "Use: /nlrtimer");
					const nlrTimer = await player.callProc("proc:getNlrTime");
					if (!nlrTimer) return mp.chat.err(player, "You have not died yet");
					mp.chat.info(
						player,
						`You have ${Math.trunc(
							nlrTimer / 60
						)} minutes remaining of your NLR timer.`
					);
				}),
				mp.cmds.add(
					["radiofreq", "radiofrequency", "setradiofrequency"],
					async (player, freq) => {
						if (parseInt(freq) == 1) {
							mp.chat.success(player, `You have connect to frequency 1.`);
						}
					}
				),
				mp.cmds.add(["fdo", "floatingdo"], async (player, message) => {
					if (!message) return mp.chat.info(player, `Use: /fdo [message]`);
					message.replace(/~/, "");
					if (message.length > 100) {
						return mp.chat.err(
							player,
							`You cannot have more then 100 characters in a floating do statement`
						);
					}
					const { floating_dos } = require("../models");
					floating_dos
						.findAll({ where: { OwnerId: player.characterId } })
						.then((fdo) => {
							if (fdo.length >= 15) {
								return mp.chat.err(
									player,
									`You cannot have more then 15 floating do statements.`
								);
							} else {
								floating_dos
									.create({
										OwnerId: player.characterId,
										message: message,
										position: JSON.stringify(player.position),
									})
									.then((floatingStatement) => {
										const fdo = mp.labels.new(
											`~HUD_COLOUR_PURPLELIGHT~((~w~ ${message} ~HUD_COLOUR_PURPLELIGHT~)) \n~c~#${
												JSON.parse(JSON.stringify(floatingStatement)).id
											} ~HUD_COLOUR_NET_PLAYER10~[ Use: /removefdo ${
												JSON.parse(JSON.stringify(floatingStatement)).id
											} ] to remove`,
											player.position,
											{
												font: 4,
												drawDistance: 20,
												color: [255, 0, 0, 180],
												dimension: 0,
											}
										);
										fdo.setVariable(
											"sqlID",
											JSON.parse(JSON.stringify(floatingStatement)).id
										);
										mp.chat.success(
											player,
											`You placed a floating do statement with ID: ${
												JSON.parse(JSON.stringify(floatingStatement)).id
											}`
										);
									});
							}
						});
				}),
				mp.cmds.add(["removefdo", "rfdo"], async (player, id) => {
					if (!id) return mp.chat.info(player, `Use: /removefdo [id]`);
					mp.labels.forEachInRange(player.position, 20, async (lab) => {
						if (lab.getVariable("sqlID") == id) {
							const { floating_dos } = require("../models");
							floating_dos
								.findAll({
									where: {
										OwnerId: player.characterId,
										id: lab.getVariable("sqlID"),
									},
								})
								.then((fdo) => {
									if (fdo.length > 0) {
										floating_dos
											.destroy({
												where: {
													OwnerId: player.characterId,
													id: lab.getVariable("sqlID"),
												},
											})
											.then(() => {
												player.call("requestBrowser", [
													`gui.notify.showNotification("Removed floating do statement with ID: ${lab.getVariable(
														"sqlID"
													)}", false, true, 15000, 'fas fa-check-circle')`,
												]);
												lab.destroy();
											});
									} else {
										return mp.chat.err(
											player,
											`You do not own this floating do statement.`
										);
									}
								});
						}
					});
				}),
				mp.cmds.add(["chardesc"], async (player, desc) => {
					player.outputChatBox(`${desc} ${desc.toString()}`);
					if (!desc)
						return mp.chat.info(player, `Use: /chardesc [description]`);
					if (desc.length > 500)
						return mp.chat.err(
							player,
							`Your character description can not be more then 500 characters.`
						);
					const { character_descriptions } = require("../models");
					character_descriptions
						.findAll({ where: { OwnerId: player.characterId } })
						.then((desc) => {
							if (desc.length == 0) {
								character_descriptions
									.create({
										OwnerId: player.characterId,
										message: desc,
									})
									.then(() => {
										mp.chat.success(
											player,
											`You set your character description to ${desc}`
										);
									});
								return;
							} else {
								character_descriptions
									.update(
										{
											OwnerId: player.characterId,
											message: desc,
										},
										{ where: { OwnerId: player.characterId } }
									)
									.then(() => {
										mp.chat.success(
											player,
											`You edited your character description to ${desc}`
										);
									});
							}
						});
				}),
				mp.cmds.add(["examine"], async (player, target) => {
					if (!target) return mp.chat.info(player, `Use: /examine [id]`);
					mp.players.forEachInRange(player.position, 20, async (ps) => {
						if (
							ps.id == target &&
							ps.getVariable("loggedIn") &&
							ps.characterId
						) {
							const { character_descriptions } = require("../models");
							character_descriptions
								.findAll({ where: { OwnerId: ps.characterId } })
								.then(async (desc) => {
									if (desc.length == 0)
										return mp.chat.info(
											player,
											`This player has not set their characters description`
										);
									let localPlayerName = await player.callProc("proc:getAlias", [
										ps,
									]);
									if (localPlayerName === undefined) {
										localPlayerName = "Player";
									}
									mp.chat.info(
										player,
										`${localPlayerName} [${ps.id}]'s character description is: ${desc}`
									);
								});
						}
					});
				}),
				/*
        mp.cmds.add(['accent'], async (player, fullText, accent, ...msg) => {
          if (!accent || msg.length == 0) return mp.chat.info(player, `Use: /accent [accent] [message]`)
          mp.players.forEachInRange(player.position, 20,
            async (ps) => {
              if (ps.getVariable('loggedIn')) {
                let localPlayerName = await ps.callProc('proc:getAlias', [player])
                if (localPlayerName === undefined) { localPlayerName = 'Player' }
                if (ps.id == player.id) {
                  player.outputChatBox(`${player.characterName} (${accent} accent) ${CONFIG.grey}says:!{white} ${msg.join(' ')}`)
                }
                if (ps.id != player.id) {
                  if (ps.dist(player.position) >= 6) {
                    ps.outputChatBox(`!{#8c8c8c}${localPlayerName} [${player.sid}] (${accent} accent) ${CONFIG.grey}says:!{white} ${msg.join(' ')}`)
                  }
                  else if (ps.dist(player.position) >= 10) {
                    ps.outputChatBox(`!{#b8b8b8}${localPlayerName} [${player.sid}] (${accent} accent) ${CONFIG.grey}says:!{white} ${msg.join(' ')}`)
                    return;
                  }
                  else { ps.outputChatBox(`${localPlayerName} [${player.sid}] (${accent} accent) ${CONFIG.grey}says:!{white} ${msg.join(' ')}`) }
                }
              }
            })
        }),
        */

				// Core Server Remote Events
				mp.events.add({
					packagesLoaded: () => {
						const { floating_dos } = require("../models");
						floating_dos.findAll({}).then((fdo) => {
							fdo.forEach((fdostate) => {
								var fdos = mp.labels.new(
									`~HUD_COLOUR_PURPLELIGHT~((~w~ ${fdostate.message} ~HUD_COLOUR_PURPLELIGHT~))\n ~c~#${fdostate.id} ~HUD_COLOUR_NET_PLAYER10~[ Use: /removefdo ${fdostate.id} ] to remove`,
									new mp.Vector3(JSON.parse(fdostate.position)),
									{
										font: 4,
										drawDistance: 10,
										color: [255, 0, 0, 180],
										dimension: 0,
									}
								);
								fdos.setVariable("sqlID", fdostate.id);
							});
						});
					},
					"task:handsUp": (player) => {
						player.setVariable("handsAnimData", true);
					},
					"task:stopHands": (player) => {
						player.setVariable("handsAnimData", null);
					},
					voip: (player, level) => {
						switch (parseInt(level)) {
							case 1: {
								player.setVariable("voipLvl", 5);
								return;
							}
							case 2: {
								player.setVariable("voipLvl", 20);
								return;
							}
							case 3: {
								player.setVariable("voipLvl", 50);
							}
						}
					},
					requestNickName: async (player, target) => {
						if (
							player.characterId == undefined ||
							target.characterId == undefined
						)
							return;
						const { alias_names } = require("../models");
						alias_names
							.findAll({
								where: {
									OwnerId: player.characterId,
									TargetId: target.characterId,
								},
							})
							.then((checkName) => {
								if (checkName.length > 0) {
									player.call("setEntityName", [
										target,
										checkName[0].aliasName,
									]);
								}
							});
					},
					kickP: (player) => {
						if (!player.isAdmin > 7 && !player.adminDuty) {
							player.kick();
						}
					},
					afkans: (player, answer) => {
						player.setVariable("afkAnswer", answer);
					},
					lastMsg: (player, time) => {
						player.setVariable("lastMessage", time);
						// For Debug : player.outputChatBox(`${player.getVariable('lastMessage')}`)
					},
					console: (info) => {
						mp.log(
							`${CONFIG.consoleBlue}[CLIENT]${CONFIG.consoleWhite} ${JSON.parse(
								info
							)}`
						);
					},
					"player:getCount": async (player) => {
						player.call("requestRoute", ["listMenu", false, false]);
						mp.players.forEach((ps) => {
							const islogged = ps.getVariable("loggedIn");
							if (islogged) {
								player.call("requestBrowser", [
									`appSys.commit('updateLists', {
                  menuName: 'Player Count',
                  menuSub: 'Currently ${
										mp.players.length == 1
											? `${mp.players.length} player`
											: `${mp.players.length} players`
									} online.',
                  tableOne: 'Name',
                  tableTwo: 'ID',
                  tableThree: 'Ping',
                  icon: 'fa-solid fa-users',
                  name: 'Player [${ps.id}] [${ps.ping}]',
                  id: ${ps.id},
                  button: false,
                  funcs: ''
                });`,
								]);
							}
						});
					},
					playerReady: (player) => {
						player.notify = function (
							message,
							flashing = false,
							textColor = -1,
							bgColor = -1,
							flashColor = [77, 77, 77, 200]
						) {
							this.call("BN_Show", [
								message,
								flashing,
								textColor,
								bgColor,
								flashColor,
							]);
						};

						player.notifyWithPicture = function (
							title,
							sender,
							message,
							notifPic,
							icon = 0,
							flashing = false,
							textColor = -1,
							bgColor = -1,
							flashColor = [77, 77, 77, 200]
						) {
							this.call("BN_ShowWithPicture", [
								title,
								sender,
								message,
								notifPic,
								icon,
								flashing,
								textColor,
								bgColor,
								flashColor,
							]);
						};
					},
					playerQuit: (player, exitType, reason) => {
						if (player.getVariable("sqlID") && player.getVariable("loggedIn")) {
							const { characters } = require("../models");
							characters.update(
								{
									lastActive: mp.core.getUnixTimestamp(),
								},
								{ where: { id: player.characterId } }
							);
						}
					},
					setTabbed: (player, tog) => {
						player.setVariable("tabbedOut", tog);
					},
					ameMsg: (player, message) => {
						player.setVariable("ameMsg", message);
						player.ameTimeout != null ? clearTimeout(player.ameTimeout) : "";
						try {
							player.ameTimeout = setTimeout(() => {
								if (mp.players.at(player.id)) {
									player.setVariable("ameMsg", null);
								}
							}, 6500);
						} catch (e) {
							mp.log(e);
						}
					},
					denyVehicleOffer: (player) => {
						if (
							!player.vehicle ||
							!player.vehicle.getVariable("sqlID") ==
								JSON.parse(player.getVariable("vehOffer")).vehicleId
						)
							return mp.chat.err(player, `You must be in the vehicle offered.`);
						if (
							player.getVariable("vehOffer") &&
							player.vehicle &&
							player.vehicle.getVariable("sqlID") ==
								JSON.parse(player.getVariable("vehOffer")).vehicleId
						) {
							mp.players.forEach((ps) => {
								if (
									ps.getVariable("loggedIn") &&
									ps.vehicle &&
									ps.vehicle.getVariable("sqlID") ==
										JSON.parse(player.getVariable("vehOffer")).vehicleId
								) {
									const { vehicles } = require("../models");
									vehicles
										.findAll({
											where: {
												id: player.vehicle.getVariable("sqlID"),
												OwnerId: ps.characterId,
											},
										})
										.then((veh) => {
											if (veh.length > 0) {
												mp.chat.info(
													ps,
													`Player [${player.id}] has denied your offer for the vehicle [${player.vehicle.numberPlate}].`
												);
												mp.chat.info(
													player,
													`You denied offer for $${JSON.parse(
														player.getVariable("vehOffer")
													).price.toLocaleString("en-US")} for vehicle [${
														player.vehicle.numberPlate
													}]`
												);
											}
										});
								}
							});
						}
					},
					playerCommand: (player) => {
						mp.chat.err(
							player,
							"Invalid Command. Use /help to view all available commands"
						);
					},
					playerChat: (player, message) => {
						if (
							message.length > 0 &&
							message != "" &&
							message != " " &&
							message != "  " &&
							message != "   " &&
							message != "    "
						) {
							switch (player.adminDuty) {
								case true:
									mp.players.forEachInRange(player.position, 50, async (ps) => {
										ps.outputChatBox(
											`!{#b1a1ff}[!{${player.adminColour}}${player.adminSt}!{#b1a1ff}] !{#ff4242}${player.adminName}!{grey} ((!{white} ${message} !{grey}))`
										);
									});
									break;
								case false:
									player.call("talkMsgCreate", [message]);
									mp.players.forEachInRange(player.position, 20, async (ps) => {
										let localPlayerName = await ps.callProc("proc:getAlias", [
											player,
										]);
										if (localPlayerName === undefined) {
											localPlayerName = "Player";
										}
										if (player.id == ps.id) {
											player.outputChatBox(
												`${
													player.emergencyCall || player.emergencyService
														? "!{grey}[Phone]!{white}"
														: ""
												} ${player.characterName} ${
													CONFIG.grey
												}says:!{white} ${message}`
											);
										}
										if (ps.adminDuty) {
											ps.outputChatBox(
												`${player.characterName} !{#c0b3ef}#${player.id} ${CONFIG.grey}says:!{white} ${message}`
											);
											return;
										}
										if (ps.id != player.id) {
											if (ps.dist(player.position) >= 6) {
												ps.outputChatBox(
													`${
														player.emergencyCall || player.emergencyService
															? "!{grey}[Phone]!{white}"
															: ""
													} !{#8c8c8c}${
														localPlayerName === "Player"
															? `Player !{#c0b3ef}#${player.id} ${CONFIG.grey}says:!{white} ${message}`
															: `${localPlayerName} !{#c0b3ef}#${player.id} ${CONFIG.grey}says:!{white} ${message}`
													}`
												);
											} else if (ps.dist(player.position) >= 10) {
												ps.outputChatBox(
													`${
														player.emergencyCall || player.emergencyService
															? "!{grey}[Phone]!{white}"
															: ""
													} !{#b8b8b8}${
														localPlayerName === "Player"
															? `Player !{#c0b3ef}#${player.id} ${CONFIG.grey}says:!{white} ${message}`
															: `${localPlayerName} !{#c0b3ef}#${player.id} ${CONFIG.grey}says:!{white} ${message}`
													}`
												);
												return;
											} else {
												ps.outputChatBox(
													`${
														player.emergencyCall || player.emergencyService
															? "!{grey}[Phone]!{white}"
															: ""
													} ${
														localPlayerName === "Player"
															? `Player !{#c0b3ef}#${player.id} ${CONFIG.grey}says:!{white} ${message}`
															: `${localPlayerName} !{#c0b3ef}#${player.id} ${CONFIG.grey}says:!{white} ${message}`
													}`
												);
											}
										}
									});
									break;
							}
						}
					},
					playerWeaponChange: async (player, oldWeapon, newWeapon) => {
						if (player.getVariable("injured") == true) return;
					},
					toggleIndicator: (player, indicatorID) => {
						const vehicle = player.vehicle;
						if (vehicle && player.seat == -1) {
							switch (indicatorID) {
								case 0:
									vehicle.data.IndicatorRight = !vehicle.data.IndicatorRight;
									break;
								case 1:
									vehicle.data.IndicatorLeft = !vehicle.data.IndicatorLeft;
									break;
							}
						}
					},
					toggleCrouch: (player) => {
						if (player.data.isCrouched === undefined) {
							player.data.isCrouched = true;
							player.setVariable("crouched", true);
						} else {
							player.data.isCrouched = !player.data.isCrouched;
							player.setVariable("crouched", false);
						}
					},
					playerDeath: (player) => {
						player.data.isCrouched = false;
					},
					"player:carry": async (player, target) => {
						mp.log(`${player.characterName} | ${target.characterName}`);
						player.setVariable("carryInfo", target);
					},
					"player:stopCarry": async (player) => {
						if (player.getVariable("carryInfo")) {
							var target = player.getVariable("carryInfo");
							player.call("detachAll", [target]);
							target.data.dropAnim = true;
							player.setVariable("carryInfo", null);
							return;
						}
					},
					"player:removeHunger": async (player, units) => {
						if (
							player.getVariable("loggedIn") &&
							!player.getVariable("injured") &&
							!player.adminDuty &&
							!player.getVariable("adminJailed")
						) {
							if (player.hunger == 0 || player.hunger < 0) {
								player.call("requestBrowser", [
									`gui.notify.showNotification("You are dieing due to hunger", false, true, 12000, 'fa-solid fa-triangle-exclamation')`,
								]);
								mp.chat.err(player, `You are dieing of hunger!`);
								player.health = player.health - 6;
								player.hunger = 0;
								player.setVariable("hungerAmount", 0);
								const { characters } = require("../models");
								characters
									.update(
										{
											thirst: 0,
										},
										{ where: { id: player.characterId } }
									)
									.catch((err) => {
										mp.log(err);
									});
								return;
							} else if (player.hunger != 0) {
								var calc = player.hunger - parseInt(units);
								if (calc < 0 || calc == 0) {
									return (player.hunger = 0);
								}
								player.hunger = player.hunger - parseInt(units);
								player.setVariable("hungerAmount", player.hunger);
								const { characters } = require("../models");
								characters
									.update(
										{
											hunger: parseInt(player.hunger),
										},
										{ where: { id: player.characterId } }
									)
									.catch((err) => {
										mp.log(err);
									});
							}
						}
					},
					"player:removeThirst": async (player, units) => {
						if (
							player.getVariable("loggedIn") &&
							!player.getVariable("injured") &&
							!player.adminDuty &&
							!player.getVariable("adminJailed")
						) {
							if (player.thirst == 0 || player.thirst < 0) {
								mp.chat.err(player, `You are dieing of thirst!`);
								player.call("notifCreate", [`~r~You are dieing of thirst!`]);
								player.health = player.health - 8;
								player.thirst = 0;
								player.setVariable("thirstAmount", 0);
								db.characters
									.update(
										{
											thirst: 0,
										},
										{ where: { id: player.characterId } }
									)
									.catch((err) => {
										mp.log(err);
									});
								return;
							} else if (player.thirst > 0) {
								var calc = player.thirst - parseInt(units);
								if (calc < 0 || calc == 0) {
									return (player.thirst = 0);
								}
								player.thirst = player.thirst - parseInt(units);
								player.setVariable("thirstAmount", player.thirst);
								db.characters
									.update(
										{
											thirst: parseInt(player.thirst),
										},
										{ where: { id: player.characterId } }
									)
									.catch((err) => {
										mp.log(err);
									});
							}
						}
					},
					setSex: (player, sex) => {
						if (sex == "male") {
							player.model = mp.joaat("mp_m_freemode_01");
						} else if (sex == "female") {
							player.model = mp.joaat("mp_f_freemode_01");
						}
					},
					"resetClothes:server": async (player) => {
						if (player.getVariable("clothingData")) {
							mp.players.forEachInRange(player.position, 200, async (ps) => {
								ps.call("setPlayerClothes", [
									player,
									player.getVariable("clothingData"),
								]);
							});
						}
					},
					setHit: (player, index, value) => {
						if (index == 1) {
							player.setVariable("lastDmg", value);
						} else if (index == 2) {
							player.setVariable("lastWepToHit", value);
						}
					},
					"player:setClothing": async (player) => {
						if (!player.characterId) return;
						db.player_clothes
							.findAll({
								where: {
									OwnerId: player.characterId,
								},
							})
							.then((clothing) => {
								if (clothing.length > 0) {
									var clothes = JSON.parse(clothing[0].data);
									player.setVariable("clothingData", clothes);
									player.call("setPlayerClothes", [player, clothes]);
								}
								const { player_props } = require("../models");
								player_props
									.findAll({
										where: {
											OwnerId: player.characterId,
										},
									})
									.then((props) => {
										if (props.length > 0) {
											var prop = JSON.parse(props[0].data);
											player.setProp(0, parseInt(prop.hats), 0);
											player.setProp(1, parseInt(props.glasses), 0);
											player.setProp(2, parseInt(props.ears), 0);
											player.setProp(6, parseInt(props.watches), 0);
											player.setProp(7, parseInt(props.bracelets), 0);
										}
									});
							})
							.catch((err) => {
								mp.log(err);
							});
						const { player_tattoos } = require("../models");
						player_tattoos
							.findAll({ where: { OwnerId: player.characterId } })
							.then((tat) => {
								if (tat.length > 0) {
									tat.forEach((tats) => {
										mp.players.forEachInRange(
											player.position,
											200,
											async (ps) => {
												ps.call("setTat", [player, tats.libary, tats.section]);
											}
										);
									});
								}
							});
					},
					"target:setClothing": async (player, target) => {
						if (!target.characterId) return;
						const { player_clothes } = require("../models");
						player_clothes
							.findAll({
								where: {
									OwnerId: target.characterId,
								},
							})
							.then((clothing) => {
								if (clothing.length > 0) {
									var clothes = JSON.parse(clothing[0].data);
									mp.players.forEachInRange(
										target.position,
										200,
										async (ps) => {
											ps.call("setEntityClothes", [
												target,
												1,
												clothes.mask,
												clothes.maskTexture,
											]);
											ps.call("setEntityClothes", [
												target,
												3,
												clothes.torso,
												0,
											]);
											ps.call("setEntityClothes", [
												target,
												4,
												clothes.Leg,
												clothes.LegTexture,
											]);
											ps.call("setEntityClothes", [target, 5, clothes.bags, 0]);
											ps.call("setEntityClothes", [
												target,
												6,
												clothes.shoes,
												clothes.shoesTexture,
											]);
											ps.call("setEntityClothes", [
												target,
												7,
												clothes.acess,
												clothes.acessTexture,
											]);
											ps.call("setEntityClothes", [
												target,
												8,
												clothes.undershirt,
												clothes.undershirtTexture,
											]);
											ps.call("setEntityClothes", [
												target,
												9,
												clothes.armor,
												0,
											]);
											ps.call("setEntityClothes", [
												target,
												10,
												clothes.decals,
												clothes.decalsTexture,
											]);
											ps.call("setEntityClothes", [
												target,
												11,
												clothes.tops,
												clothes.topsTexture,
											]);
										}
									);
								}
								const { player_props } = require("../models");
								player_props
									.findAll({
										where: {
											OwnerId: target.characterId,
										},
									})
									.then((props) => {
										if (props.length > 0) {
											var prop = JSON.parse(props[0].data);
											target.setProp(0, parseInt(prop.hats), 0);
											target.setProp(1, parseInt(props.glasses), 0);
											target.setProp(2, parseInt(props.ears), 0);
											target.setProp(6, parseInt(props.watches), 0);
											target.setProp(7, parseInt(props.bracelets), 0);
										}
									})
									.catch((err) => {
										mp.log(err);
									});
							});
					},
					"player:setModel": async (player) => {
						if (!player.characterId) return;
						const { player_models } = require("../models");
						player_models
							.findAll({ where: { characterId: player.characterId } })
							.then((model) => {
								if (model.length > 0) {
									var features = JSON.parse(model[0].data);
									player.setVariable("modelData", features);
									if (player.getVariable("devdebug") == true) {
										player.outputChatBox(model[0].data);
									}
									mp.players.forEachInRange(
										player.position,
										200,
										async (ps) => {
											ps.call("setPlayerFace", [player, features]);
										}
									);
								}
							})
							.catch((err) => {
								mp.log(err);
							});
					},
				})
			)
		)
	);

setInterval(function () {
	mp.players.forEach(async (ps) => {
		var islogged = ps.getVariable("loggedIn");
		if (!islogged) return;
		ps.playTime = ps.playTime + Number(1);
		ps.accTime = ps.accTime + Number(1);
		ps.setVariable("totalPlayTime", ps.accTime);
		db.Accounts.update({ playTime: ps.accTime }, { where: { id: ps.sqlID } });
		db.characters
			.update(
				{
					playTime: ps.playTime,
				},
				{ where: { id: ps.characterId } }
			)
			.catch((err) => {
				mp.log(err);
			});
	});
}, 60000);

findPlayerByIdOrNickname = (playerName) => {
	let foundPlayer = null;
	mp.log(`${playerName.substring(0, playerName.indexOf(" "))}`);

	if (playerName == parseInt(playerName)) {
		foundPlayer = mp.players.at(playerName);
	}

	if (!foundPlayer) {
		mp.players.forEach((ps) => {
			if (
				playerName.substring(0, playerName.indexOf(" ")) === ps.characterName[0]
			) {
				foundPlayer = ps;
			}
		});
	}

	return foundPlayer;
};
