import VRPlayer from '../src';


window.onload = function () {

    let panorama = new VRPlayer({
        player: {
            url: '/test/003.mp4'
        },
        container:document.getElementById('container')
    });

    panorama.canvas.addEventListener('click',function(){
        console.log('play');
        panorama.play();
    },false);



    /**
     * @name case 1: change the video.src
     */
    // setTimeout(function() {
    //     panorama.src = '/test/surf1.mp4';
    // }, 300);

    /**
     * @name case 2: add some event listener
     */
    // panorama.on('pause',event=>{
    //     console.log('pause trigger', event);
    // });
    // setTimeout(function() {
    //     panorama.pause();    
    // }, 200);
    

}