<template>
    <div class="limiter" style="user-select: none;">
        <div class="container-login100" style="user-select: none;">
            <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
            <div class="wrap-login100">
                <form class="login100-form validate-form" id="auth-form" @submit.prevent="add()">

                    <div class="otpHeader"><i class="fa-solid fa-shield-halved"></i> Enter your One Time Password<p style="margin-top: 0.3vw">Enter your OTP make sure to check your spam folder.</p></div>
                    <div class=" p-l-55 p-r-55 p-t-65 p-b-54">

                    <div class="wrap-input100 validate-input">
                        <div class="label-input100" style="color: #fff;"><i class="fa-solid fa-lock"></i> OTP</div>
                        <input id="otpVal" class="input100" placeholder="Type your OTP [Sent to your email address]" v-model="otpValue">
                        <div class="focus-input100"></div>

                    </div>

                    <div class="text-right p-t-8 p-b-31">
                    </div>

                    <br>
                    <div class="container-login100-form-btn">
                        <div class="wrap-login100-form-btn">
                            <div class="login100-form-bgbtn"></div>
                            <button type="submit" id="loginBtn" @click="sendOtp()" class="login100-form-btn">Continue</button>
                        </div>
                    </div>
                </div>
                    <br>
                </form>
                </div>

            </div>
            </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';

export default {
    data: function() {
        return{
            otpValue: '',
         }
    },
    computed: {
        ...mapGetters({
            showState: 'getHudState'
        }),
        ...mapMutations({})
    },
    created() {
        global.gui.notify.clearAll()
        global.gui.notify.showNotification(
            "Enter the confirmation code sent to your email address.",
            false,
            true,
            5000,
            "fa-solid fa-circle-info"
          );
    },
    methods: {
        sendOtp() {
            if(this.otpValue.length == 0 && window.mp) { return  window.mp.trigger('requestBrowser', `gui.notify.showNotification("Please enter a valid one time password.", false, true, 15000, 'fa-solid fa-triangle-exclamation')`)}
            if(this.otpValue.length != 0 && window.mp) {
                window.mp.trigger('client:otpData', this.otpValue);
            }
        }
    }
}

</script>

<style>

/*//////////////////////////////////////////////////////////////////
[ FONT ]*/


/*//////////////////////////////////////////////////////////////////
[ RESTYLE TAG ]*/

.p-l-55 {padding-left: 55px;}
.p-b-49 {padding-bottom: 49px;}
.p-r-55 {padding-right: 55px;}
.p-t-65 {padding-top: 65px;}
.p-b-65 {padding-bottom: 65px;}
.p-t-8 {padding-top: 8px;}
.p-b-31 {padding-bottom: 31px;}
.p-b-54 {padding-bottom: 54px;}



.register-btn {
    padding-top: 10px;
    color: #a64bf4;
}

.msg {
    font-weight: 1000;
    border-top: solid rgba(255, 0, 0, 0.5) 2px;
    border-bottom: solid rgba(255, 0, 0, 0.5) 2px;
}



@keyframes fadeout {
    from{opacity: 1;}
    to{opacity: 0;}
}

.forgot-password {
    text-decoration: none;
}

* {
    margin: 0px;
    padding: 0px;
    box-sizing: border-box;
}

body,
html {
    height: 100%;
    font-family: Poppins-Regular, sans-serif;
}

.otpHeader {
    color: #fff;
    font-family: "OSL";
    font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
    font-weight: 1000;
    text-align: center;
    font-size: 26px;
    line-height: 1vw;
    background: -webkit-linear-gradient(
      left,
      rgba(10, 10, 10, 0.115),
      rgba(1, 1, 1, 0.651)
    );
    padding: 1.2vw;
    padding-bottom: 0.5vw;
    padding-top: 0.7vw;
    text-align: left;
    border-bottom: solid rgb(183, 119, 255) 3px;
    box-shadow: 0 0 30px rgba(183, 119, 255, 0.69);
    margin-bottom: 0vw;
  }

/*---------------------------------------------*/



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
    font-family: Poppins-Regular;
    font-size: 14px;
    line-height: 1.7;
    color: #666666;
    margin: 0px;
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


/*//////////////////////////////////////////////////////////////////
[ Utility ]*/

.txt1 {
    font-family: Poppins-Regular;
    font-size: 14px;
    line-height: 1.5;
    color: #666666;
}

.txt2 {
    font-family: Poppins-Regular;
    font-size: 14px;
    line-height: 1.5;
    color: #333333;
    text-transform: uppercase;
}

.bg1 {
    background-color: #3b5998
}

.bg2 {
    background-color: #1da1f2
}

