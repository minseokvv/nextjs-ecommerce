const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const username = 'myoeemyo';
    const password = '1234'; // Simple password for testing
    const name = '관리자';

    console.log(`Creating admin user: ${username}...`);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { username },
        update: {
            password: hashedPassword, // Update password if exists
            role: 'ADMIN',
        },
        create: {
            username,
            password: hashedPassword,
            name,
            role: 'ADMIN',
        },
    });

    console.log('Admin user created/updated successfully!');
    console.log('Username:', admin.username);
    console.log('Password:', password); // Only log plain text once for confirmation
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
