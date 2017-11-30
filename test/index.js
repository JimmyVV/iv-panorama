import VRPlayer from '../src';


window.onload = function () {

    let panorama = new VRPlayer({
        player: {
            url: '/test/003.mp4'
        },
        container:document.getElementById('container')
    });



}