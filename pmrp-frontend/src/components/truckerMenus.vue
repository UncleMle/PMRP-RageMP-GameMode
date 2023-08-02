<template>
    <div class="h-screen flex items-center justify-center">
        <div class="drop-shadow-2xl border-t-1 border-gray-300 rounded-lg">
            <div id="main" class="rounded-lg">
                <h2 class=" backdrop-blur-sm p-4 rounded-lg mb-3 font-bold text-white drop-shadow-2xl"><i class="fa-solid fa-bars"></i> Header Text</h2>
            </div>
            <div class=" overflow-y-auto overflow-x-hidden  max-h-32">
                <div v-for="item in arr" :key="item" class=" mt-2 ">
                    <div class="backdrop-blur-3xl bg-purple-700/40 rounded-lg p-3 w-96 h-13...">
                        <p>Example Text</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>


export default {
  data() {
    return {
      arr: [2, 4, 5, 6, 6, 1, 2, 3, 3]
    };
  }
};
</script>

<style scoped>
#main {
  background-image: url("https://img.freepik.com/premium-vector/gradient-geometric-honeycomb-shapes-background_23-2148431519.jpg?w=360");
  background-blend-mode: lighten;
}
</style>