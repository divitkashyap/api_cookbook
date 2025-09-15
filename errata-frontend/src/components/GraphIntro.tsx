import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

// Enhanced glowing node with more exotic shapes
const GraphNode = ({ 
  position, 
  nodeType = 'error',
  color = "#4ade80",
  scale = 1,
  timeOffset = 0
}: { 
  position: [number, number, number];
  nodeType?: 'api' | 'error' | 'solution' | 'parameter' | 'dimensional' | 'portal';
  color?: string;
  scale?: number;
  timeOffset?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  const getGeometry = () => {
    switch (nodeType) {
      case 'api': return new THREE.OctahedronGeometry(0.15 * scale, 1);
      case 'error': return new THREE.IcosahedronGeometry(0.12 * scale, 1);
      case 'solution': return new THREE.SphereGeometry(0.1 * scale, 12, 12);
      case 'parameter': return new THREE.TetrahedronGeometry(0.08 * scale, 0);
      case 'dimensional': return new THREE.DodecahedronGeometry(0.2 * scale, 1);
      case 'portal': return new THREE.TorusGeometry(0.1 * scale, 0.04 * scale, 8, 16);
      default: return new THREE.SphereGeometry(0.1 * scale, 8, 8);
    }
  };

  useFrame((state) => {
    if (meshRef.current && glowRef.current) {
      const time = state.clock.elapsedTime + timeOffset;
      
      // Complex rotations for Dr. Strange effect
      meshRef.current.rotation.x = Math.sin(time * 0.7) * 0.5 + Math.cos(time * 1.3) * 0.3;
      meshRef.current.rotation.y = Math.cos(time * 0.5) * 0.4 + Math.sin(time * 1.7) * 0.2;
      meshRef.current.rotation.z = Math.sin(time * 1.1) * 0.3;
      
      // Pulsing scale effect
      const pulse = 1 + Math.sin(time * 2 + timeOffset) * 0.2;
      meshRef.current.scale.setScalar(pulse);
      
      // Glow intensity variation
      const glowIntensity = 0.5 + Math.sin(time * 3 + timeOffset) * 0.3;
      glowRef.current.scale.setScalar(pulse * 1.5);
      
      // Copy rotation to glow
      glowRef.current.rotation.copy(meshRef.current.rotation);
    }
  });

  const geometry = getGeometry();

  return (
    <group position={position}>
      {/* Main node */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.6}
          transparent
          opacity={0.9}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>
      
      {/* Glow effect */}
      <mesh ref={glowRef} geometry={geometry}>
        <meshBasicMaterial 
          color={color} 
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

// Flowing, curved connections
const GraphConnection = ({ 
  start, 
  end, 
  color = "#10b981",
  opacity = 0.4,
  curved = false,
  timeOffset = 0
}: {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  opacity?: number;
  curved?: boolean;
  timeOffset?: number;
}) => {
  const lineRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (lineRef.current && curved) {
      // Flowing animation along the curve
      const time = state.clock.elapsedTime + timeOffset;
      lineRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
    }
  });

  const points = curved ? 
    // Curved connection for more organic feel
    [
      new THREE.Vector3(...start),
      new THREE.Vector3(
        (start[0] + end[0]) / 2 + Math.sin((start[0] + end[0]) * 0.5) * 2,
        (start[1] + end[1]) / 2 + Math.cos((start[1] + end[1]) * 0.5) * 2,
        (start[2] + end[2]) / 2 + Math.sin((start[2] + end[2]) * 0.3) * 1
      ),
      new THREE.Vector3(...end)
    ] :
    [
      new THREE.Vector3(...start),
      new THREE.Vector3(...end)
    ];

  return (
    <group ref={lineRef}>
      <Line
        points={points}
        color={color}
        lineWidth={curved ? 3 : 2}
        transparent
        opacity={opacity}
      />
    </group>
  );
};

// Massive Dr. Strange multiverse
const DrStrangeMultiverse = ({ cameraProgress }: { cameraProgress: number }) => {
  const mainGroupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  
  // Generate MASSIVE graph structure
  const generateNodes = () => {
    const nodes = [];
    const nodeTypes = ['api', 'error', 'solution', 'parameter', 'dimensional', 'portal'] as const;
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
    
    // Create multiple dimensional layers
    for (let layer = 0; layer < 8; layer++) {
      const layerRadius = 15 + layer * 8;
      const nodesInLayer = 25 + layer * 10; // Increasing density
      
      for (let i = 0; i < nodesInLayer; i++) {
        // Spherical coordinate distribution with chaos
        const phi = Math.acos(-1 + (2 * i) / nodesInLayer);
        const theta = Math.sqrt(nodesInLayer * Math.PI) * phi;
        
        // Add fractal noise for unnatural patterns
        const fractalNoise = {
          x: Math.sin(theta * 3) * Math.cos(phi * 2) * 3,
          y: Math.cos(theta * 2) * Math.sin(phi * 3) * 3,
          z: Math.sin(theta * phi) * 2
        };
        
        const x = layerRadius * Math.cos(theta) * Math.sin(phi) + fractalNoise.x;
        const y = layerRadius * Math.sin(theta) * Math.sin(phi) + fractalNoise.y;
        const z = layerRadius * Math.cos(phi) + fractalNoise.z;
        
        // Additional dimensional warping
        const warpFactor = Math.sin(layer * 0.5) * 5;
        const warpedX = x + Math.sin(y * 0.1) * warpFactor;
        const warpedY = y + Math.cos(z * 0.1) * warpFactor;
        const warpedZ = z + Math.sin(x * 0.1) * warpFactor;
        
        nodes.push({
          position: [warpedX, warpedY, warpedZ] as [number, number, number],
          type: nodeTypes[Math.floor(Math.random() * nodeTypes.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          scale: 0.5 + Math.random() * 1.5,
          timeOffset: Math.random() * Math.PI * 2,
          layer
        });
      }
    }
    
    return nodes;
  };

  const nodes = generateNodes(); // ~500+ nodes
  console.log(`Generated ${nodes.length} nodes`);

  // Generate complex connection patterns
  const generateConnections = () => {
    const connections = [];
    
    // Connect nodes within proximity with probability
    for (let i = 0; i < nodes.length; i++) {
      const node1 = nodes[i];
      const maxConnections = 3 + Math.floor(Math.random() * 4);
      let connectionCount = 0;
      
      for (let j = i + 1; j < nodes.length && connectionCount < maxConnections; j++) {
        const node2 = nodes[j];
        
        // Calculate distance
        const dist = Math.sqrt(
          Math.pow(node1.position[0] - node2.position[0], 2) +
          Math.pow(node1.position[1] - node2.position[1], 2) +
          Math.pow(node1.position[2] - node2.position[2], 2)
        );
        
        // Connect based on distance and layer relationship
        const layerDiff = Math.abs(node1.layer - node2.layer);
        const connectionProb = layerDiff <= 1 ? 0.15 : layerDiff <= 2 ? 0.08 : 0.03;
        
        if (dist < 25 && Math.random() < connectionProb) {
          connections.push({
            start: node1.position,
            end: node2.position,
            color: Math.random() > 0.7 ? '#ffffff' : node1.color,
            opacity: 0.2 + Math.random() * 0.4,
            curved: Math.random() > 0.6,
            timeOffset: Math.random() * Math.PI * 2
          });
          connectionCount++;
        }
      }
    }
    
    return connections;
  };

  const connections = generateConnections(); // ~800+ connections
  console.log(`Generated ${connections.length} connections`);

  // Cosmic particle field
  const generateParticles = () => {
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Distribute particles in a larger sphere
      const radius = 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    return positions;
  };

  const particlePositions = generateParticles();

  useFrame((state) => {
    if (mainGroupRef.current) {
      // Complex universal rotation
      mainGroupRef.current.rotation.y = state.clock.elapsedTime * 0.005;
      mainGroupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.003) * 0.02;
      mainGroupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.007) * 0.01;
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.001;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.0007;
    }

    // Epic camera journey through 40% of the multiverse
    if (state.camera) {
      const t = Math.min(cameraProgress, 1);
      
      // Camera path that travels through the graph structure
      const pathRadius = 50;
      const pathProgress = t * 0.4; // Only go through 40% of the structure
      
      // Spiral path through the multiverse
      const spiralAngle = pathProgress * Math.PI * 4;
      const spiralHeight = pathProgress * 30 - 15;
      const spiralRadius = pathRadius * (1 - pathProgress * 0.6);
      
      const cameraX = spiralRadius * Math.cos(spiralAngle);
      const cameraY = spiralHeight + Math.sin(spiralAngle * 2) * 10;
      const cameraZ = spiralRadius * Math.sin(spiralAngle);
      
      state.camera.position.set(cameraX, cameraY, cameraZ);
      
      // Look ahead along the path for smooth movement
      const lookAheadAngle = spiralAngle + 0.3;
      const lookAheadHeight = spiralHeight + 5;
      const lookX = (spiralRadius * 0.8) * Math.cos(lookAheadAngle);
      const lookY = lookAheadHeight;
      const lookZ = (spiralRadius * 0.8) * Math.sin(lookAheadAngle);
      
      state.camera.lookAt(lookX, lookY, lookZ);
    }
  });

  return (
    <>
      {/* Multi-dimensional lighting */}
      <ambientLight intensity={0.1} />
      <pointLight position={[50, 50, 50]} intensity={0.8} color="#3b82f6" />
      <pointLight position={[-50, -50, -50]} intensity={0.6} color="#8b5cf6" />
      <pointLight position={[0, 100, 0]} intensity={0.4} color="#10b981" />
      <pointLight position={[0, -100, 0]} intensity={0.4} color="#f59e0b" />
      
      {/* Cosmic particle background */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.length / 3}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ffffff"
          size={0.5}
          transparent
          opacity={0.4}
          sizeAttenuation={true}
        />
      </points>
      
      {/* Main multiverse structure */}
      <group ref={mainGroupRef}>
        {/* Render all nodes */}
        {nodes.map((node, i) => (
          <GraphNode
            key={`node-${i}`}
            position={node.position}
            nodeType={node.type}
            color={node.color}
            scale={node.scale}
            timeOffset={node.timeOffset}
          />
        ))}
        
        {/* Render all connections */}
        {connections.map((conn, i) => (
          <GraphConnection
            key={`conn-${i}`}
            start={conn.start}
            end={conn.end}
            color={conn.color}
            opacity={conn.opacity}
            curved={conn.curved}
            timeOffset={conn.timeOffset}
          />
        ))}
      </group>
    </>
  );
};

interface GraphIntroProps {
  onComplete: () => void;
}

const GraphIntro = ({ onComplete }: GraphIntroProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 3000; // 3 seconds for the journey

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      
      setProgress(newProgress);
      
      if (newProgress >= 1) {
        clearInterval(interval);
        setTimeout(onComplete, 300);
      }
    }, 16); // 60fps

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <Canvas 
        camera={{ 
          position: [50, 0, 50], 
          fov: 75,
          near: 0.1,
          far: 1000
        }}
      >
        <DrStrangeMultiverse cameraProgress={progress} />
      </Canvas>
      
      {/* Mystical text overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent font-jakarta">
            Errata
          </h1>
          <p className="text-xl opacity-70 font-jakarta">
            {
             progress < 0.3 ? "Navigating Graph Dimensions..." : 
             "Powered by HelixDB"}
          </p>
        </div>
      </div>
      
      {/* Dimensional progress indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-80 h-2 bg-gray-800 rounded-full overflow-hidden border border-blue-500/30">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all duration-300 ease-out shadow-lg shadow-blue-500/50"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default GraphIntro;
// import { useRef, useEffect, useState } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { OrbitControls, Sphere, Line } from '@react-three/drei';
// import * as THREE from 'three';

// const GraphNode = ({ position, color = "#4ade80" }: { position: [number, number, number], color?: string }) => {
//   const meshRef = useRef<THREE.Mesh>(null);
  
//   useFrame((state) => {
//     if (meshRef.current) {
//       meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
//       meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.1;
//     }
//   });

//   return (
//     <Sphere ref={meshRef} position={position} args={[0.05, 16, 16]}>
//       <meshStandardMaterial 
//         color={color} 
//         emissive={color} 
//         emissiveIntensity={0.3}
//         transparent
//         opacity={0.8}
//       />
//     </Sphere>
//   );
// };

// const GraphEdge = ({ start, end, color = "#10b981" }: { 
//   start: [number, number, number], 
//   end: [number, number, number],
//   color?: string 
// }) => {
//   const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  
//   return (
//     <Line
//       points={points}
//       color={color}
//       lineWidth={2}
//       transparent
//       opacity={0.6}
//     />
//   );
// };

// const GraphScene = ({ cameraProgress }: { cameraProgress: number }) => {
//   const groupRef = useRef<THREE.Group>(null);
//   const backgroundGroupRef = useRef<THREE.Group>(null);
  
//   // Generate foreground nodes (gateway nodes)
//   const foregroundNodes = Array.from({ length: 8 }, (_, i) => {
//     const angle = (i / 8) * Math.PI * 2;
//     const radius = 1.5;
//     return [
//       radius * Math.cos(angle),
//       radius * Math.sin(angle),
//       0
//     ] as [number, number, number];
//   });

//   // Generate background nodes (structured prism)
//   const backgroundNodes = [];
//   const layers = 3;
//   const nodesPerLayer = 8;
  
//   for (let layer = 0; layer < layers; layer++) {
//     for (let i = 0; i < nodesPerLayer; i++) {
//       const angle = (i / nodesPerLayer) * Math.PI * 2;
//       const radius = 3.5 + layer * 0.5;
//       const z = -6 - layer * 2;
      
//       backgroundNodes.push([
//         radius * Math.cos(angle),
//         radius * Math.sin(angle),
//         z
//       ] as [number, number, number]);
//     }
//   }

//   // Generate foreground edges (sparse connections)
//   const foregroundEdges = [];
//   for (let i = 0; i < foregroundNodes.length; i++) {
//     const nextIndex = (i + 1) % foregroundNodes.length;
//     foregroundEdges.push({ 
//       start: foregroundNodes[i], 
//       end: foregroundNodes[nextIndex] 
//     });
    
//     // Add some cross connections
//     if (i % 2 === 0) {
//       const crossIndex = (i + 3) % foregroundNodes.length;
//       foregroundEdges.push({ 
//         start: foregroundNodes[i], 
//         end: foregroundNodes[crossIndex] 
//       });
//     }
//   }

//   // Generate background edges (structured prism connections)
//   const backgroundEdges = [];
  
//   // Connect within each layer (ring connections)
//   for (let layer = 0; layer < layers; layer++) {
//     for (let i = 0; i < nodesPerLayer; i++) {
//       const currentNode = layer * nodesPerLayer + i;
//       const nextNode = layer * nodesPerLayer + ((i + 1) % nodesPerLayer);
//       backgroundEdges.push({ 
//         start: backgroundNodes[currentNode], 
//         end: backgroundNodes[nextNode] 
//       });
//     }
//   }
  
//   // Connect between layers (vertical connections)
//   for (let layer = 0; layer < layers - 1; layer++) {
//     for (let i = 0; i < nodesPerLayer; i++) {
//       const currentNode = layer * nodesPerLayer + i;
//       const nextLayerNode = (layer + 1) * nodesPerLayer + i;
//       backgroundEdges.push({ 
//         start: backgroundNodes[currentNode], 
//         end: backgroundNodes[nextLayerNode] 
//       });
      
//       // Add diagonal connections for prism structure
//       const diagonalNode = (layer + 1) * nodesPerLayer + ((i + 1) % nodesPerLayer);
//       backgroundEdges.push({ 
//         start: backgroundNodes[currentNode], 
//         end: backgroundNodes[diagonalNode] 
//       });
//     }
//   }

//   useFrame((state) => {
//     if (groupRef.current) {
//       groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
//       groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.1;
//     }
    
//     if (backgroundGroupRef.current) {
//       backgroundGroupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
//       backgroundGroupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.05;
//     }

//     // 3D Camera animation - scale through foreground to background
//     if (state.camera) {
//       const progress = Math.min(cameraProgress, 1);
      
//       if (progress < 0.6) {
//         // Phase 1: Approach foreground graph
//         const phaseProgress = progress / 0.6;
//         const startPos = [6, 4, 8];
//         const midPos = [0, 0, 2];
        
//         state.camera.position.x = startPos[0] + (midPos[0] - startPos[0]) * phaseProgress;
//         state.camera.position.y = startPos[1] + (midPos[1] - startPos[1]) * phaseProgress;
//         state.camera.position.z = startPos[2] + (midPos[2] - startPos[2]) * phaseProgress;
//         state.camera.lookAt(0, 0, 0);
//       } else {
//         // Phase 2: Scale through foreground to reveal background
//         const phaseProgress = (progress - 0.6) / 0.4;
//         const midPos = [0, 0, 2];
//         const endPos = [0, 0, -5];
        
//         state.camera.position.x = midPos[0] + (endPos[0] - midPos[0]) * phaseProgress;
//         state.camera.position.y = midPos[1] + (endPos[1] - midPos[1]) * phaseProgress;
//         state.camera.position.z = midPos[2] + (endPos[2] - midPos[2]) * phaseProgress;
//         state.camera.lookAt(0, 0, -8);
//       }
//     }
//   });

//   return (
//     <>
//       {/* Foreground Graph */}
//       <group ref={groupRef}>
//         <ambientLight intensity={0.15} />
//         <pointLight position={[5, 5, 5]} intensity={0.4} color="#3b82f6" />
        
