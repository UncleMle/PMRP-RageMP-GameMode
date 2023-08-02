<template>
    <div v-if="hudShow">
        <div style="position:absolute">
            <div class=" w-2 mr-6 pl-2 absolute" style="background-size:contain; background-repeat:no-repeat; border-radius: 35px; width:14vw; height:23vw; margin-left:67.2vw; margin-top:33vw;">
                <div class="bg-gray-500 w-5 mt-9"></div>
            </div>

            <div class="phoneBody" style="position:relative; background-image: url(https://wallpaperaccess.com/full/623479.jpg); height:0; background-size:contain; background-repeat:no-repeat; width:100%; border-radius: 35px; width:12.5vw; height:23vw; margin-left:68vw; border: solid 2px rgb(210, 210, 210);" :style="phoneOpen">

                <div>

                    <div style="text-align:center; margin-left:.5vw; margin-right:.5vw;">
                        <div v-if="notifMsg && notifIcon" style="text-align:center;">
                            <div style="margin-top:.5vw; height:1vw; margin-right:vw; text-align:center; border-radius:20px;">
                                <p style="color:white; border-radius:20px;" class="backdrop-blur-xl bg-white/30 ..."><i :class="notifIcon"></i> {{notifMsg}}</p>
                            </div>
                        </div>
                    </div>

                    <button @click="showPhone()" style="text-align:center; margin-left:4vw;">
                        <div v-if="!notifMsg && !notifIcon" style="background-color:black; border-radius:50px; width:4vw; margin-top:.5vw; min-width:4vw; height:1vw;">
                            <p style="border-radius:50%; background-color:rgba(95, 95, 95, 0.462); width:1vw; height:.5vw; width:.5vw; margin-top:.3vw; margin-left:.5vw; position:absolute;"></p>
                            <p style="border-radius:50%; background-color:rgba(95, 95, 95, 0.462); width:1vw; height:.5vw; width:.5vw; margin-top:.3vw; margin-left:3vw; position:absolute; border: solid 3px rgba(128, 128, 128, 0.497);"></p>
                            <div>
                                <p style="color:white; position:absolute; margin-left:-2.8vw; font-size:13px; font-weight:600;"><font>{{phoneData[0].time}}</font></p>
                                <p v-if="silentMode" style="color:white; position:absolute; margin-left:-1vw; font-size:13px; font-weight:600; color:orange;"><font><i class="fa-solid fa-bell-slash"></i></font></p>
                                <p style="color:white; position:absolute; margin-left:4.4vw; font-size:13px;"><font>{{phoneData[0].battery == null ? 0 : phoneData[0].battery}}%</font></p>
                                <p style="color:white; margin-left:6.3vw; font-size:12px;"><font><i class="fa-solid fa-battery-full"></i></font></p>
                            </div>
                        </div>
                    </button>

                    <div v-if="appView === 'home'" class="homePage" style="margin-top:1vw;">
                        <div class="apps" style=" text-align:center; display:block; width:11vw; margin-left:.5vw;">
                            <div style="background-color:rgb(253,203,36); width:2.4vw; height:2.4vw; border-radius:10px; box-shadow: 5px 5px 18px rgba(1, 1, 1, .2); display:inline-block;"><i id="app" class="fa-solid fa-taxi" style="font-size:1.4vw; margin-top:.4vw; color:rgb(255, 255, 255);"></i>
                            <p style="color:white; margin-top:.8vw; font-weight:500; font-size:12px;">DCC</p>
                            </div>
                            <div @click="openApp('settings')" style="background-color:rgb(150, 150, 150); width:2.4vw; height:2.4vw; border-radius:10px; box-shadow: 5px 5px 18px rgba(1, 1, 1, .2); display:inline-block; margin-left:1vw;"><i class="fa-solid fa-gear" style="font-size:1.4vw; margin-top:.4vw; color:rgb(255, 255, 255);"></i>
                                <p style="color:white; margin-top:.8vw; font-weight:500; font-size:12px; text-align:center;">Settings</p>
                            </div>
                            <div style="background-image:linear-gradient(to bottom right, rgb(8, 169, 255), rgb(29, 48, 255)); width:2.4vw; height:2.4vw; border-radius:10px; box-shadow: 5px 5px 18px rgba(1, 1, 1, .2); display:inline-block; margin-left:1vw;"><i class="fa-solid fa-car" style="font-size:1.4vw; margin-top:.4vw; color:rgb(255, 255, 255);"></i>
                                <p style="color:white; margin-top:.8vw; font-weight:500; font-size:12px; text-align:center;">Vehicles</p>
                            </div>
                            <div style="margin-top:1vw;">
                            <div @click="openApp('banking')" style="background-image:linear-gradient(to bottom right, rgb(41, 8, 255), rgb(195, 29, 255)); width:2.4vw; height:2.4vw; border-radius:10px; box-shadow: 5px 5px 18px rgba(1, 1, 1, .2); display:inline-block; margin-left:0vw;"><i class="fa-solid fa-building-columns" style="font-size:1.4vw; margin-top:.4vw; color:rgb(255, 255, 255);"></i>
                                <p style="color:white; margin-top:.8vw; font-weight:500; font-size:12px; text-align:center;">Banking</p>
                            </div>
                            <div style="background-color:rgb(253,203,36); width:2.4vw; height:2.4vw; border-radius:10px; box-shadow: 5px 5px 18px rgba(1, 1, 1, .2); display:inline-block; margin-left:1vw;"><i class="fa-solid fa-file" style="font-size:1.4vw; margin-top:.4vw; color:rgb(255, 255, 255);"></i>
                                <p style="color:white; margin-top:.8vw; font-weight:500; font-size:12px; text-align:center;">Notes</p>
                            </div>
                            <div style="background-image:linear-gradient(to bottom right, rgb(255, 189, 8), rgb(255, 97, 29)); width:2.4vw; height:2.4vw; border-radius:10px; box-shadow: 5px 5px 18px rgba(1, 1, 1, .2); display:inline-block; margin-left:1vw;"><i class="fa-solid fa-photo-film" style="font-size:1.4vw; margin-top:.4vw; color:rgb(255, 255, 255);"></i>
                                <p style="color:white; margin-top:.8vw; font-weight:500; font-size:12px; text-align:center;">Photos</p>
                            </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="appView === 'phone'">
                        <div style="background-color: rgb(40,40,40); text-align:center; margin-left:.5vw; margin-right:.5vw; padding:.5vw; border-radius:10px; margin-top:.4vw;">
                            <p style="color:rgba(199, 199, 199, 0.853);">Phone <i class="fa-solid fa-phone"></i></p>
                        </div>

                        <div v-if="subView === 'keypad'" style="background-color: rgb(40,40,40); text-align:center; margin-left:.5vw; margin-right:.5vw; padding:.5vw; margin-top:.5vw; border-radius:10px 10px 0px 0px; border-bottom: solid 1px rgb(30,30,30);">
                            <p style="color:rgba(199, 199, 199, 0.853);">{{phoneNum.length > 0 ? phoneNum.join('') : "..."}}</p>
                        </div>

                        <div v-if="subView === 'keypad'" style="background-color: rgb(40,40,40); text-align:center; margin-left:.5vw; margin-right:.5vw; padding:.5vw; border-radius:0px 0px 10px 10px;">
                            <div>
                                <div>
                                    <div style="display:inline-block; background-color: rgb(30,30,30); height:2vw; width:2vw; border-radius:10px;">
                                        <p @click="enterPhoneNum(1)" style="margin-top:.1vw; font-size:20px;">1</p>
                                    </div>
                                    <div style="display:inline-block; background-color: rgb(30,30,30); height:2vw; width:2vw; border-radius:10px; margin-left:1vw;">
                                        <p @click="enterPhoneNum(2)" style="margin-top:.1vw; font-size:20px;">2</p>
                                    </div>
                                    <div style="display:inline-block; background-color: rgb(30,30,30); height:2vw; width:2vw; border-radius:10px; margin-left:1vw;">
                                        <p @click="enterPhoneNum(3)" style="margin-top:.1vw; font-size:20px;">3</p>
                                    </div>
                                </div>

                                <div style="margin-top:1vw;">
                                    <div style="display:inline-block; background-color: rgb(30,30,30); height:2vw; width:2vw; border-radius:10px;">
                                        <p @click="enterPhoneNum(4)" style="margin-top:.1vw; font-size:20px;">4</p>
                                    </div>
                                    <div style="display:inline-block; background-color: rgb(30,30,30); height:2vw; width:2vw; border-radius:10px; margin-left:1vw;">
                                        <p @click="enterPhoneNum(5)" style="margin-top:.1vw; font-size:20px;">5</p>
                                    </div>
                                    <div style="display:inline-block; background-color: rgb(30,30,30); height:2vw; width:2vw; border-radius:10px; margin-left:1vw;">
                                        <p @click="enterPhoneNum(6)" style="margin-top:.1vw; font-size:20px;">6</p>
                                    </div>
                                </div>

                                <div style="margin-top:1vw;">
                                    <div style="display:inline-block; background-color: rgb(30,30,30); height:2vw; width:2vw; border-radius:10px;">
                                        <p @click="enterPhoneNum(7)" style="margin-top:.1vw; font-size:20px;">7</p>
                                    </div>
                                    <div style="display:inline-block; background-color: rgb(30,30,30); height:2vw; width:2vw; border-radius:10px; margin-left:1vw;">
                                        <p @click="enterPhoneNum(8)" style="margin-top:.1vw; font-size:20px;">8</p>
                                    </div>
                                    <div style="display:inline-block; background-color: rgb(30,30,30); height:2vw; width:2vw; border-radius:10px; margin-left:1vw;">
                                        <p @click="enterPhoneNum(9)" style="margin-top:.1vw; font-size:20px;">9</p>
                                    </div>
                                </div>

                                <div style="margin-top:1vw;">
                                    <div style="display:inline-block; background-color: rgb(30,30,30); height:2vw; width:2vw; border-radius:10px;">
                                        <p @click="removeNum()" style="margin-top:.1vw; font-size:20px;"><i class="fa-solid fa-delete-left" style="color:rgba(255, 0, 0, 0.767);"></i></p>
                                    </div>
                                    <div style="display:inline-block; background-color: rgb(30,30,30); height:2vw; width:2vw; border-radius:10px; margin-left:1vw;">
                                        <p @click="enterPhoneNum(0)" style="margin-top:.1vw; font-size:20px;">0</p>
                                    </div>
                                    <div style="display:inline-block; background-color: rgb(30,30,30); height:2vw; width:2vw; border-radius:10px; margin-left:1vw;">
                                        <p @click="phoneCall()" style="margin-top:.1vw; font-size:20px;"><i class="fa-solid fa-square-check" style="color:rgb(8, 175, 86);"></i></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="subView === 'recents'">
                            <div style="margin-left:.5vw; margin-right:.5vw;">
                                <div style="background-color:rgb(60,60,60); padding:.5vw; border-radius:10px 10px 0px 0px; margin-top:.7vw; height:1.8vw;">
                                    <p style="color:rgba(199, 199, 199, 0.853);">Recent Phone Calls</p>
                                </div>
                                <div v-if="phoneRecents.length > 0" style="background-color:rgb(60,60,60); height:12.5vw; overflow:scroll; overflow-x:hidden; border-radius:0px 0px 10px 10px;">
                                    <div v-for="x in phoneRecents[0]" :key="x.id" style="margin-left:.5vw;">
                                        <div style="height:2.5vw; margin-top:.3vw;">
                                            <p>{{x.log}}<font style="float:right; margin-right:.5vw; font-size:13px;"><i @click="subView = 'keypad', phoneNum.length = 0, phoneNum.push(x.number), phoneCall()" class="fa-solid fa-phone" style="transform:rotate(-100deg); color:#118C4F;"></i></font></p>
                                            <p style="font-size:11px;">{{formatUnix(x.time)}}</p>
                                        </div>
                                    </div>
                                    <div v-if="phoneRecents[0].length == 0" style="background-color:rgb(60,60,60); height:12.5vw; text-align:center; border-radius:0px 0px 10px 10px;">
                                        <p>Nothing to see.</p>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div v-if="subView === 'contacts'">

                        </div>

                        <div style="background-color: rgb(40,40,40); text-align:center; margin-left:.5vw; margin-right:.5vw; padding:.5vw; border-radius:10px; margin-top:.5vw;">
                            <div style="display:inline-block; margin-right:1vw;">
                                <p style="color:rgba(199, 199, 199, 0.853);">
                                </p>
                                <font @click="subView = 'keypad'" style="font-size:12px; color:rgba(199, 199, 199, 0.853);" :style="subView === 'keypad' ? 'border-bottom: solid 3px grey;' : ''">Keypad</font>
                            </div>
                            <div style="display:inline-block">
                                <p style="color:rgba(199, 199, 199, 0.853);">
                                </p>
                                <font @click="subView = 'recents', fetchData('recentCalls')" style="font-size:12px; color:rgba(199, 199, 199, 0.853);" :style="subView === 'recents' ? 'border-bottom: solid 3px grey;' : ''">Recents</font>
                            </div>
                            <div style="display:inline-block; margin-left:1vw;">
                                <p style="color:rgba(199, 199, 199, 0.853);">
                                </p>
                                <font @click="subView = 'contacts'" style="font-size:12px; color:rgba(199, 199, 199, 0.853);" :style="subView === 'contacts' ? 'border-bottom: solid 3px grey;' : ''">Contacts</font>
                            </div>
                        </div>

                    </div>

                    <div v-if="appView === 'settings'">
                        <div style="background-color: rgb(40,40,40); text-align:center; margin-left:.5vw; margin-right:.5vw; padding:.5vw; border-radius:10px; margin-top:.5vw;">
                            <p style="color:rgba(199, 199, 199, 0.853);">Settings <i class="fa-solid fa-gear"></i></p>
                        </div>

                        <div style="background-color: rgb(40,40,40); margin-left:.5vw; margin-right:.5vw; padding:.5vw; border-radius:10px; margin-top:1vw;">
                            <div v-if="settingsData.length > 0" style="margin-top:.2vw;">

                                <div style="border-top: solid 3px grey;">
                                    <p style="color:white; font-size:13px; margin-top:0.3vw; margin-bottom:.3vw;">Silent Mode</p>
                                    <label class="switch">
                                        <input type="checkbox" v-model="silentMode">
                                        <span class="slider round"></span>
                                    </label>
                                </div>

                                <div style="border-top: solid 3px grey;">
                                    <p style="color:white; font-size:13px; margin-top:0.3vw; margin-bottom:.3vw;">Wallpaper</p>
                                    <label class="switch">
                                        <input type="checkbox" v-model="wallpaper">
                                        <span class="slider round"></span>
                                    </label>
                                </div>

                                <div style="border-bottom: solid 3px grey; border-top: solid 3px grey;">
                                    <p style="color:white; font-size:13px; margin-top:0.3vw; margin-bottom:.3vw;">Lightmode</p>
                                    <label class="switch">
                                        <input type="checkbox" v-model="lightmode">
                                        <span class="slider round"></span>
                                    </label>
                                </div>

                            </div>
                            <div v-else style="text-align:center;">
                                <loadingSpinner />
                            </div>
                        </div>
                    </div>

                    <div v-if="appView === 'banking'">
                        <div>
                            <div v-if="appData.length == 0" style="text-align:center;">
                                <loadingSpinner/>
                            </div>
                            <div v-else-if="subView === 'none'" style="margin-left:.5vw; margin-right:.5vw;">
                                <div style="background-color:rgb(40,40,40); padding:.5vw; border-radius:15px; margin-top:1vw;">
                                    <p style="color:rgba(199, 199, 199, 0.853);">Welcome Back, {{appData[0].characterName}}</p>
                                </div>
                                <div>
                                    <div style="background-color:rgb(40,40,40); margin-top:.8vw; height:2vw; border-radius:10px;">
                                        <p style="margin-left:1vw; margin-right:1vw; padding-top:.4vw;"><font style="float:left">Balance</font><font style="float:right; color:#118C4F;">${{appData[0].moneyAmount.toLocaleString('en-US')}}</font></p>
                                    </div>

                                    <div style="background-color:rgb(40,40,40); margin-top:.3vw; height:2vw; border-radius:10px;">
                                        <p style="margin-left:1vw; margin-right:1vw; padding-top:.4vw;"><font style="float:left">Cash</font><font style="float:right; color:#118C4F;">${{appData[0].cashAmount.toLocaleString('en-US')}}</font></p>
                                    </div>

                                    <div @click="subView = 'sendMoney'" style="background-color:rgb(40,40,40); margin-top:.3vw; height:2vw; border-radius:10px; text-align:center;">
                                        <div style="text-align:center; padding-top:.2vw;">
                                            <p style="font-size:18px;">Send money <i class="fa-solid fa-paper-plane"></i></p>
                                        </div>
                                    </div>

                                    <div style="background-color:rgb(40,40,40); margin-top:.5vw; border-radius:10px;">
                                        <div>
                                            <p style="margin-left:1vw; margin-right:1vw; padding-top:.4vw;"><font style="float:left">Recent Activity</font></p>
                                        </div>
                                        <div v-if="appData[0].bankingLogs" style="background-color:rgb(60,60,60); margin-top:1.5vw; height:5.5vw; overflow:hidden;">
                                            <div v-for="x in JSON.parse(appData[0].bankingLogs)" :key="x.id" style="margin-left:.5vw;">
                                                <div style="height:1vw; margin-top:.3vw;">
                                                    <p>{{x.actionName}}<font style="float:right; margin-right:.5vw; font-size:13px;" :style="{'color': x.type === 0 ? 'red' : '#118C4F'}">{{x.type === 0 ? `-$${x.moneyAmount.toLocaleString('en-US')}` : `+$${x.moneyAmount.toLocaleString('en-US')}`}}</font></p>
                                                </div>
                                            </div>
                                        </div>
                                        <div style="float:right; font-size:14px; margin-top:.2vw;">
                                            <button @click="subView = 'bankActivity'" style="color:rgb(134, 134, 134); font-weight:600;">View All <i class="fa-sharp fa-solid fa-arrow-right"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div v-if="subView === 'bankActivity' && appData.length > 0">
                                <div style="background-color:rgb(40,40,40); margin-top:.5vw; border-radius:10px; margin-left:.5vw; margin-right:0.5vw;">
                                    <div>
                                        <p style="margin-left:1vw; margin-right:1vw; padding-top:.4vw;"><font style="float:left">All Transactions ({{JSON.parse(appData[0].bankingLogs).length}})</font></p>
                                    </div>
                                    <div v-if="appData[0].bankingLogs.length > 0" style="background-color:rgb(60,60,60); margin-top:1.5vw; height:16.5vw; overflow:scroll; overflow-x:hidden;">
                                        <div v-for="x in JSON.parse(appData[0].bankingLogs)" :key="x.id" style="margin-left:.5vw;">
                                            <div style="height:2.5vw; margin-top:.3vw;">
                                                <p>{{x.actionName}}<font style="float:right; margin-right:.5vw; font-size:13px;" :style="{'color': x.type === 0 ? 'red' : '#118C4F'}">{{x.type === 0 ? `-$${x.moneyAmount.toLocaleString('en-US')}` : `+$${x.moneyAmount.toLocaleString('en-US')}`}}</font></p>
                                                <p style="font-size:11px;">{{formatUnix(x.time)}}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else style="background-color:rgb(60,60,60); margin-top:1.5vw; height:18vw; text-align:center;">
                                        <p>You don't have any transactions</p>
                                    </div>
                                    <div style="float:left; font-size:14px; margin-top:.2vw;">
                                        <button @click="subView = 'none'" style="color:rgb(134, 134, 134); font-weight:600;"><i class="fa-sharp fa-solid fa-arrow-left"></i> Go Back</button>
                                    </div>
                                </div>
                            </div>

                            <div v-if="subView === 'sendMoney' && appData.length > 0">
                                <div style="background-color:rgb(40,40,40); margin-top:.5vw; border-radius:10px; margin-left:.5vw; margin-right:0.5vw;">
                                    <div style="text-align:center; padding:.5vw;">
                                        <p>Send money <i class="fa-solid fa-paper-plane"></i></p>
                                    </div>
                                </div>
                                <div>

                                </div>
                                <div style="background-color:rgb(40,40,40); margin-right:.5vw; margin-left:.5vw; height:6.9vw; border-radius:10px; padding-top:.5vw; margin-top:1vw;">
                                    <div style="background-color:rgba(62, 62, 62, 0.635); margin-top:.5vw; border-radius:10px; margin-left:.5vw; margin-right:0.5vw; padding:.5vw; ">
                                        <div style="text-align:center; font-size:13px;">
                                            <input class="phoneInput" style="background-color:transparent; color:white;" maxlength="15" placeholder="Enter players name" v-model="selectedPlayer">
                                        </div>
                                    </div>
                                    <div style="background-color:rgba(62, 62, 62, 0.635); margin-top:.5vw; border-radius:10px; margin-left:.5vw; margin-right:0.5vw; padding:.5vw; ">
                                        <div style="text-align:center; font-size:13px;">
                                            <input class="phoneInput" style="background-color:transparent; color:white;" maxlength="15" placeholder="Enter Money Amount" v-model="moneyEntered">
                                        </div>
                                    </div>
                                    <p style="margin-left:.5vw;">3% Tax Rate</p>
                                </div>

                                <div style="background-color:rgb(40,40,40); margin-right:.5vw; margin-left:.5vw; height:4vw; border-radius:10px; padding-top:.5vw; margin-top:1vw;">
                                    <div class="confirmBtn" style="background-color:rgba(0, 255, 4, 0.308); margin-top:.5vw; border-radius:10px; margin-left:.5vw; margin-right:0.5vw; padding:.5vw; ">
                                        <div style="text-align:center; font-size:13px;">
                                            <button @click="subView = 'moneyConfirm', formatName()" style="font-weight:600; color:rgba(255, 255, 255, 0.497);">Send Money</button>
                                        </div>
                                    </div>
                                </div>
                                <div style="font-size:13px; margin-left:.5vw; margin-top:.2vw;">
                                    <button @click="subView = 'none'" style="color:rgb(134, 134, 134); font-weight:600;"><i class="fa-sharp fa-solid fa-arrow-left"></i> Go Back</button>
                                </div>
                            </div>

                            <div v-if="subView === 'moneyConfirm'">
                                <div style="background-color:rgb(40,40,40); margin-top:.5vw; border-radius:10px; margin-left:.5vw; margin-right:0.5vw;">
                                    <div style="text-align:center; padding:.5vw;">
                                        <p>Send money <i class="fa-solid fa-paper-plane"></i></p>
                                    </div>
                                </div>
                                <div>

                                </div>
                                <div style="background-color:rgb(40,40,40); margin-right:.5vw; margin-left:.5vw; height:8vw; border-radius:10px; padding-top:.5vw; margin-top:1vw;">
                                    <div style="background-color:rgba(62, 62, 62, 0.635); margin-top:.5vw; border-radius:10px; margin-left:.5vw; margin-right:0.5vw; padding:.5vw; ">
                                        <div style="font-size:13px;">
                                            <p>Recipient <font style="float:right;">{{selectedPlayer}}</font></p>
                                        </div>
                                        <div style="font-size:13px;">
                                            <p>Total <font style="float:right; color:#118C4F;">${{Math.floor(moneyEntered).toLocaleString('en-US')}}</font></p>
                                        </div>
                                        <div style="font-size:13px;">
                                            <p>Tax Total <font style="float:right; color:#118C4F;">${{Math.floor(moneyEntered - moneyEntered/1.03).toLocaleString('en-US')}}</font></p>
                                        </div>
                                        <div style="font-size:13px;">
                                            <p>After Tax <font style="float:right; color:#118C4F;">${{Math.floor(moneyEntered/1.03).toLocaleString('en-US')}}</font></p>
                                        </div>
                                    </div>
                                </div>

                                <div style="background-color:rgb(40,40,40); margin-right:.5vw; margin-left:.5vw; height:4vw; border-radius:10px; padding-top:.5vw; margin-top:1vw;">
                                    <div class="confirmBtn" style="background-color:rgba(0, 255, 4, 0.308); margin-top:.5vw; border-radius:10px; margin-left:.5vw; margin-right:0.5vw; padding:.5vw; ">
                                        <div style="text-align:center; font-size:13px;">
                                            <button @click="sendMoney(), subView = 'sendMoney'" style="font-weight:600; color:rgba(255, 255, 255, 0.497);">Confirm</button>
                                        </div>
                                    </div>
                                </div>
                                <div style="font-size:13px; margin-left:.5vw; margin-top:.2vw;">
                                    <button @click="subView = 'sendMoney'" style="color:rgb(134, 134, 134); font-weight:600;"><i class="fa-sharp fa-solid fa-arrow-left"></i> Go Back</button>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div style="position:absolute; bottom: 10px; width:100%;">
                        <div v-if="appView === 'home'" style=" text-align:center; display:block; width:11vw; margin-left:.5vw;">
                            <div style="border-radius:20px; height:3vw; margin-top:8vw;" class="backdrop-blur-xl bg-white/30 ...">
                                <div @click="openApp('phone')" style="background-image:linear-gradient(to bottom right, rgb(8, 255, 12), rgb(29, 255, 142)); width:2.4vw; height:2.4vw; border-radius:10px; box-shadow: 5px 5px 18px rgba(1, 1, 1, .2); display:inline-block; margin-top:.3vw;"><i class="fa-solid fa-phone" style="font-size:1.4vw; margin-top:.4vw; color:rgb(255, 255, 255);"></i>
                                </div>
                                <div style="background-image:linear-gradient(to bottom right, rgb(8, 255, 12), rgb(29, 255, 142)); width:2.4vw; height:2.4vw; border-radius:10px; box-shadow: 5px 5px 18px rgba(1, 1, 1, .2); display:inline-block; margin-left:1vw;"><i class="fa-solid fa-message" style="font-size:1.4vw; margin-top:.4vw; color:rgb(255, 255, 255);"></i>
                                </div>
                                <div style="background-color:grey; width:2.4vw; height:2.4vw; border-radius:10px; box-shadow: 5px 5px 18px rgba(1, 1, 1, .2); display:inline-block; margin-left:1vw;"><i class="fa-solid fa-camera" style="font-size:1.4vw; margin-top:.4vw; color:rgb(36, 36, 36);"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="homeButton" v-if="appView != 'home'" style="position:absolute; bottom: .2vw; width:100%;">
                        <div style="text-align:center;">
                            <button @click="homePage()" style="background-color:rgba(255, 255, 255, 0.634); width:8vw; border-radius:10px; height:.3vw; border: solid 1px rgb(87, 87, 87);"></button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script>
