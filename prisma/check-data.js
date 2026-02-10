const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const productsCount = await prisma.product.count();
    const categoriesCount = await prisma.category.count();
    console.log(`Products: ${productsCount}, Categories: ${categoriesCount}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
