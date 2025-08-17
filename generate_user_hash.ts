import bcrypt from 'bcrypt';

async function generateHash() {
  const password = 'password123';
  const saltRounds = 12;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Generated hash for "password123":', hash);
}

generateHash();