export const getPosition = (event) => {
    let {touches} = event;

    // PC casese
    if(typeof event.pageX === 'number'){
        return [{
            x:event.pageX,
            y:event.pageY
        }]
    }

    if (touches.length <= 0) {
        console.warn('there is no finger on the screen, ', event.touches);
        return [];
    }

    let posArr = [];
    for (var touch of touches) {
        posArr.push({x: touch.pageX, y: touch.pageY})
    }

    return posArr;

}

export const getOffset = (ele)=>{
    let DOM = document.body || document.documentElement,
        container = ele.getBoundingClientRect();

    return {
        top: container.top + (window.pageYOffset || DOM.scrollTop) - (DOM.clientTop || 0),
        left: container.left + (window.pageXOffset || DOM.scrollLeft) - (DOM.clientLeft || 0)
    }

}
