const router = require('express').Router();
const { auth } = require('../middleware/auth');
const prisma = require('../lib/prisma');
const SMS = require('../lib/africastalking');

const OTP_TTL_MIN = 10;

router.post('/send-otp', auth, async (req, res, next) => {
  try {
    const phone = req.body.phone?.trim();
    if (!phone) return res.status(400).json({ message: 'Phone required' });

    const code = String(Math.floor(100000 + Math.random()*900000)); // 6-digit
    const expiresAt = new Date(Date.now() + OTP_TTL_MIN*60*1000);

    await prisma.otp.create({
      data: { userId: req.user.id, phone, code, expiresAt }
    });

    await SMS.send({
      to: [phone],
      message: `Your verification code is ${code}. Expires in ${OTP_TTL_MIN} minutes.`,
      from: process.env.AT_SENDER_ID || undefined
    });

    res.json({ ok: true, expiresAt });
  } catch (e) { next(e); }
});

router.post('/verify', auth, async (req, res, next) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ message: 'phone and code are required' });

    const entry = await prisma.otp.findFirst({
      where: { userId: req.user.id, phone },
      orderBy: { createdAt: 'desc' }
    });

    if (!entry) return res.status(400).json({ message: 'No OTP sent' });
    if (entry.verified) return res.json({ ok: true, message: 'Already verified' });
    if (new Date() > entry.expiresAt) return res.status(400).json({ message: 'Code expired' });

    if (entry.code !== code) {
      await prisma.otp.update({ where: { id: entry.id }, data: { attempts: { increment: 1 } } });
      return res.status(400).json({ message: 'Invalid code' });
    }

    await prisma.otp.update({ where: { id: entry.id }, data: { verified: true } });

    // (optional) persist verified phone on user
    await prisma.user.update({
      where: { id: req.user.id },
      data: { phone }
    });

    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
