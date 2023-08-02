<template>
    <div>
        <h2 style="position:absolute; margin-left:20vw; margin-top:1vw; background-color:rgb(40,40,40); font-size:20px; padding:1vw; border-radius:10px; width:70vw;">Staff Tools {{appView != 'none' ? "| "+appView : ""}}<font v-if="appView != 'none'" style="float:right;"><i @click="appView = 'none'" class="fa-solid fa-circle-xmark" style="color:rgba(255, 0, 0, 0.607);"></i> <i v-if="appView === 'Player Profile'" @click="search()" class="fa-solid fa-arrows-rotate" style="color:rgb(0, 255, 64); margin-left:.2vw;"></i></font></h2>
        <div style="position:absolute; margin-left:20vw; margin-top:6vw; background-color:rgb(40,40,40); font-size:20px; padding:1vw; border-radius:10px; width:70vw;">

            <div v-if="appView === 'none'" style="text-align:center;">
                <div v-if="playerData[0].adminStatus > 0" style="margin-left:3vw; display:inline-block; background-color:rgba(0, 0, 0, 0.182); padding:.5vw; border-radius:10px;">
                    <h2 :style="{'color': adminColours[1]}">Support +</h2>
                    <button class="uiButton">Questions</button>
                    <button class="uiButton" style="display:block; margin:auto; margin-top:.5vw;">Quizes</button>
                </div>
                <div v-if="playerData[0].adminStatus > 2" style="margin-left:3vw; display:inline-block; background-color:rgba(0, 0, 0, 0.182); padding:.5vw; border-radius:10px;">
                    <h2 :style="{'color': adminColours[3]}">Moderator +</h2>
                    <button @click="entryHandle('playerManagement')" class="uiButton">Player Management</button>
                    <button class="uiButton" style="display:block; margin:auto; margin-top:.5vw;">Player Logs</button>
                </div>
                <div v-if="playerData[0].adminStatus > 6" style="margin-left:3vw; display:inline-block; background-color:rgba(0, 0, 0, 0.182); padding:.5vw; border-radius:10px;">
                    <h2 :style="{'color': adminColours[7]}">Head Administrator +</h2>
                    <button class="uiButton">Account Management</button>
                    <button class="uiButton" style="display:block; margin:auto; margin-top:.5vw;">Payment Logs</button>
                </div>
                <div v-if="playerData[0].adminStatus > 7" style="margin-left:3vw; display:inline-block; background-color:rgba(0, 0, 0, 0.182); padding:.5vw; border-radius:10px;">
                    <h2 :style="{'color': adminColours[8]}">Owner +</h2>
                    <button class="uiButton" style="display:block;">Server Management</button>
                    <button class="uiButton" style="display:block; margin:auto; margin-top:.5vw;">Staff Management</button>
                </div>
            </div>

            <div v-if="appView === 'Player Search'">
                <div class="dropdown">
                    <button class="dropbtn">Change search type</button>
                    <div class="dropdown-content">
                        <a @click="searchType = 'Character Name'" href="#">Character Name</a>
                        <a @click="searchType = 'Character SQLID'" href="#">Character SQLID</a>
                        <a @click="searchType = 'Character ID + UNIX'" href="#">Character ID + UNIX</a>
                        <a @click="searchType = 'Account Name'" href="#">Account Name</a>
                        <a @click="searchType = 'Account SQLID'" href="#">Account SQLID</a>
                    </div>
                </div>
                <div v-if="searchType != 'Character ID + UNIX'" style="margin-top:1vw;">
                    <form>
                        <input style="background-color:rgba(0, 0, 0, 0.182); padding:.6vw; border-radius:10px; margin-left:1vw;" :placeholder="'Enter a '+searchType+'...'" v-model="searchQuery">
                    </form>
                </div>
                <div v-else style="margin-top:1vw;">
                    <form>
                        <input style="background-color:rgba(0, 0, 0, 0.182); padding:.6vw; border-radius:10px; margin-left:1vw;" :placeholder="'Enter a player ID...'" v-model="gameId">
                        <input style="background-color:rgba(0, 0, 0, 0.182); padding:.6vw; border-radius:10px; margin-left:1vw;" :placeholder="'Enter a unix timestamp...'" v-model="gameUnix">
                    </form>
                </div>
                <button @click="search()" style="margin-left:1vw; margin-top:1vw; background-color:rgba(0, 0, 0, 0.182); padding:.5vw; border-radius:10px;">Search</button>
                <div style="color:red; text-align:center;"> {{staticError}} </div>
            </div>

            <div v-if="appView === 'Player Profile'">
                <div v-if="playerProfile.length == 0" style="text-align:center"> <loadingSpinner /> </div>
                <div v-else>
                    <div style="background-color:rgba(0, 0, 0, 0.182); text-align:center; padding:.5vw; border-radius:10px;">
                        <p>{{ playerProfile[0].data.cName }} <font style="color:grey;"> #{{playerProfile[0].data.id}}</font></p>
                        <p style="background-color:grey; width:9vw; margin:auto; border-radius:10px; margin-top:.5vw; display:inline-block;" :style="{'background-color': playerProfile[0].online ? 'green' : 'red'}">{{ playerProfile[0].online ? 'Online' : 'Offline' }}</p>
                        <p style="background-color:grey; width:9vw; margin:auto; border-radius:10px; margin-top:.5vw; display:inline-block; margin-left:1vw;">{{ playerProfile[0].data.factionOne == 0 ? 'No Faction' : "" }}</p>
                        <p style="width:9vw; margin:auto; border-radius:10px; margin-top:.5vw; display:inline-block; margin-left:1vw;" :style="{'background-color': playerProfile[0].data.sex === 'female' ? '#ae00ff' : '#0099ff'}">{{ playerProfile[0].data.sex[0].toUpperCase()+playerProfile[0].data.sex.slice(1)}} <i :class="playerProfile[0].data.sex === 'female' ? 'fa-solid fa-venus' : 'fa-solid fa-mars'" style="margin-left:0.3vw;"></i></p>
                    </div>
                    <div style="background-color:rgba(0, 0, 0, 0.182); margin-top:1.5vw; border-radius:10px; padding:.5vw;">
                        <table style="line-height:2vw; width:50vw; margin:auto;">
                            <tr>
                                <td class="insert"><font style="margin-left:1vw;">Play Time</font><font style="float:right; margin-right:1vw;">{{ Math.floor(playerProfile[0].data.playTime/60) }} hours | {{ playerProfile[0].playTime }} minutes</font></td>
                            </tr>
                            <tr>
                                <td class="insert"><font style="margin-left:1vw;">Banned</font><font style="float:right; margin-right:1vw; border-radius:10px; padding-left:.5vw; padding-right:.5vw;" :style="{'background-color': playerProfile[0].banned == 1 ? 'red' : 'green'}">{{playerProfile[0].banned == 1 ? 'Banned' : 'Not banned'}}</font></td>
                            </tr>
                            <tr>
                                <td class="insert"><font style="margin-left:1vw;">Total Cash</font><font style="float:right; margin-right:1vw;">${{playerProfile[0].data.cashAmount.toLocaleString('en-US')}}</font></td>
                            </tr>
                            <tr>
                                <td class="insert"><font style="margin-left:1vw;">Total Bank</font><font style="float:right; margin-right:1vw;">${{playerProfile[0].data.moneyAmount.toLocaleString('en-US')}}</font></td>
                            </tr>
                            <tr>
                                <td class="insert"><font style="margin-left:1vw;">Last Active</font><font style="float:right; margin-right:1vw;">{{formatUnixTimestamp(playerProfile[0].data.lastActive)}}</font></td>
                            </tr>
                            <tr>
                                <td class="insert"><font style="margin-left:1vw;">Injured</font><font style="float:right; margin-right:1vw; border-radius:10px; padding-left:.5vw; padding-right:.5vw;" :style="{'background-color': playerProfile[0].isInjured == 1 ? 'red' : 'green'}">{{playerProfile[0].isInjured == 1 ? 'injured' : 'Not injured'}}</font></td>
                            </tr>
                            <tr>
                                <td class="insert"><font style="margin-left:1vw;">Max Vehicles</font><font style="float:right; margin-right:1vw;">{{playerProfile[0].data.maxVehicles}}</font></td>
                            </tr>
                            <tr>
                                <td class="insert"><font style="margin-left:1vw;">Max Houses</font><font style="float:right; margin-right:1vw;">{{playerProfile[0].data.maxHouses}}</font></td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import loadingSpinner from './loadingSpinner.vue';

