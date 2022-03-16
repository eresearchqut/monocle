import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { ToggleButton } from 'primereact/togglebutton';
import { Dropdown } from 'primereact/dropdown';

const GENERIC_CAMERAS: QrScanner.Camera[] = [
    { id: 'environment', label: 'Back Camera' },
    { id: 'user', label: 'Front Camera' },
];
const DEFAULT_CAMERA = GENERIC_CAMERAS[0];

export interface ReactQRScannerProps {
    autoStartScanning?: boolean;
    videoMaxWidthPx?: number | null;
    onQRCodeScanned?: (qrCode: string) => void;
}

export const ReactQRScanner: FunctionComponent<ReactQRScannerProps> = ({
    autoStartScanning = true,
    videoMaxWidthPx = null,
    onQRCodeScanned = (qrCode) => {
        console.log(`Scanned QR Code: ${qrCode}`);
    },
}: ReactQRScannerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const qrScannerRef = useRef<QrScanner | null>(null);
    const [availableCameras, setAvailableCameras] = useState<QrScanner.Camera[]>([]);
    const [selectedCamera, setSelectedCamera] = useState<QrScanner.Camera>(DEFAULT_CAMERA);
    const [lastQRCode, setLastQRCode] = useState<string | null>(null);
    const [isStopped, setIsStopped] = useState<boolean>(!autoStartScanning);

    async function initQrScanner(video: HTMLVideoElement) {
        qrScannerRef.current = new QrScanner(video, onScanned, {
            onDecodeError: onScanError,
            calculateScanRegion: calculateScanRegion,
            highlightScanRegion: true,
            highlightCodeOutline: true,
        });
        qrScannerRef.current?.setInversionMode('both');
    }

    function cleanUpQrScanner() {
        qrScannerRef.current?.stop();
        qrScannerRef.current?.destroy();
        qrScannerRef.current = null;
    }

    async function startQrScanner() {
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

    function calculateScanRegion(video: HTMLVideoElement) {
        const smallestDimension = Math.min(video.videoWidth, video.videoHeight);
        // Original code: the scan region is two thirds of the smallest dimension of the video.
        // const scanRegionSize = Math.round((2 / 3) * smallestDimension);
        // We are going to go larger and use a scan region of 90% of the smallest dimension of the video.
        const scanRegionSize = Math.round(smallestDimension * 0.9);
        const legacyCanvasSize = 400;
        return {
            x: Math.round((video.videoWidth - scanRegionSize) / 2),
            y: Math.round((video.videoHeight - scanRegionSize) / 2),
            width: scanRegionSize,
            height: scanRegionSize,
            downScaledWidth: legacyCanvasSize,
            downScaledHeight: legacyCanvasSize,
        };
    }

    /* Init/Destroy to be called on mount/unmount */
    useEffect(() => {
        if (videoRef.current === null) return;
        if (qrScannerRef.current !== null) return;
        initQrScanner(videoRef.current);
        return () => {
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

    useEffect(() => {
        if (selectedCamera !== null) {
            qrScannerRef.current?.setCamera(selectedCamera.id);
        }
    }, [selectedCamera]);

    function onScanned(qrCodeData: QrScanner.ScanResult) {
        const qrCode = qrCodeData.data;
        if (qrCode === '' || qrCode === lastQRCode) {
            return;
        }
        setLastQRCode(qrCode);
    }

    function onScanError(error: Error | string) {
        if (error === QrScanner.NO_QR_CODE_FOUND) return;
        console.error('Scanning ERROR:', error);
    }

    /*
    Invoke the onQRCodeScanned action only when a new QR Code has been scanned.
    The QrScanner component keeps re-calling the 'onScanned' callback above with the same QR code while the QR Code can be scanned.
    We don't want to replicate this behaviour, so we maintain the lastQRCode that was scanned and emit an event only when a new QR Code was scanned. */
    useEffect(() => {
        if (!lastQRCode) return;
        onQRCodeScanned(lastQRCode);
    }, [onQRCodeScanned, lastQRCode]);

    function startOrStop() {
        setIsStopped(!isStopped);
    }

    const possibleCameras = [
        { label: 'Generic', items: GENERIC_CAMERAS },
        { label: 'Specific', items: availableCameras },
    ];

    const videoStyle: React.CSSProperties = {};
    if (videoMaxWidthPx) {
        videoStyle['maxWidth'] = videoMaxWidthPx;
    }

    return (
        <div className="p-d-flex p-flex-column p-ai-center">
            <div className="p-mb-3">
                {availableCameras && (
                    <Dropdown
                        placeholder="Select Camera"
                        options={possibleCameras}
                        optionLabel="label"
                        optionGroupLabel="label"
                        optionGroupChildren="items"
                        value={selectedCamera}
                        onChange={(e) => setSelectedCamera(e.value)}
                    />
                )}
            </div>
            <video className="p-shadow-8" style={videoStyle} width="100%" height="auto" ref={videoRef}></video>
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
