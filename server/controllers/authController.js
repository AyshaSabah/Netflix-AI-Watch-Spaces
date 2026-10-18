import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { inMemoryStore } from '../config/inMemoryStore.js';
import { getIsMongoConnected } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'netflix_ai_spaces_secret_jwt_key_2025';

// Helper to sign JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Register user
export const register = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }

    // Check if user already exists
    let existingUser = inMemoryStore.findUserByEmail(email);
    if (!existingUser && getIsMongoConnected()) {
      try {
        existingUser = await User.findOne({ email: email.toLowerCase() });
      } catch (err) {
        // Ignored if mongo not connected
      }
    }

    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user in memory store
    const userInMem = inMemoryStore.createUser({
      name,
      email,
      password: hashedPassword,
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    });

    // Also attempt MongoDB save if connected
    if (getIsMongoConnected()) {
      try {
        await User.create({
          name,
          email,
          password: hashedPassword,
          avatar: userInMem.avatar,
        });
      } catch (err) {
        // Safe to ignore mongo error
      }
    }

    const token = generateToken(userInMem.id);

    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: userInMem.id,
        name: userInMem.name,
        email: userInMem.email,
        avatar: userInMem.avatar,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Failed to register user.' });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    let user = inMemoryStore.findUserByEmail(email);
    if (!user && getIsMongoConnected()) {
      try {
        user = await User.findOne({ email: email.toLowerCase() });
      } catch (err) {
        // Ignored
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user._id || user.id);

    return res.json({
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to log in.' });
  }
};

// Get current user profile from token
export const getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    let user = inMemoryStore.findUserById(decoded.id);
    if (!user && getIsMongoConnected()) {
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (err) {
        // Ignored
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
};

// Quick guest demo login for instant testing
export const loginAsGuest = (req, res) => {
  const randomNum = Math.floor(100 + Math.random() * 900);
  const guestUser = {
    id: `guest-${Date.now()}`,
    name: `MovieFan${randomNum}`,
    email: `guest${randomNum}@netflixspaces.com`,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=guest${randomNum}`,
  };

  const token = generateToken(guestUser.id);
  return res.json({
    message: 'Logged in as Guest!',
    token,
    user: guestUser,
  });
};
