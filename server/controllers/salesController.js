const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Packaging = require('../models/Packaging');

const taxasDeJuros = {
  debito: 1.88 / 100,
  creditoAVista: 4.46 / 100,
  2: 5.81 / 100,
  3: 6.32 / 100,
  4: 6.83 / 100,
  5: 7.33 / 100,
  6: 7.83 / 100,
  7: 8.34 / 100,
  8: 8.83 / 100,
  9: 9.32 / 100,
  10: 9.81 / 100,
  11: 10.29 / 100,
  12: 10.77 / 100,
};

exports.createSale = async (req, res) => {
  try {
    const { items, paymentMethod, installments, packaging } = req.body;

    // Deduzir embalagem do estoque
    const usedPackaging = await Packaging.findById(packaging.id);
    if (!usedPackaging || usedPackaging.quantity < packaging.quantity) {
      return res.status(400).json({ error: "Estoque insuficiente de embalagem" });
    }
    usedPackaging.quantity -= packaging.quantity;
    await usedPackaging.save();

    // Calcular o valor total da venda (sem juros)
    let total = 0;
    let embalagemTotal = packaging.price * packaging.quantity; // Custo das embalagens
    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.quantity < item.quantity) {
        return res.status(400).json({ error: "Produto com estoque insuficiente" });
      }
      total += item.price * item.quantity;
      product.quantity -= item.quantity; // Deduzir quantidade vendida
      await product.save(); // Atualiza o estoque de produtos
    }

    // Calcular total com juros, dependendo do método de pagamento
    let totalComJuros = total;
    if (paymentMethod === 'PIX' || paymentMethod === 'Débito') {
      totalComJuros = total + (total * taxasDeJuros[paymentMethod.toLowerCase()]);
    } else if (paymentMethod === 'Crédito') {
      const juros = taxasDeJuros[installments];
      if (juros !== undefined) {
        totalComJuros = total + (total * juros);
      } else {
        return res.status(400).json({ error: "Número de parcelas inválido para crédito" });
      }
    }

    // Calcular lucro (total sem juros - custo das embalagens)
    const lucro = totalComJuros - embalagemTotal;

    // Criar e salvar a venda no banco de dados
    const sale = new Sale({
      items,
      total,
      totalComJuros,
      embalagemTotal,
      lucro,
      paymentMethod,
      installments,
      date: new Date(),
    });

    await sale.save();
    res.status(201).json(sale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getSales = async (req, res) => {
  try {
    // Buscar todas as vendas, populando os produtos para exibir detalhes
    const sales = await Sale.find().populate("items.productId", "name price");
    res.status(200).json(sales);
  } catch (error) {
    console.error("Erro ao buscar as vendas:", error.message);
    res.status(500).json({ error: "Erro interno ao buscar as vendas." });
  }
};

// Função para excluir uma venda
exports.deleteSale = async (req, res) => {
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
};

// Função para editar uma venda
exports.editSale = async (req, res) => {
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
    res.status(500).json({ message: 'Erro ao editar venda', error: error.message });
  }
};
