import jwt from 'jsonwebtoken';

/**
 * Generates a signed JWT containing the user's ID.
 * @param {string} id - MongoDB user document ID
 * @returns {string} signed JWT
 */
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};
