const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    const password = await hash("password123", 12);

    // Create Admin User
    const admin = await prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: {},
        create: {
            email: "admin@example.com",
            username: "admin",
            name: "Admin User",
            password,
            role: "ADMIN",
        },
    });
    console.log({ admin });

    // Create Categories
    const categories = ["Clothing", "Electronics", "Accessories"];
    for (const name of categories) {
        await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }
    console.log("Categories seeded");
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
