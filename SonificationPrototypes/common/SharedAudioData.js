let value = new Float32Array(1);
value[0] = 0;

let actx = null;

onconnect = function (e) {
    var port = e.ports[0];

    port.addEventListener('message', e => {
        // var workerResult = 'Result: ' + (value++);
        // port.postMessage(workerResult);

        if (e.data === 'reqbuf') {
            port.postMessage(value, [value.buffer]);
        } else if (e.data.constructor.name === 'Float32Array') {
            value = e.data;
        } else {
            port.postMessage(e.data);
        }
        // port.postMessage(['retsab', sab]);
        // if (e.data[0] === 'reqsab') {
        //     port.postMessage(['retsab', sab]);
        // }
    });

    port.start();
};