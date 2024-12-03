const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },    
    costPrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
