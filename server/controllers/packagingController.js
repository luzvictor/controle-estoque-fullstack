const Packaging = require('../models/Packaging');

// Criar Embalagem
const createPackaging = async (req, res) => {
    try {
        const newPackaging = new Packaging(req.body);
        await newPackaging.save();
        res.status(201).json(newPackaging);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar embalagem' });
      }
    };

// Obter Embalagem
const getPackaging = async (req, res) => {
    try {
        const packagings = await Packaging.find();
        res.status(200).json(packagings);
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
};

// Atualizar Embalagem
const updatePackaging = async (req, res) => {
    try {
        const updatedPackaging = await Packaging.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedPackaging);
    } catch (err) {
    res.status(400).json({ error: err.message });
    }
};

// Apagar Embalagem
const deletePackaging = async (req, res) => {
    try {
        await Packaging.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
};


module.exports = { deletePackaging, createPackaging, getPackaging, updatePackaging, };
