import detector from 'lib/detector';
import {
    TouchFinger,
    OrientationControl
} from 'lib/repo';

class VRPlayer {
    constructor(settings) {

        if (!this.check) {
            console.warn('you browser don\'t support panoramic player');
            return false;
        }

        this._view = {
            devicePixelRatio: window.devicePixelRatio || 2,
            aspect: window.innerWidth / window.innerHeight || 0.6,
            fov: 75,
            fovNear: 1, // min field of view allowed
            fovFar: 1100,
            radius: 500,
            width: window.innerWidth,
            height: window.innerHeight,
            widthSeg: 60,
            heightSeg: 60,
            touch: true,
            orientation: true,
            latRange: 85,
            touchYSens: 0.3,
            touchXSens: 0.5
        }

        this._player = {
            crossOrigin: 'anonymous',
            muted: false,
            loop: true,
            autoplay: true,
            x5: ['webkit-playsinline', 'playsinline']
        }

        this._3D = {
            lon: 0, //  correspond to x
            lat: 0, //  correspond to y
            latRange: this._view.latRange,
            distance: this._view.radius || 500
        }

        // three 3d settings
        this._canvas;
        this._camera;
        this._scene;
        this._geometry;
        this._texture;
        this._material;
        this._mesh;
        this._renderer;
        this._RAF; // requestAnimationFrame control

        // the video element
        this._video;

        // touchControl
        this._touchControl;

        this._init(settings);
    }
    _bindTouch() {
        this._touchControl = new TouchFinger();

        this._touchControl.swipe(e => {
            let {
                event
            } = e;

            if (event.target === this._canvas) {
                let {
                    x,
                    y
                } = e, {
                    touchYSens,
                    touchXSens
                } = this._view, {
                    lat,
                    lon,
                    latRange
                } = this._3D;

                lat += y * touchYSens;
                lon += x * touchXSens;

                this._3D.lat = Math.max(-latRange,Math.min(latRange,lat));
                this._3D.lon = lon;

            }

        })


    }
    _init(settings) {
        let {
            url,
            container,
            view,
            player
        } = settings;
        player.url = url;

        // overide default param using external param
        Object.assign(this._view, view);
        Object.assign(this._player, player);

        if (!url) {
            console.warn("missing <url> field-- ", url);
            return;
        }

        this._initVideo();
        this._initCanvas();

        if (this._view.touch) {
            this._bindTouch();
        }

        if (this._view.orientation) {
            this._bindSensor();
        }
    }
    _initVideo() {
        let {
            crossOrigin,
            touch,
            orientation,
            loop,
            autoplay,
            url,
            muted,
            x5
        } = this._player;

        let video = document.createElement('video');

        video.loop = loop;
        video.muted = true;
        video.crossOrigin = crossOrigin;
        video.src = url;
        // some browser detect autoplay by tag, so if not autoplay, don't add tag at all
        // even setting autoplay = false.
        if (autoplay)
            video.autoplay = autoplay;

        // set X5's array prop
        if (x5 && x5.length) {
            for (var prop of x5) {
                video.setAttribute(prop, prop);
            }
        }

        this._video = video;

    }
    _initCanvas() {
        let camera,
            scene,
            geometry,
            texture,
            material,
            mesh,
            renderer;

        let {
            devicePixelRatio,
            aspect,
            fov,
            fovNear,
            fovFar,
            width,
            height,
            radius,
            widthSeg,
            heightSeg
        } = this._view;

        camera = new THREE.PerspectiveCamera(fov, aspect, fovNear, fovFar);
        camera.target = new THREE.Vector3(0, 0, 0);

        scene = new THREE.Scene();

        // add the geometry
        geometry = new THREE.SphereBufferGeometry(radius, widthSeg, heightSeg);
        geometry.scale(-1, 1, 1);

        // init the videoTexture
        texture = new THREE.VideoTexture(this._video);
        texture.minFilter = THREE.LinearFilter;
        texture.format = THREE.RGBFormat;

        // combine geometry with texture
        material = new THREE.MeshBasicMaterial({
            map: texture
        });

        // produce the geometry with color
        mesh = new THREE.Mesh(geometry, material);

        scene.add(mesh);

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(devicePixelRatio);
        renderer.setSize(width, height);

        // bind THREE canvas Element
        this._canvas = renderer.domElement;
        this._camera = camera;
        this._scene = scene;
        this._geometry = geometry;
        this._texture = texture;
        this._material = material;
        this._mesh = mesh;
        this._renderer = renderer;

        this._RAF = this._animate();

    }
    _animate() {
        this._RAF = requestAnimationFrame(this._animate.bind(this));

        let {
            lon,
            lat,
            latRange,
            distance
        } = this._3D;

        let camera = this._camera,
            renderer = this._renderer;

        let phi,
            theta;

        // remove the lat to the touch && orientation procedure
        // lat = Math.max(-latRange, Math.min(latRange, lat)); // limit the latitude range
        phi = THREE.Math.degToRad(90 - lat);
        theta = THREE.Math.degToRad(lon);

        camera.position.x = distance * Math.sin(phi) * Math.cos(theta);
        camera.position.y = distance * Math.cos(phi);
        camera.position.z = distance * Math.sin(phi) * Math.sin(theta);
        camera.lookAt(camera.target);

        renderer.render(scene, camera);

    }
    _bindSensor() {}
    get check() {
        return detector.webgl && window.THREE;
    }
    static isSupported(){
        return detector.webgl && window.THREE;
    }
}