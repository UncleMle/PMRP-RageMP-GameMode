<template>
<div>
  <navBar name="Paramount Roleplay | User Control Panel"/>
  <div>

    <div style="background-color:rgb(31,31,31);">

        <div v-if="browsingType === 'home'">
            <h2 style="position:absolute; margin-left:20vw; margin-top:1vw; background-color:rgb(40,40,40); font-size:20px; padding:1vw; border-radius:10px; width:70vw;">{{dayState()}}, {{playerData[0].username}}</h2>

            <div style="position:absolute; margin-left:20vw; margin-top:6vw; background-color:rgb(40,40,40); padding:1vw; border-radius:10px; min-width:70vw;">
                <h2 style="text-align:center; font-size:25px; border-bottom: solid 4px rgba(0, 0, 0, 0.182); padding-bottom:1vw; margin-bottom:1vw;">Account Statistics</h2>
                <table style="line-height:2vw; width:50vw; margin-left:8vw;">
                    <tr>
                        <td class="insert"><font style="margin-left:1vw;">Play Time</font><font style="float:right; margin-right:1vw;">{{Math.floor(data[0].playTime/60)}} hours</font></td>
                    </tr>
                    <tr>
                        <td class="insert"><font style="margin-left:1vw;">Max Characters</font><font style="float:right; margin-right:1vw;">{{data[0].maxCharacters}}</font></td>
                    </tr>
                    <tr>
                        <td class="insert"><font style="margin-left:1vw;">Credits</font><font style="float:right; margin-right:1vw;">${{data[0].credits}}</font></td>
                    </tr>
                    <tr>
                        <td class="insert"><font style="margin-left:1vw;">Email</font><font style="float:right; margin-right:1vw;">{{data[0].email}}</font></td>
                    </tr>
                </table>
            </div>

            <div style="position:absolute; margin-left:20vw; margin-top:29vw; background-color:rgb(40,40,40); padding:1vw; border-radius:10px; min-width:70vw;">
              <h2 style="text-align:center; font-size:25px; border-bottom: solid 4px rgba(0, 0, 0, 0.182); padding-bottom:1vw; margin-bottom:1vw;">Server Statistics</h2>
              <table style="line-height:2vw; width:50vw; margin-left:8vw;">
                  <tr>
                      <td class="insert"><font style="margin-left:1vw;">Registered Accounts</font><font style="float:right; margin-right:1vw;">{{getSrvData("accounts")}}</font></td>
                  </tr>
                  <tr>
                      <td class="insert"><font style="margin-left:1vw;">Total Bans</font><font style="float:right; margin-right:1vw;">{{getSrvData("bans")}}</font></td>
                  </tr>
                  <tr>
                      <td class="insert"><font style="margin-left:1vw;">Total Vehicles</font><font style="float:right; margin-right:1vw;">{{getSrvData("vehicles")}}</font></td>
                  </tr>
                  <tr>
                      <td class="insert"><font style="margin-left:1vw;">Total Characters</font><font style="float:right; margin-right:1vw;">{{getSrvData("characters")}}</font></td>
                  </tr>
                  <tr>
                    <td class="insert"><font style="margin-left:1vw;">Total Dealerships</font><font style="float:right; margin-right:1vw;">{{getSrvData("dealers")}}</font></td>
                </tr>
                <tr>
                  <td class="insert"><font style="margin-left:1vw;">Total Deaths</font><font style="float:right; margin-right:1vw;">{{getSrvData("deaths")}}</font></td>
              </tr>
              </table>
          </div>
        </div>

        <div v-if="browsingType === 'staff'">
          <staffArea />
        </div>

        <div v-if="browsingType === 'punishments'">
          <punishmentsArea />
        </div>

        <div v-if="browsingType === 'chars'">
          <charactersArea/>
        </div>

        <div v-if="browsingType === 'stafftean'">
          <staffTeam />
        </div>

        <div v-if="browsingType === 'settings'">
          <settingsArea/>
        </div>

        <div v-if="browsingType === 'factions'">
          <factionsList />
        </div>

        <div style="background-color:rgba(0, 0, 0, 0.182); margin-right:88vw; height:100vw;">

          <div style="text-align:center;">
            <img src="http://www.nicepng.com/png/detail/128-1280406_view-user-icon-png-user-circle-icon-png.png" style="border-radius:50%; height:8vw; padding-left:2vw; padding-right:2vw; margin-top:.7vw;">
            <h1 style="margin-top:1vw; margin-bottom:1vw; font-size:20px; background-color:rgb(40,40,40); border-radius:10px; margin-left:10px; margin-right:10px;">{{playerData[0].username}}</h1>
            <h1 v-if="adminRanks[playerData[0].adminStatus] != 'None'" style="margin-top:1vw; margin-bottom:1vw; font-size:20px; background-color:rgb(40,40,40); border-radius:10px; margin-left:10px; margin-right:10px;   text-shadow: 2px 2px 8px #000000;" :style="getAdminColour">{{adminRanks[playerData[0].adminStatus]}}</h1>
          </div>

            <li @click="browsingType='home'" class="navTwo" :style="browsingType === 'home' ? 'border-left: solid 3px rgb(192,132,252); transition: all 0ms;' : ''"><a><i class="fa-solid fa-house"></i> Home</a></li>
            <li class="navTwo" @click="browsingType='chars'" :style="browsingType === 'chars' ? 'border-left: solid 3px rgb(192,132,252); transition: all 0ms;' : ''"><a><i class="fa-solid fa-users"></i> Characters</a></li>
            <li class="navTwo" @click="browsingType='factions'" :style="browsingType === 'factions' ? 'border-left: solid 3px rgb(192,132,252); transition: all 0ms;' : ''"><a><i class="fa-solid fa-layer-group"></i> Factions</a></li>
            <li v-if="data[0].adminStatus > 0" @click="browsingType='staff'" class="navTwo" style="border-right: solid 5px red;" :style="browsingType === 'staff' ? 'border-left: solid 3px rgb(192,132,252); transition: all 0ms;' : ''" ><a><i class="fa-solid fa-hammer" style="color:red;"></i> <font style="color:red;">Staff Tools</font></a></li>
            <li class="navTwo" @click="browsingType='punishments'" :style="browsingType === 'punishments' ? 'border-left: solid 3px rgb(192,132,252); transition: all 0ms;' : ''"><a><i class="fa-solid fa-file"></i> Punishments</a></li>
            <li class="navTwo" @click="browsingType='stafftean'" :style="browsingType === 'stafftean' ? 'border-left: solid 3px rgb(192,132,252); transition: all 0ms;' : ''"><a><i class="fa-solid fa-shield"></i> Staff Team</a></li>
            <li class="navTwo" @click="browsingType='settings'" :style="browsingType === 'settings' ? 'border-left: solid 3px rgb(192,132,252); transition: all 0ms;' : ''"><a><i class="fa-solid fa-gear"></i> Settings</a></li>
        </div>
    </div>

  </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex';
