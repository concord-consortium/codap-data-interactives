class AudioFileManager {
    constructor(actx) {
        this.actx = actx ? actx : new (window.AudioContext || window.webkitAudioContext)();
        this.buffers = {};
    }

    addDataTransferFiles(files) {
        if (!files && files.constructor.name !== 'FileList') {
            return null;
        }

        let promises = [];

        Array.from(files).forEach(file => {
            let name = file.name;
            let type = file.type.split('/')[0];

            if (type === 'audio') {
                promises.push(new Promise(resolve => {
                    let reader = new FileReader();
                    reader.readAsArrayBuffer(file);
                    reader.onload = e => {
                        let arrayBuffer = e.target.result;
                        this.actx.decodeAudioData(arrayBuffer, buffer => {
                            this.buffers[name] = buffer;
                            resolve();
                        });
                    };
                }));
            }
        });

        return Promise.all(promises);
    }

    removeFiles() {
        this.buffers = {};
    }
}