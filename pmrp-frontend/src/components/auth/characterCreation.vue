<template>
<div class="creationContainer">
    <div class="creationBase" :style="menuHeightOne">
        <div class="head1"><a><i class="fa-solid fa-screwdriver-wrench"></i> Character Creation <p style="margin-top:0.3vw;">Create a new character.</p></a></div>
        <div class="navCreation">
            <ul class="unitList">
                <li class="listItem"><a @click="browsingType='general', menuOneH=31, menuTwoH=22">General</a></li>
                <li class="listItem"><a @click="browsingType='face', menuOneH=44, menuTwoH=38">Face</a></li>
                <li class="listItem"><a @click="browsingType='hair', menuOneH=28, menuTwoH=22">Hair</a></li>
                <li class="listItem"><a @click="browsingType='other', menuOneH=31, menuTwoH=30">Other</a></li>
            </ul>
        </div>
        <div class="creationMenuBase" :style="menuHeightTwo">
            <div v-if="browsingType==='general'">
                <div class="inputFields">
                  <div style="border-bottom: solid rgba(255, 255, 255, 0.311) 2px; ">
                    <input id="loginPass" class="input100" maxlength="15" placeholder="Enter a First Name..." v-model="fName">
                  </div>
                  <div style="border-bottom: solid rgba(255, 255, 255, 0.311) 2px; ">
                    <input id="loginPass" class="input100" maxlength="15" placeholder="Enter a last name..." v-model="lName">
                  </div>
            </div>
            <div class="dropdown">
              <button class="dropbtn">Change Sex</button>
              <div class="dropdown-content">
                <a @click="gender = 'male'" href="#">Male</a>
                <a @click="gender = 'female'" href="#">Female</a>
              </div>
            </div>
                <div class="slidescontainer" style="position:absolute;">
                    <div class="subText" style="float:left;">Mother {{ mother }}</div>
                    <input type="range" min="0" max="40" value="0" class="creationSliders"  v-model="mother">
                  </div>
                  <div class="slidescontainer" style="margin-left: 16vw; position:absolute;">
                    <div class="subText" style="float:left;">Father {{ father }}</div>
                    <input type="range" min="0" max="40" value="0" class="creationSliders"  v-model="father">
                  </div>
                  <div class="mixContainer">
                    <div class="subText" style="float:left; margin-top: 4vw;">Mother / Father Mix {{ mix }}%</div>
                    <input type="range" min="0" max="100" value="0" class="creationSliders"  v-model="mix">
                    <div class="subText" style="float:left; margin-top: 0.2vw;">Skin Mix {{ skinMix }}%</div>
                    <input type="range" min="0" max="100" value="0" class="creationSliders"  v-model="skinMix">
                  </div>
            </div>
            <div v-if="browsingType==='face'">
              <div class="slidescontainer" style="position:absolute; line-height: 1.5vw;">
                <div class="subText" style="float:left;">Nose Width {{ noseWidth/10 }}</div>
                <input type="range" min="-10" max="10" value="0" class="creationSliders"  v-model="noseWidth">
                <div class="subText" style="float:left;">Nose Length	 {{ noseLength/10 }}</div>
                <input type="range" min="-10" max="10" value="0" class="creationSliders"  v-model="noseLength">
                <div class="subText" style="float:left;">Nose Tip {{ noseTip/10 }}</div>
                <input type="range" min="-10" max="10" value="0" class="creationSliders"  v-model="noseTip">
                <div class="subText" style="float:left;">Brow Height {{ browHeight/10 }}</div>
                <input type="range" min="-10" max="10" value="0" class="creationSliders"  v-model="browHeight">
                <div class="subText" style="float:left;">Cheekbone Height {{ cheekboneHeight/10 }}</div>
                <input type="range" min="-10" max="10" value="0" class="creationSliders"  v-model="cheekboneHeight">
                <div class="subText" style="float:left;">Cheeks Width {{ cheeksWidth/10 }}</div>
                <input type="range" min="-10" max="10" value="0" class="creationSliders"  v-model="cheeksWidth">
                <div class="subText" style="float:left;">Lip Type {{ lips/10 }}</div>
                <input type="range" min="-10" max="10" value="0" class="creationSliders"  v-model="lips">
                <div class="subText" style="float:left;">Jaw Height {{ jawHeight/10 }}</div>
                <input type="range" min="-10" max="10" value="0" class="creationSliders"  v-model="jawHeight">
                <div class="subText" style="float:left;">Chin Position {{ chinPosition/10 }}</div>
                <input type="range" min="-10" max="10" value="0" class="creationSliders"  v-model="chinPosition">
                <div class="subText" style="float:left;">Chin Shape {{ chinShape/10 }}</div>
                <input type="range" min="-10" max="10" value="0" class="creationSliders"  v-model="chinShape">
              </div>
              <div class="slidescontainer" style="margin-left: 15vw; position:absolute; line-height: 1.5vw;">
                <div class="subText" style="float:left;">Nose Height {{ noseHeight/10 }}</div>
                <input type="range" min="-10" max="10" value="0" class="creationSliders"  v-model="noseHeight">
                <div class="subText" style="float:left;">Nose Bridge {{ noseBridge/10 }}</div>
                <input type="range" min="-10" max="10" value="0" class="creationSliders"  v-model="noseBridge">
                <div class="subText" style="float:left;">Nose Bridge Shift {{ noseBridgeShift/10 }}</div>
                <input type="range" min="-10" max="10" value="0" class="creationSliders"  v-model="noseBridgeShift">
                <div class="subText" style="float:left;">Brow Width {{ browWidth/10 }}</div>
                <input type="range" min="-10" max="10" value="0" class="creationSliders"  v-model="browWidth">
                <div class="subText" style="float:left;">Cheekbone Width {{ cheekboneWidth/10 }}</div>
                <input type="range" min="-10" max="10" value="0" class="creationSliders"  v-model="cheekboneWidth">
                <div class="subText" style="float:left;">Eye Type {{ eyes/10 }}</div>
                <input type="range" min="-10" max="10" value="0" class="creationSliders"  v-model="eyes">
                <div class="subText" style="float:left;">Jaw Width {{ jawWidth/10 }}</div>
                <input type="range" min="-10" max="10" value="0" class="creationSliders"  v-model="jawWidth">
                <div class="subText" style="float:left;">Chin Length {{ chinLength/10 }}</div>
                <input type="range" min="-10" max="10" value="0" class="creationSliders"  v-model="chinLength">
                <div class="subText" style="float:left;">Chin Width {{ chinWidth/10 }}</div>
                <input type="range" min="-10" max="10" value="0" class="creationSliders"  v-model="chinWidth">
                <div class="subText" style="float:left;">Neck Width {{ neckWidth/10 }}</div>
                <input type="range" min="-10" max="10" value="0" class="creationSliders"  v-model="neckWidth">
              </div>
              <div class="mixContainer">
                <div class="subText" style="float:left; margin-top: 31vw">Eye Colour {{ eyeColour }}</div>
                <input type="range" min="0" max="31" value="0" class="creationSliders"  v-model="eyeColour">
              </div>
            </div>
            <div v-if="browsingType==='hair'">
              <div class="mixContainer">
                <div class="subText" style="float:left; margin-top: 1vw">Hair Style {{ hairStyle }}</div>
                <input type="range" min="0" max="76" value="0" class="creationSliders" style="margin-top: 1vw;"  v-model="hairStyle">
              </div>
              <div class="slidescontainer" style="position:absolute; line-height: 1.5vw;">
                <div class="subText" style="float:left;">Hair Colour {{ hairColour }}</div>
                <input type="range" min="0" max="63" value="0" class="creationSliders"  v-model="hairColour">
                <div class="subText" style="float:left;">Eyebrows Style	 {{ eyebrowsStyle }}</div>
                <input type="range" min="0" max="33" value="0" class="creationSliders"  v-model="eyebrowsStyle">
                <div class="subText" style="float:left;">Facial Hair Style {{ facialHairStyle }}</div>
                <input type="range" min="-1" max="28" value="0" class="creationSliders"  v-model="facialHairStyle">
              </div>
              <div class="slidescontainer" style="margin-left: 18vw; position:absolute; line-height: 1.5vw;">
                <div class="subText" style="float:left;">Hair Highlights {{ hairHighlights }}</div>
                <input type="range" min="0" max="63" value="0" class="creationSliders"  v-model="hairHighlights">
                <div class="subText" style="float:left;">Eyebrows Colour {{ eyebrowsColour }}</div>
                <input type="range" min="0" max="63" value="0" class="creationSliders"  v-model="eyebrowsColour">
                <div class="subText" style="float:left;">Facial Hair Colour {{ facialHairColour }}</div>
                <input type="range" min="0" max="63" value="0" class="creationSliders"  v-model="facialHairColour">
              </div>
              <div class="mixContainer">
                <div class="subText" style="float:left; margin-top: 11vw">Chest Hair Style {{ chestHairStyle }}</div>
                <input type="range" min="0" max="16" value="0" class="creationSliders" style="margin-top: 1vw;"  v-model="chestHairStyle">
              </div>
            </div>
            <div v-if="browsingType==='other'">
              <div class="mixContainer">
                <div class="subText" style="float:left; margin-top: 1vw">Blemishes {{ blemishes }}</div>
                <input type="range" min="-1" max="12" value="0" class="creationSliders" style="margin-top: 1vw;"  v-model="blemishes">
                <div class="subText" style="float:left; margin-top: 1vw">Ageing {{ ageing }}</div>
                <input type="range" min="-1" max="14" value="0" class="creationSliders" style="margin-top: 1vw;"  v-model="ageing">
              </div>
              <div class="slidescontainer" style="position:absolute; line-height: 1.5vw;">
                <div class="subText" style="float:left;">Blush Style {{ blushStyle }}</div>
                <input type="range" min="0" max="33" value="0" class="creationSliders"  v-model="blushStyle">
                <div class="subText" style="float:left;">Makeup	 {{ makeup }}</div>
                <input type="range" min="0" max="100" value="0" class="creationSliders"  v-model="makeup">
                <div class="subText" style="float:left;">Complexion {{ complexion }}</div>
                <input type="range" min="0" max="11" value="0" class="creationSliders"  v-model="complexion">
              </div>
              <div class="slidescontainer" style="margin-left: 18vw; position:absolute; line-height: 1.5vw;">
                <div class="subText" style="float:left;">Blush Colour {{ blushColour }}</div>
                <input type="range" min="0" max="63" value="5" class="creationSliders"  v-model="blushColour">
                <div class="subText" style="float:left;">Lipstick {{ lipstick }}</div>
                <input type="range" min="0" max="10" value="0" class="creationSliders"  v-model="lipstick">
                <div class="subText" style="float:left;">Moles / Freckles {{ molesFreckles }}</div>
                <input type="range" min="0" max="18" value="0" class="creationSliders"  v-model="molesFreckles">
              </div>
              <div class="mixContainer">
                <div class="subText" style="float:left; margin-top: 11vw">Sun Damage {{ sunDamage }}</div>
                <input type="range" min="0" max="16" value="0" class="creationSliders" style="margin-top: 1vw;"  v-model="sunDamage">
              </div>
            </div>
        </div>
    </div>
    <div class="buttonContainer">
      <button class="creationButton" style="border:none;">Rotation ({{rot}}°)<input type="range" min="0" max="360" value="0" class="creationSliders" style="margin-top: 1vw;"  v-model="rot"></button>
        <button @click="finishCharacter()" class="creationButton" style="margin-top: 4.5vw;">Create Character</button>
    </div>
