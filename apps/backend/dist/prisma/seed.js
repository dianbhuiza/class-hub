"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = __importDefault(require("pg"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const pool = new pg_1.default.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
const subjects = [
    {
        name: 'Aritmética',
        img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop',
    },
    {
        name: 'Álgebra',
        img: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
    },
    {
        name: 'Trigonometría',
        img: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=300&fit=crop',
    },
    {
        name: 'Geometría',
        img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop',
    },
    {
        name: 'Razonamiento Matemático',
        img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop',
    },
    {
        name: 'Física',
        img: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=300&fit=crop',
    },
    {
        name: 'Química',
        img: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop',
    },
    {
        name: 'Biología',
        img: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&h=300&fit=crop',
    },
    {
        name: 'Valores',
        img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    },
    {
        name: 'Lenguaje',
        img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop',
    },
    {
        name: 'Historia',
        img: 'https://images.unsplash.com/photo-1461360370896-922624d12a74?w=400&h=300&fit=crop',
    },
    {
        name: 'Geografía',
        img: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400&h=300&fit=crop',
    },
    {
        name: 'Economía',
        img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
    },
    {
        name: 'Comunicación',
        img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop',
    },
];
async function main() {
    console.log('Seeding admin user...');
    const adminEmail = 'admin@classhub.com';
    const adminPassword = 'admin123';
    const hashedPassword = await bcryptjs_1.default.hash(adminPassword, 10);
    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: hashedPassword,
            name: 'Admin',
        },
    });
    console.log(`  ✓ Admin: ${adminEmail} / ${adminPassword}`);
    console.log('Seeding subjects...');
    for (const subject of subjects) {
        await prisma.subject.upsert({
            where: { name: subject.name },
            update: { img: subject.img },
            create: {
                name: subject.name,
                img: subject.img,
            },
        });
        console.log(`  ✓ ${subject.name}`);
    }
    console.log('Seeding complete!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
//# sourceMappingURL=seed.js.map