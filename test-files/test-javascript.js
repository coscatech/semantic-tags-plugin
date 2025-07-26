// Network calls - should be tagged as "Network Call"
fetch('/api/data');
axios.get('/users');
http.get('https://example.com');

// Debug statements - should be tagged as "Debug Statement"
console.log('Debug info');
console.error('Error occurred');
console.warn('Warning message');

// TODOs - should be tagged as "Unfinished Block"
// TODO: Implement error handling
// FIXME: This is broken
// HACK: Temporary solution
// XXX: Review this code

// Database operations - should be tagged as "Database Operation"
const user = await User.findOne({id: 123});
query('SELECT * FROM users');
INSERT INTO users VALUES (1, 'John');
UPDATE users SET name = 'Jane';

// Error handling - should be tagged as "Error Handling"
try {
    riskyOperation();
} catch (error) {
    throw new Error('Something went wrong');
}

// Authentication - should be tagged as "Authentication"
const token = jwt.sign(payload, secret);
if (user.authenticated) {
    login(user);
}
const session = getSession();

// Configuration - should be tagged as "Configuration"
const apiUrl = process.env.API_URL;
const config = require('./config.json');
const settings = getSettings();