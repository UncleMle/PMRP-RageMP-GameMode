<template>
    <div class="limiter" style="user-select: none;">
        <div class="container-charSelect">
          <div v-if="charNames.length > 0" class="selectionBase" style="margin-left:2vw; position:absolute; height:14vw;">
            <div class="headerSelect"><i class="fa-solid fa-user"></i> Your Account Information <p style="margin-top:0.3vw">Information for account {{ charNames[0].accName }}</p></div>
            <div style="line-height:2vw; padding-bottom:1vw;">
              <p style="margin-top:0.5vw; color:rgba(255, 255, 255, 0.576); margin-left:0.3vw; font-size:0.9vw;">Referral Code <font style="float:right; margin-right:0.6vw; color:white;">{{ charNames[0].referral }}</font></p>
              <p style="margin-top:0.5vw; color:rgba(255, 255, 255, 0.576); margin-left:0.3vw; font-size:0.9vw;">Creation Date <font style="float:right; margin-right:0.6vw; color:white; font-size:0.9vw;">{{ cut(charNames[0].creation) }}</font></p>
              <p style="margin-top:0.5vw; color:rgba(255, 255, 255, 0.576); margin-left:0.3vw; font-size:0.9vw;">Total Hours Played <font style="float:right; margin-right:0.6vw; color:white; word-wrap: break-word;">{{ formatNum(charNames[0].totalHours) }}</font></p>
              <p style="margin-top:0.5vw; color:rgba(255, 255, 255, 0.576); margin-left:0.3vw; font-size:0.9vw;">Total Credits <font style="float:right; margin-right:0.6vw; color:rgba(255, 223, 63, 0.835); word-wrap: break-word;">${{ formatNum(charNames[0].adminPunishments) }}</font></p>
            </div>
          </div>
          <div class="selectionBase" style="margin-left:2vw; position:absolute; height:33vw; margin-top:17vw; background-color:transparent; background-image: url('...'); border-bottom: none;">
            <div class="headerSelect" style="background-color: #000000b1; background-image: url('./assets/image/diagmonds.png');"><i class="fa-solid fa-envelope"></i> Notifications <p style="margin-top:0.3vw">Administrator and account related notificiations </p></div>
            <div style="padding-bottom:1vw; overflow:scroll; height:41vw; overflow-x: hidden;">
              <div v-if="accNotifs.length > 0">
                <div v-for="notif in accNotifs" :key="notif.id">
              <div style="background-color:rgba(158, 158, 158, 0.305); padding:0.5vw; margin-top:0.5vw; margin-left:0.2vw; background-color: #0000009a; background-image: url('./assets/image/diagmonds.png'); border-bottom: solid grey 3px;">
                <p style="color:rgb(255, 255, 255); margin-left:0.3vw; font-size:0.9vw; word-wrap:break-word;">{{notif.text}}<font style="float:right; margin-right:0.6vw; color:white;"><button @click="clearNotif(notif.id)"><i class="fa-sharp fa-solid fa-circle-check" style="color:rgba(145, 255, 145, 0.887); font-size:0.8vw;"></i></button></font></p>
              </div>
                </div>
              </div>
              <div v-else>
                <div style="background-color:rgba(158, 158, 158, 0.305); padding:0.5vw; margin-top:0.5vw; margin-left:0.2vw; background-color: #0000009a; background-image: url('./assets/image/diagmonds.png'); border-bottom: solid grey 3px;">
                  <p style="color:rgb(255, 255, 255); margin-left:0.3vw; font-size:0.9vw; word-wrap:break-word;">You have no pending notifications<font style="float:right; margin-right:0.6vw; color:white;"></font></p>
                </div>
              </div>
            </div>
          </div>
        <div class="selectionBase" style="background-color:transparent; background-image:none;">
            <div class="headerSelect" style="background-color:rgba(1, 1, 1, 0.7);"><i class="fa-solid fa-user-group"></i> Character Selection
              <p v-if="charNames[0].name" style="margin-top:0.3vw;">Select your character {{ charNames.length }} {{ charNames.length == 0 ? `/ 2` : `/ ${charNames[0].max}` }}</p>
              <p v-else style="margin-top:0.4vw;">You have no characters. Click on the Create Character button to create one.</p>
            </div>
            <div v-if="charNames[0].name" class="characterCluster" style="overflow:scroll; height:41vw; overflow-x: hidden;">
                <b v-for="cName in charNames" :key="cName.id">
                  <div class="character">
                    <table class="tableOne" cellspacing="2" style="table-layout:fixed; text-align: left; margin-left: 0.1vw;">
                        <tr>
                          <th v-if="charNames.length > 0">
                            <i class="fa-solid fa-user"></i> Name: <b style="color:grey">{{ formatName(cName.name) }}</b><br>
                            <i class="fa-solid fa-clock"></i> Playtime: <b style="color:grey">{{ cName.hours }} days</b><br>
                            <i class="fa-solid fa-building-columns"></i> Bank: <b style="color:grey">{{ '$'+cName.bank }}</b><br>
                        </th>
                        <th v-if="charNames.length > 0" style="margin-right: 2vw;">
                            <i class="fa-sharp fa-solid fa-people-group" style="margin-left:0.3vw;"></i> Faction: <b style="color:grey">{{ cName.faction }}</b><br>
                            <i class="fa-solid fa-notes-medical" style="margin-left:0.3vw;"></i> Health: <b style="color:grey">{{ cName.hp }}</b><br>
                            <i class="fa-solid fa-right-to-bracket" style="margin-left:0.3vw;"></i> Last Active: <b style="color:grey">{{ formatUnixTimestamp(cName.lastPlayed) }}</b><br>
                        </th>
                        </tr>
                          <tr>
                            <th><button class="selectButton" @click="previewCharacter(cName.name)" style="float:left; margin-bottom: 2vw;"><i style="color:rgb(183, 119, 255)" class="fa-solid fa-eye"></i></button></th>
                            <th><button class="selectButton" @click="playerCharacter(cName.name)" style="float:left; margin-bottom: 2vw;"><i class="fa-solid fa-play"></i></button></th>
                          </tr>
                      </table>
                </div>
                </b>
            </div>
            <b v-if="charNames.length==0 || !charNames[0].name"><div class="headSelect" style="color:grey; font-weight: 500;">You don't have any characters.</div></b>
          </div>
        <button class="createCharBtn" style="margin-top:1vw;" @click="goToCharCreation()">Create Character</button>
      </div>
    </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

