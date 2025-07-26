import hashlib
import os
import random
import qrcode
from datetime import datetime, date, timedelta
import json
import hmac
import base64
from config import config

class SecureAgeZKProof:
    def __init__(self, secret_key=None, test_mode=False):
        self.secret_key = secret_key or os.urandom(config.SECRET_KEY_SIZE)
        self.min_age = config.MIN_AGE
        
        # Set mode (test or production)
        if test_mode:
            config.set_test_mode()
        else:
            config.set_production_mode()
            
        self.proof_expiry_hours = config.PROOF_EXPIRY_HOURS
        self.qr_folder = config.QR_FOLDER
        self._ensure_qr_folder()
    
    def _ensure_qr_folder(self):
        """Create QR codes folder if it doesn't exist"""
        if not os.path.exists(self.qr_folder):
            os.makedirs(self.qr_folder)
    
    def _generate_alias(self):
        """Generate a random 5-digit alias"""
        return f"{random.randint(10000, 99999)}"
    
    def _hash(self, data):
        return hashlib.sha256(data.encode('utf-8')).hexdigest()
    
    def _hmac_sign(self, data):
        """Create HMAC signature for tamper protection"""
        return hmac.new(self.secret_key, data.encode('utf-8'), hashlib.sha256).hexdigest()
    
    def calculate_age(self, birth_date):
        today = date.today()
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        return age
    
    def generate_secure_age_proof(self, birth_date_str, user_id):
        """Generate secure ZK proof for age verification"""
        birth_date = datetime.strptime(birth_date_str, "%Y-%m-%d").date()
        age = self.calculate_age(birth_date)
        
        # Generate unique alias
        alias = self._generate_alias()
        
        # Create proof with minimal data exposure
        proof_data = {
            "alias": alias,
            "user_id": user_id,
            "age_verified": age >= self.min_age,
            "min_age": self.min_age,
            "timestamp": datetime.now().isoformat(),
            "expires_at": (datetime.now() + timedelta(hours=self.proof_expiry_hours)).isoformat()
        }
        
        # Create signature
        data_to_sign = json.dumps(proof_data, sort_keys=True)
        signature = self._hmac_sign(data_to_sign)
        
        # Add signature to proof
        proof_data["signature"] = signature
        
        return proof_data
    
    def verify_proof(self, proof_data):
        """Verify proof integrity and expiration"""
        try:
            # Check expiration
            expires_at = datetime.fromisoformat(proof_data["expires_at"])
            if datetime.now() > expires_at:
                return False, "Proof expired"
            
            # Verify signature
            signature = proof_data.pop("signature")
            data_to_verify = json.dumps(proof_data, sort_keys=True)
            expected_signature = self._hmac_sign(data_to_verify)
            
            if not hmac.compare_digest(signature, expected_signature):
                return False, "Invalid signature"
            
            # Check age requirement
            if not proof_data["age_verified"]:
                return False, "Age requirement not met"
            
            return True, "Proof verified successfully"
            
        except Exception as e:
            return False, f"Verification failed: {str(e)}"
    
    def generate_qr_code(self, proof_data):
        """Generate QR code with unique alias and store in dedicated folder"""
        alias = proof_data["alias"]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Create filename with alias and timestamp
        filename = f"age_proof_{alias}_{timestamp}.png"
        filepath = os.path.join(self.qr_folder, filename)
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=config.QR_BOX_SIZE, border=config.QR_BORDER)
        qr.add_data(json.dumps(proof_data))
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        img.save(filepath)
        
        return filepath, alias

# Enhanced usage with better security
def main():
    # Ask user for test mode
    test_mode = input("Run in test mode? (y/n): ").lower().startswith('y')
    
    # In a real system, this key would be stored securely
    secret_key = os.urandom(config.SECRET_KEY_SIZE)
    age_prover = SecureAgeZKProof(secret_key, test_mode=test_mode)
    
    if test_mode:
        print("Running in TEST MODE - QR codes will expire in 1 minute")
    else:
        print("Running in PRODUCTION MODE - QR codes will expire in 24 hours")
    
    # User provides their date of birth and ID
    user_id = input("Enter your user ID: ")
    birth_date = input("Enter your date of birth (YYYY-MM-DD): ")
    
    # Generate secure proof
    proof = age_prover.generate_secure_age_proof(birth_date, user_id)
    
    # Generate QR code with unique alias
    qr_filepath, alias = age_prover.generate_qr_code(proof)
    print(f"Generated QR code with alias: {alias}")
    print(f"QR code saved as: {qr_filepath}")
    
    # Verification
    print("\n--- Secure Verification ---")
    is_valid, message = age_prover.verify_proof(proof)
    print(f"Verification result: {message}")
    print(f"Age verification: {'PASS' if is_valid else 'FAIL'}")

if __name__ == "__main__":
    main()
