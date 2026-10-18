import jwt from 'jsonwebtoken';

export const signToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'supersecret_jwt_placeconnect_dev_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'supersecret_jwt_placeconnect_dev_key';
  return jwt.verify(token, secret);
};

export const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = signToken({
    id: user._id,
    role: user.role,
    email: user.email,
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieSecure = process.env.COOKIE_SECURE === 'true' || isProduction;

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: cookieSecure,
    sameSite: isProduction ? 'strict' : 'lax',
  };

  // Safe user representation (omit passwordHash)
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus,
    lastLoginAt: user.lastLoginAt,
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      token, // Also return token in body for mobile/Postman API clients
      user: userData,
    });
};
