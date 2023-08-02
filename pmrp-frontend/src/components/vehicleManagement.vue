<template>
    <div>
        <div class="uiBase" style="position:absolute; margin-left:1vw; margin-top:16vw; background-color:transparent; background-image: url('...');" :style="{ 'width': browsingType === 'home' ? 17+'vw' : 25+'vw', 'height': baseMenuHeight}">
            <menuButton style="position:absolute;" :style="{'margin-left': browsingType === 'home' ? 15.7+'vw' : 23.6+'vw'}"/>
            <h2 class="textHeader" style="background-color: #000000b1; background-image: url('../assets/img/diagmonds.png');"><i class="fa-solid fa-car"></i> {{ browsingType === 'home' ? 'Management' : browsingType }}<p>For your vehicle {{formatName(JSON.parse(vehicleData[0].vehicleData).modelName)}} [{{JSON.parse(vehicleData[0].vehicleData).plate}}]</p></h2>
            <div v-if="browsingType === 'home'">
                <ul class="navOne" style="width:17vw;">
                    <li class="navTwo" style="text-align:center; background-color:rgba(0, 0, 0, 0.628); padding:0.3vw;"><a @click="browsingType='Vehicle Keys'"><i class="fa-solid fa-key"></i> Vehicle Keys</a></li>
                    <li class="navTwo" style="text-align:center; margin-top:0.5vw; background-color:rgba(0, 0, 0, 0.628); padding:0.3vw;"><a @click="browsingType='Vehicle Location'"><i class="fa-sharp fa-solid fa-location-dot"></i> Vehicle Location</a></li>
                    <li class="navTwo" style="text-align:center; margin-top:0.5vw; background-color:rgba(0, 0, 0, 0.628); padding:0.3vw;"><a @click="browsingType='Vehicle Stats'"><i class="fa-solid fa-list"></i> Vehicle Stats</a></li>
                    <li class="navTwo" style="text-align:center; margin-top:0.5vw; background-color:rgba(0, 0, 0, 0.628); padding:0.3vw;"><a @click="browsingType='Sell Vehicle'"><i class="fa-solid fa-dollar-sign"></i> Sell Vehicle</a></li>
                    <button @click="listReturn()" class="modButton" style="opacity:0.8; margin-top:0.5vw; width:17vw;">Back to list</button>
                </ul>
            </div>
            <div v-if="browsingType === 'Vehicle Keys'">
                <div style="background-color:rgba(0, 0, 0, 0.428); padding:0.3vw; border-radius:10px">
                    <div v-if="!keyAdd" style="overflow:scroll; height:12vw; overflow-x: hidden; margin-top:0vw">
                        <b v-for="key in keyHolders" :key="key.id">
                            <div class="insert">
                              <button class="subIndex" style="float: left; width:3.5vw;">#{{key.id}}</button><b>{{key.nickName}}</b><button @click="deleteKey(key.id)" class="modButton delete" style="float: right; line-height:1.5vw; height:3vw; width:5vw; border-top: solid 4px red;"><i class="fa-solid fa-trash" style="color:red;"></i></button>
                          </div>
                        </b>
                        <b v-if="!keyHolders || keyHolders.length == 0">
                            <div style="text-align:center">
                                <p style="color:white; padding:1vw; font-size:15px; font-weight:100;">You have not given this vehicle's keys to anyone yet.</p>
                            </div>
                        </b>
                    </div>
                    <div v-if="keyAdd">
                        <div style="text-align:center;">
                            <p style="color:white">Giving a player your vehicle's keys allows them to unlock the vehicle. You can remove their access at any time via vehicle keys sub menu.</p>
                        </div>
                        <div style="border-bottom: solid rgba(255, 255, 255, 0.311) 2px;">
                            <input class="input100" maxlength="15" placeholder="Player ID" style="border-bottom: solid rgba(255, 255, 255, 0.311) 1px;" v-model="keyUserId">
                        </div>
                        <div style="border-bottom: solid rgba(255, 255, 255, 0.311) 2px;">
                            <input class="input100" maxlength="30" placeholder="Nickname" style="border-bottom: solid rgba(255, 255, 255, 0.311) 1px;" v-model="keyNickName">
                        </div>
                    </div>
                    <div v-if="!keyAdd" style="text-align:center; margin-top:0.5vw;">
                        <button @click="keyAdd = true" class="modButton" style="border-top:none;">Give keys to player</button>
                        <button @click="browsingType = 'home'" class="modButton" style="margin-left:1vw; border-top:none;">Go Back</button>
                    </div>
                    <div v-else style="text-align:center; margin-top:0.5vw;">
                        <button @click="addUserKey(keyUserId, keyNickName)" class="modButton" style="border-top:none;">Confirm Selection</button>
                        <button @click="keyAdd = false" class="modButton" style="margin-left:1vw; border-top:none;">Go Back</button>
                    </div>
                </div>
            </div>
            <div v-if="browsingType === 'Vehicle Location'">
                <div style="background-color:rgba(0, 0, 0, 0.428); padding:0.3vw; border-radius:10px">
                    <div v-if="JSON.parse(vehicleData[0].vehicleData).spawned == 1" style="text-align:center; margin-top:0.5vw;">
                        <p style="color:white; padding:1vw; font-size:15px; ">Your vehicle was found in the world you can reveal its location by pinging it below.</p>
                        <button @click="pingVehicleLocation()" class="modButton" style="border-top:none;">Ping Location</button>
                        <button @click="browsingType = 'home'" class="modButton" style="margin-left:1vw; border-top:none;">Go Back</button>
                    </div>
                    <div v-else style="text-align:center;">
                        <p style="color:white; padding:1vw; font-size:15px; ">Your vehicle could not be found check parking or the insurance.</p>
                        <button @click="browsingType = 'home'" class="modButton" style="border-top:none;">Go Back</button>
                    </div>
                </div>
            </div>
            <div v-if="browsingType === 'Vehicle Stats'">
                <div style="background-color:rgba(0, 0, 0, 0.428); padding:0.3vw; border-radius:10px;">
                    <div v-if="!showPerformance">
                    <div class="insert">
                        <b><font style="float:left; margin-left:1vw;">Fuel Level</font> <font style="float:right; margin-right:1vw;">{{Math.trunc(JSON.parse(vehicleData[0].vehicleData).fuelLevel)}}%</font></b>
                    </div>
                    <div class="insert">
                        <b><font style="float:left; margin-left:1vw;">Distance Travelled</font> <font style="float:right; margin-right:1vw;">{{Math.floor(JSON.parse(vehicleData[0].vehicleData).distance)}}KM</font></b>
                    </div>
                    <div class="insert">
                        <b><font style="float:left; margin-left:1vw;">Last Active</font> <font style="float:right; margin-right:1vw;">{{timeFormat(JSON.parse(vehicleData[0].vehicleData).lastActive)}}</font></b>
                    </div>
                    <div class="insert">
                        <b><font style="float:left; margin-left:1vw;">Creation Date</font> <font style="float:right; margin-right:1vw;">{{timeFormat(JSON.parse(vehicleData[0].vehicleData).createdAt)}}</font></b>
                    </div>
                    </div>

                    <div v-if="showPerformance && vPerformance.length > 0">
                        <p style="color:white; margin-left:1vw; margin-top:0vw; font-weight:600;">Engine</p>
                        <div style="background-color:rgb(0, 0, 0); margin-left:1vw; margin-right:1vw; border-radius:10px;">
                            <div style="padding:0.5vw; margin-top:0.4vw; border-radius:10px; max-width:100%;" :style="{ 'width': vPerformance[0].engine+'%', 'background-color': 'rgba(183, 119, 255, 0.69)' }"> <p style="text-align:center; color:white;">{{vPerformance[0].engine}}%</p></div>
                        </div>
                        <p style="color:white; margin-left:1vw; margin-top:0.6vw; font-weight:600;">Acceleration</p>
                        <div style="background-color:rgb(0, 0, 0); margin-left:1vw; margin-right:1vw; border-radius:10px;">
                            <div style="padding:0.5vw; margin-top:0.4vw; border-radius:10px; max-width:100%;" :style="{ 'width': vPerformance[0].acceleration+'%', 'background-color': 'rgba(183, 119, 255, 0.69)' }"> <p style="text-align:center; color:white;">{{vPerformance[0].acceleration}}%</p></div>
                        </div>
                        <p style="color:white; margin-left:1vw; margin-top:0.6vw; font-weight:600;">Brakes</p>
                        <div style="background-color:rgb(0, 0, 0); margin-left:1vw; margin-right:1vw; border-radius:10px;">
                            <div style="padding:0.5vw; margin-top:0.4vw; border-radius:10px; max-width:100%;" :style="{ 'width': vPerformance[0].brakes+'%', 'background-color': 'rgba(183, 119, 255, 0.69)' }"> <p style="text-align:center; color:white;">{{vPerformance[0].brakes}}%</p></div>
                        </div>
                        <p style="color:white; margin-left:1vw; margin-top:0.6vw; font-weight:600;">Top Speed</p>
                        <div style="background-color:rgb(0, 0, 0); margin-left:1vw; margin-right:1vw; border-radius:10px;">
                            <div style="padding:0.5vw; margin-top:0.4vw; border-radius:10px; max-width:100%;" :style="{ 'width': vPerformance[0].topSpeed+'%', 'background-color': 'rgba(183, 119, 255, 0.69)' }"> <p style="text-align:center; color:white;">{{vPerformance[0].topSpeed}}%</p></div>
                        </div>
                    </div>

                    <div v-else-if="showPerformance && vPerformance.length == 0">
                        <p style="color:white;">This vehicle's performance stats were not found in the database.</p>
                    </div>

                    <div style="text-align:center; margin-top:0.8vw;">
                        <button @click="showPerformance ? showPerformance = false : browsingType = 'home'" class="modButton" style="border-top:none; margin-right:1vw;">Go Back</button>
                        <button v-if="!showPerformance" @click="loadPerformanceData(), showPerformance = true" class="modButton" style="border-top:none;">More Stats</button>
                    </div>
                </div>
            </div>
            <div v-if="browsingType === 'Sell Vehicle'">
                <div style="background-color:rgba(0, 0, 0, 0.428); padding:0.3vw; border-radius:10px">
                    <div style="text-align:center">
                        <p style="color:white">To sell this vehicle both you and the person you are selling it to must both be inside of it.</p>
                    </div>
                    <div style="border-bottom: solid rgba(255, 255, 255, 0.311) 2px;">
                        <input class="input100" maxlength="15" placeholder="Player ID" v-model="keyUserId">
                    </div>
                    <div style="border-bottom: solid rgba(255, 255, 255, 0.311) 2px;">
                        <input class="input100" maxlength="15" placeholder="Enter a price" v-model="vehicleSellPrice">
                    </div>
                    <div style="text-align:center; margin-top:1vw;">
                        <button @click="browsingType = 'home'" class="modButton" style="border-top:none; margin-right:1vw;">Go Back</button>
                        <button @click="sellVehicle(keyUserId)" class="modButton" style="border-top:none; margin-right:1vw;">Sell Vehicle</button>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
