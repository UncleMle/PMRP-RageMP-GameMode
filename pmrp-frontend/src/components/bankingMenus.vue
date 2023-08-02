<template>
    <div style="position:absolute;">
        <div v-if="bankType === 'atm'" class="uiBase" style="margin-top:10vw; margin-left:38.7vw; background-color:rgba(0, 0, 0, 0); background-image:none; height:25vw;">
            <menuButton style="position:absolute; margin-left:21.5vw;" />
            <div class="textHeader" style="background-color:rgba(0, 0, 0, 0.392); text-align:center;"><i class="fa-solid fa-building-columns"></i> ATM Management</div>
            <div style="background-color:rgba(0, 0, 0, 0.392); padding:0.5vw; color:white; border-radius:5px;">
                <div v-if="atmData.length == 0" class="pinPad">
                    <div style="text-align:center; margin-bottom:1vw;">
                        <div style="font-size:25px; background-color:rgba(0, 0, 0, 0.864); border-radius:10px;">{{pinNumbers.length == 0 ? "..." : pinNumbers.join("")}}</div>
                    </div>
                    <div style="display:inline-block; margin-bottom:2vw;">
                        <div>
                            <div style="margin-left:4vw;">
                                <button @click="numInput(1)" class="atmButton">1</button>
                                <button @click="numInput(2)" class="atmButton" style="margin-left:1vw;">2</button>
                                <button @click="numInput(3)" class="atmButton" style="margin-left:1vw;">3</button>
                            </div>
                            <div style="margin-left:4vw; margin-top:1vw;">
                                <button @click="numInput(4)" class="atmButton">4</button>
                                <button @click="numInput(5)" class="atmButton" style="margin-left:1vw;">5</button>
                                <button @click="numInput(6)" class="atmButton" style="margin-left:1vw;">6</button>
                            </div>
                            <div style="margin-left:4vw; margin-top:1vw;">
                                <button @click="numInput(7)" class="atmButton">7</button>
                                <button @click="numInput(8)" class="atmButton" style="margin-left:1vw;">8</button>
                                <button @click="numInput(9)" class="atmButton" style="margin-left:1vw;">9</button>
                            </div>
                            <div style="margin-left:4vw; margin-top:1vw;">
                                <button @click="shortArr()" class="atmButton"><i class="fa-solid fa-delete-left" style="color:rgba(253, 73, 73, 0.961);"></i></button>
                                <button @click="numInput(0)" class="atmButton" style="margin-left:1vw;">0</button>
                                <button @click="sendPin(pinNumbers)" class="atmButton" style="margin-left:1vw;"><i class="fa-solid fa-square-check" style="color:rgba(115, 253, 73, 0.961);"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <div v-if="!cashWithdraw && !confirmScreen">
                        <div class="insert" style="height:2vw;">
                            <p style="color:white; font-size:16px; line-height:2vw;"><font style="float:left; margin-left:1vw;">Total Balance</font> <font style="float:right; margin-right:1vw; color:#118C4F;">${{atmData[0].moneyAmount.toLocaleString('en-US')}}</font></p>
                        </div>
                        <div class="insert" style="height:2vw;">
                            <p style="color:white; font-size:16px; line-height:2vw;"><font style="float:left; margin-left:1vw;">Total Cash</font> <font style="float:right; margin-right:1vw; color:#118C4F;">${{atmData[0].cashAmount.toLocaleString('en-US')}}</font></p>
                        </div>
                        <div class="insert" style="height:2vw;">
                            <p style="color:white; font-size:16px; line-height:2vw;"><font style="float:left; margin-left:1vw;">Salary</font> <font style="float:right; margin-right:1vw; color:#118C4F;">${{atmData[0].salary}}</font></p>
                        </div>
                        <div class="insert" style="height:2vw;">
                            <p style="color:white; font-size:16px; line-height:2vw;"><font style="float:left; margin-left:1vw;">Salary Tax Rate</font> <font style="float:right; margin-right:1vw;">{{atmData[0].taxRate}}%</font></p>
                        </div>
                        <div style="text-align:center;">
                            <button @click="cashWithdraw = true" class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw; margin-top:1vw;">Withdraw Cash</button>
                        </div>
                    </div>
                    <div v-else-if="!confirmScreen">
                        <p style="color:white; font-size:16px; line-height:2vw; text-align:center; padding:10px;">You currently have <font color="#118C4F"> ${{atmData[0].moneyAmount.toLocaleString('en-US')}}</font> in your bank account.</p>
                        <div style="border-bottom: solid rgba(255, 255, 255, 0.311) 2px;">
                            <input class="input100" maxlength="15" placeholder="Enter cash amount" v-model="enteredCash">
                        </div>
                        <div style="text-align:center;">
                            <button @click="cashWithdraw = false" class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw; margin-top:1vw;">Go Back</button>
                            <button @click="confirmSelect('withdraw')" class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw; margin-top:1vw; margin-left:1vw;">Withdraw</button>
                        </div>
                    </div>
                    <div v-if="confirmScreen">
                        <p style="color:white; font-size:16px; line-height:2vw; text-align:center; padding:10px;">Are you sure you want to withdraw a total of<font color="#118C4F"> ${{enteredCash.toLocaleString('en-US')}}</font></p>
                        <button @click="confirmScreen = false" class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw; margin-top:1vw;">Go Back</button>
                        <button @click="withdrawCash()" class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw; margin-top:1vw; margin-left:1vw;">Confirm</button>
                    </div>
                </div>

            </div>

        </div>
        <div v-if="bankType === 'bank'" class="uiBase" style="margin-top:10vw; margin-left:38.7vw; background-color:rgba(0, 0, 0, 0); background-image:none; height:25vw;">
            <menuButton style="position:absolute; margin-left:21.5vw;" />
            <div class="textHeader" style="background-color:rgba(0, 0, 0, 0.392); text-align:center;"><i class="fa-solid fa-building-columns"></i> Banking Management</div>
            <div v-if="!confirmScreen && !depositScreen &&  !cashWithdraw && !withDrawScreen && !salaryScreen && !salaryConfirm" style="background-color:rgba(0, 0, 0, 0.392); padding:0.5vw; color:white; border-radius:5px;">
                <div class="insert" style="height:2vw;">
                    <p style="color:white; font-size:16px; line-height:2vw;"><font style="float:left; margin-left:1vw;">Total Balance</font> <font style="float:right; margin-right:1vw; color:#118C4F;">${{atmData[0].moneyAmount.toLocaleString('en-US')}}</font></p>
                </div>
                <div class="insert" style="height:2vw;">
                    <p style="color:white; font-size:16px; line-height:2vw;"><font style="float:left; margin-left:1vw;">Total Cash</font> <font style="float:right; margin-right:1vw; color:#118C4F;">${{atmData[0].cashAmount.toLocaleString('en-US')}}</font></p>
                </div>
                <div class="insert" style="height:2vw;">
                    <p style="color:white; font-size:16px; line-height:2vw;"><font style="float:left; margin-left:1vw;">Salary</font> <font style="float:right; margin-right:1vw; color:#118C4F;">${{atmData[0].salary}}</font></p>
                </div>
                <div class="insert" style="height:2vw;">
                    <p style="color:white; font-size:16px; line-height:2vw;"><font style="float:left; margin-left:1vw;">Salary Tax Rate</font> <font style="float:right; margin-right:1vw;">{{atmData[0].taxRate}}%</font></p>
                </div>
                <div style="text-align:center;">
                    <button @click="confirmScreen = true" class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw; margin-top:1vw;">Deposit Cash</button>
                    <button @click="salaryScreen = true" class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw; margin-top:1vw; margin-left:1vw;">Collect Salary</button>
                    <button @click="cashWithdraw = true, confirmScreen = false" class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw; margin-top:1vw;">Withdraw Cash</button>
                    <button class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw; margin-top:1vw; margin-left:1vw;">Cash a Cheque</button>

                </div>
            </div>
            <div v-else-if="confirmScreen">
                <div style="background-color:rgba(0, 0, 0, 0.392); padding:0.5vw; border-radius:10px;">
                    <p style="color:white; font-size:16px; line-height:2vw; text-align:center; padding:10px;">You currently have <font color="#118C4F"> ${{atmData[0].cashAmount.toLocaleString('en-US')}}</font> in cash.</p>

                    <div style="border-bottom: solid rgba(255, 255, 255, 0.311) 2px;">
                        <input class="input100" maxlength="15" placeholder="Enter cash amount" v-model="enteredCash">
                    </div>
                    <div style="text-align:center;">
                        <button @click="confirmScreen = false" class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw; margin-top:1vw;">Go Back</button>
                        <button @click="confirmSelect('deposit')" class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw; margin-top:1vw; margin-left:1vw;">Deposit</button>
                    </div>
                </div>
            </div>
            <div v-if="salaryScreen">
                <div style="background-color:rgba(0, 0, 0, 0.392); padding:0.5vw; border-radius:10px;">
                    <p style="color:white; font-size:16px; line-height:2vw; text-align:center; padding:10px;">Your current salary is <font color="#118C4F"> ${{atmData[0].salary.toLocaleString('en-US')}}</font></p>
                    <div style="border-bottom: solid rgba(255, 255, 255, 0.311) 2px;">
                        <input class="input100" maxlength="15" placeholder="Enter cash amount" v-model="enteredCash">
                    </div>
                    <div style="text-align:center;">
                        <button @click="salaryScreen = false" class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw; margin-top:1vw;">Go Back</button>
                        <button @click="confirmSelect('collectSalary')" class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw; margin-top:1vw; margin-left:1vw;">Collect</button>
                    </div>
                </div>
            </div>
            <div v-if="salaryConfirm">
                <div style="background-color:rgba(0, 0, 0, 0.392); padding:0.5vw; border-radius:10px;">
                    <p style="color:white; font-size:16px; line-height:2vw; text-align:center; padding:10px;">Are you sure you want to deposit a total of<font color="#118C4F"> ${{enteredCash.toLocaleString('en-US')}}</font> from you salary into your bank account?</p>
                    <button @click="salaryScreen = true, salaryConfirm = false" class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw; margin-top:1vw;">Go Back</button>
                    <button class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw; margin-top:1vw; margin-left:1vw;">Confirm</button>
                </div>
            </div>
            <div v-if="cashWithdraw">
                <div style="background-color:rgba(0, 0, 0, 0.392); padding:0.5vw; border-radius:10px;">
                    <p style="color:white; font-size:16px; line-height:2vw; text-align:center; padding:10px;">You currently have <font color="#118C4F"> ${{atmData[0].moneyAmount.toLocaleString('en-US')}}</font> in your bank account.</p>
                    <div style="border-bottom: solid rgba(255, 255, 255, 0.311) 2px;">
                        <input class="input100" maxlength="15" placeholder="Enter cash amount" v-model="enteredCash">
                    </div>
                    <div style="text-align:center;">
                        <button @click="cashWithdraw = false" class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw; margin-top:1vw;">Go Back</button>
                        <button @click="confirmSelect('bankWithdraw')" class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw; margin-top:1vw; margin-left:1vw;">Withdraw</button>
                    </div>
                </div>
            </div>
            <div v-if="withDrawScreen">
                <div style="background-color:rgba(0, 0, 0, 0.392); padding:0.5vw; border-radius:10px;">
                    <p style="color:white; font-size:16px; line-height:2vw; text-align:center; padding:10px;">Are you sure you want to withdraw a total of<font color="#118C4F"> ${{enteredCash.toLocaleString('en-US')}}</font></p>
                    <button @click="depositScreen = false, confirmScreen = false, withDrawScreen = false, cashWithdraw = true " class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw; margin-top:1vw;">Go Back</button>
                    <button @click="withdrawCash()" class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw; margin-top:1vw; margin-left:1vw;">Confirm</button>
                </div>
            </div>
            <div v-if="depositScreen">
                <div style="background-color:rgba(0, 0, 0, 0.392); padding:0.5vw; border-radius:10px;">
                    <p style="color:white; font-size:16px; line-height:2vw; text-align:center; padding:10px;">Are you sure you want to deposit a total of<font color="#118C4F"> ${{enteredCash.toLocaleString('en-US')}}</font></p>
                    <button @click="depositScreen = false, confirmScreen = true, withDrawScreen = false" class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw; margin-top:1vw;">Go Back</button>
                    <button @click="depositCash()" class="modButton" style="height:2vw; line-height:0.2vw; clip-path:none; border-radius:10px; opacity: 1; border-top:none; font-size:0.8vw; margin-top:1vw; margin-left:1vw;">Confirm</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import menuButton from './menuButton.vue';

