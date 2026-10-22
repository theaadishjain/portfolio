'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SKILLS_DATA } from '@/lib/data';
import { TECH_ICONS } from '@/lib/tech-icons';

// ─── Constants ────────────────────────────────────────────────────────────────
const GLOBE_RADIUS = 2.0;
const CAMERA_Z     = 6.5;
const FOV          = 45;

// ─── Convert image to continent dots ──────────────────────────────────────────
const buildContinentDotsFromImage = async (imageSrc: string, targetDots: number): Promise<Float32Array> => {
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
      const MAX_ATTEMPTS = targetDots * 20; 
      let attempts = 0;

      while (positions.length / 3 < targetDots && attempts++ < MAX_ATTEMPTS) {
        // Uniform random point on sphere surface
        const u_sphere = Math.random();             
        const phi = Math.acos(1 - 2 * u_sphere);    // 0..π (North to South)
        const th  = Math.random() * 2 * Math.PI;    // 0..2π (West to East)

        // Equirectangular mapping
        const v = phi / Math.PI;                    // 0..1 (top to bottom)
        const u = th / (2 * Math.PI);               // 0..1 (left to right)

        const px = Math.floor(u * canvas.width);
        const py = Math.floor(v * canvas.height);
        const idx = (py * canvas.width + px) * 4;
        
        // Earth-water.png: White (255) is water, Black (0) is land
        if (data[idx] < 128) {
          const x = R * Math.sin(phi) * Math.cos(th);
          const y = R * Math.cos(phi);
          const z = R * Math.sin(phi) * Math.sin(th);
          positions.push(x, y, z);
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

// ─── Projected sphere silhouette radius in canvas-pixels ─────────────────────
//  Formula: (h/2) × (R/D) / tan(fov/2)   [perspective-correct]
const projSphereRadius = (canvasH: number): number => {
  const t = Math.tan((FOV / 2) * (Math.PI / 180));
  return (canvasH / 2) * (GLOBE_RADIUS / CAMERA_Z) / t;
};

// ─── Category accent colours ──────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Languages: '#3b82f6',
  Frontend:  '#22c55e',
  Backend:   '#f97316',
  DevOps:    '#ec4899',
  'AI/ML':   '#a855f7',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface MarkerOverlay {
  index: number; x: number; y: number;
  opacity: number; scale: number;
  name: string; context: string; category: string;
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
  const [markers,    setMarkers]    = useState<MarkerOverlay[]>([]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!isVisible || prefersReducedMotion || !mountRef.current) return;

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
      size:            0.022,          // smaller dots → more detail resolution
      transparent:     true,
      opacity:         0.70,           // slightly brighter to compensate smaller size
      sizeAttenuation: true,
      blending:        THREE.AdditiveBlending,
      depthWrite:      false,
    });
    group.add(new THREE.Points(dotGeo, dotMaterial));

    buildContinentDotsFromImage('/images/earth-water.png', 4000).then((positions) => {
      dotGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }).catch(console.error);

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
    const fibPts     = getFibonacciSpherePoints(SKILLS_DATA.length, GLOBE_RADIUS);
    const anchorGeo  = new THREE.SphereGeometry(0.13, 8, 8);
    const anchorMat  = new THREE.MeshBasicMaterial({ visible: false });
    const anchors: THREE.Mesh[] = [];
    fibPts.forEach((pos, i) => {
      const m = new THREE.Mesh(anchorGeo, anchorMat.clone());
      m.position.copy(pos);
      m.userData = { index: i };
      group.add(m);
      anchors.push(m);
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
    let animId: number;
    const tmp    = new THREE.Vector3();
    const invMat = new THREE.Matrix4();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = performance.now() * 0.001;

      if (!dragging) {
        vel.x *= 0.90;
        vel.y += (0.0025 - vel.y) * 0.04;
        group.rotation.x += vel.x;
        group.rotation.y += vel.y;
      }

      raycaster.setFromCamera(mouse, camera);
      const hits   = raycaster.intersectObjects(anchors);
      const hitIdx = hits.length ? (hits[0].object.userData.index as number) : null;
      renderer.domElement.style.cursor = hitIdx !== null ? 'pointer' : (dragging ? 'grabbing' : 'grab');

      const w = mount?.clientWidth  || 1;
      const h = mount?.clientHeight || 1;

      // Sphere silhouette clamping radius
      const sphPx      = projSphereRadius(h);
      const iconHalf   = 18;
      const clampR     = sphPx - iconHalf;
      const cx = w / 2, cy = h / 2;

      invMat.copy(camera.matrixWorldInverse);

      const overlays: MarkerOverlay[] = anchors.map((mesh, i) => {
        // ── depth / facing ───────────────────────────────────────────────────
        tmp.setFromMatrixPosition(mesh.matrixWorld);
        const camZ    = tmp.clone().applyMatrix4(invMat).z;
        const behind  = camZ > -0.05;

        const wNorm   = tmp.clone().normalize();
        const camDir  = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const facing  = wNorm.dot(camDir); // -1 (back) … +1 (front)
        // Smooth transition: invisible at facing < -0.1, full opacity at facing > 0.35
        const fade    = THREE.MathUtils.clamp((facing + 0.1) / 0.45, 0, 1);

        // ── screen projection ────────────────────────────────────────────────
        tmp.setFromMatrixPosition(mesh.matrixWorld);
        tmp.project(camera);
        let sx = (tmp.x *  0.5 + 0.5) * w;
        let sy = (tmp.y * -0.5 + 0.5) * h;

        // Clamp inside sphere silhouette circle
        const dx = sx - cx, dy = sy - cy;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d > clampR && d > 0) {
          sx = cx + (dx / d) * clampR;
          sy = cy + (dy / d) * clampR;
        }

        const pulse = 1 + Math.sin(time * 1.7 + i * 0.88) * 0.05;
        const scale = hitIdx === i ? 1.45 : pulse;

        return {
          index: i, x: sx, y: sy,
          opacity:  behind ? 0 : fade,
          scale,
          name:     SKILLS_DATA[i].name,
          context:  SKILLS_DATA[i].context,
          category: SKILLS_DATA[i].category,
        };
      });

      setMarkers(overlays);
      composer.render();
    };

    animate();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('pointermove',  onMove);
      renderer.domElement.removeEventListener('pointerdown',  onDown);
      renderer.domElement.removeEventListener('pointerup',    onUp);
      renderer.domElement.removeEventListener('pointerleave', onLeave);
      renderer.domElement.removeEventListener('click',        onClick);
      if (mount && renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [isVisible, prefersReducedMotion]);

  const hovered = hoveredIdx !== null ? markers[hoveredIdx] : null;

  return (
    <div className="w-full h-full relative">
      {/* WebGL canvas */}
      <div ref={mountRef} className="absolute inset-0 outline-none touch-none overflow-hidden" />

      {/* Skill icon overlay */}
      <div ref={overlayRef} className="absolute inset-0 pointer-events-none">
        {markers.map((m) => {
          const icon  = TECH_ICONS[m.name];
          const color = CATEGORY_COLORS[m.category] || '#d34b32';
          const isHov = hoveredIdx === m.index;
          return (
            <div
              key={m.index}
              className="absolute pointer-events-auto"
              style={{
                left:       m.x,
                top:        m.y,
                transform:  `translate(-50%, -50%) scale(${m.scale})`,
                opacity:    m.opacity,
                transition: 'opacity 0.22s ease, transform 0.16s ease',
                zIndex:     isHov ? 20 : 10,
              }}
              onMouseEnter={() => setHoveredIdx(m.index)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Glassy dark chip — consistent across all markers */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: isHov ? 'rgba(30, 30, 30, 0.7)' : 'rgba(20, 20, 20, 0.6)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  border:     `1px solid ${isHov ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}`,
                  boxShadow:  isHov
                    ? `0 4px 12px rgba(0,0,0,0.4)`
                    : `0 2px 6px rgba(0,0,0,0.3)`,
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
        {hovered && hoveredIdx !== null && (
          <motion.div
            key={hoveredIdx}
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.13 }}
            className="absolute pointer-events-none z-50 bg-[#1a1a20]/95 backdrop-blur-md text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-white/10 whitespace-nowrap -translate-x-1/2 -translate-y-[calc(100%+18px)]"
            style={{ left: hovered.x, top: hovered.y }}
          >
            <span className="font-bold text-[#d34b32] block mb-0.5 text-sm">{hovered.name}</span>
            <span className="text-white/70 block leading-snug max-w-[210px] whitespace-normal">{hovered.context}</span>
            <span className="text-white/30 text-[10px] uppercase tracking-wider mt-1.5 block border-t border-white/10 pt-1">click → projects</span>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#1a1a20]/95" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SkillsGlobeInner;
