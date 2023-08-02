<template>
    <div style="position:absolute;overflow-x: hidden;overflow-y: hidden; overflow:hidden;">
        <div class="modalBase" v-if="modalData.length > 0" :style="fader">
            <menu-button v-if="!modalData[0].buttonText" style="position:absolute; margin-left: 21.6vw;"/>
            <div class="modalHeader" style="font-size: 1.3vw; padding-left: 1vw;"><i :class="modalData[0].icon"></i> {{modalData[0].name}}</div>
            <div class="modalCenterText" v-html="modalData[0].text"></div>
        </div>
        <div v-if="modalData.length > 0 && modalData[0].buttonText">
            <button class="modalBtn two" style="margin-left: 40.3vw; margin-top: 0.35vw; position:absolute;" @click="buttonOneClick">{{modalData[0].buttonText}}</button>
            <button class="modalBtn one" style="margin-left: 52.4vw; margin-top: 0.35vw" @click="buttonTwoClick">{{modalData[0].buttonTwoText}}</button>
        </div>
</div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import menuButton from "../menuButton.vue";

export default {
  components: {menuButton},
  data() {
    return {
      hudStatus: 1
    };
  },
  computed: {
    ...mapGetters({
      modalData: "getModalData"
    }),
    ...mapMutations({}),
    fader() {
      return {
        "-webkit-animation": `-webkit-animation: fadeinto 0.8s;`
      };
    }
  },
  methods: {
    buttonOneClick() {
      if (window.mp) {
        console.log(this.modalData[0].buttonOne, this.modalData[0].buttonOneArg);
        window.mp.trigger(this.modalData[0].buttonOne, this.modalData[0].buttonOneArg);
        this.modalData[0].name == 'Vehicle Purchase' ? '_' : window.mp.trigger("closeRoute");
      }
    },
    buttonTwoClick() {
      if (window.mp) {
        console.log(this.modalData[0].buttonTwo, this.modalData[0].buttonTwoArg);
        window.mp.trigger(this.modalData[0].buttonTwo, this.modalData[0].buttonTwoArg);
        this.modalData[0].name == 'Vehicle Purchase' ? '_' : window.mp.trigger("closeRoute");
      }
    }
  }
};
</script>


<style scoped>

* {
  overflow-x: hidden;
  overflow-y: hidden;
  overflow:hidden;
}

.modalBase {
  opacity: 0.8;
  width: 23vw;
  border-top: solid rgba(220, 171, 255, 20) 6px;
  height: 10vw;
  border-radius: 15px;
  /*background-color: rgba(0, 0, 0, 0.85);*/
  background: -webkit-linear-gradient(
    right,
    rgba(10, 10, 10, 0.944),
    rgba(1, 1, 1, 0.651)
  );
  margin-top: 15vw;
  margin-left: 40vw;

  --notchSize: 20px;

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
  border-top: solid rgb(183, 119, 255) 5px;
  border-bottom: solid rgba(255, 255, 255, 0.311) 2px;
  -webkit-animation: fadeinto 1s;

  background-color: #000000ec;
  background-image: url("../auth/assets/image/diagmonds.png");
  overflow-x: hidden;
overflow-y: hidden;
overflow:hidden;
}

.modalCenterText {
  color: #fff;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 550;
  font-size: 20px;
  text-align: center;
  margin-top: 0.5vw;
  overflow:hidden;
}

.modalHeader {
  color: #fff;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 1000;
  font-size: 12px;
  background: -webkit-linear-gradient(
    left,
    rgba(10, 10, 10, 0.115),
    rgba(1, 1, 1, 0.651)
  );
  padding: 0.1vw;
  text-align: left;
  border-bottom: solid rgb(183, 119, 255) 3px;
  box-shadow: 0 0 30px rgba(183, 119, 255, 0.69);
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  line-height: 2.2vw;
  color: #ffffff;
  transition: all 0.4s;
  -webkit-transition: all 0.4s;
  -o-transition: all 0.4s;
  -moz-transition: all 0.4s;
  font-weight: 700;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
    1px 1px 0 #000;
    overflow:hidden;
}

.modalBtn {
  opacity: 0.8;
  background: rgba(1, 1, 1, 0.651);
  border-top: solid rgba(220, 171, 255, 20) 6px;
  color: #fffffffb;
  transition-duration: 0.4s;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 650;
  margin-top: auto;
  font-size: 17px;
  padding: 10px;
  width: 10vw;
  --notchSize: 10px;

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
  transition: 0.5s;
  position: relative;
  overflow:hidden;
  background-color: #000000ec;
  background-image: url("../auth/assets/image/diagmonds.png");
}

.modalBtn:hover {
  background-image: url("../auth/assets/image/diagmonds.png");
  background: rgba(1, 1, 1, 0.551);
  overflow:hidden;
}

.one {
  border-top: solid #6eff7f 3px;
  border-bottom: solid rgba(255, 255, 255, 0.311) 2px;
  overflow:hidden;
}
.two {
  border-top: solid #ff6e6e 3px;
  border-bottom: solid rgba(255, 255, 255, 0.311) 2px;
  overflow:hidden;
}

@keyframes fadeinto {
  from {
    margin-top: 2vw;
    overflow:hidden;
  }
  to {
    margin-bottom: 0vw;
    overflow:hidden;
  }
}
</style>