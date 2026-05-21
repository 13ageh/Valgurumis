import { getProductoById } from '@/lib/db';
import { notFound } from 'next/navigation';
import ProductoDetalleClient from '@/components/ProductoDetalleClient';

export default async function ProductoDetalle({ params }) {
  const { id } = await params;
  const producto = await getProductoById(id);
  
  if (!producto) {
    notFound();
  }

  const imagenUrl = producto.imagen_principal 
    ? `/img/${producto.imagen_principal.split('/').pop()}` 
    : producto.imagen 
      ? `/img/${producto.imagen.split('/').pop()}`
      : '/placeholder.jpg';

  const imagenesAdicionales = producto.imagenes_adicionales || [];

  return (
    <ProductoDetalleClient 
      producto={producto}
      imagenUrl={imagenUrl}
      imagenesAdicionales={imagenesAdicionales}
    />
  );
}