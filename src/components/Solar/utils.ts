import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';
import * as THREE from 'three';

export const addLenseFlare = (
	h: number,
	s: number,
	l: number,
	x: number,
	y: number,
	z: number,
	scene: THREE.Scene
) => {
	const light = new THREE.PointLight(0xffffff, 1.5, 2000);
	light.color.setHSL(h, s, l);
	light.position.set(x, y, z);
	scene.add(light);

	const lensflare = new Lensflare();
	const textureLoader = new THREE.TextureLoader();

	const textureFlare0 = textureLoader.load('/lensflare0.png');
	const textureFlare3 = textureLoader.load('/lensflare3.png');
	lensflare.addElement(new LensflareElement(textureFlare0, 700, 0, light.color));
	lensflare.addElement(new LensflareElement(textureFlare3, 60, 0.6));
	lensflare.addElement(new LensflareElement(textureFlare3, 70, 0.7));
	lensflare.addElement(new LensflareElement(textureFlare3, 120, 0.9));
	lensflare.addElement(new LensflareElement(textureFlare3, 70, 1));
	light.add(lensflare);
};
