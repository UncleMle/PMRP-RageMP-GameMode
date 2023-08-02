<template>
  <div>
    <div v-if="!showLogin" style="background-color:rgb(31,31,31); height:100vw;">
      <navBar name="Paramount Roleplay" :buttons='[{"name": "Panel", "ref": "showLogin", "value": "true"}, {"name": "Forum"}]' style="margin-bottom:10vw;"/>

    </div>

    <div v-if="showLogin" style="background-color:rgb(31,31,31); height:100vw;">
      <navBar name="Paramount Roleplay | Login" :buttons='[{"name": "Landing Page", "ref": "showLogin", "value": null}]' style="margin-bottom:10vw;"/>
      <div>
        <div class="loginPage">
          <div class="headText">Enter your login credentials</div>
        <div class="inputField">
          <input class="user" type="text" placeholder="Enter your username" v-model="username">
        </div>
        <div class="inputField" style="margin-top:.5vw">
          <input class="pass" type="password" placeholder="Enter your password" v-model="password">
        </div>
        <div style="text-align:center; margin-top:1vw;">
          <button @click="login()" class="loginBtn">Login</button>
          <p style="color:red; margin-top:.4vw;">{{response}}</p>
        </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import navBar from './navBar.vue';
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      username: '',
      password: '',
      response: '',
    };
  },
  components: {
    navBar
  },
  computed: {
    ...mapGetters({ showLogin: 'getState' })
  },
  created() {
    console.log(`${window.sessionStorage.getItem('Stoken')}`)
    if(window.sessionStorage.getItem('Stoken') != null) {
      setTimeout(() => {
        fetch('http://127.0.0.1:8081/authtoken', {
          method: 'GET',
          headers: {
            "x-auth-token": window.sessionStorage.getItem('Stoken')
          }
        })
        .then(resp => resp.json())
        .then(json => {
          if(json.status && json.data && json.token && json.serverData) {
            this.$store.state.token = json.token;
            this.$store.state.serverData = json.serverData;
            this.$store.state.playerInfo = [json.data];
            window.sessionStorage.setItem('Stoken', json.token);
            this.$router.push('home');
            return;
          }
        })
      }, 500);
    }
  },
  methods: {
    login() {
      if(this.username.length > 0 && this.password.length > 0) {
        fetch('http://127.0.0.1:8081/login', {
          method: 'POST',
          body: JSON.stringify({
            user: this.username,
            password: this.password,
          }),
          headers: {
            "Content-type": "application/json; charset=UTF-8"
          }
        })
        .then(resp => resp.json())
        .then(json => {
          if(json.status && json.data && json.token && json.serverData) {
            this.$store.state.token = json.token;
            this.$store.state.serverData = json.serverData;
            this.$store.state.playerInfo = [json.data];
            window.sessionStorage.setItem('Stoken', json.token);
            this.$router.push('home');
            return;
          } else {
            this.response = "Please enter valid credentials"
          }
        })
      }
    },

  }
};
</script>

<style>
* {
  font-family: 'Ubuntu', sans-serif;
  color:white;
  transition: all 600ms;
}
*:focus {
  outline: none;
}

.inputField {
  padding:.5vw;
}

.headText {
  padding: 1vw;
  border-bottom: solid 3px rgba(0, 0, 0, 0.198);
  margin-bottom: 1vw;
  color:white;
}

.user, .pass {
  background-color:rgba(0, 0, 0, 0.187);
  border:none;
  padding: 1vw;
  border-radius: 5px;
  max-width: 15vw;
}

.backImg {
  background-image: url('http://i.imgur.com/HuzqKdF.jpg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;

  /* Center and scale the image nicely */
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.user::placeholder, .pass::placeholder {
  color:white;
}

.loginPage {
  background-color: rgb(40,40,40);
  padding: 1vw;
  margin-left:40vw;
  margin-right:40vw;
  border-radius: 10px;
  width:20vw;
  border-bottom: solid 2px rgba(0, 0, 0, 0.198);
  text-align: center;
  color: #2c3e50;
}

.loginBtn {
  background-color: rgba(0, 0, 0, 0.198);
  border:none;
  padding-top: .5vw;
  padding-bottom: .5vw;
  padding-left: 2vw;
  padding-right: 2vw;
  border-radius: 10px;
}
</style>


