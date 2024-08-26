// Import all required modules and dependencies
const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const { check, validationResult } = require('express-validator');

// Initialize the app
const app = express();
dotenv.config();

// Middleware to handle incoming data
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());
app.use(express.json()); // To parse incoming JSON data
app.use(express.urlencoded({ extended: true }));

// Configure session middleware
app.use(session({
    secret: 'vxULptr01yyXZ_qews',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set true if using https
}));

// Connect to the database
let my_database;
(async function initializeDatabase() {
    try {
        my_database = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });
        console.log('Connected to database');

        // Create a database for the expenses
        await my_database.query(`CREATE DATABASE IF NOT EXISTS expense_tracker_database`);

        // Use the database
        await my_database.query(`USE expense_tracker_database`);

        // Query to add user table in the database
        const usersTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                email VARCHAR(40) UNIQUE NOT NULL,
                username VARCHAR(40) NOT NULL,
                password VARCHAR(255) NOT NULL
            )
        `;
        await my_database.query(usersTableQuery);

        // Query to create expenses table
        const expensesTableQuery = `
            CREATE TABLE IF NOT EXISTS expenses (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT,
                category VARCHAR(50) NOT NULL,
                name VARCHAR(100) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                date DATE NOT NULL,
                description VARCHAR(255),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `;
        await my_database.query(expensesTableQuery);

    } catch (error) {
        console.error(`Database connection error: ${error.message}`);
    }
})();

// Define routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', '/index.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', '/register.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', '/login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', '/dashboard.html'));
});

app.get('/add_expenses', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', '/add_expenses.html'));
});

app.get('/delete_expenses', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', '/delete_expenses.html'));
});

app.get('/update_expenses', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', '/update_expenses.html'));
});

app.get('/view_expenses', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', '/view_expenses.html'));
});

// User management
const my_users = {
    table_name: 'users',
    create_user: async (new_user) => {
        return my_database.query(`INSERT INTO ${my_users.table_name} SET ?`, new_user);
    },
    getUserByEmail: async (email) => {
        const [rows] = await my_database.query(`SELECT * FROM ${my_users.table_name} WHERE email = ?`, [email]);
        return rows[0];
    }
};

// Route for registering user
app.post('/api/register', [
    check('email').isEmail().withMessage("Input a valid email address!"),
    check('email').custom(async (value) => {
        const user = await my_users.getUserByEmail(value);
        if (user) {
            throw new Error("Email already exists");
        }
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    const new_user = {
        email: req.body.email,
        username: req.body.username,
        password: hashed_password
    };

    // Save the user to the users table
    try {
        await my_users.create_user(new_user);
        console.log('New user created successfully');
        res.status(200).json(new_user);
    } catch (error) {
        console.error("Error inserting new user", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Handling the login logic
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await my_users.getUserByEmail(email);

        if (!user) {
            return res.status(400).json({ message: 'You do not have an account! Please register.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            req.session.user = { id: user.id, email: user.email };
            return res.status(200).json({ message: 'Login successful, redirecting...' });
        } else {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ message: 'Internal server error! Please retry.' });
    }
});

//api to handle username retrieval
app.get('/api/username_details', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'User unknown' });
    }

    const userId = req.session.user.id;

    try {
        const [rows] = await my_database.query('SELECT username FROM users WHERE id = ?', [userId]);

        if (rows.length > 0) {
            res.status(200).json({ username: rows[0].username });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error retrieving username:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handling the delete_user route
app.delete('/api/user/delete_account', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unknown user' });
    }

    const userId = req.session.user.id;

    try {
        // Start a transaction
        await my_database.beginTransaction();

        // Delete expenses linked to the user
        await my_database.query(`DELETE FROM expenses WHERE user_id = ?`, [userId]);

        // Delete the user
        await my_database.query(`DELETE FROM users WHERE id = ?`, [userId]);

        // Commit the transaction
        await my_database.commit();

        // Destroy the session after deleting the user
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete session' });
            }
            res.status(200).json({ message: 'Account and associated expenses deleted successfully' });
        });

    } catch (error) {
        // Rollback the transaction in case of an error
        await my_database.rollback();
        console.error('Error during account deletion:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Handling adding expenses
app.post('/api/expenses/add_expenses', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized access' });
    }

    const { expense_category, expense_name, expense_amount, expense_date, expense_description } = req.body;
    const userId = req.session.user.id;

    try {
        const insert_expense = `INSERT INTO expenses (user_id, category, name, amount, date, description) VALUES (?, ?, ?, ?, ?, ?)`;
        await my_database.query(insert_expense, 
            [userId, expense_category, expense_name, expense_amount, expense_date, expense_description]);

        return res.status(200).json({ message: 'Expense was successfully added' });
    } catch (error) {
        console.error('Error adding expense:', error.message);
        return res.status(500).json({ error: error.message });
    }
});

// handling expenses categories
app.get('/api/expenses/expense_categories', async(req, res) => {
    if(!req.session.user) {
        return res.status(401).json({error: 'access to database error!'});
    }

    const userId = req.session.user.id;

        try {
            const[rows] = await my_database.query(`SELECT * FROM expenses WHERE user_id = ?`, [userId]);
            res.status(200).json(rows);
        } catch (error) {
            res.status(500).json({error: 'Internal server error'});
        }
});

// Handling retrieving expenses
app.get('/api/expenses/view_expenses', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized access' });
    }

    const userId = req.session.user.id;

    try {
        const [rows] = await my_database.query(`SELECT * FROM expenses WHERE user_id = ?`, [userId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching expenses:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to get expenses grouped by category
app.get('/api/expenses/sum-by-category', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized access' });
    }

    const userId = req.session.user.id;

    try {
        const [rows] = await my_database.query(`
            SELECT category, SUM(amount) as total
            FROM expenses
            WHERE user_id = ?
            GROUP BY category
        `, [userId]);

        const categories = [];
        const amounts = [];

        rows.forEach(row => {
            categories.push(row.category);
            amounts.push(parseFloat(row.total));
        });

        res.json({ categories, amounts });
    } catch (error) {
        console.error('Error fetching expenses:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
    if (error) {
        console.log("Error starting server!");
    } else {
        console.log(`Server running on port: ${PORT}`);
    }
});
