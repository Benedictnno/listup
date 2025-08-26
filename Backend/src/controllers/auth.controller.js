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

    console.log('✅ Registration attempt for:', { email, role, name, phone: phone || 'not provided' });

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
            },
          },
        },
        include: { 
          vendorProfile: true 
        },
      });
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
        message: 'Invalid credentials'
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
