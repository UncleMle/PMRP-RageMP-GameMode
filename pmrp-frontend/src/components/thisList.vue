<template>
        <div id="header" style="user-select: none;">
          <h1></h1>
          <div class="container-login100" style="overflow-x: hidden; overflow-y: hidden;">
            <div class="listMenu">
                <menu-button :menu="'list'" style="position:absolute; color:rgb(255, 255, 255); width: 32vw;"></menu-button>
                <div class="head1"><i :class="name.icon"></i> {{ name.name }}<a></a><p style="margin-top:0.1vw">{{name.subText}}</p></div>
                        <div style="overflow:scroll; height:18vw; overflow-x: hidden; margin-top:0vw">
                            <b v-for="lm in list" :key="lm.id">
                                <div class="insert">
                                  <button class="subIndex" style="float: left;">{{getIndex(lm.id)}}</button><b v-html="lm.name"></b><button v-if="lm.button" class="selectButton" @click="clickHandler(lm.funcs, lm.id)" style="float: right;">Select</button>
                              </div>
                              </b>
                        </div>
                        </div>
                        </div>
            </div>
</template>

<script>
// eslint-disable-next-line
import { mapGetters, mapMutations } from "vuex";
import menuButton from "../components/menuButton.vue";

export default {
  created() {
    this.$store.state.listMenu.list = [];
    this.$store.state.listMenu.table = [];
    this.store.state.listMenu.active = true;
  },
  computed: {
    ...mapGetters({
      list: "menuList",
      name: "menuName"
    }),
    arrLen() {
      return this.list.length;
    }
  },
  components: {
    menuButton
  },
  watch: {
    arrLen() {
      setTimeout(() => {
        if (window.mp && this.list.length == 0 && this.name.name == "View Mods") {
          window.mp.trigger("closeRoute");
        }
        }, 1000)
      }
  },
  methods: {
    clickHandler: function(funcs, itemId) {
      if (window.mp) {
        window.mp.trigger("serverFunctionCEF", funcs, itemId);
        if (this.name.name == "View Mods") {
          var index = null;
          this.list.find(function(item, i) {
            if (JSON.parse(item.id).id == JSON.parse(itemId).id) {
              index = i;
            }
          });
          if (index != null) {
            this.list.splice(index, 1);
          }
        }
        if (this.name.name !== "View Mods") {
          window.mp.trigger("closeRoute");
        }
      }
    },
    ...mapMutations({}),
    getIndex(name) {
      if(this.list.length > 0) {
        var indx = null
        this.list.find(function(item, i) {
          if(item.id == name) {
            indx = i
          }
        })
        return indx+1;
      }
    }
  }
};
</script>


<style scoped>
table {
  margin-left:2vw;
  position:absolute;
  margin-top: 3.6vw;
  padding-right: 3vw;
  padding-left: 3vw;
  background-color: rgba(122, 122, 122, 0.251);
}

th, tr {
  background: transparent;
  color:white;
}

* {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  overflow-x: hidden;
  overflow-y: hidden;
}

.subIndex {
  border-right: solid rgb(183, 119, 255) 3px;
  color: #fffffffb;
  transition-duration: 0.4s;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 650;
  font-size: 16px;
  width: 2vw;
  line-height: 3vw;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: rgba(122, 122, 122, 0.251);
}
.insert {
  background: -webkit-linear-gradient(right, #4b4b4b, #818181);
  color: #fff;
  height: 3vw;
  /*font-family: 'OSL';*/
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 400;
  src: url("../assets/fonts/OSL.ttf") format("truetype");
  text-align: center;
  margin-top: 0.3vw;
  font-size: 18px;
  line-height: 3vw;

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

  background-color: #000000f9;
  background-image: url("../assets/img/diagmonds.png");
}

.selectButton {
  background: transparent;
  border-top: solid rgba(220, 171, 255, 20) 3px;
  color: #fffffffb;
  transition-duration: 0.4s;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 650;
  font-size: 16px;
  width: 4vw;
  height: 1.5vw;
  margin-top: 0.8vw;
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

  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.selectButton:hover {
  border-top: solid rgba(140, 255, 117, 20) 3px;
}

/* width */
::-webkit-scrollbar {
  width: 5px;
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

.listMenu {
  opacity: 1;
  width: 17vw;
  border-top: solid rgb(183, 119, 255) 5px;
  /*border-right: solid rgba(255, 255, 255, 0.311) 2px;
    border-left: solid rgba(255, 255, 255, 0.311) 2px;
    border-radius: 10px;
    */
  height: 25vw;
  /*border-image: linear-gradient(45deg, rgba(220, 171, 255, 20), rgba(220, 171, 255, 90)) 1;*/
  /*background-color: rgba(0, 0, 0, 0.85);*/
  color: rgba(10, 10, 10, 0.644);
  background: -webkit-linear-gradient(
    right,
    rgba(10, 10, 10, 0.944),
    rgba(1, 1, 1, 0.651)
  );
  position: absolute;
  margin-top: 11vw;
  margin-left: 70vw;

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
  /*
    background-color: #000000ec;
    background-image: url("../assets/img/diagmonds.png");
*/
  background: transparent;
}

.head1 {
  color: #fff;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 1000;
  text-align: center;
  font-size: 23px;
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

  background-color: #000000f9;
  background-image: url("../assets/img/diagmonds.png");
}

th {
  background: -webkit-linear-gradient(right, #929292, #929292);
  border-radius: 5px;
  color: #000000;
  max-width: 5vw;
  word-wrap: break-word;
}
td {
  text-align: center;
  background-color: rgb(156, 156, 156);
  font-weight: 650;
}

.btn {
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 600;
  src: url("../assets/fonts/OSL.ttf") format("truetype");
  font-size: 0.7vw;
  color: white;
  width: 2vw;
  position: absolute;
  margin-left: 12.5vw;
  margin-top: 0.23vw;
  border-radius: 0.3vw;
  transition-duration: 0.4s;
  border: none;
}
</style>