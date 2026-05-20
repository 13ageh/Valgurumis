import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function crearSessionPago(pedido, items, successUrl, cancelUrl) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: items.map(item => ({
      price_data: {
        currency: 'mxn',
        product_data: {
          name: item.nombre,
          description: item.descripcion_corta || '',
          images: item.imagen_url ? [item.imagen_url] : [],
        },
        unit_amount: Math.round(item.precio * 100), // Stripe usa centavos
      },
      quantity: item.cantidad,
    })),
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      pedido_id: pedido.id,
      cliente_email: pedido.cliente_email,
    },
    customer_email: pedido.cliente_email,
    shipping_address_collection: {
      allowed_countries: ['MX', 'US', 'ES'],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 5000, currency: 'mxn' }, // $50 MXN
          display_name: 'Envío estándar',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 5 },
            maximum: { unit: 'business_day', value: 7 },
          },
        },
      },
    ],
  });

  return session;
}