</div>
</template>


<script>
export default {
  data() {
    return {
      browsingType: "general",
      menuOneH: 30,
      menuTwoH: 22,
      gender: "male",
      fName: "",
      lName: "",
      mother: 0,
      father: 0,
      mix: 0,
      skinMix: 0,
      noseWidth: 0,
      noseHeight: 0,
      noseLength: 0,
      noseBridge: 0,
      noseTip: 0,
      noseBridgeShift: 0,
      browHeight: 0,
      browWidth: 0,
      cheekboneWidth: 0,
      cheekboneHeight: 0,
      cheeksWidth: 0,
      eyes: 0,
      lips: 0,
      jawWidth: 0,
      jawHeight: 0,
      chinLength: 0,
      chinPosition: 0,
      chinWidth: 0,
      chinShape: 0,
      neckWidth: 0,
      eyeColour: 0,
      hairStyle: 0,
      hairColour: 0,
      hairHighlights: 0,
      eyebrowsStyle: 0,
      eyebrowsColour: 0,
      facialHairStyle: -1,
      facialHairColour: 0,
      chestHairStyle: -1,
      blemishes: -1,
      ageing: -1,
      blushStyle: -1,
      blushColour: -1,
      makeup: -1,
      makeupColour: -1,
      complexion: -1,
      molesFreckles: -1,
      sunDamage: -1,
      lipstick: -1,
      rot: 0
    };
  },
  computed: {
    menuHeightOne() {
      return {
        height: `${this.menuOneH}vw`
      };
    },
    menuHeightTwo() {
      return {
        height: `${this.menuTwoH}vw`
      };
    }
  },
  watch: {
    gender(oldType, newType) {
      console.log(`${oldType} ${newType}`);
      if (window.mp) {
        window.mp.trigger("serverFunctionCEF", "setSex", oldType);
      }
    },
    mother(oldType, newType) {
      console.log(`${oldType} ${newType}`);
      if (window.mp) {
        window.mp.trigger(
          "setHeadBlend:creator",
          newType,
          this.father,
          oldType,
          this.father,
          this.mix * 0.01,
          this.skinMix * 0.01
        );
      }
    },
    father(oldType, newType) {
      console.log(`${oldType} ${newType}`);
      if (window.mp) {
        window.mp.trigger(
          "setHeadBlend:creator",
          this.mother,
          oldType,
          this.mother,
          oldType,
          this.mix * 0.01,
          this.skinMix * 0.01
        );
      }
    },
    mix(oldType, newType) {
      console.log(`${oldType} ${newType}`);
      if (window.mp) {
        window.mp.trigger(
          "setHeadBlend:creator",
          this.mother,
          this.father,
          this.mother,
          this.father,
          oldType * 0.01,
          this.skinMix * 0.01
        );
      }
    },
    skinMix(oldType, newType) {
      console.log(`${oldType} ${newType}`);
      if (window.mp) {
        window.mp.trigger(
          "setHeadBlend:creator",
          this.mother,
          this.father,
          this.mother,
          this.father,
          this.mix * 0.01,
          oldType * 0.01
        );
      }
    },
    hairStyle(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setComponentVariation", 2, oldType, 0);
      }
    },
    hairColour(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setHairColour", oldType, this.hairHighlights);
      }
    },
    hairHighlights(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setHairColour", this.hairColour, oldType);
      }
    },
    eyebrowsStyle(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setHeadOverlay", 2, oldType, this.eyebrowsColour);
      }
    },
    eyebrowsColour(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setHeadOverlay", 2, this.eyebrowsStyle, oldType);
      }
    },
    facialHairStyle(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setHeadOverlay", 1, oldType, this.facialHairColour);
      }
    },
    facialHairColour(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setHeadOverlay", 1, this.facialHairStyle, oldType);
      }
    },
    chestHairStyle(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setHeadOverlay", 10, oldType, this.chestHairColour);
      }
    },
    noseWidth(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setFaceFeature", 0, oldType / 10);
      }
    },
    noseHeight(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setFaceFeature", 1, oldType / 10);
      }
    },
    noseLength(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setFaceFeature", 2, oldType / 10);
      }
    },
    noseBridge(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setFaceFeature", 3, oldType / 10);
      }
    },
    noseTip(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setFaceFeature", 4, oldType / 10);
      }
    },
    noseBridgeShift(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setFaceFeature", 5, oldType / 10);
      }
    },
    browHeight(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setFaceFeature", 6, oldType / 10);
      }
    },
    browWidth(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setFaceFeature", 7, oldType / 10);
      }
    },
    cheekboneHeight(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setFaceFeature", 8, oldType / 10);
      }
    },
    cheekboneWidth(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setFaceFeature", 9, oldType / 10);
      }
    },
    cheeksWidth(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setFaceFeature", 10, oldType / 10);
      }
    },
    eyes(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setFaceFeature", 11, oldType / 10);
      }
    },
    lips(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setFaceFeature", 12, oldType / 10);
      }
    },
    jawWidth(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setFaceFeature", 13, oldType / 10);
      }
    },
    jawHeight(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setFaceFeature", 14, oldType / 10);
      }
    },
    chinLength(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setFaceFeature", 15, oldType / 10);
      }
    },
    chinPosition(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setFaceFeature", 16, oldType / 10);
      }
    },
    chinWidth(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setFaceFeature", 17, oldType / 10);
      }
    },
    chinShape(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setFaceFeature", 18, oldType / 10);
      }
    },
    neckWidth(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setFaceFeature", 19, oldType / 10);
      }
    },
    eyeColour(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setPlayerEyeType", oldType);
      }
    },
    blemishes(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setHeadOverlay", 0, oldType, 0);
      }
    },
    ageing(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setHeadOverlay", 3, oldType, 0);
      }
    },
    blushStyle(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setHeadOverlay", 5, oldType, this.blushColour);
      }
    },
    blushColour(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setHeadOverlay", 5, this.blushStyle, oldType);
      }
    },
    makeup(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setHeadOverlay", 4, oldType, this.makeupColour);
      }
    },
    complexion(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setHeadOverlay", 6, oldType, 0);
      }
    },
    molesFreckles(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setHeadOverlay", 9, oldType, 0);
      }
    },
    lipstick(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setHeadOverlay", 8, oldType, 0);
      }
    },
    sunDamage(oldType, newType) {
      console.log(oldType, newType);
      if (window.mp) {
        window.mp.trigger("setHeadOverlay", 7, oldType, 0);
      }
    },
    rot(oldType, newType) {
      console.log(`${oldType} ${newType}`);
      if (window.mp) {
        window.mp.trigger("setPlayerRot", oldType);
      }
    }
  },
  methods: {
    /* eslint-disable */
    finishCharacter() {
      function containsNumbers(str) {
        return /\d/.test(str);
      }
      if (
        this.fName.length == 0 ||
        this.lName.length == 0 ||
        this.fName.match(/\W/) ||
        this.lName.match(/\W/) ||
        this.fName.length > 15 ||
        this.lName.length > 15 ||
        containsNumbers(this.fName) ||
        containsNumbers(this.lName)
      ) {
        global.gui.notify.clearAll();
        global.gui.notify.showNotification(
          "Enter a valid character name using the format: Fname Lname",
          false,
          true,
          5000,
          "fa-solid fa-triangle-exclamation"
        );
        return;
      } else if (window.mp) {
        this.rot = 0;
        this.fName = this.fName[0].toUpperCase() + this.fName.toLowerCase().slice(1);
        this.lName = this.lName[0].toUpperCase() + this.lName.toLowerCase().slice(1);
        window.mp.trigger(
          "serverFunctionCEF",
          "characterCreationFinish",
          JSON.stringify(this.$data)
        );
      }
    },
    backToSelection() {
      this.$router.push("charselect");
    }
  }
};
</script>

