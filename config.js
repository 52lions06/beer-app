require('dotenv').config();

exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
	                'mongodb://localhost/beer1';
exports.TEST_DATABASE_URL = (
	process.env.TEST_DATABASE_URL ||
	'mongodb://localhost/test-beer1');
exports.PORT = process.env.PORT || 8080;

console.log('What does travis look like here: ', process.env)