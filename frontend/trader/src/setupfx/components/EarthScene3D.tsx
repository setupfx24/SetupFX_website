'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ─────────────────────────────────────────────────────────────────────
   EarthScene3D — realistic textured Earth (vanilla three.js).

   Visual stack:
     • Diffuse Earth   (day-side photographic texture)
     • Normal map       (surface relief / mountains)
     • Specular map     (oceans reflect sun, land does not)
     • Emissive lights  (night-side city glow)
     • Cloud sphere     (separate sphere at +0.5%, slow drift)
     • Atmosphere shell (back-side fresnel shader = rim glow)
     • Orbit rings + 4 satellites + 600 space particles

   Textures are pulled from the official three.js examples CDN
   (threejs.org/examples/textures/planets — MIT licensed, public
   domain NASA imagery). They lazy-load AFTER the page is interactive
   so first paint is never blocked. While loading, a procedural shader
   Earth shows in place so users see SOMETHING immediately. As soon
   as textures arrive, we cross-fade to the realistic mesh.

   SCROLL-SAFE guarantees (unchanged):
   • Canvas pointer-events: none
   • No wheel/touch listeners
   • rAF loop pauses via IntersectionObserver when off-screen
   • Pauses on visibilitychange when tab hidden
   • DPR cap = min(devicePixelRatio, 1.5)
   • low-power WebGL hint
   ───────────────────────────────────────────────────────────────────── */

const TEX = {
  diffuse:  'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
  normal:   'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
  specular: 'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg',
  clouds:   'https://threejs.org/examples/textures/planets/earth_clouds_1024.png',
  lights:   'https://threejs.org/examples/textures/planets/earth_lights_2048.png',
};

/* ── Procedural fallback shader (used until / unless textures arrive) ── */
const PROC_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const PROC_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;
  float hash(vec3 p){p=fract(p*0.3183099+vec3(0.71,0.113,0.419));p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
  float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
  float fbm(vec3 p){float v=0.;float a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.1;a*=.5;}return v;}
  void main(){
    vec3 p=normalize(vPosition)*2.6;
    float land=smoothstep(.50,.56,fbm(p));
    vec3 ocean=vec3(.015,.06,.22);
    vec3 land1=vec3(.10,.45,.95);
    vec3 land2=vec3(.28,.62,1.0);
    vec3 base=mix(ocean,mix(land1,land2,smoothstep(.55,.65,fbm(p*1.4))),land);
    vec3 sun=normalize(vec3(.6,.5,.7));
    float diff=max(dot(vNormal,sun),0.);
    vec3 lit=base*(.10+.85*diff);
    float night=(1.-diff)*land;
    lit+=vec3(1.,.65,.30)*night*.18;
    float fres=pow(1.-max(dot(vNormal,vec3(0,0,1)),0.),2.2);
    lit+=vec3(.28,.55,1.)*fres*.45;
    gl_FragColor=vec4(lit,1.0);
  }
`;

const ATMO_VERT = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
/* Atmosphere shader — toned down per user feedback. Lower intensity
   curve (3.5 exponent vs 2.4) makes the rim halo subtle instead of
   prominent; opacity capped at 0.5 so it never overpowers the Earth. */
const ATMO_FRAG = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.5);
    vec3 color = mix(vec3(0.05, 0.22, 0.78), vec3(0.38, 0.62, 1.0), intensity);
    gl_FragColor = vec4(color, intensity * 0.5);
  }
`;

