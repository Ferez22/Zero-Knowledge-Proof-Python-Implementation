"use client";

import React, { useState } from "react";

interface ProofData {
  alias: string;
  user_id: string;
  age_verified: boolean;
  min_age: number;
  timestamp: string;
  expires_at: string;
  signature: string;
}

interface GeneratedProofResponse {
  proof: ProofData;
  qr_code_path: string;
  alias: string;
  message: string;
}

interface QRGeneratorProps {
  backendUrl?: string;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({
  backendUrl = "http://localhost:5001",
}) => {
  const [userId, setUserId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProof, setGeneratedProof] =
    useState<GeneratedProofResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !birthDate) {
      setError("Please fill in all fields");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setQrCodeImage(null);

    try {
      const response: Response = await fetch(`${backendUrl}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          birth_date: birthDate,
        }),
      });

      if (response.ok) {
        const result: GeneratedProofResponse = await response.json();
        setGeneratedProof(result);

        // Load and display the QR code image
        await loadQRCodeImage(result.qr_code_path);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to generate proof");
      }
    } catch (err) {
      setError("Network error during generation");
      console.error("Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadQRCodeImage = async (qrCodePath: string) => {
    try {
      // Convert the backend file path to a URL
      const imageUrl = `${backendUrl}/qr-code/${encodeURIComponent(
        qrCodePath
      )}`;

      // Fetch the image and convert to data URL for display
      const response = await fetch(imageUrl);
      if (response.ok) {
        const blob = await response.blob();
        const dataUrl = URL.createObjectURL(blob);
        setQrCodeImage(dataUrl);
      } else {
        console.warn("Could not load QR code image, but proof was generated");
      }
    } catch (err) {
      console.warn("Could not load QR code image:", err);
      // Don't fail the whole process if image loading fails
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeImage || !generatedProof) return;

    const link = document.createElement("a");
    link.href = qrCodeImage;
    link.download = `qr_code_${generatedProof.alias}_${
      new Date().toISOString().split("T")[0]
    }.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setUserId("");
    setBirthDate("");
    setGeneratedProof(null);
    setError(null);
    setQrCodeImage(null);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Generate New QR Code
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label
              htmlFor="userId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              User ID
            </label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter user ID"
              required
            />
          </div>

          <div>
            <label
              htmlFor="birthDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Date of Birth
            </label>
            <input
              type="date"
              id="birthDate"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              isGenerating
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {isGenerating ? "Generating..." : "Generate QR Code"}
          </button>
        </form>

        {generatedProof && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-2">
              Proof Generated Successfully!
            </h4>

            {/* QR Code Display */}
            {qrCodeImage && (
              <div className="mb-4 text-center">
                <div className="bg-white p-4 rounded-lg border inline-block">
                  <img
                    src={qrCodeImage}
                    alt="Generated QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
                <div className="mt-3 space-y-2">
                  <button
                    onClick={downloadQRCode}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                  >
                    📥 Download QR Code
                  </button>
                  <p className="text-xs text-gray-600">
                    Click to download the QR code image
                  </p>
                </div>
              </div>
            )}

            {/* Proof Details */}
            <div className="space-y-2 text-sm text-green-700">
              <p>
                <strong>Alias:</strong> {generatedProof.alias}
              </p>
              <p>
                <strong>User ID:</strong> {generatedProof.proof.user_id}
              </p>
              <p>
                <strong>Age Verified:</strong>{" "}
                {generatedProof.proof.age_verified ? "Yes" : "No"}
              </p>
              <p>
                <strong>Expires:</strong>{" "}
                {new Date(generatedProof.proof.expires_at).toLocaleString()}
              </p>
            </div>

            <button
              onClick={resetForm}
              className="mt-3 w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm"
            >
              Generate Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRGenerator;
