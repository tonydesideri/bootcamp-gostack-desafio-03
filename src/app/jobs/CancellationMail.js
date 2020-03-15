import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { delivery } = data;

    await Mail.sendMail({
      to: `${delivery.deliveryman.name} <${delivery.deliveryman.email}>`,
      subject: 'Novo Cancelamento',
      template: 'cancellation',
      context: {
        deliverymanName: delivery.deliveryman.name,
        product: delivery.product,
        RecipientName: delivery.recipient.name,
        street: delivery.recipient.street,
        number: delivery.recipient.number,
      },
    });
  }
}

export default new CancellationMail();
