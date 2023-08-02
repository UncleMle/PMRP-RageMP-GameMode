const jwt = require('jsonwebtoken');
const db = require('../models');

exports.auth = async function auth(token) {
    if(!token) return false;
    try {
        const decoded = jwt.verify(token, "jwtPrivateKey");
        return decoded ? true : false ;
    } catch(e) {
        mp.log(e);
        return false;
    }
}

exports.checkTokenAdmin = async function checkTokenAdmin(token) {
    if(!token) return false;
    db.web_tokens.findAll({ where: {token: token} }).then(tokenCheck => {
        if(tokenCheck.length > 0) {
            console.log(tokenCheck[0].adminLevel);
            return tokenCheck[0].adminLevel;
        } else return false;
    })
}

exports.getUnix = function getUnix() {
    return Math.round(Date.now() / 1000);
}

exports.checkVal = function checkVal(type, str) {
    switch(type) {
        case 'num':
        {
            return /\d/.test(str);
        }
        case 'alp':
        {
            return /[a-zA-Z]/g.test(str);
        }
        default: break;
    }
}

exports.formatUnix = function formatUnix(unixTimestamp) {
    let date = new Date(unixTimestamp * 1000);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

exports.sendErr = function sendErr(res, handle) {
    switch(handle) {
        case 'auth':
        {
            res.status(401).send({
                status: false,
                error: `You are not authorized to access this resource`
            })
            break;
        }
        case 'inval':
        {
            res.status(401).send({
                status: false,
                error: `Invalid token`
            })
        }
        case 'param':
        {
            res.status(400).send({
                status: false,
                error: `Parameter Mismatch`
            })
        }
        default: break;
    }
}

exports.checkOnline = function checkOnline(propType, id) {
    var foundP = false;
    mp.players.forEach(ps => {
        if(ps[propType] == id) {
            foundP = true;
        }
    })
    return foundP;
}

