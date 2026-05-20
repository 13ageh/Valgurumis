'use client';

import Link from 'next/link';
import Carrito from './Carrito';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🧸</span>
            <span className="text-2xl font-bold text-gray-800">
              Valgurumis
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-700 hover:text-cielo-500 transition-colors font-medium">
              Inicio
            </Link>
            <Link href="/productos" className="text-gray-700 hover:text-cielo-500 transition-colors font-medium">
              Productos
            </Link>
            <Link href="/sobre" className="text-gray-700 hover:text-cielo-500 transition-colors font-medium">
              Sobre mí
            </Link>
            <Link href="/contacto" className="text-gray-700 hover:text-cielo-500 transition-colors font-medium">
              Contacto
            </Link>
            <Carrito />
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-2xl text-gray-700"
          >
            ☰
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-beige-200">
            <div className="flex flex-col gap-4">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-cielo-500 font-medium">
                Inicio
              </Link>
              <Link href="/productos" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-cielo-500 font-medium">
                Productos
              </Link>
              <Link href="/sobre" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-cielo-500 font-medium">
                Sobre mí
              </Link>
              <Link href="/contacto" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-cielo-500 font-medium">
                Contacto
              </Link>
              <div className="pt-2">
                <Carrito />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}