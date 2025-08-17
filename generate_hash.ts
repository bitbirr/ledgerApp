import bcrypt from 'bcrypt';

async function generateHash() {
  const password = 'adminpassword';
  const saltRounds = 12;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log('Generated hash for "adminpassword":', hash);
}

generateHash();