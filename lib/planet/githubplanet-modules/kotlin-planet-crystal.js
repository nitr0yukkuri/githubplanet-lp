const KOTLIN_LIGHTNING_CYCLE_SECONDS = 6;
const TAU = Math.PI * 2;

export function isKotlinPlanet(data) {
    return data?.mainLanguage?.trim().toLowerCase() === 'kotlin';
}

export function createKotlinPlanetMaterial(THREE, planetTexture) {
    const material = new THREE.MeshStandardMaterial({
        color: '#A97BFF',
        map: planetTexture,
        aoMap: planetTexture,
        aoMapIntensity: 0.82,
        roughness: 0.24,
        metalness: 0.22,
        emissive: '#1b0b36',
        emissiveIntensity: 0.07
    });
    material.userData.kotlinSparkUniforms = {
        kotlinSparkTime: { value: 0 }
    };
    material.customProgramCacheKey = () => 'kotlin-planet-lightning-v1';
    return material;
}

function createKotlinLightningMaterial(THREE, uniforms, layer) {
    const isGlowLayer = layer === 'glow';
    const material = new THREE.ShaderMaterial({
        uniforms: {
            kotlinLightningTime: uniforms.kotlinSparkTime,
            kotlinLightningWidth: {
                value: isGlowLayer ? 0.075 : 0.016
            },
            kotlinLightningStrength: {
                value: isGlowLayer ? 0.9 : 1.45
            },
            kotlinLightningColor: {
                value: new THREE.Color(
                    isGlowLayer ? '#8b4bff' : '#fff5ff'
                )
            }
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
        vertexShader: `
            varying vec3 vKotlinLightningPosition;
            varying vec3 vKotlinLightningNormal;
            varying vec3 vKotlinLightningViewDirection;

            void main() {
                vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
                vKotlinLightningPosition = normalize(position);
                vKotlinLightningNormal = normalize(normalMatrix * normal);
                vKotlinLightningViewDirection = normalize(-viewPosition.xyz);
                gl_Position = projectionMatrix * viewPosition;
            }
        `,
        fragmentShader: `
            uniform float kotlinLightningTime;
            uniform float kotlinLightningWidth;
            uniform float kotlinLightningStrength;
            uniform vec3 kotlinLightningColor;
            varying vec3 vKotlinLightningPosition;
            varying vec3 vKotlinLightningNormal;
            varying vec3 vKotlinLightningViewDirection;

            float kotlinLightningHash(float value) {
                return fract(sin(value * 127.1) * 43758.5453);
            }

            float kotlinLightningAngleDistance(float first, float second) {
                return abs(atan(sin(first - second), cos(first - second)));
            }

            void main() {
                vec3 surface = normalize(vKotlinLightningPosition);
                float facing = clamp(
                    dot(
                        vKotlinLightningNormal,
                        vKotlinLightningViewDirection
                    ),
                    0.0,
                    1.0
                );
                float projectedRadius = length(surface.xy);
                float angle = atan(surface.y, surface.x);
                float phase = kotlinLightningTime * ${TAU.toFixed(8)};
                float coreStrength = 0.0;
                float glowStrength = 0.0;
                float contactStrength = 0.0;

                // Keep the electricity at the silhouette: this is a corona,
                // not a set of lines painted across the planet's face.
                float edgeMask = smoothstep(0.58, 0.08, facing);
                float visibility = smoothstep(0.015, 0.3, facing);

                for (int index = 0; index < 6; index++) {
                    float current = float(index);
                    float seed = kotlinLightningHash(current * 17.31 + 4.2);
                    float anchor = -3.14159265
                        + current * 0.78539816
                        + (seed - 0.5) * 0.22;
                    float span = 0.08 + seed * 0.075;
                    float localAngle = kotlinLightningAngleDistance(
                        angle,
                        anchor
                    );
                    float routeMask = 1.0 - smoothstep(
                        span,
                        span + 0.045,
                        localAngle
                    );
                    float routeProgress = clamp(localAngle / span, 0.0, 1.0);
                    float zigzagA = abs(
                        fract(routeProgress * 5.0 + seed * 0.7) * 2.0 - 1.0
                    ) - 0.5;
                    float zigzagB = abs(
                        fract(routeProgress * 9.0 + seed * 1.1) * 2.0 - 1.0
                    ) - 0.5;
                    float pathRadius = 0.99 + seed * 0.075
                        + zigzagA * 0.045
                        + zigzagB * 0.018;
                    float pathDistance = abs(projectedRadius - pathRadius);
                    float mainCore = 1.0 - smoothstep(
                        kotlinLightningWidth * 0.35,
                        kotlinLightningWidth,
                        pathDistance
                    );
                    float mainGlow = 1.0 - smoothstep(
                        kotlinLightningWidth,
                        kotlinLightningWidth * 3.0,
                        pathDistance
                    );

                    // The whole arc jitters like static; a separate hot spot
                    // travels only a short distance before snapping away.
                    float staticFlicker = 0.68 + 0.32 * sin(
                        phase * (11.0 + seed * 5.0) + current * 3.7
                    );
                    float sparkCenter = fract(
                        kotlinLightningTime * (0.7 + seed * 0.16)
                            + seed * 0.37
                    );
                    float spark = exp(
                        -pow((routeProgress - sparkCenter) / 0.16, 2.0)
                    );
                    float mainStrength = routeMask * staticFlicker
                        * (0.16 + spark * 1.15);

                    float branchStart = 0.38 + seed * 0.22;
                    float branchProgress = clamp(
                        (routeProgress - branchStart) / 0.28,
                        0.0,
                        1.0
                    );
                    float branchWindow = smoothstep(
                        branchStart,
                        branchStart + 0.06,
                        routeProgress
                    ) * (1.0 - smoothstep(
                        branchStart + 0.22,
                        branchStart + 0.3,
                        routeProgress
                    ));
                    float branchSign = seed < 0.5 ? -1.0 : 1.0;
                    float branchRadius = pathRadius
                        + branchSign * branchProgress * 0.12
                        + sin(
                            phase * 0.75 + current * 5.0
                                + routeProgress * 17.0
                        ) * 0.018 * branchProgress;
                    float branchDistance = abs(
                        projectedRadius - branchRadius
                    );
                    float branchCore = 1.0 - smoothstep(
                        kotlinLightningWidth * 0.3,
                        kotlinLightningWidth * 0.82,
                        branchDistance
                    );
                    float branchGlow = 1.0 - smoothstep(
                        kotlinLightningWidth * 0.9,
                        kotlinLightningWidth * 2.5,
                        branchDistance
                    );
                    float branchSpark = exp(
                        -pow((branchProgress - sparkCenter) / 0.18, 2.0)
                    );
                    float branchStrength = routeMask * branchWindow
                        * staticFlicker * (0.12 + branchSpark * 1.1);

                    coreStrength += mainCore * mainStrength;
                    coreStrength += branchCore * branchStrength;
                    glowStrength += mainGlow * mainStrength;
                    glowStrength += branchGlow * branchStrength;
                    contactStrength += routeMask * branchWindow
                        * staticFlicker * 0.3;
                }

                float edgeHalo = pow(1.0 - facing, 3.3) * 0.12;
                float strength = min(
                    (coreStrength * 2.0 + glowStrength * 0.38
                        + contactStrength + edgeHalo)
                        * edgeMask * visibility,
                    1.0
                );
                if (strength < 0.012) discard;
                gl_FragColor = vec4(
                    kotlinLightningColor,
                    strength * kotlinLightningStrength
                );
            }
        `
    });
    material.customProgramCacheKey = () => (
        isGlowLayer
            ? 'kotlin-static-electric-glow-v1'
            : 'kotlin-static-electric-core-v1'
    );
    return material;
}

export function createKotlinElectricity(THREE, radius) {
    const electricity = new THREE.Group();
    const uniforms = {
        kotlinSparkTime: { value: 0 }
    };
    const glow = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.085, 64, 48),
        createKotlinLightningMaterial(THREE, uniforms, 'glow')
    );
    glow.renderOrder = 5;
    electricity.add(glow);
    const core = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.07, 64, 48),
        createKotlinLightningMaterial(THREE, uniforms, 'core')
    );
    core.renderOrder = 6;
    electricity.add(core);
    electricity.userData.kotlinElectricUniforms = uniforms;
    return electricity;
}

export function updateKotlinPlanetCrystal(target, nowMilliseconds) {
    const uniforms = target?.userData?.kotlinSparkUniforms;
    if (!uniforms?.kotlinSparkTime) return;
    uniforms.kotlinSparkTime.value = (
        nowMilliseconds / 1000 % KOTLIN_LIGHTNING_CYCLE_SECONDS
    ) / KOTLIN_LIGHTNING_CYCLE_SECONDS;
}

export function updateKotlinElectricity(target, nowMilliseconds) {
    const uniforms = target?.userData?.kotlinElectricUniforms;
    if (!uniforms?.kotlinSparkTime) return;
    const normalizedTime = (
        nowMilliseconds / 1000 % KOTLIN_LIGHTNING_CYCLE_SECONDS
    ) / KOTLIN_LIGHTNING_CYCLE_SECONDS;
    uniforms.kotlinSparkTime.value = normalizedTime;
    target.rotation.y = Math.sin(normalizedTime * TAU * 0.7) * 0.035;
    target.rotation.z = Math.cos(normalizedTime * TAU * 0.5) * 0.018;
}
