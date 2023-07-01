'use strict';
const threeTemplate = ({ id, width, height, code }) => {
    return `
    <div style="margin:0 auto; width: ${width}px">
        <canvas data-engine="three.js r149" id="${id}"></canvas>
    </div>
    <script async src="https://unpkg.com/es-module-shims@1.3.6/dist/es-module-shims.js"></script>
    <script type="importmap">
        {
            "imports": {
                "three": "https://unpkg.com/three@latest/build/three.module.js",
                "three/addons/": "https://unpkg.com/three@latest/examples/jsm/"
            }
        }
    </script>
    <script type="module">
        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        let camera, scene, renderer, object, stats;
        function init(id, width, height) {
            //初始化场景
            scene = new THREE.Scene();
            //初始化相机
            camera = new THREE.PerspectiveCamera(36, width / height, 1, 100);
            camera.position.set(8, 8, 8);
            //初始化环境光
            scene.add(new THREE.AmbientLight(0xffffff, 0.5));
            //初始化方向光
            const dirLight = new THREE.DirectionalLight(0xffffff, 1);
            dirLight.position.set(5, 10, 7.5);
            dirLight.castShadow = true;
            dirLight.shadow.camera.right = 2;
            dirLight.shadow.camera.left = - 2;
            dirLight.shadow.camera.top = 2;
            dirLight.shadow.camera.bottom = - 2;
            dirLight.shadow.mapSize.width = 1024;
            dirLight.shadow.mapSize.height = 1024;
            scene.add(dirLight);
            //初始化渲染器
            renderer = new THREE.WebGLRenderer({
                antialias: true,
                canvas: document.getElementById(id)
            });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(width, height);
            renderer.setClearColor(0x263238);
            window.addEventListener('resize', onWindowResize);
            renderer.localClippingEnabled = false;
            function onWindowResize() {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.minDistance = 2;
            controls.maxDistance = 20;
            controls.update();
        }
        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        init('${id}', ${width}, ${height})
        animate()
        ${code}
    </script>
            `
}
const processArgs = (args) => {
    return {
        id: 'threejs' + ((Math.random() * 9999) | 0),
        width: args[0] || 300,
        height: args[1] || 400,
        code: args[2] || ""
    }
}
hexo.extend.tag.register("threejs", (args) => {
    console.log("threejs 插件加载完成!")
    return threeTemplate(processArgs(args));
});
