'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SKILLS_DATA } from '@/lib/data';
import { getTechIcon } from '@/lib/tech-icons';

// ─── Constants ────────────────────────────────────────────────────────────────
const GLOBE_RADIUS = 2.0;
const CAMERA_Z     = 6.5;
const FOV          = 45;

// ─── Convert image to continent dots ──────────────────────────────────────────
const buildContinentDotsFromImage = async (imageSrc: string, rows: number): Promise<Float32Array> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      const positions: number[] = [];
      const R = GLOBE_RADIUS + 0.004;

      // Walk a regular polar grid instead of rejection-sampling at random.
      // Random sampling clumps and leaves holes, which is what makes the
      // landmasses read as speckle; an even grid reads as a dot matrix.
      // Longitude count scales with sin(phi) so the arc spacing between
      // neighbouring dots stays roughly constant from equator to pole.
      const cols = rows * 2;

      for (let r = 0; r < rows; r++) {
        const phi    = ((r + 0.5) / rows) * Math.PI;   // 0..π (North to South)
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const py  = Math.min(canvas.height - 1, Math.floor((phi / Math.PI) * canvas.height));
        const row = py * canvas.width;

        const nLon = Math.max(1, Math.round(cols * sinPhi));

        for (let c = 0; c < nLon; c++) {
          const th = ((c + 0.5) / nLon) * 2 * Math.PI;  // 0..2π (West to East)
          const px = Math.min(canvas.width - 1, Math.floor((th / (2 * Math.PI)) * canvas.width));

          // Earth-water.png: White (255) is water, Black (0) is land
          if (data[(row + px) * 4] < 128) {
            positions.push(
              R * sinPhi * Math.cos(th),
              R * cosPhi,
              R * sinPhi * Math.sin(th),
            );
          }
        }
      }

      resolve(new Float32Array(positions));
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
};

// ─── Fibonacci sphere anchors (for raycasting + projection) ───────────────────
const getFibonacciSpherePoints = (samples: number, radius: number): THREE.Vector3[] => {
  const pts: THREE.Vector3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < samples; i++) {
    const y  = 1 - (i / (samples - 1)) * 2;
    const r  = Math.sqrt(1 - y * y);
    const th = phi * i;
    pts.push(new THREE.Vector3(Math.cos(th) * r * radius, y * radius, Math.sin(th) * r * radius));
  }
  return pts;
};

// ─── Pick well-spread points out of the land dot cloud ───────────────────────
//  Farthest-point sampling: repeatedly take the candidate furthest from
//  everything already chosen. Gives even coverage across the continents
//  instead of clumping several skills onto one landmass. Deterministic, so
//  the arrangement is identical on every load.
const pickSpreadLandPoints = (positions: Float32Array, count: number): THREE.Vector3[] => {
  const total = Math.floor(positions.length / 3);
  if (total === 0) return [];

  const take    = Math.min(count, total);
  const chosen: number[] = [];
  const minDist = new Float32Array(total).fill(Infinity);

  let next = 0; // deterministic seed
  for (let k = 0; k < take; k++) {
    chosen.push(next);
    const nx = positions[next * 3], ny = positions[next * 3 + 1], nz = positions[next * 3 + 2];

    let best = -1, bestD = -1;
    for (let i = 0; i < total; i++) {
      const dx = positions[i * 3]     - nx;
      const dy = positions[i * 3 + 1] - ny;
      const dz = positions[i * 3 + 2] - nz;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < minDist[i]) minDist[i] = d2;
      if (minDist[i] > bestD) { bestD = minDist[i]; best = i; }
    }
    next = best;
  }

  return chosen.map((i) =>
    new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
      .setLength(GLOBE_RADIUS),
  );
};

// ─── Category accent colours ──────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Languages:       '#3b82f6',
  Frontend:        '#22c55e',
  Backend:         '#f97316',
  Databases:       '#14b8a6',
  'AI/ML':         '#a855f7',
  'AI Dev Tools':  '#eab308',
  DevOps:          '#ec4899',
};

