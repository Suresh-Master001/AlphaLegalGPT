import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const defaultEmail = 'admin@alphalegal.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: defaultEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        email: defaultEmail,
        name: 'Admin User',
        password: hashedPassword,
        isVerified: true,
      }
    });
    console.log('✅ Default admin user created: admin@alphalegal.com / password123');
  } else {
    console.log('✅ Default user already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });