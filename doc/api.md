## 初始条件定义

通过构造函数直接传入相关参数，控制 touch 或者 orientation 的控制效果。

```
new VRPlayer({
        player: {
            url: './003.mp4'
        },
        view:{
            fovFar: 1100,
            radius: 500,
            latRange: 85,
            touchYSens: 0.3, // [0.3,1.2]
            touchXSens: 0.5 // [0.5,1.5]
        },
        container:document.getElementById('container')
    });
```

### player 基本参数

```
interface player: VRPlayer{
    essential attribute DOMString url;
    attribute DOMString crossOrigin;
    attribute boolean muted;
    attribute boolean loop;
    attribute boolean autoplay;
    attribute array x5;
}
```

 - url: 获取视频资源的链接
 - crossOrigin: 'anonymous'|| 'use-credentials'
    - anonymous: 对于跨域请求不发送 cookie 等相关内容。
    - use-credentials: 对于跨域请求发送 cookie 等相关内容。
 - muted: 静音设置
 - loop: 循环播放
 - autoplay:自动播放设置
 - x5: 针对 X5 内核的相关属性设置


### view 


```
interface view: VRPlayer{
    attribute boolean touch;
    attribute boolean orientation;
    attribute number aspect;
    attribute number devicePixelRatio;
    attribute number fov;
    attribute number fovNear;
    attribute number fovFar;
    attribute number radius;
    attribute number width;
    attribute number height;
    attribute number widthSeg;
    attribute number heightSeg;
    attribute number touchYSens;
    attribute number touchXSens;
    attribute number betaSens;
    attribute number gammaSens;
    attribute number alphaSens;
}

```

 - touch: 开启 touch 控制选项
 - orientation: 开启陀螺仪选项
 - aspect: canvas 长宽比
 - devicePixelRatio: 针对屏幕的 DPI 设置
 - fov/fovNear/fovFar: 相机基础设置参数
 - widthSeg/heightSeg: 观看视频的光滑度
 - width/height: 渲染出来 canvas 的宽高
 - xxxSens: 指定操作的灵敏度控制
 

### container

指定特定的 DOM 节点用来添加 canvas。

```
interface container: VRPlayer{
    attribute DOMElement;
}
```

## VRPlayer prototype

```
interface prototype: VRPlayer{
    readonly attribute canvas;
    readonly attribute video;
             attribute lat;
             attribute lon;
             attribute src;
             attribute betaSens;
             attribute gammaSens;
             attribute touchYSens;
             attribute touchXSens;
    static   attribute isSupported;
    void play();
    void pause();
    void on(eventName,fn);
    void addEventListener(eventName,fn);
    void bind(eventName,fn);
}
```

 - canvas: 返回 canvas 的 DOM 元素
 - video: 返回实际播放的 video 元素
 - lat: 当前全景的维度
 - lon: 当前全景的经度
 - src: 实际播放 vidoe 的 src
 - xxxSens:指定操作的灵敏度控制
 - isSupported: 检测当前库是否可用
 - play(): 视频播放
 - pause(): 视频暂停
 - on/addEventListener/bind：给 video 添加回调事件

