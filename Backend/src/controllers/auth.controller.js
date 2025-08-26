const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { sign } = require('../lib/jwt');

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { 
      name, email, password, phone,
      role, // "USER" or "VENDOR"
      storeName, storeAddress, businessCategory, coverImage 
    } = req.body;
console.log( req.body);

    if (role && !["USER", "VENDOR"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const phoneExists = await prisma.user.findUnique({ where: { phone } });
if (phoneExists) {
  return res.status(409).json({ message: 'Phone number already in use' });
}
    const emailExists = await prisma.user.findUnique({ where: { email } });
if (emailExists) {
  return res.status(409).json({ message: 'Email already in use' });
}

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
  data: {
    name,
    email,
    password: hash,
    phone,
    role,
    ...(role === "VENDOR" && {
      vendorProfile: {
        create: {
          storeName,
          storeAddress,
          businessCategory,
          coverImage,
        },
      },
    }),
  },
  include: { vendorProfile: true }, 
  });
    const token = sign({ id: user.id, email: user.email, name: user.name, role: user.role });
    res.status(201).json({ token, role: user.role });
  } catch (e) { next(e); }
};


exports.login = async (req, res, next) => {
  try {
    // user attached by passport local strategy
    const token = sign(req.user);
    res.json({ 
      token, 
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    });
  } catch (e) { next(e); }
};
