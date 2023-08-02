<template>
<Transition name="slide-fade">
    <div v-if="showBar" style="position:absolute">
            <div class="barWrapper">
                <h4 style="margin-top: 0.5vw; position:absolute; margin-left: 21vw;">{{progText}} {{currentPercent+'%'}}</h4>
                <div id="bar" style="color:white;" :style="{ 'width': (currentPercent)+'%', 'background-color': (colour) }"><b> </b></div>
        </div>
    </div>
</Transition>
</template>

<script>
export default {
    data() {
        return {
            showBar: false,
            progText: '',
            currentPercent: 100,
            colour: 'rgba(0, 255, 42, 0.538)',
        }
    },
    methods: {
        startProgress(text, time) {
            this.showBar = !this.showBar;
            var totalTime = time;
            this.progText = text;
            var progressInt = setInterval(() => {
                if(totalTime == 0) return clearInterval(progressInt), this.showBar = false, this.colour = 'rgba(0, 255, 42, 0.538)', this.currentPercent = 100;
                this.currentPercent = Math.trunc((totalTime / time)*100);
                const timeValues = [60, 50, 20, 15];
                const colourValues = ['rgba(123, 255, 0, 0.538)', 'rgba(238, 255, 81, 0.538)', 'rgba(255, 156, 81, 0.538)', 'rgba(255, 81, 81, 0.538)'];

                timeValues.find((item, i) => {
                    if(this.currentPercent <= item) {
                        this.colour = colourValues[i];
                        return;
                    }
                })

                totalTime--;
            }, 1000);
        }
    },
}

</script>

<style>
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

.barWrapper {
    text-align: center;
    color: white;
    margin-left: 25vw;
    margin-right: 25vw;
    margin-top: 40vw;
    background-color: rgba(0, 0, 0, 0.353);
    border-radius: 10px;
    width: 50vw;
    height: 2vw;
}
#bar {
    float: right;
    transition-duration: 2s;
    height: 2vw;
    border-radius: 10px;
}

</style>