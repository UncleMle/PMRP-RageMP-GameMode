<template>
  <div v-if="hudState && hudInfo.length > 0">
    <div style="width:14vw; margin-left:43.2vw; text-align:center; margin-top:.3vw; padding:1vw; position:absolute;">
      <div style="color:white; font-size:20px; background-color:rgba(0, 0, 0, 0.529); padding:.6vw; border-radius:10px;"><i class="fa-solid fa-user" style="color:rgba(220, 171, 255, 20);"></i> {{hudInfo[0].id}}<i class="fa-solid fa-compass" style="color:rgba(220, 171, 255, 20); margin-left:1vw;"></i> {{hudInfo[0].direction}}<i class="fa-solid fa-users" style="color:rgba(220, 171, 255, 20); margin-left:1vw;"></i> {{hudInfo[0].players}}</div>
    </div>
    <div class="vicinity" style="margin-top:-6.8vw; margin-left:-14.6vw; max-width: 33vw; min-width: 33vw;">
      <div v-if="hudInfo.length > 0" class='unix shadow-stroke'><font style="font-size:20px;"><i class="fa-solid fa-wallet" style="color:#118C4F;"></i>
        <font style="font-size:15px; margin-left:.3vw;"> ${{  hudInfo[0].money.toLocaleString('en-US') }}</font>
      </font></div>
    </div>
    <div v-if="protectedArea"  class="vicinity" style="margin-top:-6.8vw; margin-left:-6.7vw; max-width: 13vw; min-width: 13vw;">
      <div v-if="hudInfo.length > 0" class='unix shadow-stroke'><font style="font-size:20px;"><i class="fa-solid fa-lock" style="color:red;"></i>
        <font style="font-size:18px; margin-left:.3vw; color:red;"> Protected</font>
      </font></div>
    </div>
    <div class="vicinity" style="margin-top:-4.8vw; max-width: 7vw; min-width: 7vw;">
      <div v-if="hudInfo.length > 0" class='unix shadow-stroke'><font style="font-size:20px;"><i class="fa-solid fa-burger" style="color:#ffbe73;"></i>
        <font style="font-size:18px; margin-left:.3vw;"> {{  hungerThirst[0].hungerLvl+'%' }}</font>
      </font></div>
    </div>
    <div class="vicinity" style="margin-top:-2.8vw; max-width: 7vw; min-width: 7vw;">
      <div v-if="hudInfo.length > 0" class='unix shadow-stroke'><font style="font-size:20px;"><i class="fa-solid fa-bottle-water" style="color:#7ebfff;"></i>
        <font style="font-size:18px; margin-left:.3vw;">  {{ hungerThirst[0].thirstLvl+'%' }}</font>
      </font></div>
    </div>
    <div class="vicinity" style="margin-top:-0.8vw; max-width: 10vw; min-width: 10vw;">
      <div v-if="hudInfo.length > 0" class='unix shadow-stroke'><font style="font-size:20px;"><i class="fa-solid fa-clock" style="color:grey;"></i>
        <font style="font-size:18px; margin-left:.3vw;">  {{ hudInfo[0].unix }}</font>
      </font></div>
    </div>
    <div class="vicinity" style="margin-top:1.2vw; max-width: 44vw; min-width: 44vw;">
      <div v-if="hudInfo.length > 0" class='unix shadow-stroke'><font style="font-size:20px;"><i class="fa-solid fa-location-dot" style="color:red;"></i>
        <font style="font-size:18px; margin-left:.3vw;">  {{ hudInfo[0].location }} / <font style="color:rgb(167, 167, 167); font-size:15px;">{{hudInfo[0].locationTwo}}</font></font>
      </font></div>
    </div>
    <div class="vicinity" style="margin-top:3.2vw; max-width: 10vw; min-width: 10vw;">
      <div v-if="hudInfo.length > 0" class='unix shadow-stroke'><font style="font-size:20px;">
        <font style="font-size:18px;"> <i class="fa fa-microphone" :style="voipTalking"></i> <i class="fa-solid fa-walkie-talkie" :style="radioTalking"></i></font>
      </font></div>
    </div>
  </div>
</template>


<script>
import { mapGetters, mapMutations } from "vuex";

