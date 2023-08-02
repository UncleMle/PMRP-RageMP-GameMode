<template>
    <div>
        <h2 style="position:absolute; margin-left:20vw; margin-top:1vw; background-color:rgb(40,40,40); font-size:20px; padding:1vw; border-radius:10px; width:70vw;">Your Characters</h2>
        <div style="position:absolute; margin-left:20vw; margin-top:6vw; background-color:rgb(40,40,40); font-size:20px; padding:1vw; border-radius:10px; width:70vw;">
            <div style="text-align:center;">
                <loadingSpinner v-if="allCharacters.length == 0 && !queried" />
                <p v-if="allCharacters.length == 0 && queried">You have no characters</p>
                <div v-else-if="!characterManage" style="overflow:scroll; height:40vw; overflow-x:hidden;">
                    <div v-for="cName in allCharacters" :key="cName.id">
                        <div class="character" >
                            <table class="tableOne" cellspacing="2" style="table-layout:fixed; text-align: left; margin-left: 3vw; width:58vw; margin-top:.3vw;">
                                <tr>
                                <th v-if="allCharacters.length > 0">
                                    <i class="fa-solid fa-user"></i> Name: <b style="color:grey">{{ formatName(cName.cName) }}</b><br>
                                    <i class="fa-solid fa-clock"></i> Playtime: <b style="color:grey">{{ Math.floor(cName.playTime/1440) }} days</b><br>
                                    <i class="fa-solid fa-building-columns"></i> Bank: <b style="color:grey">{{ '$'+cName.moneyAmount }}</b><br>
                                </th>
                                <th v-if="allCharacters.length > 0" style="margin-right: 2vw;">
                                    <i class="fa-sharp fa-solid fa-people-group" style="margin-left:0.3vw;"></i> Faction: <b style="color:grey">None</b><br>
                                    <i class="fa-solid fa-notes-medical" style="margin-left:0.3vw;"></i> Health: <b style="color:grey">{{ cName.health }}</b><br>
                                    <i class="fa-solid fa-right-to-bracket" style="margin-left:0.3vw;"></i> Last Active: <b style="color:grey">{{ formatUnixTimestamp(cName.lastActive) }}</b><br>
                                </th>
                                <th v-if="allCharacters.length > 0" style="margin-right: 2vw;">
                                    <i class="fa-solid fa-ban" style="margin-left:0.3vw;"></i> Banned: <b style="color:grey"> {{ cName.banned == 1 ? 'Banned' : 'Not banned'}} </b><br>
                                    <i class="fa-solid fa-burger" style="margin-left:0.3vw;"></i> Hunger: <b style="color:grey">{{ cName.hunger }}</b><br>
                                    <i class="fa-solid fa-bottle-water" style="margin-left:0.3vw;"></i> Thirst: <b style="color:grey">{{ cName.thirst }}</b><br>
                                </th>
                                <th v-if="allCharacters.length > 0" style="margin-right: 2vw;">
                                    <i class="fa-solid fa-briefcase" style="margin-left:0.3vw;"></i> Occupation: <b style="color:grey"> {{ cName.job }} </b><br>
                                    <i class="fa-solid fa-phone" style="margin-left:0.3vw;"></i> Phone: <b style="color:grey">{{ cName.phoneNum }}</b><br>
                                    <i :class="cName.sex === 'female' ? 'fa-solid fa-venus' : 'fa-solid fa-mars'" style="margin-left:0.3vw;"></i> Sex: <b style="color:grey">{{ cName.sex }}</b><br>
                                </th>
                                </tr>
                                <tr>
                                    <th><button @click="manageCharacter(cName.cName)" class="selectButton" style="float:left; margin-bottom: 2vw; background-color:rgba(0, 0, 0, 0.385); padding:.3vw; border-radius:10px;">Manage Character</button></th>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import loadingSpinner from './loadingSpinner.vue';

export default {
    data() {
        return {
            allCharacters: [],
            characterManage: false,
            queried: false
        }
    },
    created() {
        fetch('http://127.0.0.1:8081/characters', {
            method: 'GET',
            headers: {
                "x-auth-token": window.sessionStorage.getItem('Stoken')
            }
        })
        .then(resp => resp.json())
        .then(json => {
            if(json.status) {
                this.allCharacters = json.characters;
                this.queried = true;
                return;
            } else {
                this.error = "Failed to fetch data", window.sessionStorage.setItem('Stoken', null), this.$router.push('login');
            }
        })
    },
    components: {
        loadingSpinner
    },
    methods: {
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
        manageCharacter(character) {
            console.log(character);
        },
    }
}
</script>

<style>
.tableOne {
    width: 100%;
    width: 24vw;
    margin: auto;
    font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
    height: 10vw;
  }

  .character {
    color: #fff;
    height: 9vw;
    font-family: "OSL";
    font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
    font-weight: 700;
    text-align: center;
    margin-top: 1vw;
    font-size: 15px;
    line-height: 1.5vw;
    margin-right: 1vw;


    border-top: solid rgba(255, 255, 255, 0.311) 2px;
    border-bottom: solid rgba(255, 255, 255, 0.311) 2px;
    background-color: rgba(1, 1, 1, .1);
  }
</style>