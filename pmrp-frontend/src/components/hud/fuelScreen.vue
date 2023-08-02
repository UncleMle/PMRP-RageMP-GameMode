<template>
<Transition name="slide-fade">
    <div v-if="showDisplay" class="displayBack" style="position:absolute;">
        <div class="liters">
            <p class="subTextTitle">Liters</p>
            <p><font class="digiFont" style="margin-left:3vw;">{{ liters }}</font></p>
        </div>
        <div class="salePrice" style="margin-top:0.5vw;">
            <p class="subTextTitle">Sale $</p>
            <p><font class="digiFont" style="margin-left:3vw;">{{ formatNum(salePrice) }}</font></p>
        </div>
    </div>
</Transition>
</template>

<script>
export default {
    data() {
        return {
            showDisplay: false,
            liters: 0,
            salePrice: 0
        }
    },
    methods: {
        fuelToggle(tog) {
            switch(tog) {
                case true:
                {
                    this.showDisplay = true;
                    break;
                }
                case false:
                {
                    this.showDisplay = false;
                    break;
                }
                default:
                    break;
            }
        },
        updateDisplay(liter, price) {
            this.liters = liter;
            this.salePrice = price;
        },
        formatNum(price) {
            price = price.toLocaleString('en-US').replace(/,/g, '.')
            return price;
        }
    }

}

</script>

<style>
@font-face {
    font-family: "digital-counter-7";
    src: url('./assets/digital-counter-7.ttf');
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

.displayBack {
    background-color: rgba(128, 128, 128, 0.711);
    width: 18%;
    text-align: center;
    margin-top: 28vw;
    min-height: 4vw;
    border-radius: 10px;
    margin-left: 0.2vw;
    padding: 0.4vw;
}

.digiFont {
    font-family: "digital-counter-7", sans-serif;
    font-size: 20px;
    font-weight: 680;
    color:rgba(0, 0, 0, 0.616);
}

.subTextTitle {
    background-color: rgba(0, 0, 0, 0.603);
    color:white;
    width: 30%;
    height: inherit;
    position: absolute;
    border-radius: 10px 5px 0px;
    line-height: 2vw;
}

.liters, .salePrice {
    height: 2vw;
    background-color: rgba(90,96,84, 0.8);
    border-radius: 10px;
}
</style>