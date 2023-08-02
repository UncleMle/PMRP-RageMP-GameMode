<template>
    <nav class="bg-white border-gray-200  bg-gradient-to-r  from-purple-600  via-purple-400  to-purple-400">
        <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a class="flex items-center">
              <img src="https://i.imgur.com/jBJbX3Q.png" class="h-8 mr-3" alt="Flowbite Logo" />
              <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">{{name}}</span>
          </a>
          <div class="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul class="font-medium flex flex-col p-4 md:p-0 mt-4 border md:flex-row md:space-x-8 md:mt-0 md:border-0">
                <div v-for="item in buttons" :key="item.name">
                  <button style="background-color:rgba(1, 1, 1, .5); padding:.5vw; border-radius:10px;" @click="stateShift(item.ref, item.value)">{{item.name}}</button>
                </div>
            </ul>
          </div>
        </div>
      </nav>
</template>

<script>

export default {
  props: ['name', 'buttons'],
  methods: {
    stateShift(stateItem, value) {
      this.$store.state[stateItem] = value;
    }
  }
}
</script>