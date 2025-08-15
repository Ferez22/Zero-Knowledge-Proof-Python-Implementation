# Zero-Knowledge Proof Python Implementation

A secure age verification system using zero-knowledge proofs with QR code generation and verification.

## Features

- **Zero-Knowledge Proof Generation**: Create secure proofs without revealing actual birth dates
- **QR Code Integration**: Generate and scan QR codes for easy verification
- **Secure Authentication**: HMAC-signed proofs with expiration times
- **Modern Web Frontend**: React-based interface with camera scanning and file upload
- **Flask Backend API**: RESTful API for proof verification and generation

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   ZK Proof      │
│   (Next.js)     │◄──►│   (Flask)       │◄──►│   Engine       │
│                 │    │                 │    │   (Python)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

## Installation & Setup

### 1. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Run the Flask backend
python app.py
```

The backend will start on `http://localhost:5001`

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd notrust

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

### Generating QR Codes

1. Open the frontend in your browser
2. Use the "Generate New Proof" section on the right
3. Enter a User ID and Date of Birth
4. Click "Generate QR Code"
5. The system will create a secure proof and save a QR code image

### Authenticating with QR Codes

1. Use the "Authentication" section on the left
2. Click "Start Camera Scanner" to use your device camera
3. Or upload a QR code image file
4. The system will scan and verify the proof
5. View authentication results and proof details

## API Endpoints

- `GET /health` - Health check
- `POST /verify` - Verify a ZK proof
- `POST /generate` - Generate a new ZK proof
- `GET /config` - Get system configuration

## Security Features

- **HMAC Signatures**: Tamper-proof proof verification
- **Expiration Times**: Configurable proof validity periods
- **Minimal Data Exposure**: Only necessary information is revealed
- **Secure Key Management**: Random secret key generation

## Configuration

Edit `config.py` to modify:

- Minimum age requirements
- Proof expiration times
- QR code settings
- Secret key sizes

## Development

### Backend Development

- The main ZK proof logic is in `zkp.py`
- Flask API endpoints are in `app.py`
- Configuration is centralized in `config.py`

### Frontend Development

- React components are in `notrust/src/components/`
- Main page is `notrust/src/app/page.tsx`
- Uses Tailwind CSS for styling

## Testing

```bash
# Test the backend
python zkp.py

# Test the frontend
cd notrust
npm run build
npm start
```

## File Structure

```
├── app.py                 # Flask backend API
├── zkp.py                # Core ZK proof implementation
├── config.py             # Configuration settings
├── requirements.txt      # Python dependencies
├── generated_qr_codes/   # Generated QR code images
└── notrust/             # Next.js frontend
    ├── src/
    │   ├── components/   # React components
    │   └── app/         # Next.js app router
    └── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
