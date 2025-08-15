"use client";

import React, { useState, useRef, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import jsQR from "jsqr";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onScanError,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraStatus, setCameraStatus] = useState<string>("");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const checkCameraPermissions = async (): Promise<boolean> => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err) {
      console.error("Camera permission check failed:", err);
      return false;
    }
  };

  const startScanner = async () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }

    try {
      setError(null);
      setCameraStatus("Checking camera permissions...");

      // Check camera permissions first
      const hasPermission = await checkCameraPermissions();
      if (!hasPermission) {
        throw new Error(
          "Camera access denied. Please allow camera permissions and try again."
        );
      }

      setCameraStatus("Initializing scanner...");

      // Check if the container exists
      if (!containerRef.current) {
        throw new Error("Scanner container not found");
      }

      // Clear any existing content
      containerRef.current.innerHTML = "";

      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
          showTorchButtonIfSupported: true,
        },
        false
      );

      setCameraStatus("Starting camera...");

      scannerRef.current.render(
        (decodedText: string) => {
          console.log("QR Code detected:", decodedText);
          onScanSuccess(decodedText);
          stopScanner();
        },
        (errorMessage: string) => {
          console.log("Scanner error:", errorMessage);
          // Don't treat scanner errors as fatal - they're usually just "no QR code found"
          if (onScanError && errorMessage.includes("No QR code found")) {
            // This is normal, don't show as error
            return;
          }
        }
      );

      setIsScanning(true);
      setCameraStatus("Camera active - scanning for QR codes");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to start camera scanner";
      setError(errorMsg);
      setCameraStatus("Camera failed to start");
      console.error("Scanner error:", err);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
    setCameraStatus("");
  };

  const decodeQRFromImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;

          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );

            const code = jsQR(
              imageData.data,
              imageData.width,
              imageData.height
            );

            if (code) {
              resolve(code.data);
            } else {
              reject(new Error("No QR code found in image"));
            }
          } else {
            reject(new Error("Failed to get canvas context"));
          }
        } catch {
          reject(new Error("Failed to process image"));
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    try {
      setError(null);
      setCameraStatus("Decoding QR code from image...");
      const decodedText = await decodeQRFromImage(file);
      setCameraStatus("QR code decoded successfully!");
      onScanSuccess(decodedText);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to decode QR code";
      setError(errorMsg);
      setCameraStatus("Failed to decode QR code");
      if (onScanError) {
        onScanError(errorMsg);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          QR Code Scanner
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {cameraStatus && (
          <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded text-sm">
            {cameraStatus}
          </div>
        )}

        <div className="space-y-4">
          {/* Camera Scanner */}
          <div>
            <button
              onClick={isScanning ? stopScanner : startScanner}
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                isScanning
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isScanning ? "Stop Scanner" : "Start Camera Scanner"}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              {isScanning
                ? "Camera is active. Point it at a QR code."
                : "Click to start camera scanning"}
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or upload QR code image:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports PNG, JPG, JPEG, GIF, and WebP formats
            </p>
          </div>

          {/* Scanner Container */}
          {isScanning && (
            <div className="mt-4">
              <div id="qr-reader" ref={containerRef}></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
