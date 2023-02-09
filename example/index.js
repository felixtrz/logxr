import * as THREE from 'three';

import { BUTTONS, GamepadWrapper } from 'gamepad-wrapper';

import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRConsoleFactory } from 'logxr';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

let camera, scene, renderer, controller;

init();
animate();

function init() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x505050);

	camera = new THREE.PerspectiveCamera(
		50,
		window.innerWidth / window.innerHeight,
		0.1,
		10,
	);
	camera.position.set(0, 1.6, 3);

	const room = new THREE.LineSegments(
		new BoxLineGeometry(6, 6, 6, 10, 10, 10),
		new THREE.LineBasicMaterial({ color: 0x808080 }),
	);
	room.geometry.translate(0, 3, 0);
	scene.add(room);

	scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

	const light = new THREE.DirectionalLight(0xffffff);
	light.position.set(1, 1, 1).normalize();
	scene.add(light);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.xr.enabled = true;
	renderer.xr.setFoveation(0);
	document.body.appendChild(renderer.domElement);

	document.body.appendChild(VRButton.createButton(renderer));

	controller = renderer.xr.getController(0);
	controller.addEventListener('connected', function (event) {
		setupXRConsole(this);
		this.gamepadWrapper = new GamepadWrapper(event.data.gamepad);
	});
	controller.addEventListener('disconnected', function () {
		this.remove(this.children[0]);
		this.gamepadWrapper = null;
	});
	scene.add(controller);

	const controllerModelFactory = new XRControllerModelFactory();

	const controllerGrip = renderer.xr.getControllerGrip(0);
	controllerGrip.add(
		controllerModelFactory.createControllerModel(controllerGrip),
	);
	scene.add(controllerGrip);

	window.addEventListener('resize', onWindowResize);
}

function setupXRConsole(controller) {
	const xrConsole = XRConsoleFactory.getInstance().createConsole({
		pixelHeight: 512,
		pixelWidth: 1024,
		actualHeight: 0.25,
		actualWidth: 0.5,
		fontSize: 24,
	});
	controller.add(xrConsole);
	xrConsole.position.set(0, 0.2, 0);
	console.log('Welcome to the XR Console!');
	console.log('This is what console.log looks like');
	console.warn('This is what console.warn looks like');
	console.error('This is what console.error looks like');
	console.log(
		'You can press trigger to log something, or press the grip button to clear the console',
	);
}

function updateController(controller) {
	if (controller.gamepadWrapper) {
		controller.gamepadWrapper.update();
		if (controller.gamepadWrapper.getButtonClick(BUTTONS.XR_STANDARD.TRIGGER)) {
			console.log('this is a log from the trigger button');
		}
		if (controller.gamepadWrapper.getButtonClick(BUTTONS.XR_STANDARD.SQUEEZE)) {
			console.clear();
			console.warn('Console cleared');
		}
	}
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	renderer.setAnimationLoop(render);
}

function render() {
	updateController(controller);
	renderer.render(scene, camera);
}
