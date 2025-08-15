"use client";

import React, { useState } from "react";
import QRScanner from "./QRScanner";

interface ProofData {
  alias: string;
  user_id: string;
  age_verified: boolean;
  min_age: number;
  timestamp: string;
  expires_at: string;
  signature: string;
}

interface VerificationResponse {
  valid: boolean;
  message: string;
  timestamp: string;
}

interface AuthManagerProps {
  backendUrl?: string;
}

const AuthManager: React.FC<AuthManagerProps> = ({
  backendUrl = "http://localhost:5001",
}) => {
  const [proofData, setProofData] = useState<ProofData | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "error"
  >("idle");
  const [verificationMessage, setVerificationMessage] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleScanSuccess = (decodedText: string) => {
    setVerificationStatus("verifying");
    setVerificationMessage("Processing QR code...");

    try {
      const parsedData = JSON.parse(decodedText);
      setProofData(parsedData);
      verifyProof(parsedData);
    } catch (error) {
      setVerificationStatus("error");
      setVerificationMessage("Invalid QR code format");
      console.error("Failed to parse QR code data:", error);
    }
  };

  const handleScanError = (error: string) => {
    setVerificationStatus("error");
    setVerificationMessage(`Scan error: ${error}`);
  };

  const verifyProof = async (proof: ProofData) => {
    try {
      // First verify locally
      const isExpired = new Date(proof.expires_at) < new Date();
      if (isExpired) {
        setVerificationStatus("error");
        setVerificationMessage("Proof has expired");
        return;
      }

      // Send to backend for verification
      const response: Response = await fetch(`${backendUrl}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proof),
      });

      if (response.ok) {
        const result: VerificationResponse = await response.json();
        if (result.valid) {
          setVerificationStatus("success");
          setVerificationMessage("Authentication successful!");
          setIsAuthenticated(true);
        } else {
          setVerificationStatus("error");
          setVerificationMessage(result.message || "Verification failed");
        }
      } else {
        setVerificationStatus("error");
        setVerificationMessage("Backend verification failed");
      }
    } catch (error) {
      setVerificationStatus("error");
      setVerificationMessage("Network error during verification");
      console.error("Verification error:", error);
    }
  };

  const resetAuth = () => {
    setProofData(null);
    setVerificationStatus("idle");
    setVerificationMessage("");
    setIsAuthenticated(false);
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case "success":
        return "bg-green-100 border-green-400 text-green-700";
      case "error":
        return "bg-red-100 border-red-400 text-red-700";
      case "verifying":
        return "bg-yellow-100 border-yellow-400 text-yellow-700";
      default:
        return "bg-gray-100 border-gray-400 text-gray-700";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Zero-Knowledge Proof Authentication
        </h1>
        <p className="text-gray-600">
          Scan a QR code to verify your age and identity
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Scanner Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Scan QR Code
          </h2>
          <QRScanner
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
          />
        </div>

        {/* Authentication Status Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Authentication Status
          </h2>

          {verificationStatus !== "idle" && (
            <div className={`p-4 border rounded-lg mb-4 ${getStatusColor()}`}>
              <p className="font-medium">{verificationMessage}</p>
            </div>
          )}

          {proofData && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Proof Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Alias:</span>
                  <span className="text-gray-800">{proofData.alias}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">User ID:</span>
                  <span className="text-gray-800">{proofData.user_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">
                    Age Verified:
                  </span>
                  <span
                    className={`font-semibold ${
                      proofData.age_verified ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {proofData.age_verified ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">
                    Minimum Age:
                  </span>
                  <span className="text-gray-800">{proofData.min_age}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Expires:</span>
                  <span className="text-gray-800">
                    {new Date(proofData.expires_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {isAuthenticated && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Authentication Successful
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    You have been successfully authenticated using
                    zero-knowledge proof.
                  </p>
                </div>
              </div>
            </div>
          )}

          {verificationStatus !== "idle" && (
            <button
              onClick={resetAuth}
              className="mt-4 w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              Reset Authentication
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthManager;
