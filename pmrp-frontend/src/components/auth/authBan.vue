<template>
    <div class="limiter">
        <div>
        <div class="container-login100" style="user-select: none;">
            <div class="wraps-login100" style="padding-bottom: 54px;">
                <div class="banHeaderTxt"><i class="fa-sharp fa-solid fa-circle-exclamation"></i> Access Denied</div>
                <div class="login100-form-title" v-for="bans in banInfo" :key="bans.id">
                        <div class="inserts" style="overflow:scroll; height:27vw; overflow-x: hidden; margin-top: 1.5vw;">
                            <div id="c1" class="character"><i class="fa-solid fa-user" style="color: rgb(177, 177, 177); float: left; margin-top: 0.5vw; margin-left: 0.3vw;"></i><b style="float: left; margin-left: 0.3vw; margin-top: -0.1vw;"> Username </b><b id="cname1" style="float: right; margin-right: 2vw; margin-top: -0.1vw;"> {{banInfo[0].username}} </b>
                            </div>
                            <div id="c1" class="character"><i class="fa-solid fa-computer" style="color: rgb(177, 177, 177); float: left; margin-top: 0.5vw; margin-left: 0.3vw;"></i><b style="float: left; margin-left: 0.3vw; margin-top: -0.1vw;"> IP Address </b><b id="cname1" style="float: right; margin-right: 2vw; margin-top: -0.1vw;"> {{replaceWithAsterisk(banInfo[0].IP)}} </b>
                            </div>
                            <div id="c1" class="character"><i class="fa-solid fa-user-group" style="color: rgb(177, 177, 177); float: left; margin-top: 0.5vw; margin-left: 0.3vw;"></i><b style="float: left; margin-left: 0.3vw; margin-top: -0.1vw;"> Social Club </b><b id="cname1" style="float: right; margin-right: 2vw; margin-top: -0.1vw;"> {{banInfo[0].socialClub}} </b>
                            </div>
                            <div id="c1" class="character"><i class="fa-solid fa-book" style="color: rgb(177, 177, 177); float: left; margin-top: 0.5vw; margin-left: 0.3vw;"></i><b style="float: left; margin-left: 0.3vw; margin-top: -0.1vw;"> Reason </b><b id="cname1" style="float: right; margin-right: 2vw; margin-top: -0.1vw;"> {{banInfo[0].reason}} </b>
                            </div>
                            <div id="c1" class="character"><i class="fa-solid fa-shield" style="color: rgb(177, 177, 177); float: left; margin-top: 0.5vw; margin-left: 0.3vw;"></i><b style="float: left; margin-left: 0.3vw; margin-top: -0.1vw;"> Administrator </b><b id="cname1" style="float: right; margin-right: 2vw; margin-top: -0.1vw;"> {{banInfo[0].admin}} </b>
                            </div>
                            <div id="c1" class="character"><i class="fa-solid fa-calendar-days" style="color: rgb(177, 177, 177); float: left; margin-top: 0.5vw; margin-left: 0.3vw;"></i><b style="float: left; margin-left: 0.3vw; margin-top: -0.1vw;"> Issue Date </b><b id="cname1" style="float: right; margin-right: 2vw; margin-top: -0.1vw;"> {{banInfo[0].issueDate}} </b>
                            </div>
                            <div id="c1" class="character"><i class="fa-solid fa-calendar-xmark" style="color: rgb(177, 177, 177); float: left; margin-top: 0.5vw; margin-left: 0.3vw;"></i><b style="float: left; margin-left: 0.3vw; margin-top: -0.1vw;"> Expiry Date </b><b id="cname1" style="float: right; margin-right: 2vw; margin-top: -0.1vw;"> {{banInfo[0].liftTime}} </b>
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
  methods: {
    ...mapMutations({}),
    replaceWithAsterisk: function(str) {
      var indices = [];
      for (var i = 0; i < str.length; i++) {
        if (!str[i].includes(".")) {
          indices.push(i);
        }
      }
      let res = "";
      res = indices
        .reduce((acc, val) => {
          acc[val] = "*";
          return acc;
        }, str.split(""))
        .join("");
      return res;
    },
  },
  computed: {
    ...mapGetters({
      banInfo: "banInfo"
    })
  }
};
</script>

<style scoped>
* {
  margin: 0px;
  padding: 0px;
}

body,
html {
  height: 100%;
  font-family: Poppins-Regular, sans-serif;
}

/*---------------------------------------------*/
.fas {
  float: left;
  margin-top: 0.8vw;
}

