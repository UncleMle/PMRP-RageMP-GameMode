<template>
    <div v-if="hudState">
      <div id="heal" v-if="hungerThirst.length > 0"><div :style="hungerAmount" id="box"></div></div>
      <div id="armor" v-if="hungerThirst.length > 0"><div :style="thirstAmount" id="boxArmor"></div></div>
      <div class="vicinity">
        <div v-if="protectedArea">
          <div v-if="hudInfo.length > 0" class='unix shadow-stroke'><b style="font-size: 1.5vw"><b style="color:#ff0000"><i class="fa-solid fa-compass" style="font-size: 1.3vw;"></i> {{ hudInfo[0].direction }} </b></b></div>
          <div class='voip shadow-stroke' style="color:red"> Protected Area </div>
        </div>
        <div v-else>
          <div v-if="hudInfo.length > 0" class='unix shadow-stroke'><b style="font-size: 1.5vw"><b style="color:#C4C4C4"><i class="fa-solid fa-compass" style="font-size: 1.3vw;"></i></b> {{ hudInfo[0].direction }}</b></div>
          <div v-if="hudInfo.length > 0" class='voip shadow-stroke' style="color:rgb(255, 255, 255)">FPS {{ hudInfo[0].fps  }} </div>
        </div>
        <div v-if="hudInfo.length > 0" class='unix shadow-stroke'>{{  hudInfo[0].id }} | {{ hudInfo[0].unix }}</div>
        <div v-if="hudInfo.length > 0" class='unix shadow-stroke'><i class="fa-solid fa-location-dot" style="color:#C4C4C4"></i> {{  hudInfo[0].location }}</div>
        <div v-if="hudInfo.length > 0" class='voip shadow-stroke'><b><i class="fa fa-microphone" :style="voipTalking"></i> <i class="fa-solid fa-walkie-talkie" :style="radioTalking"></i></b> - Normal</div>
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
    }
  };
  </script>


  <style>
  .vicinity {
    position: absolute;
    top: 49vw;
    left: 16vw;
    color: rgb(255, 255, 255);
    font-size: 0.75vw;
    font-weight: 650;
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
    background-color:#ffaf6968;
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
    background: rgba(109, 158, 255, 0.548)

  }

  #boxArmor
  {
    background: #095a00;
    width: 20%;
    height: 100%;
  }
  #boxArmor
  {
    background: #51a8ff;
  }

  #box
  {
    background: #095a00;
    width: 20%;
    height: 100%;
  }
  #box
  {
    background: #ffaf54;
  }

  body
  {
        overflow:hidden;
  }
  </style>