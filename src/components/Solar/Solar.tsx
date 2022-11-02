import styles from './Solar.module.scss';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as CANNON from 'cannon-es';
import Gravity from '../Gravity';
import { addLenseFlare } from './utils';

const Solar = () => {
	const rendererRef = useRef(null);

	const handleResize = (renderer: THREE.WebGLRenderer) => {
		renderer.setSize(window.innerWidth, window.innerHeight);
	};

	useEffect(() => {
		const canvas = rendererRef.current;

		const setup = async () => {
			const res = await fetch('api/getData');
			const blobbed = await res.blob();
			const { names, distance, mass, diameter, velocity } = JSON.parse(await blobbed.text());

			const skybox = new THREE.Mesh(
				new THREE.SphereGeometry(5000, 10, 10),
				new THREE.MeshBasicMaterial({
					map: new THREE.TextureLoader().load('/starmap_random_2020_4k.png'),
					side: THREE.BackSide,
				})
			);

			// ------------------cannon-es------------
			const world = new CANNON.World(); // space
			const sphereBodies: CANNON.Body[] = [];
			const sphereMeshes: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>[] = [];
			const lightSources: THREE.PointLight[] = [];
			const sphereMaterials: THREE.MeshStandardMaterial[] = [];

			for (let i = 0; i < names.length; i++) {
				const sphereBody = new CANNON.Body({
					mass: mass[i] * 10e6, // kg 10e24
					shape: new CANNON.Sphere(Math.log(diameter[i]) * 0.02),
				});
				sphereBody.collisionResponse = true;
				// work in x plane for now, could look at the true paths a bit later
				sphereBody.velocity = new CANNON.Vec3(0, 0, Math.pow(-1, i) * velocity[i] * 0.001);
				sphereBody.position.set(Math.pow(-1, i) * distance[i] * 10e-9, 0, 0);
				sphereBody.torque = new CANNON.Vec3(0, 10e11, 0);

				// const geometry = new THREE.SphereGeometry(0.25);
				const geometry = new THREE.SphereGeometry(Math.log(diameter[i]) * 0.02);
				const texture = new THREE.TextureLoader().load(`${names[i]}.jpg`);
				const material = new THREE.MeshStandardMaterial({ map: texture });
				if (i !== 8) {
					const sphereMesh = new THREE.Mesh(geometry, material);
					sphereMesh.castShadow = true;
					sphereMesh.receiveShadow = true;

					world.addBody(sphereBody);
					sphereMeshes.push(sphereMesh);
				} else {
					const lightSource = new THREE.PointLight(0xffee88, 1, 1000);
					lightSource.shadow.camera.near = 0.1;
					lightSource.add(new THREE.Mesh(geometry));
					lightSource.castShadow = true;
					// lightSource.receiveShadow = false;

					lightSource.shadow.radius = 10;
					lightSources.push(lightSource);
				}

				sphereMaterials.push(material);
				sphereBodies.push(sphereBody);
			}

			// Applying gravity between all spheres by manually adding springs...
			// Go through each one
			const springs: CANNON.Spring[] = [];
			for (let i = 0; i < names.length; i++) {
				const j = 8;
				if (i !== j) {
					const spring = new Gravity(sphereBodies[i], sphereBodies[j]);
					springs.push(spring);
				}
				// }
			}

			// Compute the force after each step
			world.addEventListener('postStep', () => {
				springs.map((spring) => {
					spring.applyForce();
				});
			});

			if (canvas !== null) {
				// ------------camera set up-----------------
				const camera = new THREE.PerspectiveCamera(
					60,
					window.innerWidth / window.innerHeight,
					0.01,
					10000
				);
				camera.position.set(8.5, 5, 1);

				const scene = new THREE.Scene();

				// lensflares
				addLenseFlare(0.55, 0.9, 0.5, 0, 0, 0, scene);
				addLenseFlare(0.08, 0.8, 0.5, 0, 0, 0, scene);
				addLenseFlare(0.995, 0.5, 0.9, 0, 0, 0, scene);

				scene.add(skybox);

				sphereMeshes.map((sphereMesh) => {
					scene.add(sphereMesh);
				});
				// light stuff
				scene.add(lightSources[0]);

				const renderer = new THREE.WebGLRenderer({ canvas: canvas });
				renderer.setPixelRatio(window.devicePixelRatio);
				renderer.setSize(window.innerWidth, window.innerHeight);
				renderer.shadowMap.enabled = true;
				renderer.physicallyCorrectLights = true;
				renderer.outputEncoding = THREE.sRGBEncoding;

				window.addEventListener('resize', () => handleResize(renderer));

				const controls = new OrbitControls(camera, renderer.domElement);
				controls.minDistance = -2000;
				controls.maxDistance = 2000;
				// controls.autoRotate = true;

				// LOOP FUNCTION
				const animate: FrameRequestCallback = () => {
					renderer.toneMappingExposure = Math.pow(1, 5.0); // to allow for very bright scenes.
					renderer.shadowMap.enabled = true;
					sphereMeshes.map((sphereMesh, idx) => {
						sphereMesh.position.copy(
							new THREE.Vector3(...sphereBodies[idx].position.toArray())
						);
						sphereMesh.quaternion.copy(
							new THREE.Quaternion(...sphereBodies[idx].quaternion.toArray())
						);
					});

					// light stuff
					sphereMaterials.map((material) => {
						material.needsUpdate = true;
					});
					lightSources[0].power = 100;
					// bulbMats[0].emissiveIntensity = lightSources[0].intensity / Math.pow(0.02, 2.0);
					lightSources[0].position.set(0, 0, 0);

					controls.update();
					renderer.render(scene, camera);

					// world.fixedStep();
					world.step(0.0001);
					requestAnimationFrame(animate);
				};
				// initiate first call to animation loop
				animate(0);
			}
		};
		setup();
	}, []);

	return (
		<div className={styles.container}>
			<canvas ref={rendererRef} className={styles.canvas} />
		</div>
	);
};

export default Solar;
