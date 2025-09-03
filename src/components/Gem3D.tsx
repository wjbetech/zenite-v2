'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Gem3D({ size = 120 }: { size?: number }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);
  const [webglAvailable, setWebglAvailable] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = Math.max(64, size);
    const height = Math.max(64, size);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    // move the camera up a bit so we look slightly down onto the gem
    camera.position.set(0, -0.5, 3);
    // ensure the camera looks at the origin (where the gem is placed)
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    // property exists at runtime in three.js; cast to any to satisfy TS types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (renderer as any).physicallyCorrectLights = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    // ensure the container has position so we can layer the SVG fallback
    containerRef.current.style.position = 'relative';
    // ensure the canvas fills the container
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    // ensure renderer canvas fills the container
    containerRef.current.appendChild(renderer.domElement);
    // set canvas size to match container (use updateStyle = true)
    renderer.setSize(width, height, true);

    // Lights
    // hemisphere for soft ambient sky/ground lighting
    const hemi = new THREE.HemisphereLight(0xffffff, 0x555555, 0.9);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 5, 5);
    scene.add(dir);
    // small ambient fill to reduce deep shadows on the back faces
    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambient);
    // a subtle key light coming from the camera direction so the near/back faces catch highlights
    const cameraKey = new THREE.DirectionalLight(0xffffff, 0.6);
    cameraKey.position.copy(camera.position);
    scene.add(cameraKey);

    // Create a custom faceted diamond geometry to better match the Navbar SVG
    function createDiamondGeometry() {
      const geom = new THREE.BufferGeometry();

      // Parameters (tweak to taste)
      const radiusTop = 0.95;
      const radiusBottom = 0.6;
      const yTop = 1.2;
      const yUpper = 0.45;
      const yLower = -0.45;
      const yBottom = -1.2;
      const sides = 6;

      const positions: number[] = [];
      const indices: number[] = [];

      // top apex
      positions.push(0, yTop, 0);
      const topIndex = 0;

      // upper ring (1..sides)
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2 + Math.PI / sides;
        const x = Math.cos(a) * radiusTop;
        const z = Math.sin(a) * radiusTop;
        positions.push(x, yUpper, z);
      }

      // lower ring
      const lowerStart = positions.length / 3;
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2 + Math.PI / sides;
        const x = Math.cos(a) * radiusBottom;
        const z = Math.sin(a) * radiusBottom;
        positions.push(x, yLower, z);
      }

      // bottom apex
      const bottomIndex = positions.length / 3;
      positions.push(0, yBottom, 0);

      // faces: top to upper ring
      for (let i = 0; i < sides; i++) {
        const a = 1 + i;
        const b = 1 + ((i + 1) % sides);
        indices.push(topIndex, a, b);
      }

      // faces between upper and lower rings (quads split)
      for (let i = 0; i < sides; i++) {
        const u0 = 1 + i;
        const u1 = 1 + ((i + 1) % sides);
        const l0 = lowerStart + i;
        const l1 = lowerStart + ((i + 1) % sides);

        indices.push(u0, l0, u1);
        indices.push(u1, l0, l1);
      }

      // bottom faces
      for (let i = 0; i < sides; i++) {
        const a = lowerStart + i;
        const b = lowerStart + ((i + 1) % sides);
        indices.push(bottomIndex, b, a);
      }

      const posArray = new Float32Array(positions);
      geom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      geom.setIndex(indices);
      geom.computeVertexNormals();

      // add a tiny deterministic micro-facet displacement to give texture
      const normals = geom.getAttribute('normal') as THREE.BufferAttribute;
      const pos = geom.getAttribute('position') as THREE.BufferAttribute;
      const displaced = new Float32Array(pos.array.length);
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        const vz = pos.getZ(i);
        // deterministic pseudo-random using sine
        const rnd = Math.abs(Math.sin(vx * 12.9898 + vy * 78.233 + vz * 37.719)) * 43758.5453;
        const d = (rnd % 1) * 0.02 * (Math.abs(vy) < 0.01 ? 0.5 : 1); // less on center line
        const nx = normals.getX(i);
        const ny = normals.getY(i);
        const nz = normals.getZ(i);
        displaced[i * 3] = vx + nx * d;
        displaced[i * 3 + 1] = vy + ny * d;
        displaced[i * 3 + 2] = vz + nz * d;
      }

      geom.setAttribute('position', new THREE.BufferAttribute(displaced, 3));
      geom.computeVertexNormals();

      return geom;
    }

    const geom = createDiamondGeometry();

    // PBR material tuned for crisp facets and glass-like reflections
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#34d399'),
      metalness: 0.0,
      // slightly smoother facets but still crisp
      roughness: 0.04,
      flatShading: true,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 0.65,
      // reduce transmission/thickness to avoid overly dark internal refraction
      transmission: 0.45,
      ior: 1.54,
      thickness: 0.25,
      envMapIntensity: 1.0,
    });

    const mesh = new THREE.Mesh(geom, mat);
    // give it a small static tilt (fixed axle will be the Y axis)
    mesh.rotation.set(0.18, 0, 0);
    scene.add(mesh);

    // add a subtle line highlight along edges to emulate facet definition
    // Add faint facet edges, but offset them slightly to avoid z-fighting and
    // prevent the scaffold lines from being visible through the gem.
    try {
      const edgesGeom = new THREE.EdgesGeometry(geom);
      const edgesMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.04,
        depthWrite: false,
      });
      // polygonOffset helps avoid z-fighting when lines overlap the mesh
      // cast to any so we can set runtime-only properties supported by three.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const edgesMatAny = edgesMat as any;
      edgesMatAny.polygonOffset = true;
      edgesMatAny.polygonOffsetFactor = -1;
      edgesMatAny.polygonOffsetUnits = -4;

      const edges = new THREE.LineSegments(edgesGeom, edgesMat);
      edges.renderOrder = 1;
      scene.add(edges);
    } catch {
      // no-op if edges can't be generated
    }

    // subtle environment generator for reflections
    const pmremGen = new THREE.PMREMGenerator(renderer);
    pmremGen.compileEquirectangularShader();

    // animate: rotate around a fixed Y axle (no corkscrew)
    let last = performance.now();
    function animate(now: number) {
      const delta = (now - last) / 1000;
      last = now;
      // fixed axle rotation (Y axis) with a gentle constant speed (slower)
      mesh.rotation.y += 0.6 * delta;
      // tiny breathing tilt to keep it lively (not changing the axle)
      mesh.rotation.x = 0.18 + Math.sin(now / 1200) * 0.008;
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    }

    frameRef.current = requestAnimationFrame(animate);

    // handle resize
    function onResize() {
      const w = Math.max(64, size);
      const h = Math.max(64, size);
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', onResize);

    // detect WebGL availability
    try {
      const gl = renderer.getContext();
      if (!gl) throw new Error('no gl');
      setWebglAvailable(true);
    } catch {
      setWebglAvailable(false);
    }

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      pmremGen.dispose();
      scene.clear();
    };
  }, [size]);

  return (
    <div className="mt-12 flex justify-center">
      {/* pushed down from text */}
      <div ref={containerRef} style={{ width: Math.max(64, size), height: Math.max(64, size) }}>
        {!webglAvailable && (
          <svg
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              display: 'block',
            }}
            aria-hidden
          >
            <defs>
              <linearGradient id="g1" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="g2" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#bbf7d0" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            <g fill="none" fillRule="evenodd">
              <path d="M32 4 L56 22 L48 58 L16 58 L8 22 Z" fill="url(#g1)" opacity="0.98" />
              <path d="M32 4 L48 22 L32 44 L16 22 Z" fill="url(#g2)" opacity="0.95" />
            </g>
          </svg>
        )}
      </div>
    </div>
  );
}