/* width */
::-webkit-scrollbar {
  width: 3px;
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

a {
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-size: 2vw;
  line-height: 1.7;
  color: #ffffff;
  margin-left: 2vw;
  transition: all 0.4s;
  -webkit-transition: all 0.4s;
  -o-transition: all 0.4s;
  -moz-transition: all 0.4s;
  font-weight: 500;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
    1px 1px 0 #000;
}

a:focus {
  outline: none !important;
}

a:hover {
  text-decoration: none;
  color: #a64bf4;
}

.banHeaderTxt {
  color: #ff0000;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 1000;
  text-align: center;
  font-size: 30px;
  background: -webkit-linear-gradient(
    left,
    rgba(10, 10, 10, 0.115),
    rgba(1, 1, 1, 0.651)
  );
  padding: 0.7vw;
  text-align: left;
  border-bottom: solid #ff0000 3px;
  box-shadow:0 0 30px #ff0000;
}

a::after {
  content: "";
  color: #ffffff;

  width: 100%;
  height: 0.2vw;
  background: rgba(220, 171, 255, 20);

  opacity: 0.5;
  border-radius: 20px;
  position: absolute;
  bottom: 0;
  left: 0;
}

s {
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-size: 1vw;
  line-height: 1.7;
  color: #ffffff;
  margin-left: 2vw;
  transition: all 0.4s;
  -webkit-transition: all 0.4s;
  -o-transition: all 0.4s;
  -moz-transition: all 0.4s;
  font-weight: 500;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
    1px 1px 0 #000;
  text-decoration: none;
  text-align: left;
}

s:focus {
  outline: none !important;
}

s:hover {
  text-decoration: none;
  color: #a64bf4;
}

s::after {
  color: #ffffff;

  width: 100%;
  height: 0.2vw;
  background: rgba(220, 171, 255, 20);

  opacity: 0.5;
  border-radius: 20px;
  position: absolute;
  bottom: 0;
  left: 0;
}
s {
  position: relative;
}

/*---------------------------------------------*/

h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0px;
}

p {
  margin-left: 5.2vw;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 500;
  font-size: 1vw;
  color: #adadad;
  margin-top: 1vw;
  margin-right: 65vw;
}

ul,
li {
  margin: 0px;
  list-style-type: none;
}

/*---------------------------------------------*/

input {
  outline: none;
  border: none;
}

textarea {
  outline: none;
  border: none;
}

textarea:focus,
input:focus {
  border-color: transparent !important;
}

input:focus::-webkit-input-placeholder {
  color: transparent;
}

input:focus:-moz-placeholder {
  color: transparent;
}

input:focus::-moz-placeholder {
  color: transparent;
}

input:focus:-ms-input-placeholder {
  color: transparent;
}

textarea:focus::-webkit-input-placeholder {
  color: transparent;
}

textarea:focus:-moz-placeholder {
  color: transparent;
}

textarea:focus::-moz-placeholder {
  color: transparent;
}

textarea:focus:-ms-input-placeholder {
  color: transparent;
}

input::-webkit-input-placeholder {
  color: #adadad;
}

input:-moz-placeholder {
  color: #adadad;
}

input::-moz-placeholder {
  color: #adadad;
}

input:-ms-input-placeholder {
  color: #adadad;
}

textarea::-webkit-input-placeholder {
  color: #adadad;
}

textarea:-moz-placeholder {
  color: #adadad;
}

textarea::-moz-placeholder {
  color: #adadad;
}

textarea:-ms-input-placeholder {
  color: #adadad;
}

/*---------------------------------------------*/

button {
  outline: none !important;
  border: none;
  background: transparent;
}

button:hover {
  cursor: pointer;
}

iframe {
  border: none !important;
}

@keyframes fadein {
  0% {
    opacity: 0;

    transform: scale(0);
  }
  100% {
    opacity: 0.78;

    transform: scale(1);
  }
}

.container-login100 {
  opacity: 0.8;
  width: 100%;
  min-height: 100vh;
  align-items: center;
  padding: 1px;
  height: 20vw;
  user-select: none;
  border: none;
  outline: none;
}

.container-login100:focus {
  border: none;
  outline: none;
}

.character {
  background: -webkit-linear-gradient(right, #3b3b3b, #000000);
  margin-left: 0.4vw;
  color: #fff;
  height: 2vw;
  /*font-family: 'OSL';*/
  border-radius: 10px;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 500;
  text-align: center;
  margin-top: 1vw;
  font-size: 1vw;
  line-height: 2vw;
  justify-content: center;
}

.wraps-login100 {
  width: 25vw;
  border-left: none;
  border-right: none;
  border-top: solid #ff0000 5px;
  border-right: solid rgba(255, 255, 255, 0.311) 2px;
  border-left: solid rgba(255, 255, 255, 0.311) 2px;
  background: -webkit-linear-gradient(
    right,
    rgba(1, 1, 1, 0.651),
    rgba(10, 10, 10, 0.944)
  );
  height: 25vw;
  align-content: center;
  float: center;
  margin-left: 39vw;
  text-align: center;

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

  background-color: #000000ec;
  background-image: url("./assets/image/diagmonds.png");

}

.btn {
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 500;
  color: rgb(255, 255, 255);
  width: 1.5vw;
  border-radius: 0.3vw;
  transition-duration: 0.3s;
  font-size: 0.8vw;
  float: right;
}

.btn:hover {
  color: rgba(255, 255, 255, 0.609);
}

@keyframes fadeout {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.login100-form-title {
  display: block;
  font-family: Poppins-Bold;
  font-size: 39px;
  color: #333333;
  line-height: 1;
  text-align: center;
  margin-top: -2vw;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
    1px 1px 0 #000;
}
</style>