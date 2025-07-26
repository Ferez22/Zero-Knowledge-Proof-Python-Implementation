class Config:
    """Configuration class for ZK Proof settings"""
    
    def __init__(self):
        # Proof expiration settings
        self.PROOF_EXPIRY_HOURS = 24  # Default: 24 hours
        self.PROOF_EXPIRY_MINUTES = 1  # For testing: 1 minute
        
        # Age verification settings
        self.MIN_AGE = 18
        
        # QR code settings
        self.QR_FOLDER = "generated_qr_codes"
        self.QR_BOX_SIZE = 10
        self.QR_BORDER = 5
        
        # Security settings
        self.SECRET_KEY_SIZE = 32  # bytes
        
    def set_test_mode(self):
        """Enable test mode with shorter expiry times"""
        self.PROOF_EXPIRY_HOURS = 1/60  # 1 minute for testing
        self.PROOF_EXPIRY_MINUTES = 1
        
    def set_production_mode(self):
        """Enable production mode with standard expiry times"""
        self.PROOF_EXPIRY_HOURS = 24
        self.PROOF_EXPIRY_MINUTES = 1440  # 24 hours in minutes

# Global config instance
config = Config()

# For backward compatibility
PROOF_EXPIRY_HOURS = config.PROOF_EXPIRY_HOURS