export default {
  computed: {
    ...mapGetters({
      charNames: "charactersList",
      accNotifs: "selectNotifs"
    }),
    ...mapMutations({})
  },
  methods: {
    playerCharacter(name) {
      if (window.mp) {
        window.mp.trigger(`serverFunctionCEF`, "load:character", name);
        window.mp.trigger("client:loginHandler", ["success"]);
      }
    },
    goToCharCreation() {
      if(window.mp) {
        window.mp.trigger('serverFunctionCEF', 'characterCreationStart')
      }
    },
    previewCharacter(name) {
      if (window.mp) {
        window.mp.trigger(`serverFunctionCEF`, "previewCharacter", name);
      }
    },
    formatUnixTimestamp(unixTimestamp) {
      let date = new Date(unixTimestamp * 1000);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    },
    formatName(name) {
      return name.replace('_', ' ')
    },
    formatNum(num) {
      return num.toLocaleString('en-US')
    },
    clearNotif(id) {
      var idx = null;
      this.accNotifs.length == 0 ? id = id-1 : '_';
      this.accNotifs.find(function(item, i) {
        if(id == i) { idx = i }
      })
      if(idx != null && window.mp) {
        this.accNotifs.splice(idx, 1);
        window.mp.trigger('serverFunctionCEF', 'clearAccNotif', idx);
      }
    },
    cut(string) {
      var newStr = []
      for(var x = 0; x < string.length-30; x++) {
        newStr.push(string[x]);
      }
      return newStr.join('')
    }
  }
};
</script>

