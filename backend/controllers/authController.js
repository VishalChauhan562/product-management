const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ username, password });
    res.status(201).json({ token: generateToken(user), user });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};


const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({ token: generateToken(user), user });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

module.exports = { registerUser, loginUser };
