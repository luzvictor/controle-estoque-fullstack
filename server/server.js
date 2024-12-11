const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Product = require('./models/Product'); // Importando o modelo
const Packaging = require('./models/Packaging'); // Importando o modelo
const salesRoutes = require("./routes/sales");

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Middlewares
app.use(express.json()); // Permitir parsing de JSON no corpo das requisições
app.use(cors()); // Habilitar CORS para todas as origens
app.use("/api/sales", salesRoutes);

// Configurações
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

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
  const { name, brand, size, color, costPrice, salePrice, quantity } = req.body;

  if (!name || !brand || !size || !color || !costPrice || !salePrice || !quantity) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const newProduct = new Product({ name, brand, size, color, costPrice, salePrice, quantity });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao salvar o produto.', error: err.message });
  }
});

// Listar todos os produtos com filtros e ordenação
app.get('/api/products', async (req, res) => {
  try {
    const { name, brand, size, color, sortBy, sortOrder } = req.query;

    // Construir o filtro com base nos parâmetros recebidos
    const filter = {};

    if (name) {
      filter.name = { $regex: name, $options: 'i' }; // Pesquisa "name" com case-insensitive
    }

    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' }; // Pesquisa "brand" com case-insensitive
    }

    if (size) {
      filter.size = { $regex: size, $options: 'i' }; // Pesquisa "size" com case-insensitive
    }

    if (color) {
      filter.color = { $regex: color, $options: 'i' }; // Pesquisa "color" com case-insensitive
    }

    // Definir a ordenação
    const sortOptions = {};
    if (sortBy) {
      const allowedSortFields = ['name', 'price', 'size', 'color',  'quantity'];
      if (!allowedSortFields.includes(sortBy)) {
        return res.status(400).json({ message: 'Campo de ordenação inválido.' });
      }
      const order = sortOrder === 'desc' ? -1 : 1; // Verifica se é para ordenar de forma decrescente ou crescente
      sortOptions[sortBy] = order; // Ordena pelo campo especificado
    }

    // Buscar os produtos com base no filtro e ordenação
    const products = await Product.find(filter).sort(sortOptions);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar produtos.', error: err.message });
  }
});

// Atualizar produto por ID
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, size, color, costPrice, salePrice, quantity } = req.body;

    console.log(`Atualizando produto com ID: ${id}`);
    console.log(`Dados recebidos:`, { name, brand, size, color, costPrice, salePrice, quantity });

    const updatedProduct = await Product.findByIdAndUpdate(id, {
      name,
      brand,
      size,
      color,
      costPrice,
      salePrice,
      quantity
    }, { new: true });

    if (!updatedProduct) {
      return res.status(404).send("Produto não encontrado!");
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    res.status(500).send("Erro ao atualizar produto");
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


// ROTAS EMBALAGENS

// Adicionar embalagem
app.post('/api/packagings', async (req, res) => {
  const { type, price, quantity } = req.body;

  if (!type || !price || !quantity) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const newPackaging = new Packaging({ type, price, quantity });
    await newPackaging.save();
    res.status(201).json(newPackaging);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao salvar o produto.', error: err.message });
  }
});

// Listar todos as embalagens
app.get('/api/packagings', async (req, res) => {
  try {
    const products = await Packaging.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar produtos.', error: err.message });
  }
});

// Editar Embalagem
app.put('/api/packagings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { price, quantity } = req.body;

    console.log(`Atualizando produto com ID: ${id}`);
    console.log(`Dados recebidos:`, { price, quantity });

    const updatedPackaging = await Packaging.findByIdAndUpdate(id, {
      price,
      quantity
    }, { new: true });

    if (!updatedPackaging) {
      return res.status(404).send("Embalagem não encontrada!");
    }

    res.status(200).json(updatedPackaging);
  } catch (error) {
    console.error("Erro ao atualizar embalagem:", error);
    res.status(500).send("Erro ao atualizar embalagem");
  }
});

// Remover Embalagem por ID
app.delete('/api/packagings/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPackaging = await Product.findByIdAndDelete(id);

    if (!deletedPackaging) {
      return res.status(404).json({ message: 'Embalagem não encontrada.' });
    }

    res.json({ message: 'Embalagem removida com sucesso.', product: deletedPackaging });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao remover a embalagem.', error: err.message });
  }
});





// ** Funções de Rota de Vendas **

