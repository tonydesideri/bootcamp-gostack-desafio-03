import Signature from '../models/File';

class SingnatureController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;

    const signature = await Signature.create({
      name,
      path,
    });
    return res.json(signature);
  }
}

export default new SingnatureController();
