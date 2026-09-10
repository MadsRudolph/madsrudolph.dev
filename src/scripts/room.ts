import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
const $ = (id:string)=>document.getElementById(id)!;
async function init(){
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
$('viewport').append(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color('#e9e5dc');
const camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.025,100);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=.1;controls.maxDistance=18;controls.maxPolarAngle=Math.PI*.94;
const env=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(env,.04).texture;scene.environmentIntensity=.45;env.dispose();pmrem.dispose();
const hemi=new THREE.HemisphereLight(0xe7f0ff,0xa09070,1.7);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffebcb,3.2);sun.position.set(-2,5,3);sun.target.position.set(1,0,-3);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.1,far:15});sun.shadow.bias=-.0003;sun.shadow.normalBias=.015;scene.add(sun,sun.target);
const warm=new THREE.PointLight(0xffb665,0,7,2);warm.position.set(1.6,2,-3.5);scene.add(warm);
const model=(await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('/media/room/room.glb',p=>{if(p.total)$('load-text').textContent=`Preparing your room… ${Math.round(p.loaded/p.total*100)}%`;})).scene;
scene.add(model);const shells:THREE.Object3D[]=[];
model.traverse((o:any)=>{if(o.isMesh){o.castShadow=!o.name.includes('Window_glazing');o.receiveShadow=true;for(const m of Array.isArray(o.material)?o.material:[o.material]){m.side=THREE.DoubleSide;}if(o.userData.shell)shells.push(o);}});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xe3dfd5,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.13;ground.receiveShadow=true;scene.add(ground);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const ao=new SSAOPass(scene,camera,innerWidth,innerHeight,innerWidth<700?8:16);ao.kernelRadius=.18;ao.minDistance=.001;ao.maxDistance=.12;composer.addPass(ao);composer.addPass(new OutputPass());
const views:Record<string,number[][]>={overview:[[-5.2,5.2,-7.4],[1.1,.8,-2.35]],inside:[[1.4,1.65,-4.28],[1.27,1.2,-1.4]],bed:[[.35,1.4,-3.353],[2.32,1.25,-2.55]],desk:[[1.4,1.2,-1.4],[1.28,.95,-.1]],speakers:[[1.5,2.05,-3.5],[.2,2.03,-2.94]]};
let flying=false;let transition:any=null;const keys=new Set<string>();
function shellVisibility(){const open=($('open-room') as HTMLInputElement).checked;for(const o of shells)o.visible=!(open&&(o.userData.rear||o.userData.roof||o.userData.side==='left'));}
function setView(name:string,instant=false){stopFly();document.body.classList.toggle('interior',name!=='overview');camera.fov=name==='overview'?45:70;camera.updateProjectionMatrix();const [p,t]=views[name];($('open-room') as HTMLInputElement).checked=name==='overview';shellVisibility();const dest=new THREE.Vector3(...p);if(name==='overview'&&innerWidth<700)dest.set(-9.5,9.3,-12.8);transition={from:camera.position.clone(),targetFrom:controls.target.clone(),to:dest,target:new THREE.Vector3(...t),start:performance.now(),duration:instant||matchMedia('(prefers-reduced-motion: reduce)').matches?0:1000};document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',(b as HTMLElement).dataset.view===name));}
function stopFly(){flying=false;keys.clear();controls.enabled=true;document.body.classList.remove('flying');$('movement').hidden=true;$('fly').innerHTML='Explore freely <span>⌘</span>';$('hint').textContent='Drag to orbit · Scroll to zoom · Right-drag to pan';if(document.pointerLockElement)document.exitPointerLock();}
function startFly(){transition=null;flying=true;controls.enabled=false;document.body.classList.add('flying');$('movement').hidden=false;$('fly').textContent='Finish exploring';$('hint').textContent='Drag to look · WASD move · Q / E down / up · Shift faster · Esc exit';($('open-room') as HTMLInputElement).checked=false;shellVisibility();if(camera.position.y>3||camera.position.x<0){camera.position.set(1.4,1.65,-4.2);camera.lookAt(1.27,1.4,-1);} }
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView((b as HTMLElement).dataset.view!)));
$('open-room').onchange=shellVisibility;$('evening').onchange=()=>{const night=($('evening') as HTMLInputElement).checked;sun.intensity=night?.25:3.2;hemi.intensity=night?.55:1.7;warm.intensity=night?12:0;scene.environmentIntensity=night?.18:.45;};
$('fly').onclick=()=>flying?stopFly():startFly();$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('hint').textContent='Full screen is unavailable in this browser.';}};
addEventListener('keydown',e=>{if(e.code==='Escape')stopFly();if(flying&&['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE','ShiftLeft','ShiftRight','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){keys.add(e.code);e.preventDefault();}});addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>keys.clear());
let drag=false,lastX=0,lastY=0;renderer.domElement.addEventListener('pointerdown',e=>{if(flying){drag=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);}});renderer.domElement.addEventListener('pointerup',()=>drag=false);renderer.domElement.addEventListener('pointercancel',()=>drag=false);renderer.domElement.addEventListener('pointermove',e=>{if(!flying||!drag)return;const r=new THREE.Euler().setFromQuaternion(camera.quaternion,'YXZ');r.y-=(e.clientX-lastX)*.003;r.x=THREE.MathUtils.clamp(r.x-(e.clientY-lastY)*.003,-1.5,1.5);camera.quaternion.setFromEuler(r);lastX=e.clientX;lastY=e.clientY;});
document.querySelectorAll('[data-key]').forEach(b=>{const key=(b as HTMLElement).dataset.key!;b.addEventListener('pointerdown',(e:any)=>{keys.add(key);b.setPointerCapture(e.pointerId);});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys.delete(key));});
controls.addEventListener('start',()=>transition=null);addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);});
setView('overview',true);$('loading').hidden=true;let last=performance.now();const forward=new THREE.Vector3(),right=new THREE.Vector3();
renderer.setAnimationLoop((now)=>{const dt=Math.min((now-last)/1000,.05);last=now;if(transition){const t=transition.duration?Math.min((now-transition.start)/transition.duration,1):1;const s=t*t*(3-2*t);camera.position.lerpVectors(transition.from,transition.to,s);controls.target.lerpVectors(transition.targetFrom,transition.target,s);if(t===1)transition=null;}if(flying){const speed=dt*(keys.has('ShiftLeft')||keys.has('ShiftRight')?3:1.2);camera.getWorldDirection(forward);right.crossVectors(forward,camera.up).normalize();camera.position.addScaledVector(forward,speed*((keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)));camera.position.addScaledVector(right,speed*((keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)));camera.position.y+=speed*((keys.has('KeyE')?1:0)-(keys.has('KeyQ')?1:0));controls.target.copy(camera.position).add(forward);}else controls.update();composer.render();});
// Expose only non-sensitive diagnostics for browser smoke tests.
(window as any).__room={camera,controls,renderer,model,get flying(){return flying;}};
}
init().catch(e=>{console.error(e);$('load-text').textContent='The 3D room could not load. Please reload or try a browser with WebGL enabled.';document.querySelector('.spinner')?.remove();});
