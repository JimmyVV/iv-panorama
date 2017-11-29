import Mitt from 'mitt';

class OrientationControl {
    constructor() {
        window.addEventListener('deviceorientation', this._control.bind(this), false);

        this._emitter = new Mitt();

        this._deviceProp = {
            start: {},
            first: true
        }
    }
    get isSupport() {
        return !!window.DeviceOrientationEvent;
    }
    _control(e) {
        let {alpha, beta, gamma, absolute} = e;

        let prop = this._deviceProp;

        if (prop.first) {
            prop.start = {
                alpha,
                beta,
                gamma,
                absolute
            }
            prop.first = false;
            return;
        }



        let EventObj = {
            event: e,
            delta: {
                alpha: this.diffRange(alpha, prop.start.alpha, 'alpha'),
                beta: this.diffRange(beta, prop.start.beta, 'beta'),
                gamma: this.diffRange(gamma, prop.start.gamma, 'gamma')
            },
            angle: {
                alpha,
                beta,
                gamma,
                absolute
            }
        }

        this
            ._emitter
            .emit('move', EventObj);

        prop.start = {
            alpha,
            beta,
            gamma,
            absolute
        }

    }
    diffRange(end, start, type) {
        let range;

        switch (type) {
            case "alpha":
                range = 180;
                break;
            case "beta":
                range = 180;
                break;
            case "gamma":
                range = 90;
                break;
        }

        let res = end - start;

        if (Math.abs(res) > range) {
            if (res > 0) {
                res = 2 * range - res;
            } else {
                res += 2 * range;
            }
        }

        return res;
    }
    on(name, fn) {
        switch (name) {
            case 'move':
                this
                    ._emitter
                    .on(name, fn);
                break;
            default:
                console.warn('invalid eventName, ', name);
                this
                    ._emitter
                    .on(name, fn);
        }
    }
    bind(...args) {
        this.on(...args);
    }
    addEventListener(...args) {
        this.on(...args);
    }
    move(fn) {
        this
            ._emitter
            .on('move', fn)
    }
}

export default OrientationControl;