<style scoped>
/* The slider itself */
.creationSliders {
  -webkit-appearance: none; /* Override default CSS styles */
  appearance: none;
  width: 100%; /* Full-width */
  height: 3px; /* Specified height */
  background: #ffffff; /* Grey background */
  outline: none; /* Remove outline */
  opacity: 0.6; /* Set transparency (for mouse-over effects on hover) */
}

/* Mouse-over effects */
.creationSliders:hover {
  opacity: 1; /* Fully shown on mouse-over */
  transition: 0.5s;
}

/* The slider handle (use -webkit- (Chrome, Opera, Safari, Edge) and -moz- (Firefox) to override default look) */
.creationSliders::-webkit-slider-thumb {
  -webkit-appearance: none; /* Override default look */
  appearance: none;
  width: 17px; /* Set a specific slider handle width */
  height: 17px; /* Slider handle height */
  background: rgb(183, 119, 255); /* Green background */
  cursor: pointer; /* Cursor on hover */
  border-radius: 10px;
}

.creationSliders::-moz-range-thumb {
  width: 25px; /* Set a specific slider handle width */
  height: 25px; /* Slider handle height */
  background: #04aa6d; /* Green background */
  cursor: pointer; /* Cursor on hover */
}

.subText {
  color: #ffffff;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 400;
  font-size: 15px;
  text-align: center;
}

