from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from zkp import SecureAgeZKProof
import os
from datetime import datetime

app = Flask(__name__)

# Configure CORS to specifically allow localhost:3000
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

# Initialize the ZK proof system
secret_key = os.urandom(32)  # In production, this should be stored securely
age_prover = SecureAgeZKProof(secret_key, test_mode=False)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'ZK Proof Authentication API'
    })

@app.route('/qr-code/<path:filename>', methods=['GET'])
def serve_qr_code(filename):
    """Serve QR code images"""
    try:
        # Security: ensure the filename is within the generated_qr_codes directory
        if '..' in filename or filename.startswith('/'):
            return jsonify({'error': 'Invalid filename'}), 400
        
        # Construct the full path to the QR code file
        qr_code_path = os.path.join(age_prover.qr_folder, filename)
        
        # Check if file exists
        if not os.path.exists(qr_code_path):
            return jsonify({'error': 'QR code not found'}), 404
        
        # Serve the file with proper headers
        return send_file(
            qr_code_path,
            mimetype='image/png',
            as_attachment=False,
            download_name=filename
        )
        
    except Exception as e:
        return jsonify({'error': f'Failed to serve QR code: {str(e)}'}), 500

@app.route('/verify', methods=['POST', 'OPTIONS'])
def verify_proof():
    """Verify a ZK proof"""
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        proof_data = request.get_json()
        
        if not proof_data:
            return jsonify({'valid': False, 'message': 'No proof data provided'}), 400
        
        # Verify the proof using the ZK system
        is_valid, message = age_prover.verify_proof(proof_data)
        
        return jsonify({
            'valid': is_valid,
            'message': message,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'valid': False,
            'message': f'Verification error: {str(e)}'
        }), 500

@app.route('/generate', methods=['POST', 'OPTIONS'])
def generate_proof():
    """Generate a new ZK proof"""
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        data = request.get_json()
        
        if not data or 'birth_date' not in data or 'user_id' not in data:
            return jsonify({'error': 'Missing required fields: birth_date and user_id'}), 400
        
        birth_date = data['birth_date']
        user_id = data['user_id']
        
        # Generate the proof
        proof = age_prover.generate_secure_age_proof(birth_date, user_id)
        
        # Generate QR code
        qr_filepath, alias = age_prover.generate_qr_code(proof)
        
        # Extract just the filename from the full path
        qr_filename = os.path.basename(qr_filepath)
        
        return jsonify({
            'proof': proof,
            'qr_code_path': qr_filename,  # Return just the filename
            'qr_full_path': qr_filepath,  # Keep full path for reference if needed
            'alias': alias,
            'message': 'Proof generated successfully'
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Generation error: {str(e)}'
        }), 500

@app.route('/config', methods=['GET'])
def get_config():
    """Get current configuration"""
    return jsonify({
        'min_age': age_prover.min_age,
        'proof_expiry_hours': age_prover.proof_expiry_hours,
        'test_mode': False  # This would be configurable in production
    })

if __name__ == '__main__':
    print("Starting ZK Proof Authentication API...")
    print("API will be available at: http://localhost:5001")
    print("Frontend should be configured to connect to this URL")
    print("CORS enabled for: http://localhost:3000")
    print("QR code images will be served from /qr-code/ endpoint")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
