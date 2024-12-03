const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      packaging: { type: String, required: true },
    },
  ],
  total: { type: Number, required: true }, // Total sem juros
  totalComJuros: { type: Number, required: false }, // Total com juros
  embalagemTotal: { type: Number, required: false }, // Custo total de embalagens
  lucro: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  installments: { type: Number, default: 1 }, // Número de parcelas, padrão 1
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Sale', SaleSchema);