import menuButton from './menuButton.vue';
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            browsingType: 'home',
            keyAdd: false,
            showPerformance: false,
            keyUserId: '',
            keyNickName: '',
            vehicleSellPrice: ""
        }
    },
    components: {
        menuButton
    },
    computed: {
        ...mapGetters({ vehicleData: 'vehManageData' }),
        ...mapGetters({ keyHolders: 'keysGetter' }),
        ...mapGetters({ vPerformance: 'getVehPerformance' }),
        baseMenuHeight() {
            switch(this.browsingType) {
                case 'home':
                {
                    return 19+'vw';
                }
                case 'Vehicle Stats':
                {
                    return 30+'vw';
                }
                default:
                    return 22+'vw';
            }
        }
    },
    methods: {
       addUserKey(userId, userNick) {
        function containsNumbers(str) {
            return /\d/.test(str);
        }
        if (userId.length == 0 || userId == -1 || userNick.length == 0 || userId.match(/\W/) || userNick.length > 15 || containsNumbers(userNick) || !containsNumbers(userId)) {
            global.gui.notify.clearAll();
            global.gui.notify.showNotification(
                "Ensure that the confirmed selection credentials are valid.",
                false,
                true,
                6000,
                "fa-solid fa-triangle-exclamation"
            );
            return;
        } else {
            if(window.mp && this.vehicleData.length > 0) {
                var keyObj = {
                    playerId: userId,
                    playerNick: userNick,
                    vehicleId: JSON.parse(this.vehicleData[0].vehicleData).sqlID
                }
                window.mp.trigger('compressDataToServer', 'vehicleAddKey', JSON.stringify(keyObj));
            }
        }
       },
       timeFormat(time) {
        var newStr = [];
        for(var x = 0; x < time.length; x++) {
            if( !(time[x] == 'Z' || time[x] == 'T') ) {
                newStr.push(time[x]);
            }
        }
        newStr.length = 10;
        return newStr.join("");
       },
       listReturn() {
        if(window.mp) {
            window.mp.trigger('serverFunctionCEF', 'requestList', "");
        }
       },
       pingVehicleLocation() {
        if(window.mp) {
            window.mp.trigger('blipLocationcreate', JSON.parse(this.vehicleData[0].vehicleData).location.x, JSON.parse(this.vehicleData[0].vehicleData).location.y, JSON.parse(this.vehicleData[0].vehicleData).location.z, `Your personal vehicle [${JSON.parse(this.vehicleData[0].vehicleData).plate}]`)
        }
       },
       deleteKey(id) {
        var idx = null;
        this.keyHolders.find(function(item, i) {
            console.log(`${item.id}`);
            if(item.id == id) {
                idx = i;
            }
        })
        if(idx != null) {
            this.keyHolders.splice(idx, 1);
            if(window.mp) {
                window.mp.trigger('serverFunctionCEF', 'keyDataUpdate', id);
            }
        }
       },
       loadPerformanceData() {
        if(window.mp && this.vehicleData.length > 0) {
            window.mp.trigger('serverFunctionCEF', 'getVehPerformance', JSON.parse(this.vehicleData[0].vehicleData).model);
        }
       },
       formatName(name) {
        var newArr = name.split(" ");
        return newArr[0];
       },
       sellVehicle(userId) {
        function containsNumbers(str) {
            return /\d/.test(str);
        }
        if (userId.length == 0 || userId == -1 || userId.match(/\W/) || !containsNumbers(userId) || !containsNumbers(this.vehicleSellPrice) || this.vehicleSellPrice.match(/\W/)) {
            global.gui.notify.clearAll();
            global.gui.notify.showNotification(
                "Ensure that the confirmed selection credentials are valid.",
                false,
                true,
                6000,
                "fa-solid fa-triangle-exclamation"
            );
            return;
        } else {
            if(window.mp && this.vehicleData.length > 0) {
                var sellObj = {
                    playerId: userId,
                    vehicleId: JSON.parse(this.vehicleData[0].vehicleData).sqlID,
                    sellPrice: this.vehicleSellPrice
                }
                window.mp.trigger('compressDataToServer', 'sellVehicle', JSON.stringify(sellObj));
            }
        }
       },
    }

}
</script>

<style scoped>

.navTwo:hover {
    color: rgb(141, 255, 141);
}

.modButton:hover {
    border-top: solid 6px rgb(141, 255, 141);
}

td {
    text-align: center;
}

.delete:hover {
    background-color: rgba(255, 0, 0, 0.278);
}
</style>