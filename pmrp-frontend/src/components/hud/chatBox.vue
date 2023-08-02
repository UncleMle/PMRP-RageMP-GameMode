<template>
    <div v-if="hudState">
      <div v-if="showChat" id="chat">
        <ul id="chat_messages">
          <li v-for="(item, message) in chatMessages" :key="'B' + message" v-html="item.toString()">
          </li>
        </ul>
        <input v-show="showInput"  v-model="inputText" ref="input" id="chat_msg" type="text" />
        <li v-for="(item, cmd) in queryCmds" :key="'B' + cmd" class="suggestionDropDown">
          <ul class="itemSel" v-html="item"></ul>
        </li>
      </div>
    </div>

  </template>

  <script>
/* eslint-disable */
import { mapGetters } from "vuex";

export default {
  name: "RageMPChat",

  keys: {
    KEY_T: 84,
    KEY_ENTER: 13,
    KEY_ARR_UP: 38,
    KEY_ARR_DOWN: 40,
    KEY_TAB: 9
  },

  data() {
    return {
      showInput: false,
      showChat: true,
      chatMessages: [],
      inputText: "",
      active: true,
      lastMsg: "",
      playerMessages: [],
      countPos: 0,
      allCmds: [
        `/stats`,
        "/time",
        `/alias <font color="yellow">[id] [name]`,
        `/shout <font color="yellow">[message]`,
        `/low <font color="yellow">[message]`,
        `/question <font color="yellow">[message]`,
        `/ame <font color="yellow">[message]`,
        `/me <font color="yellow">[message]`,
        `/do <font color="yellow">[message]`,
        `/givecash <font color="yellow">[Name/ID] [amount]`,
        `/whisper <font color="yellow">[id] [message]`,
        `/b <font color="yellow">[message]`,
        `/carwhisper <font color="yellow">[message]`,
        `/pm <font color="yellow">[Name/ID] [message]`,
        "/help"
      ],
      queryCmds: []
    };
  },

  created() {
  setInterval(() => {
    if(!this.active) {
      this.show(false);
    }
  }, 3000);
  },

  computed: {
    ...mapGetters({
      hudState: "getHudState",
      inputStat: "chatStat"
    })
  },

  watch: {
    inputText(newType, oldType) {
      var result = [];
      if (newType.length && newType[0] === "/") {
        result = this.allCmds.filter(keyword => {
          return keyword.toLowerCase().includes(newType.toLowerCase());
        });
        result.map(cmdList => {
          if (this.queryCmds.indexOf(cmdList) !== -1 || result.length == 0)
            return (this.queryCmds = []);
          return this.queryCmds.push(cmdList);
        });
      }
    }
  },

  methods: {
    addKeyListener(e) {
      if (e.keyCode == 32 && e.target == document.body) {
        e.preventDefault();
      }
      if (!this.hudState) return;

      if(e.which === this.$options.keys.KEY_T) {
        this.active = true, this.showChat = true
      }

      if (
        e.which === this.$options.keys.KEY_T &&
        !this.showInput &&
        this.active &&
        this.inputStat
      ) {
        this.enableChatInput(true);
        e.preventDefault();
        return;
      }

      if (e.which === this.$options.keys.KEY_ENTER && this.showInput) {
        this.queryCmds = [];
        if (this.inputText == undefined || this.inputText == null) {
          return this.enableChatInput(false);
        }
        if (!this.inputText || this.inputText.length == 0) {
          return this.enableChatInput(false);
        }

        this.countPos = 0;
        let text = this.inputText;
        this.playerMessages.push(text);
        this.lastMsg = text;

        this.enableChatInput(false);

        if (!text || text.length == 0) {
          return;
        }

        if (text.charAt(0) !== "/") {
          mp.invoke("chatMessage", text);
          return;
        }

        text = text.substr(1);

        if (text.length) {
          mp.invoke("command", text);
        }
      }

      if (e.which === this.$options.keys.KEY_ARR_UP && this.showInput) {
        this.inputText = this.playerMessages.slice().reverse()[this.countPos++];
        this.$nextTick(() => this.setCaretPosition(this.$refs.input, 5));
      }
      if (e.which === this.$options.keys.KEY_ARR_DOWN && this.showInput) {
        this.inputText = this.playerMessages.slice().reverse()[this.countPos--];
      }
      if (e.which === this.$options.keys.KEY_TAB && this.showInput) {
        if (this.queryCmds[0] !== undefined) {
          this.inputText = this.queryCmds[0].split(" ")[0];
        }
      }
    },

    push(text) {
      this.chatMessages.unshift(text);
    },

    clear() {
      this.chatMessages.length = 0;
    },

    enableChatInput(enable) {
      if (!this.active && enable) {
        return;
      }

      if (enable !== this.showInput) {
        mp.invoke("focus", enable);
        mp.invoke("setTypingInChatState", enable);

        this.showInput = enable;
        this.inputText = "";
        enable && this.$nextTick().then(() => this.$refs.input.focus());
      }
    },

    activate(toggle) {
      if (!toggle && this.showInput) {
        this.enableChatInput(false);
      }
      this.active = toggle;
    },

    show(toggle) {
      if (!toggle && this.showInput) {
        this.enableChatInput(false);
      }
      this.showChat = toggle;
    },

    setCaretPosition(ctrl, pos) {
      ctrl.focus();
      ctrl.setSelectionRange(pos, pos);
    }
  },
  created() {
    if (mp.events) {
      const api = {
        "chat:push": this.push,
        "chat:clear": this.clear,
        "chat:activate": this.activate,
        "chat:show": this.show,
        "msg:send": this.push
      };

      for (const fn in api) {
        mp.events.add(fn, api[fn]);
      }
    }

    document.addEventListener("keydown", this.addKeyListener);


    document.addEventListener("DOMContentLoaded", onDocumentReady);
  },

  beforeUnmount() {
    document.removeEventListener("keydown", this.addKeyListener);
  },

  mounted() {
    this.showChat = true;
  }
};
</script>


  <style scoped>
