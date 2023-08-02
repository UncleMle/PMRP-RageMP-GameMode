<template>
  <div id="app">
    <loading-screen ref="loading" />
    <fuel-screen ref="fuelScreens" />
    <progress-bar ref="progressbar"/>
    <chat-box ref="chatsystem" style="position:absolute;" />
    <client-hud />
    <phoneSystem ref="phone"/>
    <vehicle-speedometer />
    <router-view ref="routers">
    </router-view>
    <altMenu ref="altmenu"/>
    <Notifications ref="notification"/>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

import altMenu from "./components/hud/altMenu.vue";
import phoneSystem from "./components/hud/phoneSystem.vue";
import Notifications from './components/Notifications.vue';
import vehicleSpeedometer from './components/hud/vehicleSpeedometer.vue';
import clientHud from './components/hud/clientHud.vue';
import chatBox from './components/hud/chatBox.vue';
import loadingScreen from "./components/hud/loadingScreen.vue";
import progressBar from "./components/hud/progressBar.vue";
import fuelScreen from "./components/hud/fuelScreen.vue";

export default {
  name: 'App',
  components: {
    Notifications,
    vehicleSpeedometer,
    loadingScreen,
    clientHud,
    chatBox,
    progressBar,
    fuelScreen,
    phoneSystem,
    altMenu
},
  computed: {
    ...mapGetters({
      hudState: "getHudState"
    }),
    ...mapGetters({
      listActive: "menuName"
    }),
    ...mapMutations({})
  },
  mounted () {
    global.gui.notify = this.$refs.notification;
    global.gui.chat = this.$refs.chatsystem;
    global.gui.fuelscreen = this.$refs.fuelScreens;
    global.gui.loading = this.$refs.loading;
    global.gui.progressbar = this.$refs.progressbar;
    global.gui.phone = this.$refs.phone;
  }
}

</script>

<style scoped>
.pmrp {
  color: rgb(255, 255, 255) !important;
  background: -webkit-linear-gradient(right, #030303b0, #00000067);
  border-radius: 0px 0px 5px 5px;
  border-top: solid rgba(220, 171, 255, 20) 6px;
  box-shadow: 0 5px 30px 0px rgba(2, 0, 0, 1);

  --notchSize: 15px;

  clip-path:
  polygon(
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

.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(10020px);
  opacity: 0;
}
</style>
