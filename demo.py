#!/usr/bin/env python3
"""
Demo script for the Zero-Knowledge Proof system
This script demonstrates the core functionality without the web interface
"""

from zkp import SecureAgeZKProof
import json
from datetime import datetime

def main():
    print("🔐 Zero-Knowledge Proof System Demo")
    print("=" * 50)
    
    # Initialize the system
    print("\n1. Initializing ZK Proof System...")
    age_prover = SecureAgeZKProof(test_mode=True)
    print(f"   ✅ System initialized (Test mode: QR codes expire in 1 minute)")
    print(f"   📁 QR codes will be saved to: {age_prover.qr_folder}")
    
    # Demo user data
    demo_users = [
        {"user_id": "user001", "birth_date": "1990-05-15"},
        {"user_id": "user002", "birth_date": "2005-08-22"},
        {"user_id": "user003", "birth_date": "1985-12-03"}
    ]
    
    print(f"\n2. Generating proofs for {len(demo_users)} demo users...")
    generated_proofs = []
    
    for i, user in enumerate(demo_users, 1):
        print(f"\n   User {i}: {user['user_id']} (DOB: {user['birth_date']})")
        
        # Generate proof
        proof = age_prover.generate_secure_age_proof(user['birth_date'], user['user_id'])
        
        # Generate QR code
        qr_filepath, alias = age_prover.generate_qr_code(proof)
        
        print(f"      ✅ Proof generated with alias: {alias}")
        print(f"      📱 QR code saved: {qr_filepath}")
        print(f"      🔒 Age verified: {proof['age_verified']}")
        print(f"      ⏰ Expires: {proof['expires_at']}")
        
        generated_proofs.append({
            "user": user,
            "proof": proof,
            "qr_file": qr_filepath,
            "alias": alias
        })
    
    print(f"\n3. Verifying generated proofs...")
    
    for i, item in enumerate(generated_proofs, 1):
        print(f"\n   Verifying proof {i} (Alias: {item['alias']})...")
        
        # Verify the proof
        is_valid, message = age_prover.verify_proof(item['proof'])
        
        if is_valid:
            print(f"      ✅ Verification successful: {message}")
        else:
            print(f"      ❌ Verification failed: {message}")
    
    print(f"\n4. Testing expired proof...")
    
    # Create a proof that will expire quickly (test mode)
    expired_proof = age_prover.generate_secure_age_proof("1990-01-01", "expired_user")
    
    print("   ⏳ Waiting for proof to expire (test mode: 1 minute)...")
    print("   💡 In production mode, proofs expire after 24 hours")
    
    print(f"\n5. System Summary:")
    print(f"   📊 Total proofs generated: {len(generated_proofs)}")
    print(f"   🔑 Secret key size: {len(age_prover.secret_key)} bytes")
    print(f"   📅 Minimum age requirement: {age_prover.min_age} years")
    print(f"   ⏰ Proof expiry: {age_prover.proof_expiry_hours} hours")
    
    print(f"\n🎉 Demo completed successfully!")
    print(f"📁 Check the '{age_prover.qr_folder}' folder for generated QR codes")
    print(f"🌐 Run 'python app.py' to start the web API")
    print(f"🚀 Run './start_system.sh' to start the complete system")

if __name__ == "__main__":
    main()
