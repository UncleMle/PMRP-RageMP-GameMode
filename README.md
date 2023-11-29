# PMRP RageMP Gamemode

Created using NodeJS, Sequelize, VueJS and Express.

### Contact

You can contact me at 

-Discord unclemole <br>
-Gamemodes discord server https://discord.gg/6WKZt68qJT

### How to Install

###### 1. First navigate to ``packages/config/config.json`` to edit your sequelize configuration. Enter your MySQL server credentials.
```typescript
{
  "development": {
    "username": "root",
    "password": "%e58s6LodGMl",
    "database": "pmrp_db",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "logging": false
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "ragedev",
    "password": "password",
    "database": "ragedev_db",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "logging": false
  }
}
```
###### 2. Acquire the RAGEMP server binary and place it in the root directory.
<img src="https://i.imgur.com/dQudDwL.png">

###### 3. You should now be able to run the .exe file and start the gamemode.

# Misc

This gamemode also comes with a UCP and discord intergration which can both be ran seperatetly from the main game server.

Discord Intergration: ``packages/discord``

Web Panel: ``pmrp-ucp\client``

# In game images
<img src="https://i.imgur.com/3VpzVNH.png">
<img src="https://i.imgur.com/RMxI1Y6.png">
<img src="https://i.imgur.com/AsdkgrH.png">
<img src="https://i.imgur.com/kSEFRD5.png">
<img src="https://i.imgur.com/N6tGesU.png">
<img src="https://i.imgur.com/0p6nTwR.png">
<img src="https://i.imgur.com/Lh3ciRd.png">
<img src="https://i.imgur.com/035KaSS.png">
<img src="https://i.imgur.com/F1KAaWp.png">
<img src="https://i.imgur.com/68aUPRD.png">
<img src="https://i.imgur.com/iUVlmB7.png">
