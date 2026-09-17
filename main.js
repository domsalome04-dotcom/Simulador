import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ==========================================
// 1. INICIALIZACIÓN THREE.JS
// ==========================================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbde0fe);

const camera = new THREE.PerspectiveCamera(45, (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight), 0.1, 1000);
const defaultCamPosGarita = new THREE.Vector3(-10.5, 5.5, 14.2);
const defaultCamTargetGarita = new THREE.Vector3(-0.8, 0.6, 1.8);
camera.position.copy(defaultCamPosGarita);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.copy(defaultCamTargetGarita);
controls.maxPolarAngle = Math.PI / 2 + 0.02;

const ambLight = new THREE.AmbientLight(0xffffff, 0.9); scene.add(ambLight);
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x446633, 0.5); hemiLight.position.set(0, 30, 0); scene.add(hemiLight);
const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.4); sunLight.position.set(15, 30, 20); sunLight.castShadow = true; scene.add(sunLight);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ color: 0x5a8740, roughness: 0.9 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -1.5; ground.receiveShadow = true; scene.add(ground);

const sceneGaritaGroup = new THREE.Group();
const sceneTerminalGroup = new THREE.Group();
scene.add(sceneGaritaGroup);
scene.add(sceneTerminalGroup);
sceneTerminalGroup.visible = false;

const clickableObjects = [];
const pulsingTargets = [];

function createPulsingTarget(x, y, z, colorHex = 0x38bdf8) {
    const ringGeo = new THREE.RingGeometry(0.18, 0.26, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.85, depthTest: false });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(x, y, z); ring.rotation.x = -Math.PI / 2;
    scene.add(ring); pulsingTargets.push(ring); return ring;
}

// Carretera y Parada
const road = new THREE.Mesh(new THREE.PlaneGeometry(70, 6.5), new THREE.MeshStandardMaterial({ color: 0x272b30, roughness: 0.85 }));
road.rotation.x = -Math.PI / 2; road.position.set(0, -1.49, 0); road.receiveShadow = true; sceneGaritaGroup.add(road);

const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(70, 0.3, 8.5), new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.7 }));
sidewalk.position.set(0, -1.35, 7.4); sidewalk.receiveShadow = true; sceneGaritaGroup.add(sidewalk);

const shelterGroup = new THREE.Group();
const shelterRoof = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.14, 3.2), new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.9 }));
shelterRoof.position.set(6.2, 1.6, 4.8); shelterGroup.add(shelterRoof);
const shelterGlass = new THREE.Mesh(new THREE.BoxGeometry(6.3, 1.9, 0.05), new THREE.MeshStandardMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.35 }));
shelterGlass.position.set(6.2, 0.35, 6.3); shelterGroup.add(shelterGlass);
sceneGaritaGroup.add(shelterGroup);

// Poste Cámara Cenital
const poleGroup = new THREE.Group(); poleGroup.name = "CENITAL_CAMERA";
const tallPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 6.4, 16), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
tallPole.position.set(0, 1.8, 0); poleGroup.add(tallPole);
const armBeam = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
armBeam.position.set(1.1, 4.8, 0); poleGroup.add(armBeam);
const camHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.22, 16), new THREE.MeshStandardMaterial({ color: 0xffffff }));
camHousing.position.set(2.2, 4.6, 0); poleGroup.add(camHousing);
poleGroup.position.set(-6.5, -1.4, 4.8); sceneGaritaGroup.add(poleGroup);
clickableObjects.push(poleGroup);

// ==========================================
// AUTOBÚS TRANS-ESPOL
// ==========================================
const busMasterGroup = new THREE.Group(); scene.add(busMasterGroup);
const busGroup = new THREE.Group(); busGroup.name = "TRANS_ESPOL_BUS"; busMasterGroup.add(busGroup);

const bodyGreyMat = new THREE.MeshStandardMaterial({ color: 0xdde3ea, transparent: true, opacity: 0.88, roughness: 0.3 });
const blueTrimMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.3 });
const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
const glassMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.25, roughness: 0.1 });
const floorMat = new THREE.MeshStandardMaterial({ color: 0x334155 });

