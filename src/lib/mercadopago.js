import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

export const preference = new Preference(client);
export const payment = new Payment(client);

export async function crearPreferenciaPago(pedido, items, successUrl, failureUrl, pendingUrl) {
  const preferenceData = {
    items: items.map(item => ({
      title: item.nombre,
      quantity: item.cantidad,
      unit_price: item.precio,
      currency_id: 'MXN',
      picture_url: item.imagen_url || null,
      description: item.descripcion_corta || '',
    })),
    payer: {
      email: pedido.cliente_email,
      name: pedido.cliente_nombre,
    },
    back_urls: {
      success: successUrl,
      failure: failureUrl,
      pending: pendingUrl,
    },
    auto_return: 'approved',
    external_reference: pedido.id.toString(),
    notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
    statement_descriptor: 'VALGURUMIS',
    shipping_preferences: {
      receiver_address: {
        zip_code: pedido.codigo_postal,
        city_name: pedido.ciudad,
        state_name: pedido.estado,
        street_name: pedido.calle,
      },
    },
  };

  const response = await preference.create({ body: preferenceData });
  return response;
}