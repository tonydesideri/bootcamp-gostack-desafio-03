import { Op } from 'sequelize';
import { getTime, format, startOfDay, endOfDay } from 'date-fns';
import Delivery from '../models/Delivery';

class DeliveryCheckInController {
  async update(req, res) {
    const deliveryId = req.params.id;

    if (!deliveryId) {
      return res.status(400).json({ error: 'Not Found' });
    }

    const date = new Date();
    const dateFormat = format(getTime(date), 'HH:mm:ss');
    if (!(dateFormat > '08:00:00' && dateFormat < '18:00:00')) {
      return res.status(401).json({ error: 'Time not available for pickup' });
    }

    const delivery = await Delivery.findByPk(deliveryId);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found' });
    }

    const checkIn = delivery.start_date;
    if (checkIn) {
      return res
        .status(400)
        .json({ error: 'Product has already been withdrawn' });
    }

    const { count } = await Delivery.findAndCountAll({
      where: {
        deliveryman_id: delivery.deliveryman_id,
        start_date: {
          [Op.between]: [startOfDay(date), endOfDay(date)],
        },
      },
    });

    if (count >= 5) {
      return res.status(400).json({ error: 'Maximum withdrawals in one day' });
    }

    delivery.start_date = date;
    await delivery.save();

    return res.json(delivery);
  }
}

export default new DeliveryCheckInController();