export default {
    data() {
        return {
            pinNumbers: [],
            cashWithdraw: false,
            confirmScreen: false,
            withDrawScreen: false,
            depositScreen: false,
            salaryScreen: false,
            salaryConfirm: false,
            enteredCash: ''
        }
    },
    created() {
        this.$store.state.playerInfo.bankInfo = [];
    },
    components: {
        menuButton
    },
    computed: {
        ...mapGetters({ atmData: 'getAtmInfo' }),
        ...mapGetters({ bankType: 'getBankUI' })
    },
    methods: {
        numInput(number) {
            window.mp.trigger('client:sound', "5_SEC_WARNING", "HUD_MINI_GAME_SOUNDSET");
            if(this.pinNumbers.length < 4) {
                this.pinNumbers.push(number);
            } else {
                this.pinNumbers.length = 0;
                this.pinNumbers.push(number);
            }
        },
        shortArr() {
            this.pinNumbers.splice(this.pinNumbers.length-1);
            window.mp.trigger('client:sound', "5_SEC_WARNING", "HUD_MINI_GAME_SOUNDSET");
        },
        formatNumbers(arr) {
            return arr.join("");
        },
        sendPin(number) {
            if(number.length == 0) return window.mp.trigger('client:sound', "5_SEC_WARNING", "HUD_MINI_GAME_SOUNDSET");

            if(window.mp) {
                window.mp.trigger('client:sound', "5_SEC_WARNING", "HUD_MINI_GAME_SOUNDSET");
                window.mp.trigger('compressDataToServer', 'numPinData', number.join(""));
            }
        },
        confirmSelect(handle) {
            function containsNumbers(str) {
                return /\d/.test(str);
            }
            if(!containsNumbers(this.enteredCash) || this.enteredCash.length == 0 || this.enteredCash == '' || this.enteredCash.match(/\W/) || /[a-zA-Z]/g.test(this.enteredCash)) {
                global.gui.notify.clearAll();
                global.gui.notify.showNotification(
                    "Entered a valid cash amount.",
                    false,
                    true,
                    5000,
                    "fa-solid fa-triangle-exclamation"
                );
                return;
            }
            switch(handle) {
                case 'withdraw':
                {
                    this.confirmScreen = true;
                    break;
                }
                case 'deposit':
                {
                    this.confirmScreen = false;
                    this.depositScreen = true;
                    break;
                }
                case 'bankWithdraw':
                {
                    this.confirmScreen = false, this.depositScreen = false, this.cashWithdraw = false, this.withDrawScreen = true;
                    break;
                }
                case 'collectSalary':
                {
                    this.confirmScreen = false, this.depositScreen = false, this.cashWithdraw = false, this.salaryScreen = false,  this.salaryConfirm = true;
                    break;
                }
                default: break;
            }
        },
        withdrawCash() {
            window.mp.trigger('client:sound', "5_SEC_WARNING", "HUD_MINI_GAME_SOUNDSET");
            function containsNumbers(str) {
                return /\d/.test(str);
            }
            if(!containsNumbers(this.enteredCash) || this.enteredCash.length == 0 || this.enteredCash == '' || this.enteredCash.match(/\W/) || /[a-zA-Z]/g.test(this.enteredCash)) {
                global.gui.notify.clearAll();
                global.gui.notify.showNotification(
                    "Entered a valid cash amount.",
                    false,
                    true,
                    5000,
                    "fa-solid fa-triangle-exclamation"
                );
                return;
            } else {
                window.mp.trigger('compressDataToServer', 'withdrawCash', this.enteredCash);
            }
        },
        depositCash() {
            window.mp.trigger('client:sound', "5_SEC_WARNING", "HUD_MINI_GAME_SOUNDSET");
            function containsNumbers(str) {
                return /\d/.test(str);
            }
            if(!containsNumbers(this.enteredCash) || this.enteredCash.length == 0 || this.enteredCash == '' || this.enteredCash.match(/\W/) || /[a-zA-Z]/g.test(this.enteredCash)) {
                global.gui.notify.clearAll();
                global.gui.notify.showNotification(
                    "Entered a valid cash amount.",
                    false,
                    true,
                    5000,
                    "fa-solid fa-triangle-exclamation"
                );
                return;
            } else {
                window.mp.trigger('compressDataToServer', 'depositCash', this.enteredCash);
            }
        }

    }
}
</script>

<style scoped>
* {
    transition: 1s;
}

.atmButton {
    padding:1vw; background-color:rgba(0, 0, 0, 0.864); width:4vw; border-radius:10px;
}
.atmButton:hover {
    background-color: rgba(0, 0, 0, 0.307);
}
</style>