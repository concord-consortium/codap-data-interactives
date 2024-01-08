class CodapDragHandler {
    constructor(className='drop-area') {
        window.addEventListener('message', this.eventListener.bind(this));
        this.className = className;

        this.isDragInProgress = false;
        this.isInIframe = false;
        this.isInDropArea = false;
        this.lastDropAreas = null;

        // Holds the user-defined callbacks.
        this.callback = {};

        // Container methods
        this.ondragenter = (data, els) => {
            if (this.callback.enter && typeof(this.callback.enter) === 'function') {
                this.callback.enter(data, els);
            }
        };
        this.ondragleave = (data, els) => {
            if (this.callback.leave && typeof(this.callback.leave) === 'function') {
                this.callback.leave(data, els);
            }
        };
        this.ondragover = (data, els, position) => {
            if (this.callback.over && typeof(this.callback.over) === 'function') {
                this.callback.over(data, els, position);
            }
        };
        this.ondrop = (data, els) => {
            if (this.callback.drop && typeof(this.callback.drop) === 'function') {
                this.callback.drop(data, els);
            }
        };
        this.ondragstart = (data, els) => {
            if (this.callback.start && typeof(this.callback.start) === 'function') {
                this.callback.start(data, els);
            }
        };
        this.ondragend = (data, els) => {
            if (this.callback.end && typeof(this.callback.end) === 'function') {
                this.callback.end(data, els);
            }
        };
        this.ondragenterframe = (data, els) => {
            if (this.callback.enterframe && typeof(this.callback.enterframe) === 'function') {
                this.callback.enterframe(data, els);
            }
        };
        this.ondragleaveframe = (data, els) => {
            if (this.callback.leaveframe && typeof(this.callback.leaveframe) === 'function') {
                this.callback.leaveframe(data, els);
            }
        };
    }

    destroy() {
        window.removeEventListener('message', this.eventListener.bind(this));
    }

    eventListener(e) {
        let data = e.data;

        // Always require message fields called "action" and "values."
        if (!data.action || !data.values) {
            return null;
        }

        if (['dragstart', 'dragend'].indexOf(data.action) !== -1) {
            // Signifies that a drag has started somewhere in CODAP.
            this.isDragInProgress = data.action === 'dragstart';
            let dropAreaEls = Array.from(document.getElementsByClassName(this.className));

            // Notify the plugin window globally.
            if (data.action === 'dragstart') {
                this.ondragstart(data.values, dropAreaEls);
            } else {
                this.ondragend(data.values, dropAreaEls);
            }
        } else if (['dragenter', 'dragleave'].indexOf(data.action) !== -1) {
            // Signifies that drag has entered / exited from the iFrame boundary.
            this.isInIframe = data.action === 'dragstart';
            let dropAreaEls = Array.from(document.getElementsByClassName(this.className));

            // Note: This is not the "dragenter" event generated for drop-target elements, but is for the iframe window.
            if (data.action === 'dragenter') {
                this.ondragenterframe(data.values, dropAreaEls);
            } else {
                this.ondragleaveframe(data.values, dropAreaEls);
            }
        } else {
            let x = data.position && data.position.x;
            let y = data.position && data.position.y;

            if (x && y) {
                let els = document.elementsFromPoint(x, y);

                let isInDropArea = els.some(el => {
                    return el.className === this.className;
                });

                if (data.action === 'drag') {
                    // Conditional for drag enter and leave.
                    if (this.isInDropArea !== isInDropArea) {
                        if (isInDropArea) {
                            this.ondragenter(data.values, this.lastDropAreas = els.filter(el => el.className === this.className));
                        } else {
                            this.ondragleave(data.values, this.lastDropAreas);
                        }
                        this.isInDropArea = isInDropArea;
                    } else if (isInDropArea) {
                        this.ondragover(data.values, els.filter(el => el.className === this.className), data.position);
                    }
                } else if (data.action === 'drop') {
                    if (isInDropArea) {
                        this.ondrop(data.values, els.filter(el => el.className === this.className));
                    }
                    this.isInDropArea = false;
                    this.isInIframe = false;
                    this.isDragInProgress = false;
                }
            }
        }
    }

    // TODO: use setter / getter
    setClassName(className) {
        this.className = className;
    }

    on(action, callback) {
        switch (action) {
            default:
                break;
            case 'dragenter':
                this.callback.enter = callback;
                break;
            case 'dragleave':
                this.callback.leave = callback;
                break;
            case 'dragover':
                this.callback.over = callback;
                break;
            case 'drop':
                this.callback.drop = callback;
                break;
            case 'dragstart':
                this.callback.start = callback;
                break;
            case 'dragend':
                this.callback.end = callback;
                break;
            case 'dragenterframe':
                this.callback.enterframe = callback;
                break;
            case 'dragleaveframe':
                this.callback.leaveframe = callback;
                break;
        }
    }
}