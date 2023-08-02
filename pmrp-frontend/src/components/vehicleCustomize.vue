<template>
  <div class="limiter" style="user-select:none; transition-duration: 2s;">
      <div class="container-clothingStores">
        <div class="customBase" style="position:absolute;">
          <div  style="position:absolute; height:21vw; overflow:scroll; width:14vw; overflow-x:hidden; margin-right:0.5vw;" >
            <div v-if="browsingType==='bumpers'">
              <div class="slidescontainer">
                  <div class="subText" style="float:left;">Front Bumper ({{getVal(frontBumper)}})</div>
                    <input type="range" min="-1" max="30" value="0" class="creationSliders" v-model="frontBumper">
                    <button class="addBtn" @click="addBasketItem('Front Bumper', 1, frontBumper, 2344)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add <font color="#118C4F">$2,344</font></button>
                </div>
                <div class="slidescontainer">
                  <div class="subText" style="float:left;">Rear Bumper ({{getVal(rearBumper)}})</div>
                  <input type="range" min="-1" max="30" value="0" class="creationSliders" v-model="rearBumper">
                  <button class="addBtn" @click="addBasketItem('Rear Bumper', 2, rearBumper, 2344)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $2,344</font></button>
                </div>
            </div>
            <div v-if="browsingType==='acces'">
              <div class="slidescontainer">
                  <div class="subText" style="float:left;">Side Skirts ({{getVal(sideSkirt)}})</div>
                    <input type="range" min="-1" max="20" value="0" class="creationSliders" v-model="sideSkirt">
                    <button class="addBtn" @click="addBasketItem('Side Skirts', 3, sideSkirt, 1590)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $1,590</font></button>
                </div>
                <div class="slidescontainer">
                  <div class="subText" style="float:left;">Spoilers ({{getVal(spoilers)}})</div>
                  <input type="range" min="-1" max="15" value="0" class="creationSliders" v-model="spoilers">
                  <button class="addBtn" @click="addBasketItem('Spoilers', 0, spoilers, 5900)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $5,900</font></button>
                </div>
                <div class="slidescontainer">
                  <div class="subText" style="float:left;">Exhausts ({{getVal(exhaust)}})</div>
                  <input type="range" min="-1" max="10" value="0" class="creationSliders" v-model="exhaust">
                  <button class="addBtn" @click="addBasketItem('Exhausts', 4, exhaust, 1239)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $1,239</font></button>
                </div>
                <div class="slidescontainer">
                  <div class="subText" style="float:left;">Frames ({{getVal(frame)}})</div>
                  <input type="range" min="-1" max="10" value="0" class="creationSliders" v-model="frame">
                  <button class="addBtn" @click="addBasketItem('Frames', 5, frame, 1239)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $1,239</font></button>
                </div>
                <div class="slidescontainer">
                  <div class="subText" style="float:left;">Grilles ({{getVal(grille)}})</div>
                  <input type="range" min="-1" max="10" value="0" class="creationSliders" v-model="grille">
                  <button class="addBtn" @click="addBasketItem('Grilles', 6, grille, 1111)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $1,111</font></button>
                </div>
                <div class="slidescontainer">
                  <div class="subText" style="float:left;">Bonnet ({{getVal(hood)}})</div>
                  <input type="range" min="-1" max="15" value="0" class="creationSliders" v-model="hood">
                  <button class="addBtn" @click="addBasketItem('Bonnet', 7, hood, 6504)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $6,504</font></button>
                </div>
                <div class="slidescontainer">
                  <div class="subText" style="float:left;">Wing ({{getVal(fender)}})</div>
                  <input type="range" min="-1" max="15" value="0" class="creationSliders" v-model="fender">
                  <button class="addBtn" @click="addBasketItem('Fender', 8, fender, 2202)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $2,202</font></button>
                </div>
                <div class="slidescontainer">
                  <div class="subText" style="float:left;">Right Wing ({{getVal(rightFender)}})</div>
                  <input type="range" min="-1" max="15" value="0" class="creationSliders" v-model="rightFender">
                  <button class="addBtn" @click="addBasketItem('Right Fender', 9, rightFender, 2302)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $2,202</font></button>
                </div>
                <div class="slidescontainer">
                  <div class="subText" style="float:left;">Roof ({{getVal(roof)}})</div>
                  <input type="range" min="-1" max="15" value="0" class="creationSliders" v-model="roof">
                  <button class="addBtn" @click="addBasketItem('Roof', 10, roof, 8504)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $8,504</font></button>
                </div>
                <div class="slidescontainer">
                  <div class="subText" style="float:left;">Plate ({{getVal(plateHolders)}})</div>
                  <input type="range" min="0" max="5" value="0" class="creationSliders" v-model="plateHolders">
                  <button class="addBtn" @click="addBasketItem('Plate', 53, plateHolders, 50)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $50</font></button>
                </div>
            </div>
            <div v-if="browsingType==='performance'">
              <div class="slidescontainer">
                  <div class="subText" style="float:left;">Engine ({{getVal(engine)}})</div>
                    <input type="range" min="-1" max="3" value="0" class="creationSliders" v-model="engine">
                    <button class="addBtn" @click="addBasketItem('Engine', 11, engine, 23500)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $23,500</font></button>
                </div>
                <div class="slidescontainer">
                  <div class="subText" style="float:left;">Brakes ({{getVal(brakes)}})</div>
                  <input type="range" min="-1" max="2" value="0" class="creationSliders" v-model="brakes">
                  <button class="addBtn" @click="addBasketItem('Brakes', 12, brakes, 6990)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $3,400</font></button>
                </div>
                <div class="slidescontainer">
                  <div class="subText" style="float:left;">Suspension ({{getVal(suspension)}})</div>
                  <input type="range" min="-1" max="3" value="0" class="creationSliders" v-model="suspension">
                  <button class="addBtn" @click="addBasketItem('Suspension', 15, suspension, 5600)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $3,400</font></button>
                </div>
                <div class="slidescontainer">
                  <div class="subText" style="float:left;">Transmission ({{getVal(transmission)}})</div>
                  <input type="range" min="-1" max="2" value="0" class="creationSliders" v-model="transmission">
                  <button class="addBtn" @click="addBasketItem('Transmission', 13, transmission, 14500)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $3,400</font></button>
                </div>
                <div class="slidescontainer">
                  <div class="subText" style="float:left;">Turbo ({{turbo==-1 ? 'No' : 'Yes'}})</div>
                  <input type="range" min="-1" max="0" value="0" class="creationSliders" v-model="turbo">
                  <button class="addBtn" @click="addBasketItem('Turbo', 18, turbo, 17500)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $3,400</font></button>
                </div>
                <div class="slidescontainer">
                  <div class="subText" style="float:left;">Horn ({{getVal(horns)}})</div>
                  <input type="range" min="-1" max="34" value="0" class="creationSliders" v-model="horns">
                  <button class="addBtn" @click="addBasketItem('Horn', 14, horns, 200)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $200</font></button>
                </div>
                <div class="slidescontainer">
                  <div class="subText" style="float:left;">Xenon Headlights ({{xenon==-1 ? 'No' : 'Yes'}})</div>
                  <input type="range" min="-1" max="0" value="0" class="creationSliders" v-model="xenon">
                  <button class="addBtn" @click="addBasketItem('Xenon Headlights', 22, xenon, 2500)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $2,500</font></button>
                </div>
                <div class="slidescontainer">
                  <div class="subText" style="float:left;">Window Tint ({{getVal(windowTint)}})</div>
                  <input type="range" min="-1" max="2" value="0" class="creationSliders" v-model="windowTint">
                  <button class="addBtn" @click="addBasketItem('Window Tint', 46, windowTint, 5000)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $5,000</font></button>
                </div>
            </div>
            <div v-if="browsingType==='wheels'">
              <div class="slidescontainer">
                <div class="subText" style="float:left;">Wheel Type ({{getVal(wheelType)}})</div>
                  <input type="range" min="-1" max="11" value="0" class="creationSliders" v-model="wheelType">
                  <button class="addBtn" @click="addBasketItem('Wheel Type', -1, wheelType, 3000)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $3,000</font></button>
              </div>
              <div class="slidescontainer">
                  <div class="subText" style="float:left;">Wheels ({{getVal(frontWheels)}})</div>
                    <input type="range" min="-1" :max='wheelType == 11 ? 210 : 50 && wheelType == 8 ? 219 : 50 && wheelType == 9 ? 219 : 50 && wheelType == 10 ? 140 : 50' value="0" class="creationSliders" v-model="frontWheels">
                    <button class="addBtn" @click="addBasketItem('Wheels', 23, frontWheels, 6500)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $6,500</font></button>
                </div>
            </div>
            <div v-if="browsingType==='interior'">
              <div class="slidescontainer">
                <div class="subText" style="float:left;">Trim Design ({{getVal(trimDesign)}})</div>
                  <input type="range" min="-1" max="10" value="0" class="creationSliders" v-model="trimDesign">
                  <button class="addBtn" @click="addBasketItem('Trim Design', 27, trimDesign, 3000)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $3,000</font></button>
              </div>
              <div class="slidescontainer">
                  <div class="subText" style="float:left;">Ornaments ({{getVal(ornaments)}})</div>
                    <input type="range" min="-1" max="10" value="0" class="creationSliders" v-model="ornaments">
                    <button class="addBtn" @click="addBasketItem('Wheels', 28, ornaments, 120)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $120</font></button>
                </div>
                <div class="slidescontainer">
                  <div class="subText" style="float:left;">Dial Design ({{getVal(dialDesign)}})</div>
                    <input type="range" min="-1" max="10" value="0" class="creationSliders" v-model="dialDesign">
                    <button class="addBtn" @click="addBasketItem('Dial Design', 30,dialDesign, 400)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $400</font></button>
                </div>
                <div class="slidescontainer">
                  <div class="subText" style="float:left;">Steering Wheel ({{getVal(steeringWheel)}})</div>
                    <input type="range" min="-1" max="10" value="0" class="creationSliders" v-model="steeringWheel">
                    <button class="addBtn" @click="addBasketItem('Steering Wheel',33, steeringWheel, 1100)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $1,100</font></button>
                </div>
                <div class="slidescontainer">
                  <div class="subText" style="float:left;">Gear Stick ({{getVal(shiftLever)}})</div>
                    <input type="range" min="-1" max="10" value="0" class="creationSliders" v-model="shiftLever">
                    <button class="addBtn" @click="addBasketItem('Gear Stick', 34,shiftLever, 670)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $670</font></button>
                </div>
                <div class="slidescontainer">
                  <div class="subText" style="float:left;">Plaques ({{getVal(plaques)}})</div>
                    <input type="range" min="-1" max="10" value="0" class="creationSliders" v-model="plaques">
                    <button class="addBtn" @click="addBasketItem('Plaques', 35,plaques, 30)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $30</font></button>
                </div>
            </div>
            <div v-if="browsingType==='paint'">
              <div class="slidescontainer">
                <div class="subText" style="float:left;">Livery ({{getVal(livery)}})</div>
                  <input type="range" min="-1" max="20" value="0" class="creationSliders" v-model="livery">
                  <button class="addBtn" @click="addBasketItem('Livery', 48, livery, 4660)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $4,660</font></button>
              </div>
              <div class="slidescontainer">
                <div class="subText" style="float:left;">Paint Primary ({{getVal(colorOne)}})</div>
                  <input type="range" min="-1" max="159" value="0" class="creationSliders" v-model="colorOne">
                  <button class="addBtn" @click="addBasketItem('Paint Primary', 66, colorOne, 8950)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $8,950</font></button>
              </div>
              <div class="slidescontainer">
                <div class="subText" style="float:left;">Paint Secondary ({{getVal(colorTwo)}})</div>
                  <input type="range" min="-1" max="159" value="0" class="creationSliders" v-model="colorTwo">
                  <button class="addBtn" @click="addBasketItem('Paint Secondary', 67, colorTwo, 6950)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $6,950</font></button>
              </div>
              <div class="slidescontainer">
                <div class="subText" style="float:left;">Pearlescent ({{getVal(pearlescent)}})</div>
                  <input type="range" min="-1" max="159" value="0" class="creationSliders" v-model="pearlescent">
                  <button class="addBtn" @click="addBasketItem('Pearlescent', -1, pearlescent, 4050)"><i class="fa-solid fa-basket-shopping" style="float:left; margin-top: 0.1vw; margin-left: 0.2vw;"></i>Add<font color="#118C4F"> $4,050</font></button>
              </div>
            </div>
              </div>
          <div class="clothingList">
                  <img src="./utils/tool-and-utensils.png" style="margin-top: 1vw; height:7vw; align-items:center; text-align:center; margin-left:1vw;" />
                  <div class="textBase"><b>Vehicle Mods</b></div>
                  <ul class="navOne">
                      <li class="navTwo"><a @click="browsingType='bumpers'">Bumpers</a></li>
                      <li class="navTwo"><a @click="browsingType='acces'">Accessories</a></li>
                      <li class="navTwo"><a @click="browsingType='performance'">Performance</a></li>
                      <li class="navTwo"><a @click="browsingType='wheels'">Wheels</a></li>
                      <li class="navTwo"><a @click="browsingType='interior'">Interior</a></li>
                      <li class="navTwo"><a @click="browsingType='paint'">Paint</a></li>
                      <button class="purchaseBtn" style="margin-top: 0.2vw" @click="close()">Exit</button>
                  </ul>
              </div>
          </div>

          <Transition name="slide-fade">
          <div v-if="basketItems.length > 0" class="basketBase" style="position:absolute;">
            <div style="position:absolute; height:19vw; overflow:scroll; width:14vw; overflow-x:hidden;">
            <a v-for="item in basketItems" :key="item.name">
              <div class="basketContainers" style="border-radius:10px;">
                <div class="basketText">{{item.name}} ({{item.type == -1 ? 'Stock' : item.type}}) <font color="#118C4F">${{formatPrice(item.price)}}</font> <button @click="removeBasketItem(item.name)" style="color:#fc2803; float:right;"> <i class="fa-solid fa-trash"></i></button></div>
              </div>
            </a>
          </div>
          <div style="overflow:hidden;">
            <div class="clothingList" style="height:10vw;">
              <img src="./utils/shopping-basket.png" height="20" style="margin-top: 1vw; align-items:center; margin-left:1.4vw;" width="125"/>
              <div class="textBase"><b>Basket</b></div>
          </div>
          <div class="clothingList" style="position:absolute; margin-left:-1vw; margin-top:9.5vw; width:12vw; padding-right:0vw;">
            <ul class="navOne">
              <div class="purchaseBtn" style="margin-left:1.8vw; border:none;">Total Price <font color="#118C4F">${{getPrice() == false ? '0' : `${getPrice()}`}}</font></div>
          </ul>
          </div>
          <div class="clothingList" style="height:3vw; padding-top:0.5vw; margin-top: 9vw; border-top: none;">
            <ul class="navOne">
              <button class="purchaseBtn" @click="saveMods()">Save</button>
          </ul>
          </div>
          </div>
         </div>
        </Transition>
      </div>
      </div>
  </template>

  <script>
  import { mapGetters, mapMutations } from "vuex";

