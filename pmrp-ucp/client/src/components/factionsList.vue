<template>
    <div>
        <h2 style="position:absolute; margin-left:20vw; margin-top:1vw; background-color:rgb(40,40,40); font-size:20px; padding:1vw; border-radius:10px; width:70vw;">Factions</h2>
        <div style="position:absolute; margin-left:20vw; margin-top:6vw; background-color:rgb(40,40,40); font-size:20px; padding:1vw; border-radius:10px; width:70vw;">
            <div style="text-align:center;">
                <loadingSpinner v-if="factionData.length == 0" />
            </div>
        </div>
    </div>
</template>

<script>
import loadingSpinner from './loadingSpinner.vue';

export default {
    data() {
        return {
            factionData: []
        }
    },
    components: {
        loadingSpinner
    }
}
</script>