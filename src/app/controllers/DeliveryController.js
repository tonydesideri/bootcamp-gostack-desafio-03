import * as Yup from 'yup';
import User from '../models/User';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import NotificationSchema from '../schemas/NotificationSchema';

class DeliveryController {
  async index(req, res) {
    return res.json();
  }

  async store(req, res) {
    const user = await User.findByPk(req.userId);

    if (user.email !== 'admin@fastfeet.com') {
      return res.status(401).json({ error: 'Is not administrator' });
    }

    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id } = req.body;

    const checkRecipientExists = await Recipient.findByPk(recipient_id);
    if (!checkRecipientExists) {
      return res.status(400).json({ error: 'Recipient does not exist.' });
    }

    const checkDeliverumanExists = await Deliveryman.findByPk(deliveryman_id);
    if (!checkDeliverumanExists) {
      return res.status(400).json({ error: 'Deliveryman does not exist.' });
    }

    const checkDeliveryExists = await Delivery.findOne({
      where: {
        recipient_id,
        deliveryman_id,
        canceled_at: null,
        start_date: null,
      },
    });

    if (checkDeliveryExists) {
      return res.status(400).json({ error: 'Order already registred.' });
    }

    const delivery = await Delivery.create(req.body);

    if (delivery) {
      const recipient = await Recipient.findByPk(recipient_id);
      const deliveryman = await Deliveryman.findByPk(deliveryman_id);
      await NotificationSchema.create({
        content: `Nova entrega na ${recipient.street} número ${recipient.number} para ${recipient.name}. Entregador: ${deliveryman.name}`,
        deliveryman_id,
      });
    }

    return res.json(delivery);
  }

  async update(req, res) {
    return res.json();
  }

  async delete(req, res) {
    return res.json();
  }
}

export default new DeliveryController();
