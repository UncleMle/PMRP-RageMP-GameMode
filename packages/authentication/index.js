require('./database.js');

const consoleColours = require('@jshor/colors');

mp.log = (message) => {
    let getDateString = () => {
        const date = new Date();
        const h = "0" + date.getHours().toString();
        const m = "0" + date.getMinutes().toString();
        const s = "0" + date.getSeconds().toString();
        const d = date.getDay();
        const month = date.getMonth();
        const y = date.getFullYear();
        return `[${y}/${month < 10 ? "0"+month : month}/${d < 10 ? "0"+d : d}] [${h.substr(h.length - 2)}:${m.substr(m.length - 2)}:${s.substr(s.length - 2)}]`.gray+" [PMRP]".brightMagenta;
    };
    console.log(`${getDateString()} ${message}`);
}
require('./authCore.js');