import loadingSpinner from '../loadingSpinner.vue';
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            show: false,
            notifMsg: '',
            notifIcon: '',
            phoneNum: [],
            appView: "home",
            subView: "none",
            recentItems: 22,
            selectedPlayer: '',
            moneyEntered: '',
            silentMode: false,
            lightmode: false,
            wallpaper: '',
            notifTime: null,
            phoneOpen: {
                'margin-top': '33vw',
            }
        }
    },
    computed: {
        ...mapGetters({ hudShow: 'getHudState' }),
        ...mapGetters({ phoneData: 'getPhoneData' }),
        ...mapGetters({ appData: 'getAppData' }),
        ...mapGetters({ settingsData: 'getSettingsData' }),
        ...mapGetters({ phoneRecents: 'getPhoneRecents' }),
    },
    components: {
        loadingSpinner
    },
    watch: {
        settingsData(oldType) {
            this.silentMode = oldType[0].silentMode;
            this.wallpaper = oldType[0].wallpaper;
            this.lightmode = oldType[0].lightmode;
        },
        silentMode(oldType) {
            window.mp.trigger('setPhoneSetting', 'silentMode', oldType);
        },
        lightmode(oldType) {
            window.mp.trigger('setPhoneSetting', 'lightMode', oldType);
        },
        wallpaper(oldType) {
            window.mp.trigger('setPhoneSetting', 'wallpaper', oldType);
        }
    },
    methods: {
        showPhone() {
            if(!this.phoneData[0].cursor) return;
            this.show = !this.show;
            window.mp.trigger("setPlayerProperty", "phoneStatus", this.show);
            window.mp.trigger("equipPhone", this.show);
            if(this.show) {
                this.openPhone();
            } else {
                this.closePhone();
            }
        },
        formatName() {
            var newName = [];
            for(var x = 0; x < this.selectedPlayer.length; x++) {
                if(this.selectedPlayer[x] !== " ") {
                    newName.push(this.selectedPlayer[x]);
                } else { newName.push('_') }
            }
            this.selectedPlayer = newName.join('');
        },
        sendMoney() {
            function containsNumbers(str) {
                    return /\d/.test(str);
                }
                if(!containsNumbers(this.moneyEntered) || this.moneyEntered.length == 0 || this.selectedPlayer.length == 0 || this.moneyEntered.match(/\W/) || this.selectedPlayer.match(/\W/) || /[a-zA-Z]/g.test(this.moneyEntered) || containsNumbers(this.selectedPlayer)) {
                    global.gui.notify.clearAll();
                    global.gui.notify.sendError("Ensure selection details are valid.", 3000);
                    return;
                } else {
                    window.mp.trigger('serverFunctionCEF', 'sendMoneyToPlayer', JSON.stringify(this.$data));
                }
        },
        openApp(app) {
            switch(app) {
                case 'banking':
                {
                    window.mp.trigger('serverFunctionCEF', 'updateAppData', 'banking');
                    this.phoneOpen = {
                        'background-color': 'rgb(31,31,31)',
                        'background-image': 'none',
                        'margin-top': "33vw",
                    }
                    this.appView = 'banking';
                    break;
                }
                case 'settings':
                {
                    this.phoneOpen = {
                        'background-color': 'rgb(31,31,31)',
                        'background-image': 'none',
                        'margin-top': "33vw",
                    }
                    this.appView = 'settings';
                    break;
                }
                case 'phone':
                {
                    this.phoneOpen = {
                        'background-color': 'rgb(31,31,31)',
                        'background-image': 'none',
                        'margin-top': "33vw",
                    }
                    this.appView = 'phone';
                    this.subView = 'keypad';
                    break;
                }
                default: break;
            }
        },
        sendNotif(icon, msg, time) {
            if(this.notifTime != null) return clearTimeout(this.notifTime);

            this.notifMsg = msg;
            this.notifIcon = icon;

            console.log(this.notifMsg);

            !this.show ? this.phoneOpen = {
                'margin-top': '50vw'
            } : "";

            this.notifMsg = setTimeout(() => {
                this.notifIcon = null;
                this.notifIcon = null;
                !this.show ? this.phoneOpen = {
                    'margin-top': '54vw'
                } : "";
            }, time);
        },
        homePage() {
            this.appView = 'home';
            this.subView = 'none';
            this.phoneOpen = {
                'background-image': 'url(https://wallpaperaccess.com/full/623479.jpg)',
                'margin-top': '33vw'
            };
        },
        formatUnix(unix) {
            const date = new Date(unix * 1000)
            const hours = date.getHours()
            const minutes = date.getMinutes()
            const seconds = date.getSeconds()
            return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
        },
        enterPhoneNum(num) {
            window.mp.trigger('client:sound', "5_SEC_WARNING", "HUD_MINI_GAME_SOUNDSET");
            if(this.phoneNum.length >= 20) return;
            this.phoneNum.push(num);
        },
        removeNum() {
            window.mp.trigger('client:sound', "5_SEC_WARNING", "HUD_MINI_GAME_SOUNDSET");
            this.phoneNum.length > 0 ? this.phoneNum.splice(this.phoneNum.length-1, 1) : "";
        },
        phoneCall() {
            window.mp.trigger('client:sound', "5_SEC_WARNING", "HUD_MINI_GAME_SOUNDSET");
            if(this.phoneNum.length > 0) {
                window.mp.trigger('serverFunctionCEF', 'phoneCall:handler', this.phoneNum.join(''));

                switch(parseInt(this.phoneNum.join(''))) {
                    case 911:
                    {
                        this.$store.commit('chatActive', true);
                        break;
                    }
                }
            }
        },
        openPhone() {
            this.show = true;

            this.phoneOpen = {
                    'margin-top': "33vw",
                    animation: '1s show'
            }
            this.subView = 'none';
            this.appView = 'home';
            this.$store.commit('chatActive', false);
        },
        closePhone() {
            this.show = false;

            this.phoneOpen = {
                'margin-top': "54vw",
                animation: '1s hide'
            }
            this.subView = 'none';
            this.appView = 'home';
            this.$store.commit('chatActive', true);
        },
        fetchData(handle) {
            switch(handle) {
                case 'recentCalls':
                {
                    window.mp.trigger('serverFunctionCEF', 'fetchRecents');
                    break;
                }
                default: break;
            }
        }
    }
}
</script>