export default {
  computed: {
    ...mapGetters({
      hudState: "getHudState",
      hudInfo: "hudInfo",
      protectedArea: "getProtectedHud",
      hungerThirst: 'hungerThirstData'
    }),
    hungerAmount() {
      return {
        width: `${this.hungerThirst[0].hungerLvl}%`
      }
    },
    thirstAmount() {
      return {
        width: `${this.hungerThirst[0].thirstLvl}%`
      }
    },
    voipTalking() {
      return {
        color: `${this.hudInfo[0].voice ? 'white' : '#72ff47'}`
      }
    },
    radioTalking() {
      return {
        color: `${this.hudInfo[0].radio ? '#ff584d' : 'white'}`
      }
    },
    ...mapMutations({}),
  },
  methods: {
    formatNum(num) {
      return num.toLocaleString("en-US");
    },
    getTime() {
      const date = new Date()
      return `${date.getHours() < 10 ? `0${date.getHours()}` : `${date.getHours()}`}:${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}`
    },
    getNotifs() {
      return global.gui.notify.getAll();
    }
  }
};
</script>


<style>
.vicinity {
  position: absolute;
  top: 50.2vw;
  left: 15.9vw;
  color: rgb(255, 255, 255);
  font-size: 0.75vw;
  font-weight: 650;
  padding: 0.3vw;
  padding-right:1.3vw;
  text-overflow:ellipsis;
  overflow:hidden;
  min-width: 14vw;
  max-width: 25vw;
  max-height: 5.6vw;
  border-radius: 10px;
}
.shadow-stroke {
  text-shadow: -1px -1px 0 rgba(0, 0, 0, 0.208), 0 -1px 0 rgba(0, 0, 0, 0.208),
    1px -1px 0 rgba(0, 0, 0, 0.208), 1px 0 0 rgba(0, 0, 0, 0.208),
    1px 1px 0 rgba(0, 0, 0, 0.208), 0 1px 0 rgba(0, 0, 0, 0.208),
    -1px 1px 0 rgba(0, 0, 0, 0.208), -1px 0 0 rgba(0, 0, 0, 0.208),
    2px 3px 2px rgba(0, 0, 0, 0.75);
}
* {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
body {
  user-select: none;
}
.pmrp {
  color: rgb(255, 255, 255) !important;
  background: -webkit-linear-gradient(right, #030303b0, #00000067);
  border-radius: 0px 0px 5px 5px;
  border-top: solid rgba(220, 171, 255, 20) 6px;
  box-shadow: 0 5px 30px 0px rgba(2, 0, 0, 1);

  --notchSize: 15px;

  clip-path: polygon(
    0% var(--notchSize),
    var(--notchSize) 0%,
    calc(100% - var(--notchSize)) 0%,
    100% var(--notchSize),
    100% calc(100% - var(--notchSize)),
    calc(100% - var(--notchSize)) 100%,
    var(--notchSize) 100%,
    0% calc(100% - var(--notchSize))
  );
}

#heal
{
  position:absolute;
  left: -10.19%;
  top:96.21%;
  margin: 1.12%;
  margin-left: 11.7%;
  width: 7.1%;
  height: 1.5%;
  text-align: center;
  border-style: solid;
  border-right: none;
  border-top: solid rgba(0, 0, 0, 0.525) 4px;
  border-bottom: solid rgba(0, 0, 0, 0.525) 4px;
  border-right: solid rgba(0, 0, 0, 0.525) 4px;
  border-left: none;
  float:left;
  background-color:#69b7ff68;
}
#armor
{
  position:absolute;
  left: -3.1%;
  top:96.21%;
  margin: 1.12%;
  margin-left: 11.71%;
  width: 6.982%;
  height: 1.5%;
  padding: 0px;
  text-align: center;
  border-style: solid;
  border-right: none;
  border-top: solid rgba(0, 0, 0, 0.525) 4px;
  border-bottom: solid rgba(0, 0, 0, 0.525) 4px;
  border-left: none;
  background: rgba(255, 221, 109, 0.548)

}

#boxArmor
{
  background: #095a00;
  width: 20%;
  height: 100%;
}
#boxArmor
{
  background: #e5ff5191;
}

#box
{
  background: #095a00;
  width: 20%;
  height: 100%;
}
#box
{
  background: #5473ff80;
}

body
{
      overflow:hidden;
}
</style>