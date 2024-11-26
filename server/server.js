const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Middlewares
app.use(express.json()); // Permitir parsing de JSON no corpo das requisições
app.use(cors()); // Habilitar CORS para todas as origens

// Configurações
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Modelo do Produto
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const Product = mongoose.model('Product', productSchema);

// Conectar ao MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado ao MongoDB!'))
  .catch((err) => {
    console.error('Erro de conexão ao MongoDB:', err.message);
    process.exit(1);
  });

// Rotas

// Adicionar um produto
app.post('/api/products', async (req, res) => {
  const { name, price, quantity } = req.body;

  if (!name || !price || !quantity) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const newProduct = new Product({ name, price, quantity });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao salvar o produto.', error: err.message });
  }
});

// Listar todos os produtos
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar produtos.', error: err.message });
  }
});

// Remover um produto por ID
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    res.json({ message: 'Produto removido com sucesso.', product: deletedProduct });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao remover o produto.', error: err.message });
  }
});

// Inicializar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
