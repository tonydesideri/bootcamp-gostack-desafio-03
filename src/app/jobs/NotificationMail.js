import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'NotificationMail';
  }

  async handle({ data }) {
    const { deliveryman, delivery, recipient } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Nova encomenda',
      template: 'notification',
      context: {
        deliverymanName: deliveryman.name,
        product: delivery.product,
        RecipientName: recipient.name,
        street: recipient.street,
        number: recipient.number,
      },
    });
  }
}

export default new CancellationMail();
