class characterCreation {
    constructor() {

        mp.events.add({
            'setHeadBlend:creator': (firstHeadShape, secondHeadShape, firstSkinTone, secondSkinTone, headMix, skinMix) => {
                mp.players.local.setHeadBlendData(parseInt(firstHeadShape), parseInt(secondHeadShape), 0, parseInt(firstSkinTone), parseInt(secondSkinTone), 0, headMix, skinMix, 0, false);
            },
            'setFaceFeature': (cid, scale) => {
                mp.players.local.setFaceFeature(cid, scale);
            },
            'setPlayerEyeType': (colour) => {
                mp.players.local.setEyeColor(parseInt(colour));
            },
            'setComponentVariation': (cid, draw, texture) => {
                mp.players.local.setComponentVariation(parseInt(cid), parseInt(draw), parseInt(texture), 0);
            },
            'setHairColour': (first, second) => {
                mp.players.local.setHairColor(parseInt(first), parseInt(second));
            },
            'setHeadOverlay': (id, ctype, cid) => {
                mp.players.local.setHeadOverlay(parseInt(id), parseInt(ctype), 1.0, parseInt(cid), 0);
            },
            'setPlayerFace': (entity, json) => {
                if(entity.type == 'player') {
                    entity.clearDecorations();
                    entity.setHeadBlendData(parseInt(json.mother), parseInt(json.father), 0, parseInt(json.mother), parseInt(json.father), 0, json.mix*0.01, json.skinMix*0.01, 0, false);
                    entity.setComponentVariation(2, parseInt(json.hairStyle), 0, 0);
                    entity.setHairColor(parseInt(json.hairColour), parseInt(json.hairHighlights));
                    entity.setHeadOverlay(1, parseInt(json.facialHairStyle), 1.0, parseInt(json.facialHairColour), 0);
                    entity.setEyeColor(parseInt(json.eyeColour));
                    entity.setHeadOverlay(10, parseInt(json.chestHairStyle), 1.0, 0, 0);
                    entity.setHeadOverlay(2, parseInt(json.eyebrowsStyle), 1.0, parseInt(json.eyebrowsColour), 0);
                    entity.setHeadOverlay(5, parseInt(json.blushStyle), 1.0, parseInt(json.blushColour), 0);
                    entity.setHeadOverlay(8, parseInt(json.lipstick), 1.0, 0, 0);
                    entity.setHeadOverlay(0, parseInt(json.blemishes), 1.0, 0, 0);
                    entity.setHeadOverlay(3, parseInt(json.ageing), 1.0, 0, 0);
                    entity.setHeadOverlay(6, parseInt(json.complexion), 1.0, 0, 0);
                    entity.setHeadOverlay(7, parseInt(json.sunDamage), 1.0, 0, 0);
                    entity.setHeadOverlay(9, parseInt(json.molesFreckles), 1.0, 0, 0);
                    entity.setHeadOverlay(4, parseInt(json.makeup), 1.0, 0, 0);
                    entity.setFaceFeature(0, parseInt(json.noseWidth));
                    entity.setFaceFeature(1, parseInt(json.noseHeight));
                    entity.setFaceFeature(2, parseInt(json.noseLength));
                    entity.setFaceFeature(3, parseInt(json.noseBridge));
                    entity.setFaceFeature(4, parseInt(json.noseTip));
                    entity.setFaceFeature(5, parseInt(json.noseShift));
                    entity.setFaceFeature(6, parseInt(json.browHeight));
                    entity.setFaceFeature(7, parseInt(json.browWidth));
                    entity.setFaceFeature(8, parseInt(json.cheekboneHeight));
                    entity.setFaceFeature(9, parseInt(json.cheekboneWidth));
                    entity.setFaceFeature(10, parseInt(json.cheeksWidth));
                    entity.setFaceFeature(11, parseInt(json.eyes));
                    entity.setFaceFeature(12, parseInt(json.lips));
                    entity.setFaceFeature(13, parseInt(json.jawWidth));
                    entity.setFaceFeature(14, parseInt(json.jawHeight));
                    entity.setFaceFeature(15, parseInt(json.chinLength));
                    entity.setFaceFeature(16, parseInt(json.chinPosition));
                    entity.setFaceFeature(17, parseInt(json.chinWidth));
                    entity.setFaceFeature(18, parseInt(json.chinShape));
                    entity.setFaceFeature(19, parseInt(json.neckWidth));
                }
            }
        })
    }
}
new characterCreation()