<template>
    <div v-if="hudState && keys[0].alt" style="position:absolute;">
        <div class="buttons" style="margin-top:28vw; margin-left:1.5vw; ">
            <div style="margin-top:1vw;">
                <p style="color:white;"><font style="background-color:transparent; padding:.3vw; border-radius:10px; border: solid 1px white; padding-left:.5vw; padding-right:.5vw; font-weight:600; box-shadow: 2px 2px 23px 0px rgb(0, 0, 0);">X</font> <font style="margin-left:.5vw; ">Puts hands up / Cancels Animation</font></p>
            </div>
            <div style="margin-top:1.5vw;">
                <p style="color:white;"><font style="background-color:transparent; padding:.3vw; border-radius:10px; border: solid 1px white; padding-left:.5vw; padding-right:.5vw; font-weight:600; box-shadow: 2px 2px 23px 0px rgb(0, 0, 0);">ALT</font> <font style="margin-left:.5vw;">Brings up anim menu</font></p>
            </div>
            <div style="margin-top:1.5vw;">
                <p style="color:white;"><font style="background-color:transparent; padding:.3vw; border-radius:10px; border: solid 1px white; padding-left:.5vw; padding-right:.5vw; font-weight:600; box-shadow: 2px 2px 23px 0px rgb(0, 0, 0);">F2</font> <font style="margin-left:.5vw;">Toggle Cursor</font></p>
            </div>
            <div style="margin-top:1.5vw;">
                <p style="color:white;"><font style="background-color:transparent; padding:.3vw; border-radius:10px; border: solid 1px white; padding-left:.5vw; padding-right:.5vw; font-weight:600; box-shadow: 2px 2px 23px 0px rgb(0, 0, 0);">F5</font> <font style="margin-left:.5vw;">Help Menu</font></p>
            </div>
            <div v-if="keys[0].staff > 0" style="margin-top:1.5vw;">
                <p style="color:white;"><font style="background-color:transparent; padding:.3vw; border-radius:10px; border: solid 1px rgb(255, 33, 33); padding-left:.5vw; padding-right:.5vw; font-weight:600; box-shadow: 2px 2px 23px 0px rgb(0, 0, 0);">F4</font> <font style="margin-left:.5vw; color:rgb(255, 255, 255);">Toggles No clip</font></p>
            </div>
            <div v-if="keys[0].staff > 0" style="margin-top:1.5vw;">
                <p style="color:white;"><font style="background-color:transparent; padding:.3vw; border-radius:10px; border: solid 1px rgb(255, 33, 33); padding-left:.5vw; padding-right:.5vw; font-weight:600; box-shadow: 2px 2px 23px 0px rgb(0, 0, 0);">F9</font> <font style="margin-left:.5vw; color:rgb(255, 255, 255);">Opens Admin System</font></p>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            arrPos: 0,
            allAnims: [
                {"name": "Test One"},
                {"name": "Test Two"},
                {"name": "Test Three"},
                {"name": "Test Four"}
            ]
        }
    },
    created() {
        document.addEventListener("keydown", this.addKeyListener);
    },
    watch: {
        keys(oldType) {
            if(!this.keys[0].alt) return;
            if(oldType[0].wheelUp) {
                this.arrPos >= this.allAnims.length-1 ? this.arrPos = 0 : "";

                this.arrPos += 1
            } else if(oldType[0].wheelDown) {
                this.arrPos <= 0 ? this.arrPos = 0 : this.arrPos -= 1;
            }
        }
    },
    methods: {
        addKeyListener(event) {
            if(event.keyCode == 16) {
                console.log('Shift pressed');
                console.log(`Anim Data: ${JSON.stringify(this.allAnims[this.arrPos])}`);
            }
        }
    },
    computed: {
        ...mapGetters({ hudState: 'getHudState' }),
        ...mapGetters({ keys: 'getPhoneKeys' })
    },

}
</script>

<style scoped>
* {
    transition-duration: .4s;
}
</style>

