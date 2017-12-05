## 简介

![Travis](https://img.shields.io/travis/rust-lang/rust.svg)
![license](https://img.shields.io/badge/license-APACHE-blue.svg)

现在随着宽带的降费提速，用户对于需要高网速、高流量的应用适应越来越强。现在 VR 也随着设备的普及慢慢进入大众，但是一个在线的 VR 应用对流量的要求也远远超过目前的运营商能提供的网速上限，特别是一些 VR 视频大户，常常推出的视频就是 10K 的大小。

现在 Web 对 VR 支持度也不是特别友好，但是，对于全景视频来说，在机器换代更新的前提下，全景在性能方面的瓶颈慢慢消失了。所以，基于此情况，该项目专门针对 720° 全景视频而开发。

## 特性

 - 依赖于 Three.js，需要预先挂载到 window 对象上
 - 灵活配置，内置支持陀螺仪和 touch 控制。
 - 支持灵敏度参数的动态调整
 - 使用 ES6 语法
 - 兼容 React，jQuery 

## 安装

腾讯内部开发者，使用 `tnpm` 进行下载：

```
tnpm install iv-panorama
```

外部开发者，直接通过 `npm` 下载：

```
npm install iv-panorama
```

## 使用方法

通过 `import` 导入模块，在实例化时，传入相关的参数定义。

```
import VRPlayer from '../src';

new VRPlayer({
        player: {
            url: '/test/003.mp4'
        },
        container:document.getElementById('container')
    });
```

## 文档

[API][1]


## 许可证

iv-panorama is under the Apache License. See the [LICENSE][2] file for details.


  [1]: tree/master/doc/api.md
  [2]: tree/master/LICENSE