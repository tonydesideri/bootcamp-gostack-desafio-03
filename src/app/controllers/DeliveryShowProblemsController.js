import DeliveryProblem from '../models/DeliveryProblem';
import Delivery from '../models/Delivery';

class DeliveryShowProblemsController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const { id: delivery_id } = req.params;

    const deliveryExists = await Delivery.findByPk(delivery_id);

    if (!deliveryExists) {
      return res.status(400).json({ error: 'Delivery does not exist' });
    }

    const deliveryProblems = await DeliveryProblem.findAll({
      where: {
        delivery_id,
      },
      limit: 10,
      offset: (page - 1) * 10,
    });

    if (!deliveryProblems.delivery_id) {
      return res.status(401).json({ error: 'Delivery problems not found' });
    }

    return res.json(deliveryProblems);
  }
}
export default new DeliveryShowProblemsController();
