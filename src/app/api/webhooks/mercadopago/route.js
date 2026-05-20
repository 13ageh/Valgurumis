import { payment } from '@/lib/mercadopago';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { type, data } = await request.json();

    if (type === 'payment') {
      const paymentId = data.id;
      
      // Obtener información del pago
      const paymentInfo = await payment.get({ id: paymentId });
      
      const { status, external_reference, transaction_amount, payer } = paymentInfo;
      
      const pedidoId = external_reference;
      
      if (status === 'approved') {
        // Iniciar transacción
        const client = await query('BEGIN');
        
        try {
          // Actualizar estado del pedido
          await client.query(
            `UPDATE pedidos 
             SET estado = 'pagado', 
                 fecha_pago = CURRENT_TIMESTAMP,
                 metodo_pago = 'mercadopago',
                 total = $1
             WHERE id = $2`,
            [transaction_amount, pedidoId]
          );
          
          // Actualizar stock (el trigger lo hará automático)
          // Registrar el pago
          await client.query(
            `INSERT INTO pagos (pedido_id, monto, metodo_pago, transaction_id, status)
             VALUES ($1, $2, 'mercadopago', $3, $4)`,
            [pedidoId, transaction_amount, paymentId, status]
          );
          
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
      } else if (status === 'rejected') {
        await query(
          `UPDATE pedidos SET estado = 'cancelado' WHERE id = $1`,
          [pedidoId]
        );
      }
    }
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error en webhook de Mercado Pago:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}