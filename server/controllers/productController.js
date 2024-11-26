const Product = require("../models/Product");

// Criar Produto
const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (err) {
    res.status(400).json({ error: err.message });
    }
};

// Obter Produtos
const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
};

// Atualizar Produto
const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedProduct);
    } catch (err) {
    res.status(400).json({ error: err.message });
    }
};

// Deletar Produto
const deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
};

module.exports = { createProduct, getProducts, updateProduct, deleteProduct };
