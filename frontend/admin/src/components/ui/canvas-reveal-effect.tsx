'use client';

/**
 * CanvasRevealEffect — animated WebGL dot-matrix background.
 *
 * Vanilla three.js (no @react-three/fiber). R3F 8 ships
 * `react-reconciler@0.27.0` which reads React 18.0–18.2-shaped internals
 * (`React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner`)
 * and crashes against React 18.3.x. R3F 9 fixes this but requires React
 * ≥19 — incompatible with our app's React 18. The cleanest escape is
 * to drop R3F entirely: this component renders ONE mesh with ONE
 * material in ONE animation loop, which is a 30-line useEffect.
 *
 * Public API is unchanged from the R3F version so call-sites
 * (dynamic-imported in auth pages) keep working without edits.
 *
 * The fragment shader is preserved verbatim from the R3F version so
 * the visual output is identical (dot grid that fades in from centre
 * outward, or out from edges inward when `reverse` is set).
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

export interface CanvasRevealEffectProps {
  animationSpeed?: number;
  opacities?: number[];
  colors?: number[][];
  containerClassName?: string;
  dotSize?: number;
  showGradient?: boolean;
  /** When true the matrix fades OUT from edges inward instead of fading
   *  IN from centre outward. Used to telegraph submit/success states. */
  reverse?: boolean;
}

// ─────────────────────────────────────────────────────────────────────
// Shader source (GLSL 3.00 ES)
// ─────────────────────────────────────────────────────────────────────

const VERTEX_SHADER = /* glsl */ `
  precision mediump float;
  uniform vec2 u_resolution;
  out vec2 fragCoord;
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
    fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
    fragCoord.y = u_resolution.y - fragCoord.y;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;
  in vec2 fragCoord;

  uniform float u_time;
  uniform float u_opacities[10];
  uniform vec3  u_colors[6];
  uniform float u_total_size;
  uniform float u_dot_size;
  uniform vec2  u_resolution;
  uniform int   u_reverse;
  uniform float u_animation_speed_factor;

  out vec4 fragColor;

  float PHI = 1.61803398874989484820459;
  float random(vec2 xy) {
    return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
  }

  void main() {
    vec2 st = fragCoord.xy;
    st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
    st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));

    float opacity = step(0.0, st.x);
    opacity *= step(0.0, st.y);

    vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

    float frequency = 5.0;
    float show_offset = random(st2);
    float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
    opacity *= u_opacities[int(rand * 10.0)];
    opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
    opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

    vec3 color = u_colors[int(show_offset * 6.0)];

    vec2 center_grid = u_resolution / 2.0 / u_total_size;
    float dist_from_center = distance(center_grid, st2);

    float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);
    float max_grid_dist = distance(center_grid, vec2(0.0, 0.0));
    float timing_offset_outro = (max_grid_dist - dist_from_center) * 0.02 + (random(st2 + 42.0) * 0.2);

    float current_timing_offset;
    if (u_reverse == 1) {
      current_timing_offset = timing_offset_outro;
      opacity *= 1.0 - step(current_timing_offset, u_time * u_animation_speed_factor);
      opacity *= clamp((step(current_timing_offset + 0.1, u_time * u_animation_speed_factor)) * 1.25, 1.0, 1.25);
    } else {
      current_timing_offset = timing_offset_intro;
      opacity *= step(current_timing_offset, u_time * u_animation_speed_factor);
      opacity *= clamp((1.0 - step(current_timing_offset + 0.1, u_time * u_animation_speed_factor)) * 1.25, 1.0, 1.25);
    }

    fragColor = vec4(color, opacity);
    fragColor.rgb *= fragColor.a;
  }
`;

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export const CanvasRevealEffect: React.FC<CanvasRevealEffectProps> = ({
  animationSpeed = 10,
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  colors = [[0, 255, 255]],
  containerClassName,
  dotSize = 3,
  showGradient = true,
  reverse = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Color slots ──────────────────────────────────────────────
    // Match the R3F version's behaviour: spread 1/2/3 input colours
    // across 6 shader slots so per-cell pick (`show_offset * 6.0`)
    // gives a balanced distribution. More than 3 → first 6 used.
    let colorsArray = [colors[0], colors[0], colors[0], colors[0], colors[0], colors[0]];
    if (colors.length === 2) {
      colorsArray = [colors[0], colors[0], colors[0], colors[1], colors[1], colors[1]];
    } else if (colors.length === 3) {
      colorsArray = [colors[0], colors[0], colors[1], colors[1], colors[2], colors[2]];
    } else if (colors.length >= 4) {
      colorsArray = colors.slice(0, 6);
      while (colorsArray.length < 6) colorsArray.push(colors[0]);
    }

    // ── three.js scene ───────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      glslVersion: THREE.GLSL3,
      transparent: true,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
      uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(1, 1) },
        u_colors: {
          value: colorsArray.map(
            (c) => new THREE.Vector3(c[0] / 255, c[1] / 255, c[2] / 255),
          ),
        },
        u_opacities: { value: opacities },
        u_total_size: { value: 20.0 },
        u_dot_size: { value: dotSize },
        u_reverse: { value: reverse ? 1 : 0 },
        // animation_speed_factor was a hard-coded 0.5 in the R3F
        // version (which is why bumping the `animationSpeed` prop
        // alone didn't have any effect). Bringing it through as a
        // uniform so the prop is finally wired up — keep the 0.5
        // default behaviour by scaling speed/10 → 0.05..* range
        // that visibly changes the animation cadence.
        u_animation_speed_factor: { value: (animationSpeed || 10) / 20 },
      },
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    // ── Size / DPR handling ──────────────────────────────────────
    const resize = () => {
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      renderer.setSize(w, h, false);
      // Match the R3F version's `size.width * 2` for u_resolution —
      // gives the shader a stable grid count regardless of DPR.
      material.uniforms.u_resolution.value.set(w * 2, h * 2);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    // ── Animation loop ──────────────────────────────────────────
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      material.uniforms.u_time.value = (performance.now() - start) / 1000;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Pause when tab is hidden — saves battery + GPU on background tabs.
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    // ── Cleanup ─────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
      observer.disconnect();
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
    // Re-create the renderer when any visual prop changes. JSON.stringify
    // for arrays is fine here — colors/opacities are tiny (< 10 entries),
    // and treating them as value-equal keeps us from re-creating the
    // renderer on every parent re-render that passes a new array literal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationSpeed, dotSize, reverse, JSON.stringify(colors), JSON.stringify(opacities)]);

  return (
    <div className={cn('h-full relative w-full', containerClassName)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      )}
    </div>
  );
};
