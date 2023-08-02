<template>
    <div v-if="state" style="position:absolute; height:0vw;">
      <div style="margin-top:40.9vw; margin-left:85vw; width:10vw;">
        <div style="text-align:center; margin-bottom:1vw;">
          <h1 style="color:white; font-size:20px;"><font size="20" style="font-weight:600;"><i>{{getSpeed()}}</i></font> <font style="color:grey; font-weight:600;">KM/H</font></h1>
        </div>
        <div v-if="speedoData[0].vehRpm > 0" style="background-color:rgba(0, 0, 0, 0.529); border-radius:10px;">
          <div style="border-radius:10px; margin-bottom:.9vw; height:.5vw; margin-top:1vw;" :style="rpmWidth"></div>
        </div>
        <div style="background-color:rgba(0, 0, 0, 0.529);  padding:.7vw; height:2.5vw; color:white; border-radius:10px; margin-top:.5vw;"><i class="fa-solid fa-gears"></i> <font style="float:right;">{{ speedoData[0].vehHealth }}%</font></div>
        <div style="background-color:rgba(0, 0, 0, 0.529);  padding:.7vw; height:2.5vw; color:white; border-radius:10px; margin-top:.5vw;"><i class="fa-solid fa-gas-pump"></i> <font style="float:right;">{{ speedoData[0].vehicleFuel }}%</font></div>
      </div>
    </div>
</template>

<script>
/* eslint-disable */
import { mapGetters, mapMutations } from "vuex";

export default {
  data: function() {
    return {
      rpmDegMin: -117,
      rpmDegMax: 117,
      maxRpm: 10000,
      text: '',
      canvas: ''
    };
  },
  computed: {
    ...mapGetters({
      state: "speedoState",
      speedoData: "speedoData"
    }),
    needleRot() {
      return {
        transform: `rotate(${this.calculateRpmAngle(
          this.speedoData[0].vehRpm
        )}deg)`
      };
    },
    rpmWidth() {
      if(this.speedoData.length == 0) return;
      return {
        width: `${this.speedoData[0].vehRpm * 100}%`,
        "background-color": `${this.speedoData[0].vehRpm*100 > 90 ? 'red' : 'rgba(220, 171, 255, 20)'}`
      }
    }
  },
  methods: {
    ...mapMutations({}),
    roundTo(value, round) {
      return round * Math.floor(value / 25);
    },
    getSpeed() {
      if(this.speedoData.length > 0 && this.speedoData[0].vehSpeed) {
        var speed = this.speedoData[0].vehSpeed;
        if(speed < 10) return "00"+speed;
        if(speed > 10 && speed < 100) return "0"+speed;
        else return speed;
      }
    },
  }
};
</script>

<style>
@font-face {
  font-family: DS-DIGI;
  src: url("./assets/DS-DIGI.TTF");
}

.tachCluster {
  font-family: DS-DIGI;
  padding-right: 2vw;
  font-size: 2vw;
  margin-left: 1.2vw;
  text-align: center;
}

.speedoBase {
  background: -webkit-linear-gradient(
    right,
    rgba(10, 10, 10, 1),
    rgba(0, 0, 0, 0.34)
  );
  font-family: DS-DIGI;
  font-size: 1.3vw;
  color: white;
  list-style-type: none;
  text-align: center;
  margin-top: 52vw;
  margin-left: 71vw;
  display: block;
  position: absolute;
  min-width: 25vw;
  max-width: 25vw;
  padding: 0.5vw;
}

.speedo {
  font-family: DS-DIGI;
  right: 22vw;
  position: absolute;
  transform: scale(0.11);
  display: block;
  margin-top: 42vw;
}

.speedo .board {
  position: absolute;
}

.speedo .needle {
  position: absolute;
  left: 975px;
  transform-origin: center 1234px;
  transition: 500ms linear all;
}

@keyframes fadeTacho {
  from {
    bottom: -20vw;
  }
  to {
    bottom: 16vw;
  }
}

td {overflow:hidden;}

</style>