//         {/* Foreground nodes - larger, brighter */}
//         {foregroundNodes.map((position, i) => (
//           <GraphNode 
//             key={`fg-${i}`} 
//             position={position} 
//             color="#3b82f6"
//           />
//         ))}
        
//         {/* Foreground edges */}
//         {foregroundEdges.map((edge, i) => (
//           <GraphEdge 
//             key={`fg-edge-${i}`} 
//             start={edge.start} 
//             end={edge.end}
//             color="#2563eb"
//           />
//         ))}
//       </group>

//       {/* Background Graph */}
//       <group ref={backgroundGroupRef}>
//         <pointLight position={[-8, -8, -8]} intensity={0.2} color="#3b82f6" />
        
//         {/* Background nodes - smaller, same blue tone */}
//         {backgroundNodes.map((position, i) => (
//           <Sphere key={`bg-${i}`} position={position} args={[0.03, 12, 12]}>
//             <meshStandardMaterial 
//               color="#1d4ed8" 
//               emissive="#1d4ed8" 
//               emissiveIntensity={0.15}
//               transparent
//               opacity={0.7}
//             />
//           </Sphere>
//         ))}
        
//         {/* Background edges */}
//         {backgroundEdges.map((edge, i) => (
//           <Line
//             key={`bg-edge-${i}`}
//             points={[new THREE.Vector3(...edge.start), new THREE.Vector3(...edge.end)]}
//             color="#1e40af"
//             lineWidth={1}
//             transparent
//             opacity={0.5}
//           />
//         ))}
//       </group>
//     </>
//   );
// };

