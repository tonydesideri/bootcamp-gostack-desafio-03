import { Op } from 'sequelize';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Signature from '../models/File';
import Recipient from '../models/Recipient';

class DeliverymanDelivery {
  async index(req, res) {
    const { delivered, page = 1 } = req.query;

    const deliveryman = await Deliveryman.findByPk(req.params.id);

    if (!deliveryman) {
      return res.status(401).json({ error: 'Deliveryman not found' });
    }

    const deliverymanDeliveries = await Delivery.findAll({
      where: {
        deliveryman_id: req.params.id,
        canceled_at: null,
        end_date: {
          [Op[delivered === 'true' ? 'ne' : 'eq']]: null,
        },
      },
      attributes: ['id', 'product'],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: Signature,
          as: 'signature',
          attributes: ['path', 'url'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'street', 'number'],
        },
      ],
    });

    return res.json(deliverymanDeliveries);
  }
}
export default new DeliverymanDelivery();
