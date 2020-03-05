import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import NotificationSchema from '../schemas/NotificationSchema';
import File from '../models/File';

import NotificationMail from '../jobs/NotificationMail';
import Queue from '../../lib/Queue';

class DeliveryController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const deliveries = await Delivery.findAll({
      where: {
        canceled_at: null,
      },
      order: ['created_at'],
      attributes: ['product'],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name', 'street', 'number'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['url'],
            },
          ],
        },
      ],
    });

    return res.json(deliveries);
  }

  async store(req, res) {
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

    const checkDeliverymanExists = await Deliveryman.findByPk(deliveryman_id);
    if (!checkDeliverymanExists) {
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

      await Queue.add(NotificationMail.key, {
        delivery,
        recipient,
        deliveryman,
      });
    }

    return res.json(delivery);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string(),
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

    const checkDeliverymanExists = await Deliveryman.findByPk(deliveryman_id);
    if (!checkDeliverymanExists) {
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

    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(401).json({ error: 'Delivery não encontrado' });
    }

    await delivery.update(req.body);

    return res.json(delivery);
  }

  async delete(req, res) {
    const delivery = await Delivery.findByPk(req.params.id, {
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'street', 'number'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['url'],
            },
          ],
        },
      ],
    });

    if (!delivery) {
      return res.status(401).json({ error: 'Delivery not found' });
    }

    if (delivery.start_date !== null) {
      return res
        .status(401)
        .json({ error: 'Delivery has already been withdrawn' });
    }

    const canceled = delivery.canceled_at;
    if (canceled) {
      return res.status(400).json({ error: 'Delivery already canceled' });
    }

    delivery.canceled_at = new Date();
    await delivery.save();

    return res.json(delivery);
  }
}

export default new DeliveryController();