const roof = new THREE.Mesh(new THREE.BoxGeometry(12, 0.2, 3.2), bodyGreyMat); roof.position.y = 2.5; busGroup.add(roof);
const lowerWallRightBack = new THREE.Mesh(new THREE.BoxGeometry(7.9, 1.4, 0.15), bodyGreyMat); lowerWallRightBack.position.set(1.95, 0.2, 1.55); busGroup.add(lowerWallRightBack);
const lowerWallRightFront = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.4, 0.15), bodyGreyMat); lowerWallRightFront.position.set(-4.95, 0.2, 1.55); busGroup.add(lowerWallRightFront);
const blueStripe = new THREE.Mesh(new THREE.BoxGeometry(7.9, 0.15, 0.16), blueTrimMat); blueStripe.position.set(1.95, 0.1, 1.55); busGroup.add(blueStripe);
const rightWindowBack = new THREE.Mesh(new THREE.BoxGeometry(7.9, 1.5, 0.05), glassMat); rightWindowBack.position.set(1.95, 1.65, 1.55); busGroup.add(rightWindowBack);
const leftWallLower = new THREE.Mesh(new THREE.BoxGeometry(12, 1.4, 0.15), bodyGreyMat); leftWallLower.position.set(0, 0.2, -1.55); busGroup.add(leftWallLower);
const leftWallGlass = new THREE.Mesh(new THREE.BoxGeometry(12, 1.5, 0.05), glassMat); leftWallGlass.position.set(0, 1.65, -1.55); busGroup.add(leftWallGlass);
const backWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.0, 3.2), bodyGreyMat); backWall.position.set(5.9, 1.0, 0); busGroup.add(backWall);

[[-4, -0.88, 1.5], [4, -0.88, 1.5], [-4, -0.88, -1.5], [4, -0.88, -1.5]].forEach(pos => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.4, 32), darkMat); w.rotateX(Math.PI/2); w.position.set(...pos); busGroup.add(w);
});

// Chofer y Pantalla LED Tablero
const driverGroup = new THREE.Group();
const driverBody = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.8), new THREE.MeshStandardMaterial({ color: 0x1d4ed8 })); driverBody.position.set(-4.5, -0.1, -0.8);
const ledScreen3D = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.4), new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00aa00 })); 
ledScreen3D.position.set(-4.8, 0.2, -0.5); ledScreen3D.name = "DRIVER_DISPLAY";
driverGroup.add(driverBody, ledScreen3D); busGroup.add(driverGroup);
clickableObjects.push(ledScreen3D);

const floorFront = new THREE.Mesh(new THREE.BoxGeometry(2, 0.1, 3.2), floorMat); floorFront.position.set(-5, -0.49, 0); floorFront.receiveShadow = true; busGroup.add(floorFront);
const floorBack = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 3.2), floorMat); floorBack.position.set(2, -0.49, 0); floorBack.receiveShadow = true; busGroup.add(floorBack);

// Asientos (50)
const seatGeo = new THREE.BoxGeometry(0.55, 0.35, 0.48); 
const seatMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6 });
const seatMeshes = [];
for (let x = -4.8; x <= 5.4; x += 0.85) {
    for (let z of [-1.15, -0.62]) {
        if (seatMeshes.length < 50) {
            const s = new THREE.Mesh(seatGeo, seatMat); s.position.set(x, -0.22, z); busGroup.add(s);
            seatMeshes.push({ x, y: -0.22, z, occupied: false });
        }
    }
}
for (let x = -4.8; x <= 5.4; x += 0.85) {
    if (x > -4.5 && x < -1.5) continue;
    for (let z of [0.62, 1.15]) {
        if (seatMeshes.length < 50) {
            const s = new THREE.Mesh(seatGeo, seatMat); s.position.set(x, -0.22, z); busGroup.add(s);
            seatMeshes.push({ x, y: -0.22, z, occupied: false });
        }
    }
}
const standingSpots = [{ x: -0.5, y: -0.49, z: 0.0, occupied: false }, { x: 0.5, y: -0.49, z: 0.0, occupied: false }];

