const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { sign } = require('../lib/jwt');

exports.register = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('🔴 Validation errors:', errors.array());
      console.log('📝 Request body:', req.body);
      
      const errorMessages = errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages
      });
    }

    const { 
      name,
      email, 
      password, 
      phone,
      role = 'USER', // Default to USER if not specified
      storeName, 
      storeAddress, 
      businessCategory
    } = req.body;

    console.log('Registration attempt for:', { email, role, name, phone: phone || 'not provided' });

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email address is already registered'
      });
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const existingPhone = await prisma.user.findUnique({ 
        where: { phone } 
      });
      
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: 'Phone number is already registered'
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Prepare user data
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone ? phone.trim() : null,
      role: role.toUpperCase(),
    };

    // Create user with or without vendor profile
    let user;
    if (role === 'VENDOR') {
      // Validate vendor-specific fields
      if (!storeName || !storeAddress || !businessCategory) {
        return res.status(400).json({
          success: false,
          message: 'Vendor accounts require store name, address, and business category'
        });
      }

      user = await prisma.user.create({
        data: {
          ...userData,
          vendorProfile: {
            create: {
              storeName: storeName.trim(),
              storeAddress: storeAddress.trim(),
              businessCategory: businessCategory.trim(),
              // ensure pending defaults (schema already defaults)
            },
          },
        },
        include: { 
          vendorProfile: true 
        },
      });
      // Fire-and-forget pending email
      try {
        const { sendVendorPendingEmail } = require('../lib/email');
        sendVendorPendingEmail(email.toLowerCase().trim(), name.trim(), storeName?.trim());
      } catch (e) { console.warn('Email send failed (vendor pending):', e?.message || e); }
    } else {
      // Create regular user
      user = await prisma.user.create({
        data: userData,
      });
    }

    // Generate JWT token
    const token = sign({ 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role 
    });

    await addToGoogleSheet(name, storeName || '', email, phone || '', role);
    // Return success response
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          ...(user.vendorProfile && {
            vendorProfile: {
              storeName: user.vendorProfile.storeName,
              storeAddress: user.vendorProfile.storeAddress,
              businessCategory: user.vendorProfile.businessCategory,
            }
          })
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle Prisma-specific errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A user with this email or phone already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    // User is attached by passport local strategy
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = sign({ 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role 
    });

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Generate a random 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Use the email service to send verification codes
const emailService = require('../lib/email');
const { addToGoogleSheet } = require('../utils/googleSheets');

exports.forgotPassword = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages
      });
    }

    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    console.log('🔐 Password reset requested for:', normalizedEmail);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an account with this email exists, a verification code has been sent'
      });
    }

    // Generate 6-digit verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Delete any existing unused codes for this email
    await prisma.passwordReset.deleteMany({
      where: {
        email: normalizedEmail,
        used: false
      }
    });

    // Create new verification code
    await prisma.passwordReset.create({
      data: {
        email: normalizedEmail,
        code: verificationCode,
        expiresAt: expiresAt
      }
    });

    // Send verification code via email using the email service
    try {
      await emailService.sendPasswordResetCode(normalizedEmail, verificationCode, user.name);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Continue — do not reveal email send failure to the client for security
    }

    console.log('✅ Verification code created and sent for:', normalizedEmail);

    res.json({
      success: true,
      message: 'Verification code sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during password reset request'
    });
  }
};

exports.verifyResetCode = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages
      });
    }

    const { email, code } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    console.log('🔍 Verifying reset code for:', normalizedEmail);

    // Find the verification code
    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        email: normalizedEmail,
        code: code,
        used: false,
        expiresAt: {
          gt: new Date() // Not expired
        }
      }
    });

    if (!passwordReset) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    console.log('✅ Reset code verified for:', normalizedEmail);

    res.json({
      success: true,
      message: 'Verification code is valid'
    });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during code verification'
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages
      });
    }

    const { email, code, newPassword } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    console.log('🔄 Resetting password for:', normalizedEmail);

    // Find and validate the verification code
    const passwordReset = await prisma.passwordReset.findFirst({
      where: {
        email: normalizedEmail,
        code: code,
        used: false,
        expiresAt: {
          gt: new Date() // Not expired
        }
      }
    });

    if (!passwordReset) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user's password
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        password: hashedPassword,
        updatedAt: new Date()
      }
    });

    // Mark the verification code as used
    await prisma.passwordReset.update({
      where: { id: passwordReset.id },
      data: { used: true }
    });

    // Delete any other unused codes for this email
    await prisma.passwordReset.deleteMany({
      where: {
        email: normalizedEmail,
        used: false
      }
    });

    console.log('✅ Password reset successful for:', normalizedEmail);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during password reset'
    });
  }
};