import staffArea from '../components/staffArea.vue';
import punishmentsArea from '../components/punishmentsArea.vue';
import charactersArea from '../components/charactersArea.vue';
import settingsArea from '../components/settingsArea.vue';
import navBar from '../components/navBar.vue';
import factionsList from './factionsList.vue';
import staffTeam from './staffTeam.vue';

export default {
    data() {
        return {
            data: "",
            browsingType: "home",
            adminColours: ['', '#ff00fa', '#9666ff', '#37db63', '#018a35', '#ff6363', '#ff0000', '#00bbff', '#FFD700'],
            adminRanks: ['None', 'Support', 'Senior Support', 'Moderator', 'Senior Moderator', 'Administrator', 'Senior Administrator', 'Head Administrator', 'Owner']
        }
    },
    created() {
        this.playerData.length == 0 ? this.$router.push('login') : this.data = (this.playerData);
    },
    components: {
      staffArea,
      punishmentsArea,
      charactersArea,
      settingsArea,
      navBar,
      factionsList,
      staffTeam
    },
    computed: {
        ...mapGetters({ playerData: 'getPlayerData' }),
        ...mapGetters({ token: 'getToken' }),
        ...mapGetters({ serverData: 'getServerData' }),
        getAdminColour() {
          if(this.playerData.length > 0) {
            return `background-color:`+this.adminColours[this.playerData[0].adminStatus]
          } else {
            return `grey`;
          }
        }
    },
    methods: {
        getVehicles() {
        },
        getSrvData(name) {
          if(this.serverData.length > 0) {
            setTimeout(() => {
            var idx = null;
            this.serverData.find(function(item, i) {
              if(item[name] == i) {
                idx = i;
              }
            })
            return idx != null ? idx : "Failed to fetch data";
            }, 1000);
          }
        },
        getPlayerData(name) {
          if(this.playerData.length > 0) {
            console(name)
            return;
          } else {
            this.$router.push('login');
          }
        },
        dayState() {
          var data = [
            [22, 'Good night'],
            [18, 'Good evening'],
            [12, 'Good afternoon'],
            [0,  'Good morning']
          ],
          hr = new Date().getHours();
          for (var i = 0; i < data.length; i++) {
            if (hr >= data[i][0]) {
              return data[i][1];
            }
          }
        },
    }
}
</script>

<style scoped>
* {
    overflow-y: hidden;
    overflow-x: hidden;
    overflow: hidden;
}
*::-webkit-scrollbar{
    display: none;
  }
  table {
    border-collapse: separate;
    border-spacing: 0 20px;
  }

  th, td {
    width: 150px;
    padding: 5px;
  }

  .navOne {
    list-style-type: none;
    margin: 0;
    padding: 0;
    height: 40vw;
    background-color: transparent;
  }

  .navTwo {
    color: #ffffff;
    text-decoration: none;
    font-size: 1vw;
    line-height: 3vw;
    list-style-type: none;
    border-right: solid rgba(255, 255, 255, 0.311) 5px;
    transition: 0.5s;
    padding-left:1vw;
  }

  .navTwo:hover {
    background-color: #555;
    color: white;
  }

</style>