// Puerta y Sensores M18
const doorGroup = new THREE.Group(); doorGroup.name = "DOOR_SENSORS_MODULE"; busGroup.add(doorGroup);
const doorMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, roughness: 0.1 });
const door = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.08), doorMat); door.position.set(-1, 1, 1.55); doorGroup.add(door);
const s1Mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15, 16), new THREE.MeshStandardMaterial({ color: 0x111111 })); s1Mesh.position.set(-2.15, 0.41, 0.8); doorGroup.add(s1Mesh);

// ==========================================
// LÓGICA DE NEGOCIO Y DEMO AUTOMÁTICA
// ==========================================
const CAPACITY = 55;
const SEATED_CAPACITY = 50;
let currentPax = 0;
let isDoorOpen = true;
let timerSeconds = 300;
let isBusDeparting = false;
const seatedPassengers = [];

function findFreeSpot() {
    const seat = seatMeshes.find(s => !s.occupied);
    if (seat) { seat.occupied = true; return seat; }
    const stand = standingSpots.find(s => !s.occupied);
    if (stand) { stand.occupied = true; return stand; }
    return null;
}

const uiTimer = document.getElementById('ui-timer');
const appSeatsText = document.getElementById('app-seats-text');
const gpsU1Badge = document.getElementById('gps-u1-badge');
const fleetBadgeU1 = document.getElementById('fleet-badge-u1');
const u1StatusEl = document.getElementById('u1-status');
const driverLedPanel = document.getElementById('driver-led-panel');
const telemetryPaxCount = document.getElementById('telemetry-pax-count');
const telemetryPaxPercent = document.getElementById('telemetry-pax-percent');
const barSeated = document.getElementById('bar-seated');
const barStanding = document.getElementById('bar-standing');
const lblSeated = document.getElementById('lbl-seated');
const lblStanding = document.getElementById('lbl-standing');
const u1Time = document.getElementById('u1-time');

function triggerBusDeparture() {
    if (isBusDeparting) return;
    isBusDeparting = true;
    isDoorOpen = false;

    const alertToast = document.getElementById('alert-dispatch-toast');
    if (alertToast) {
        alertToast.classList.remove('opacity-0', '-translate-y-4');
        alertToast.classList.add('opacity-100', 'translate-y-0');
    }

    if (u1StatusEl) {
        u1StatusEl.innerText = `Ruta Express (FCNM / FCSH)`;
        u1StatusEl.className = "text-[9.5px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded";
    }

    let departureDist = 0;
    const departInterval = setInterval(() => {
        departureDist += 0.3;
        busMasterGroup.position.x -= 0.3;

        if (departureDist > 35) {
            clearInterval(departInterval);
            setTimeout(() => {
                seatedPassengers.forEach(p => {
                    p.mesh.traverse(child => { if (child.geometry) child.geometry.dispose(); if (child.material) child.material.dispose(); });
                    scene.remove(p.mesh);
                });
                seatedPassengers.length = 0;
                seatMeshes.forEach(s => s.occupied = false);
                standingSpots.forEach(s => s.occupied = false);

                currentPax = 0;
                busMasterGroup.position.x = 0;
                isDoorOpen = true;
                isBusDeparting = false;

                if (alertToast) {
                    alertToast.classList.add('opacity-0', '-translate-y-4');
                    alertToast.classList.remove('opacity-100', 'translate-y-0');
                }
                updateApp();
            }, 1000);
        }
    }, 30);
}

