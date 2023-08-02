<template>
    <div>
        <h2 style="position:absolute; margin-left:20vw; margin-top:1vw; background-color:rgb(40,40,40); font-size:20px; padding:1vw; border-radius:10px; width:70vw;">Settings</h2>

        <div style="position:absolute; background-color:rgb(40,40,40); margin-left:20vw; margin-top:6vw; padding:1vw; width:70vw; border-radius:10px;">
            <div>
            </div>
            <button @click="logout()" class="uiButton">Logout of session</button>
        </div>
    </div>
</template>

<script>
export default {
    methods:{
        logout() {
            window.sessionStorage.setItem('Stoken', null);
            this.$store.state.token = null;
            this.$store.state.serverData = null;
            this.$store.state.playerInfo = null;
            this.$router.push('login');
        }
    }
}
</script>

<style>
input:focus + .slider {
  box-shadow: 0 0 1px #2196f3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: #2196f3;
}
</style>