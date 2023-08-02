import { createStore } from 'vuex';

const store = createStore({
    state: {
        playerInfo: [],
        serverData: [],
        token: "",
        showLogin: false
    },
    mutations: {
        setToken(state, token) {
            state.token = token;
        },

        setPlayerData(state, {data}) {
            state.playerInfo = [];
            state.playerInfo.push({ data });
        },

        setLogin(state, tog) {
            console.log(`Store: ${tog}`)
            state.showLogin = tog;
        },

        setServerData(state, {data}) {
            state.serverData = [];
            state.serverData.push({ data });
        }
    },
    getters: {
        getPlayerData: (state) => {
            return state.playerInfo;
        },

        getState: (state) => {
            return state.showLogin;
        },

        getToken: (state) => {
            return state.token;
        },

        getServerData: (state) => {
            return state.serverData;
        }
    }
})

export default store;