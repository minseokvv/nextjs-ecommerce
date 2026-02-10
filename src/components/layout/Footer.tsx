import Link from "next/link";
import { Container } from "@/components/ui/Container";

export function Footer() {
    return (
        <footer className="border-t bg-slate-50 py-12">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="text-xl font-bold text-slate-900">
                            Dbaek
                        </Link>
                        <p className="mt-4 text-sm text-slate-500 max-w-xs">
                            Premium shopping experience for your lifestyle.
                            Quality products, fast delivery, and excellent customer service.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900 mb-4">Shop</h3>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li><Link href="/products" className="hover:text-indigo-600">All Products</Link></li>
                            <li><Link href="/products?category=new" className="hover:text-indigo-600">New Arrivals</Link></li>
                            <li><Link href="/products?category=sale" className="hover:text-indigo-600">Sale</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900 mb-4">Support</h3>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li><Link href="/faq" className="hover:text-indigo-600">FAQ</Link></li>
                            <li><Link href="/contact" className="hover:text-indigo-600">Contact Us</Link></li>
                            <li><Link href="/terms" className="hover:text-indigo-600">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-slate-200 pt-8 text-center text-sm text-slate-400">
                    &copy; {new Date().getFullYear()} Dbaek. All rights reserved.
                </div>
            </Container>
        </footer>
    );
}
