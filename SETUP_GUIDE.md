# 🚀 Quick Setup Guide

## What You've Got

I've created a complete **Zero-Knowledge Proof Authentication System** with:

- ✅ **Python Backend**: ZK proof generation and verification
- ✅ **React Frontend**: Modern web interface with QR scanning
- ✅ **Flask API**: RESTful backend for frontend communication
- ✅ **QR Code Integration**: Generate and scan QR codes
- ✅ **Security Features**: HMAC signatures, expiration times, minimal data exposure

## 🎯 Quick Start (3 Steps)

### 1. Install Dependencies

```bash
# Python dependencies
pip3 install -r requirements.txt

# Node.js dependencies
cd notrust
npm install
cd ..
```

### 2. Start the System

```bash
# Option A: Use the startup script (recommended)
./start_system.sh

# Option B: Start manually
# Terminal 1: Backend
python3 app.py

# Terminal 2: Frontend
cd notrust
npm run dev
```

### 3. Access the System

- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:5001

## 🧪 Test the System

### Quick Demo

```bash
python3 demo.py
```

This will generate sample QR codes and test the verification system.

### Manual Testing

1. **Generate QR Code**: Use the right panel to create a new proof
2. **Scan QR Code**: Use the left panel to scan and authenticate
3. **Camera Scanning**: Click "Start Camera Scanner" for live scanning
4. **File Upload**: Or upload a QR code image file

## 🔧 System Components

### Backend (`app.py`)

- **Flask API** with CORS enabled
- **ZK Proof Engine** integration
- **QR Code Generation** and storage
- **Proof Verification** endpoints

### Frontend (`notrust/`)

- **QR Scanner Component**: Camera + file upload
- **Authentication Manager**: Proof verification and display
- **QR Generator**: Create new proofs
- **Modern UI**: Tailwind CSS styling

### Core Engine (`zkp.py`)

- **SecureAgeZKProof** class
- **HMAC Signatures** for tamper protection
- **Age Verification** logic
- **QR Code Generation** with unique aliases

## 📱 How It Works

1. **User generates a proof** with their birth date
2. **System creates a QR code** containing the encrypted proof
3. **User scans QR code** with the frontend
4. **Frontend sends proof** to backend for verification
5. **Backend verifies** the proof and returns result
6. **User sees authentication status** without revealing personal data

## 🔒 Security Features

- **Zero-Knowledge**: Birth date never transmitted
- **HMAC Signatures**: Tamper-proof verification
- **Expiration Times**: Configurable proof validity
- **Unique Aliases**: Anonymous proof identification
- **Secure Keys**: Random secret key generation

## 🛠️ Customization

### Configuration (`config.py`)

```python
MIN_AGE = 18                    # Minimum age requirement
PROOF_EXPIRY_HOURS = 24        # Proof validity period
SECRET_KEY_SIZE = 32           # HMAC key size
QR_BOX_SIZE = 10               # QR code box size
QR_BORDER = 4                  # QR code border
```

### Frontend Styling

- Edit `notrust/src/app/globals.css`
- Modify Tailwind classes in components
- Update color schemes and layouts

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**

```bash
# Check if port 5001 is free
lsof -i :5001
# Kill process if needed
kill -9 <PID>
```

**Frontend won't start:**

```bash
# Clear Next.js cache
cd notrust
rm -rf .next
npm run dev
```

**QR codes not generating:**

```bash
# Check permissions
ls -la generated_qr_codes/
# Create folder if missing
mkdir -p generated_qr_codes
```

**Camera not working:**

- Ensure HTTPS in production (camera API requirement)
- Check browser permissions
- Try file upload as alternative

### Logs

- **Backend**: Check terminal output
- **Frontend**: Check browser console
- **System**: Check `start_system.sh` output

## 🚀 Production Deployment

### Environment Variables

```bash
export FLASK_ENV=production
export SECRET_KEY=your-secure-key
export MIN_AGE=18
export PROOF_EXPIRY_HOURS=24
```

### Security Considerations

- Use HTTPS for camera access
- Store secret keys securely
- Implement rate limiting
- Add user authentication
- Use production database

### Scaling

- Deploy backend to cloud (AWS, GCP, Azure)
- Use CDN for frontend
- Implement load balancing
- Add monitoring and logging

## 📚 API Reference

### Endpoints

**GET** `/health`

- Health check endpoint
- Returns system status

**POST** `/verify`

- Verify a ZK proof
- Body: JSON proof data
- Returns: Verification result

**POST** `/generate`

- Generate new ZK proof
- Body: `{"user_id": "...", "birth_date": "..."}`
- Returns: Proof data and QR code path

**GET** `/config`

- Get system configuration
- Returns: Current settings

## 🎉 You're All Set!

Your Zero-Knowledge Proof system is ready to:

- 🔐 Generate secure age verification proofs
- 📱 Scan QR codes with camera or file upload
- ✅ Verify proofs without revealing personal data
- 🚀 Scale from demo to production

**Next Steps:**

1. Test with the demo script
2. Customize configuration
3. Deploy to production
4. Add more features (user management, analytics, etc.)

Happy coding! 🎯
