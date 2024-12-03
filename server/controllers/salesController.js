const Sale = require("../models/Sale");
const Product = require("../models/Product");

const embalagemCustos = {
  pacote: 3.5,
  sacolaPequena: 6.0,
  sacolaGrande: 8.0,
};

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
    const { items, paymentMethod, installments, date } = req.body;

    // Validação dos dados recebidos
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Os itens da venda são obrigatórios." });
    }

    // Calcular o total, lucro, embalagem e juros
    let total = 0;
    let lucro = 0;
    let embalagemTotal = 0;

    // Verificar estoque e calcular o valor da venda
    for (const item of items) {
      const embalagem = embalagemCustos[item.packaging];
      embalagemTotal += embalagem;

      // Verificar se há estoque suficiente para o produto
      const product = await Product.findById(item.productId);
      if (!product || product.quantity < item.quantity) {
        return res.status(400).json({ error: `Estoque insuficiente para o produto ${product.name}` });
      }

      total += item.quantity * item.price;
      lucro += (item.price - embalagem) * item.quantity;

      // Atualiza o estoque
      product.quantity -= item.quantity;
      await product.save();
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

    const totalComJuros = total + juros;

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

    res.status(201).json(savedSale);
  } catch (error) {
    console.error("Erro ao criar a venda:", error.message);
    res.status(500).json({ error: "Erro interno ao criar a venda." });
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
