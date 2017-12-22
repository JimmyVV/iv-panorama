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
            touchYSens: 0.3, // [0.3,1.2]
            touchXSens: 0.5, // [0.5,1.5]
            betaSens: 0.8, // the range is between 0.3 and 1, move vertically ( portrait )
            gammaSens: 0.8, // the range is between 0.3 and 1.4, move horizontally ( landscape )
            alphaSens:0.8
        }

        this._player = {
            url:'',
            crossOrigin: 'anonymous',
            muted: false,
            loop: true,
            autoplay: true,
            x5: ['webkit-playsinline', 'playsinline']
        }

        this._picture = {
            url:'',
            crossOrigin: 'anonymous',
        }

        this._mode = 'video';

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
        this._textureLoader;
        this._material;
        this._mesh;
        this._renderer;
        this._RAF; // requestAnimationFrame control

        // the video element
        this._video;
        this._image;

        // touchControl
        this._touchControl;
        // orientationControl 
        this._orient;

        this._init(settings);
    }
    _bindOrientation() {
        this._orient = new OrientationControl();

        this._orient.move(e => {
            let {
                event,
                delta
            } = e, {
                beta, // for latitude
                gamma,// for lontitude
                alpha
            } = delta, {
                lat,
                lon,
                latRange
            } = this._3D, {
                betaSens,
                gammaSens
            } = this._view;

            lat -= beta * betaSens;
            lon += gamma * gammaSens;

            this._3D.lat = Math.max(-latRange, Math.min(latRange, lat));
            this._3D.lon = lon;


        })

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

                this._3D.lat = Math.max(-latRange, Math.min(latRange, lat));
                this._3D.lon = lon;

            }

        })


    }
    _init(settings) {
        let {
            container,
            view,
            image,
            player
        } = settings;

        // VRplayer only accept one of player and image params
        if(player){
            Object.assign(this._player, player);
            this._mode = 'video';
        }else if(image){
            Object.assign(this._picture, image);
            this._mode = 'image';
        }
        // overide default param using external param
        Object.assign(this._view, view);
        
        this._container = container;

        if (!this._player.url && !this._picture.url) {
            console.warn("missing <url> field-- ", url);
            return;
        }

        this._mode === 'video' && this._initVideo();
        
        this._initCanvas();

        if (this._view.touch) {
            this._bindTouch();
        }

        if (this._view.orientation) {
            this._bindOrientation();
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
            textureLoader,
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
        if(this._mode === 'video'){
            texture = new THREE.VideoTexture(this._video);
        }else{
            textureLoader = new THREE.TextureLoader();
            texture = textureLoader.load(this._picture.url);
            
        }

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
        this._textureLoader = textureLoader;
        this._material = material;
        this._mesh = mesh;
        this._renderer = renderer;

        this._container && this._container.appendChild(renderer.domElement);

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

        phi = THREE.Math.degToRad(90 - lat);
        theta = THREE.Math.degToRad(-lon);

        camera.position.x = distance * Math.sin(phi) * Math.cos(theta);
        camera.position.y = distance * Math.cos(phi);
        camera.position.z = distance * Math.sin(phi) * Math.sin(theta);
        camera.lookAt(camera.target);

        renderer.render(this._scene, camera);

    }

    /**
     * @description if you wanna control the panorama rotation yourself 
     *              just directly set the lat and lon values
     */
    set lat(value){
        let latRange = this._3D.latRange;
        this._3D.lat = Math.max(-latRange, Math.min(latRange, value));
    }
    get lat(){
        return this._3D.lat;
    }
    set lon(value){
        this._3D.lon = lon;
    }
    get lon(){
        return this._3D.lon;
    }
    get canvas(){
        return this._canvas;
    }
    get video(){
        return this._video;
    }
    /**
     * @description add the video action, like:
     *              play, pause, change the video.src
     */
    play(){
        this._video && this._video.play();
    }
    pause(){
        this._video && this._video.pause();
    }
    set src(url){
        if(this._mode === 'video') 
            this._video.src = url;
        else 
            this._textureLoader.load(url,texture=>{
                texture.minFilter = THREE.LinearFilter;
                texture.format = THREE.RGBFormat;  
                this._material.map = texture;
            });
    }

    on(event,fn){
        this._video && this._video.addEventListener(event,fn,false);
    }
    addEventListener(...args){
        this.on(...args);
    }
    bind(...args){
        this.on(...args);
    }
    /**
     * the beta sensitivity range is 0.3 to 1
     */
    set betaSens(value){
        this._view.betaSens = Math.max(0.3,Math.min(1,value));
    }
    get betaSens(){
        return this._view.betaSens;
    }
    /**
     * the gamma sensitivity range is 0.3 to 1.5
     */
    set gammaSens(value){
        this._view.gammaSens = Math.max(0.3,Math.min(1.5,value));
    }
    get gammaSens(){
        return this._view.gammaSens;
    }
    /**
     * the touchY sensitivity range is 0.3 to 1.2
     */
    set touchYSens(value){
        this._view.touchYSens = Math.max(0.3,Math.min(1.2,value));
    }
    get touchYSens(){
        return this._view.touchYSens;
    }
    /**
     * the touchX sensitivity range is 0.3 to 1.5
     */
    set touchXSens(value){
        this._view.touchXSens = Math.max(0.3,Math.min(1.5,value));
    }
    get touchXSens(){
        return this._view.touchXSens;
    }
    get check() {
        return detector.webgl && window.THREE;
    }
    static isSupported() {
        return detector.webgl && window.THREE;
    }
}

export default VRPlayer;