export default {
  components: {},
  data: function() {
    return {
      browsingType: "bumpers",
      // Vehicle variables
      spoilers: -1,
      frontBumper: -1,
      rearBumper: -1,
      sideSkirt: -1,
      exhaust: -1,
      frame: -1,
      grille: -1,
      hood: -1,
      fender: -1,
      rightFender: -1,
      roof: -1,
      engine: -1,
      brakes: -1,
      transmission: -1,
      horns: -1,
      suspension: -1,
      turbo: -1,
      xenon: -1,
      wheelType: -1,
      frontWheels: -1,
      plateHolders: -1,
      trimDesign: -1,
      ornaments: -1,
      dialDesign: -1,
      steeringWheel: -1,
      shiftLever: -1,
      plaques: -1,
      hydraulics: -1,
      boost: -1,
      windowTint: -1,
      livery: -1,
      colorOne: 111,
      colorTwo: 111,
      pearlescent: 0
    };
  },
  watch: {
    /*
    '$data': {
      handler: function(newValue) {
        if(window.mp) {
          window.mp.trigger('veh:setColour', newValue.colorOne, newValue.colorTwo)
          window.mp.trigger('veh:setWheelType', newValue.wheelType)
          window.mp.trigger('veh:setMod', 0, newValue.spoilers);
          window.mp.trigger('veh:setMod', 1, newValue.frontBumper);
          window.mp.trigger('veh:setMod', 2, newValue.rearBumper);
          window.mp.trigger('veh:setMod', 3, newValue.sideSkirt);
          window.mp.trigger('veh:setMod', 4, newValue.exhaust);
          window.mp.trigger('veh:setMod', 5, newValue.frame);
          window.mp.trigger('veh:setMod', 6, newValue.grille);
          window.mp.trigger('veh:setMod', 7, newValue.hood);
          window.mp.trigger('veh:setMod', 8, newValue.fender);
          window.mp.trigger('veh:setMod', 9, newValue.rightFender);
          window.mp.trigger('veh:setMod', 10, newValue.roof);
          window.mp.trigger('veh:setMod', 11, newValue.engine);
          window.mp.trigger('veh:setMod', 12, newValue.brakes);
          window.mp.trigger('veh:setMod', 13, newValue.transmission);
          window.mp.trigger('veh:setMod', 14, newValue.horns);
          window.mp.trigger('veh:setMod', 15, newValue.suspension);
          window.mp.trigger('veh:setMod', 18, newValue.turbo);
          window.mp.trigger('veh:setMod', 22, newValue.xenon);
          window.mp.trigger('veh:setMod', 23, newValue.frontWheels);
          window.mp.trigger('veh:setMod', 25, newValue.plateHolders);
          window.mp.trigger('veh:setMod', 27, newValue.trimDesign);
          window.mp.trigger('veh:setMod', 28, newValue.ornaments);
          window.mp.trigger('veh:setMod', 30, newValue.dialDesign);
          window.mp.trigger('veh:setMod', 33, newValue.steeringWheel);
          window.mp.trigger('veh:setMod', 34, newValue.shiftLever);
          window.mp.trigger('veh:setMod', 35, newValue.plaques);
          window.mp.trigger('veh:setMod', 38, newValue.hydraulics);
          window.mp.trigger('veh:setMod', 40, newValue.boost);
          window.mp.trigger('veh:setMod', 55, newValue.windowTint);
          window.mp.trigger('veh:setMod', 48, newValue.livery);
          window.mp.trigger('veh:setMod', 53, newValue.plate);
        }
      },
      deep: true
    },
    */
    pearlescent(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:pearl', oldType);
      }
    },
    wheelType(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setWheelType', oldType);
      }
    },
    spoilers(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 0, oldType);
      }
    },
    frontBumper(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 1, oldType);
      }
    },
    rearBumper(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 2, oldType);
      }
    },
    sideSkirt(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 3, oldType);
      }
    },
    exhaust(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 4, oldType);
      }
    },
    frame(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 5, oldType);
      }
    },
    grille(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 6, oldType);
      }
    },
    hood(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 7, oldType);
      }
    },
    fender(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 8, oldType);
      }
    },
    rightFender(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 9, oldType);
      }
    },
    roof(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 10, oldType);
      }
    },
    engine(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 11, oldType);
      }
    },
    brakes(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 12, oldType);
      }
    },
    transmission(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 13, oldType);
      }
    },
    horns(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 14, oldType);
      }
    },
    suspension(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 15, oldType);
      }
    },
    turbo(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 18, oldType);
      }
    },
    xenon(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 22, oldType);
      }
    },
    frontWheels(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 23, oldType);
      }
    },
    plateHolders(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 25, oldType);
      }
    },
    trimDesign(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 27, oldType);
      }
    },
    ornaments(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 28, oldType);
      }
    },
    dialDesign(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 30, oldType);
      }
    },
    steeringWheel(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 33, oldType);
      }
    },
    shiftLever(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 34, oldType);
      }
    },
    plaques(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 35, oldType);
      }
    },
    hydraulics(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 38, oldType);
      }
    },
    boost(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 40, oldType);
      }
    },
    windowTint(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 46, oldType);
      }
    },
    livery(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 48, oldType);
      }
    },
    plate(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setMod', 53, oldType);
      }
    },
    colorOne(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setColour', oldType, this.colorTwo);
      }
    },
    colorTwo(oldType, newType) {
      console.log(oldType, newType)
      if(window.mp) {
        window.mp.trigger('veh:setColour', this.colorOne, oldType);
      }
    },
  },
  computed: {
    ...mapGetters({
      basketItems: 'basketData'
    }),
    ...mapMutations({})
  },
  methods: {
    created() {
      this.$store.state.playerInfo.basketItems = []
    },
    addBasketItem(name, modId, type, price) {
      if (this.basketItems.length > 0) {
        var idx = null;
        this.basketItems.find(function(item, i) {
          if (item.name == name) {
            idx = i;
            return;
          }
        });
        if (idx != null) {
          this.basketItems.splice(idx, 1),
            this.basketItems.push({
              name: name,
              modId: modId,
              type: type,
              price: price
            });
        }
        if (idx == null) {
          this.basketItems.push({
            name: name,
            modId: modId,
            type: type,
            price: price
          });
        }
      } else if (this.basketItems.length == 0) {
        this.basketItems.push({
          name: name,
          modId: modId,
          type: type,
          price: price
        });
      }
    },
    removeBasketItem(name) {
      if (this.basketItems.length > 0) {
        console.log(name);
        var idx = null;
        this.basketItems.find(function(item, i) {
          if (item.name == name) {
            idx = i;
            console.log(idx);
          }
        });
        if (idx != null) {
          if(window.mp) { switch(name) {
            case 'Wheel Type':
              {
                window.mp.trigger('veh:setWheelType', this.basketItems[idx].modId, -1)
                this.basketItems.splice(idx, 1);
                break;
              }
            case 'Pearlescent':
              {
                window.mp.trigger('veh:pearl', -1)
                this.basketItems.splice(idx, 1);
                break
              }
            default:
              window.mp.trigger('veh:setMod', this.basketItems[idx].modId, -1)
              this.basketItems.splice(idx, 1);
              break
          }}
          if (this.basketItems.length == 0) {
            global.gui.notify.showNotification(
              "Removed all vehicle mods.",
              false,
              true,
              5000,
              "fa-solid fa-circle-info"
            );
            if(window.mp) {
              window.mp.trigger('veh:resetMods')
              window.mp.trigger('client:modsSave', "[]")
             return
            }
          }
        }
      }
    },
    getPrice() {
      if (this.basketItems.length > 0) {
        var price = 0;
        this.basketItems.forEach(item => {
          price = price + item.price;
        });
        return price.toLocaleString("en-US");
      } else if (this.basketItems.length == 0) {
        return false;
      }
    },
    getVal(value) {
      return value == -1 ? 0 : value;
    },
    formatPrice(num) {
      return num.toLocaleString("en-US");
    },
    close() {
      if (window.mp) {
        window.mp.trigger("closeRoute"), window.mp.trigger("hudTog", false);
        window.mp.trigger('veh:resetMods')
      }
    },
    saveMods() {
      if(window.mp && this.basketItems.length > 0) {
        window.mp.trigger('client:modsSave', JSON.stringify(this.basketItems));
        return
      }
    },
  }
};
</script>


  <style scoped>
