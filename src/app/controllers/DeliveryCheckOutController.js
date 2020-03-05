import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import Signature from '../models/File';

class DeliveryCheckOutController {
  async update(req, res) {
    const deliveryId = req.params.id;

    if (!deliveryId) {
      return res.status(400).json({ error: 'Not Found' });
    }

    const schema = Yup.object().shape({
      signature_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found' });
    }

    if (delivery.end_date !== null) {
      return res.status(401).json({ error: 'Finalized order' });
    }

    if (delivery.canceled_at !== null) {
      return res.status(401).json({ error: 'Order canceled' });
    }

    if (delivery.start_date === null) {
      return res.status(401).json({ error: 'order not yet withdrawn' });
    }

    const { signature_id } = req.body;

    const signature = await Signature.findByPk(signature_id);

    if (!signature) {
      return res.status(401).json({ error: 'Signature not found' });
    }

    delivery.end_date = new Date();
    await delivery.save();

    return res.json(delivery);
  }
}
export default new DeliveryCheckOutController();
