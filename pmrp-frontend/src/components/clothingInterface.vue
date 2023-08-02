<template>
<div class="limiter" style="user-select:none;">
    <div class="container-clothingStores">
      <div class="clothingBase">
        <div v-if="browsingType==='Tops'" class="clothingSliders">
                <div class="slidecontainer">
                    <div class="textSub">Type {{ type }}</div>
                    <input type="range" min="0" max="392" value="0" class="slider" id="myRange" v-model="type">
                    <div class="textSub">Top Texture  {{ texture }}</div>
                    <input type="range" min="0" max="10" value="0" class="slider" id="myRange" v-model="texture">
                    <div class="textSub">Rotate {{ rotation }}°</div>
                    <input type="range" min="0" max="360" value="0" class="slider" id="myRange" v-model="rotation">
                  </div>
            </div>
            <div v-if="browsingType==='Undershirts'" class="clothingSliders">
                <div class="slidecontainer">
                    <div class="textSub">Undershirt {{ type }}</div>
                    <input type="range" min="0" max="392" value="0" class="slider" id="myRange" v-model="type">
                    <div class="textSub">Undershirt Texture  {{ texture }}</div>
                    <input type="range" min="0" max="10" value="0" class="slider" id="myRange" v-model="texture">
                    <div class="textSub">Rotate {{ rotation }}°</div>
                    <input type="range" min="0" max="360" value="0" class="slider" id="myRange" v-model="rotation">
                  </div>
            </div>
            <div v-if="browsingType==='Bottoms'" class="clothingSliders">
                <div class="slidecontainer">
                    <div class="textSub">Bottom {{ type }}</div>
                    <input type="range" min="0" max="143" value="0" class="slider" id="myRange" v-model="type">
                    <div class="textSub">Bottom Texture  {{ texture }}</div>
                    <input type="range" min="0" max="10" value="0" class="slider" id="myRange" v-model="texture">
                    <div class="textSub">Rotate {{ rotation }}°</div>
                    <input type="range" min="0" max="360" value="0" class="slider" id="myRange" v-model="rotation">
                  </div>
            </div>
            <div v-if="browsingType==='Shoes'" class="clothingSliders">
                <div class="slidecontainer">
                    <div class="textSub">Shoes {{ type }}</div>
                    <input type="range" min="0" max="101" value="0" class="slider" id="myRange" v-model="type">
                    <div class="textSub">Shoes Texture  {{ texture }}</div>
                    <input type="range" min="0" max="10" value="0" class="slider" id="myRange" v-model="texture">
                    <div class="textSub">Rotate {{ rotation }}°</div>
                    <input type="range" min="0" max="360" value="0" class="slider" id="myRange" v-model="rotation">
                  </div>
            </div>
            <div v-if="browsingType==='Torsos'" class="clothingSliders">
                <div class="slidecontainer">
                    <div class="textSub">Torso Type {{ type }}</div>
                    <input type="range" min="0" max="196" value="0" class="slider" id="myRange" v-model="type">
                    <div class="textSub">Rotate {{ rotation }}°</div>
                    <input type="range" min="0" max="360" value="0" class="slider" id="myRange" v-model="rotation">
                    </div>
            </div>
            <div class="clothingList">
                <img :src="require('../assets/img/clothingStores.png')" width="150" style="margin-top: 1vw;" />
                <div class="textBase"><b>Clothing Shop</b></div>
                <ul class="navOne">
                    <li class="navTwo"><a @click="browsingType='Tops', componentId=11, resetPlayerClothes()">Tops</a></li>
                    <li class="navTwo"><a @click="browsingType='Undershirts', componentId=8, resetPlayerClothes()">Undershirts</a></li>
                    <li class="navTwo"><a @click="browsingType='Bottoms', componentId=4, resetPlayerClothes()">Bottoms</a></li>
                    <li class="navTwo"><a @click="browsingType='Shoes', componentId=6, resetPlayerClothes()">Shoes</a></li>
                    <button class="purchaseBtn" @click="buyClothes()">Purchase</button>
                    <button class="purchaseBtn" style="margin-top: 0.2vw" @click="close()">Exit</button>
                </ul>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

export default {
  components: {},
  data: function() {
    return {
      browsingType: 'Tops',
      type: 0,
      texture: 0,
      componentId: 11,
      rotation: 0,
    };
  },
  watch: {
    // eslint-disable-next-line
    type(oldType, newType) {
        if (window.mp) {
        window.mp.trigger("setPlayer:clothes", this.componentId, oldType, this.texture);
      }
    },
    // eslint-disable-next-line
    texture(oldType, newType) {
      if (window.mp) {
        window.mp.trigger("setPlayer:clothes", this.componentId, this.type, oldType);
      }
    },
    // eslint-disable-next-line
    rotation(oldType, newType) {
      if (window.mp) {
        window.mp.trigger("setPlayerRot", oldType);
      }
    }
  },
  computed: {
    ...mapGetters({}),
    ...mapMutations({})
  },
  methods: {
    close() {
      if (window.mp) {
        window.mp.trigger("closeRoute");
        window.mp.trigger("reset:clothes")
      }
    },
    resetPlayerClothes() {
        if(window.mp) {
            window.mp.trigger("reset:clothes")
        }
    },
    buyClothes() {
        if(window.mp) {
          window.mp.trigger('playerBuyClothes:client', this.componentId, this.type, this.texture);
        }
    }
   }
};
</script>


