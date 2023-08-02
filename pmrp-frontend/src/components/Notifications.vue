<template>
  <div class="notifications">
  </div>
</template>

<script>
import Vue from "vue";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

Vue.use(Toast, {
  transition: "Vue-Toastification__bounce",
  maxToasts: 4,
  newestOnTop: true
});

export default {
  name: 'ThisNotifications',
  methods: {
    showNotification: function(text, progbar, dragbl, timeout, iconpic) {
      this.$toast(text, {
        toastClassName: ["pmrp"],
        position: "top-right",
        timeout: timeout,
        closeOnClick: progbar,
        pauseOnFocusLoss: true,
        pauseOnHover: true,
        draggable: dragbl,
        draggablePercent: 0.6,
        showCloseButtonOnHover: false,
        hideProgressBar: progbar,
        closeButton: "button",
        icon: iconpic,
        rtl: false,
      });
    },
    clearAll: function() {
      this.$toast.clear()
    },
    sendError:function(msg, time) {
      this.$toast.error(msg, {
        toastClassName: ["errorNotif"],
        position: "bottom-center",
        timeout: time,
      });
    },
    success:function(msg, time) {
      this.$toast.success(msg, {
        position: "bottom-center",
        timeout: time,
        icon: "fa-solid fa-square-check"
      });
    },
  }
}
</script>

<style >

.Vue-Toastification__progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 5px;
  z-index: 10000;
  background-color: rgba(255, 255, 255, 0.9);
  transform-origin: left;
  animation: scale-x-frames linear 1 forwards;
}
</style>
