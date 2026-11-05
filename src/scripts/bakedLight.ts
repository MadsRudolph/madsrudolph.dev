// Puts the room's baked Cycles light on a loaded room.glb. The same file is used by madsrudolph.dev and
// Sound Lab; the source is surround-speaker-mount/web/photoreal/viewer/bakedLight.ts, so edit it there and
// copy. light.json, the lightmaps and the panoramas sit next to room.glb and come from scripts/encode_lights.py.
import * as THREE from 'three';

export type Mood = 'evening' | 'day';
type MoodInfo = { map: string; env: string; scale: number; exposure: number; envIntensity: number; sky: number; lamps: number };

// The lightmap already holds all diffuse light. The environment is only there for reflections, so its
// diffuse share has to go or walls would be lit twice.
export function reflectionsOnly(shader: { fragmentShader: string }) {
  shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_maps>',
    THREE.ShaderChunk.lights_fragment_maps.replace('iblIrradiance += getIBLIrradiance( geometryNormal );', ''));
}

export async function bakedLight(model: THREE.Object3D, renderer: THREE.WebGLRenderer, scene: THREE.Scene, base: string, version = '') {
  const q = version ? `?v=${version}` : '';
  const info: Record<Mood, MoodInfo> = await (await fetch(`${base}light.json${q}`)).json();
  const loader = new THREE.TextureLoader();
  const pm = new THREE.PMREMGenerator(renderer);
  const maps = {} as Record<Mood, THREE.Texture>, envs = {} as Record<Mood, THREE.Texture>;
  for (const mood of Object.keys(info) as Mood[]) {
    const map = await loader.loadAsync(base + info[mood].map + q);
    map.flipY = false; map.channel = 1; map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    maps[mood] = map;
    const pano = await loader.loadAsync(base + info[mood].env + q);
    pano.mapping = THREE.EquirectangularReflectionMapping; pano.colorSpace = THREE.SRGBColorSpace;
    envs[mood] = pm.fromEquirectangular(pano).texture;
    pano.dispose();
  }
  pm.dispose();

  const sharp = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  // A material can be shared by meshes with and without a lightmap, so lit meshes get their own copy.
  const litCopies = new Map<THREE.Material, THREE.MeshStandardMaterial>();
  const lamps: THREE.MeshStandardMaterial[] = [], skies: THREE.MeshStandardMaterial[] = [], screens: THREE.MeshStandardMaterial[] = [];
  const skyMaps = new Map<THREE.MeshStandardMaterial, THREE.Texture | null>();
  const lampBase = new Map<THREE.MeshStandardMaterial, number>();
  model.traverse((o: any) => {
    if (!o.isMesh) return;
    const name: string = (o.parent?.name?.startsWith('Photoreal') ? o.parent.name : o.name) ?? '';
    // Mirrors and steel show nothing but reflections, and the panorama is dim next to the lamps.
    for (const m of [o.material].flat()) if (m.metalness > 0.8) m.envMapIntensity = 3;
    // Real transmission renders the whole scene a second time; thin window glass doesn't need it.
    for (const m of [o.material].flat()) if (m.transmission > 0) { m.transmission = 0; m.transparent = true; m.opacity = 0.1; m.depthWrite = false; }
    const track = () => {
      for (const m of [o.material].flat()) {
        if (/^Photoreal[ _]lamp/.test(name)) { lamps.push(m); lampBase.set(m, m.emissiveIntensity); }
        if (/^Photoreal[ _]window[ _]sky/.test(name)) { skies.push(m); lampBase.set(m, m.emissiveIntensity); }
        if (/^Screen[ _]content/.test(name)) { screens.push(m); lampBase.set(m, m.emissiveIntensity); }
      }
    };
    if (!o.geometry.getAttribute('uv1')) { track(); return; }
    const lit = (m: any) => {
      let c = litCopies.get(m);
      if (!c) {
        c = m.clone() as THREE.MeshStandardMaterial;
        c.lightMap = maps.evening;
        // Keeps wood, rugs and bedding sharp at a glancing angle.
        if (c.map) c.map.anisotropy = sharp;
        if (c.normalMap) c.normalMap.anisotropy = sharp;
        c.onBeforeCompile = reflectionsOnly;
        litCopies.set(m, c);
      }
      return c;
    };
    o.material = Array.isArray(o.material) ? o.material.map(lit) : lit(o.material);
    track();
  });

  return {
    materials: [...litCopies.values()],
    moods: Object.keys(info) as Mood[],
    setMood(mood: Mood) {
      const m = info[mood] ?? info.evening;
      for (const c of litCopies.values()) {
        c.lightMap = maps[mood] ?? maps.evening;
        // Three divides the lightmap by pi; Cycles' stored value already has that in it.
        c.lightMapIntensity = m.scale * Math.PI;
      }
      for (const l of lamps) l.emissiveIntensity = (lampBase.get(l) ?? 1) * m.lamps;
      for (const s of skies) {
        s.emissiveIntensity = (lampBase.get(s) ?? 1) * m.sky;
        // The sky texture is dusk; by day the window is plain bright sky.
        if (!skyMaps.has(s)) skyMaps.set(s, s.emissiveMap);
        const dusk = mood === 'evening';
        s.emissiveMap = dusk ? skyMaps.get(s) ?? null : null;
        s.emissive.set(dusk ? 0xffffff : 0xe2eeff);
        s.needsUpdate = true;
      }
      // A screen is equally bright at any hour, so it shouldn't follow the room's exposure.
      for (const c of screens) c.emissiveIntensity = (lampBase.get(c) ?? 1) * info.evening.exposure / m.exposure;
      scene.environment = envs[mood] ?? envs.evening;
      scene.environmentIntensity = m.envIntensity;
      renderer.toneMappingExposure = m.exposure;
    },
  };
}