.bg3 {
    background-color: #ea4335
}


/*//////////////////////////////////////////////////////////////////
[ login ]*/

.limiter {
   /* box-shadow: inset 0 0 99em 5em #000; */
   display: flex;
   align-items: center;
   user-select: none;
}
.limiter:focus {
    outline: none;
    border: none;
    user-select: none;
}



.container-login100 {
    opacity: .78;
    width: 100%;
    min-height: 100vh;
    display: -webkit-box;
    display: -webkit-flex;
    display: -moz-box;
    display: -ms-flexbox;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    padding: 15px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    background: transparent;
    /*-webkit-animation: fadein 2s;*/

}

.bg.image {
    -webkit-filter: blur(5px);
    -moz-filter: blur(5px);
    -o-filter: blur(5px);
    -ms-filter: blur(5px);
    filter: blur(5px);
}
@keyframes fadein {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }

}



.wrap-login100 p-l-55 p-r-55 p-t-65 p-b-54 {
    opacity: .6;

}

.wrap-login100 {
    width: 800px;
    border-left: none;
    border-right: none;
    border-top: solid rgb(183, 119, 255) 5px;
    border-bottom: solid rgb(183, 119, 255) 5px;
    border-right: solid rgba(255, 255, 255, 0.311) 2px;
    border-left: solid rgba(255, 255, 255, 0.311) 2px;
    background: -webkit-linear-gradient(right, rgba(1, 1, 1, 0.651), rgba(10, 10, 10, 0.944));
    border-radius: 10px;
    overflow: hidden;
    margin-top: -10vw;
    -webkit-animation: fadein2 0.5s;

    --notchSize: 20px;

    clip-path:
    polygon(
      0% var(--notchSize),
      var(--notchSize) 0%,
      calc(100% - var(--notchSize)) 0%,
      100% var(--notchSize),
      100% calc(100% - var(--notchSize)),
      calc(100% - var(--notchSize)) 100%,
      var(--notchSize) 100%,
      0% calc(100% - var(--notchSize))
    );

}

@keyframes fadein2 {

    0% {
        opacity: 0.1;
        margin-top: -55vw;
        transform: scale(0);
    }
    15% {
        opacity: .7;
        margin-top: -55vw;

        transform: scale(0.3);
    }
    20% {
        opacity: 1;
        margin-top: -55vw;

        transform: scale(1);
    }
    50% {
        opacity: 1;

        transform: scale(1);
    }
    60% {
        opacity: 1;

        transform: scale(1);
    }
    70% {
        opacity: 1;

        transform: scale(1);
    }
    80% {
        opacity: 1;

        transform: scale(1);
    }
    90% {
        opacity: 1;

        transform: scale(1);
    }
    100% {
        opacity: 1;

        transform: scale(1);
    }
}


@keyframes shift {

    0% {
        box-shadow: inset 0 0 5em 0.1em rgb(153, 153, 153)
    }
    50% {
        box-shadow: inset 0 0 22em 0.1em rgb(114, 114, 114)
    }
    100% {
        box-shadow: inset 0 0 32em 0.1em rgb(0, 0, 0)
    }
}

/*------------------------------------------------------------------
[ Form ]*/

.login100-form {
    width: 100%;
}

.login100-form-title {
    display: block;
    font-family: Poppins-Bold;
    font-size: 39px;
    color: #ffffff;
    line-height: 1.2;
    text-align: center;
}


/*------------------------------------------------------------------
[ Input ]*/

.wrap-input100 {
    width: 100%;
    position: relative;
    border-bottom: 2px solid #d9d9d9;
}

.label-input100 {
    font-family: Poppins-Regular;
    font-size: 14px;
    color: #ffffff;
    line-height: 1.5;
    padding-left: 7px;
}

.input100 {
    font-family: Poppins-Medium;
    font-size: 16px;
    color: #ffffff;
    line-height: 1.2;
    display: block;
    width: 100%;
    height: 55px;
    background: transparent;
    padding: 0 7px 0 43px;
}


/*---------------------------------------------*/

.focus-input100 {
    position: absolute;
    display: block;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    color: #fff;
}

.focus-input100::after {
    content: attr(data-symbol);
    font-family: Material-Design-Iconic-Font;
    color: #ffffff;
    font-size: 22px;
    display: -webkit-box;
    display: -webkit-flex;
    display: -moz-box;
    display: -ms-flexbox;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    height: calc(100% - 20px);
    bottom: 0;
    left: 0;
    padding-left: 13px;
    padding-top: 3px;
    color: #ffffff;

}

