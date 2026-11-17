// Procedural sun-soaked coastal city generator for Sol del Mar

export const WORLD_BOUNDS = {
  minX: -560,
  maxX: 560,
  minZ: -560,
  maxZ: 560,
  size: 1120,
  roadWidth: 18,
  sidewalkWidth: 4.5,
  seaLevel: -0.95,
  beachStartX: 292,
  oceanStartX: 352,
  harborNorthZ: 386,
  harborWestX: 92,
};

export const ROAD_X = [-440, -330, -220, -110, 0, 110, 220, 278];
export const ROAD_Z = [-440, -330, -220, -110, 0, 110, 220, 330, 440];

export const DISTRICTS = [
  {
    id: 'miramar',
    name: 'Miramar Beach',
    minX: 165,
    maxX: 560,
    minZ: -385,
    maxZ: 165,
    groundColor: 0xe6d2a2,
    mapColor: '#e8cf95',
    accentColor: 0xff6fa5,
    minFloors: 3,
    maxFloors: 9,
    speedLimit: 19,
    palette: [0xf7e7ce, 0xf6c9d6, 0xbbeee4, 0xffe0b5, 0xd8ecff],
  },
  {
    id: 'downtown',
    name: 'Solis Downtown',
    minX: -165,
    maxX: 165,
    minZ: -275,
    maxZ: 165,
    groundColor: 0x3b424e,
    mapColor: '#485468',
    accentColor: 0x4ad9ff,
    minFloors: 10,
    maxFloors: 26,
    speedLimit: 22,
    palette: [0x6e85a6, 0x52647d, 0x8aa0ba, 0x45566e, 0x9fb3c8],
  },
  {
    id: 'marina',
    name: 'Bahia Marina',
    minX: 165,
    maxX: 560,
    minZ: 165,
    maxZ: 386,
    groundColor: 0xc9be9f,
    mapColor: '#8cb8b0',
    accentColor: 0x24d6c4,
    minFloors: 2,
    maxFloors: 6,
    speedLimit: 18,
    palette: [0xf2efe9, 0xcce6e4, 0xf7dfba, 0xd4e2f4],
  },
  {
    id: 'dockyards',
    name: 'Puerto Dorado',
    minX: -55,
    maxX: 560,
    minZ: 386,
    maxZ: 560,
    groundColor: 0x4a4d52,
    mapColor: '#5c6066',
    accentColor: 0xf4a700,
    minFloors: 2,
    maxFloors: 5,
    speedLimit: 17,
    palette: [0x787f87, 0x8d6b56, 0x5f6b78, 0x9a8f7e],
  },
  {
    id: 'hills',
    name: 'Las Palmas Hills',
    minX: -560,
    maxX: -165,
    minZ: -560,
    maxZ: -165,
    groundColor: 0x4d7347,
    mapColor: '#4f7a49',
    accentColor: 0xffc947,
    minFloors: 2,
    maxFloors: 4,
    speedLimit: 21,
    palette: [0xf4e6d2, 0xebd2b7, 0xfaf0e4, 0xe2c7a8],
  },
  {
    id: 'coral',
    name: 'Vista Coral',
    minX: -165,
    maxX: 560,
    minZ: -560,
    maxZ: -275,
    groundColor: 0x5e7858,
    mapColor: '#667f60',
    accentColor: 0xff8c42,
    minFloors: 3,
    maxFloors: 8,
    speedLimit: 20,
    palette: [0xedd6be, 0xd8b49c, 0xcbe0d4, 0xf0c9b8, 0xdcd7e8],
  },
  {
    id: 'oldquarter',
    name: 'Faro Viejo',
    minX: -560,
    maxX: -165,
    minZ: -165,
    maxZ: 220,
    groundColor: 0x6b6257,
    mapColor: '#7c6e5e',
    accentColor: 0xf4a700,
    minFloors: 3,
    maxFloors: 6,
    speedLimit: 18,
    palette: [0xe6c39c, 0xd9a97c, 0xebd7be, 0xc99673],
  },
  {
    id: 'industrial',
    name: 'Costa Brava Works',
    minX: -560,
    maxX: -55,
    minZ: 220,
    maxZ: 560,
    groundColor: 0x55524d,
    mapColor: '#635d55',
    accentColor: 0xff7733,
    minFloors: 2,
    maxFloors: 5,
    speedLimit: 20,
    palette: [0x7b7772, 0x8f7b68, 0x676b70, 0x998c7d],
  },
];

export const LANDMARKS = {
  safehouse: {
    id: 'safehouse',
    name: 'Casa del Sol Safehouse',
    x: -156,
    y: 0,
    z: -48,
    radius: 10,
    district: 'oldquarter',
    icon: 'H',
  },
  miramarPlaza: {
    id: 'miramarPlaza',
    name: 'Hotel Brisa Dorada',
    x: 248,
    y: 0,
    z: -62,
    radius: 14,
    district: 'miramar',
    icon: 'M',
  },
  solisTower: {
    id: 'solisTower',
    name: 'Torre Solis Plaza',
    x: 52,
    y: 0,
    z: -56,
    radius: 15,
    district: 'downtown',
    icon: 'T',
  },
  marinaPier: {
    id: 'marinaPier',
    name: 'Bahia Marina Pier 4',
    x: 344,
    y: 0.45,
    z: 248,
    radius: 14,
    district: 'marina',
    icon: 'B',
  },
  dockyardGate: {
    id: 'dockyardGate',
    name: 'Puerto Dorado Berth C',
    x: 158,
    y: 0,
    z: 368,
    radius: 16,
    district: 'dockyards',
    icon: 'D',
  },
  chopShop: {
    id: 'chopShop',
    name: 'Taller Fantasma Garage',
    x: -272,
    y: 0,
    z: 278,
    radius: 14,
    district: 'industrial',
    icon: 'G',
  },
  hillEstate: {
    id: 'hillEstate',
    name: 'Villa Montecristo',
    x: -382,
    y: 0,
    z: -382,
    radius: 15,
    district: 'hills',
    icon: 'V',
  },
  lighthouse: {
    id: 'lighthouse',
    name: 'Punta Faro Point',
    x: 332,
    y: 0,
    z: -368,
    radius: 14,
    district: 'miramar',
    icon: 'L',
  },
};

