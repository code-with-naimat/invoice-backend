const Client = require('../models/Client');
// GET /api/clients
async function getClients(req, res, next) {
  try {
    const clients = await Client.find({ 
     owner: req.user._id }).sort('-createdAt');
    res.json(clients);
  } catch (err) {
    next(err);
  }
}
// POST /api/clients
async function createClient(req, res, next) {
 try {   
    const { name, email, address } = req.body;
  if (!name) return res.status(400).json({ message: 'Client name is required' });
    const client = await Client.create({ owner: req.user._id, name, email, address });
    res.status(201).json(client);
  } catch (err) {
    next(err);
  }
}
// PUT /api/clients/:id
async function updateClient(req, res, next) {
  try {
    const { name, email, address } = req.body;
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { name, email, address },
      { new: true, runValidators: true }
    );
     if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
      res.json(client);
  } catch (err) {
    next(err);
  }
}
// DELETE /api/clients/:id
async function deleteClient(req, res, next) 
{
  try {
    const client = await 
Client.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    next(err);
  }
}
module.exports = { getClients, createClient, updateClient, deleteClient };