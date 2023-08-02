<template>
    <div>
        <h2 style="position:absolute; margin-left:20vw; margin-top:1vw; background-color:rgb(40,40,40); font-size:20px; padding:1vw; border-radius:10px; width:70vw;">Punishments</h2>
        <div style="position:absolute; margin-left:20vw; margin-top:6vw; padding:1vw; background-color:rgb(40,40,40); border-radius:10px; width:70vw;">
            <div style="text-align:center;">
                <loadingSpinner v-if="allPunishments.length == 0 && !queried" />
                <p v-if="allPunishments.length == 0 && error.length == 0 && queried" style="color:white">You do not have any admin punishments Well done :]</p>
            </div>
            <p style="color:red">{{error}}</p>

            <table v-if="allPunishments.length > 0" style="margin-left:8vw; width:50vw; margin-right:10vw;">
                <tr>
                  <th style="min-width:2vw; background-color:rgba(0, 0, 0, 0.182); border-radius:10px 0px 0px 10px;">ID</th>
                  <th style="min-width:5vw; background-color:rgba(0, 0, 0, 0.182);">Issue Date</th>
                  <th style="min-width:8vw; background-color:rgba(0, 0, 0, 0.182);">Administrator</th>
                  <th style="min-width:8vw; background-color:rgba(0, 0, 0, 0.182);">Type</th>
                  <th style="min-width:8vw; background-color:rgba(0, 0, 0, 0.182);">Reason</th>
                  <th style="min-width:8vw; background-color:rgba(0, 0, 0, 0.182); border-radius:0px 10px 10px 0px;">Void</th>
                </tr>
                <tr v-for="item in allPunishments" :key="item">
                  <td style="text-align:center;">{{item.id}}</td>
                  <td style="text-align:center;">{{formatUnix(item.time)}}</td>
                  <td style="text-align:center; border-radius:10px;" >{{item.adminName}}</td>
                  <td style="text-align:center; border-radius:10px;" >{{item.action}}</td>
                  <td style="text-align:center; border-radius:10px;" >{{item.log}}</td>
                  <td style="text-align:center; border-radius:10px;" >{{item.voided == 1 ? 'Voided' : 'Not Voided'}}</td>
                </tr>
              </table>
        </div>
    </div>
</template>

<script>
import loadingSpinner from './loadingSpinner.vue';

export default {
    data() {
        return {
            allPunishments: [],
            error: "",
            queried: false
        }
    },
    components: {
      loadingSpinner
    },
    created() {
        if(!window.sessionStorage.getItem('Stoken')) return;
        fetch('http://127.0.0.1:8081/punishments', {
          method: 'GET',
          headers: {
            "x-auth-token": window.sessionStorage.getItem('Stoken')
          }
        })
        .then(resp => resp.json())
        .then(json => {
            console.log(`${json.data}`)
          if(json.status && json.data) {
            this.allPunishments = json.data;
            this.queried = true;
            return;
          } else {
            this.error = "Failed to fetch data", window.sessionStorage.setItem('Stoken', null), this.$router.push('login');
          }
        })
    },
    methods: {
        formatUnix(unix) {
            const date = new Date(unix * 1000)
            const hours = date.getHours()
            const minutes = date.getMinutes()
            const seconds = date.getSeconds()
            return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
        }
    }
}
</script>

<style scoped>
table, th, td {
    border-collapse: separate;
    border-spacing: 0 20px;
  }

</style>