const express = require("express");
const router = express.Router();
const saleController = require("../controllers/salesController");

// Criar uma venda
router.post("/", saleController.createSale);

// Buscar todas as vendas
router.get("/", saleController.getSales);

// Excluir uma venda
router.delete("/:id", saleController.deleteSale);

// Editar uma venda
router.put("/:id", saleController.editSale);

module.exports = router;
