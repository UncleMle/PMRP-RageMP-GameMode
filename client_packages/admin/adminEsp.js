class EntityDimension {
	constructor() {
        this.player = mp.players.local

        mp.events.add({
            'render': () => {
                if(this.player.hasHud && this.player.getVariable('adminDuty') && this.player.getVariable('adminFly') || this.player.getVariable('adminDuty') && this.player.getVariable('adminLevel') == 8 && this.player.hasHud) {
                    this.drawBoundingBoxes()
                }
                mp.players.forEachInStreamRange((ps) => {if(ps.getVariable('adminFly')) { ps.setAlpha(0) } else if(!this.player.getVariable('adminFly') || !this.player.hasHud) { ps.setAlpha(255) }})
            }
        })
	};

    drawBoundingBoxes() {
        mp.players.forEachInStreamRange((ent) => {
            if(ent && ent.handle != mp.players.local.handle) {
                if(mp.players.local.espBox == true) {
                    let corners = []

                    ent.setAlpha(120);

                    const { minimum, maximum }= mp.game.gameplay.getModelDimensions(ent.model);

                    this.min = minimum;
                    this.max = maximum;

                    this.center = new mp.Vector3(
                        (minimum.x + maximum.x) / 2,
                        (minimum.y + maximum.y) / 2,
                        (minimum.z + maximum.z) / 2
                    );

                    corners[0] = new mp.Vector3(this.min.x, this.max.y, this.max.z);
                    corners[1] = new mp.Vector3(this.max.x, this.max.y, this.max.z);
                    corners[2] = new mp.Vector3(this.max.x, this.min.y, this.max.z);
                    corners[3] = new mp.Vector3(this.min.x, this.min.y, this.max.z);
                    corners[4] = new mp.Vector3(this.min.x, this.max.y, this.min.z);
                    corners[5] = new mp.Vector3(this.max.x, this.max.y, this.min.z);
                    corners[6] = new mp.Vector3(this.max.x, this.min.y, this.min.z);
                    corners[7] = new mp.Vector3(this.min.x, this.min.y, this.min.z);

                    const c1 = ent.getOffsetFromInWorldCoords(corners[0].x, corners[0].y, corners[0].z);
                    const c2 = ent.getOffsetFromInWorldCoords(corners[1].x, corners[1].y, corners[1].z);
                    const c3 = ent.getOffsetFromInWorldCoords(corners[2].x, corners[2].y, corners[2].z);
                    const c4 = ent.getOffsetFromInWorldCoords(corners[3].x, corners[3].y, corners[3].z);
                    const c5 = ent.getOffsetFromInWorldCoords(corners[4].x, corners[4].y, corners[4].z);
                    const c6 = ent.getOffsetFromInWorldCoords(corners[5].x, corners[5].y, corners[5].z);
                    const c7 = ent.getOffsetFromInWorldCoords(corners[6].x, corners[6].y, corners[6].z);
                    const c8 = ent.getOffsetFromInWorldCoords(corners[7].x, corners[7].y, corners[7].z);

                    // top
                    mp.game.graphics.drawLine(c1.x, c1.y, c1.z, c2.x, c2.y, c2.z, 244, 155, 255, 255);
                    mp.game.graphics.drawLine(c2.x, c2.y, c2.z, c3.x, c3.y, c3.z, 244, 155, 255, 255);
                    mp.game.graphics.drawLine(c3.x, c3.y, c3.z, c4.x, c4.y, c4.z, 244, 155, 255, 255);
                    mp.game.graphics.drawLine(c4.x, c4.y, c4.z, c1.x, c1.y, c1.z, 244, 155, 255, 255);

                    // bottom
                    mp.game.graphics.drawLine(c5.x, c5.y, c5.z, c6.x, c6.y, c6.z, 255, 0, 0, 255);
                    mp.game.graphics.drawLine(c6.x, c6.y, c6.z, c7.x, c7.y, c7.z, 255, 0, 0, 255);
                    mp.game.graphics.drawLine(c7.x, c7.y, c7.z, c8.x, c8.y, c8.z, 255, 0, 0, 255);
                    mp.game.graphics.drawLine(c8.x, c8.y, c8.z, c5.x, c5.y, c5.z, 255, 0, 0, 255);

                    // sides
                    mp.game.graphics.drawLine(c1.x, c1.y, c1.z, c5.x, c5.y, c5.z, 155, 255, 245, 255);
                    mp.game.graphics.drawLine(c2.x, c2.y, c2.z, c6.x, c6.y, c6.z, 155, 255, 245, 255);
                    mp.game.graphics.drawLine(c3.x, c3.y, c3.z, c7.x, c7.y, c7.z, 155, 255, 245, 255);
                    mp.game.graphics.drawLine(c4.x, c4.y, c4.z, c8.x, c8.y, c8.z, 155, 255, 245, 255);
                }

                if(mp.players.local.espSkel == true) {
                    ent.setAlpha(120);
                    var rootBone = ent.getBoneCoords(0, 0, 0, 0);
                    var head = ent.getBoneCoords(12844, 0, 0, 0);
                    var rightF = ent.getBoneCoords(52301, 0, 0, 0);
                    var leftF = ent.getBoneCoords(14201, 0, 0, 0)
                    var leftH = ent.getBoneCoords(18905, 0, 0, 0)
                    var rightH = ent.getBoneCoords(57005, 0, 0, 0)

                    mp.game.graphics.drawLine(rootBone.x, rootBone.y, rootBone.z, head.x, head.y, head.z, 155, 255, 245, 255);
                    mp.game.graphics.drawLine(rightF.x, rightF.y, rightF.z, rootBone.x, rootBone.y, rootBone.z, 155, 255, 245, 255);
                    mp.game.graphics.drawLine(leftF.x, leftF.y, leftF.z, rootBone.x, rootBone.y, rootBone.z, 155, 255, 245, 255);
                    mp.game.graphics.drawLine(head.x, head.y, head.z, leftH.x, leftH.y, leftH.z, 155, 255, 245, 255);
                    mp.game.graphics.drawLine(head.x, head.y, head.z, rightH.x, rightH.y, rightH.z, 155, 255, 245, 255);
                }

            }
        })
        mp.vehicles.forEachInStreamRange((ent) => {
            if(ent && mp.players.local.espBox == true) {
                let corners = []

                const { minimum, maximum }= mp.game.gameplay.getModelDimensions(ent.model);

                this.min = minimum;
                this.max = maximum;

                this.center = new mp.Vector3(
                    (minimum.x + maximum.x) / 2,
                    (minimum.y + maximum.y) / 2,
                    (minimum.z + maximum.z) / 2
                );

                corners[0] = new mp.Vector3(this.min.x, this.max.y, this.max.z);
                corners[1] = new mp.Vector3(this.max.x, this.max.y, this.max.z);
                corners[2] = new mp.Vector3(this.max.x, this.min.y, this.max.z);
                corners[3] = new mp.Vector3(this.min.x, this.min.y, this.max.z);
                corners[4] = new mp.Vector3(this.min.x, this.max.y, this.min.z);
                corners[5] = new mp.Vector3(this.max.x, this.max.y, this.min.z);
                corners[6] = new mp.Vector3(this.max.x, this.min.y, this.min.z);
                corners[7] = new mp.Vector3(this.min.x, this.min.y, this.min.z);

                const c1 = ent.getOffsetFromInWorldCoords(corners[0].x, corners[0].y, corners[0].z);
                const c2 = ent.getOffsetFromInWorldCoords(corners[1].x, corners[1].y, corners[1].z);
                const c3 = ent.getOffsetFromInWorldCoords(corners[2].x, corners[2].y, corners[2].z);
                const c4 = ent.getOffsetFromInWorldCoords(corners[3].x, corners[3].y, corners[3].z);
                const c5 = ent.getOffsetFromInWorldCoords(corners[4].x, corners[4].y, corners[4].z);
                const c6 = ent.getOffsetFromInWorldCoords(corners[5].x, corners[5].y, corners[5].z);
                const c7 = ent.getOffsetFromInWorldCoords(corners[6].x, corners[6].y, corners[6].z);
                const c8 = ent.getOffsetFromInWorldCoords(corners[7].x, corners[7].y, corners[7].z);

                // top
                mp.game.graphics.drawLine(c1.x, c1.y, c1.z, c2.x, c2.y, c2.z, 244, 155, 255, 255);
                mp.game.graphics.drawLine(c2.x, c2.y, c2.z, c3.x, c3.y, c3.z, 244, 155, 255, 255);
                mp.game.graphics.drawLine(c3.x, c3.y, c3.z, c4.x, c4.y, c4.z, 244, 155, 255, 255);
                mp.game.graphics.drawLine(c4.x, c4.y, c4.z, c1.x, c1.y, c1.z, 244, 155, 255, 255);

                // bottom
                mp.game.graphics.drawLine(c5.x, c5.y, c5.z, c6.x, c6.y, c6.z, 255, 0, 0, 255);
                mp.game.graphics.drawLine(c6.x, c6.y, c6.z, c7.x, c7.y, c7.z, 255, 0, 0, 255);
                mp.game.graphics.drawLine(c7.x, c7.y, c7.z, c8.x, c8.y, c8.z, 255, 0, 0, 255);
                mp.game.graphics.drawLine(c8.x, c8.y, c8.z, c5.x, c5.y, c5.z, 255, 0, 0, 255);

                // sides
                mp.game.graphics.drawLine(c1.x, c1.y, c1.z, c5.x, c5.y, c5.z, 155, 255, 245, 255);
                mp.game.graphics.drawLine(c2.x, c2.y, c2.z, c6.x, c6.y, c6.z, 155, 255, 245, 255);
                mp.game.graphics.drawLine(c3.x, c3.y, c3.z, c7.x, c7.y, c7.z, 155, 255, 245, 255);
                mp.game.graphics.drawLine(c4.x, c4.y, c4.z, c8.x, c8.y, c8.z, 155, 255, 245, 255);
            }
        })
        mp.objects.forEachInStreamRange((ent) => {
            if(ent && mp.players.local.espTags == true && mp.players.local.espBox == true) {
                let corners = []

                const { minimum, maximum }= mp.game.gameplay.getModelDimensions(ent.model);

                this.min = minimum;
                this.max = maximum;

                this.center = new mp.Vector3(
                    (minimum.x + maximum.x) / 2,
                    (minimum.y + maximum.y) / 2,
                    (minimum.z + maximum.z) / 2
                );

                corners[0] = new mp.Vector3(this.min.x, this.max.y, this.max.z);
                corners[1] = new mp.Vector3(this.max.x, this.max.y, this.max.z);
                corners[2] = new mp.Vector3(this.max.x, this.min.y, this.max.z);
                corners[3] = new mp.Vector3(this.min.x, this.min.y, this.max.z);
                corners[4] = new mp.Vector3(this.min.x, this.max.y, this.min.z);
                corners[5] = new mp.Vector3(this.max.x, this.max.y, this.min.z);
                corners[6] = new mp.Vector3(this.max.x, this.min.y, this.min.z);
                corners[7] = new mp.Vector3(this.min.x, this.min.y, this.min.z);

                const c1 = ent.getOffsetFromInWorldCoords(corners[0].x, corners[0].y, corners[0].z);
                const c2 = ent.getOffsetFromInWorldCoords(corners[1].x, corners[1].y, corners[1].z);
                const c3 = ent.getOffsetFromInWorldCoords(corners[2].x, corners[2].y, corners[2].z);
                const c4 = ent.getOffsetFromInWorldCoords(corners[3].x, corners[3].y, corners[3].z);
                const c5 = ent.getOffsetFromInWorldCoords(corners[4].x, corners[4].y, corners[4].z);
                const c6 = ent.getOffsetFromInWorldCoords(corners[5].x, corners[5].y, corners[5].z);
                const c7 = ent.getOffsetFromInWorldCoords(corners[6].x, corners[6].y, corners[6].z);
                const c8 = ent.getOffsetFromInWorldCoords(corners[7].x, corners[7].y, corners[7].z);

                // top
                mp.game.graphics.drawLine(c1.x, c1.y, c1.z, c2.x, c2.y, c2.z, 244, 155, 255, 255);
                mp.game.graphics.drawLine(c2.x, c2.y, c2.z, c3.x, c3.y, c3.z, 244, 155, 255, 255);
                mp.game.graphics.drawLine(c3.x, c3.y, c3.z, c4.x, c4.y, c4.z, 244, 155, 255, 255);
                mp.game.graphics.drawLine(c4.x, c4.y, c4.z, c1.x, c1.y, c1.z, 244, 155, 255, 255);

                // bottom
                mp.game.graphics.drawLine(c5.x, c5.y, c5.z, c6.x, c6.y, c6.z, 255, 0, 0, 255);
                mp.game.graphics.drawLine(c6.x, c6.y, c6.z, c7.x, c7.y, c7.z, 255, 0, 0, 255);
                mp.game.graphics.drawLine(c7.x, c7.y, c7.z, c8.x, c8.y, c8.z, 255, 0, 0, 255);
                mp.game.graphics.drawLine(c8.x, c8.y, c8.z, c5.x, c5.y, c5.z, 255, 0, 0, 255);

                // sides
                mp.game.graphics.drawLine(c1.x, c1.y, c1.z, c5.x, c5.y, c5.z, 155, 255, 245, 255);
                mp.game.graphics.drawLine(c2.x, c2.y, c2.z, c6.x, c6.y, c6.z, 155, 255, 245, 255);
                mp.game.graphics.drawLine(c3.x, c3.y, c3.z, c7.x, c7.y, c7.z, 155, 255, 245, 255);
                mp.game.graphics.drawLine(c4.x, c4.y, c4.z, c8.x, c8.y, c8.z, 155, 255, 245, 255);

                var position = ent.position;
                var clientP = mp.players.local.position
                mp.game.graphics.drawText(ent.model + `ID: ${ent.remoteId} | DIM: ${ent.dimension} | TYPE: ${ent.type} | DIST: ${Math.floor(mp.game.system.vdist(clientP.x, clientP.y, clientP.z, position.x, position.y, position.z))}`, [position.x, position.y, position.z-0.5], {
                    scale: [0.26, 0.26],
                    outline: true,
                    color: [255, 255, 255, 255],
                    font: 4
                });
            }
        })
    };
};
new EntityDimension()


