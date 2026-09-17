        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        // ==========================================
        // 1. INICIALIZACIÓN ROBUSTA THREE.JS
        // ==========================================
        const container = document.getElementById('canvas-container');
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xbde0fe);
        
        const camera = new THREE.PerspectiveCamera(45, (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight), 0.1, 1000);
        const defaultCamPosGarita = new THREE.Vector3(-10.5, 5.5, 14.2);
        const defaultCamTargetGarita = new THREE.Vector3(-0.8, 0.6, 1.8);
        
        const defaultCamPosTerminal = new THREE.Vector3(0.0, 4.2, 13.5);
        const defaultCamTargetTerminal = new THREE.Vector3(0.0, 0.5, 1.0);
        
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

        // Suelo Base
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ color: 0x5a8740, roughness: 0.9 }));
        ground.rotation.x = -Math.PI / 2; ground.position.y = -1.5; ground.receiveShadow = true; scene.add(ground);

        // Grupos de Escenarios
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
            ring.position.set(x, y, z);
            ring.rotation.x = -Math.PI / 2;
            scene.add(ring);
            pulsingTargets.push(ring);
            return ring;
        }

        // ==========================================
        // AMBIENTACIÓN NATURAL: ARBOLEDA
        // ==========================================
        function createCampusTree(x, z, scale = 1, isPalm = false) {
            const tree = new THREE.Group();
            if (isPalm) {
                const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 4.5 * scale, 8), new THREE.MeshStandardMaterial({ color: 0x785338 }));
                trunk.position.y = (2.25 * scale) - 1.4;
                trunk.castShadow = true; tree.add(trunk);
                const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 });
                for (let a = 0; a < 7; a++) {
                    const frond = new THREE.Mesh(new THREE.ConeGeometry(1.2 * scale, 2.2 * scale, 5), foliageMat);
                    frond.position.set(0, (4.5 * scale) - 1.4, 0);
                    frond.rotation.z = 1.1;
                    frond.rotation.y = (a * Math.PI * 2) / 7;
                    tree.add(frond);
                }
            } else {
                const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 2.5 * scale, 8), new THREE.MeshStandardMaterial({ color: 0x5c3d2e }));
                trunk.position.y = (1.25 * scale) - 1.4;
                trunk.castShadow = true; tree.add(trunk);
                const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6 * scale, 1), new THREE.MeshStandardMaterial({ color: 0x3f6e28, roughness: 0.8 }));
                foliage.position.y = (3.0 * scale) - 1.4;
                foliage.castShadow = true; tree.add(foliage);
            }
            tree.position.set(x, 0, z);
            sceneGaritaGroup.add(tree);
        }

        createCampusTree(-18, -12, 1.3, false);
        createCampusTree(-12, -15, 1.5, false);
        createCampusTree(-4, -16, 1.4, false);
        createCampusTree(6, -15, 1.6, false);
        createCampusTree(14, -14, 1.4, false);
        createCampusTree(20, -10, 1.2, false);
        createCampusTree(-16, 12, 1.1, true);
        createCampusTree(-10, 14, 1.2, true);
        createCampusTree(12, 14, 1.1, true);
        createCampusTree(18, 12, 1.3, true);

        // ==========================================
        // 2. PARADA GARITA + CICLOVÍA TRASERA
        // ==========================================
        const road = new THREE.Mesh(new THREE.PlaneGeometry(70, 6.5), new THREE.MeshStandardMaterial({ color: 0x272b30, roughness: 0.85 }));
        road.rotation.x = -Math.PI / 2; road.position.set(0, -1.49, 0); road.receiveShadow = true; sceneGaritaGroup.add(road);

        const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(70, 0.3, 8.5), new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.7 }));
        sidewalk.position.set(0, -1.35, 7.4); sidewalk.receiveShadow = true; sceneGaritaGroup.add(sidewalk);

        const bikeLane = new THREE.Mesh(new THREE.BoxGeometry(70, 0.02, 1.8), new THREE.MeshStandardMaterial({ color: 0x9f3a2c, roughness: 0.8 }));
        bikeLane.position.set(0, -1.19, 6.8); bikeLane.receiveShadow = true; sceneGaritaGroup.add(bikeLane);

        const bikeLaneLine = new THREE.Mesh(new THREE.PlaneGeometry(70, 0.08), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        bikeLaneLine.rotation.x = -Math.PI / 2; bikeLaneLine.position.set(0, -1.17, 6.8); sceneGaritaGroup.add(bikeLaneLine);

        for(let bx = -25; bx <= 25; bx += 3.5) {
            const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 12), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
            bollard.position.set(bx, -0.85, 3.1); sceneGaritaGroup.add(bollard);
        }

        const shelterGroup = new THREE.Group();
        const shelterRoof = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.14, 3.2), new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.9 }));
        shelterRoof.position.set(6.2, 1.6, 4.8); shelterGroup.add(shelterRoof);
        const shelterGlass = new THREE.Mesh(new THREE.BoxGeometry(6.3, 1.9, 0.05), new THREE.MeshStandardMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.35 }));
        shelterGlass.position.set(6.2, 0.35, 6.3); shelterGroup.add(shelterGlass);
        const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.08, 0.45), new THREE.MeshStandardMaterial({ color: 0x92400e }));
        benchSeat.position.set(6.2, -0.7, 5.8); shelterGroup.add(benchSeat);
        sceneGaritaGroup.add(shelterGroup);

        // ==========================================
        // 3. BICICLETAS Y SENSORES (SOLO EN GARITA)
        // ==========================================
        const bicipolGroup = new THREE.Group();
        bicipolGroup.name = "BICIPOL_STATION";

        function createDetailedBike(colorHex) {
            const bike = new THREE.Group();
            const frameMat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.4, roughness: 0.3 });
            const rubberMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
            const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });

            const wheelGeo = new THREE.TorusGeometry(0.18, 0.02, 12, 24);
            const wRear = new THREE.Mesh(wheelGeo, rubberMat); wRear.position.set(0, 0.18, -0.32); bike.add(wRear);
            const wFront = new THREE.Mesh(wheelGeo, rubberMat); wFront.position.set(0, 0.18, 0.32); bike.add(wFront);

            const topTube = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45), frameMat);
            topTube.rotation.x = Math.PI / 2; topTube.position.set(0, 0.36, 0.02); bike.add(topTube);
            const downTube = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.48), frameMat);
            downTube.rotation.x = 0.85; downTube.position.set(0, 0.25, 0.1); bike.add(downTube);
            const seatTube = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.42), frameMat);
            seatTube.rotation.x = -0.3; seatTube.position.set(0, 0.28, -0.1); bike.add(seatTube);

            const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.03, 0.14), new THREE.MeshStandardMaterial({ color: 0x111111 }));
            saddle.position.set(0, 0.48, -0.14); bike.add(saddle);
            const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.38), chromeMat);
            fork.rotation.x = -0.35; fork.position.set(0, 0.3, 0.26); bike.add(fork);
            const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.28), chromeMat);
            handleBar.rotation.z = Math.PI / 2; handleBar.position.set(0, 0.48, 0.22); bike.add(handleBar);
            return bike;
        }

        for (let i = 0; i < 5; i++) {
            const dx = -1.2 + i * 0.6;
            const dockPost = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.14), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
            dockPost.position.set(dx, 0.34, 0); bicipolGroup.add(dockPost);

            const sensorCore = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.04), new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6 }));
            sensorCore.position.set(dx, 0.36, 0.08); bicipolGroup.add(sensorCore);

            const hasBike = i < 3;
            const ledSensor = new THREE.Mesh(
                new THREE.SphereGeometry(0.035, 12, 12),
                new THREE.MeshStandardMaterial({
                    color: hasBike ? 0x22c55e : 0x3b82f6,
                    emissive: hasBike ? 0x16a34a : 0x1d4ed8,
                    emissiveIntensity: 1.2
                })
            );
            ledSensor.position.set(dx, 0.66, 0); bicipolGroup.add(ledSensor);

            if (hasBike) {
                const bikeModel = createDetailedBike(0x0284c7);
                bikeModel.position.set(dx, 0, 0);
                bicipolGroup.add(bikeModel);
            }
        }

        bicipolGroup.position.set(6.2, -1.35, 4.4);
        sceneGaritaGroup.add(bicipolGroup);
        clickableObjects.push(bicipolGroup);
        createPulsingTarget(6.2, -1.15, 4.8, 0x10b981);

        // ==========================================
        // 4. POSTE CÁMARA CENITAL (GARITA)
        // ==========================================
        const poleGroup = new THREE.Group();
        poleGroup.name = "CENITAL_CAMERA";

        const tallPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 6.4, 16), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
        tallPole.position.set(0, 1.8, 0); poleGroup.add(tallPole);

        const armBeam = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
        armBeam.position.set(1.1, 4.8, 0); poleGroup.add(armBeam);

        const camHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.22, 16), new THREE.MeshStandardMaterial({ color: 0xffffff }));
        camHousing.position.set(2.2, 4.6, 0); poleGroup.add(camHousing);

        const domeLens = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        domeLens.position.set(2.2, 4.5, 0); poleGroup.add(domeLens);

        const camCone = new THREE.Mesh(
            new THREE.ConeGeometry(3.6, 6.2, 16, 1, true),
            new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.06, side: THREE.DoubleSide })
        );
        camCone.position.set(2.2, 1.6, 0.3); camCone.rotation.x = -0.22; poleGroup.add(camCone);

        poleGroup.position.set(-6.5, -1.4, 4.8);
        sceneGaritaGroup.add(poleGroup);
        clickableObjects.push(poleGroup);
        createPulsingTarget(-4.3, 3.2, 4.8, 0x38bdf8);

        // Estudiantes en fila (Garita)
        const queueGroup = new THREE.Group();
        const queuePositions = [{ x: -3.0, z: 2.8 }, { x: -2.8, z: 3.4 }, { x: -2.5, z: 4.0 }, { x: -2.2, z: 4.6 }];
        const studentColors = [0x2563eb, 0xd97706, 0x059669, 0x7c3aed];
        queuePositions.forEach((pos, i) => {
            const st = new THREE.Group();
            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.85, 8), new THREE.MeshStandardMaterial({ color: studentColors[i] }));
            body.position.y = 0.42; st.add(body);
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffdbac }));
            head.position.y = 0.9; st.add(head);
            const pack = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 0.18), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
            pack.position.set(0, 0.46, -0.22); st.add(pack);
            st.position.set(pos.x, -1.22, pos.z);
            queueGroup.add(st);
        });
        sceneGaritaGroup.add(queueGroup);

        // ==========================================
        // 5. PANTALLA LED DE ANDÉN (GARITA)
        // ==========================================
        const kioskGroup = new THREE.Group();
        kioskGroup.name = "STATION_LED_KIOSK";
        const kioskBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.15, 0.5), new THREE.MeshStandardMaterial({ color: 0x334155 }));
        kioskBase.position.set(1.5, -1.42, 4.4); kioskGroup.add(kioskBase);
        const kioskBody = new THREE.Mesh(new THREE.BoxGeometry(1.35, 2.3, 0.18), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        kioskBody.position.set(1.5, 0.05, 4.4); kioskGroup.add(kioskBody);

        const vertLedCanvas = document.createElement('canvas'); vertLedCanvas.width = 160; vertLedCanvas.height = 240;
        const vertLedCtx = vertLedCanvas.getContext('2d');
        const vertLedTexture = new THREE.CanvasTexture(vertLedCanvas);
        const vertLedScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.95), new THREE.MeshStandardMaterial({ map: vertLedTexture, emissive: 0x111111 }));
        vertLedScreen.position.set(1.5, 0.1, 4.5); kioskGroup.add(vertLedScreen);
        sceneGaritaGroup.add(kioskGroup);
        clickableObjects.push(kioskGroup);
        createPulsingTarget(1.5, -1.2, 5.2, 0x0284c7);

        let vertLedCycle = 0;
        function drawVerticalLed(modeIndex) {
            vertLedCtx.fillStyle = '#0a0f1d'; vertLedCtx.fillRect(0, 0, 160, 240);
            if (currentSceneMode === 'TERMINAL') {
                vertLedCtx.fillStyle = '#1e3a8a'; vertLedCtx.fillRect(0, 0, 160, 36);
                vertLedCtx.fillStyle = '#fff'; vertLedCtx.font = 'bold 10.5px sans-serif'; vertLedCtx.textAlign = 'center';
                vertLedCtx.fillText('TERMINAL · SALIDA CAMPUS', 80, 22);

                vertLedCtx.fillStyle = '#38bdf8'; vertLedCtx.font = '900 24px monospace';
                vertLedCtx.fillText('A GARITA', 80, 75);

                const full = currentPax >= CAPACITY;
                vertLedCtx.fillStyle = full ? '#ef4444' : '#22c55e';
                vertLedCtx.font = 'bold 18px monospace';
                vertLedCtx.fillText(`${currentPax}/55 PAX`, 80, 115);

                vertLedCtx.fillStyle = '#cbd5e1'; vertLedCtx.font = '10px monospace';
                vertLedCtx.fillText(`Salida: ${formatTime(timerSeconds)}`, 80, 145);
                vertLedCtx.fillText('Retorno de Jornada', 80, 175);
                vertLedCtx.fillText('Andén Exclusivo Bus Interno', 80, 205);
            } else {
                if (modeIndex === 0) {
                    vertLedCtx.fillStyle = '#0284c7'; vertLedCtx.fillRect(0, 0, 160, 36);
                    vertLedCtx.fillStyle = '#fff'; vertLedCtx.font = 'bold 11px sans-serif'; vertLedCtx.textAlign = 'center';
                    vertLedCtx.fillText('PRÓXIMO BUS · GARITA', 80, 22);

                    vertLedCtx.fillStyle = '#fff'; vertLedCtx.font = '900 36px monospace';
                    vertLedCtx.fillText(activeUnitName, 80, 80);

                    const full = currentPax >= CAPACITY;
                    vertLedCtx.fillStyle = full ? '#ef4444' : '#22c55e';
                    vertLedCtx.font = 'bold 18px monospace';
                    vertLedCtx.fillText(`${currentPax}/55 PAX`, 80, 115);

                    vertLedCtx.fillStyle = '#94a3b8'; vertLedCtx.font = '10px monospace';
                    vertLedCtx.fillText(`Salida: ${formatTime(timerSeconds)}`, 80, 140);
                    vertLedCtx.fillText(`Ruta: ${currentRouteMode}`, 80, 160);

                    vertLedCtx.fillStyle = '#38bdf8';
                    vertLedCtx.fillText('FLOTA ACTIVA: 3/5', 80, 205);
                } else if (modeIndex === 1) {
                    vertLedCtx.fillStyle = '#1e3a8a'; vertLedCtx.fillRect(0, 0, 160, 36);
                    vertLedCtx.fillStyle = '#fff'; vertLedCtx.font = 'bold 11px sans-serif'; vertLedCtx.textAlign = 'center';
                    vertLedCtx.fillText('UBICACIÓN EN VIVO', 80, 22);

                    vertLedCtx.strokeStyle = '#38bdf8'; vertLedCtx.lineWidth = 3;
                    vertLedCtx.strokeRect(25, 55, 110, 75);

                    vertLedCtx.fillStyle = '#22c55e'; vertLedCtx.fillRect(35, 65, 8, 8);
                    vertLedCtx.fillStyle = '#fff'; vertLedCtx.font = '8px monospace'; vertLedCtx.textAlign = 'left';
                    vertLedCtx.fillText(`${activeUnitName}: Garita (Andén)`, 50, 72);

                    vertLedCtx.fillStyle = '#3b82f6'; vertLedCtx.fillRect(35, 90, 8, 8);
                    vertLedCtx.fillText('U2: FADCOM (4m)', 50, 97);

                    vertLedCtx.fillStyle = '#f59e0b'; vertLedCtx.fillRect(35, 115, 8, 8);
                    vertLedCtx.fillText('U3: FCNM (8m)', 50, 122);

                    vertLedCtx.fillStyle = '#e2e8f0'; vertLedCtx.textAlign = 'center';
                    vertLedCtx.fillText('Circuito FCNM-FCV', 80, 165);
                    vertLedCtx.fillText('Trans-ESPOL', 80, 185);
                } else {
                    vertLedCtx.fillStyle = '#047857'; vertLedCtx.fillRect(0, 0, 160, 36);
                    vertLedCtx.fillStyle = '#fff'; vertLedCtx.font = 'bold 11px sans-serif'; vertLedCtx.textAlign = 'center';
                    vertLedCtx.fillText('BiciPOL · GARITA', 80, 22);

                    vertLedCtx.font = '900 42px sans-serif'; vertLedCtx.fillText('🚲', 80, 95);
                    vertLedCtx.fillStyle = '#34d399'; vertLedCtx.font = 'bold 20px monospace';
                    vertLedCtx.fillText('8 LIBRES', 80, 140);
                    vertLedCtx.fillStyle = '#94a3b8'; vertLedCtx.font = '10px sans-serif';
                    vertLedCtx.fillText('4 bahías de entrega', 80, 170);
                    vertLedCtx.fillText('Usa tu carnet / QR', 80, 195);
                }
            }
            vertLedTexture.needsUpdate = true;
        }
        setInterval(() => {
            // Si hay un visitante externo detectado, la pantalla se queda en el
            // QR de registro y no sigue rotando sus contenidos habituales.
            if (typeof modoQRActivo !== 'undefined' && modoQRActivo) return;
            vertLedCycle = (vertLedCycle + 1) % 3; drawVerticalLed(vertLedCycle);
        }, 4000);

        // ==========================================
        // 6. ESCENARIO TERMINAL INTERNA (FRONTAL)
        // ==========================================
        const termFloor = new THREE.Mesh(new THREE.PlaneGeometry(80, 30), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 }));
        termFloor.rotation.x = -Math.PI / 2; termFloor.position.set(0, -1.49, 0); sceneTerminalGroup.add(termFloor);

        const termHangar = new THREE.Group();
        const termRoof = new THREE.Mesh(new THREE.BoxGeometry(40, 0.4, 18), new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 }));
        termRoof.position.set(0, 5.5, 2); termHangar.add(termRoof);

        for(let tx = -18; tx <= 18; tx += 6.0) {
            const columnBack = new THREE.Mesh(new THREE.BoxGeometry(0.35, 7.0, 0.35), new THREE.MeshStandardMaterial({ color: 0x0f2b48 }));
            columnBack.position.set(tx, 2.0, -6.5); termHangar.add(columnBack);

            const columnFront = new THREE.Mesh(new THREE.BoxGeometry(0.35, 7.0, 0.35), new THREE.MeshStandardMaterial({ color: 0x0f2b48 }));
            columnFront.position.set(tx, 2.0, 9.5); termHangar.add(columnFront);

            const trussBeam = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 16), new THREE.MeshStandardMaterial({ color: 0x0f2b48 }));
            trussBeam.position.set(tx, 5.2, 1.5); termHangar.add(trussBeam);
        }

        const termPlatform = new THREE.Mesh(new THREE.BoxGeometry(38, 0.6, 6.5), new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 }));
        termPlatform.position.set(0, -1.2, 5.5); termHangar.add(termPlatform);

        for(let rx = -15; rx <= 15; rx += 4.5) {
            const railing = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.0, 0.06), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8 }));
            railing.position.set(rx, -0.4, 2.3); termHangar.add(railing);
        }

        const termSignCanvas = document.createElement('canvas'); termSignCanvas.width = 256; termSignCanvas.height = 64;
        const termSignCtx = termSignCanvas.getContext('2d');
        termSignCtx.fillStyle = '#0f2b48'; termSignCtx.fillRect(0, 0, 256, 64);
        termSignCtx.fillStyle = '#38bdf8'; termSignCtx.font = 'bold 20px sans-serif'; termSignCtx.textAlign = 'center';
        termSignCtx.fillText('TERMINAL · ANDÉN INTERNO', 128, 28);
        termSignCtx.fillStyle = '#ffffff'; termSignCtx.font = 'bold 13px sans-serif';
        termSignCtx.fillText('RETORNO A GARITA', 128, 48);
        const termSignSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(termSignCanvas) }));
        termSignSprite.scale.set(3.5, 0.85, 1);
        termSignSprite.position.set(0, 4.4, 2.3);
        termHangar.add(termSignSprite);

        const termQueueGroup = new THREE.Group();
        const termQueuePos = [{ x: -2.0, z: 4.5 }, { x: -1.0, z: 4.5 }, { x: 0.0, z: 4.5 }, { x: 1.0, z: 4.5 }, { x: 2.0, z: 4.5 }];
        termQueuePos.forEach((pos, i) => {
            const st = new THREE.Group();
            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.85, 8), new THREE.MeshStandardMaterial({ color: studentColors[i % studentColors.length] }));
            body.position.y = 0.42; st.add(body);
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffdbac }));
            head.position.y = 0.9; st.add(head);
            st.position.set(pos.x, -0.9, pos.z);
            termQueueGroup.add(st);
        });
        termHangar.add(termQueueGroup);

        sceneTerminalGroup.add(termHangar);

        // ==========================================
        // 7. AUTOBÚS TRANS-ESPOL (GRIS CLARO)
        // ==========================================
        const busMasterGroup = new THREE.Group();
        scene.add(busMasterGroup);

        const busGroup = new THREE.Group();
        busGroup.name = "TRANS_ESPOL_BUS";
        busMasterGroup.add(busGroup);

        const bodyGreyMat = new THREE.MeshStandardMaterial({ color: 0xdde3ea, transparent: true, opacity: 0.88, roughness: 0.3 });
        const blueTrimMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.3 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.25, roughness: 0.1 });
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x334155 }); 

        const roof = new THREE.Mesh(new THREE.BoxGeometry(12, 0.2, 3.2), bodyGreyMat); roof.position.y = 2.5; busGroup.add(roof);

        const lowerWallRightBack = new THREE.Mesh(new THREE.BoxGeometry(7.9, 1.4, 0.15), bodyGreyMat);
        lowerWallRightBack.position.set(1.95, 0.2, 1.55); busGroup.add(lowerWallRightBack);

        const lowerWallRightFront = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.4, 0.15), bodyGreyMat);
        lowerWallRightFront.position.set(-4.95, 0.2, 1.55); busGroup.add(lowerWallRightFront);

        const blueStripe = new THREE.Mesh(new THREE.BoxGeometry(7.9, 0.15, 0.16), blueTrimMat);
        blueStripe.position.set(1.95, 0.1, 1.55); busGroup.add(blueStripe);

        const rightWindowBack = new THREE.Mesh(new THREE.BoxGeometry(7.9, 1.5, 0.05), glassMat);
        rightWindowBack.position.set(1.95, 1.65, 1.55); busGroup.add(rightWindowBack);

        const leftWallLower = new THREE.Mesh(new THREE.BoxGeometry(12, 1.4, 0.15), bodyGreyMat);
        leftWallLower.position.set(0, 0.2, -1.55); busGroup.add(leftWallLower);
        const leftWallGlass = new THREE.Mesh(new THREE.BoxGeometry(12, 1.5, 0.05), glassMat);
        leftWallGlass.position.set(0, 1.65, -1.55); busGroup.add(leftWallGlass);

        const backWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.0, 3.2), bodyGreyMat);
        backWall.position.set(5.9, 1.0, 0); busGroup.add(backWall);

        // Trompa aerodinámica
        const frontNose = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.5, 3.2), bodyGreyMat);
        frontNose.position.set(-6.3, 0.25, 0); busGroup.add(frontNose);

        const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 3.3), darkMat);
        frontBumper.position.set(-6.55, -0.4, 0); busGroup.add(frontBumper);

        const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.6, 3.0), glassMat);
        windshield.rotation.z = 0.22; windshield.position.set(-6.15, 1.65, 0); busGroup.add(windshield);

        const headlightGeo = new THREE.BoxGeometry(0.08, 0.18, 0.4);
        const headlightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.0 });
        const hlRight = new THREE.Mesh(headlightGeo, headlightMat); hlRight.position.set(-6.7, 0.35, 1.1); busGroup.add(hlRight);
        const hlLeft = new THREE.Mesh(headlightGeo, headlightMat); hlLeft.position.set(-6.7, 0.35, -1.1); busGroup.add(hlLeft);

        [[-4, -0.88, 1.5], [4, -0.88, 1.5], [-4, -0.88, -1.5], [4, -0.88, -1.5]].forEach(pos => {
            const w = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.4, 32), darkMat); w.rotateX(Math.PI/2); w.position.set(...pos); busGroup.add(w);
        });

        // Chofer
        const driverGroup = new THREE.Group();
        const driverBody = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.8), new THREE.MeshStandardMaterial({ color: 0x1d4ed8 })); driverBody.position.set(-4.5, -0.1, -0.8);
        const driverHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffdbac })); driverHead.position.set(-4.5, 0.4, -0.8);
         
        // PANTALLA LED CABINA CHOFER (CLICKABLE)
        const ledScreen3D = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.4), new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00aa00 })); 
        ledScreen3D.position.set(-4.8, 0.2, -0.5);
        ledScreen3D.name = "DRIVER_DISPLAY";
        driverGroup.add(driverBody, driverHead, ledScreen3D);
        busGroup.add(driverGroup);
        clickableObjects.push(ledScreen3D);
        createPulsingTarget(-4.8, 0.5, -0.5, 0x10b981);

        // PANTALLA LED EXTERIOR SOBRE PUERTA
        const extLedCanvas = document.createElement('canvas'); extLedCanvas.width = 256; extLedCanvas.height = 64;
        const extLedCtx = extLedCanvas.getContext('2d');
        const extLedTexture = new THREE.CanvasTexture(extLedCanvas);
        const externalLedMesh = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 0.35, 0.1),
            new THREE.MeshStandardMaterial({ map: extLedTexture, emissive: 0x003300, roughness: 0.2 })
        );
        externalLedMesh.position.set(-3, 2.35, 1.6);
        busGroup.add(externalLedMesh);

        function drawExternalLed(bgColor, textColor, line1, line2) {
            extLedCtx.fillStyle = bgColor; extLedCtx.fillRect(0, 0, 256, 64);
            extLedCtx.fillStyle = textColor; extLedCtx.textAlign = 'center'; extLedCtx.textBaseline = 'middle';
            extLedCtx.font = 'bold 22px monospace'; extLedCtx.fillText(line1, 128, line2 ? 22 : 32);
            if (line2) { extLedCtx.font = 'bold 14px monospace'; extLedCtx.fillText(line2, 128, 46); }
            extLedTexture.needsUpdate = true;
        }

        // Letrero Frontal P10 (64x16 cm)
        const p10Housing = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.55, 2.2), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.3 }));
        p10Housing.position.set(-6.15, 2.35, 0); p10Housing.name = "P10_DISPLAY"; busGroup.add(p10Housing);
        clickableObjects.push(p10Housing);
        createPulsingTarget(-6.2, 2.6, 0, 0xf59e0b);

        const p10Canvas = document.createElement('canvas'); p10Canvas.width = 512; p10Canvas.height = 128;
        const p10Ctx = p10Canvas.getContext('2d');
        const p10Texture = new THREE.CanvasTexture(p10Canvas);
        const p10Screen = new THREE.Mesh(new THREE.PlaneGeometry(2.05, 0.46), new THREE.MeshStandardMaterial({ map: p10Texture, emissive: 0x221100, roughness: 0.2 }));
        p10Screen.rotation.y = -Math.PI / 2; p10Screen.position.set(-6.29, 2.35, 0); busGroup.add(p10Screen);

        let currentRouteMode = 'EXPRESS';
        function renderP10Display() {
            p10Ctx.fillStyle = '#050505'; p10Ctx.fillRect(0, 0, 512, 128);
            p10Ctx.fillStyle = 'rgba(25, 25, 25, 0.7)';
            for (let x = 4; x < 512; x += 8) for (let y = 4; y < 128; y += 8) p10Ctx.fillRect(x, y, 2, 2);
            const isExpress = currentRouteMode === 'EXPRESS';
            p10Ctx.fillStyle = isExpress ? '#f59e0b' : '#38bdf8';
            p10Ctx.shadowColor = isExpress ? '#f59e0b' : '#38bdf8';
            p10Ctx.shadowBlur = 10;
            p10Ctx.font = '900 46px monospace'; p10Ctx.textAlign = 'center'; p10Ctx.textBaseline = 'middle';
            p10Ctx.fillText(isExpress ? "RUTA EXPRESS" : "RUTA COMPLETA", 256, 44);
            p10Ctx.font = '700 23px -apple-system, sans-serif'; p10Ctx.fillText("TRANS ESPOL · CIRCUITO FCNM-FCV", 256, 92);
            p10Ctx.shadowBlur = 0;
            p10Texture.needsUpdate = true;
        }
        renderP10Display();

        // Pisos y Estribos
        const floorFront = new THREE.Mesh(new THREE.BoxGeometry(2, 0.1, 3.2), floorMat); floorFront.position.set(-5, -0.49, 0); floorFront.receiveShadow = true; busGroup.add(floorFront);
        const floorBack = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 3.2), floorMat); floorBack.position.set(2, -0.49, 0); floorBack.receiveShadow = true; busGroup.add(floorBack);
        const floorMiddle = new THREE.Mesh(new THREE.BoxGeometry(2, 0.1, 1.6), floorMat); floorMiddle.position.set(-3, -0.49, -0.8); floorMiddle.receiveShadow = true; busGroup.add(floorMiddle);

        const pitSide1 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 0.05), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        pitSide1.position.set(-4, -0.95, 0.75); pitSide1.rotation.y = Math.PI/2; busGroup.add(pitSide1);
        const pitSide2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 0.05), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        pitSide2.position.set(-2, -0.95, 0.75); pitSide2.rotation.y = -Math.PI/2; busGroup.add(pitSide2);
        const pitBack = new THREE.Mesh(new THREE.BoxGeometry(2, 1.0, 0.05), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        pitBack.position.set(-3, -0.95, 0.0); busGroup.add(pitBack);

        const step1 = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.1, 0.35), floorMat); step1.position.set(-3, -1.05, 1.35); busGroup.add(step1);
        const step2 = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.1, 0.35), floorMat); step2.position.set(-3, -0.77, 1.0); busGroup.add(step2);

        // 50 Asientos
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

        const standingSpots = [
            { x: -0.5, y: -0.49, z: 0.0, occupied: false }, { x: 0.5, y: -0.49, z: 0.0, occupied: false },
            { x: 1.5, y: -0.49, z: 0.0, occupied: false }, { x: 2.5, y: -0.49, z: 0.0, occupied: false },
            { x: 3.5, y: -0.49, z: 0.0, occupied: false }
        ];

        // MÓDULO SENSORES PUERTA (S0, S1, S2)
        const doorGroup = new THREE.Group();
        doorGroup.name = "DOOR_SENSORS_MODULE";
        busGroup.add(doorGroup);
        clickableObjects.push(doorGroup);
        createPulsingTarget(-2.1, 0.6, 1.4, 0xef4444);

        const doorMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, roughness: 0.1 });
        const door = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.08), doorMat); door.position.set(-1, 1, 1.55); doorGroup.add(door);
         
        const s0Fixed = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.12), new THREE.MeshStandardMaterial({ color: 0x10b981 })); 
        s0Fixed.position.set(-2.0, 2.35, 1.58); doorGroup.add(s0Fixed);

        const rightPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3, 16), new THREE.MeshStandardMaterial({ color: 0x334155 }));
        rightPole.position.set(-2.05, 1, 0.7); doorGroup.add(rightPole);

        const sensorBlack = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const m18Geo = new THREE.CylinderGeometry(0.04, 0.04, 0.15, 16); m18Geo.rotateZ(Math.PI/2);
        const lensMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x550000 });
         
        const s1Mesh = new THREE.Mesh(m18Geo, sensorBlack); s1Mesh.position.set(-2.15, 0.41, 0.8); doorGroup.add(s1Mesh); 
        const s1Lens = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.16, 16), lensMat); s1Lens.rotateZ(Math.PI/2); s1Lens.position.set(-2.15, 0.41, 0.8); doorGroup.add(s1Lens);

        const s2Mesh = new THREE.Mesh(m18Geo, sensorBlack); s2Mesh.position.set(-2.15, 0.41, 0.55); doorGroup.add(s2Mesh); 
        const s2Lens = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.16, 16), lensMat); s2Lens.rotateZ(Math.PI/2); s2Lens.position.set(-2.15, 0.41, 0.55); doorGroup.add(s2Lens);

        const beamGeo = new THREE.CylinderGeometry(0.012, 0.012, 1.85, 8); beamGeo.rotateZ(Math.PI/2);
        const beam1 = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.5 }));
        beam1.position.set(-3.025, 0.41, 0.8); doorGroup.add(beam1);
        const beam2 = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.5 }));
        beam2.position.set(-3.025, 0.41, 0.55); doorGroup.add(beam2);

        // ==========================================
        // 8. LÓGICA DE AFORO, PASAJEROS Y EVENTOS
        // ==========================================
        const CAPACITY = 55;
        const SEATED_CAPACITY = 50;
        let currentPax = 0;
        let isDoorOpen = true;
        let timerSeconds = 300;
        let timerInterval = null; 
        let isTimerExceeded = false;
        let queueCount = 4;
        let activeUnitName = 'U1';
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
        const dockTimerBar = document.getElementById('dock-timer-bar');
        const appSeatsText = document.getElementById('app-seats-text');
        const gpsU1Badge = document.getElementById('gps-u1-badge');
        const fleetBadgeU1 = document.getElementById('fleet-badge-u1');
        const u1StatusEl = document.getElementById('u1-status');
        const indS1 = document.getElementById('ind-s1');
        const indS2 = document.getElementById('ind-s2');

        const driverLedPanel = document.getElementById('driver-led-panel');
        const telemetryPaxCount = document.getElementById('telemetry-pax-count');
        const telemetryPaxPercent = document.getElementById('telemetry-pax-percent');

        const barSeated = document.getElementById('bar-seated');
        const barStanding = document.getElementById('bar-standing');
        const lblSeated = document.getElementById('lbl-seated');
        const lblStanding = document.getElementById('lbl-standing');
        const u1Time = document.getElementById('u1-time');

        const gpsU1 = document.getElementById('gps-u1');
        const gpsU2 = document.getElementById('gps-u2');
        const gpsU3 = document.getElementById('gps-u3');
        let angleU1 = Math.PI / 2, angleU2 = 1.5, angleU3 = 3.5;

        // U3 Simulación Dinámica en Ruta
        let u3Pax = 42;
        const barSeatedU3 = document.getElementById('bar-seated-u3');
        const barStandingU3 = document.getElementById('bar-standing-u3');
        const lblSeatedU3 = document.getElementById('lbl-seated-u3');
        const lblStandingU3 = document.getElementById('lbl-standing-u3');
        const u3Occupancy = document.getElementById('u3-occupancy');
        const u3Status = document.getElementById('u3-status');
        const STOPS_NAMES = ['FCV', 'FADCOM', 'FCNM', 'FIEC', 'Terminal'];
        let u3StopIdx = 0;

        setInterval(() => {
            u3StopIdx = (u3StopIdx + 1) % STOPS_NAMES.length;
            const bajan = Math.floor(Math.random() * 5);
            const suben = Math.floor(Math.random() * 6);
            u3Pax = Math.max(12, Math.min(CAPACITY, u3Pax - bajan + suben));
            
            const seatedU3 = Math.min(SEATED_CAPACITY, u3Pax);
            const standingU3 = Math.max(0, u3Pax - SEATED_CAPACITY);
            if (barSeatedU3) barSeatedU3.style.width = `${(seatedU3 / CAPACITY) * 100}%`;
            if (barStandingU3) barStandingU3.style.width = `${(standingU3 / CAPACITY) * 100}%`;
            if (lblSeatedU3) lblSeatedU3.innerText = `Sentados: ${seatedU3}/50`;
            if (lblStandingU3) lblStandingU3.innerText = `Parados: ${standingU3}/5`;
            if (u3Occupancy) u3Occupancy.innerText = `Ocupación: ${u3Pax}/55 pax`;
            if (u3Status) u3Status.innerText = `Parada: ${STOPS_NAMES[u3StopIdx]}`;
        }, 3200);

        function updateFleetGPS() {
            angleU2 += 0.003; angleU3 += 0.002;
            if (isBusDeparting) angleU1 += 0.005;
            if (gpsU1) { gpsU1.style.left = `${92 + 3 * Math.cos(angleU1)}%`; gpsU1.style.top = `${94 + 2 * Math.sin(angleU1)}%`; }
            if (gpsU2) { gpsU2.style.left = `${54 + 18 * Math.cos(angleU2)}%`; gpsU2.style.top = `${25 + 12 * Math.sin(angleU2)}%`; }
            if (gpsU3) { gpsU3.style.left = `${24 + 14 * Math.cos(angleU3)}%`; gpsU3.style.top = `${52 + 10 * Math.sin(angleU3)}%`; }
        }
        setInterval(updateFleetGPS, 100);

        const sigContainer = document.getElementById('signal-container');
        for(let i=0; i<28; i++) { const bar = document.createElement('div'); bar.className = 'signal-bar'; bar.style.height = '2px'; sigContainer.appendChild(bar); }
        
        function pushSignal(valS1, valS2, both) {
            const bars = sigContainer.children;
            for(let i = 0; i < bars.length - 1; i++) { bars[i].style.height = bars[i+1].style.height; bars[i].className = bars[i+1].className; }
            const lastBar = bars[bars.length - 1];
            if(both) { lastBar.style.height = '26px'; lastBar.className = 'signal-bar signal-both'; }
            else if(valS1) { lastBar.style.height = '18px'; lastBar.className = 'signal-bar signal-s1'; }
            else if(valS2) { lastBar.style.height = '12px'; lastBar.className = 'signal-bar signal-s2'; }
            else { lastBar.style.height = '2px'; lastBar.className = 'signal-bar'; }
        }
        setInterval(() => pushSignal(false, false, false), 90);

        function formatTime(sec) { const m = Math.floor(sec / 60).toString().padStart(2, '0'); const s = (sec % 60).toString().padStart(2, '0'); return `${m}:${s}`; }

        function triggerBusDeparture() {
            if (isBusDeparting) return;
            isBusDeparting = true;
            isDoorOpen = false;

            door.position.x = -3;
            beam1.visible = false;
            beam2.visible = false;
            const bS0 = document.getElementById('badge-s0');
            if (bS0) { bS0.innerText = 'S0: Cerrada'; bS0.className = 'text-[8.5px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded'; }

            const alertToast = document.getElementById('alert-dispatch-toast');
            if (alertToast) {
                alertToast.classList.remove('opacity-0', '-translate-y-4');
                alertToast.classList.add('opacity-100', 'translate-y-0');
            }

            if (u1StatusEl) {
                u1StatusEl.innerText = `En Tránsito (${activeUnitName})`;
                u1StatusEl.className = "text-[9.5px] font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded";
            }

            let departureDist = 0;
            const departInterval = setInterval(() => {
                departureDist += 0.25;
                busMasterGroup.position.x -= 0.25;

                if (departureDist > 30) {
                    clearInterval(departInterval);
                    setTimeout(() => {
                        seatedPassengers.forEach(p => removeMesh(p.mesh));
                        seatedPassengers.length = 0;
                        seatMeshes.forEach(s => s.occupied = false);
                        standingSpots.forEach(s => s.occupied = false);

                        currentPax = 0;
                        busMasterGroup.position.x = 0;
                        activeUnitName = activeUnitName === 'U1' ? 'U2' : 'U1';
                        if (fleetBadgeU1) fleetBadgeU1.innerText = activeUnitName;
                        if (gpsU1Badge) gpsU1Badge.querySelector('span').innerText = activeUnitName;

                        isDoorOpen = true;
                        isBusDeparting = false;
                        door.position.x = -1;
                        beam1.visible = true;
                        beam2.visible = true;
                        if (bS0) { bS0.innerText = 'S0: Abierta'; bS0.className = 'text-[8.5px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded'; }

                        if (alertToast) {
                            alertToast.classList.add('opacity-0', '-translate-y-4');
                            alertToast.classList.remove('opacity-100', 'translate-y-0');
                        }

                        startTimer();
                        updateApp();
                    }, 1200);
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
                    driverLedPanel.className = "bg-red-600 text-white px-2 py-1 rounded-lg text-center font-black text-[9.5px] buzzer-alert shadow-sm";
                    driverLedPanel.innerText = `LLENO - DESPACHANDO`;
                }
                ledScreen3D.material.color.setHex(0xff0000); ledScreen3D.material.emissive.setHex(0xaa0000);
                drawExternalLed('#7f1d1d', '#ffffff', `LLENO 55/55`, 'DESPACHANDO');
                if (gpsU1Badge) gpsU1Badge.style.background = '#DC2626';
                if (fleetBadgeU1) fleetBadgeU1.style.background = '#DC2626';
                
                triggerBusDeparture();
            } else if (currentPax >= SEATED_CAPACITY) {
                if (appSeatsText) { appSeatsText.innerText = `${CAPACITY - currentPax} plazas (Solo de pie)`; appSeatsText.className = "text-[11px] font-black text-orange-600"; }
                if (driverLedPanel) {
                    driverLedPanel.className = "bg-orange-500 text-white px-2 py-1 rounded-lg text-center font-black text-[9.5px] shadow-sm";
                    driverLedPanel.innerText = `SOLO DE PIE (${currentPax}/55)`;
                }
                ledScreen3D.material.color.setHex(0xffaa00); ledScreen3D.material.emissive.setHex(0xaa5500);
                drawExternalLed('#c2410c', '#ffffff', `SOLO PIE`, `${currentPax}/${CAPACITY}`);
                if (gpsU1Badge) gpsU1Badge.style.background = '#D97706';
                if (fleetBadgeU1) fleetBadgeU1.style.background = '#D97706';
            } else {
                if (appSeatsText) { appSeatsText.innerText = `${CAPACITY - currentPax} plazas disponibles`; appSeatsText.className = "text-[11px] font-black text-blue-600"; }
                if (driverLedPanel) {
                    driverLedPanel.className = "bg-emerald-600 text-white px-2 py-1 rounded-lg text-center font-black text-[9.5px] shadow-sm";
                    driverLedPanel.innerText = `DISPONIBLE (${currentPax}/55)`;
                }
                ledScreen3D.material.color.setHex(0x00ff00); ledScreen3D.material.emissive.setHex(0x00aa00);
                drawExternalLed('#15803d', '#ffffff', `DISPONIBLE`, `${currentPax}/${CAPACITY}`);
                if (gpsU1Badge) gpsU1Badge.style.background = '#2563EB';
                if (fleetBadgeU1) fleetBadgeU1.style.background = '#2563EB';
            }

            if (u1Time) u1Time.innerText = `Salida en ${formatTime(timerSeconds)}`;

            if (u1StatusEl) {
                if (!isDoorOpen) {
                    u1StatusEl.className = "text-[9.5px] font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded";
                    u1StatusEl.innerText = "En Tránsito";
                } else if (currentPax >= CAPACITY || isTimerExceeded) {
                    u1StatusEl.className = "text-[9.5px] font-black text-orange-700 bg-orange-100 px-2 py-0.5 rounded";
                    u1StatusEl.innerText = "Salida Inminente";
                } else {
                    u1StatusEl.className = "text-[9.5px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded";
                    u1StatusEl.innerText = "Abordaje Abierto";
                }
            }
        }

        // Simulación CCTV Canvas
        const camCvCanvas = document.getElementById('cam-cv-canvas');
        const camCvCtx = camCvCanvas ? camCvCanvas.getContext('2d') : null;
        const inspectorCamBadge = document.getElementById('inspector-cam-badge');

        function renderCameraCCTV(detectedCount) {
            if (!camCvCtx) return;
            camCvCtx.fillStyle = '#0a0f1d';
            camCvCtx.fillRect(0, 0, 280, 112);

            camCvCtx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
            camCvCtx.lineWidth = 1;
            for(let x = 0; x < 280; x += 32) { camCvCtx.beginPath(); camCvCtx.moveTo(x, 0); camCvCtx.lineTo(x, 112); camCvCtx.stroke(); }
            for(let y = 0; y < 112; y += 24) { camCvCtx.beginPath(); camCvCtx.moveTo(0, y); camCvCtx.lineTo(280, y); camCvCtx.stroke(); }

            const basePositions = [{ x: 45, y: 30 }, { x: 95, y: 40 }, { x: 145, y: 50 }, { x: 195, y: 60 }];
            for(let i = 0; i < detectedCount; i++) {
                const p = basePositions[i % basePositions.length];
                const jitterX = p.x + Math.sin(Date.now() * 0.003 + i) * 1.5;
                const jitterY = p.y + Math.cos(Date.now() * 0.003 + i) * 1.5;

                camCvCtx.strokeStyle = '#22c55e'; camCvCtx.lineWidth = 1.5;
                camCvCtx.strokeRect(jitterX, jitterY, 26, 36);
                camCvCtx.fillStyle = '#22c55e'; camCvCtx.font = 'bold 8px monospace';
                camCvCtx.fillText(`pax_${i+1}: 0.99`, jitterX, jitterY - 2);
                camCvCtx.fillStyle = 'rgba(34, 197, 94, 0.12)';
                camCvCtx.fillRect(jitterX, jitterY, 26, 36);
            }
            if (inspectorCamBadge) inspectorCamBadge.innerText = `${detectedCount} DETECTADOS`;
        }
        setInterval(() => renderCameraCCTV(queueCount), 100);

        // Control RF
        const btnRfCompleta = document.getElementById('btn-rf-completa');
        const btnRfExpress = document.getElementById('btn-rf-express');
        function setRouteMode(mode) {
            currentRouteMode = mode;
            renderP10Display();
            drawVerticalLed(0);
            if (mode === 'EXPRESS') {
                if (btnRfExpress) btnRfExpress.className = "bg-amber-500 hover:bg-amber-600 text-white font-black p-1.5 rounded-lg text-[9.5px] transition ring-2 ring-amber-400 shadow-sm";
                if (btnRfCompleta) btnRfCompleta.className = "bg-slate-100 hover:bg-slate-200 text-slate-800 font-black p-1.5 rounded-lg text-[9.5px] transition border border-slate-200 opacity-75";
                pushSignal(false, true, false);
            } else {
                if (btnRfCompleta) btnRfCompleta.className = "bg-blue-600 hover:bg-blue-700 text-white font-black p-1.5 rounded-lg text-[9.5px] transition ring-2 ring-blue-400 shadow-sm";
                if (btnRfExpress) btnRfExpress.className = "bg-slate-100 hover:bg-slate-200 text-slate-800 font-black p-1.5 rounded-lg text-[9.5px] transition border border-slate-200 opacity-75";
                pushSignal(true, false, false);
            }
        }
        if (btnRfCompleta) btnRfCompleta.addEventListener('click', () => setRouteMode('COMPLETA'));
        if (btnRfExpress) btnRfExpress.addEventListener('click', () => setRouteMode('EXPRESS'));

        function startTimer() {
            if (timerInterval) clearInterval(timerInterval); isTimerExceeded = false; timerSeconds = 300; updateApp();
            timerInterval = setInterval(() => { 
                if(isDoorOpen && !isBusDeparting) { 
                    timerSeconds--; 
                    if (timerSeconds <= 0) { timerSeconds = 0; isTimerExceeded = true; clearInterval(timerInterval); }
                    if (uiTimer) uiTimer.innerText = formatTime(timerSeconds);
                    if (dockTimerBar) dockTimerBar.style.width = `${(timerSeconds / 300) * 100}%`;
                    updateApp(); 
                } 
            }, 1000); 
        }

        const btnTimerFast = document.getElementById('btn-timer-fast');
        if (btnTimerFast) {
            btnTimerFast.addEventListener('click', () => { 
                timerSeconds = 5; 
                if (uiTimer) uiTimer.innerText = formatTime(timerSeconds); 
                isTimerExceeded = true; 
                updateApp(); 
            });
        }

        const btnBulkIn = document.getElementById('btn-bulk-in');
        if (btnBulkIn) {
            btnBulkIn.addEventListener('click', () => {
                if (!isDoorOpen || isBusDeparting) return;
                const toAdd = Math.min(10, CAPACITY - currentPax);
                for (let n = 0; n < toAdd; n++) {
                    const spot = findFreeSpot();
                    if (!spot) break;
                    const mesh = buildStudentGroup();
                    mesh.position.set(spot.x, spot.y, spot.z);
                    scene.add(mesh);
                    seatedPassengers.push({ mesh, spot });
                    currentPax++;
                }
                queueCount = Math.max(1, queueCount - 1);
                updateApp();
            });
        }

        const btnToggleTelemetry = document.getElementById('btn-toggle-telemetry');
        if (btnToggleTelemetry) {
            btnToggleTelemetry.addEventListener('click', () => {
                const dock = document.getElementById('telemetry-dock');
                if (dock) dock.classList.toggle('hidden');
            });
        }

        // ==========================================
        // 9. CINEMÁTICA Y FLUJO DE PASAJEROS
        // ==========================================
        let activePassengers = [];

        // ==========================================
        // FIX DE RENDIMIENTO: scene.remove() saca el objeto de la escena pero NO
        // libera la geometria ni el material de la memoria de la GPU. Sin esto,
        // cada ciclo de "llenar el bus -> despachar -> volver" dejaba basura
        // acumulada y el simulador se iba poniendo lento con el uso.
        // Usar SIEMPRE removeMesh() en vez de scene.remove() para pasajeros.
        // ==========================================
        function removeMesh(mesh) {
            if (!mesh) return;
            mesh.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                    else child.material.dispose();
                }
            });
            scene.remove(mesh);
        }

        function buildStudentGroup() {
            const pGroup = new THREE.Group();
            const bodyColor = new THREE.Color().setHSL(Math.random(), 0.6, 0.6);
            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.85, 8), new THREE.MeshStandardMaterial({ color: bodyColor }));
            body.position.y = 0.42; body.castShadow = true; pGroup.add(body);
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffdbac }));
            head.position.y = 0.9; head.castShadow = true; pGroup.add(head);
            const pack = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 0.18), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
            pack.position.set(0, 0.46, -0.22); pGroup.add(pack);
            return pGroup;
        }

        function spawnStudent(dir) {
            if (!isDoorOpen || isBusDeparting) return;
            if (dir === 'in' && currentPax >= CAPACITY) return;
            if (dir === 'out' && currentPax <= 0) return;

            let pGroup, path;

            if (dir === 'out') {
                const occupant = seatedPassengers.pop();
                if (occupant) {
                    occupant.spot.occupied = false;
                    pGroup = occupant.mesh;
                    path = [
                        pGroup.position.clone(),
                        new THREE.Vector3(-3, -0.49, 0.15),
                        new THREE.Vector3(-3, -0.49, 0.65),
                        new THREE.Vector3(-3, -0.77, 1.0),
                        new THREE.Vector3(-3, -1.05, 1.35),
                        new THREE.Vector3(-3, -1.05, 2.8)
                    ];
                } else {
                    pGroup = buildStudentGroup();
                    scene.add(pGroup);
                    pGroup.position.set(-1.0, -0.49, 0.15);
                    path = [
                        new THREE.Vector3(-1.0, -0.49, 0.15),
                        new THREE.Vector3(-3, -0.49, 0.15),
                        new THREE.Vector3(-3, -0.49, 0.65),
                        new THREE.Vector3(-3, -0.77, 1.0),
                        new THREE.Vector3(-3, -1.05, 1.35),
                        new THREE.Vector3(-3, -1.05, 2.8)
                    ];
                }
            } else {
                pGroup = buildStudentGroup();
                scene.add(pGroup);
                pGroup.position.set(-3, -1.05, 2.8);
                path = [
                    new THREE.Vector3(-3, -1.05, 2.8),
                    new THREE.Vector3(-3, -1.05, 1.35),
                    new THREE.Vector3(-3, -0.77, 1.0),
                    new THREE.Vector3(-3, -0.49, 0.65),
                    new THREE.Vector3(-3, -0.49, 0.15),
                    new THREE.Vector3(-1.0, -0.49, 0.15)
                ];
                queueCount = Math.min(4, queueCount + 1);
            }

            activePassengers.push({
                mesh: pGroup,
                path: path,
                currentWp: 1,
                dir: dir,
                state: 0,
                walkCycle: Math.random() * Math.PI
            });
        }

        const btnIn = document.getElementById('btn-in');
        if (btnIn) btnIn.addEventListener('click', () => spawnStudent('in'));
        const btnOut = document.getElementById('btn-out');
        if (btnOut) btnOut.addEventListener('click', () => spawnStudent('out'));

        function updatePassengers() {
            const time = Date.now() * 0.015;
            for (let i = activePassengers.length - 1; i >= 0; i--) {
                const p = activePassengers[i];
                const target = p.path[p.currentWp];
                p.mesh.rotation.y = Math.atan2(p.mesh.position.x - target.x, p.mesh.position.z - target.z);

                let speed = 0.12;
                if ((p.dir === 'in' && p.currentWp === 4) || (p.dir === 'out' && p.currentWp === 1)) speed = 0.04;

                p.mesh.position.x += (target.x - p.mesh.position.x) * speed;
                p.mesh.position.z += (target.z - p.mesh.position.z) * speed;
                p.mesh.position.y += (target.y - p.mesh.position.y) * 0.15;
                p.mesh.position.y += Math.abs(Math.sin(time + p.walkCycle)) * 0.02;

                const currentZ = p.mesh.position.z;
                const touchS1 = (0.8 > currentZ - 0.28 && 0.8 < currentZ + 0.28);
                const touchS2 = (0.55 > currentZ - 0.28 && 0.55 < currentZ + 0.28);

                if (touchS1) {
                    beam1.material.color.setHex(0x4ade80);
                    if (indS1) indS1.className = "w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] mt-0.5";
                } else {
                    beam1.material.color.setHex(0xef4444);
                    if (indS1) indS1.className = "w-3.5 h-3.5 rounded-full bg-red-500 shadow-sm mt-0.5";
                }

                if (touchS2) {
                    beam2.material.color.setHex(0x3b82f6);
                    if (indS2) indS2.className = "w-3.5 h-3.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] mt-0.5";
                } else {
                    beam2.material.color.setHex(0xef4444);
                    if (indS2) indS2.className = "w-3.5 h-3.5 rounded-full bg-red-500 shadow-sm mt-0.5";
                }

                pushSignal(touchS1, touchS2, touchS1 && touchS2);

                if (p.dir === 'in') {
                    if (p.state === 0 && touchS1 && !touchS2) p.state = 1;
                    if (p.state === 1 && touchS1 && touchS2) p.state = 2;
                    if (p.state === 2 && !touchS1 && touchS2) p.state = 3;
                    if (p.state === 3 && !touchS1 && !touchS2) {
                        p.state = 4;
                        currentPax = Math.min(CAPACITY, currentPax + 1);
                        updateApp();
                        const spot = findFreeSpot();
                        if (spot) { p.path.push(new THREE.Vector3(spot.x, spot.y, spot.z)); p.spot = spot; p.seated = true; }
                    }
                } else if (p.dir === 'out') {
                    if (p.state === 0 && touchS2 && !touchS1) p.state = 1;
                    if (p.state === 1 && touchS2 && touchS1) p.state = 2;
                    if (p.state === 2 && !touchS2 && touchS1) p.state = 3;
                    if (p.state === 3 && !touchS2 && !touchS1) {
                        p.state = 4;
                        currentPax = Math.max(0, currentPax - 1);
                        updateApp();
                    }
                }

                if (Math.hypot(p.mesh.position.x - target.x, p.mesh.position.z - target.z) < 0.12) {
                    p.currentWp++;
                    if (p.currentWp >= p.path.length) {
                        if (p.dir === 'in' && p.seated) {
                            seatedPassengers.push({ mesh: p.mesh, spot: p.spot });
                            activePassengers.splice(i, 1);
                        } else {
                            removeMesh(p.mesh); activePassengers.splice(i, 1);
                        }
                    }
                }
            }
        }

        // ==========================================
        // 10. MODAL DE INSPECCIÓN TÉCNICA
        // ==========================================
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let mouseDownPos = { x: 0, y: 0 };

        const inspectorModal = document.getElementById('inspector-modal');
        const inspectorTitle = document.getElementById('inspector-title');
        const inspectorSubtitle = document.getElementById('inspector-subtitle');
        const inspectorIcon = document.getElementById('inspector-icon');
        const inspectorDesc = document.getElementById('inspector-desc');
        const inspectorDiagramContainer = document.getElementById('inspector-diagram-container');
        const inspectorSpecs = document.getElementById('inspector-specs');
        const inspectorCctvBox = document.getElementById('inspector-cctv-box');

        const INSPECTOR_DB = {
            DOOR_SENSORS_MODULE: {
                title: "Sensores Ópticos M18 & S0 (Puerta)",
                subtitle: "Máquina de Estados de Conteo y Filtro Debounce",
                icon: "🚪",
                desc: "Dos sensores cilíndricos réflex infrarrojos M18 a 90 cm de altura detectan la secuencia de paso para determinar la dirección (+1 entrada o -1 salida). El interruptor magnético industrial Reed Switch S0 montado en la puerta asegura que los haces solo emitan mientras el bus esté detenido con puerta abierta en andén, eliminando lecturas accidentales.",
                diagramSvg: `
                <div class="flex items-center justify-between text-[8.5px] font-bold">
                    <div class="bg-emerald-100 border border-emerald-300 text-emerald-900 p-2 rounded-xl text-center w-28">
                        <span>S0: Puerta</span><br><strong class="text-[9.5px]">HABILITA M18</strong>
                    </div>
                    <span class="text-slate-500 font-black">&rarr;</span>
                    <div class="bg-blue-100 border border-blue-300 text-blue-900 p-2 rounded-xl text-center w-36">
                        <span>S1 &rarr; Ambos &rarr; S2</span><br><strong class="text-[9.5px]">ENTRADA (+1)</strong>
                    </div>
                    <span class="text-slate-500 font-black">&rarr;</span>
                    <div class="bg-slate-200 border border-slate-300 text-slate-900 p-2 rounded-xl text-center w-28">
                        <span>Filtro 600ms</span><br><strong class="text-[9.5px]">ESP32 Wi-Fi</strong>
                    </div>
                </div>`,
                specs: [
                    "• Componente: Sensor Óptico Reflex M18 Anti-Sol (10 uds flota)[cite: 2]",
                    "• Sensor Puerta: Sensor Magnético Automotriz S0 Reed Switch[cite: 2]",
                    "• Filtro: Software Debounce de 600 ms para mochilas y bultos[cite: 2]",
                    "• Transmisión: Paquetes JSON cada 15s al broker de la ESPOL[cite: 2]"
                ],
                camPos: new THREE.Vector3(-2.2, 0.8, 4.2),
                camTarget: new THREE.Vector3(-2.2, 0.4, 0.8)
            },
            DRIVER_DISPLAY: {
                title: "Mini Pantalla LED de Cabina (Chofer)",
                subtitle: "Tablero de Control y Alerta Temprana en Conducción",
                icon: "📟",
                desc: "Mini display industrial integrado en el tablero del conductor conectado directamente al procesador ESP32. Notifica en tiempo real el aforo exacto, el estado libre/llenando/lleno y activa una alerta con zumbador buzzer cuando concluye la ventana de cortesía de 5 minutos en andén.",
                diagramSvg: `
                <div class="flex items-center justify-around text-[8.5px] font-bold">
                    <div class="bg-slate-200 border border-slate-300 p-2 rounded-xl text-center">
                        <span>ESP32 IoT</span><br><strong class="text-blue-800">UART / I2C</strong>
                    </div>
                    <span class="text-slate-500 font-black">&rarr;</span>
                    <div class="bg-emerald-100 border border-emerald-300 p-2 rounded-xl text-center">
                        <span>Mini LED Tablero</span><br><strong class="text-emerald-900">AFORO: 0/55 LIBRE</strong>
                    </div>
                    <span class="text-slate-500 font-black">&rarr;</span>
                    <div class="bg-rose-100 border border-rose-300 p-2 rounded-xl text-center">
                        <span>Alarma Buzzer</span><br><strong class="text-rose-900">Cierre Inminente</strong>
                    </div>
                </div>`,
                specs: [
                    "• Interfaz: Mini pantalla LED automotriz de alta visibilidad",
                    "• Alerta Sonora: Buzzer piezoeléctrico de 85dB al expirar tiempo[cite: 2]",
                    "• Estados: Verde (Libre), Ámbar (Solo pie), Rojo (Cierre puerta)",
                    "• Automatización: El chofer mantiene el control manual de la marcha[cite: 2]"
                ],
                camPos: new THREE.Vector3(-4.8, 0.6, 1.2),
                camTarget: new THREE.Vector3(-4.8, 0.2, -0.5)
            },
            BICIPOL_STATION: {
                title: "Estación de Anclaje BiciPOL",
                subtitle: "Bahías con Sensor Inductivo y Lector Tag RFID",
                icon: "🚲",
                desc: "Bahías metálicas equipadas con sensor inductivo de presencia y lector RFID que identifican la bicicleta acoplada. Al autenticarse el estudiante con su carnet o código QR en 'Mi ESPOL', el electroimán libera el vástago. La disponibilidad de bahías y bicis se sincroniza en vivo para la terminal y garita.",
                diagramSvg: `
                <div class="flex items-center justify-between text-[8.5px] font-bold">
                    <div class="bg-blue-100 border border-blue-300 text-blue-900 p-2 rounded-xl text-center">
                        <span>Bicicleta en Bahía</span><br><strong class="text-[9.5px]">Tag RFID Embebido</strong>
                    </div>
                    <span class="text-slate-500 font-black">&rarr;</span>
                    <div class="bg-purple-100 border border-purple-300 text-purple-900 p-2 rounded-xl text-center">
                        <span>Lector Inductivo</span><br><strong class="text-[9.5px]">Electroimán 12V</strong>
                    </div>
                    <span class="text-slate-500 font-black">&rarr;</span>
                    <div class="bg-emerald-100 border border-emerald-300 text-emerald-900 p-2 rounded-xl text-center">
                        <span>App Mi ESPOL</span><br><strong class="text-[9.5px]">8 Libres / 4 Vacías</strong>
                    </div>
                </div>`,
                specs: [
                    "• Detección: Sensor Inductivo + Lector RFID en bahía",
                    "• Bloqueo: Electroimán automotriz 12V DC de retención segura",
                    "• Integración: Multi-estación (Retiro en Garita, devolución en Terminal)",
                    "• Autenticación: Vía Carnet Estudiantil o QR dinámico en smartphone"
                ],
                camPos: new THREE.Vector3(6.2, 0.4, 6.4),
                camTarget: new THREE.Vector3(6.2, -0.3, 4.4)
            },
            CENITAL_CAMERA: {
                title: "CCTV Cenital Inteligente (Poste 6.4m)",
                subtitle: "Visión Artificial con Detección de Fila y Aforo",
                icon: "📷",
                desc: "Cámara de alta resolución montada a 6.4m en ángulo cenital de 45°, ubicada en poste perimetral independiente. Al observar desde arriba, elimina la oclusión visual entre estudiantes en fila. El modelo YOLOv8 cuenta las personas en espera y, si se alcanza el umbral de 15 estudiantes, despacha la unidad de inmediato sin esperar el temporizador.",
                diagramSvg: `
                <div class="flex items-center justify-between text-[8.5px] font-bold">
                    <div class="bg-slate-200 border border-slate-300 p-2 rounded-xl text-center">
                        <span>Cámara 6.4m</span><br><strong class="text-[9.5px]">Vista Cenital 45°</strong>
                    </div>
                    <span class="text-slate-500 font-black">&rarr;</span>
                    <div class="bg-cyan-100 border border-cyan-300 text-cyan-900 p-2 rounded-xl text-center">
                        <span>Inferencia YOLOv8</span><br><strong class="text-[9.5px]">Conteo de Fila</strong>
                    </div>
                    <span class="text-slate-500 font-black">&rarr;</span>
                    <div class="bg-rose-100 border border-rose-300 text-rose-900 p-2 rounded-xl text-center">
                        <span>Umbral &ge; 15 pax</span><br><strong class="text-[9.5px]">DESPACHO INMEDIATO</strong>
                    </div>
                </div>`,
                specs: [
                    "• Mástil: Poste industrial de 6.4m con brazo voladizo de 2.4m",
                    "• Modelo IA: YOLOv8-Crowd Density en Edge Gateway",
                    "• Umbral: Despacho automático al detectar 15 estudiantes",
                    "• Cobertura: Continua e independiente de la presencia de bus"
                ],
                camPos: new THREE.Vector3(-6.2, 3.8, 8.2),
                camTarget: new THREE.Vector3(-4.0, 1.2, 3.5),
                showCctv: true
            },
            P10_DISPLAY: {
                title: "Letrero Frontal Digital LED P10 (64x16 cm)",
                subtitle: "Señalética Exterior Automotriz Huidu HD-W60",
                icon: "💡",
                desc: "Panel LED monocromático ámbar de alta luminosidad con certificación IP65 montado en la visera del bus[cite: 1]. Se comanda mediante la tarjeta Huidu HD-W60 conectada a un receptor de RF (433 MHz)[cite: 1]. Permite al chofer conmutar al instante entre 'RUTA EXPRESS' y 'RUTA COMPLETA' según la demanda y votos de la app[cite: 1].",
                diagramSvg: `
                <div class="flex items-center justify-between text-[8.5px] font-bold">
                    <div class="bg-slate-200 border border-slate-300 p-2 rounded-xl text-center">
                        <span>Batería 24V DC</span><br><strong class="text-[9.5px]">Fusible 5A</strong>[cite: 1]
                    </div>
                    <span class="text-slate-500 font-black">&rarr;</span>
                    <div class="bg-amber-100 border border-amber-300 text-amber-900 p-2 rounded-xl text-center">
                        <span>Control RF 433MHz</span>[cite: 1]<br><strong class="text-[9.5px]">Huidu HD-W60</strong>[cite: 1]
                    </div>
                    <span class="text-slate-500 font-black">&rarr;</span>
                    <div class="bg-blue-100 border border-blue-300 text-blue-900 p-2 rounded-xl text-center">
                        <span>2x P10 Ámbar</span>[cite: 1]<br><strong class="text-[9.5px]">64x16 cm IP65</strong>[cite: 1]
                    </div>
                </div>`,
                specs: [
                    "• Módulos: 2 Paneles P10 monocromáticos ámbar (64x16 cm)[cite: 1]",
                    "• Controladora: Huidu HD-W60 con entradas físicas S1/S2[cite: 1]",
                    "• Alimentación: Regulador estabilizador DC-DC (24V a 5V/12V)[cite: 1]",
                    "• Mini Pantalla Chofer: Duplica en tablero el texto de ruta y aforo"
                ],
                camPos: new THREE.Vector3(-8.8, 2.6, 2.5),
                camTarget: new THREE.Vector3(-6.15, 2.35, 0)
            },
            STATION_LED_KIOSK: {
                title: "Tótem LED de Información al Pasajero",
                subtitle: "Pantalla Pública para Estudiantes sin Smartphone",
                icon: "🖥️",
                desc: "Tótem vertical interactivo en el andén de Garita. Cicla cada 4 segundos entre el aforo en tiempo real de la próxima unidad, el mapa de ubicación de buses del circuito y la disponibilidad de bicicletas BiciPOL, permitiendo a estudiantes sin smartphone informarse antes de abordar.",
                diagramSvg: `
                <div class="flex items-center justify-between text-[8.5px] font-bold">
                    <div class="bg-slate-200 border border-slate-300 p-2 rounded-xl text-center">
                        <span>ESP32 Flota</span>[cite: 2]<br><strong class="text-[9.5px]">Wi-Fi Campus</strong>[cite: 2]
                    </div>
                    <span class="text-slate-500 font-black">&rarr;</span>
                    <div class="bg-blue-100 border border-blue-300 text-blue-900 p-2 rounded-xl text-center">
                        <span>Broker MQTT</span><br><strong class="text-[9.5px]">Servidor MoveSpol</strong>
                    </div>
                    <span class="text-slate-500 font-black">&rarr;</span>
                    <div class="bg-emerald-100 border border-emerald-300 text-emerald-900 p-2 rounded-xl text-center">
                        <span>Tótem Garita</span><br><strong class="text-[9.5px]">Aforo / Buses / Bici</strong>
                    </div>
                </div>`,
                specs: [
                    "• Chasis: Acero y policarbonato templado para intemperie[cite: 1]",
                    "• Ciclo de Datos: Sincronizado en tiempo real cada 4 segundos",
                    "• Información: Aforo U1/U2, Tiempo de Salida y Bicis BiciPOL",
                    "• Comunicación: Conexión cableada Ethernet / Wi-Fi ESPOL"
                ],
                camPos: new THREE.Vector3(1.5, 0.6, 6.8),
                camTarget: new THREE.Vector3(1.5, 0.1, 4.5)
            }
        };

        function inspectComponent(key) {
            const data = INSPECTOR_DB[key];
            if (!data) return;

            if (inspectorTitle) inspectorTitle.innerText = data.title;
            if (inspectorSubtitle) inspectorSubtitle.innerText = data.subtitle;
            if (inspectorIcon) inspectorIcon.innerText = data.icon;
            if (inspectorDesc) inspectorDesc.innerText = data.desc;
            if (inspectorDiagramContainer) inspectorDiagramContainer.innerHTML = data.diagramSvg || '';
            if (inspectorSpecs) inspectorSpecs.innerHTML = data.specs.map(s => `<div>${s}</div>`).join('');

            if (inspectorCctvBox) {
                if (data.showCctv) inspectorCctvBox.classList.remove('hidden');
                else inspectorCctvBox.classList.add('hidden');
            }

            if (inspectorModal) {
                inspectorModal.classList.remove('opacity-0', 'pointer-events-none', '-translate-x-6');
                inspectorModal.classList.add('opacity-100', 'translate-x-0');
            }

            camera.position.copy(data.camPos);
            controls.target.copy(data.camTarget);
        }

        container.addEventListener('mousedown', (e) => {
            mouseDownPos = { x: e.clientX, y: e.clientY };
        });

        container.addEventListener('mouseup', (e) => {
            const dist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);
            if (dist > 6) return;

            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(clickableObjects, true);

            if (intersects.length > 0) {
                let obj = intersects[0].object;
                while (obj && !INSPECTOR_DB[obj.name] && obj.parent) {
                    obj = obj.parent;
                }
                if (obj && INSPECTOR_DB[obj.name]) {
                    inspectComponent(obj.name);
                }
            }
        });

        const cardM18 = document.getElementById('card-telemetry-m18');
        if (cardM18) cardM18.addEventListener('click', () => inspectComponent('DOOR_SENSORS_MODULE'));
        const cardBici = document.getElementById('card-telemetry-bicipol');
        if (cardBici) cardBici.addEventListener('click', () => inspectComponent('BICIPOL_STATION'));
        const cardP10 = document.getElementById('card-telemetry-p10');
        if (cardP10) cardP10.addEventListener('click', () => inspectComponent('P10_DISPLAY'));
        const cardBus = document.getElementById('card-telemetry-bus');
        if (cardBus) cardBus.addEventListener('click', () => inspectComponent('DRIVER_DISPLAY'));

        const btnInspectorClose = document.getElementById('btn-inspector-close');
        if (btnInspectorClose) {
            btnInspectorClose.addEventListener('click', () => {
                if (inspectorModal) {
                    inspectorModal.classList.add('opacity-0', 'pointer-events-none', '-translate-x-6');
                    inspectorModal.classList.remove('opacity-100', 'translate-x-0');
                }
            });
        }

        const btnInspectorResetCam = document.getElementById('btn-inspector-reset-cam');
        if (btnInspectorResetCam) {
            btnInspectorResetCam.addEventListener('click', () => {
                camera.position.copy(defaultCamPos);
                controls.target.copy(defaultCamTarget);
                if (inspectorModal) {
                    inspectorModal.classList.add('opacity-0', 'pointer-events-none', '-translate-x-6');
                    inspectorModal.classList.remove('opacity-100', 'translate-x-0');
                }
            });
        }

        // Selector Garita / Terminal
        const btnSceneGarita = document.getElementById('btn-scene-garita');
        const btnSceneTerminal = document.getElementById('btn-scene-terminal');

        if (btnSceneGarita) {
            btnSceneGarita.addEventListener('click', () => {
                sceneGaritaGroup.visible = true;
                sceneTerminalGroup.visible = false;
                btnSceneGarita.className = "bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[11px] font-black transition shadow-sm";
                if (btnSceneTerminal) btnSceneTerminal.className = "bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-[11px] font-black transition";
                camera.position.copy(defaultCamPos);
                controls.target.copy(defaultCamTarget);
            });
        }

        if (btnSceneTerminal) {
            btnSceneTerminal.addEventListener('click', () => {
                sceneGaritaGroup.visible = false;
                sceneTerminalGroup.visible = true;
                btnSceneTerminal.className = "bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[11px] font-black transition shadow-sm";
                if (btnSceneGarita) btnSceneGarita.className = "bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-[11px] font-black transition";
                camera.position.set(-8.0, 4.0, 11.0);
                controls.target.set(0, 0.5, 2.0);
            });
        }

        // Votación de Rutas
        let votesExpress = 28;
        let votesCompleta = 12;
        const btnVoteExpress = document.getElementById('btn-vote-express');
        const btnVoteCompleta = document.getElementById('btn-vote-completa');
        const voteExpressCount = document.getElementById('vote-express-count');
        const voteCompletaCount = document.getElementById('vote-completa-count');

        if (btnVoteExpress) {
            btnVoteExpress.addEventListener('click', () => {
                votesExpress++;
                if (voteExpressCount) voteExpressCount.innerText = `${votesExpress} votos`;
                btnVoteExpress.className = "bg-amber-500 text-white p-1.5 rounded-xl text-left border-2 border-amber-400 shadow-md ring-2 ring-amber-300 transition";
                if (btnVoteCompleta) btnVoteCompleta.className = "bg-white text-slate-700 p-1.5 rounded-xl text-left border border-slate-300 shadow-sm transition opacity-80";
                setRouteMode('EXPRESS');
            });
        }

        if (btnVoteCompleta) {
            btnVoteCompleta.addEventListener('click', () => {
                votesCompleta++;
                if (voteCompletaCount) voteCompletaCount.innerText = `${votesCompleta} votos`;
                btnVoteCompleta.className = "bg-blue-600 text-white p-1.5 rounded-xl text-left border-2 border-blue-400 shadow-md ring-2 ring-blue-300 transition";
                if (btnVoteExpress) btnVoteExpress.className = "bg-white text-slate-700 p-1.5 rounded-xl text-left border border-slate-300 shadow-sm transition opacity-80";
                setRouteMode('COMPLETA');
            });
        }

        // BiciPOL: Préstamo y Devolución Interactiva
        const btnRequestBike = document.getElementById('btn-request-bike');
        const bicipolActiveTrip = document.getElementById('bicipol-active-trip');
        const btnReturnBikeSim = document.getElementById('btn-return-bike-sim');
        const bicipolGaritaCount = document.getElementById('bicipol-garita-count');
        const bicipolGaritaEmpty = document.getElementById('bicipol-garita-empty');
        const telemetryBiciAvail = document.getElementById('telemetry-bici-avail');
        const telemetryBiciEmpty = document.getElementById('telemetry-bici-empty');

        let bicipolGaritaBikes = 8;
        let bicipolGaritaSlots = 4;

        if (btnRequestBike) {
            btnRequestBike.addEventListener('click', () => {
                if (bicipolGaritaBikes > 0) {
                    bicipolGaritaBikes--;
                    bicipolGaritaSlots++;
                    if (bicipolGaritaCount) bicipolGaritaCount.innerText = bicipolGaritaBikes;
                    if (bicipolGaritaEmpty) bicipolGaritaEmpty.innerText = bicipolGaritaSlots;
                    if (telemetryBiciAvail) telemetryBiciAvail.innerText = bicipolGaritaBikes;
                    if (telemetryBiciEmpty) telemetryBiciEmpty.innerText = bicipolGaritaSlots;
                    if (bicipolActiveTrip) bicipolActiveTrip.classList.remove('hidden');
                    btnRequestBike.classList.add('opacity-50', 'pointer-events-none');
                }
            });
        }

        if (btnReturnBikeSim) {
            btnReturnBikeSim.addEventListener('click', () => {
                if (bicipolActiveTrip) bicipolActiveTrip.classList.add('hidden');
                if (btnRequestBike) btnRequestBike.classList.remove('opacity-50', 'pointer-events-none');
                alert("Bicicleta anclada con éxito en la Terminal. El sensor inductivo y tag RFID confirmaron el retorno seguro.");
            });
        }

        // Tabs Navegación Smartphone
        const navBtnBuses = document.getElementById('nav-btn-buses');
        const navBtnBicipol = document.getElementById('nav-btn-bicipol');
        const appViewBuses = document.getElementById('app-view-buses');
        const appViewBicipol = document.getElementById('app-view-bicipol');

        if (navBtnBuses) {
            navBtnBuses.addEventListener('click', () => {
                if (appViewBuses) appViewBuses.classList.remove('hidden');
                if (appViewBicipol) appViewBicipol.classList.add('hidden');
                navBtnBuses.className = 'flex flex-col items-center text-blue-600 font-bold transition';
                if (navBtnBicipol) navBtnBicipol.className = 'flex flex-col items-center text-slate-400 font-bold hover:text-slate-600 transition';
            });
        }

        if (navBtnBicipol) {
            navBtnBicipol.addEventListener('click', () => {
                if (appViewBuses) appViewBuses.classList.add('hidden');
                if (appViewBicipol) appViewBicipol.classList.remove('hidden');
                navBtnBicipol.className = 'flex flex-col items-center text-blue-600 font-bold transition';
                if (navBtnBuses) navBtnBuses.className = 'flex flex-col items-center text-slate-400 font-bold hover:text-slate-600 transition';
            });
        }

        // ==========================================
        // 11. BUCLE DE RENDERIZADO
        // ==========================================
        function animate() { 
            requestAnimationFrame(animate); 
            updatePassengers(); 
            
            const time = Date.now() * 0.003;
            pulsingTargets.forEach(target => {
                const s = 1.0 + Math.sin(time * 2) * 0.2;
                target.scale.set(s, s, 1);
            });

            controls.update(); 
            renderer.render(scene, camera); 
        }

        function onWindowResize() {
            const width = container.clientWidth || (window.innerWidth - 470);
            const height = container.clientHeight || window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        }

        window.addEventListener('resize', onWindowResize);
        setTimeout(onWindowResize, 100);

        startTimer();
        updateApp();
        animate();
        drawVerticalLed(0);
        // ==========================================================
        // 10. MOTOR DE ESCENARIOS (auto-reproducción para presentación)
        //
        // COMO AGREGAR UN ESCENARIO NUEVO: solo añade un objeto a la lista
        // SCENARIOS de abajo. No hay que tocar nada más: los botones, el
        // avance de pasos y el subtitulo se generan solos desde esta lista.
        //
        //   { id, nombre, pasos: [ { t: msDesdeElInicio, texto, accion } ] }
        //
        // "accion" es cualquier función: puedes reutilizar las que ya existen
        // (spawnStudent, toggleDoorState, etc.) o escribir una nueva.
        // ==========================================================
        const SCENARIOS = [
            {
                id: 'uno',
                nombre: '1 · Un estudiante sube',
                pasos: [
                    { t: 0,    texto: 'Bus en Garita con la puerta abierta, esperando pasajeros.' },
                    { t: 1200, texto: 'Un estudiante se acerca a la puerta.', accion: () => spawnStudent('in') },
                    { t: 4000, texto: 'Los sensores S1 y S2 detectan la secuencia de entrada y suman +1 al aforo.' },
                    { t: 7000, texto: 'El aforo actualizado ya viaja al backend y aparece en la app del estudiante.' }
                ]
            },
            {
                id: 'cinco',
                nombre: '2 · Llegan 5 estudiantes',
                pasos: [
                    { t: 0,    texto: 'Un grupo de estudiantes llega a la parada.' },
                    { t: 600,  accion: () => spawnStudent('in') },
                    { t: 1400, accion: () => spawnStudent('in') },
                    { t: 2200, texto: 'Cada uno cruza el par de sensores por separado.', accion: () => spawnStudent('in') },
                    { t: 3000, accion: () => spawnStudent('in') },
                    { t: 3800, accion: () => spawnStudent('in') },
                    { t: 7000, texto: 'El conteo neto sube de uno en uno: el filtro de 600 ms evita contar mochilas como personas.' }
                ]
            },
            {
                id: 'lleno',
                nombre: '3 · El bus se llena',
                pasos: [
                    { t: 0,    texto: 'Hora pico: la fila en Garita crece rápido.' },
                    { t: 500,  accion: () => { const b = document.getElementById('btn-bulk-in'); if (b) b.click(); } },
                    { t: 1600, accion: () => { const b = document.getElementById('btn-bulk-in'); if (b) b.click(); } },
                    { t: 2700, texto: 'El aforo se acerca al máximo de 55 (50 sentados + 5 de pie).', accion: () => { const b = document.getElementById('btn-bulk-in'); if (b) b.click(); } },
                    { t: 3800, accion: () => { const b = document.getElementById('btn-bulk-in'); if (b) b.click(); } },
                    { t: 4900, accion: () => { const b = document.getElementById('btn-bulk-in'); if (b) b.click(); } },
                    { t: 6000, accion: () => { const b = document.getElementById('btn-bulk-in'); if (b) b.click(); } },
                    { t: 7500, texto: 'Aforo completo: la pantalla del chofer se pone en rojo y el bus se despacha automáticamente.' }
                ]
            }
        ];

        const scenarioState = { timers: [], activo: null };

        function detenerEscenario() {
            scenarioState.timers.forEach(id => clearTimeout(id));
            scenarioState.timers = [];
            scenarioState.activo = null;
        }

        function mostrarSubtitulo(texto) {
            const el = document.getElementById('scenario-subtitle');
            if (!el) return;
            if (!texto) { el.classList.add('opacity-0'); return; }
            el.innerText = texto;
            el.classList.remove('opacity-0');
        }

        function reproducirEscenario(id) {
            detenerEscenario();
            const esc = SCENARIOS.find(s => s.id === id);
            if (!esc) return;
            scenarioState.activo = id;

            document.querySelectorAll('[data-scenario]').forEach(btn => {
                const on = btn.dataset.scenario === id;
                btn.classList.toggle('bg-blue-600', on);
                btn.classList.toggle('text-white', on);
                btn.classList.toggle('bg-white', !on);
                btn.classList.toggle('text-slate-700', !on);
            });

            esc.pasos.forEach(paso => {
                const timer = setTimeout(() => {
                    if (paso.texto) mostrarSubtitulo(paso.texto);
                    if (paso.accion) paso.accion();
                }, paso.t);
                scenarioState.timers.push(timer);
            });
        }

        // Construye los botones desde la lista SCENARIOS (no hay que tocar HTML
        // al agregar escenarios nuevos: aparecen solos aquí).
        const scenarioBar = document.getElementById('scenario-buttons');
        if (scenarioBar) {
            SCENARIOS.forEach(esc => {
                const btn = document.createElement('button');
                btn.dataset.scenario = esc.id;
                btn.innerText = esc.nombre;
                btn.className = 'bg-white text-slate-700 border border-slate-300 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-100 transition';
                btn.addEventListener('click', () => reproducirEscenario(esc.id));
                scenarioBar.appendChild(btn);
            });
        }

        // Arranca solo con el primer escenario, sin que el usuario toque nada.
        setTimeout(() => reproducirEscenario(SCENARIOS[0].id), 1500);

        // Muestra/oculta los controles manuales (ocultos por defecto para que la
        // presentacion se vea limpia: solo mockup + escenarios).
        const btnToggleAdvanced = document.getElementById('btn-toggle-advanced');
        if (btnToggleAdvanced) {
            btnToggleAdvanced.addEventListener('click', () => {
                const panel = document.getElementById('advanced-controls');
                if (panel) panel.classList.toggle('hidden');
            });
        }

        // El dock de telemetria tambien arranca oculto para despejar la escena.
        const dockAtStart = document.getElementById('telemetry-dock');
        if (dockAtStart) dockAtStart.classList.add('hidden');

        // ==========================================================
        // 11. AMBIENTACIÓN REAL + ESCENARIOS AVANZADOS
        //     (fila en la acera, visitante con QR, aglomeración,
        //      reserva de bicicletas y recorrido Ruta Express)
        // ==========================================================

        // ---------- 11.1 Ambientación tipo foto real ----------
        // Fila de estudiantes esperando sentados/parados en el bordillo,
        // árboles y muro perimetral, como en la parada real de ESPOL.
        const ambienteGroup = new THREE.Group();
        ambienteGroup.name = 'AMBIENTE_REAL';

        function crearArbol(x, z, escala = 1) {
            const arbol = new THREE.Group();
            const tronco = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12 * escala, 0.16 * escala, 1.6 * escala, 8),
                new THREE.MeshStandardMaterial({ color: 0x6b4423 })
            );
            tronco.position.y = 0.8 * escala; arbol.add(tronco);
            const copaMat = new THREE.MeshStandardMaterial({ color: 0x2f6b32 });
            [[0, 1.9, 0, 0.85], [0.35, 1.6, 0.2, 0.6], [-0.3, 1.7, -0.2, 0.55]].forEach(([cx, cy, cz, r]) => {
                const copa = new THREE.Mesh(new THREE.IcosahedronGeometry(r * escala, 0), copaMat);
                copa.position.set(cx * escala, cy * escala, cz * escala);
                copa.castShadow = true; arbol.add(copa);
            });
            arbol.position.set(x, -1.5, z);
            return arbol;
        }

        [[-14, 9, 1.1], [-9, 11, 0.9], [-3, 12, 1.2], [4, 11, 0.85], [10, 10, 1.0]].forEach(([x, z, s]) => {
            ambienteGroup.add(crearArbol(x, z, s));
        });

        // Muro perimetral de bloque (fondo, como en la foto)
        const muro = new THREE.Mesh(
            new THREE.BoxGeometry(46, 1.5, 0.3),
            new THREE.MeshStandardMaterial({ color: 0xb8b0a4 })
        );
        muro.position.set(0, -0.75, 15.5); muro.receiveShadow = true; ambienteGroup.add(muro);

        // Bordillo/acera donde espera la fila
        const bordillo = new THREE.Mesh(
            new THREE.BoxGeometry(16, 0.45, 1.1),
            new THREE.MeshStandardMaterial({ color: 0xd6d3cd })
        );
        bordillo.position.set(-1, -1.28, 5.6); bordillo.receiveShadow = true; ambienteGroup.add(bordillo);

        // Fila de estudiantes esperando (sentados en el bordillo y de pie)
        const filaEspera = [];
        function crearEstudianteEspera(x, z, sentado) {
            const g = new THREE.Group();
            const color = new THREE.Color().setHSL(Math.random(), 0.45, 0.45);
            const altura = sentado ? 0.5 : 0.85;
            const cuerpo = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.17, altura, 8),
                new THREE.MeshStandardMaterial({ color })
            );
            cuerpo.position.y = altura / 2; cuerpo.castShadow = true; g.add(cuerpo);
            const cabeza = new THREE.Mesh(
                new THREE.SphereGeometry(0.15, 12, 12),
                new THREE.MeshStandardMaterial({ color: 0xffdbac })
            );
            cabeza.position.y = altura + 0.13; g.add(cabeza);
            const mochila = new THREE.Mesh(
                new THREE.BoxGeometry(0.26, 0.32, 0.16),
                new THREE.MeshStandardMaterial({ color: 0x1e293b })
            );
            mochila.position.set(0, altura * 0.6, -0.2); g.add(mochila);
            g.position.set(x, sentado ? -1.05 : -1.5, z);
            g.rotation.y = -Math.PI / 2 + (Math.random() - 0.5) * 0.4;
            return g;
        }

        for (let i = 0; i < 9; i++) {
            const sentado = i < 6;
            const est = crearEstudianteEspera(-6.5 + i * 0.75, sentado ? 5.6 : 6.3, sentado);
            filaEspera.push(est); ambienteGroup.add(est);
        }
        scene.add(ambienteGroup);

        function ajustarFilaEspera(cantidad) {
            filaEspera.forEach((est, i) => { est.visible = i < cantidad; });
        }
        ajustarFilaEspera(4);

        // ---------- 11.2 Segunda estación BiciPOL (Rectorado) ----------
        // Balance entre Garita y Rectorado: mismo número de anclajes en ambas,
        // para que el estudiante pueda tomar en una y dejar en la otra.
        const ESTACIONES_BICI = {
            garita:    { nombre: 'Garita',    anclajes: 5, disponibles: 3 },
            rectorado: { nombre: 'Rectorado', anclajes: 5, disponibles: 2 }
        };

        const bicipolRectorado = bicipolGroup.clone(true);
        bicipolRectorado.name = 'BICIPOL_RECTORADO';
        bicipolRectorado.position.set(-11.5, -1.35, 7.5);
        bicipolRectorado.rotation.y = Math.PI / 6;
        scene.add(bicipolRectorado);

        const letreroBiciCanvas = document.createElement('canvas');
        letreroBiciCanvas.width = 200; letreroBiciCanvas.height = 110;
        const letreroBiciCtx = letreroBiciCanvas.getContext('2d');
        const letreroBiciTex = new THREE.CanvasTexture(letreroBiciCanvas);
        const letreroBici = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 0.82),
            new THREE.MeshStandardMaterial({ map: letreroBiciTex })
        );
        letreroBici.position.set(-11.5, 0.3, 7.5); letreroBici.rotation.y = Math.PI / 6; scene.add(letreroBici);

        function dibujarLetreroBici() {
            const g = ESTACIONES_BICI.garita, r = ESTACIONES_BICI.rectorado;
            letreroBiciCtx.fillStyle = '#064e3b'; letreroBiciCtx.fillRect(0, 0, 200, 110);
            letreroBiciCtx.fillStyle = '#fff'; letreroBiciCtx.textAlign = 'center';
            letreroBiciCtx.font = 'bold 12px sans-serif';
            letreroBiciCtx.fillText('BiciPOL · Balance de estaciones', 100, 20);
            letreroBiciCtx.font = 'bold 22px monospace';
            letreroBiciCtx.fillStyle = '#4ade80';
            letreroBiciCtx.fillText(`${g.disponibles}/${g.anclajes}`, 55, 58);
            letreroBiciCtx.fillText(`${r.disponibles}/${r.anclajes}`, 145, 58);
            letreroBiciCtx.font = '10px sans-serif'; letreroBiciCtx.fillStyle = '#d1fae5';
            letreroBiciCtx.fillText('Garita', 55, 76);
            letreroBiciCtx.fillText('Rectorado', 145, 76);
            letreroBiciCtx.font = 'bold 10px sans-serif'; letreroBiciCtx.fillStyle = '#fbbf24';
            letreroBiciCtx.fillText('Toca una bici en la app para reservar', 100, 98);
            letreroBiciTex.needsUpdate = true;
        }
        dibujarLetreroBici();

        // Reserva: el estudiante toma una bici en Garita y la deja en Rectorado
        function reservarBicicleta() {
            const g = ESTACIONES_BICI.garita, r = ESTACIONES_BICI.rectorado;
            if (g.disponibles <= 0) return;
            g.disponibles--; dibujarLetreroBici();
            setTimeout(() => {
                if (r.disponibles < r.anclajes) r.disponibles++;
                dibujarLetreroBici();
            }, 4000);
        }

        // ---------- 11.3 Pantalla LED: modo QR para visitantes externos ----------
        let modoQRActivo = false;

        function dibujarQREnLed() {
            vertLedCtx.fillStyle = '#0f172a'; vertLedCtx.fillRect(0, 0, 160, 240);
            vertLedCtx.fillStyle = '#f59e0b'; vertLedCtx.fillRect(0, 0, 160, 34);
            vertLedCtx.fillStyle = '#0f172a'; vertLedCtx.font = 'bold 11px sans-serif'; vertLedCtx.textAlign = 'center';
            vertLedCtx.fillText('VISITANTE DETECTADO', 80, 22);

            // QR simulado (patrón determinista, no es un QR real escaneable)
            const size = 96, ox = 32, oy = 52, cells = 12, cell = size / cells;
            vertLedCtx.fillStyle = '#ffffff'; vertLedCtx.fillRect(ox - 4, oy - 4, size + 8, size + 8);
            vertLedCtx.fillStyle = '#0f172a';
            for (let i = 0; i < cells; i++) {
                for (let j = 0; j < cells; j++) {
                    const esquina = (i < 3 && j < 3) || (i < 3 && j > cells - 4) || (i > cells - 4 && j < 3);
                    if (esquina ? (i % 2 === 0 || j % 2 === 0) : ((i * 7 + j * 13) % 3 === 0)) {
                        vertLedCtx.fillRect(ox + j * cell, oy + i * cell, cell - 1, cell - 1);
                    }
                }
            }
            vertLedCtx.fillStyle = '#fbbf24'; vertLedCtx.font = 'bold 10px sans-serif';
            vertLedCtx.fillText('Escanea para registrarte', 80, 170);
            vertLedCtx.fillStyle = '#cbd5e1'; vertLedCtx.font = '9px sans-serif';
            vertLedCtx.fillText('No perteneces a la comunidad', 80, 188);
            vertLedCtx.fillText('politécnica: registro rápido', 80, 202);
            vertLedTexture.needsUpdate = true;
        }

        // Cartel flotante que señala la pantalla cuando llega un visitante
        const avisoVisitanteCanvas = document.createElement('canvas');
        avisoVisitanteCanvas.width = 220; avisoVisitanteCanvas.height = 60;
        const avisoVisitanteCtx = avisoVisitanteCanvas.getContext('2d');
        const avisoVisitanteTex = new THREE.CanvasTexture(avisoVisitanteCanvas);
        const avisoVisitante = new THREE.Sprite(new THREE.SpriteMaterial({ map: avisoVisitanteTex, transparent: true }));
        avisoVisitante.scale.set(2.6, 0.7, 1);
        avisoVisitante.visible = false;
        scene.add(avisoVisitante);

        avisoVisitanteCtx.fillStyle = '#f59e0b'; avisoVisitanteCtx.fillRect(0, 0, 220, 60);
        avisoVisitanteCtx.fillStyle = '#0f172a'; avisoVisitanteCtx.textAlign = 'center';
        avisoVisitanteCtx.font = 'bold 15px sans-serif';
        avisoVisitanteCtx.fillText('⚠ Visitante externo', 110, 26);
        avisoVisitanteCtx.font = 'bold 12px sans-serif';
        avisoVisitanteCtx.fillText('Mira la pantalla y escanea el QR', 110, 46);
        avisoVisitanteTex.needsUpdate = true;

        function mostrarAvisoVisitante(visible, posicion) {
            avisoVisitante.visible = visible;
            if (posicion) avisoVisitante.position.copy(posicion);
            modoQRActivo = visible;
            if (visible) dibujarQREnLed();
        }

        // ---------- 11.4 Cinemática de cámara (efecto video) ----------
        let camAnim = null;
        function moverCamara(destinoPos, destinoTarget, duracionMs) {
            camAnim = {
                desdePos: camera.position.clone(),
                haciaPos: destinoPos.clone(),
                desdeTgt: controls.target.clone(),
                haciaTgt: destinoTarget.clone(),
                inicio: performance.now(),
                dur: duracionMs
            };
        }
        (function loopCamara() {
            requestAnimationFrame(loopCamara);
            if (!camAnim) return;
            const t = Math.min(1, (performance.now() - camAnim.inicio) / camAnim.dur);
            const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easing suave
            camera.position.lerpVectors(camAnim.desdePos, camAnim.haciaPos, e);
            controls.target.lerpVectors(camAnim.desdeTgt, camAnim.haciaTgt, e);
            if (t >= 1) camAnim = null;
        })();

        // ---------- 11.5 Recorrido Ruta Express con bajadas ----------
        const PARADAS_EXPRESS = [
            { nombre: 'FCNM', bajan: 18 },
            { nombre: 'FIEC', bajan: 15 },
            { nombre: 'Rectorado', bajan: 12 }
        ];
        let recorridoActivo = false;

        function correrRecorridoExpress(onSubtitulo) {
            if (recorridoActivo) return;
            recorridoActivo = true;
            let paso = 0;

            const avanzar = () => {
                if (paso >= PARADAS_EXPRESS.length) {
                    onSubtitulo('Bus vacío: retorna a Garita para iniciar un nuevo ciclo.');
                    // Retorno visual del bus a su posición inicial
                    let volviendo = 0;
                    const retorno = setInterval(() => {
                        volviendo += 0.4;
                        busMasterGroup.position.x += 0.4;
                        if (busMasterGroup.position.x >= 0) {
                            busMasterGroup.position.x = 0;
                            clearInterval(retorno);
                            recorridoActivo = false;
                            isDoorOpen = true;
                            onSubtitulo('El bus queda listo en Garita, con la puerta abierta para el siguiente grupo.');
                        }
                    }, 40);
                    return;
                }

                const parada = PARADAS_EXPRESS[paso];
                onSubtitulo(`El bus avanza hacia ${parada.nombre}...`);

                // Tramo de viaje: el bus se desplaza y la cámara lo sigue
                let recorrido = 0;
                const viaje = setInterval(() => {
                    recorrido += 0.35;
                    busMasterGroup.position.x -= 0.35;
                    if (recorrido >= 9) {
                        clearInterval(viaje);
                        // Llegada: bajan pasajeros de esa parada
                        const bajan = Math.min(parada.bajan, currentPax);
                        onSubtitulo(`Parada ${parada.nombre}: bajan ${bajan} estudiantes. Los sensores restan cada salida.`);
                        let restantes = bajan;
                        const bajada = setInterval(() => {
                            if (restantes <= 0 || currentPax <= 0) {
                                clearInterval(bajada);
                                paso++;
                                setTimeout(avanzar, 1200);
                                return;
                            }
                            const ocupante = seatedPassengers.pop();
                            if (ocupante) {
                                ocupante.spot.occupied = false;
                                removeMesh(ocupante.mesh);
                            }
                            currentPax = Math.max(0, currentPax - 1);
                            restantes--;
                            updateApp();
                        }, 90);
                    }
                }, 30);
            };

            avanzar();
        }

        // ---------- 11.6 Escenarios nuevos (se agregan solos a la barra) ----------
        SCENARIOS.push(
            {
                id: 'visitante',
                nombre: '4 · Visitante externo (QR)',
                pasos: [
                    { t: 0,    texto: 'Una persona ajena a la comunidad politécnica llega a la parada.' },
                    { t: 1200, accion: () => spawnStudent('in') },
                    { t: 3200, texto: 'El sistema no la reconoce como estudiante: se activa el aviso de visitante.',
                               accion: () => mostrarAvisoVisitante(true, new THREE.Vector3(-2.5, 1.8, 3.2)) },
                    { t: 6000, texto: 'La pantalla LED del andén muestra un código QR de registro rápido.' },
                    { t: 9500, texto: 'Al escanearlo, el visitante queda registrado sin necesidad de instalar la app.' },
                    { t: 13000, accion: () => { mostrarAvisoVisitante(false); drawVerticalLed(0); } }
                ]
            },
            {
                id: 'aglomeracion',
                nombre: '5 · Cámara detecta aglomeración',
                pasos: [
                    { t: 0,    texto: 'La cámara cenital de Garita vigila el andén de forma permanente.',
                               accion: () => moverCamara(new THREE.Vector3(-6, 4, 10), new THREE.Vector3(-3, 0, 5), 2500) },
                    { t: 2600, texto: 'La fila empieza a crecer en la parada.', accion: () => { ajustarFilaEspera(6); queueCount = 3; } },
                    { t: 5000, texto: 'La cámara cuenta 9 personas esperando: demanda alta confirmada.',
                               accion: () => { ajustarFilaEspera(9); queueCount = 4; } },
                    { t: 7500, texto: 'El sistema avisa al chofer en su pantalla: cerrar puertas e iniciar recorrido.',
                               accion: () => { isTimerExceeded = true; updateApp(); } },
                    { t: 10500, texto: 'Con este dato se decide también el tipo de ruta: alta demanda, Ruta Completa.' }
                ]
            },
            {
                id: 'bicis',
                nombre: '6 · Reserva de bicicleta',
                pasos: [
                    { t: 0,    texto: 'El estudiante ve en la app que hay bicicletas libres en Garita.',
                               accion: () => moverCamara(new THREE.Vector3(9, 3, 9), new THREE.Vector3(6.2, -0.8, 4.4), 2500) },
                    { t: 3000, texto: 'Reserva una desde la app: el anclaje la libera y el sensor cambia de estado.',
                               accion: () => reservarBicicleta() },
                    { t: 6000, texto: 'Pedalea hasta Rectorado y la deja en un anclaje libre de esa estación.',
                               accion: () => moverCamara(new THREE.Vector3(-8, 4, 12), new THREE.Vector3(-11.5, -0.5, 7.5), 3000) },
                    { t: 9500, texto: 'Ambas estaciones mantienen 5 anclajes: se equilibra la oferta de entrada y salida.' }
                ]
            },
            {
                id: 'express',
                nombre: '7 · Recorrido Ruta Express',
                pasos: [
                    { t: 0,    texto: 'Bus lleno en Garita: arranca la Ruta Express.',
                               accion: () => {
                                   const b = document.getElementById('btn-bulk-in');
                                   for (let i = 0; i < 5; i++) if (b) b.click();
                                   isDoorOpen = false;
                               } },
                    { t: 2500, accion: () => moverCamara(new THREE.Vector3(-4, 6, 18), new THREE.Vector3(-4, 0, 2), 3000) },
                    { t: 4000, accion: () => correrRecorridoExpress(mostrarSubtitulo) }
                ]
            }
        );

        // Re-generar la barra de botones ahora que hay más escenarios
        if (scenarioBar) {
            scenarioBar.innerHTML = '';
            SCENARIOS.forEach(esc => {
                const btn = document.createElement('button');
                btn.dataset.scenario = esc.id;
                btn.innerText = esc.nombre;
                btn.className = 'bg-white text-slate-700 border border-slate-300 text-[10.5px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-slate-100 transition';
                btn.addEventListener('click', () => reproducirEscenario(esc.id));
                scenarioBar.appendChild(btn);
            });
        }