.creationButton {
  user-select: none;
  background: -webkit-linear-gradient(
    right,
    rgba(10, 10, 10, 0.944),
    rgba(1, 1, 1, 0.789)
  );
  border-bottom: solid rgb(197, 146, 255) 6px;
  color: #fffffffb;
  transition-duration: 0.4s;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 650;
  margin-top: auto;
  font-size: 22px;
  padding: 6px;
  width: 30vw;
  --notchSize: 12px;

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
  margin-top: 5px;
  margin-left: 68vw;
  position: absolute;
}

.creationButton:hover {
  border-bottom: solid rgba(118, 255, 163, 0.882) 2px;
}
.dropbtn {
  background-color: rgba(0, 0, 0, 0.182);
  color: white;
  padding: 16px;
  font-size: 16px;
  border: none;
  min-width: 160px;
  border-top: solid rgb(183, 119, 255) 3px;
}

.dropdown {
  position: relative;
  display: inline-block;
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

.dropdown-content a:hover {background-color: rgba(0, 0, 0, 0.182);}

.dropdown:hover .dropdown-content {display: block;}

.dropdown:hover .dropbtn {background-color: rgba(69, 69, 69, 0.182);;}

.slidescontainer {
  margin-left: 2vw;
  margin-top: 1vw;
  max-width: 10vw;
  line-height: 1vw;
  min-width: 10vw;
}

.mixContainer {
  margin-left: 5vw;
  margin-top: 0.1vw;
  max-width: 20vw;
  line-height: 1vw;
  min-width: 10vw;
}

select {
  background-color: transparent;
  border: none;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 700;
  text-align: center;
  color: white;
  font-size: 20px;
  user-select: none;
}

select:focus {
  background-color: rgba(0, 0, 0, 0.663);
  border: none;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 700;
  text-align: center;
  color: white;
  font-size: 20px;
  user-select: none;
}
option:active {
  background-color: transparent;
  border: none;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 700;
  text-align: center;
  color: white;
  font-size: 20px;
  user-select: none;
}
select:focus {
  border: none;
  user-select: none;
}
select::after {
  border: none;
  user-select: none;
}

* {
  transition: 0.5s;
  user-select: none;
}
.unitList {
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: transparent;
}

.listItem {
  float: left;
  border-bottom: solid rgba(255, 255, 255, 0.311) 2px;
}

.listItem a {
  display: block;
  color: white;
  text-align: center;
  padding: 20px 1.6vw;
  text-decoration: none;
}

.inputFields {
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: transparent;
  display: block;
  color: white;
  text-align: center;
  padding: 20px 1.6vw;
  text-decoration: none;
}

li a:hover {
  border-bottom: solid rgba(118, 255, 163, 0.882) 2px;
}

.creationContainer {
  opacity: 0.8;
  min-height: 10vh;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 15px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  height: 40vw;
}

.creationMenuBase {
  background: -webkit-linear-gradient(right, #4b4b4b, #d8d8d864);
  color: #fff;
  height: 12vw;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 700;
  text-align: center;
  margin-top: 1vw;
  font-size: 15px;
  line-height: 1.5vw;
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

.navCreation {
  margin-left: 5vw;
  margin-top: 0.5vw;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.creationBase {
  opacity: 1;
  width: 30vw;
  border-top: solid rgba(220, 171, 255, 20) 6px;
  height: 19vw;
  border-radius: 15px;
  /*background-color: rgba(0, 0, 0, 0.85);*/
  color: rgba(10, 10, 10, 0.644);
  background: -webkit-linear-gradient(
    right,
    rgba(10, 10, 10, 0.944),
    rgba(1, 1, 1, 0.651)
  );
  margin-top: 2vw;
  margin-left: 68vw;

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
  border-bottom: solid rgb(183, 119, 255) 5px;

  background-color: #000000ec;
  background-image: url("./assets/image/diagmonds.png");
}

.head1 {
  color: #fff;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 1000;
  text-align: center;
  font-size: 27px;
  line-height: 1vw;
  background: -webkit-linear-gradient(
    left,
    rgba(10, 10, 10, 0.115),
    rgba(1, 1, 1, 0.651)
  );
  padding: 1vw;
  padding-bottom: 0.5vw;
  padding-top: 0.7vw;
  text-align: left;
  border-bottom: solid rgb(183, 119, 255) 3px;
  box-shadow: 0 0 30px rgba(183, 119, 255, 0.69);
}
</style>