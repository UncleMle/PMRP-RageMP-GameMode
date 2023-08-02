/*
    krane#2890 for FiveM or RageMP development
*/

let CONFIG = {
    "NPC": {
        "x": 1486.23,
        "y": -1930.59,
        "z": 71.03,
        "heading": 230.04,
        "model": "s_m_m_dockwork_01",
        "is_networked": false,
    },
    
    "Garage": {
        "x": 1488.33,
        "y": -1922.87,
        "z": 71.20,
    },

    "teleports": [
        [
            {
                "x": 736.64,
                "y": 132.20,
                "z": 80.71,
            }, //entrance
            {
                "x": 721.35,
                "y": 138.98,
                "z": 80.75,
            }, //exit
        ],
    ],

    "broken_panels": [
        {
            "x": 703.33,
            "y": 102.22,
            "z": 80.93,
        },
    ],
}

exports.CONFIG = CONFIG;