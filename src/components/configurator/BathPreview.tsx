import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface BathPreviewProps {
  width: number;
  length: number;
  height: number;
  type: string;
}

const BathPreview = ({ width, length, height, type }: BathPreviewProps) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 10;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Bath model
    const createBathModel = () => {
      const geometry = new THREE.BoxGeometry(width * 2, height * 2, length * 2);
      const material = new THREE.MeshPhongMaterial({ 
        color: type === 'barrel' ? 0x8B4513 : 0xDEB887,
        flatShading: true 
      });
      const bath = new THREE.Mesh(geometry, material);
      
      if (type === 'barrel') {
        bath.geometry = new THREE.CylinderGeometry(
          height, 
          height, 
          length * 2, 
          32
        );
        bath.rotation.x = Math.PI / 2;
      }
      
      scene.add(bath);
      return bath;
    };

    let bath = createBathModel();

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      scene.remove(bath);
      geometry.dispose();
      material.dispose();
    };
  }, [width, length, height, type]);

  return <div ref={mountRef} className="w-full h-[400px] rounded-lg shadow-lg" />;
};

export default BathPreview;