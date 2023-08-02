<template>
<div>
  <div style="position:absolute;">
    <div class="uiBase" style="margin-left:33vw; border-top:none; background-image:none; clip-path:none; padding:none; height:17vw; width:33vw;">
      <div>
        <div>
          <div class="layout">

            <div v-for="x in gridItems" :key="x">
              <div>
                <div style="background-color:grey; margin-top:0.5vw; padding:10px; margin-left:0.5vw; margin-right:0.5vw;">
                <div style="text-align:center; background-color:black">
                  <img src="./utils//inventory//img//assaultrifle.png" height="10" width="50" style="margin-left:2vw;">
                </div>
                  <p style="color:white;">Item Name</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  </div>
</div>
</template>


<script>
import { mapGetters, mapMutations } from "vuex";

export default {
  data() {
    return {
      gridItems: 16,
      inventory: [{"id": 1, "name": "Assault Rifle", "img": "https://i.imgur.com/kCG7bOP.png", "ammo": 30, "equipped": false},{"id": 1, "name": "Assault Rifle", "img": "https://i.imgur.com/kCG7bOP.png", "ammo": 30, "equipped": false}, {"id": 2, "name": "Pistol 50", "img": "https://i.imgur.com/J6MQr8G.png", "ammo": 30, "equipped": false}]
    }
  },
  created() {
    //this.$store.state.playerInfo.inventoryItems = []
  },
  computed: {
    ...mapMutations(['clearInventory']),
    ...mapGetters({ inventoryItems: 'inventoryList' }),
  },
  methods: {
    handler: function(e) {
        console.log(e.x, e.y)
        e.preventDefault();
    }
  }
}

</script>

<style>
.layout {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}
</style>