function updateApp() {
    const seatedCount = Math.min(SEATED_CAPACITY, currentPax);
    const standingCount = Math.max(0, currentPax - SEATED_CAPACITY);
    const pct = Math.round((currentPax / CAPACITY) * 100);
    
    if (barSeated) barSeated.style.width = `${(seatedCount / CAPACITY) * 100}%`;
    if (barStanding) barStanding.style.width = `${(standingCount / CAPACITY) * 100}%`;
    if (lblSeated) lblSeated.innerText = `Sentados: ${seatedCount}/50`;
    if (lblStanding) lblStanding.innerText = `Parados: ${standingCount}/5`;

    if (telemetryPaxCount) telemetryPaxCount.innerHTML = `${currentPax} / 55 <span class="text-xs font-normal text-slate-500">pax</span>`;
    if (telemetryPaxPercent) telemetryPaxPercent.innerText = `${pct}%`;

    if (currentPax >= CAPACITY) {
        if (appSeatsText) { appSeatsText.innerText = `Bus Lleno (0 libres)`; appSeatsText.className = "text-[11px] font-black text-red-600"; }
        if (driverLedPanel) {
            driverLedPanel.className = "bg-amber-600 text-white px-2 py-1 rounded-lg text-center font-black text-[9.5px] shadow-sm";
            driverLedPanel.innerText = `EXPRESS FCNM / FCSH`;
        }
        if (gpsU1Badge) gpsU1Badge.style.background = '#D97706';
        if (fleetBadgeU1) fleetBadgeU1.style.background = '#D97706';
        
        triggerBusDeparture();
    } else {
        if (appSeatsText) { appSeatsText.innerText = `${CAPACITY - currentPax} plazas disponibles`; appSeatsText.className = "text-[11px] font-black text-blue-600"; }
        if (driverLedPanel) {
            driverLedPanel.className = "bg-emerald-600 text-white px-2 py-1 rounded-lg text-center font-black text-[9.5px] shadow-sm";
            driverLedPanel.innerText = `DISPONIBLE (${currentPax}/55)`;
        }
        if (gpsU1Badge) gpsU1Badge.style.background = '#2563EB';
        if (fleetBadgeU1) fleetBadgeU1.style.background = '#2563EB';
    }
}

function buildStudentGroup() {
    const pGroup = new THREE.Group();
    const bodyColor = new THREE.Color().setHSL(Math.random(), 0.4, 0.5);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.85, 8), new THREE.MeshStandardMaterial({ color: bodyColor }));
    body.position.y = 0.42; pGroup.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffdbac }));
    head.position.y = 0.9; pGroup.add(head);
    return pGroup;
}

let activePassengers = [];
function spawnStudentAuto() {
    if (!isDoorOpen || isBusDeparting || currentPax >= CAPACITY) return;
    const pGroup = buildStudentGroup();
    scene.add(pGroup);
    pGroup.position.set(-3, -1.05, 2.8);
    const path = [
        new THREE.Vector3(-3, -1.05, 2.8),
        new THREE.Vector3(-3, -1.05, 1.35),
        new THREE.Vector3(-3, -0.49, 0.15),
        new THREE.Vector3(-1.0, -0.49, 0.15)
    ];
    activePassengers.push({ mesh: pGroup, path, currentWp: 1 });
}

// SIMULADOR TIPO VIDEO AUTOMÁTICO AL INICIAR
setTimeout(() => {
    const sub = document.getElementById('scenario-subtitle');
    if (sub) sub.innerText = "Hora pico matutina (7:30 AM): Estudiantes llegan masivamente a la parada de Garita...";
    
    const autoFillInterval = setInterval(() => {
        if (currentPax < CAPACITY && isDoorOpen && !isBusDeparting) {
            spawnStudentAuto();
            currentPax++;
            const spot = findFreeSpot();
            if (spot) {
                const p = buildStudentGroup();
                scene.add(p);
                p.position.set(spot.x, spot.y, spot.z);
                seatedPassengers.push({ mesh: p, spot });
            }
            updateApp();
        } else {
            clearInterval(autoFillInterval);
            if (sub) sub.innerText = "¡Aforo máximo alcanzado! La cámara cenital activa la Ruta Express prioritaria a FCNM y FCSH.";
        }
    }, 400);
}, 2000);

function animate() { 
    requestAnimationFrame(animate); 
    controls.update(); 
    renderer.render(scene, camera); 
}
animate();