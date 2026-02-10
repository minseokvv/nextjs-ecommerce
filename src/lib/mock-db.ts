// Simple in-memory store for demonstration purposes
// In a real app, this would be a database

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    imageUrl?: string;
    createdAt: Date;
}

// Initial Mock Data
let products: Product[] = [
    {
        id: "1",
        name: "프리미엄 무선 헤드셋",
        description: "노이즈 캔슬링, 30시간 배터리 수명.",
        price: 299000,
        stock: 15,
        category: "전자기기",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        createdAt: new Date(),
    },
    {
        id: "2",
        name: "미니멀 가죽 시계",
        description: "클래식 디자인, 천연 가죽 스트랩.",
        price: 120000,
        stock: 8,
        category: "액세서리",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
        createdAt: new Date(),
    },
    {
        id: "3",
        name: "스마트 스피커",
        description: "음성 인식 제어, 고음질 사운드.",
        price: 99000,
        stock: 42,
        category: "전자기기",
        imageUrl: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800&q=80",
        createdAt: new Date(),
    },
];

export const mockDb = {
    product: {
        findMany: async () => products,
        create: async ({ data }: { data: any }) => {
            const newProduct = {
                id: Math.random().toString(36).substr(2, 9),
                ...data,
                createdAt: new Date(),
            };
            products.unshift(newProduct);
            return newProduct;
        },
        // Add other methods as needed
    },
    user: {
        findUnique: async ({ where }: { where: { email: string } }) => {
            if (where.email === 'admin@store.com') {
                return {
                    id: 'admin-id',
                    email: 'admin@store.com',
                    password: 'admin',
                    role: 'ADMIN'
                }
            }
            return null;
        }
    }
};
