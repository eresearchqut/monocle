import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import QrScanner from 'qr-scanner';
import QrScannerWorkerPath from '!!file-loader!../../../../../node_modules/qr-scanner/qr-scanner-worker.min.js';
import { ToggleButton } from 'primereact/togglebutton';
import { Dropdown } from 'primereact/dropdown';

QrScanner.WORKER_PATH = QrScannerWorkerPath;

// Used only when video isn't started and we can't get the real aspect ratio
const DEFAULT_ASPECT_RATIO = 1.333333333333333333333333333;
// const DEFAULT_ASPECT_RATIO = 1.77777;

export interface ReactQRScannerProps {
    autoStartScanning?: boolean;
    fps?: number;
    onQRCodeScanned?: (qrCode: string) => void;
}

export const ReactQRScanner: FunctionComponent<ReactQRScannerProps> = ({
    fps = 30,
    autoStartScanning = true,
    onQRCodeScanned = (qrCode) => {
        console.log(`Scanned QR Code: ${qrCode}`);
    },
}: ReactQRScannerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const qrScannerRef = useRef<QrScanner | null>(null);
    const [availableCameras, setAvailableCameras] = useState<QrScanner.Camera[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<QrScanner.Camera | null>(null);
    const [lastQRCode, setLastQRCode] = useState<string | null>(null);
    // const [scanRegion, setScanRegion] = useState<QrScanner.ScanRegion | null>(null);
    const scanRegionRef = useRef<QrScanner.ScanRegion | null>(null);
    const aspectRatioRef = useRef<number>(DEFAULT_ASPECT_RATIO);
    const scaleFactorRef = useRef<number>(1);

    const [isStopped, setIsStopped] = useState<boolean>(!autoStartScanning);
    const isStoppedRef = useRef<boolean>(!autoStartScanning);

    const isInitialised = useRef<boolean>(false);

    const { width, height, ref: containerRef } = useResizeDetector();

    async function initQrScanner(video: HTMLVideoElement) {
        console.log('init', qrScannerRef.current);
        qrScannerRef.current = new QrScanner(video, onScanned, onScanError, calculateVideoScanRegion);
        qrScannerRef.current?.setInversionMode('both');

        function availableWidth() {
            const parentNode = videoRef.current?.parentNode?.parentNode as HTMLDivElement;
            const availableWidth = parentNode === null ? 0 : parentNode.clientWidth;
            return availableWidth;
        }

        video.addEventListener('playing', () => {
            aspectRatioRef.current = video.videoWidth / video.videoHeight;
            isInitialised.current = true;
            setCanvasSize(availableWidth());
            setUpDrawFrameToCanvas();
        });
        // The resize of the video can change the aspect ratio, so we have to recalculate it
        video.addEventListener('resize', () => {
            aspectRatioRef.current = video.videoWidth / video.videoHeight;
            setCanvasSize(availableWidth());
        });
    }

    function cleanUpQrScanner() {
        qrScannerRef.current?.stop();
        qrScannerRef.current?.destroy();
        qrScannerRef.current = null;
    }

    async function startQrScanner() {
        console.log('starting QrScanner');
        if (qrScannerRef.current === null) return;
        try {
            await qrScannerRef.current.start();
            console.log('QrScanner started');
            const cameras = await QrScanner.listCameras(true);
            setAvailableCameras(cameras);
        } catch (e) {
            console.log(`ERROR while starting QR Scanner: ${e}`);
        }
    }

    function calculateScanRegion(width: number, height: number) {
        const smallestDimension = Math.min(width, height);
        // Original code: the scan region is two thirds of the smallest dimension of the video.
        // const scanRegionSize = Math.round((2 / 3) * smallestDimension);
        // We are going to go larger and use a scan region of 90% of the smallest dimension of the video.
        const scanRegionSize = Math.round(smallestDimension * 0.9);
        const legacyCanvasSize = 400;
        return {
            x: Math.round((width - scanRegionSize) / 2),
            y: Math.round((height - scanRegionSize) / 2),
            width: scanRegionSize,
            height: scanRegionSize,
            downScaledWidth: legacyCanvasSize,
            downScaledHeight: legacyCanvasSize,
        };
    }

    function calculateCanvasScanRegion(canvas: HTMLCanvasElement): QrScanner.ScanRegion {
        return calculateScanRegion(canvas.width, canvas.height);
    }

    function calculateVideoScanRegion(video: HTMLVideoElement): QrScanner.ScanRegion {
        return calculateScanRegion(video.videoWidth, video.videoHeight);
    }

    /* Init/Destroy to be called on mount/unmount */
    useEffect(() => {
        console.log('Initialise ReactQRScanner');
        if (videoRef.current === null) return;
        if (qrScannerRef.current !== null) return;
        console.log('creating new QrScanner');

        initQrScanner(videoRef.current);
        if (autoStartScanning) {
            // TODO started already?
            // startQrScanner();
        }
        return () => {
            console.log('Cleaning up ReactQRScanner');
            cleanUpQrScanner();
        };
    }, []);

    /* Start/Stop called when isStopped state changes */
    useEffect(() => {
        if (isStopped) {
            qrScannerRef.current?.stop();
        } else {
            startQrScanner();
        }
    }, [isStopped]);

    function onScanned(qrCode: string) {
        if (qrCode === '' || qrCode === lastQRCode) {
            return;
        }
        setLastQRCode(qrCode);
    }

    function onScanError(error: string) {
        if (error === QrScanner.NO_QR_CODE_FOUND) return;
        console.error('Scanning ERROR:', error);
    }

    useEffect(() => {
        /* TODO
          - first try to setCamera, set in state only if no errors
          - this method is async
          - proper error handling
          - what kind of errors would we get? Display some error if we can't set the camera?
          - maybe display just 2 options? Front and Back (corresponding to user and environment in QrScanner terms)
        */
        if (selectedCamera !== null) {
            qrScannerRef.current?.setCamera(selectedCamera.id);
        }
    }, [selectedCamera]);

    /*
    Invoke the onQRCodeScanned action only when a new QR Code has been scanned.
    The QrScanner component keeps re-calling the 'onScanned' callback above with the same QR code while the QR Code can be scanned.
    We don't want to replicate this behaviour, so we maintain the lastQRCode that was scanned and emit an event only when a new QR Code was scanned. */
    useEffect(() => {
        if (!lastQRCode) return;
        onQRCodeScanned(lastQRCode);
    }, [onQRCodeScanned, lastQRCode]);

    /* Resize Canvas and scanRegion when the parent DOM container node changes size */
    useEffect(() => {
        if (!isInitialised.current) return;
        const parentNode = videoRef.current?.parentNode?.parentNode as HTMLDivElement;
        const availableWidth = parentNode === null ? 0 : parentNode.clientWidth;

        const video = videoRef.current;
        if (video === null) return;
        function aspectRatio() {
            const video = videoRef.current;

            if (video === null || video.videoHeight === 0 || !isVideoReady()) {
                return DEFAULT_ASPECT_RATIO;
            }
            return video.videoWidth / video.videoHeight;
        }
        aspectRatioRef.current = aspectRatio();

        setCanvasSize(availableWidth);
    }, [width, height, containerRef]);

    function setCanvasSize(availableWidth: number) {
        // allow a safety margin otherwise resizing of the canvas resizes the parent container
        // that triggers another resize effect and that gets us into a loop
        const SAFETY_MARGIN = 10;
        if (canvasRef.current === null) return;
        if (videoRef.current === null) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        aspectRatioRef.current = video.videoWidth / video.videoHeight;

        canvas.width = availableWidth - SAFETY_MARGIN;
        canvas.height = Math.floor(canvas.width / aspectRatioRef.current);

        if (canvas !== null) {
            scanRegionRef.current = calculateCanvasScanRegion(canvas);
        }
    }

    /* Set up the mechanism that shows the video frame on the canvas and draws the scan region area on top of it */
    function setUpDrawFrameToCanvas() {
        let previousInvocationTs: number | null = null;
        function drawFrameToCanvas() {
            if (isStoppedRef.current) {
                clearCanvas();
                return;
            }
            const canvas = canvasRef.current;
            if (canvas === null) return;
            const ctx = canvas.getContext('2d');
            if (ctx === null) return;
            if (scanRegionRef.current === null) return;

            requestAnimationFrame((invocationTs) => {
                if (previousInvocationTs !== null) {
                    const invocationDelta = invocationTs - previousInvocationTs;
                    if (invocationDelta < 1000 / fps) {
                        drawFrameToCanvas();
                        return;
                    }
                }
                previousInvocationTs = invocationTs;

                if (videoRef.current === null) return;
                const video = videoRef.current;
                if (!isVideoReady()) {
                    drawFrameToCanvas();
                    return;
                }

                if (isVideoMirrored(video)) {
                    ctx.scale(-1, 1);
                }

                ctx.drawImage(video, 0, 0, X(canvas.width), canvas.height);
                if (scanRegionRef.current !== null) {
                    drawScanRegion(ctx, scanRegionRef.current, canvas.width);
                }

                drawFrameToCanvas();
            });
        }
        drawFrameToCanvas();

        function X(x: number) {
            return videoRef.current !== null && isVideoMirrored(videoRef.current) ? x * -1 : x;
        }

        function drawScanRegion(ctx: CanvasRenderingContext2D, scanRegion: QrScanner.ScanRegion, canvasWidth: number) {
            const scaleFactor = 1;

            const x = (scanRegion.x || 0) * scaleFactor;
            const y = (scanRegion.y || 0) * scaleFactor;
            const width = (scanRegion.width || 0) * scaleFactor;
            const height = (scanRegion.height || 0) * scaleFactor;

            const side = width;

            ctx.lineWidth = canvasWidth > 500 ? 10 : 5;
            ctx.strokeStyle = 'rgb(255, 165, 0, 0.7)';
            let cornerLineLength = width / 4;

            ctx.beginPath();
            ctx.moveTo(X(x - ctx.lineWidth / 2), y);
            ctx.lineTo(X(x + cornerLineLength), y);
            ctx.moveTo(X(x), y);
            ctx.lineTo(X(x), y + cornerLineLength);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(X(x + side + ctx.lineWidth / 2), y);
            ctx.lineTo(X(x + side - cornerLineLength), y);
            ctx.moveTo(X(x + side), y);
            ctx.lineTo(X(x + side), y + cornerLineLength);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(X(x + side + ctx.lineWidth / 2), y + height);
            ctx.lineTo(X(x + side - cornerLineLength), y + height);
            ctx.moveTo(X(x + side), y + height);
            ctx.lineTo(X(x + side), y + height - cornerLineLength);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(X(x - ctx.lineWidth / 2), y + side);
            ctx.lineTo(X(x + cornerLineLength), y + side);
            ctx.moveTo(X(x), y + side);
            ctx.lineTo(X(x), y + side - cornerLineLength);
            ctx.stroke();
        }
    }

    function clearCanvas() {
        const canvas = canvasRef.current;
        if (canvas === null) return;
        const ctx = canvas.getContext('2d');
        if (ctx === null) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // additional workaround needed to make sure the canvas is really cleared is to change the size of it
        const w = canvas.width;
        canvas.width = 0;
        canvas.width = w;
    }

    function startOrStop() {
        const current = isStopped;
        setIsStopped(!current);
        isStoppedRef.current = !current;
    }

    function isVideoReady() {
        return videoRef.current !== null && videoRef.current?.readyState > 1;
    }

    function isVideoMirrored(video: HTMLVideoElement) {
        return video.style.transform === 'scaleX(-1)';
    }

    const cameras = availableCameras;
    const currentCamera =
        selectedCamera === null ? (cameras.length > 0 ? cameras[0].label : null) : selectedCamera.label;

    return (
        <div className="p-d-flex p-flex-column p-ai-center">
            <div className="p-mb-3">
                {currentCamera && (
                    <Dropdown
                        placeholder="Default Camera"
                        options={cameras}
                        optionLabel="label"
                        value={selectedCamera}
                        onChange={(e) => setSelectedCamera(e.value)}
                    />
                )}
            </div>
            <div style={{ width: '100%' }} ref={containerRef}></div>
            <div>
                <video
                    className="p-shadow-8"
                    width="100%"
                    height="auto"
                    style={{ display: 'none' }}
                    ref={videoRef}
                ></video>
                <canvas className="p-shadow-12" ref={canvasRef} />
            </div>
            <div className="p-d-inline-flex p-mt-3">
                <ToggleButton
                    className="p-mr-2"
                    onLabel="Start"
                    offLabel="Stop"
                    onIcon="pi pi-play"
                    offIcon="pi pi-stop"
                    checked={isStopped}
                    onChange={startOrStop}
                ></ToggleButton>
            </div>
        </div>
    );
};

export default ReactQRScanner;