export default function EarthScene3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* ── Renderer + canvas ── */
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 3.6);

    const setSize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    setSize();

    /* ── Lights ── */
    const sun = new THREE.DirectionalLight(0xffffff, 1.7);
    sun.position.set(5, 2, 5);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.18));

    /* ── Earth — start with procedural shader, swap to textured when
            assets arrive. Explicit `THREE.Material` typing on the mesh
            so we can later assign a MeshPhongMaterial without TS
            narrowing it to ShaderMaterial. ── */
    const earthGeom = new THREE.SphereGeometry(1.0, 64, 64);
    const procMat = new THREE.ShaderMaterial({
      vertexShader: PROC_VERT,
      fragmentShader: PROC_FRAG,
      uniforms: { uTime: { value: 0 } },
    });
    const earth: THREE.Mesh<THREE.SphereGeometry, THREE.Material> =
      new THREE.Mesh(earthGeom, procMat);
    scene.add(earth);

    /* ── Atmosphere shell — kept (much softer per shader above).
            Scale dropped from 1.18 → 1.06 so the halo hugs the planet
            tightly instead of forming a visible ring behind it. ── */
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: ATMO_VERT,
      fragmentShader: ATMO_FRAG,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.0, 48, 48), atmosphereMat);
    atmosphere.scale.setScalar(1.06);
    scene.add(atmosphere);

    /* ── Cloud sphere — declared up-front so we can dispose on unmount,
            populated when texture arrives. ── */
    let clouds: THREE.Mesh | null = null;

    /* ── Lazy texture load ── */
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    let cancelled = false;

    const loadTex = (url: string): Promise<THREE.Texture> =>
      new Promise((resolve, reject) => {
        loader.load(
          url,
          (t) => {
            t.colorSpace = THREE.SRGBColorSpace;
            resolve(t);
          },
          undefined,
          (err) => reject(err),
        );
      });

    (async () => {
      try {
        const [diffuse, normalMap, specMap, cloudsTex, lightsTex] = await Promise.all([
          loadTex(TEX.diffuse),
          loadTex(TEX.normal),
          loadTex(TEX.specular),
          loadTex(TEX.clouds),
          loadTex(TEX.lights),
        ]);
        if (cancelled) {
          diffuse.dispose();
          normalMap.dispose();
          specMap.dispose();
          cloudsTex.dispose();
          lightsTex.dispose();
          return;
        }

        /* Realistic Phong material — diffuse + normal + specular + city
           lights as emissive map. Phong lets the directional sun cast
           proper Lambertian shading so the day/night terminator forms
           naturally on the side facing away from the light. */
        const realMat = new THREE.MeshPhongMaterial({
          map: diffuse,
          normalMap,
          normalScale: new THREE.Vector2(0.7, 0.7),
          specularMap: specMap,
          specular: new THREE.Color(0x335599),
          shininess: 18,
          emissiveMap: lightsTex,
          emissive: new THREE.Color(0xffd190),
          emissiveIntensity: 1.05,
        });
        earth.material = realMat;
        procMat.dispose();

        /* Cloud layer — slightly larger sphere, transparent, slowly
           rotates against the planet to suggest weather. */
        const cloudMat = new THREE.MeshLambertMaterial({
          map: cloudsTex,
          transparent: true,
          opacity: 0.55,
          depthWrite: false,
        });
        clouds = new THREE.Mesh(new THREE.SphereGeometry(1.008, 48, 48), cloudMat);
        scene.add(clouds);
      } catch (e) {
        /* Network failure (CORS, offline) — keep the procedural Earth.
           No user-visible error; the scene still looks great. */
        console.warn('[EarthScene3D] Texture load failed, using procedural fallback.', e);
      }
    })();

    /* ── Orbit rings removed per user feedback ("tone down everything").
            Earth + atmosphere halo + satellites + particles only. ── */

    /* ── Satellites ── */
    type Sat = { mesh: THREE.Mesh; radius: number; speed: number; phase: number; tilt: number };
    const sats: Sat[] = [];
    const satGeo = new THREE.BoxGeometry(0.035, 0.012, 0.012);
    const satConfigs = [
      { radius: 1.55, speed: 0.35, phase: 0,             tilt: 1.0 },
      { radius: 1.75, speed: 0.22, phase: Math.PI * 0.7, tilt: 0.55 },
      { radius: 1.40, speed: 0.42, phase: Math.PI * 1.3, tilt: 1.4 },
      { radius: 1.95, speed: 0.18, phase: Math.PI * 1.8, tilt: 0.9 },
    ];
    for (const c of satConfigs) {
      const mat = new THREE.MeshStandardMaterial({
        color: 0xE5EEFF, emissive: 0x4D95FF, emissiveIntensity: 0.5,
        roughness: 0.4, metalness: 0.8,
      });
      const m = new THREE.Mesh(satGeo, mat);
      scene.add(m);
      sats.push({ mesh: m, ...c });
    }

    /* ── Space particles ── */
    const particleGeo = new THREE.BufferGeometry();
    const PARTICLE_COUNT = 600;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = 3 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xC6DCFF, size: 0.018, sizeAttenuation: true,
      transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    /* ── Mouse parallax (passive) ── */
    let targetCamX = 0, targetCamY = 0, camX = 0, camY = 0;
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetCamX = nx * 0.18;
      targetCamY = -ny * 0.10;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    /* ── Pause control ── */
    let isVisible = true;
    let isTabActive = true;
    let rafId = 0;
    const shouldRun = () => isVisible && isTabActive;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { isVisible = e.isIntersecting; });
        if (shouldRun() && !rafId) rafId = requestAnimationFrame(loop);
      },
      { rootMargin: '100px' },
    );
    io.observe(container);

    const onVisibility = () => {
      isTabActive = !document.hidden;
      if (shouldRun() && !rafId) rafId = requestAnimationFrame(loop);
    };
    document.addEventListener('visibilitychange', onVisibility);

    let resizeRaf = 0;
    const onResize = () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(setSize);
    };
    window.addEventListener('resize', onResize);

    /* ── Animation loop ── */
    const clock = new THREE.Clock();
    const loop = () => {
      if (!shouldRun()) { rafId = 0; return; }
      const t = clock.getElapsedTime();

      earth.rotation.y = t * 0.06;
      earth.rotation.x = Math.sin(t * 0.05) * 0.04;
      if (clouds) {
        clouds.rotation.y = t * 0.08;
        clouds.rotation.x = Math.sin(t * 0.05) * 0.04;
      }
      particles.rotation.y = t * 0.005;

      for (const s of sats) {
        const angle = s.phase + t * s.speed;
        s.mesh.position.set(
          Math.cos(angle) * s.radius,
          Math.sin(angle) * s.radius * Math.sin(s.tilt),
          Math.sin(angle) * s.radius * Math.cos(s.tilt),
        );
        s.mesh.lookAt(0, 0, 0);
      }

      camX += (targetCamX - camX) * 0.05;
      camY += (targetCamY - camY) * 0.05;
      camera.position.x = camX;
      camera.position.y = camY;
      camera.lookAt(0, 0, 0);

      if ((earth.material as THREE.ShaderMaterial).uniforms?.uTime) {
        (earth.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    /* ── Cleanup ── */
    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      io.disconnect();
      renderer.dispose();
      satGeo.dispose();
      earthGeom.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      atmosphere.geometry.dispose();
      (earth.material as THREE.Material).dispose();
      atmosphereMat.dispose();
      for (const s of sats) (s.mesh.material as THREE.Material).dispose();
      if (clouds) {
        clouds.geometry.dispose();
        (clouds.material as THREE.Material).dispose();
      }
      try { container.removeChild(canvas); } catch { /* already detached */ }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden
      style={{ pointerEvents: 'none' }}
    />
  );
}
