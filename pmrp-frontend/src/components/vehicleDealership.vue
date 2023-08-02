<template>
    <div>
        <div class="uiBase" style="margin-left:1vw; min-height:45vw; margin-top:4vw; border:none;overflow:scroll; height:1vw; overflow-x: hidden; background-color:transparent; background-image:none;">
            <h2 class="textHeader" style="background-color:rgba(1, 1, 1, .4);">Vehicle Dealership</h2>
            <div v-if="dealerVehs.length > 0">
                <div v-for="veh in dealerVehs" :key="veh.spawnName" style="margin-top:1vw;">
                    <table style="line-height:2vw; border:none; background-color:rgba(1, 1, 1, .7);">
                        <tr style="border:none;">
                            <th style="min-width:12vw; max-width:6vw; width:2vw; color:white;">{{veh.vehName}}<br><font size="2" color="#c2c0c0">Stock {{formatNum(veh.stock)}}</font></th>
                            <th style="color:#118C4F">${{formatNum(veh.price)}}</th>
                        </tr>
                        <tr>
                            <th><button @click="purchaseVehicle(veh.spawnName, veh.vehName, veh.price)" class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw;">Purchase</button></th>
                            <th><button @click="viewVehicle(veh.spawnName, veh.vehName)" class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw;">View</button></th>
                        </tr>
                    </table>
                </div>
            </div>
            <div v-else >
                <table style="line-height:2vw; border:none; background-color:transparent;">
                    <tr style="border:none;">
                        <th style="min-width:12vw; max-width:6vw; width:2vw; color:white;"><h2 style="text-align: center; font-size:1vw; color:rgba(255, 255, 255, 0.618);">This dealership is empty of vehicles.</h2></th>
                    </tr>
                </table>
            </div>
        </div>
        <div v-if="dealerVehs.length > 0" class="uiBase" style="margin-left:42vw; min-height:2vw; height:4vw; margin-top:1vw; position:absolute;">
            <p style="text-align:center; color:white; margin-top:0.4vw; font-weight:600;">Adjust Rotation ({{ rotation }}°)</p>
            <input type="range" min="0" max="360" value="0" class="sliderBase" v-model="rotation">
        </div>
        <div v-if="dealerVehs.length > 0" class="uiBase" style="margin-right:1vw; min-height:2vw; height:4vw; margin-top:-40vw; position:absolute;">
            <p style="text-align:center; color:white; margin-top:0.6vw; font-weight:600; font-size:25px;">{{currentVehicle}}</p>
        </div>
        <div v-if="dealerVehs.length > 0" class="uiBase" style="margin-right:1vw; min-height:21vw; height:4vw; margin-top:-34vw; position:absolute;">
            <p style="color:white; margin-left:1vw; margin-top:1vw; font-weight:600;">Engine</p>
            <div style="background-color:rgb(0, 0, 0); margin-left:1vw; margin-right:1vw; border-radius:10px;">
                <div style="padding:0.5vw; margin-top:0.4vw; border-radius:10px; max-width:100%;" :style="{ 'width': vPerformance[0].engine+'%', 'background-color': 'rgba(183, 119, 255, 0.69)' }"> <p style="text-align:center; color:white;">{{vPerformance[0].engine}}%</p></div>
            </div>
            <p style="color:white; margin-left:1vw; margin-top:1vw; font-weight:600;">Acceleration</p>
            <div style="background-color:rgb(0, 0, 0); margin-left:1vw; margin-right:1vw; border-radius:10px;">
                <div style="padding:0.5vw; margin-top:0.4vw; border-radius:10px; max-width:100%;" :style="{ 'width': vPerformance[0].acceleration+'%', 'background-color': 'rgba(183, 119, 255, 0.69)' }"> <p style="text-align:center; color:white;">{{vPerformance[0].acceleration}}%</p></div>
            </div>
            <p style="color:white; margin-left:1vw; margin-top:1vw; font-weight:600;">Brakes</p>
            <div style="background-color:rgb(0, 0, 0); margin-left:1vw; margin-right:1vw; border-radius:10px;">
                <div style="padding:0.5vw; margin-top:0.4vw; border-radius:10px; max-width:100%;" :style="{ 'width': vPerformance[0].brakes+'%', 'background-color': 'rgba(183, 119, 255, 0.69)' }"> <p style="text-align:center; color:white;">{{vPerformance[0].brakes}}%</p></div>
            </div>
            <p style="color:white; margin-left:1vw; margin-top:1vw; font-weight:600;">Top Speed</p>
            <div style="background-color:rgb(0, 0, 0); margin-left:1vw; margin-right:1vw; border-radius:10px;">
                <div style="padding:0.5vw; margin-top:0.4vw; border-radius:10px; max-width:100%;" :style="{ 'width': vPerformance[0].topSpeed+'%', 'background-color': 'rgba(183, 119, 255, 0.69)' }"> <p style="text-align:center; color:white;">{{vPerformance[0].topSpeed}}%</p></div>
            </div>
        </div>
        <div v-if="dealerVehs.length > 0" class="uiBase" style="margin-right:1vw; min-height:12vw; height:6vw; margin-top:-9vw; position:absolute;">
            <p class="textHeader" style="font-size:0.9vw; border-bottom:none; height:2vw; line-height:0.6vw;">Choose a colour</p>
            <div style="margin-left:1vw;">
                <button @click="colourSet(89, 89)" style="background-color:yellow; padding:1.5vw; margin-left:1vw; border-radius: 50%"></button>
                <button @click="colourSet(111, 111)" style="background-color:rgb(255, 255, 255); padding:1.5vw; margin-left:1vw; border-radius: 50%"></button>
                <button @click="colourSet(70, 70)" style="background-color:rgb(0, 136, 255); padding:1.5vw; margin-left:1vw; border-radius: 50%"></button>
                <button @click="colourSet(0, 0)" style="background-color:rgb(0, 0, 0); padding:1.5vw; margin-left:1vw; border-radius: 50%"></button>
                <button @click="colourSet(145, 145)" style="background-color:rgb(134, 78, 255); padding:1.5vw; margin-left:1vw; border-radius: 50%"></button>
            </div>
            <div style="margin-left:1vw; margin-top:1vw;" v-for="colour in selectColoursTwo" :key="colour">
                <button @click="colourSet(92, 92)" style="background-color:rgb(0, 255, 17); padding:1.5vw; margin-left:1vw; border-radius: 50%"></button>
                <button @click="colourSet(137, 137)" style="background-color:#ed73fd; padding:1.5vw; margin-left:1vw; border-radius: 50%"></button>
                <button @click="colourSet(6, 6)" style="background-color:rgb(121, 121, 121); padding:1.5vw; margin-left:1vw; border-radius: 50%"></button>
                <button @click="colourSet(44, 44)" style="background-color:rgb(255, 79, 79); padding:1.5vw; margin-left:1vw; border-radius: 50%"></button>
                <button @click="colourSet(38, 38)" style="background-color:rgb(255, 152, 78); padding:1.5vw; margin-left:1vw; border-radius: 50%"></button>
            </div>
        </div>

        <button @click="closeCam()" class="modButton" style="opacity: 0.7; margin-top:0.5vw; margin-left:1vw; width:23vw;"> Close Dealership</button>

    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    data() {
        return {
            selectColoursOne: ["yellow", "white", "blue", "black", "purple"],
            selectColoursTwo: ["green"],
            rotation: 0,
            vehicleColour: '',
            currentVehicle: '',
            width: '',
        }
    },
    created() {
        window.mp.trigger('setDealerView', this.dealerVehs[0].spawnName);
        window.mp.trigger('serverFunctionCEF', 'fetchPerformance', this.dealerVehs[0].spawnName);
        this.currentVehicle = this.dealerVehs[0].vehName;

    },
    components: {

    },
    computed: {
        ...mapGetters({ dealerVehs: 'getDealerVehs' }),
        ...mapGetters({ vPerformance: 'getVehPerformance' }),
    },
    watch: {
        rotation(newType) {
            if(window.mp) {
                window.mp.trigger('adjustDealerRot', newType);
            }
        },
    },
    methods: {
        closeCam() {
            if(window.mp) {
                window.mp.trigger('closeDealerCam');
            }
        },
        formatNum(price) {
            return price.toLocaleString('en-US');
        },
        startProg(name, status) {
            this.width = status;
            return name;
        },
        viewVehicle(name, spawnName) {
            this.currentVehicle = spawnName;
            if(window.mp) {
                window.mp.trigger('setDealerView', name);
                window.mp.trigger('serverFunctionCEF', 'fetchPerformance', name);
            }
        },
        purchaseVehicle(name, nameTwo, price) {
            if(window.mp) {
                window.mp.trigger('createModalMenu', 'fa-solid fa-car', 30, 'Vehicle Purchase', `Are you sure you want to purchase the vehicle ${nameTwo} for the price of $${price.toLocaleString('en-US')}?`, 'Deny Vehicle', 'Accept Vehicle', "dealerModal", 'dealerPurchaseVehicleClient', "", name);
            }
        },
        colourSet(c1, c2) {
            if(window.mp) {
                window.mp.trigger('vsetColour', parseInt(c1), parseInt(c2));
            }
        }
    }
}
</script>

<style scoped>
* {
    transition-duration: 500ms;
}

table {
    border:none;
    border-collapse: collapse;
    width: 100%;
    border-radius: 10px;
  }

  td, th {
    text-align: left;
    padding: 8px;
  }

  tr {
    background-color: #dddddd16;
}
</style>
