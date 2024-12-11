const mongoose = require('mongoose');

const PackagingSchema = new mongoose.Schema({
    type: { type: String, required: true }, // Ex: "Pacote", "Sacola Pequena", "Sacola Grande"
    price: { type: Number, required: true }, // Ex: 3.50, 6.00, 8.00
    quantity: { type: Number, required: true }, // Quantidade no estoque
});

module.exports = mongoose.model('Packaging', PackagingSchema);
