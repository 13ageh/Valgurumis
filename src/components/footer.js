// src/components/Footer.js
import Link from 'next/link';
import { FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Valgurumis</h3>
            <p className="text-gray-400">
              Muñecos tejidos a mano con amor y dedicación. Cada pieza es única y especial.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Enlaces rápidos</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/" className="hover:text-white transition">Inicio</Link></li>
              <li><Link href="/productos" className="hover:text-white transition">Productos</Link></li>
              <li><Link href="/sobre" className="hover:text-white transition">Sobre mí</Link></li>
              <li><Link href="/contacto" className="hover:text-white transition">Contacto</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Contacto</h4>
            <ul className="space-y-2 text-gray-400">
              <li>📧 ventas@valgurumis.com</li>
              <li>📱 +52 33 2217 8889</li>
              <li>📍 Guadalajara</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Síguenos</h4>
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/valgu_rumis?igsh=MTYyMmM5aGNiemI2eA==" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition-all duration-300"
                aria-label="Instagram"
              >
                <FaInstagram size={28} />
              </a>
              <a 
                href="https://www.facebook.com/share/1D3x6ozBGL/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 transition-all duration-300"
                aria-label="Facebook"
              >
                <FaFacebook size={28} />
              </a>
              <a 
                href="https://www.tiktok.com/@valgurumis6?_r=1&_t=ZS-96UdKfObhJ9#" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-black transition-all duration-300"
                aria-label="TikTok"
              >
                <FaTiktok size={28} />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© 2025 Valgurumis - Hecho con ❤️ puntada a puntada</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;