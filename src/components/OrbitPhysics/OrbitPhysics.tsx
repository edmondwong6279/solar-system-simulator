/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import styles from './OrbitPhysics.module.scss';
import * as THREE from 'three';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';
import * as CANNON from 'cannon-es';
import Gravity from '../Gravity';

export type OrbitProps = {
	setLoading: Dispatch<SetStateAction<boolean>>;
};

const OrbitPhysics: React.ComponentType<OrbitProps> = () => {
	const fly = false;
	const showGrid = false;
	const rendererRef = useRef(null);
	const clock = new THREE.Clock();

	const handleResize = (renderer: THREE.WebGLRenderer) => {
		renderer.setSize(window.innerWidth, window.innerHeight);
	};

	useEffect(() => {
		const canvas = rendererRef.current;

		const setup = async () => {
			// ------------------cannon-es------------
			// const world = new CANNON.World({
			// 	gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
			// });
			const world = new CANNON.World(); // space init

			// Set up physics of a particular body
			const radius = 1; // m
			const numBodies = 200;
			const bound = 300;
			const velBound = 1;
			const scale = 10;

			const sphereBodies: CANNON.Body[] = [];
			const sphereMeshes: THREE.Mesh<THREE.SphereGeometry, THREE.MeshNormalMaterial>[] = [];

			for (let i = 0; i < numBodies; i++) {
				const sphereBody = new CANNON.Body({
					mass: (Math.random() + 100000) * scale, // kg
					shape: new CANNON.Sphere(radius),
				});
				sphereBody.velocity = new CANNON.Vec3(
					(Math.random() * velBound - velBound / 2) * scale,
					(Math.random() * velBound - velBound / 2) * scale,
					(Math.random() * velBound - velBound / 2) * scale
				);
				sphereBody.position.set(
					Math.random() * bound - bound / 2,
					Math.random() * bound - bound / 2,
					Math.random() * bound - bound / 2
				);

				const geometry = new THREE.SphereGeometry(radius);
				const material = new THREE.MeshNormalMaterial();
				const sphereMesh = new THREE.Mesh(geometry, material);

				world.addBody(sphereBody);

				sphereMeshes.push(sphereMesh);
				sphereBodies.push(sphereBody);
			}

			// Applying gravity between all spheres by manually adding springs...
			// Go through each one
			const springs: CANNON.Spring[] = [];
			for (let i = 0; i < numBodies; i++) {
				for (let j = 0; j < numBodies; j++) {
					if (i !== j) {
						const spring = new Gravity(sphereBodies[i], sphereBodies[j], {
							scale: 1000000,
						});
						springs.push(spring);
					}
				}
			}

			// Compute the force after each step
			world.addEventListener('postStep', () => {
				springs.map((spring) => {
					spring.applyForce();
				});
			});

			// ---------------------------------------

			if (canvas !== null) {
				// ------------camera set up-----------------
				const camera = new THREE.PerspectiveCamera(
					60,
					window.innerWidth / window.innerHeight,
					0.01,
					10000
				);
				camera.position.set(700, 700, 0);

				const scene = new THREE.Scene();

				sphereMeshes.map((sphereMesh) => {
					scene.add(sphereMesh);
				});

				const geometry = new THREE.SphereBufferGeometry(1000, 36, 18);
				const material = new THREE.MeshBasicMaterial({
					color: 0xc0c0c0,
					wireframe: true,
					opacity: 0.3,
				});

				const sphere = new THREE.Mesh(geometry, material);
				if (showGrid) {
					scene.add(sphere);
				}

				const renderer = new THREE.WebGLRenderer({ canvas: canvas });
				renderer.setPixelRatio(window.devicePixelRatio);
				renderer.setSize(window.innerWidth, window.innerHeight);

				window.addEventListener('resize', () => handleResize(renderer));

				let controls: FlyControls | OrbitControls;

				if (fly) {
					controls = new FlyControls(camera, renderer.domElement);
					controls.movementSpeed = 1000;
					controls.domElement = renderer.domElement;
					controls.rollSpeed = Math.PI / 24;
					controls.autoForward = false;
					controls.dragToLook = false;
				} else {
					controls = new OrbitControls(camera, renderer.domElement);
					// controls.autoRotate = true;
				}

				const animate: FrameRequestCallback = () => {
					// time is in ms
					requestAnimationFrame(animate);
					renderer.render(scene, camera);
					// console.log(time / 1000);
					sphereMeshes.map((sphereMesh, idx) => {
						sphereMesh.position.copy(
							new THREE.Vector3(...sphereBodies[idx].position.toArray())
						);
						sphereMesh.quaternion.copy(
							new THREE.Quaternion(...sphereBodies[idx].quaternion.toArray())
						);
					});

					if (controls instanceof FlyControls) {
						controls.movementSpeed = 100;
						controls.update(clock.getDelta());
					} else {
						controls.update();
					}

					world.fixedStep();
				};
				// initiate first call to animation loop
				animate(0);
			}
		};
		setup();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className={styles.container}>
			<canvas ref={rendererRef} className={styles.canvas} />
		</div>
	);
};

export default OrbitPhysics;
