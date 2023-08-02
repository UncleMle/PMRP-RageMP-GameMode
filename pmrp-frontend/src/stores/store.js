import Vue from 'vue';
import Vuex from 'vuex';

/* eslint-disable */

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		playerInfo: {
			characters: [],
			notifications: [],
			creds: [],
			banInfo: [],
			playerStats: [],
			hungerThirst: [],
			inventoryItems: [],
			modalData: [],
			vehicleData: [],
			keyData: [],
			vehiclePerformance: [],
			bankInfo: [],
			bankingUiType: "",
			chatAccess: false,
			id: 0,
			name: 'notset',
			cash: 0,
			bank: 0,
			credits: 0,
			phone: 0,
			occupation: 0,
			hours: 0,
			salary: 0,
			debt: 0,
			vehicles: 0,
			charSlots: 0,
			houses: 0,
			customsBasket: [],

		},
		phone: {
			data: [],
			keys: [],
			appData: [],
			settings: [],
			recents: [],
			phoneNumber: ''
		},
		listMenu: {
			name: '',
			subText: '',
			icon: '',
			table: [],
			list: [],
			active: false,
		},
		views: {
			hud: {
				show: true,
				hudInfo: [],
				protected: false
			}
		},
		notifications: {
			nextItemId: 1,
			list: [],
		},
		Loading: {
			show: false,
		},
		playerReports: {
			activeReports: [],
		},
		Login: {
			showError: false,
			errorMsg: '',
		},
		admin: {
			espTracer: false,
			espBox: false,
			espTags: false,
			espSkel: false
		},
		vehicle: {
			showSpeedo: false,
			speedoData: [],
			dealerVehs: []
		}
	},
	mutations: {

		setDealerVehicles(state, {spawnName, vehName, price, stock}) {
			state.vehicle.dealerVehs.push({ spawnName, vehName, price, stock });
		},

		setBankUiType(state, {type}) {
			state.playerInfo.bankingUiType = type;
		},

		setPhoneKeys(state, {alt, wheelUp, wheelDown, space, staff}) {
			state.phone.keys = [];
			state.phone.keys.push({alt, wheelUp, wheelDown, space, staff});
		},

		setPhoneRecents(state, {data}) {
			state.phone.recents = [];
			state.phone.recents = [data];
		},

		setAtmInfo(state, {pinNum, moneyAmount, cashAmount, salary, taxRate}) {
			state.playerInfo.bankInfo = [];
			state.playerInfo.bankInfo.push({ pinNum, moneyAmount, cashAmount, salary, taxRate });
		},

		setPhoneData(state, {time, cursor, battery}) {
			state.phone.data = [];
			state.phone.data.push({time, cursor, battery});
		},

		setAppData(state, {characterName, moneyAmount, cashAmount, bankingLogs}) {
			state.phone.appData = [];
			state.phone.appData.push({ characterName, moneyAmount, cashAmount, bankingLogs });
		},

		setSettingsData(state, {silentMode, wallpaper, lightmode}) {
			state.phone.settings = [];
			state.phone.settings.push({ silentMode, wallpaper, lightmode });
		},

		flushAtmData(state) {
			state.playerInfo.bankInfo = [];
		},

		setVehicleData(state, {vehicleData, keyData}) {
			state.playerInfo.vehicleData.push({vehicleData});
		},

		vehPerformance(state, {engine, acceleration, brakes, topSpeed}) {
			state.playerInfo.vehiclePerformance = [];
			state.playerInfo.vehiclePerformance.push({engine, acceleration, brakes, topSpeed})
		},

		setKeyData(state, {keyData}) {
			state.playerInfo.keyData.push(keyData);
		},

		flushVehData(state) {
			state.playerInfo.vehicleData = [];
			state.playerInfo.keyData = [];
		},

		clearDealer(state) {
			state.vehicle.dealerVehs = [];
		},

		clearChars(state) {
			state.playerInfo.characters.splice(0, state.playerInfo.characters.length)
		},

		speedoTog(state, tog) {
			if (tog) { state.vehicle.showSpeedo = true }
			else if (!tog) { state.vehicle.showSpeedo = false }
		},

		updateSpeedo(state, { vehHealth, vehSpeed, vehicleFuel, vehRpm }) {
			if (state.vehicle.speedoData.length > 0) {
				state.vehicle.speedoData.splice(0, state.vehicle.speedoData.length)
				state.vehicle.speedoData.push({ vehHealth, vehSpeed, vehicleFuel, vehRpm })
			}
			else {
				state.vehicle.speedoData.push({ vehHealth, vehSpeed, vehicleFuel, vehRpm })
			}
		},

		updateModal(state, { icon, name, text, buttonText, buttonTwoText, buttonOne, buttonTwo, buttonOneArg, buttonTwoArg }) {
			if (state.playerInfo.modalData.length > 0) {
				state.playerInfo.modalData.splice(0, state.playerInfo.modalData.length)
				state.playerInfo.modalData.push({ icon, name, text, buttonText, buttonTwoText, buttonOne, buttonTwo, buttonOneArg, buttonTwoArg })
			}
			else {
				state.playerInfo.modalData.push({ icon, name, text, buttonText, buttonTwoText, buttonOne, buttonTwo, buttonOneArg, buttonTwoArg })
			}
		},

		setCreds(state, { user, pass }) {
			state.playerInfo.creds.push({ user, pass })
		},

		setBasket(state, { json }) {
			state.playerInfo.customsBasket = json;
		},

		chatActive(state, toggle) {
			if (toggle) {
				state.playerInfo.chatAccess = true
				return
			}
			else { state.playerInfo.chatAccess = false }
		},

		updateHungerThirst(state, { hungerLvl, thirstLvl }) {
			if (state.playerInfo.hungerThirst.length > 0) {
				state.playerInfo.hungerThirst.splice(0, state.playerInfo.hungerThirst.length)
				state.playerInfo.hungerThirst.push({ hungerLvl, thirstLvl })
			}
			else {
				state.playerInfo.hungerThirst.push({ hungerLvl, thirstLvl })
			}
		},

		addInventoryItem(state, { id, itemId, img, name, equipped }) {
			state.playerInfo.inventoryItems.push({ id, itemId, name, img, equipped })
		},

		setBanInfo(state, { username, IP, socialClub, reason, admin, issueDate, liftTime }) {
			if (state.playerInfo.banInfo.length > 0) {
				state.playerInfo.banInfo.splice(0, state.playerInfo.banInfo.length)
				state.playerInfo.banInfo.push({ username, IP, socialClub, reason, admin, issueDate, liftTime })
			}
			else {
				state.playerInfo.banInfo.push({ username, IP, socialClub, reason, admin, issueDate, liftTime })
			}
		},

		removeNotification(state, id) {
			for (const item of state.notifications.list) if (item.id === id) return state.notifications.list.splice(state.notifications.list.indexOf(item), 1);
		},

		showLoading(state, status) {
			state.Loading.show = status;
		},

		addChar(state, { id, name, hours, bank, faction, hp, lastPlayed, max, referral, creation, totalHours, adminPunishments, accName }) {
			state.playerInfo.characters.push({ id, name, hours, bank, faction, hp, lastPlayed, max, referral, creation, totalHours, adminPunishments, accName })
		},

		addSelectNotif(state, { id, text }) {
			state.playerInfo.notifications.push({ id, text })
		},

		addReport(state, { id, time, desc }) {
			state.playerReports.activeReports.push({ id, time, desc })
		},

		clearReports(state) {
			if (state.playerReports.activeReports.length > 0) {
				state.playerReports.activeReports.splice(0, state.playerReports.activeReports.length)
			}
		},

		clearInventory(state) {
			console.log(`Claerd`)
			if (state.playerInfo.inventoryItems.length > 0) {
				state.playerInfo.inventoryItems.splice(0, state.playerInfo.inventoryItems.length)
			}
		},

		removeReport(state, id) {
			for (const report in state.playerReports.activeReports) if (report.id === id) return state.playerReports.activeReports.splice(state.playerReports.list.indexOf(report), 1)
		},

		updateStats(state, { name, id, bank, cash, credits, phone, occupation, hours, salary, debt, vehicles, characters, houses }) {
			if (state.playerInfo.playerStats.length > 0) {
				state.playerInfo.playerStats = []
				state.playerInfo.playerStats.push({ name, id, bank, cash, credits, phone, occupation, hours, salary, debt, vehicles, characters, houses })
				return;
			}
			else if (state.playerInfo.playerStats.length == 0) { state.playerInfo.playerStats.push({ name, id, bank, cash, credits, phone, occupation, hours, salary, debt, vehicles, characters, houses }) }
		},

		updateHud(state, { unix, id, voice, radio, location, players, money, locationTwo, direction, fps }) {
			if (state.views.hud.hudInfo.length > 0) {
				state.views.hud.hudInfo.splice(0, state.views.hud.hudInfo.length)
				return state.views.hud.hudInfo.push({ unix, id, voice, radio, location, players, money, locationTwo, direction, fps })
			}
			else { state.views.hud.hudInfo.push({ unix, id, voice, radio, location, players, money, locationTwo, direction, fps }) }
		},

		updateLists(state, { menuName, menuSub, tableOne, tableTwo, tableThree, icon, name, id, button, funcs }) {
			setTimeout(() => {
				state.listMenu.name = menuName;
				state.listMenu.subText = menuSub;
				state.listMenu.icon = icon;
				state.listMenu.table.push({ tableOne, tableTwo, tableThree })
				state.listMenu.list.push({ name, id, button, funcs })
			}, 130);
		},

		areadProtect(state, toggle) {
			if (toggle) {
				state.views.hud.protected = true;
			}
			else if (!toggle) {
				state.views.hud.protected = false;
			}
		},

		showHud(state, toggle) {
			if (toggle) {
				state.views.hud.show = true;
			}
			else if (!toggle) {
				state.views.hud.show = false;
			}
		},

		changeESP(state, { prop, val }) {
			state.admin[prop] = val;
		}
	},
	actions: {
		addNotification({ commit }, { text, theme, time, title, img }) {
			const id = this.state.notifications.nextItemId++;
			commit('addNotification', { id, text, theme, title, img });
			if (!time) time = 5;
			setTimeout(() => {
				commit('removeNotification', id);
			}, time * 1000);
		},

		addReport({ commit }, { id, time, desc }) {
			commit('addReport', { id, time, desc })
		}
	},
	getters: {
		notificationsList: (state, getters) => {
			return state.notifications.list;
		},

		getPhoneKeys: (state, getters) => {
			return state.phone.keys;
		},

		getPhoneRecents: (state, getters) => {
			return state.phone.recents;
		},

		getSettingsData: (state, getters) => {
			return state.phone.settings;
		},

		getPhoneData: (state, getters) => {
			return state.phone.data;
		},

		getAppData: (state, getters) => {
			return state.phone.appData;
		},

		getListState: (state, getters) => {
			return state.listMenu.active;
		},

		getBankUI: (state, getters) => {
			return state.playerInfo.bankingUiType;
		},

		getAtmInfo: (state, getters) => {
			return state.playerInfo.bankInfo;
		},

		keysGetter: (state, getters) => {
			if(state.playerInfo.keyData && state.playerInfo.keyData.length > 0) {
				return state.playerInfo.keyData.sort((a, b) => a.id - b.id);
			}
		},

		getVehPerformance: (state, getters) => {
			return state.playerInfo.vehiclePerformance;
		},

		vehManageData: (state, getters) => {
			return state.playerInfo.vehicleData;
		},

		selectNotifs: (state, getters) => {
			return state.playerInfo.notifications;
		},

		getDealerVehs: (state, getters) => {
			return state.vehicle.dealerVehs.sort((a, b) => a.price - b.price);
		},

		getCreds: (state, getters) => {
			return state.playerInfo.creds;
		},

		statsList: (state, getters) => {
			return state.playerInfo.playerStats;
		},

		reportsList: (state, getters) => {
			return state.playerReports.activeReports;
		},

		inventoryList: (state, getters) => {
			return state.playerInfo.inventoryItems;
		},

		menuList: (state, getters) => {
			return state.listMenu.list.sort((a, b) => a.id - b.id);
		},

		chatStat: (state, getters) => {
			return state.playerInfo.chatAccess
		},

		menuName: (state, getters) => {
			const obj = {
				name: state.listMenu.name,
				subText: state.listMenu.subText,
				icon: state.listMenu.icon,
				table: state.listMenu.table
			}
			return obj
		},

		getHudState: (state, getters) => {
			return state.views.hud.show
		},

		hudInfo: (state, getters) => {
			return state.views.hud.hudInfo
		},

		getProtectedHud: (state, getters) => {
			return state.views.hud.protected
		},

		charactersList: (state, getters) => {
			return state.playerInfo.characters.sort((a, b) => b.lastPlayed - a.lastPlayed);
		},

		speedoState: (state, getters) => {
			return state.vehicle.showSpeedo;
		},

		speedoData: (state, getters) => {
			return state.vehicle.speedoData;
		},

		hungerThirstData: (state, getters) => {
			return state.playerInfo.hungerThirst;
		},

		banInfo: (state, getters) => {
			return state.playerInfo.banInfo;
		},

		getModalData: (state, getters) => {
			return state.playerInfo.modalData;
		},

		basketData: (state, getters) => {
			if (state.playerInfo.customsBasket.length > 0 && state.playerInfo.customsBasket != '[]') {
					var colours = []
					state.playerInfo.customsBasket.forEach(item => {
						if (window.mp) {
							switch (item.name) {
								case 'Pearlescent':
									{
										window.mp.trigger('veh:pearl', item.type)
										break;
									}
								case 'Wheel Type':
									{
										window.mp.trigger('veh:setWheelType', item.type)
										break;
									}
								case 'Paint Primary':
									{
										colours[0] = item.type;
										break;
									}
								case 'Paint Secondary':
									{
										colours[1] = item.type;
										break;
									}
								default:
									window.mp.trigger('veh:setMod', item.modId, item.type)
									break;
							}
						}
					})
				setTimeout(() => {
					console.log(colours)
					if (colours.length > 0) {
						window.mp.trigger('veh:setColour', colours[0] == undefined ? 111 : colours[0], colours[1] == undefined ? 111 : colours[1])
					}
				}, 100);
			}
			return state.playerInfo.customsBasket;
		}
	}
});
export default store;

