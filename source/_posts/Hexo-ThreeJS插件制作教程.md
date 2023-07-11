---
title: Hexo-ThreeJS插件制作教程
date: 2023-07-11
author: DannyJones
img: /medias/banner/0.jpg
top: true
hide: false
cover: true
coverImg: /medias/banner/0.jpg
password: 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
toc: true
mathjax: true
categories: 
  - normal
tags:
  - normal
---
  

> Hexo 有强大的插件系统，使您能轻松扩展功能而不用修改核心模块的源码。在 Hexo 中有两种形式的插件：

# 最小示例

- 使用npm init初始化一个插件环境

- 指定start script 为 index.js 并通过 hexo 的插件接口注入 插件

``` js

'use strict';

hexo.extend.filter.register('before_generate', function () {

    console.log("power by threejs make by dannyjones");

});

```

- 在hexo 的依赖项中添加插件

```json

{

  "dependencies": {

    "hexo-threejs": "1.0.0",

  }

}

```

# 制作Threejs插件

- 在上一步的基础上,参考此教程初始化Threejs

- index.js上添加ThreeJS的初始化内容

```js

const threejs = require('./lib/app.js')

hexo.extend.tag.register("threejs", (args) => {

    return threejs(args);

});

  

// 基础模板

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

module.exports = { threeTemplate }

```

> 展示效果如下

```text

{%

 threejs

 400

 300

 "scene.add(new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshLambertMaterial({

  color: 0xffff00,

 })))"

%}

```

{%

 threejs

 400

 300

 "scene.add(new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshLambertMaterial({

  color: 0xffff00,

 })))"

%}

# 一些坑

- Hexo 代码高亮插件的Bug [花括号显示为字符串‘&#123;’和‘&#125’ · Issue #61](https://github.com/ele828/hexo-prism-plugin/issues/61)

# 参考资料

- [插件 | Hexo](https://hexo.io/zh-cn/docs/plugins.html)

- [我的世界皮肤预览插件 | Hexo](https://github.com/D-Sketon/hexo-minecraft-skin-viewer)

- [Threejs初始化教程 | Threejs](<https://threejs.org/docs/index.html#manual/zh/introduction/Installation>)
