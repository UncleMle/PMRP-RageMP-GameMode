<template>
    <div>
        <h2 style="position:absolute; margin-left:20vw; margin-top:1vw; background-color:rgb(40,40,40); font-size:20px; padding:1vw; border-radius:10px; width:70vw;">Staff Team</h2>
        <div style="position:absolute; margin-left:20vw; margin-top:6vw; background-color:rgb(40,40,40); font-size:20px; padding:1vw; border-radius:10px; width:70vw;">
            <div style="text-align:center;">
                <loadingSpinner v-if="staffMembers.length == 0" />
            </div>

            <div>
            <table v-if="staffMembers.length > 0" style="margin-left:8vw; width:50vw; margin-right:10vw;">
                <tr>
                  <th style="min-width:2vw; background-color:rgba(0, 0, 0, 0.182); border-radius:10px 0px 0px 10px;">ID</th>
                  <th style="min-width:10vw; background-color:rgba(0, 0, 0, 0.182); ">Name</th>
                  <th style="min-width:8vw; background-color:rgba(0, 0, 0, 0.182); border-radius:0px 10px 10px 0px;">Level</th>
                </tr>
                <tr v-for="item in staffMembers" :key="item">
                  <td style="text-align:center;">{{getIndex(item.name)}}</td>
                  <td style="text-align:center;">{{item.name}}</td>
                  <td style="text-align:center; border-radius:10px;" :style="{'background-color': adminColours[item.level]}" >{{getLevel(item.level)}}</td>
                </tr>
              </table>
            </div>
        </div>
    </div>
</template>

<script>
import loadingSpinner from './loadingSpinner.vue';

export default {
    data() {
        return {
            staffMembers: "",
            adminRanks: ['None', 'Support', 'Senior Support', 'Moderator', 'Senior Moderator', 'Administrator', 'Senior Administrator', 'Head Administrator', 'Owner'],
            adminColours: ['', '#ff00fa', '#9666ff', '#37db63', '#018a35', '#ff6363', '#ff0000', '#00bbff', '#FFD700']
        }
    },
    created() {
        fetch('http://127.0.0.1:8081/staffteam', {
          method: 'GET',
          headers: {
            "x-auth-token": window.sessionStorage.getItem('Stoken')
          }
        })
        .then(resp => resp.json())
        .then(json => {
          if(json.admins) {
            this.staffMembers = json.admins;
            return;
          } else {
            this.response = "Please enter valid credentials"
          }
        })
    },
    components: {
        loadingSpinner
    },
    methods: {
        getIndex(item) {
            var idx = null
            this.staffMembers.find(function(it, i) {
                if(it.name == item) {
                    idx = i;
                }
            })
            return idx == null ? -1 : idx;
        },
        getLevel(idx) {
            return this.adminRanks[idx];
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