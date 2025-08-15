import AuthManager from "../components/AuthManager";
import QRGenerator from "../components/QRGenerator";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Zero-Knowledge Proof System
          </h1>
          <p className="text-xl text-gray-600">
            Secure age verification without revealing personal data
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Authentication
            </h2>
            <AuthManager backendUrl="http://localhost:5001" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Generate New Proof
            </h2>
            <QRGenerator backendUrl="http://localhost:5001" />
          </div>
        </div>
      </div>
    </main>
  );
}
