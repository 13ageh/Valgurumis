import { getProductoById } from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default async function ProductoDetalle({ params }) {
  const producto = await getProductoById(params.id);
  
  if (!producto) {
    notFound();
  }

  // CORREGIDO: Usar la ruta correcta /img/ en lugar de /productos/
  const imagenUrl = producto.imagen_principal 
    ? `/img/${producto.imagen_principal.split('/').pop()}` 
    : producto.imagen 
      ? `/img/${producto.imagen.split('/').pop()}`
      : '/placeholder.jpg';
  
  // Procesar imágenes adicionales si existen
  const imagenesAdicionales = producto.imagenes_adicionales || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-cielo-600">Inicio</Link>
        <span className="mx-2">/</span>
        <Link href='/img/ceni.jpg' className="hover:text-cielo-600">Productos</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{producto.nombre}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Galería de imágenes */}
        <div>
          {/* Imagen principal */}
          <div className="relative h-96 w-full rounded-xl overflow-hidden bg-beige-200 shadow-lg mb-4">
            <Image
              src={imagenUrl}
              alt={producto.nombre}
              fill
              className="object-cover"
              priority
              onError={(e) => {
                e.target.src = '/placeholder.jpg';
              }}
            />
          </div>
          
          {/* Miniaturas de imágenes adicionales */}
          {imagenesAdicionales.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {imagenesAdicionales.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden bg-beige-200 cursor-pointer hover:opacity-80 transition">
                  <Image
                    src={`/img/${img.split('/').pop()}`}
                    alt={`${producto.nombre} - vista ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          {/* Categoría */}
          {producto.categoria_nombre && (
            <span className="inline-block bg-cielo-100 text-cielo-700 text-sm px-3 py-1 rounded-full mb-3">
              {producto.categoria_nombre}
            </span>
          )}
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {producto.nombre}
          </h1>
          
          {/* Precio */}
          <div className="mb-4">
            {producto.precio_oferta ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-cielo-600">
                  ${producto.precio_oferta}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  ${producto.precio}
                </span>
                <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                  Oferta
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-cielo-600">
                ${producto.precio}
              </span>
            )}
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Descripción</h3>
            <p className="text-gray-600 leading-relaxed">
              {producto.descripcion_larga || producto.descripcion || producto.descripcion_corta}
            </p>
          </div>

          {/* Detalles adicionales */}
          <div className="border-t border-beige-200 pt-4 mb-6">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {producto.material && (
                <div>
                  <span className="text-gray-500">Material:</span>
                  <span className="text-gray-800 ml-2 font-medium">{producto.material}</span>
                </div>
              )}
              {producto.tiempo_elaboracion_dias && (
                <div>
                  <span className="text-gray-500">Tiempo de elaboración:</span>
                  <span className="text-gray-800 ml-2 font-medium">{producto.tiempo_elaboracion_dias} días</span>
                </div>
              )}
              {producto.stock_actual !== undefined && (
                <div>
                  <span className="text-gray-500">Stock disponible:</span>
                  <span className={`ml-2 font-medium ${producto.stock_actual > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {producto.stock_actual > 0 ? `${producto.stock_actual} unidades` : 'Agotado'}
                  </span>
                </div>
              )}
              {producto.peso_gramos && (
                <div>
                  <span className="text-gray-500">Peso:</span>
                  <span className="text-gray-800 ml-2 font-medium">{producto.peso_gramos} g</span>
                </div>
              )}
            </div>
          </div>

          {/* Botón de compra */}
          <button 
            disabled={producto.stock_actual === 0}
            className={`w-full py-3 rounded-xl text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              producto.stock_actual > 0
                ? 'bg-cielo-500 hover:bg-cielo-600 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {producto.stock_actual > 0 ? (
              <>
                🛒 Comprar ahora
                <span className="text-sm">🎁</span>
              </>
            ) : (
              '❌ Agotado'
            )}
          </button>

          {/* Información de envío */}
          <div className="mt-6 p-4 bg-beige-100 rounded-lg text-sm text-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <span>🚚</span>
              <span className="font-medium">Envío a toda la República</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✨</span>
              <span>Hecho a mano con amor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}