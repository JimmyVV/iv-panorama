import {TOUCHEVENTS} from '../lib/constants';
import {getPosition, getOffset} from '../lib/utils';
import Mitt from 'mitt';

class TouchDetect {
    constructor() {

        TOUCHEVENTS.forEach(event => {
            document.addEventListener(event, this.touchControl.bind(this), false);
        })

        this._emitter = new Mitt();

        this._touchprop = {
            touchstart: false,
            startTime: null,
            startPos: [],
            movePos: [],
            offset: {
                top: null,
                left: null
            }
        };

    }
    touchControl(e) {
        let {target, type} = e;

        let touchprop = this._touchprop;


        switch (type) {
            case "touchstart":
            case "mousedown":
                touchprop.touchstart = true;
                touchprop.startTime = Date.now();
                touchprop.startPos = getPosition(e);
                touchprop.offset = getOffset(target);
                break;
            case 'touchmove':
            case 'mousemove':
                if (!touchprop.touchstart) 
                    return;
                
                touchprop.movePos = getPosition(e);

                // deal with geatures
                this._swipe(e);

                break;
            case 'touchend':
            case 'touchcancel':
            case 'mouseup':
            case 'mouseout':
                touchprop.touchstart = false;
                touchprop.startPos = touchprop.movePos = [];

        }
    }
    _swipe(e) {

        let touchprop = this._touchprop,
            digestTime = Date.now() - touchprop.startTime;

        let {movePos, startPos, offset} = touchprop;

        let EventObj = {
            event: e,
            position: {
                x: movePos[0].x - offset.left,
                y: movePos[0].y - offset.top
            },
            x: movePos[0].x - startPos[0].x,
            y: movePos[0].y - startPos[0].y,
            duration: digestTime
        }

        // trigger event

        this._emitter.emit('swipe',EventObj);

        touchprop.startPos = movePos.slice(); // next tick


    }
    on(name,fn){
        switch(name){
            case 'swipe':
                this._emitter.on(name,fn);
            break;
            default:
            console.warn('invalid eventName, ',name);
            this._emitter.on(name,fn);
        }
        
    }
    bind(...args){
        this.on(...args);
    }
    addEventListener(...args){
        this.on(...args);
    }
    swipe(fn){
        this._emitter.on('swipe',fn);
    }
}

export default TouchDetect;