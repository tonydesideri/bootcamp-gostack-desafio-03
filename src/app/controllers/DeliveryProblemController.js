import * as Yup from 'yup';
import DeliveryProblem from '../models/DeliveryProblem';
import Delivery from '../models/Delivery';

class DeliveryProblemController {
  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id: delivery_id } = req.params;
    const { description } = req.body;

    const delivery = await Delivery.findByPk(delivery_id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found' });
    }

    const deliveryProblem = await DeliveryProblem.create({
      delivery_id,
      description,
    });

    return res.json(deliveryProblem);
  }
}

export default new DeliveryProblemController();
