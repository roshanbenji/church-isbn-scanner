// js/scanner.js

/**
 * Initializes and starts the Quagga scanner.
 * @param {Function} onDetectedCallback - Function to call when a barcode is detected.
 */
function initQuagga(onDetectedCallback) {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#reader'),
            constraints: {
                width: { min: 1280 },
                height: { min: 720 },
                facingMode: "environment", // Use back camera
                aspectRatio: { min: 1, max: 2 }
            },
            area: { // defines rectangle of the detection/localization area
                top: "25%",    // top offset
                right: "10%",  // right offset
                bottom: "25%", // bottom offset
                left: "10%"    // left offset
            }
        },
        locator: {
            patchSize: "medium",
            halfSample: false // Force full resolution for better accuracy
        },
        numOfWorkers: 2,
        frequency: 10,
        decoder: {
            readers: ["ean_reader"] // standard for books
        },
        locate: true // Find barcode location in image
    }, function (err) {
        if (err) {
            console.log(err);
            document.querySelector('#reader').innerHTML = `<p style="color:red; text-align:center; padding:20px;">Error starting camera: ${err}</p>`;
            return;
        }
        console.log("Initialization finished. Ready to start");
        Quagga.start();
    });

    // Visual feedback
    Quagga.onProcessed(function (result) {
        var drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                result.boxes.filter(function (box) {
                    return box !== result.box;
                }).forEach(function (box) {
                    Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
                });
            }

            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
            }

            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
            }
        }
    });

    // Successful detection
    Quagga.onDetected(function (result) {
        var code = result.codeResult.code;
        if (code) {
            onDetectedCallback(code);
        }
    });
}

/**
 * Stops the Quagga scanner.
 */
function stopScanner() {
    Quagga.stop();
}
