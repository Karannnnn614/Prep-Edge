const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('=== Environment Variable Check ===');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL value:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  console.log('URL starts with postgresql://', url.startsWith('postgresql://'));
  console.log('URL starts with postgres://', url.startsWith('postgres://'));
  console.log('URL first 20 chars:', url.substring(0, 20));
} else {
  console.log('DATABASE_URL is not set!');
}

console.log('\n=== All Environment Variables ===');
Object.keys(process.env).forEach(key => {
  if (key.includes('DATABASE') || key.includes('CLERK') || key.includes('GEMINI')) {
    console.log(`${key}: ${process.env[key] ? 'SET' : 'NOT SET'}`);
  }
});
