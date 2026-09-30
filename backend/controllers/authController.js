const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.registerUser = async (req, res) => {
    const { name, email, password, role, coords } = req.body;
    
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ error: "Email already in use." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const user = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            role, 
            defaultCoords: coords 
        });
        
        await user.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        res.status(500).json({ error: "Registration failed." });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Create Access Token (Short-lived, sent in JSON response)
        const accessToken = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '15m' }
        );

        // Create Refresh Token (Long-lived, sent in secure cookie)
        const refreshToken = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        // Send Refresh Token as an httpOnly cookie
        res.cookie('jwt', refreshToken, { 
            httpOnly: true, 
            secure: true,
            sameSite: 'None', 
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Send Access Token and user data to the frontend
        res.json({ 
            accessToken, 
            role: user.role, 
            id: user._id, 
            email: user.email,
            coords: user.defaultCoords 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Login failed." });
    }
};

exports.refreshToken = async (req, res) => {
    const cookies = req.cookies;
    
    if (!cookies?.jwt) return res.status(401).json({ error: "No refresh token provided." });
    
    const refreshToken = cookies.jwt;

    jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ error: "Invalid or expired refresh token." });

        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ error: "User not found." });

        // Issue a new Access Token
        const accessToken = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '15m' }
        );

        res.json({ accessToken, role: user.role });
    });
};

exports.logoutUser = (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);
    
    // Clear the cookie — flags MUST match the ones used when setting it
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.json({ message: "Logged out successfully" });
};
