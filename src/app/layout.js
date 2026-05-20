import Link from 'next/link';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/footer';  // ← Descomentado

export const metadata = {
  title: 'Valgurumis - Muñecos Tejidos a Mano',
  description: 'Amigurumis únicos hechos con amor, cada puntada es especial',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-beige-300">
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}