<style scoped>
* {
  background-color: transparent;
  user-select: none;
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari, Chrome, Opera, Samsung */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Edge, IE */
  user-select: none; /* Modern browsers */
  outline: none;
}
/*rgba(210, 133, 255, 0.822)     border-radius: 0px 0px 5px 5px;
*/

body::-webkit-scrollbar {
  display: none;
} /* Chrome, Safari and Opera */
body {
  -ms-overflow-style: none;
} /* IE and Edge */
html {
  scrollbar-width: none;
} /* Firefox */
body:focus {
  border: none;
}
.tableOne {
  width: 100%;
  width: 24vw;
  margin: auto;
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  background: -webkit-linear-gradient(
    right,
    rgba(10, 10, 10, 1),
    rgba(1, 1, 1, 0.851)
  );
  height: 10vw;
}
.selectButton {
  border: none;
  color: #00ff99fb;
  height: 0.1vw;
  transition-duration: 0.4s;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 1000;
  margin-left: 4.4vw;
  margin-top: -0.1vw;
  font-size: 30px;
}

.createCharBtn {
  border-top: solid rgba(220, 171, 255, 20) 6px;
  color: #fffffffb;
  transition-duration: 0.4s;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 650;
  margin-top: 0.5vw;
  margin-left: 70.99vw;
  font-size: 20px;
  padding: 20px;
  width: 23vw;
  --notchSize: 14px;

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
  background-color: #000000ec;
  background-image: url("./assets/image/diagmonds.png");
}

.createCharBtn:hover {
  border-top: solid rgba(140, 255, 117, 20) 6px;
}
.character {
  background: -webkit-linear-gradient(right, #4b4b4b, #d8d8d864);
  color: #fff;
  height: 10vw;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 700;
  text-align: center;
  margin-top: 1vw;
  font-size: 15px;
  line-height: 1.5vw;
  margin-left: 0.2vw;
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

  border-top: solid rgba(255, 255, 255, 0.311) 2px;
  background: -webkit-linear-gradient(
    right,
    rgba(1, 1, 1, 0.651),
    rgba(10, 10, 10, 0.944)
  );
}

/* width */
::-webkit-scrollbar {
  width: 6px;
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

.selectionBase {
  opacity: 1;
  width: 23vw;
  border-top: solid rgba(220, 171, 255, 20) 6px;
  height: 44vw;
  border-radius: 15px;
  /*background-color: rgba(0, 0, 0, 0.85);*/
  margin-top: 2vw;
  margin-left: 71vw;

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
  border-top: solid rgb(183, 119, 255) 5px;
  background-color: #000000ec;
  background-image: url("./assets/image/diagmonds.png");
}

.headSelect {
  color: #fff;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 1000;
  text-align: center;
  margin-top: 2vw;
  font-size: 27px;
  line-height: 1vw;
}

.headerSelect {
  color: #fff;
  font-family: "OSL";
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 1000;
  text-align: center;
  font-size: 23px;
  line-height: 1vw;
  background: -webkit-linear-gradient(
    left,
    rgba(10, 10, 10, 0.115),
    rgba(1, 1, 1, 0.651)
  );
  text-align: left;
  border-bottom: solid rgb(183, 119, 255) 3px;
  box-shadow:0 0 30px rgba(183, 119, 255, 0.69);
  padding: 1vw;
  padding-bottom: 0.5vw;
  padding-top: 0.7vw;
}

.container-charSelect {
  opacity: 0.8;
  min-height: 10vh;

  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 15px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  height: 40vw;
  /*-webkit-animation: fadein 2s;*/
}

a::after {
  display: block;
  content: "";
  width: 100%;
  height: 0.2vw;
  background: rgba(220, 171, 255, 20);
  opacity: 0.5;
  border-radius: 20px;
  position: absolute;
  bottom: 0;
  left: 0;
}
a {
  position: relative;
}

th {
  background-color: rgba(35, 35, 35, 0.326);
  margin-right: 2vw;
}
td {
  text-align: center;
  background-color: rgb(156, 156, 156);
  font-weight: 650;
  max-width: 20vw;
  word-wrap: break-word;
}
</style>