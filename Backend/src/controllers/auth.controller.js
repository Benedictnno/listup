const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { sign, verify } = require('../lib/jwt');
const { addToGoogleSheet } = require('../utils/googleSheets');
const { getFrontendUrl } = require('../utils/url');

// Helper function to generate unique verification token
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

exports.getMe = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }
    // Verify JWT
    const decoded = verify(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isKYCVerified: true,
        listingLimit: true,
        vendorProfile: {
          select: {
            storeName: true,
            storeAddress: true,
            businessCategory: true,
            logo: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

exports.register = async (req, res, next) => {
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

    const {
      name,
      email,
      password,
      phone,
      referralCode,
      whatsappOptIn,
    } = req.body;
    
    const role = 'USER'; // Strictly enforced for this route

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
      whatsappOptIn: !!whatsappOptIn,
    };

    // Referral logic for USER (if applicable)
    let referral = null;
    if (referralCode) {
      referral = await prisma.referral.findUnique({
        where: { code: referralCode },
      });

      if (!referral || !referral.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or inactive referral code',
        });
      }
    }

    // Create regular user
    const user = await prisma.user.create({
      data: userData,
    });

    // Generate email verification token
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Create email verification record
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: expiresAt
      }
    });

    // Send verification email (fire-and-forget)
    try {
      const { sendEmailVerification } = require('../lib/email');
      const frontendUrl = getFrontendUrl();
      const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
      await sendEmailVerification(user.email, verificationLink, user.name);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue registration even if email fails
    }

    // Send WhatsApp welcome message if opted in
    // DISABLED: Switching to Click-to-Chat strategy for ban prevention
    // We only respond to users who message us first.
    /* 
    if (user.whatsappOptIn) {
      ...
    }
    */

    try {
      await addToGoogleSheet(name, storeName || '', email, phone || '', role);
    } catch (sheetError) {
      console.error('Failed to sync new user to Google Sheets:', sheetError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account before logging in.',
      requiresEmailVerification: true,
      data: {
        user: {
          email: user.email,
          name: user.name,
          role: user.role,
          isEmailVerified: user.isEmailVerified
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

exports.registerVendor = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      });
    }

    const {
      name,
      email,
      password,
      phone,
      storeName,
      storeAddress,
      businessCategory,
      referralCode,
      whatsappOptIn,
    } = req.body;

    const role = 'VENDOR';

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

    // Check if phone already exists
    const existingPhone = await prisma.user.findUnique({
      where: { phone }
    });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: 'Phone number is already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone.trim(),
      role: 'VENDOR',
      whatsappOptIn: !!whatsappOptIn,
    };

    let referral = null;
    if (referralCode) {
      referral = await prisma.referral.findUnique({
        where: { code: referralCode },
      });

      if (!referral || !referral.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or inactive referral code',
        });
      }
    }

    const ReferralService = referral ? require('../services/referral.service') : null;

    // Atomically create the user+profile and, if applicable, the referral-use record.
    // If the referral creation throws, the user creation is rolled back too.
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          ...userData,
          vendorProfile: {
            create: {
              storeName: storeName.trim(),
              storeAddress: storeAddress.trim(),
              businessCategory: businessCategory.trim(),
            },
          },
        },
        include: { vendorProfile: true },
      });

      if (referral && ReferralService) {
        // createReferralUse uses the shared prisma instance — pass the tx reference
        // by calling the service's inner logic directly if it supports tx, otherwise
        // call it here inline so it runs within the same transaction context.
        await tx.referralUse.create({
          data: {
            referralId: referral.id,
            vendorId: newUser.id,
            status: 'PENDING',
            commission: 1000,
          },
        });
        await tx.referral.update({
          where: { id: referral.id },
          data: { totalReferrals: { increment: 1 } },
        });
      }

      return newUser;
    });


    // Generate Verification token
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); 

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: expiresAt
      }
    });

    // Send emails (fire and forget)
    try {
      const { sendEmailVerification, sendVendorPendingEmail } = require('../lib/email');
      const frontendUrl = getFrontendUrl();
      const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
      
      sendEmailVerification(user.email, verificationLink, user.name).catch(e => console.error(e));
      sendVendorPendingEmail(user.email, user.name, storeName.trim()).catch(e => console.error(e));
    } catch (e) { console.error(e); }

    try {
      await addToGoogleSheet(name, storeName, email, phone, 'VENDOR (Direct Registration)');
    } catch (sheetError) {
      console.error('Failed to sync new vendor to Google Sheets:', sheetError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Vendor account created successfully! Please verify your email.',
      requiresEmailVerification: true,
      data: {
        user: {
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    });

  } catch (error) {
    console.error('Vendor Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during vendor registration' });
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

    // Fetch full user details to check email verification
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isEmailVerified: true,
        emailVerifiedAt: true,
        isKYCVerified: true,
        listingLimit: true,
        vendorProfile: {
          select: {
            storeName: true,
            storeAddress: true,
            businessCategory: true,
            logo: true,
          },
        },
      }
    });

    // Check if email is verified
    if (!fullUser.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address to continue.',
        requiresEmailVerification: true
      });
    }

    // Generate JWT token
    const token = sign({
      id: fullUser.id,
      email: fullUser.email,
      name: fullUser.name,
      role: fullUser.role
    });
    
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",        // good default for SPA on same site / localhost
      // domain: not needed for localhost; omit it
      maxAge: 7 * 24 * 60 * 60 * 1000, // example: 7 days
    });

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: fullUser.id,
          name: fullUser.name,
          email: fullUser.email,
          role: fullUser.role,
          phone: fullUser.phone,
          isEmailVerified: fullUser.isEmailVerified
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

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    console.log('🔍 Verifying email with token:', token.substring(0, 10) + '...');

    // Find the verification record
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    // Check if already verified
    if (verification.verified) {
      return res.status(400).json({
        success: false,
        message: 'Email has already been verified'
      });
    }

    // Check if token has expired
    if (new Date() > verification.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired. Please request a new one.',
        expired: true
      });
    }

    // Update user's email verification status
    await prisma.user.update({
      where: { id: verification.userId },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date()
      }
    });

    // Mark verification as used
    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { verified: true }
    });

    console.log('✅ Email verified for user:', verification.user.email);

    res.json({
      success: true,
      message: 'Email verified successfully! You can now login.'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during email verification'
    });
  }
};

exports.resendVerificationEmail = async (req, res, next) => {
  try {
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

    console.log('📧 Resend verification requested for:', normalizedEmail);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      // Don't reveal if user exists for security
      return res.json({
        success: true,
        message: 'If an account with this email exists and is unverified, a verification email has been sent'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Delete any existing unused verification tokens for this user
    await prisma.emailVerification.deleteMany({
      where: {
        userId: user.id,
        verified: false
      }
    });

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new verification record
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: expiresAt
      }
    });

    // Send verification email
    try {
      const { sendEmailVerification } = require('../lib/email');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
      await sendEmailVerification(user.email, verificationLink, user.name);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.'
      });
    }

    console.log('✅ Verification email resent to:', normalizedEmail);

    res.json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while resending verification email'
    });
  }
};