// Adicionar uma venda
app.post('/api/sales', async (req, res) => {
  try {
    const { items, paymentMethod, installments, date } = req.body;

    // Validação dos dados recebidos
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Os itens da venda são obrigatórios." });
    }

    // Calcular o total, lucro, embalagem e juros
    let total = 0;
    let lucro = 0;
    let embalagemTotal = 0;

    // Verificar disponibilidade de estoque antes de criar a venda
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.quantity < item.quantity) {
        return res.status(400).json({ error: `Estoque insuficiente para o produto ${product.name}.` });
      }
      const embalagem = embalagemCustos[item.packaging];
      embalagemTotal += embalagem;
      total += item.quantity * item.price;
      lucro += (item.price - embalagem - product.costPrice) * item.quantity;
    }

    let totalComJuros = total;
    if (paymentMethod === "credito" && installments > 1) {
      const juros = 0.05; // 5% de juros por parcela
      totalComJuros = total * Math.pow(1 + juros, installments);
    }

    // Aplica os juros dependendo da forma de pagamento e número de parcelas
    let juros = 0;
    if (paymentMethod === "debito") {
      juros = total * taxasDeJuros.debito;
    } else if (paymentMethod === "credito" && installments === 1) {
      juros = total * taxasDeJuros.creditoAVista;
    } else if (paymentMethod === "credito" && installments > 1) {
      juros = total * taxasDeJuros[installments];
    }

    // Criação da venda no banco de dados
    const sale = new Sale({
      items,
      total: totalComJuros,  // Total com juros
      lucro,
      paymentMethod,
      installments,
      date: date || Date.now(),
    });

    // Salva a venda
    const savedSale = await sale.save();

    // Atualiza o estoque dos produtos
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.quantity -= item.quantity;
        await product.save();
      }
    }

    res.status(201).json(savedSale);
  } catch (error) {
    console.error("Erro ao criar a venda:", error.message);
    res.status(500).json({ error: "Erro interno ao criar a venda." });
  }
});

// Buscar todas as vendas
app.get('/api/sales', async (req, res) => {
  try {
    // Buscar todas as vendas, populando os produtos para exibir detalhes
    const sales = await Sale.find().populate("items.productId", "name price");
    res.status(200).json(sales);
  } catch (error) {
    console.error("Erro ao buscar as vendas:", error.message);
    res.status(500).json({ error: "Erro interno ao buscar as vendas." });
  }
});

// Rota POST para criação de vendas (corrigida)
app.post('/api/sales', async (req, res) => {
  try {
    const { items, paymentMethod, installments, date } = req.body;

    // Validação dos dados recebidos
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Os itens da venda são obrigatórios." });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: "O método de pagamento é obrigatório." });
    }

    // Calcular o total, lucro, embalagem e juros
    let total = 0;
    let lucro = 0;
    let embalagemTotal = 0;

    const embalagemCustos = {
      pacote: 1.0,
      sacolaPequena: 2.0,
      sacolaGrande: 3.0,
    };

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.quantity < item.quantity) {
        return res.status(400).json({ error: `Estoque insuficiente para o produto ${item.productId}.` });
      }

      const embalagem = embalagemCustos[item.packaging] || 0;
      embalagemTotal += embalagem;
      total += item.quantity * item.price;
      lucro += (item.price - embalagem - product.costPrice) * item.quantity;
    }

    let totalComJuros = total;
    if (paymentMethod === "credito" && installments > 1) {
      const juros = 0.05; // Juros de 5% por parcela
      totalComJuros = total * Math.pow(1 + juros, installments);
    } else {
      totalComJuros = total; // Sem juros
    }

    // Criação da venda no banco de dados
    const sale = new Sale({
      items,
      total, // Total sem juros
      lucro,
      embalagemTotal, // Deve conter o valor correto
      totalComJuros,  // Deve conter o valor correto
      paymentMethod,
      installments,
      date: date || Date.now(),
    });

    // Salva a venda
    const savedSale = await sale.save();

    // Atualiza o estoque dos produtos
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.quantity -= item.quantity;
        await product.save();
      }
    }

    res.status(201).json(savedSale);
  } catch (error) {
    console.error("Erro ao criar a venda:", error.message);
    res.status(500).json({ error: "Erro interno ao criar a venda." });
  }
});


// Excluir uma venda
app.delete('/api/sales/:id', async (req, res) => {
  try {
    const saleId = req.params.id;
    const sale = await Sale.findByIdAndDelete(saleId);

    if (!sale) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }

    res.status(200).json({ message: 'Venda removida com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover venda', error: error.message });
  }
});

// Editar uma venda
app.put('/api/sales/:id', async (req, res) => {
  try {
    const saleId = req.params.id;
    const { items, total, date } = req.body;

    const sale = await Sale.findById(saleId);

    if (!sale) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }

    // Atualiza os dados da venda
    sale.items = items || sale.items;
    sale.total = total || sale.total;
    sale.date = date || sale.date;

    await sale.save();

    res.status(200).json({ message: 'Venda editada com sucesso', sale });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao editar a venda', error: error.message });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});