.focus-input100::before {
    display: block;
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: #ffffff;
    -webkit-transition: all 0.4s;
    -o-transition: all 0.4s;
    -moz-transition: all 0.4s;
    transition: all 0.4s;
}

.input100:focus+.focus-input100::before {
    width: 100%;
}

.has-val.input100+.focus-input100::before {
    width: 100%;
}

.input100:focus+.focus-input100::after {
    color: #a64bf4;
}

.has-val.input100+.focus-input100::after {
    color: #a64bf4;
}


/*------------------------------------------------------------------
[ Button ]*/

.container-login100-form-btn {
    display: -webkit-box;
    display: -webkit-flex;
    display: -moz-box;
    display: -ms-flexbox;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}


.wrap-login100-form-btn {
    width: 100%;
    display: block;
    position: relative;
    z-index: 1;
    border-radius: 25px;
    overflow: hidden;
    margin: 0 auto;
    box-shadow: 0 5px 30px 0px rgba(0, 0, 0, 0.2);
    -moz-box-shadow: 0 5px 30px 0px rgba(0, 0, 0, 0.2);
    -webkit-box-shadow: 0 5px 30px 0px rgba(0, 0, 0, 0.2);
    -o-box-shadow: 0 5px 30px 0px rgba(0, 0, 0, 0.2);
    -ms-box-shadow: 0 5px 30px 0px rgba(0, 0, 0, 0.2);
}

.login100-form-bgbtn {
    position: absolute;
    z-index: -1;
    width: 300%;
    height: 100%;
    background: #a64bf4;
    background: -webkit-linear-gradient(right, #ca75ff, #dcabff);
    background: -o-linear-gradient(right, #ca75ff, #dcabff);
    background: -moz-linear-gradient(right, #ca75ff, #dcabff);
    background: linear-gradient(right, #ca75ff, #dcabff);
    top: 0;
    left: -100%;
    -webkit-transition: all 0.4s;
    -o-transition: all 0.4s;
    -moz-transition: all 0.4s;
    transition: all 0.4s;
}

.login100-form-btn {
    font-family: Poppins-Medium;
    font-size: 16px;
    color: rgb(255, 255, 255);
    line-height: 1.2;
    text-transform: uppercase;
    display: -webkit-box;
    display: -webkit-flex;
    display: -moz-box;
    display: -ms-flexbox;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 20px;
    width: 100%;
    height: 50px;
}

.wrap-login100-form-btn:hover .login100-form-bgbtn {
    left: 0;
}


/*------------------------------------------------------------------
[ Alert validate ]*/

.validate-input {
    position: relative;
}

.alert-validate::before {
    content: attr(data-validate);
    position: absolute;
    max-width: 70%;
    background-color: #fff;
    border: 1px solid #c80000;
    border-radius: 2px;
    padding: 4px 25px 4px 10px;
    bottom: calc((100% - 20px) / 2);
    -webkit-transform: translateY(50%);
    -moz-transform: translateY(50%);
    -ms-transform: translateY(50%);
    -o-transform: translateY(50%);
    transform: translateY(50%);
    right: 2px;
    pointer-events: none;
    font-family: Poppins-Regular;
    color: #c80000;
    font-size: 13px;
    line-height: 1.4;
    text-align: left;
    visibility: hidden;
    opacity: 0;
    -webkit-transition: opacity 0.4s;
    -o-transition: opacity 0.4s;
    -moz-transition: opacity 0.4s;
    transition: opacity 0.4s;
}

.alert-validate::after {
    content: "\f06a";
    font-family: FontAwesome;
    display: block;
    position: absolute;
    color: #c80000;
    font-size: 16px;
    bottom: calc((100% - 20px) / 2);
    -webkit-transform: translateY(50%);
    -moz-transform: translateY(50%);
    -ms-transform: translateY(50%);
    -o-transform: translateY(50%);
    transform: translateY(50%);
    right: 8px;
}

.alert-validate:hover:before {
    visibility: visible;
    opacity: 1;
}

@media (max-width: 992px) {
    .alert-validate::before {
        visibility: visible;
        opacity: 1;
    }
}


/*//////////////////////////////////////////////////////////////////
[ Social item ]*/

.login100-social-item {
    font-size: 25px;
    color: #fff;
    display: -webkit-box;
    display: -webkit-flex;
    display: -moz-box;
    display: -ms-flexbox;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin: 5px;
}

.login100-social-item:hover {
    color: #fff;
    background-color: #333333;
}


/*//////////////////////////////////////////////////////////////////
[ Responsive ]*/

@media (max-width: 576px) {
    .wrap-login100 {
        padding-left: 15px;
        padding-right: 15px;
    }
}

</style>