<template>
    <button class="menuButton" v-on:click="close()"><b><i class="fa-solid fa-xmark"></i></b></button>
</template>

<script>
export default {
    props: ['menu'],
    methods: {
        close() {
            if(window.mp) {
                window.mp.trigger('closeRoute');
            }
            if(this.menu == 'list') {
                this.$store.state.listMenu.active = false;
            }
        }
    }
}
</script>

<style scoped>
.menuButton {
    font-family: 'OSL';
    font-family:Myriad Pro,Segoe UI,Verdana,sans-serif;
    font-weight: 600;
    src: url('../assets/fonts/OSL.ttf') format('truetype');    font-size: 0.9vw;
    color: white;
    border-radius: 0.3vw;
    transition-duration: 0.4s;
    border: none;
}
.menuButton:hover {
    color: rgba(255, 255, 255, 0.307);
}
</style>