* {
  transition-duration: 0.4s;
  transition: 2s;
}

@keyframes fromTop {
  from {
    margin-top: 200vw;
  }
  to {
    margin-top: 10vw;
  }
}

.slide-fade-enter-active {
  transition: all 0.6s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.6s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-10020px);
  opacity: 0;
}

.basketBase {
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
  margin-left: 0.3vw;
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
  -webkit-animation: fromTop 0.5s;
}

/* width */
::-webkit-scrollbar {
  width: 6px;
}

/* Track */
::-webkit-scrollbar-track {
  background: rgba(10, 10, 10, 0);
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #b1a1ff;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #838383;
}

.navOne {
  list-style-type: none;
  margin: 0;
  padding: 0;
  height: 20vw;
  background-color: transparent;
}

.slidescontainer {
  margin-left: 2vw;
  margin-top: 1vw;
  max-width: 10vw;
  line-height: 1vw;
  min-width: 10vw;
  color: white;
  background-color: rgba(1, 1, 1, 0.651);
  padding: 1vw;
  border-radius: 12px;
}

.subText {
  color: #ffffff;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 400;
  font-size: 15px;
  text-align: center;
}

.basketContainers {
  margin-right: 2vw;
  margin-left: 0.3vw;
  margin-top: 1vw;
  line-height: 0.5vw;
  color: white;
  background-color: rgba(1, 1, 1, 0.651);
  padding: 1vw;
  width: 13vw;
}

.basketText {
  color: #ffffff;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 400;
  font-size: 15px;
}

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
  border-left: none;
  transition: 0.5s;
}

/* Change the link color on hover */
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

.addBtn {
  background: transparent;
  border-top: solid rgba(255, 255, 255, 0.311) 2px;
  color: #fffffffb;
  transition-duration: 0.4s;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 650;
  margin-top: auto;
  font-size: 16px;
  padding: 1px;
  width: 6vw;
  transition: 0.5s;
  position: relative;
  margin-top: 0.7vw;
}

.purchaseBtn:hover {
  border-top: solid #6eff7f 6px;
}

.addBtn:hover {
  border-top: solid #6eff7f 2px;
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

.customBase {
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
  transition: 0.5s;
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