*,
body,
html {
  opacity: 1;
  padding: 0;
  margin: 0;
  font-family: Myriad Pro, Segoe UI, Verdana, sans-serif;
  font-weight: 510;
  font-size: 16px;
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

#chat,
a,
body,
html {
  color: #fff;
}

body,
html {
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
  -webkit-transition: all 0.4s;
  -webkit-user-select: none;
}

#chat {
  width: 800px;
  line-height: 24px;
  font-weight: 700;
  text-shadow: -33px -33px 2 #000, 33px -33px 2 #000, -33px 33px 2 #000,
    33px 33px 2 #000;
  text-shadow: 0 0 5px #000000, 0 0 6px #000000;
  font-family: "Arial", sans-serif;
  font-size: 16px;
  margin-left: 15px;
}

@media screen and (min-height: 1080px) {
  #chat {
    font-size: 18px !important;
    font-weight: 700;
  }
}

#chat ul#chat_messages {
  height: 285px;
  margin-top: 1vh;
  transform: rotate(180deg);
  padding: 10px 20px;
  list-style-type: none;
  overflow: auto;
}

#chat ul#chat_messages > li {
  transform: rotate(-180deg);
}

#chat input#chat_msg {
  background-color: rgba(0, 0, 0, 0.425);
  color: white;
  outline: none;
  border-left: none;
  border-right: none;
  border-top: none;
  border-bottom: none;
  width: 800px;
  height: 3.12em;
  padding: 0 0.5em 0 0.5em;
  margin-top: 0.5em;
}

.suggestionDropDown {
  padding: 0 0.5em 0 0.5em;
  background-color: rgba(0, 0, 0, 0.425);
  color: rgb(169, 167, 167);
  border-left: solid rgb(121, 121, 121) 3px;
}

::-webkit-scrollbar {
  width: 0.4vw;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.425);
  border-radius: 20px;
}
</style>