<style>
.navOne {
  list-style-type: none;
  margin: 0;
  padding: 0;
  height: 20vw;
  background-color: transparent;
}

.navTwo {
  display: block;
  color: #ffffff;
  text-decoration: none;
  font-size: 1vw;
  line-height: 50px;
  line-height: 1.5em;
  text-transform: normal;
  letter-spacing: normal;
  list-style-type: none;
  border-right: solid rgba(255, 255, 255, 0.311) 5px;
  border-left: solid rgba(255, 255, 255, 0.311) 5px;
  transition: 0.5s;
}

.navTwo:hover {
  background-color: #555;
  color: white;
}

.clothingSliders {
  position: absolute;
}

.purchaseBtn {
  background: transparent;
  border-top: solid rgba(220, 171, 255, 20) 6px;
  color: #fffffffb;
  transition-duration: 0.4s;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 650;
  margin-top: auto;
  font-size: 17px;
  padding: 1px;
  width: 9vw;
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
  margin-top: 0.2vw;
}

.purchaseBtn:hover {
  border-top: solid #6eff7f 6px;
}

.subContainer {
  background: #8c8c8c;
  margin-top: 1vw;
  padding: 20px;
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
}

.container-clothingStores {
  opacity: 0.8;
  min-height: 10vh;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 15px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  height: 50vw;
}

.clothingList {
  background: -webkit-linear-gradient(right, #4b4b4b, #d8d8d864);
  color: #fff;
  height: 22vw;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 550;
  text-align: center;
  font-size: 15px;
  line-height: 1.5vw;
  margin-left: 14vw;
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

  border-top: solid rgba(255, 255, 255, 0.311) 2px;
  background: -webkit-linear-gradient(
    right,
    rgba(1, 1, 1, 0.651),
    rgba(10, 10, 10, 0.944)
  );
}

.clothingBase {
  opacity: 1;
  width: 23vw;
  border-top: solid rgba(220, 171, 255, 20) 6px;
  height: 22vw;
  border-radius: 15px;
  /*background-color: rgba(0, 0, 0, 0.85);*/
  color: rgba(10, 10, 10, 0.644);
  background: -webkit-linear-gradient(
    right,
    rgba(10, 10, 10, 1),
    rgba(1, 1, 1, 0.851)
  );
  backdrop-filter: blur(30px);
  margin-top: 10vw;
  margin-left: 75vw;
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
  background-color: #000000ec;
  background-image: url("../assets/img/diagmonds.png");
}

.textBase {
  color: #ffffff;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 400;
  font-size: 20px;
  line-height: 2vw;
}

.textSub {
  color: #ffffff;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 400;
  font-size: 20px;
  text-align: center;
}

.slidecontainer {
  margin-left: 2vw;
  margin-top: 1vw;
  max-width: 10vw;
  line-height: 2vw;
  min-width: 10vw;
}

/* The slider itself */
.slider {
  -webkit-appearance: none; /* Override default CSS styles */
  appearance: none;
  width: 100%; /* Full-width */
  height: 5px; /* Specified height */
  background: #ffffff; /* Grey background */
  outline: none; /* Remove outline */
  opacity: 0.6; /* Set transparency (for mouse-over effects on hover) */
  -webkit-transition: 0.2s; /* 0.2 seconds transition on hover */
  transition: opacity 0.2s;
}

/* Mouse-over effects */
.slider:hover {
  opacity: 1; /* Fully shown on mouse-over */
}

/* The slider handle (use -webkit- (Chrome, Opera, Safari, Edge) and -moz- (Firefox) to override default look) */
.slider::-webkit-slider-thumb {
  -webkit-appearance: none; /* Override default look */
  appearance: none;
  width: 17px; /* Set a specific slider handle width */
  height: 17px; /* Slider handle height */
  background: rgb(183, 119, 255); /* Green background */
  cursor: pointer; /* Cursor on hover */
  border-radius: 10px;
}

.slider::-moz-range-thumb {
  width: 25px; /* Set a specific slider handle width */
  height: 25px; /* Slider handle height */
  background: #04aa6d; /* Green background */
  cursor: pointer; /* Cursor on hover */
}
</style>