export function createSeededRng(seed = 2026) {
  let state = (Number(seed) >>> 0) || 1;
  return {
    next() {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    range(min, max) {
      return min + (max - min) * this.next();
    },
    int(min, maxInclusive) {
      return Math.floor(this.range(min, maxInclusive + 0.999999));
    },
    pick(arr) {
      return arr[Math.floor(this.next() * arr.length) % arr.length];
    },
    chance(prob) {
      return this.next() < prob;
    },
  };
}

// Procedural Canvas2D textures so offline builds require zero external image files
function buildProceduralTextures(THREE) {
  function makeCanvasTexture(width, height, drawFn, repeatX = 1, repeatY = 1) {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    drawFn(ctx, width, height);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const roadNS = makeCanvasTexture(
    128,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = '#262b34';
      ctx.fillRect(0, 0, w, h);
      // Subtle aggregate grain
      for (let i = 0; i < 420; i++) {
        const gx = (i * 37) % w;
        const gy = (i * 73) % h;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.12)';
        ctx.fillRect(gx, gy, 2, 2);
      }
      // Curb edge lines
      ctx.fillStyle = '#b9c0cc';
      ctx.fillRect(4, 0, 3, h);
      ctx.fillRect(w - 7, 0, 3, h);
      // Double center amber line
      ctx.fillStyle = '#e7a92e';
      ctx.fillRect(w * 0.5 - 4, 0, 2.5, h);
      ctx.fillRect(w * 0.5 + 1.5, 0, 2.5, h);
      // Dashed lane dividers
      ctx.fillStyle = 'rgba(240,244,250,0.65)';
      for (let y = 12; y < h; y += 48) {
        ctx.fillRect(w * 0.26, y, 2, 22);
        ctx.fillRect(w * 0.74, y, 2, 22);
      }
    },
    1,
    40,
  );

  const roadEW = makeCanvasTexture(
    256,
    128,
    (ctx, w, h) => {
      ctx.fillStyle = '#262b34';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#b9c0cc';
      ctx.fillRect(0, 4, w, 3);
      ctx.fillRect(0, h - 7, w, 3);
      ctx.fillStyle = '#e7a92e';
      ctx.fillRect(0, h * 0.5 - 4, w, 2.5);
      ctx.fillRect(0, h * 0.5 + 1.5, w, 2.5);
      ctx.fillStyle = 'rgba(240,244,250,0.65)';
      for (let x = 12; x < w; x += 48) {
        ctx.fillRect(x, h * 0.26, 22, 2);
        ctx.fillRect(x, h * 0.74, 22, 2);
      }
    },
    40,
    1,
  );

  const intersectionTex = makeCanvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#242932';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(236, 240, 246, 0.72)';
    for (let s = 18; s < w - 18; s += 12) {
      ctx.fillRect(s, 5, 6, 14);
      ctx.fillRect(s, h - 19, 6, 14);
      ctx.fillRect(5, s, 14, 6);
      ctx.fillRect(w - 19, s, 14, 6);
    }
  });

  function makeFacadeSet(styleSeed, warmRatio) {
    const rng = createSeededRng(styleSeed);
    const diffuse = makeCanvasTexture(128, 256, (ctx, w, h) => {
      ctx.fillStyle = '#d9dee6';
      ctx.fillRect(0, 0, w, h);
      // Horizontal floor spandrels
      for (let y = 0; y < h; y += 32) {
        ctx.fillStyle = 'rgba(25, 32, 44, 0.22)';
        ctx.fillRect(0, y, w, 5);
        for (let x = 8; x < w - 8; x += 20) {
          const lit = rng.next() < warmRatio;
          ctx.fillStyle = lit ? '#3d5673' : '#1e2a3a';
          ctx.fillRect(x, y + 8, 13, 18);
          ctx.fillStyle = 'rgba(255,255,255,0.18)';
          ctx.fillRect(x + 1, y + 9, 4, 15);
        }
      }
    });

    const emissiveRng = createSeededRng(styleSeed + 99);
    const emissive = makeCanvasTexture(128, 256, (ctx, w, h) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 32) {
        for (let x = 8; x < w - 8; x += 20) {
          const roll = emissiveRng.next();
          if (roll < warmRatio) {
            ctx.fillStyle =
              roll < warmRatio * 0.22
                ? '#7be6ff'
                : roll < warmRatio * 0.55
                  ? '#ffd98a'
                  : '#ffb85c';
            ctx.fillRect(x + 1, y + 9, 11, 16);
          }
        }
      }
    });

    return { diffuse, emissive };
  }

  const facades = [
    makeFacadeSet(101, 0.46),
    makeFacadeSet(202, 0.62),
    makeFacadeSet(303, 0.34),
  ];

  return {
    roadNS,
    roadEW,
    intersectionTex,
    facades,
  };
}

// Fast 2D spatial hash grid for static AABB colliders
function createSpatialGrid(cellSize = 36) {
  const cells = new Map();
  const all = [];

  function keyOf(cx, cz) {
    return `${cx},${cz}`;
  }

  function insert(box) {
    box.id = all.length;
    all.push(box);
    const minCx = Math.floor(box.minX / cellSize);
    const maxCx = Math.floor(box.maxX / cellSize);
    const minCz = Math.floor(box.minZ / cellSize);
    const maxCz = Math.floor(box.maxZ / cellSize);
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cz = minCz; cz <= maxCz; cz++) {
        const k = keyOf(cx, cz);
        let bucket = cells.get(k);
        if (!bucket) {
          bucket = [];
          cells.set(k, bucket);
        }
        bucket.push(box);
      }
    }
  }

  let queryStamp = 1;
  function queryRegion(minX, maxX, minZ, maxZ, out = []) {
    out.length = 0;
    queryStamp = (queryStamp + 1) | 0;
    const minCx = Math.floor(minX / cellSize);
    const maxCx = Math.floor(maxX / cellSize);
    const minCz = Math.floor(minZ / cellSize);
    const maxCz = Math.floor(maxZ / cellSize);
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cz = minCz; cz <= maxCz; cz++) {
        const bucket = cells.get(keyOf(cx, cz));
        if (!bucket) continue;
        for (let i = 0; i < bucket.length; i++) {
          const b = bucket[i];
          if (b._stamp === queryStamp) continue;
          b._stamp = queryStamp;
          if (b.maxX >= minX && b.minX <= maxX && b.maxZ >= minZ && b.minZ <= maxZ) {
            out.push(b);
          }
        }
      }
    }
    return out;
  }

  return { insert, queryRegion, all, cellSize };
}

