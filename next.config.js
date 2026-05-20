/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Configuración para imágenes locales en /public/img/
    localPatterns: [
      {
        pathname: '/img/**',
        search: '',
      },
    ],
    // Si usas imágenes desde URLs externas en el futuro:
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: '**.cloudinary.com',
    //   },
    // ],
  },
};

module.exports = nextConfig;