// ─── Types ────────────────────────────────────────────────────────────────────
//  Marker placement is mutated in place each frame and written straight to the
//  DOM, so it deliberately lives outside React state.
interface MarkerPos {
  x: number; y: number;
  opacity: number; scale: number;
}
interface Props { isVisible: boolean; prefersReducedMotion: boolean | null; }

// ─── Rim-glow shader (renders ONLY at silhouette, transparent centre) ─────────
const rimVert = `
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    vNormal  = normalize(normalMatrix * normal);
    vec4 mv  = modelViewMatrix * vec4(position, 1.0);
    vViewPos = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;
const rimFrag = `
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    float NdotV  = clamp(dot(normalize(vNormal), normalize(vViewPos)), 0.0, 1.0);
    // Very thin, very bright rim — power 4 gives sharp falloff at edge
    float rim    = pow(1.0 - NdotV, 4.0);
    // Warm amber-white blend matching site accent
    gl_FragColor = vec4(vec3(1.0, 0.82, 0.75), rim * 0.95);
  }
`;

// ─── Globe inner ──────────────────────────────────────────────────────────────
function SkillsGlobeInner({ isVisible, prefersReducedMotion }: Props) {
  const mountRef   = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // The marker nodes and the tooltip node are written to imperatively by the
  // animation loop. Nothing that moves every frame goes through React state.
  const markerElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const tooltipElRef = useRef<HTMLDivElement | null>(null);
  const posRef       = useRef<MarkerPos[]>(
    SKILLS_DATA.map(() => ({ x: 0, y: 0, opacity: 0, scale: 1 }))
  );

  // Hover is the one thing React still re-renders for — it changes on pointer
  // events, not on every frame. The loop reads it through a ref so it can keep
  // the tooltip pinned to its marker.
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const hoveredIdxRef = useRef<number | null>(null);
  useEffect(() => { hoveredIdxRef.current = hoveredIdx; }, [hoveredIdx]);

  // Visibility only gates the *work* the loop does, never the scene's lifetime.
  // Rebuilding on every scroll past meant re-running the renderer, the bloom
  // pass, the 46k-sample landmask scan and the anchor spread each time.
  const isVisibleRef = useRef(isVisible);
  useEffect(() => { isVisibleRef.current = isVisible; }, [isVisible]);

  useEffect(() => {
    if (prefersReducedMotion || !mountRef.current) return;

    // ── Renderer + camera ────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 1000);
    camera.position.z = CAMERA_Z;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    // Bloom: moderate strength, bloom only picks up the bright rim (threshold 0.55)
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(512, 512), 0.65, 0.7, 0.55));

    const mount = mountRef.current;
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h);
      composer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    mount.appendChild(renderer.domElement);
    handleResize();

    const group = new THREE.Group();
    scene.add(group);

    // ── 1. Dark sphere base ──────────────────────────────────────────────────
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x07090b })
    ));

    // ── 2. Continent dot cloud — landmass-only, high density, small dots ──────
    const dotGeo = new THREE.BufferGeometry();
    const dotMaterial = new THREE.PointsMaterial({
      color:           0xffffff,
      size:            0.018,          // denser grid → smaller dots keep coastlines crisp
      transparent:     true,
      opacity:         0.80,           // brighter per-dot so landmasses read clearly
      sizeAttenuation: true,
      blending:        THREE.AdditiveBlending,
      depthWrite:      false,
    });
    group.add(new THREE.Points(dotGeo, dotMaterial));

    // ── 3. Rim-glow shell (transparent sphere, slightly larger) ──────────────
    //    This sphere renders near-invisible at the front and glows at the edge.
    //    Bloom amplifies only the bright rim pixels.
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS + 0.04, 64, 64),
      new THREE.ShaderMaterial({
        vertexShader:   rimVert,
        fragmentShader: rimFrag,
        transparent:    true,
        side:           THREE.FrontSide,
        blending:       THREE.AdditiveBlending,
        depthWrite:     false,
      })
    ));

    // ── 4. Very faint starfield ───────────────────────────────────────────────
    {
      const n = 160, sp = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        sp[i * 3]     = (Math.random() - 0.5) * 24;
        sp[i * 3 + 1] = (Math.random() - 0.5) * 24;
        sp[i * 3 + 2] = -Math.random() * 12 - 4;
      }
      const sg = new THREE.BufferGeometry();
      sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
      scene.add(new THREE.Points(sg, new THREE.PointsMaterial({
        color: 0xffffff, size: 0.035, transparent: true, opacity: 0.12,
      })));
    }

    // ── 5. Invisible anchor meshes (raycasting only) ──────────────────────────
    //  Anchors sit on land, chosen from the continent dot cloud once it loads,
    //  so every skill pins to a landmass instead of floating over ocean.
    const anchorGeo = new THREE.SphereGeometry(0.13, 8, 8);
    const anchorMat = new THREE.MeshBasicMaterial({ visible: false });
    const anchors: THREE.Mesh[] = [];

    const buildAnchors = (pts: THREE.Vector3[]) => {
      pts.forEach((pos, i) => {
        const m = new THREE.Mesh(anchorGeo, anchorMat.clone());
        m.position.copy(pos);
        m.userData = { index: i };
        group.add(m);
        anchors.push(m);
      });
    };

    // Guards against the promise resolving after the section has unmounted.
    let disposed = false;

    buildContinentDotsFromImage('/images/earth-water.png', 190).then((positions) => {
      if (disposed) return;
      dotGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      buildAnchors(pickSpreadLandPoints(positions, SKILLS_DATA.length));
    }).catch((err) => {
      console.error(err);
      // Mask unavailable — fall back to an even sphere spread so the skills
      // still show up, just not pinned to continents.
      if (!disposed) buildAnchors(getFibonacciSpherePoints(SKILLS_DATA.length, GLOBE_RADIUS));
    });

    // ── Interaction state ─────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    raycaster.params.Mesh = { threshold: 0.12 };
    const mouse = new THREE.Vector2(-10, -10);
    let dragging = false;
    let prev     = { x: 0, y: 0 };
    let vel      = { x: 0, y: 0.003 };

    const onMove  = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      mouse.x =  ((e.clientX - r.left) / r.width)  * 2 - 1;
      mouse.y = -((e.clientY - r.top)  / r.height) * 2 + 1;
      if (dragging) {
        vel = { x: (e.clientY - prev.y) * 0.0004, y: (e.clientX - prev.x) * 0.0004 };
        group.rotation.x += vel.x;
        group.rotation.y += vel.y;
        prev = { x: e.clientX, y: e.clientY };
      }
    };
    const onDown  = (e: PointerEvent) => { dragging = true;  prev = { x: e.clientX, y: e.clientY }; };
    const onUp    = ()                  => { dragging = false; };
    const onLeave = ()                  => { dragging = false; mouse.set(-10, -10); };
    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      if (raycaster.intersectObjects(anchors).length)
        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
    };
    renderer.domElement.addEventListener('pointermove',  onMove);
    renderer.domElement.addEventListener('pointerdown',  onDown);
    renderer.domElement.addEventListener('pointerup',    onUp);
    renderer.domElement.addEventListener('pointerleave', onLeave);
    renderer.domElement.addEventListener('click',        onClick);

    // ── Animation loop ────────────────────────────────────────────────────────
    //  Every vector below is allocated once and reused. The previous version
    //  built three Vector3s per marker per frame (~3,600/sec at 20 markers).
    let animId: number;
    const tmp     = new THREE.Vector3();
    const tmpNorm = new THREE.Vector3();
    const camDir  = new THREE.Vector3();
    // Viewed in perspective, a sphere's visible limb is the tangent point at
    // cos(angle) = R / cameraDistance — 0.308 here, NOT 0. Beyond it a
    // marker's projected position reverses and crawls back inward, which is
    // what made edge markers look like they stalled and bounced. Markers must
    // be fully gone before they ever reach it.
    const LIMB     = GLOBE_RADIUS / CAMERA_Z;  // 0.308 (~72.1°)
    const FADE_OUT = LIMB + 0.05;              // 0.358 — clear of the turn-around
    const FADE_IN  = LIMB + 0.37;              // 0.678 — full opacity

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Nothing is visible in a background tab, scrolled away, or behind the
      // grid view — keep the loop alive but skip the projection maths and the
      // WebGL draw. The scene stays built so coming back is instant.
      if (document.hidden || !isVisibleRef.current) return;

      const time = performance.now() * 0.001;

      if (!dragging) {
        vel.x *= 0.90;
        vel.y += (0.0025 - vel.y) * 0.04;
        group.rotation.x += vel.x;
        group.rotation.y += vel.y;
      }

      // Raycast only while the pointer is actually over the canvas. Off-canvas
      // the mouse parks at (-10,-10), which could never intersect anything.
      let hitIdx: number | null = null;
      if (mouse.x >= -1 && mouse.x <= 1 && mouse.y >= -1 && mouse.y <= 1) {
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(anchors);
        hitIdx = hits.length ? (hits[0].object.userData.index as number) : null;
      }
      renderer.domElement.style.cursor = hitIdx !== null ? 'pointer' : (dragging ? 'grabbing' : 'grab');

      const w = mount?.clientWidth  || 1;
      const h = mount?.clientHeight || 1;

      // Flush this frame's rotation into the world matrices BEFORE reading
      // them. three.js only refreshes matrixWorld during render, so reading it
      // first positioned every marker from the previous frame's transform and
      // left them visibly trailing the globe.
      group.updateMatrixWorld(true);
      camera.updateMatrixWorld();

      // Direction from the globe's centre toward the camera. A marker faces us
      // when its outward normal points this way — dotting against the camera's
      // *view* direction instead inverts it and shows the far hemisphere.
      camDir.copy(camera.position).normalize();

      const hoveredNow = hoveredIdxRef.current;

      for (let i = 0; i < anchors.length; i++) {
        // ── facing ───────────────────────────────────────────────────────────
        tmp.setFromMatrixPosition(anchors[i].matrixWorld);

        const facing = tmpNorm.copy(tmp).normalize().dot(camDir); // +1 front … -1 back

        // Retire markers before the limb, and smoothstep so whatever movement
        // is left in the slow zone happens at near-zero opacity.
        const t    = THREE.MathUtils.clamp((facing - FADE_OUT) / (FADE_IN - FADE_OUT), 0, 1);
        const fade = t * t * (3 - 2 * t);

        // ── screen projection ────────────────────────────────────────────────
        //  No silhouette clamping: a point on the sphere always projects inside
        //  the silhouette anyway, and clamping slid edge markers along the rim,
        //  off the continent they belong to.
        tmp.project(camera);
        const sx = (tmp.x *  0.5 + 0.5) * w;
        const sy = (tmp.y * -0.5 + 0.5) * h;

        const pulse   = 1 + Math.sin(time * 1.7 + i * 0.88) * 0.05;
        // Shrink toward the horizon so a departing marker reads as receding
        // over the curve rather than parking at full size and winking out.
        const horizon = 0.70 + 0.30 * fade;
        const scale   = hitIdx === i ? 1.45 : pulse * horizon;
        const opacity = fade;

        const p = posRef.current[i];
        p.x = sx; p.y = sy; p.opacity = opacity; p.scale = scale;

        // Straight to the DOM — no state update, no reconciliation.
        const el = markerElsRef.current[i];
        if (el) {
          el.style.left      = sx + 'px';
          el.style.top       = sy + 'px';
          el.style.opacity   = String(opacity);
          el.style.transform = `translate(-50%, -50%) scale(${scale})`;
          // A faded marker still sits over the globe and would otherwise
          // swallow hovers and block dragging in that spot.
          el.style.pointerEvents = fade < 0.12 ? 'none' : 'auto';
        }

        // Let go of a tooltip whose marker has rotated out of sight.
        if (hoveredNow === i && fade < 0.12) setHoveredIdx(null);

        // Keep the tooltip glued to the marker it belongs to.
        if (hoveredNow === i) {
          const tip = tooltipElRef.current;
          if (tip) {
            tip.style.left = sx + 'px';
            tip.style.top  = sy + 'px';
          }
        }
      }

      composer.render();
    };

    animate();
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('pointermove',  onMove);
      renderer.domElement.removeEventListener('pointerdown',  onDown);
      renderer.domElement.removeEventListener('pointerup',    onUp);
      renderer.domElement.removeEventListener('pointerleave', onLeave);
      renderer.domElement.removeEventListener('click',        onClick);
      if (mount && renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
      // renderer.dispose() alone leaves geometries, materials, the bloom pass's
      // render targets and the WebGL context itself allocated. Browsers cap
      // live contexts (~16), so leaking them is what degrades over a session.
      scene.traverse((obj) => {
        const o = obj as THREE.Mesh;
        if (o.geometry) o.geometry.dispose();
        const mat = o.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      composer.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [prefersReducedMotion]);

  return (
    <div className="w-full h-full relative">
      {/* WebGL canvas */}
      <div ref={mountRef} className="absolute inset-0 outline-none touch-none overflow-hidden" />

      {/* Skill icon overlay — this list is rendered once. left/top/opacity and
          the scale transform are driven by the animation loop above, so React
          only re-renders here when the hovered marker changes. */}
      <div ref={overlayRef} className="absolute inset-0 pointer-events-none">
        {SKILLS_DATA.map((skill, i) => {
          const icon  = getTechIcon(skill.name);
          const color = CATEGORY_COLORS[skill.category] || '#d34b32';
          const isHov = hoveredIdx === i;
          return (
            <div
              key={i}
              ref={(el) => { markerElsRef.current[i] = el; }}
              className="absolute pointer-events-auto"
              style={{
                left:       0,
                top:        0,
                transform:  'translate(-50%, -50%) scale(1)',
                opacity:    0,
                transition: 'transform 0.16s ease',
                zIndex:     isHov ? 20 : 10,
              }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Glassy dark chip, rimmed and lit in its category colour so the
                  legend's grouping is readable on the globe itself. */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: isHov ? 'rgba(30, 30, 30, 0.78)' : 'rgba(20, 20, 20, 0.62)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  border:     `1px solid ${isHov ? color : `${color}66`}`,
                  boxShadow:  isHov
                    ? `0 4px 12px rgba(0,0,0,0.4), 0 0 16px ${color}88`
                    : `0 2px 6px rgba(0,0,0,0.3), 0 0 9px ${color}3a`,
                  transition: 'all 0.16s ease',
                }}
              >
                <div style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.4))' }}>
                  {icon ?? <div className="w-3 h-3 rounded-full" style={{ background: color }} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredIdx !== null && (
          <motion.div
            key={hoveredIdx}
            ref={tooltipElRef}
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.13 }}
            className="absolute pointer-events-none z-50 bg-[#1a1a20]/95 backdrop-blur-md text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-white/10 whitespace-nowrap -translate-x-1/2 -translate-y-[calc(100%+18px)]"
            style={{ left: posRef.current[hoveredIdx].x, top: posRef.current[hoveredIdx].y }}
          >
            <span className="font-bold text-[#d34b32] block mb-0.5 text-sm">{SKILLS_DATA[hoveredIdx].name}</span>
            <span className="text-white/70 block leading-snug max-w-[210px] whitespace-normal">{SKILLS_DATA[hoveredIdx].context}</span>
            <span className="text-white/30 text-[10px] uppercase tracking-wider mt-1.5 block border-t border-white/10 pt-1">click → projects</span>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#1a1a20]/95" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SkillsGlobeInner;