// interface GraphIntroProps {
//   onComplete: () => void;
// }

// const GraphIntro = ({ onComplete }: GraphIntroProps) => {
//   const [progress, setProgress] = useState(0);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       const interval = setInterval(() => {
//         setProgress(prev => {
//           const newProgress = prev + 0.02;
//           if (newProgress >= 1) {
//             clearInterval(interval);
//             setTimeout(onComplete, 500);
//             return 1;
//           }
//           return newProgress;
//         });
//       }, 50);

//       return () => clearInterval(interval);
//     }, 1000);

//     return () => clearTimeout(timer);
//   }, [onComplete]);

//   return (
//     <div className="fixed inset-0 z-50 bg-background">
//       <Canvas camera={{ position: [4, 3, 5], fov: 60 }}>
//         <GraphScene cameraProgress={progress} />
//       </Canvas>
      
//       {/* Progress indicator */}
//       <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
//         <div className="w-64 h-1 bg-surface rounded-full overflow-hidden">
//           <div 
//             className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
//             style={{ width: `${progress * 100}%` }}
//           />
//         </div>
//         <p className="text-center text-sm text-muted-foreground mt-4 font-jakarta">
//           Initializing graph neural network...
//         </p>
//       </div>
//     </div>
//   );
// };

// export default GraphIntro;