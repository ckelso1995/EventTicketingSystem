const User = require('../Models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        // code to make sure duplicate emails cant be used
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        // using bycrpt has the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user', //default to user
        });

        // save to the database, and error messaging below
        await newUser.save();

        res.status(201).json({ message: 'User successfully registered.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while registering the user.' });
    }
};


//user details to log in
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        //checks to make sure the password is valid
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        //jwt token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful.', token, userId: user._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred during login.' });
    }
};




module.exports = { registerUser, loginUser };