<style scoped>

* {
    transition-duration: .4s;
}

textarea:focus, input:focus{
    outline: none;
}

.phoneBody {
    box-shadow: inset 0px 0px 0px 5px black;
}

*:focus {
    outline: none;
}

.homeButton:hover {
    padding: .3vw;
}

@keyframes fadein {
    from {opacity: 0;}
    to {opacity: 1;}
}

 @keyframes show{
    from{margin-top: 54vw};
    to{margin-top: 33vw};
  }

  @keyframes hide{
    from{margin-top: 33vw};
    to{margin-top: 54vw};
  }

  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(10, 10, 10, 0);
  }

  ::-webkit-scrollbar-thumb {
    background: #5c5c5c;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #838383;
  }

  .phoneInput::after {
    color: #ffffff;
  }

  .phoneInput::before {
  }

  .confirmBtn:hover {
    opacity: .4;
  }

  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
  }

  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: .4s;
    transition: .4s;
    height: 1.5vw;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 1vw;
    width: 1vw;
    left: 5px;
    bottom: 5px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
  }

  input:checked + .slider {
    background-color: #2196F3;
  }

  input:focus + .slider {
    box-shadow: 0 0 1px #2196F3;
  }

  input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
  }

  /* Rounded sliders */
  .slider.round {
    border-radius: 34px;
  }

  .slider.round:before {
    border-radius: 50%;
  }
</style>
