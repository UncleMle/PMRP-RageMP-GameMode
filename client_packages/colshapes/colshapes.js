
setInterval(() => {
  const { position, dimension } = mp.players.local;

  mp.polygons.pool.map((polygon) => {

    if (polygon.colliding) {
      if (!mp.polygons.isPositionWithinPolygon(position, polygon, dimension)) {
        polygon.colliding = false;
        mp.events.call('playerLeavePolygon', polygon);
      }
    }
    else {
      if (mp.polygons.isPositionWithinPolygon(position, polygon, dimension)) {
        polygon.colliding = true;
        mp.events.call('playerEnterPolygon', polygon);
      }
    }
  });

}, 100);

mp.events.add('render', () => {

  mp.polygons.pool?.forEach(polygon => {
    if (!polygon.visible) return;

    const { vertices, height, lineColorRGBA } = polygon;

    vertices.forEach((vertex, index) => {

      const nextVertex = index  === (vertices.length - 1) ?  vertices[0] : vertices[index + 1];

      // Deepness lower line
      mp.game.graphics.drawLine(vertex.x, vertex.y, vertex.z, nextVertex.x, nextVertex.y, nextVertex.z, ...lineColorRGBA);

      // Current vertex height line
      mp.game.graphics.drawLine(vertex.x, vertex.y, vertex.z, vertex.x, vertex.y, vertex.z + height, ...lineColorRGBA);

      // Next vertex height line
      mp.game.graphics.drawLine(nextVertex.x, nextVertex.y, nextVertex.z, nextVertex.x, nextVertex.y, nextVertex.z + height, ...lineColorRGBA);

      // Deepness higher line
      mp.game.graphics.drawLine(vertex.x, vertex.y, vertex.z + height, nextVertex.x, nextVertex.y, nextVertex.z + height, ...lineColorRGBA);
    });

  });

});

const isPointInArea2D = (point, area) => {
  let x = point[0], y = point[1];

  let inside = false;

  for (let i = 0, j = area.length - 1; i < area.length; j = i++) {
      let xi = area[i][0], yi = area[i][1];
      let xj = area[j][0], yj = area[j][1];

      let intersect = ((yi > y) != (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

      if (intersect)
        inside = !inside;
  }

  return inside;
};

const TWOPI = 6.283185307179586476925287;
const EPSILON = 0.0000001;

const modulus = (p) => Math.sqrt((p.x * p.x) + (p.y * p.y) + (p.z *p.z));

const getAngleSumBetweenPositionAndVertices = (position, vertices) => {
   let i;
   let m1, m2;
   let anglesum=0, costheta;

   for (i = 0; i < vertices.length; i++) {

      const p1 = new mp.Vector3(vertices[i].x - position.x, vertices[i].y - position.y, vertices[i].z - position.z);
      const p2 = new mp.Vector3(vertices[(i+1)%vertices.length].x - position.x, vertices[(i+1)%vertices.length].y - position.y, vertices[(i+1)%vertices.length].z - position.z);

      m1 = modulus(p1);
      m2 = modulus(p2);

      if (m1*m2 <= EPSILON)
         return(TWOPI);
      else
         costheta = (p1.x*p2.x + p1.y*p2.y + p1.z*p2.z) / (m1*m2);

      anglesum += Math.acos(costheta);
   }
   return(anglesum);
}

const generateUniquePolygonId = () => {
  const timestamp = Date.now();
  return mp.polygons.pool.some(p => p.id === timestamp) ? generateUniquePolygonId() : timestamp;
};


mp.polygons = {
  pool: [],
  add: (vertices, height, options = { visible: false, lineColorRGBA: [255, 255, 255, 255], dimension: 0 }) => {

    const polygon = {
      id: generateUniquePolygonId(),
      vertices,
      height,
      ...options,
      colliding: false
    }

    mp.polygons.pool.push(polygon);

    return polygon;
  },
  remove: (polygon) => {
    const index = mp.polygons.pool.findIndex(p => p.id === polygon.id);

    if (index !== -1)
      mp.polygons.pool.splice(index, 1);
  },
  exists: (polygon) => {
    return mp.polygons.pool.some(p => p.id === polygon.id)
  },
  isPositionWithinPolygon: (position, polygon, dimension) => {
    if (dimension && polygon.dimension !== dimension && polygon.dimension !== -1)
      return false;

    const { vertices } = polygon;

    const polygonPoints2D = [];

    for (let i in vertices) {
      if (position.z >= vertices[i].z && position.z <= (vertices[i].z + polygon.height) || getAngleSumBetweenPositionAndVertices(position, vertices) >= 5.8)
        polygonPoints2D.push([vertices[i].x, vertices[i].y]);
      else
        return false;
    }

    return isPointInArea2D([position.x, position.y], polygonPoints2D);
  }
}

mp.events.add({
  'csst': () => {
    var position = mp.players.local.position
    const polygon = mp.polygons.add([new mp.Vector3(position.x, position.y, position.z-2), new mp.Vector3(position.x, position.y, position.z-2), new mp.Vector3(position.x, position.y, position.z-2)], 10, { visible: true, lineColorRGBA: [255, 255, 255, 255], dimension: 0 });

    // Set the polygon lines visible
    polygon.visible = true;

    // Modifying a polygon height
    polygon.height = 10;

    // Modifying a polygon color (RGBA)
    polygon.lineColorRGBA = [255, 155, 0, 255];

    mp.gui.chat.push('Polygon data: '+JSON.stringify(polygon))
  },
  'playerEnterPolygon': (polygon) => {
    mp.gui.chat.push(`You entered the polygon ${polygon.id}!`)
  },
  'playerLeavePolygon': (polygon) => {
    mp.gui.chat.push(`You left the polygon ${polygon.id}.`)
  }
})