export function createCityWorld(THREE, scene, seed = 2026) {
  const rng = createSeededRng(seed);
  const worldGroup = new THREE.Group();
  worldGroup.name = 'sol-city-world';
  scene.add(worldGroup);

  const textures = buildProceduralTextures(THREE);
  const colliderGrid = createSpatialGrid(36);
  const buildings = [];
  const intersections = [];
  const lodObjects = [];
  const neonMaterials = [];
  const facadeMaterials = [];
  const streetLampBulbs = [];
  const palmInstances = [];

  // Elevated pier & quay decks over coastal water so player and vehicles can drive onto docks
  const pierDecks = [
    { minX: 292, maxX: 392, minZ: 232, maxZ: 264, y: 0.45 }, // Bahia Marina Pier 4
    { minX: 292, maxX: 368, minZ: 184, maxZ: 204, y: 0.45 }, // Bahia North Slip
    { minX: 292, maxX: 374, minZ: -78, maxZ: -46, y: 0.45 }, // Miramar Pleasure Pier
    { minX: 90, maxX: 245, minZ: 350, maxZ: 398, y: 0.25 }, // Puerto Dorado Berth C Quay
  ];

  function getPierDeckY(x, z) {
    for (let i = 0; i < pierDecks.length; i++) {
      const p = pierDecks[i];
      if (x >= p.minX && x <= p.maxX && z >= p.minZ && z <= p.maxZ) {
        return p.y;
      }
    }
    return null;
  }

  function getGroundHeight(x, z) {
    const deckY = getPierDeckY(x, z);
    if (deckY !== null) return deckY;

    // Southern harbor basin (Puerto Dorado shipping channel)
    if (z > WORLD_BOUNDS.harborNorthZ && x > WORLD_BOUNDS.harborWestX) {
      const dz = Math.min(1, (z - WORLD_BOUNDS.harborNorthZ) / 22);
      const dx = Math.min(1, (x - WORLD_BOUNDS.harborWestX) / 22);
      const factor = Math.min(dz, dx);
      return -2.75 * factor;
    }

    // Eastern Miramar Beach shoreline sloping smoothly into turquoise ocean
    if (x > WORLD_BOUNDS.beachStartX) {
      const t = Math.min(1, (x - WORLD_BOUNDS.beachStartX) / 88);
      return -2.85 * (t * t * (3 - 2 * t));
    }

    return 0;
  }

  function isWaterAt(x, z) {
    if (getPierDeckY(x, z) !== null) return false;
    return getGroundHeight(x, z) < WORLD_BOUNDS.seaLevel - 0.08;
  }

  function getDistrictAt(x, z) {
    for (let i = 0; i < DISTRICTS.length; i++) {
      const d = DISTRICTS[i];
      if (x >= d.minX && x <= d.maxX && z >= d.minZ && z <= d.maxZ) {
        return d;
      }
    }
    return DISTRICTS[0];
  }

  function registerCollider(minX, maxX, minZ, maxZ, height, tag = 'building', district = 'downtown') {
    colliderGrid.insert({
      minX,
      maxX,
      minZ,
      maxZ,
      height,
      tag,
      district,
      _stamp: 0,
    });
  }

  // ---------------------------------------------------------------------------
  // 1. Sky Dome, Sun/Moon Celestial Disc, Directional & Hemisphere Lighting
  // ---------------------------------------------------------------------------
  const skyGeo = new THREE.SphereGeometry(940, 24, 16);
  const skyMat = new THREE.MeshBasicMaterial({
    color: 0x6ec6ff,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  worldGroup.add(skyDome);

  const sunDiscGeo = new THREE.SphereGeometry(26, 16, 12);
  const sunDiscMat = new THREE.MeshBasicMaterial({
    color: 0xffe49c,
    fog: false,
  });
  const sunDisc = new THREE.Mesh(sunDiscGeo, sunDiscMat);
  worldGroup.add(sunDisc);

  const hemiLight = new THREE.HemisphereLight(0x9bdcff, 0x5c5346, 0.95);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfff1d6, 1.85);
  sunLight.position.set(220, 260, -140);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 20;
  sunLight.shadow.camera.far = 780;
  const shadowSpan = 165;
  sunLight.shadow.camera.left = -shadowSpan;
  sunLight.shadow.camera.right = shadowSpan;
  sunLight.shadow.camera.top = shadowSpan;
  sunLight.shadow.camera.bottom = -shadowSpan;
  sunLight.shadow.bias = -0.0006;
  scene.add(sunLight);
  scene.add(sunLight.target);

  scene.fog = new THREE.FogExp2(0x9bd4f5, 0.00145);

  // ---------------------------------------------------------------------------
  // 2. Mainland Base, District Zones, Beach Shoreline, Ocean & Harbor Piers
  // ---------------------------------------------------------------------------
  const baseLandWidth = WORLD_BOUNDS.beachStartX - WORLD_BOUNDS.minX;
  const baseLandGeo = new THREE.PlaneGeometry(baseLandWidth, WORLD_BOUNDS.size);
  baseLandGeo.rotateX(-Math.PI * 0.5);
  const baseLandMat = new THREE.MeshLambertMaterial({ color: 0x454a52 });
  const baseLand = new THREE.Mesh(baseLandGeo, baseLandMat);
  baseLand.position.set(WORLD_BOUNDS.minX + baseLandWidth * 0.5, -0.06, 0);
  baseLand.receiveShadow = true;
  worldGroup.add(baseLand);

  // Colored district ground overlays
  for (let i = 0; i < DISTRICTS.length; i++) {
    const d = DISTRICTS[i];
    const clampedMaxX = Math.min(d.maxX, WORLD_BOUNDS.beachStartX);
    const clampedMaxZ =
      d.id === 'dockyards' ? WORLD_BOUNDS.harborNorthZ : d.maxZ;
    if (clampedMaxX <= d.minX || clampedMaxZ <= d.minZ) continue;

    const w = clampedMaxX - d.minX;
    const h = clampedMaxZ - d.minZ;
    const zGeo = new THREE.PlaneGeometry(w, h);
    zGeo.rotateX(-Math.PI * 0.5);
    const zMat = new THREE.MeshLambertMaterial({ color: d.groundColor });
    const zMesh = new THREE.Mesh(zGeo, zMat);
    zMesh.position.set(d.minX + w * 0.5, -0.03, d.minZ + h * 0.5);
    zMesh.receiveShadow = true;
    worldGroup.add(zMesh);
  }

  // Sloping golden Miramar sandy beach strip
  const beachGeo = new THREE.PlaneGeometry(96, 945, 16, 24);
  beachGeo.rotateX(-Math.PI * 0.5);
  const beachPos = beachGeo.attributes.position;
  for (let i = 0; i < beachPos.count; i++) {
    const worldX = WORLD_BOUNDS.beachStartX + 48 + beachPos.getX(i);
    const worldZ = -87 + beachPos.getZ(i);
    beachPos.setY(i, getGroundHeight(worldX, worldZ));
  }
  beachGeo.computeVertexNormals();
  const beachMat = new THREE.MeshLambertMaterial({ color: 0xf1d9a7 });
  const beachMesh = new THREE.Mesh(beachGeo, beachMat);
  beachMesh.position.set(WORLD_BOUNDS.beachStartX + 48, 0, -87);
  beachMesh.receiveShadow = true;
  worldGroup.add(beachMesh);

  // Boardwalk promenade along Miramar & Bahia shoreline
  const boardwalkGeo = new THREE.BoxGeometry(8.5, 0.22, 740);
  const boardwalkMat = new THREE.MeshLambertMaterial({ color: 0xc9ab82 });
  const boardwalk = new THREE.Mesh(boardwalkGeo, boardwalkMat);
  boardwalk.position.set(290, 0.08, -10);
  boardwalk.receiveShadow = true;
  worldGroup.add(boardwalk);

  // Coastal Ocean & Southern Harbor Water Plane
  const oceanGeo = new THREE.PlaneGeometry(460, 1280, 28, 48);
  oceanGeo.rotateX(-Math.PI * 0.5);
  const oceanBaseY = new Float32Array(oceanGeo.attributes.position.count);
  for (let i = 0; i < oceanBaseY.length; i++) {
    oceanBaseY[i] = oceanGeo.attributes.position.getY(i);
  }
  const oceanMat = new THREE.MeshPhongMaterial({
    color: 0x0f8eb8,
    emissive: 0x05283b,
    specular: 0xffe6b3,
    shininess: 90,
    transparent: true,
    opacity: 0.9,
  });
  const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
  oceanMesh.position.set(520, WORLD_BOUNDS.seaLevel, 0);
  worldGroup.add(oceanMesh);

  const harborWaterGeo = new THREE.PlaneGeometry(340, 220);
  harborWaterGeo.rotateX(-Math.PI * 0.5);
  const harborWater = new THREE.Mesh(harborWaterGeo, oceanMat);
  harborWater.position.set(255, WORLD_BOUNDS.seaLevel, 485);
  worldGroup.add(harborWater);

  // Wooden Piers & Concrete Harbor Quays
  const pierWoodMat = new THREE.MeshLambertMaterial({ color: 0x7c583a });
  const quayConcreteMat = new THREE.MeshLambertMaterial({ color: 0x6e737b });
  const pilingGeo = new THREE.CylinderGeometry(0.32, 0.35, 3.6, 7);

  for (let i = 0; i < pierDecks.length; i++) {
    const p = pierDecks[i];
    const pw = p.maxX - p.minX;
    const pd = p.maxZ - p.minZ;
    const isConcrete = p.y < 0.35;
    const deckMesh = new THREE.Mesh(
      new THREE.BoxGeometry(pw, 0.45, pd),
      isConcrete ? quayConcreteMat : pierWoodMat,
    );
    deckMesh.position.set(p.minX + pw * 0.5, p.y - 0.22, p.minZ + pd * 0.5);
    deckMesh.receiveShadow = true;
    deckMesh.castShadow = true;
    worldGroup.add(deckMesh);

    if (!isConcrete) {
      for (let px = p.minX + 6; px <= p.maxX - 4; px += 14) {
        for (const pz of [p.minZ + 1.2, p.maxZ - 1.2]) {
          const post = new THREE.Mesh(pilingGeo, pierWoodMat);
          post.position.set(px, p.y - 1.4, pz);
          worldGroup.add(post);
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Grid-Based Road Network, Sidewalks, Intersections & Traffic Signals
  // ---------------------------------------------------------------------------
  const roadW = WORLD_BOUNDS.roadWidth;
  const swW = WORLD_BOUNDS.sidewalkWidth;
  const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0x8f949e });
  const roadMatNS = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    map: textures.roadNS,
  });
  const roadMatEW = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    map: textures.roadEW,
  });
  const interMat = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    map: textures.intersectionTex,
  });

  // North-South avenues
  for (let i = 0; i < ROAD_X.length; i++) {
    const rx = ROAD_X[i];
    const southLimit = rx > 95 ? WORLD_BOUNDS.harborNorthZ : 500;
    const northLimit = -500;
    const length = southLimit - northLimit;
    const centerZ = (southLimit + northLimit) * 0.5;

    const swMesh = new THREE.Mesh(
      new THREE.BoxGeometry(roadW + swW * 2, 0.14, length + swW * 2),
      sidewalkMat,
    );
    swMesh.position.set(rx, 0.04, centerZ);
    swMesh.receiveShadow = true;
    worldGroup.add(swMesh);

    const rGeo = new THREE.PlaneGeometry(roadW, length);
    rGeo.rotateX(-Math.PI * 0.5);
    const rMesh = new THREE.Mesh(rGeo, roadMatNS);
    rMesh.position.set(rx, 0.125, centerZ);
    rMesh.receiveShadow = true;
    worldGroup.add(rMesh);
  }

  // East-West streets
  for (let j = 0; j < ROAD_Z.length; j++) {
    const rz = ROAD_Z[j];
    const eastLimit = rz > WORLD_BOUNDS.harborNorthZ ? 92 : 286;
    const westLimit = -500;
    const length = eastLimit - westLimit;
    const centerX = (eastLimit + westLimit) * 0.5;

    const swMesh = new THREE.Mesh(
      new THREE.BoxGeometry(length + swW * 2, 0.14, roadW + swW * 2),
      sidewalkMat,
    );
    swMesh.position.set(centerX, 0.035, rz);
    swMesh.receiveShadow = true;
    worldGroup.add(swMesh);

    const rGeo = new THREE.PlaneGeometry(length, roadW);
    rGeo.rotateX(-Math.PI * 0.5);
    const rMesh = new THREE.Mesh(rGeo, roadMatEW);
    rMesh.position.set(centerX, 0.13, rz);
    rMesh.receiveShadow = true;
    worldGroup.add(rMesh);
  }

  // Intersections, traffic signal poles & coastal streetlamps
  const poleMat = new THREE.MeshLambertMaterial({ color: 0x2f3540 });
  const poleGeo = new THREE.CylinderGeometry(0.14, 0.18, 6.2, 6);
  const mastArmGeo = new THREE.BoxGeometry(4.4, 0.14, 0.14);
  const signalBoxGeo = new THREE.BoxGeometry(0.45, 1.1, 0.45);
  const bulbGeo = new THREE.SphereGeometry(0.18, 8, 6);
  const interPlaneGeo = new THREE.PlaneGeometry(roadW, roadW);
  interPlaneGeo.rotateX(-Math.PI * 0.5);

  for (let i = 0; i < ROAD_X.length; i++) {
    const rx = ROAD_X[i];
    for (let j = 0; j < ROAD_Z.length; j++) {
      const rz = ROAD_Z[j];
      if (rz > WORLD_BOUNDS.harborNorthZ && rx > 92) continue;

      const interMesh = new THREE.Mesh(interPlaneGeo, interMat);
      interMesh.position.set(rx, 0.14, rz);
      interMesh.receiveShadow = true;
      worldGroup.add(interMesh);

      // Signal light assembly on alternating or primary intersections
      const nsBulbMat = new THREE.MeshBasicMaterial({ color: 0x37d67a });
      const ewBulbMat = new THREE.MeshBasicMaterial({ color: 0xff4757 });

      const sigGroup = new THREE.Group();
      sigGroup.position.set(rx + roadW * 0.5 + 1.4, 0, rz + roadW * 0.5 + 1.4);

      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 3.1;
      sigGroup.add(pole);

      const armNS = new THREE.Mesh(mastArmGeo, poleMat);
      armNS.position.set(-2.1, 5.8, 0);
      sigGroup.add(armNS);

      const boxNS = new THREE.Mesh(signalBoxGeo, poleMat);
      boxNS.position.set(-3.6, 5.45, 0);
      sigGroup.add(boxNS);

      const nsBulb = new THREE.Mesh(bulbGeo, nsBulbMat);
      nsBulb.position.set(-3.6, 5.45, 0.26);
      sigGroup.add(nsBulb);

      const ewBulb = new THREE.Mesh(bulbGeo, ewBulbMat);
      ewBulb.position.set(-1.9, 5.45, -0.26);
      sigGroup.add(ewBulb);

      worldGroup.add(sigGroup);

      intersections.push({
        x: rx,
        z: rz,
        phaseOffset: (i * 1.7 + j * 2.3) % 18,
        nsBulbMat,
        ewBulbMat,
      });
    }
  }

  // Streetlights along major avenues & beachfront promenade
  const lampPostGeo = new THREE.CylinderGeometry(0.11, 0.15, 6.8, 6);
  const lampHeadGeo = new THREE.BoxGeometry(1.1, 0.18, 0.42);
  const sharedLampBulbMat = new THREE.MeshBasicMaterial({ color: 0xfff0c4 });
  streetLampBulbs.push(sharedLampBulbMat);

  for (let i = 0; i < ROAD_X.length; i++) {
    const rx = ROAD_X[i];
    for (let z = -420; z <= 360; z += 55) {
      if (Math.abs(z % 110) < 16) continue;
      const side = (z / 55) % 2 === 0 ? 1 : -1;
      const lx = rx + side * (roadW * 0.5 + 1.8);
      const lamp = new THREE.Group();
      lamp.position.set(lx, 0, z);
      const post = new THREE.Mesh(lampPostGeo, poleMat);
      post.position.y = 3.4;
      lamp.add(post);
      const head = new THREE.Mesh(lampHeadGeo, poleMat);
      head.position.set(-side * 0.45, 6.75, 0);
      lamp.add(head);
      const bulb = new THREE.Mesh(bulbGeo, sharedLampBulbMat);
      bulb.position.set(-side * 0.72, 6.6, 0);
      lamp.add(bulb);
      worldGroup.add(lamp);
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Procedural District Buildings (with THREE.LOD) & Coastal Landmarks
  // ---------------------------------------------------------------------------
  function overlapsLandmark(cx, cz, hw, hd) {
    const keys = Object.keys(LANDMARKS);
    for (let i = 0; i < keys.length; i++) {
      const lm = LANDMARKS[keys[i]];
      const pad = (lm.radius || 14) + 10;
      if (Math.abs(cx - lm.x) < hw + pad && Math.abs(cz - lm.z) < hd + pad) {
        return true;
      }
    }
    return false;
  }

  function makeFacadeMaterial(colorHex, styleIdx) {
    const set = textures.facades[styleIdx % textures.facades.length];
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      map: set ? set.diffuse : null,
      emissive: 0xffcf87,
      emissiveMap: set ? set.emissive : null,
      emissiveIntensity: 0.12,
      roughness: 0.74,
      metalness: 0.16,
    });
    facadeMaterials.push(mat);
    return mat;
  }

  function makeNeonMaterial(colorHex) {
    const mat = new THREE.MeshBasicMaterial({ color: colorHex });
    neonMaterials.push({ mat, baseColor: new THREE.Color(colorHex) });
    return mat;
  }

  const roofTrimMat = new THREE.MeshLambertMaterial({ color: 0x343b46 });
  const terracottaMat = new THREE.MeshLambertMaterial({ color: 0xb85d43 });

  function addBuilding(bx, bz, bw, bd, bh, district, options = {}) {
    const colorHex = options.color || rng.pick(district.palette);
    const facadeMat = makeFacadeMaterial(colorHex, rng.int(0, 2));
    const proxyMat = new THREE.MeshLambertMaterial({ color: colorHex });

    const lod = new THREE.LOD();
    lod.position.set(bx, 0, bz);

    // High-detail group (shown within 255m)
    const hiGroup = new THREE.Group();
    const podiumH = bh > 28 ? bh * 0.68 : bh;
    const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(bw, podiumH, bd), facadeMat);
    bodyMesh.position.y = podiumH * 0.5;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    hiGroup.add(bodyMesh);

    if (bh > 28) {
      const upperH = bh - podiumH;
      const upperMesh = new THREE.Mesh(
        new THREE.BoxGeometry(bw * 0.74, upperH, bd * 0.74),
        facadeMat,
      );
      upperMesh.position.y = podiumH + upperH * 0.5;
      upperMesh.castShadow = true;
      hiGroup.add(upperMesh);
    }

    // Roof parapet / terracotta hipped cap / neon crown
    if (district.id === 'oldquarter' || district.id === 'hills') {
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(Math.max(bw, bd) * 0.64, 3.2, 4),
        terracottaMat,
      );
      roof.rotation.y = Math.PI * 0.25;
      roof.position.y = bh + 1.5;
      hiGroup.add(roof);
    } else {
      const cap = new THREE.Mesh(
        new THREE.BoxGeometry(bw * 0.62, 1.3, bd * 0.62),
        roofTrimMat,
      );
      cap.position.y = bh + 0.65;
      hiGroup.add(cap);
    }

    if (district.id === 'miramar' || district.id === 'downtown' || options.neon) {
      const neonMat = makeNeonMaterial(options.neonColor || district.accentColor);
      const bandY = bh > 28 ? podiumH - 0.5 : bh - 0.5;
      const band = new THREE.Mesh(
        new THREE.BoxGeometry(bw + 0.35, 0.35, bd + 0.35),
        neonMat,
      );
      band.position.y = bandY;
      hiGroup.add(band);
    }

    // Low-detail proxy mesh (shown past 255m)
    const loMesh = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), proxyMat);
    loMesh.position.y = bh * 0.5;

    lod.addLevel(hiGroup, 0);
    lod.addLevel(loMesh, 255);
    worldGroup.add(lod);
    lodObjects.push(lod);

    registerCollider(
      bx - bw * 0.5,
      bx + bw * 0.5,
      bz - bd * 0.5,
      bz + bd * 0.5,
      bh,
      options.tag || 'building',
      district.id,
    );

    buildings.push({
      x: bx,
      z: bz,
      w: bw,
      d: bd,
      h: bh,
      color: colorHex,
      district: district.id,
    });
  }

  // Populate city grid blocks between avenues and streets
  const gridXEdges = [-525, ...ROAD_X, 278];
  const gridZEdges = [-525, ...ROAD_Z, 505];
  const clearance = roadW * 0.5 + swW + 3.2;

  for (let ix = 0; ix < gridXEdges.length - 1; ix++) {
    const x0 = gridXEdges[ix] + clearance;
    const x1 = gridXEdges[ix + 1] - clearance;
    if (x1 - x0 < 22) continue;

    for (let iz = 0; iz < gridZEdges.length - 1; iz++) {
      const z0 = gridZEdges[iz] + clearance;
      const z1 = gridZEdges[iz + 1] - clearance;
      if (z1 - z0 < 22) continue;

      const midX = (x0 + x1) * 0.5;
      const midZ = (z0 + z1) * 0.5;
      if (isWaterAt(midX, midZ)) continue;
      if (midZ > WORLD_BOUNDS.harborNorthZ - 14 && midX > WORLD_BOUNDS.harborWestX - 10) continue;

      const district = getDistrictAt(midX, midZ);
      const subCols = x1 - x0 > 64 ? 2 : 1;
      const subRows = z1 - z0 > 64 ? 2 : 1;
      const cellW = (x1 - x0) / subCols;
      const cellD = (z1 - z0) / subRows;

      for (let sc = 0; sc < subCols; sc++) {
        for (let sr = 0; sr < subRows; sr++) {
          if (district.id === 'hills' && rng.chance(0.35)) continue;
          const cx = x0 + cellW * (sc + 0.5) + rng.range(-2.2, 2.2);
          const cz = z0 + cellD * (sr + 0.5) + rng.range(-2.2, 2.2);
          const bw = Math.max(14, cellW * rng.range(0.62, 0.84));
          const bd = Math.max(14, cellD * rng.range(0.62, 0.84));
          if (overlapsLandmark(cx, cz, bw * 0.5, bd * 0.5)) continue;

          const floors = rng.int(district.minFloors, district.maxFloors);
          const bh = floors * 3.5;
          addBuilding(cx, cz, bw, bd, bh, district);
        }
      }
    }
  }

  // Handcrafted Landmarks
  // 1) Casa del Sol Safehouse (warm stucco villa + archway courtyard)
  addBuilding(-168, -48, 18, 22, 11.5, DISTRICTS[6], {
    color: 0xf2d2ad,
    neon: true,
    neonColor: 0xf4a700,
    tag: 'safehouse',
  });
  // 2) Hotel Brisa Dorada (Miramar Art-Deco resort)
  addBuilding(248, -62, 24, 34, 34, DISTRICTS[0], {
    color: 0xfbe3e8,
    neon: true,
    neonColor: 0xff5fa2,
    tag: 'landmark',
  });
  // 3) Torre Solis (signature Downtown glass skyscraper)
  addBuilding(52, -56, 28, 28, 96, DISTRICTS[1], {
    color: 0x678cb5,
    neon: true,
    neonColor: 0x4ad9ff,
    tag: 'landmark',
  });
  // 4) Taller Fantasma Chop-Shop Garage
  addBuilding(-272, 294, 28, 18, 9.5, DISTRICTS[7], {
    color: 0x7b6d60,
    neon: true,
    neonColor: 0xff8c24,
    tag: 'landmark',
  });
  // 5) Villa Montecristo Hillside Compound
  addBuilding(-382, -396, 28, 20, 13, DISTRICTS[4], {
    color: 0xf8ebda,
    neon: true,
    neonColor: 0xffc947,
    tag: 'landmark',
  });

  // 6) Puerto Dorado Shipping Containers & Harbor Gantry Cranes
  const containerColors = [0xd6453d, 0x2a7de1, 0xe89b1e, 0x2c9c69, 0x6b7685];
  const containerGeo = new THREE.BoxGeometry(6.2, 3.1, 13.5);
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 4; col++) {
      const cx = 116 + row * 19;
      const cz = 352 + col * 10;
      if (Math.hypot(cx - LANDMARKS.dockyardGate.x, cz - LANDMARKS.dockyardGate.z) < 16) {
        continue;
      }
      const stack = rng.int(1, 3);
      for (let s = 0; s < stack; s++) {
        const cMat = new THREE.MeshLambertMaterial({ color: rng.pick(containerColors) });
        const box = new THREE.Mesh(containerGeo, cMat);
        box.position.set(cx, 0.25 + 1.55 + s * 3.12, cz);
        box.castShadow = true;
        box.receiveShadow = true;
        worldGroup.add(box);
      }
      registerCollider(cx - 3.1, cx + 3.1, cz - 6.75, cz + 6.75, stack * 3.15, 'container', 'dockyards');
    }
  }

  // Harbor Gantry Cranes
  const craneMat = new THREE.MeshLambertMaterial({ color: 0xe69517 });
  for (const craneX of [136, 198]) {
    const crane = new THREE.Group();
    crane.position.set(craneX, 0.25, 386);
    for (const lx of [-5, 5]) {
      for (const lz of [-4, 4]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(1.1, 24, 1.1), craneMat);
        leg.position.set(lx, 12, lz);
        crane.add(leg);
      }
    }
    const boom = new THREE.Mesh(new THREE.BoxGeometry(12, 2.1, 38), craneMat);
    boom.position.set(0, 24, 8);
    crane.add(boom);
    worldGroup.add(crane);
  }

  // 7) Punta Faro Lighthouse + Rotating Beacon
  const lighthouseGroup = new THREE.Group();
  lighthouseGroup.position.set(LANDMARKS.lighthouse.x, 0, LANDMARKS.lighthouse.z);
  const towerWhite = new THREE.MeshLambertMaterial({ color: 0xf7f5ef });
  const towerRed = new THREE.MeshLambertMaterial({ color: 0xd94848 });
  const lhBase = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 4.4, 16, 12), towerWhite);
  lhBase.position.y = 8;
  lighthouseGroup.add(lhBase);
  const lhBand = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 3.1, 6, 12), towerRed);
  lhBand.position.y = 19;
  lighthouseGroup.add(lhBand);
  const lhTop = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.7, 4, 12), towerWhite);
  lhTop.position.y = 24;
  lighthouseGroup.add(lhTop);

  const beaconPivot = new THREE.Group();
  beaconPivot.position.y = 26.5;
  const beaconConeGeo = new THREE.ConeGeometry(6.5, 42, 12, 1, true);
  beaconConeGeo.rotateX(Math.PI * 0.5);
  beaconConeGeo.translate(0, 0, 21);
  const beaconMat = new THREE.MeshBasicMaterial({
    color: 0xffe899,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  beaconPivot.add(new THREE.Mesh(beaconConeGeo, beaconMat));
  lighthouseGroup.add(beaconPivot);
  worldGroup.add(lighthouseGroup);
  registerCollider(
    LANDMARKS.lighthouse.x - 4.4,
    LANDMARKS.lighthouse.x + 4.4,
    LANDMARKS.lighthouse.z - 4.4,
    LANDMARKS.lighthouse.z + 4.4,
    27,
    'landmark',
    'miramar',
  );

  // ---------------------------------------------------------------------------
  // 5. Tropical Palm Trees & Beachfront Props
  // ---------------------------------------------------------------------------
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8b6849 });
  const frondMat = new THREE.MeshLambertMaterial({ color: 0x2f8f4e, side: THREE.DoubleSide });
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.34, 7.6, 6);
  const frondGeo = new THREE.ConeGeometry(2.5, 1.5, 6);

  function spawnPalmTree(px, pz, scale = 1) {
    const py = getGroundHeight(px, pz);
    if (py < -0.5) return;
    const palm = new THREE.Group();
    palm.position.set(px, py, pz);
    palm.scale.setScalar(scale);

    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 3.8;
    trunk.rotation.z = rng.range(-0.08, 0.08);
    palm.add(trunk);

    const crown = new THREE.Mesh(frondGeo, frondMat);
    crown.position.y = 7.7;
    palm.add(crown);

    worldGroup.add(palm);
    palmInstances.push({ crown, phase: rng.range(0, Math.PI * 2) });
  }

  // Line Ocean Drive (x=278), boardwalk, and major avenues with palms
  for (let z = -430; z <= 340; z += 24) {
    spawnPalmTree(286.5, z + rng.range(-2, 2), rng.range(0.9, 1.2));
    spawnPalmTree(264.5, z + rng.range(-2, 2), rng.range(0.85, 1.15));
  }
  for (let i = 0; i < 95; i++) {
    const px = rng.range(-480, 305);
    const pz = rng.range(-480, 340);
    let nearRoad = false;
    for (let r = 0; r < ROAD_X.length; r++) {
      if (Math.abs(px - ROAD_X[r]) < 15) nearRoad = true;
    }
    for (let r = 0; r < ROAD_Z.length; r++) {
      if (Math.abs(pz - ROAD_Z[r]) < 15) nearRoad = true;
    }
    if (nearRoad) continue;
    if (colliderGrid.queryRegion(px - 2, px + 2, pz - 2, pz + 2).length > 0) continue;
    spawnPalmTree(px, pz, rng.range(0.85, 1.25));
  }

  // Beach umbrellas, lifeguard lookout stands & moored Bahia Marina yachts
  const umbrellaColors = [0xff5a76, 0x24d6c4, 0xffc947, 0x4da3ff];
  const umbrellaPoleGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.4, 5);
  const umbrellaCanopyGeo = new THREE.ConeGeometry(1.75, 0.7, 8);
  const standWoodMat = new THREE.MeshLambertMaterial({ color: 0xe6dcc8 });
  const standRoofMat = new THREE.MeshLambertMaterial({ color: 0xff5a6e });

  for (let z = -320; z <= 140; z += 34) {
    const ux = rng.range(298, 314);
    const uy = getGroundHeight(ux, z);
    const umb = new THREE.Group();
    umb.position.set(ux, uy, z);
    const upole = new THREE.Mesh(umbrellaPoleGeo, towerWhite);
    upole.position.y = 1.2;
    umb.add(upole);
    const canopy = new THREE.Mesh(
      umbrellaCanopyGeo,
      new THREE.MeshLambertMaterial({ color: rng.pick(umbrellaColors) }),
    );
    canopy.position.y = 2.4;
    umb.add(canopy);
    worldGroup.add(umb);
  }

  for (const lz of [-210, -45, 110]) {
    const stand = new THREE.Group();
    const lx = 297;
    stand.position.set(lx, getGroundHeight(lx, lz), lz);
    const legs = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 2.4), standWoodMat);
    legs.position.y = 1.1;
    stand.add(legs);
    const hut = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.1, 2.8), towerWhite);
    hut.position.y = 3.1;
    stand.add(hut);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.3, 0.9, 4), standRoofMat);
    roof.rotation.y = Math.PI * 0.25;
    roof.position.y = 4.55;
    stand.add(roof);
    worldGroup.add(stand);
  }

  // Decorative moored luxury yachts beside Bahia Marina slips
  const yachtHullMat = new THREE.MeshLambertMaterial({ color: 0xf4f7fb });
  const yachtDeckMat = new THREE.MeshLambertMaterial({ color: 0x24d6c4 });
  for (const slip of [
    { x: 332, z: 223, yaw: Math.PI * 0.5 },
    { x: 358, z: 223, yaw: Math.PI * 0.5 },
    { x: 346, z: 273, yaw: -Math.PI * 0.5 },
  ]) {
    const yacht = new THREE.Group();
    yacht.position.set(slip.x, WORLD_BOUNDS.seaLevel - 0.05, slip.z);
    yacht.rotation.y = slip.yaw;
    const hull = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.2, 9.6), yachtHullMat);
    hull.position.y = 0.6;
    yacht.add(hull);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.1, 4.8), yachtDeckMat);
    cabin.position.set(0, 1.65, -0.4);
    yacht.add(cabin);
    worldGroup.add(yacht);
  }

  // ---------------------------------------------------------------------------
  // 6. Fast Analytical Collision, Raycasting & Road/Sidewalk Spawn Queries
  // ---------------------------------------------------------------------------
  const queryScratch = [];

  function resolveCircleCollision(x, z, radius = 0.5, y = 0) {
    let cx = Math.max(WORLD_BOUNDS.minX + 6, Math.min(WORLD_BOUNDS.maxX - 6, x));
    let cz = Math.max(WORLD_BOUNDS.minZ + 6, Math.min(WORLD_BOUNDS.maxZ - 6, z));
    let hit = false;
    let normalX = 0;
    let normalZ = 0;
    let hitTag = null;

    const candidates = colliderGrid.queryRegion(
      cx - radius - 1,
      cx + radius + 1,
      cz - radius - 1,
      cz + radius + 1,
      queryScratch,
    );

    for (let i = 0; i < candidates.length; i++) {
      const box = candidates[i];
      if (y > box.height + 0.2) continue;

      const closestX = Math.max(box.minX, Math.min(cx, box.maxX));
      const closestZ = Math.max(box.minZ, Math.min(cz, box.maxZ));
      const dx = cx - closestX;
      const dz = cz - closestZ;
      const distSq = dx * dx + dz * dz;

      if (distSq < radius * radius) {
        hit = true;
        hitTag = box.tag;
        if (distSq > 1e-6) {
          const dist = Math.sqrt(distSq);
          const push = radius - dist;
          normalX = dx / dist;
          normalZ = dz / dist;
          cx += normalX * push;
          cz += normalZ * push;
        } else {
          // Center inside AABB: push out nearest edge
          const leftPen = cx - box.minX;
          const rightPen = box.maxX - cx;
          const topPen = cz - box.minZ;
          const botPen = box.maxZ - cz;
          const minPen = Math.min(leftPen, rightPen, topPen, botPen);
          if (minPen === leftPen) {
            cx = box.minX - radius;
            normalX = -1;
            normalZ = 0;
          } else if (minPen === rightPen) {
            cx = box.maxX + radius;
            normalX = 1;
            normalZ = 0;
          } else if (minPen === topPen) {
            cz = box.minZ - radius;
            normalX = 0;
            normalZ = -1;
          } else {
            cz = box.maxZ + radius;
            normalX = 0;
            normalZ = 1;
          }
        }
      }
    }

    return { x: cx, z: cz, hit, normalX, normalZ, tag: hitTag };
  }

  function resolveBoxCollision(x, z, halfW, halfL, yaw) {
    // Approximate oriented vehicle hull using 3 bounding discs along chassis axis
    const sinY = Math.sin(yaw);
    const cosY = Math.cos(yaw);
    const discOffset = Math.max(0, halfL - halfW * 0.85);
    const radius = halfW * 0.96;

    let cx = x;
    let cz = z;
    let anyHit = false;
    let outNX = 0;
    let outNZ = 0;
    let hitTag = null;

    for (const factor of [0, 1, -1]) {
      const px = cx + sinY * discOffset * factor;
      const pz = cz + cosY * discOffset * factor;
      const res = resolveCircleCollision(px, pz, radius, 0.3);
      if (res.hit) {
        anyHit = true;
        cx += res.x - px;
        cz += res.z - pz;
        outNX = res.normalX;
        outNZ = res.normalZ;
        hitTag = res.tag;
      }
    }

    cx = Math.max(WORLD_BOUNDS.minX + 8, Math.min(WORLD_BOUNDS.maxX - 8, cx));
    cz = Math.max(WORLD_BOUNDS.minZ + 8, Math.min(WORLD_BOUNDS.maxZ - 8, cz));

    return { x: cx, z: cz, hit: anyHit, normalX: outNX, normalZ: outNZ, tag: hitTag };
  }

  function raycastWorld(origin, dir, maxDist = 140) {
    let bestT = maxDist;
    let hit = false;
    let hitTag = null;
    const hitNormal = new THREE.Vector3(0, 1, 0);

    // Ground plane intersection
    if (dir.y < -0.001) {
      const groundY = getGroundHeight(origin.x, origin.z);
      const tg = (groundY - origin.y) / dir.y;
      if (tg > 0 && tg < bestT) {
        const gx = origin.x + dir.x * tg;
        const gz = origin.z + dir.z * tg;
        bestT = tg;
        hit = true;
        hitTag = isWaterAt(gx, gz) ? 'water' : 'ground';
        hitNormal.set(0, 1, 0);
      }
    }

    const endX = origin.x + dir.x * bestT;
    const endZ = origin.z + dir.z * bestT;
    const minX = Math.min(origin.x, endX) - 1;
    const maxX = Math.max(origin.x, endX) + 1;
    const minZ = Math.min(origin.z, endZ) - 1;
    const maxZ = Math.max(origin.z, endZ) + 1;

    const boxes = colliderGrid.queryRegion(minX, maxX, minZ, maxZ, queryScratch);
    const invX = Math.abs(dir.x) > 1e-6 ? 1 / dir.x : 1e9;
    const invY = Math.abs(dir.y) > 1e-6 ? 1 / dir.y : 1e9;
    const invZ = Math.abs(dir.z) > 1e-6 ? 1 / dir.z : 1e9;

    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      const tx1 = (b.minX - origin.x) * invX;
      const tx2 = (b.maxX - origin.x) * invX;
      let tmin = Math.min(tx1, tx2);
      let tmax = Math.max(tx1, tx2);

      const ty1 = (0 - origin.y) * invY;
      const ty2 = (b.height - origin.y) * invY;
      tmin = Math.max(tmin, Math.min(ty1, ty2));
      tmax = Math.min(tmax, Math.max(ty1, ty2));

      const tz1 = (b.minZ - origin.z) * invZ;
      const tz2 = (b.maxZ - origin.z) * invZ;
      tmin = Math.max(tmin, Math.min(tz1, tz2));
      tmax = Math.min(tmax, Math.max(tz1, tz2));

      if (tmax >= Math.max(0, tmin) && tmin < bestT) {
        const hitDist = tmin > 0 ? tmin : tmax;
        if (hitDist > 0.05 && hitDist < bestT) {
          bestT = hitDist;
          hit = true;
          hitTag = b.tag || 'building';
          const hx = origin.x + dir.x * bestT;
          const hz = origin.z + dir.z * bestT;
          if (Math.abs(hx - b.minX) < 0.08) hitNormal.set(-1, 0, 0);
          else if (Math.abs(hx - b.maxX) < 0.08) hitNormal.set(1, 0, 0);
          else if (Math.abs(hz - b.minZ) < 0.08) hitNormal.set(0, 0, -1);
          else if (Math.abs(hz - b.maxZ) < 0.08) hitNormal.set(0, 0, 1);
          else hitNormal.set(0, 1, 0);
        }
      }
    }

    const point = new THREE.Vector3(
      origin.x + dir.x * bestT,
      origin.y + dir.y * bestT,
      origin.z + dir.z * bestT,
    );
    return { hit, distance: bestT, point, normal: hitNormal, tag: hitTag };
  }

  function getNearestRoadPoint(x, z) {
    let bestDist = Infinity;
    let bestX = ROAD_X[4];
    let bestZ = z;
    let axis = 'ns';

    for (let i = 0; i < ROAD_X.length; i++) {
      const d = Math.abs(x - ROAD_X[i]);
      if (d < bestDist) {
        bestDist = d;
        bestX = ROAD_X[i];
        bestZ = Math.max(-470, Math.min(370, z));
        axis = 'ns';
      }
    }
    for (let j = 0; j < ROAD_Z.length; j++) {
      const d = Math.abs(z - ROAD_Z[j]);
      if (d < bestDist) {
        bestDist = d;
        bestX = Math.max(-470, Math.min(275, x));
        bestZ = ROAD_Z[j];
        axis = 'ew';
      }
    }
    return { x: bestX, z: bestZ, axis, distance: bestDist };
  }

  function getRandomSidewalkPoint(localRng, nearX, nearZ, minDist = 25, maxDist = 95) {
    const r = localRng || rng;
    const swOffset = WORLD_BOUNDS.roadWidth * 0.5 + WORLD_BOUNDS.sidewalkWidth * 0.5;
    for (let attempt = 0; attempt < 18; attempt++) {
      const useNS = r.next() < 0.52;
      const side = r.next() < 0.5 ? -1 : 1;
      let sx;
      let sz;
      let dir;
      if (useNS) {
        const rx = ROAD_X[Math.floor(r.next() * ROAD_X.length)];
        sx = rx + side * swOffset;
        sz = nearZ + (r.next() * 2 - 1) * maxDist;
        sz = Math.max(-460, Math.min(365, sz));
        dir = r.next() < 0.5 ? 0 : Math.PI;
      } else {
        const rz = ROAD_Z[Math.floor(r.next() * ROAD_Z.length)];
        sz = rz + side * swOffset;
        sx = nearX + (r.next() * 2 - 1) * maxDist;
        sx = Math.max(-460, Math.min(272, sx));
        dir = r.next() < 0.5 ? Math.PI * 0.5 : -Math.PI * 0.5;
      }
      const dist = Math.hypot(sx - nearX, sz - nearZ);
      if (dist >= minDist && dist <= maxDist && !isWaterAt(sx, sz)) {
        return { x: sx, y: getGroundHeight(sx, sz), z: sz, axis: useNS ? 'ns' : 'ew', yaw: dir };
      }
    }
    return { x: ROAD_X[4] + swOffset, y: 0, z: 0, axis: 'ns', yaw: 0 };
  }

  function getRandomRoadSpawn(localRng, nearX, nearZ, minDist = 45, maxDist = 155) {
    const r = localRng || rng;
    const laneOffset = 4.2;
    for (let attempt = 0; attempt < 22; attempt++) {
      const useNS = r.next() < 0.52;
      const dirSign = r.next() < 0.5 ? 1 : -1;
      let rx;
      let rz;
      let yaw;
      if (useNS) {
        const roadCenter = ROAD_X[Math.floor(r.next() * ROAD_X.length)];
        // Right-hand traffic: heading +Z (south) uses west/right lane (-laneOffset or +laneOffset)
        rx = roadCenter + (dirSign > 0 ? -laneOffset : laneOffset);
        rz = nearZ + (r.next() * 2 - 1) * maxDist;
        rz = Math.max(-455, Math.min(360, rz));
        yaw = dirSign > 0 ? 0 : Math.PI;
      } else {
        const roadCenter = ROAD_Z[Math.floor(r.next() * ROAD_Z.length)];
        rz = roadCenter + (dirSign > 0 ? laneOffset : -laneOffset);
        rx = nearX + (r.next() * 2 - 1) * maxDist;
        rx = Math.max(-455, Math.min(268, rx));
        yaw = dirSign > 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
      }
      const d = Math.hypot(rx - nearX, rz - nearZ);
      if (d >= minDist && d <= maxDist && !isWaterAt(rx, rz)) {
        const distObj = getDistrictAt(rx, rz);
        return { x: rx, y: 0.14, z: rz, yaw, speedLimit: distObj.speedLimit || 20 };
      }
    }
    return { x: 0 + laneOffset, y: 0.14, z: -80, yaw: 0, speedLimit: 20 };
  }

  function getTrafficLightState(ix, iz, simTime = 0) {
    const hash = Math.abs(Math.round(ix * 0.03 + iz * 0.05)) % 18;
    const cycle = (simTime + hash) % 18;
    if (cycle < 7.5) return 'ns';
    if (cycle < 9.0) return 'yellow';
    if (cycle < 16.5) return 'ew';
    return 'yellow';
  }

  // ---------------------------------------------------------------------------
  // 7. Day/Night Cycle & Per-Frame World Animation
  // ---------------------------------------------------------------------------
  const skyDay = new THREE.Color(0x63c2ff);
  const skySunset = new THREE.Color(0xff8e53);
  const skyNight = new THREE.Color(0x0a1326);
  const skyCurrent = new THREE.Color();
  let currentIsNight = false;

  function setTimeOfDay(time01 = 0.36) {
    // time01 in [0..1): 0.0 midnight, 0.25 sunrise, 0.5 noon, 0.77 golden sunset
    const t = ((time01 % 1) + 1) % 1;
    const sunAngle = (t - 0.25) * Math.PI * 2;
    const sunElev = Math.sin(sunAngle);
    const sunHoriz = Math.cos(sunAngle);

    sunDisc.position.set(sunHoriz * 760, sunElev * 680, -210);
    sunDisc.visible = sunElev > -0.18;

    const dayFactor = Math.max(0, Math.min(1, (sunElev + 0.12) / 0.52));
    const sunsetFactor = Math.max(0, 1 - Math.abs(sunElev - 0.06) / 0.26);
    currentIsNight = sunElev < 0.05;

    skyCurrent.copy(skyNight).lerp(skyDay, dayFactor);
    if (sunsetFactor > 0.01) {
      skyCurrent.lerp(skySunset, sunsetFactor * 0.68);
    }

    skyMat.color.copy(skyCurrent);
    scene.fog.color.copy(skyCurrent);

    sunLight.intensity = 0.18 + dayFactor * 1.75;
    if (sunsetFactor > 0.1) {
      sunLight.color.setHex(0xffb469);
      sunDiscMat.color.setHex(0xff9e4a);
    } else if (currentIsNight) {
      sunLight.color.setHex(0x6d93d6);
    } else {
      sunLight.color.setHex(0xfff2dc);
      sunDiscMat.color.setHex(0xffe8a3);
    }

    const lightElevY = Math.max(48, Math.abs(sunElev) * 280 + 40);
    sunLight.position.set(sunHoriz * 240, lightElevY, -135);
    hemiLight.intensity = 0.34 + dayFactor * 0.68;

    const winGlow = currentIsNight ? 0.92 : sunsetFactor * 0.45 + 0.06;
    for (let i = 0; i < facadeMaterials.length; i++) {
      facadeMaterials[i].emissiveIntensity = winGlow;
    }

    for (let i = 0; i < streetLampBulbs.length; i++) {
      streetLampBulbs[i].color.setHex(currentIsNight ? 0xffe296 : 0x5c626d);
    }
    beaconMat.opacity = currentIsNight ? 0.36 : 0.08;
  }

  function update(dt, cameraObj, simTime = 0) {
    // Update building LODs and keep directional shadow box centered near camera
    if (cameraObj) {
      for (let i = 0; i < lodObjects.length; i++) {
        lodObjects[i].update(cameraObj);
      }
      const cx = cameraObj.position.x;
      const cz = cameraObj.position.z;
      sunLight.target.position.set(cx, 0, cz);
      skyDome.position.set(cx, 0, cz);
    }

    // Animate gentle coastal ocean swells
    const posAttr = oceanGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const ox = posAttr.getX(i);
      const oz = posAttr.getZ(i);
      const wave =
        Math.sin(ox * 0.045 + simTime * 1.6) * 0.22 +
        Math.cos(oz * 0.035 + simTime * 1.25) * 0.16;
      posAttr.setY(i, oceanBaseY[i] + wave);
    }
    posAttr.needsUpdate = true;

    // Rotate Punta Faro lighthouse beam & sway palm crowns
    beaconPivot.rotation.y = simTime * 0.85;
    for (let i = 0; i < palmInstances.length; i++) {
      const p = palmInstances[i];
      p.crown.rotation.z = Math.sin(simTime * 1.8 + p.phase) * 0.055;
    }

    // Update intersection traffic signal colors
    for (let i = 0; i < intersections.length; i++) {
      const inter = intersections[i];
      const cycle = (simTime + inter.phaseOffset) % 18;
      if (cycle < 7.5) {
        inter.nsBulbMat.color.setHex(0x37d67a);
        inter.ewBulbMat.color.setHex(0xff4757);
      } else if (cycle < 9.0) {
        inter.nsBulbMat.color.setHex(0xffc947);
        inter.ewBulbMat.color.setHex(0xff4757);
      } else if (cycle < 16.5) {
        inter.nsBulbMat.color.setHex(0xff4757);
        inter.ewBulbMat.color.setHex(0x37d67a);
      } else {
        inter.nsBulbMat.color.setHex(0xff4757);
        inter.ewBulbMat.color.setHex(0xffc947);
      }
    }
  }

  setTimeOfDay(0.38);

  return {
    seed,
    bounds: WORLD_BOUNDS,
    districts: DISTRICTS,
    landmarks: LANDMARKS,
    roadX: ROAD_X,
    roadZ: ROAD_Z,
    buildings,
    intersections,
    colliders: colliderGrid.all,
    getGroundHeight,
    isWaterAt,
    getDistrictAt,
    resolveCircleCollision,
    resolveBoxCollision,
    raycastWorld,
    getNearestRoadPoint,
    getRandomSidewalkPoint,
    getRandomRoadSpawn,
    getTrafficLightState,
    setTimeOfDay,
    isNight() {
      return currentIsNight;
    },
    update,
  };
}