export default {
    data() {
        return {
            adminColours: ['', '#ff00fa', '#9666ff', '#37db63', '#018a35', '#ff6363', '#ff0000', '#00bbff', '#FFD700'],
            adminRanks: ['None', 'Support', 'Senior Support', 'Moderator', 'Senior Moderator', 'Administrator', 'Senior Administrator', 'Head Administrator', 'Owner'],
            staffData: [],
            searchQuery: '',
            gameId: null,
            gameUnix: null,
            searchData: [],
            queried: false,
            searchType: 'Character Name',
            appView: 'none',
            playerProfile: [],
            staticError: ''
        }
    },
    components: { loadingSpinner },
    computed: {
        ...mapGetters({ playerData: 'getPlayerData' }),
    },
    watch: {
        appView() {
            this.staticError = '', this.searchQuery = '', this.gameId = null, this.gameUnix = null;
        }
    },
    methods: {
        entryHandle(handle) {
            switch(handle) {
                case 'playerManagement':
                {
                    fetch('http://127.0.0.1:8081/adminauth', {
                        method: 'GET',
                        headers: {
                            "x-auth-token": window.sessionStorage.getItem('Stoken')
                        }
                    })
                    .then(resp => resp.json())
                    .then(json => {
                        if(json.status && json.adminLevel > 2) {
                            this.appView = 'Player Search';
                            this.queried = true;
                            return;
                        } else {
                            window.sessionStorage.setItem('Stoken', null), this.$router.push('login');
                        }
                    });
                    break;
                }
                default: break;
            }
        },
        search() {
            fetch('http://127.0.0.1:8081/searchplayer', {
                        method: 'POST',
                        body: JSON.stringify({
                            data: this.$data,
                            token: window.sessionStorage.getItem('Stoken')
                        }),
                        headers: {
                            "Content-type": "application/json; charset=UTF-8"
                        }
                    })
                    .then(resp => resp.json())
                    .then(json => {
                        if(json.status) {
                            this.appView = 'Player Profile';
                            this.queried = true;
                            this.playerProfile = [];
                            this.getProfileData(json.characterId)
                            return;
                        } else {
                            this.staticError = `No entry's could be found for the data entered.`
                        }
                    });
        },
        getProfileData(characterId) {
            fetch('http://127.0.0.1:8081/profile', {
                        method: 'GET',
                        headers: {
                            "x-auth-token": window.sessionStorage.getItem('Stoken'),
                            "cid": characterId
                        }
                    })
                    .then(resp => resp.json())
                    .then(json => {
                        if(json.status) {
                            this.appView = 'Player Profile';
                            this.queried = true;
                            this.playerProfile = [];
                            this.playerProfile.push({data: json.data, online: json.online});
                            return;
                        } else {
                            this.staticError = `No entry's could be found for the data entered.`
                        }
                    });
        },
        formatUnixTimestamp(unixTimestamp) {
            let date = new Date(unixTimestamp * 1000);
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let seconds = date.getSeconds();
            return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        },
    }
}
</script>

<style scoped>
.uiButton {
    width:12vw;
}

.dropbtn {
    background-color: rgba(0, 0, 0, 0.182);
    color: white;
    padding: 16px;
    font-size: 16px;
    border: none;
    border-radius: 10px;
}

.dropdown {
    position: relative;
    display: inline-block;
    margin-left:1vw;
}

.dropdown-content {
    display: none;
    position: absolute;
    background-color: rgb(40,40,40);
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
}

.dropdown-content a {
    color: white;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
}

table {
    border-collapse: separate;
    border-spacing: 0 20px;
}

th, td {
    width: 150px;
    padding: 5px;
}

.dropdown-content a:hover {background-color: rgba(0, 0, 0, 0.182);}

.dropdown:hover .dropdown-content {display: block;}

.dropdown:hover .dropbtn {background-color: rgba(69, 69, 69, 0.182);;}
</style>