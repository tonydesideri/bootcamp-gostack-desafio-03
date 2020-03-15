import * as Yup from 'yup';
import { Sequelize, Op } from 'sequelize';
import DeliveryProblem from '../models/DeliveryProblem';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class DeliveryProblemController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const deliveriesProblems = await Delivery.findAll({
      where: {
        id: {
          [Op.in]: Sequelize.literal(
            '(select distinct ("delivery_id") from "delivery_problems")'
          ),
        },
      },
      limit: 10,
      offset: (page - 1) * 10,
    });

    return res.json(deliveriesProblems);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id: delivery_id } = req.params;
    const { description } = req.body;
    const { id: deliveryman_id } = req.query;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    const delivery = await Delivery.findOne({
      where: { id: delivery_id, deliveryman_id },
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found' });
    }

    const deliveryProblem = await DeliveryProblem.create({
      delivery_id,
      description,
    });

    return res.json(deliveryProblem);
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryProblem = await DeliveryProblem.findByPk(id);

    if (!deliveryProblem) {
      return res.status(400).json({ error: 'Problem does not exists' });
    }

    const { delivery_id } = deliveryProblem;

    const delivery = await Delivery.findByPk(delivery_id, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'street', 'number'],
        },
      ],
    });

    if (delivery.canceled_at || delivery.end_date) {
      return res.json(delivery);
    }

    delivery.canceled_at = new Date();
    delivery.save();

    await Queue.add(CancellationMail.key, {
      delivery,
    });

    return res.json(delivery);
  }
}

export default new DeliveryProblemController();
