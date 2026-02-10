const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const username = 'myoeemyo';
    const user = await prisma.user.findFirst({
        where: { username },
    });

    if (user) {
        console.log(`User found: ${user.username}`);
        console.log(`Role: ${user.role}`);

        // Check password
        const bcrypt = require('bcryptjs');
        const isValid = await bcrypt.compare('admin', user.password);
        console.log(`Is password 'admin' correct?: ${isValid}`);
    } else {
        console.log('User not found.');
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
