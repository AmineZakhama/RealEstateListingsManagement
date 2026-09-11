const PropertyCategory = require('../models/PropertyCategory');


const getCategories = async (req, res) => {
  try {
    const categories = await PropertyCategory.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const categoryExists = await PropertyCategory.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    const category = await PropertyCategory.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateCategory = async (req, res) => {
  try {
    const category = await PropertyCategory.findById(req.params.id);
    if (category) {
      category.name = req.body.name || category.name;
      category.description = req.body.description || category.description;
      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteCategory = async (req, res) => {
  try {
    const category = await PropertyCategory.findById(req.params.id);
    if (category) {
      await category.deleteOne();
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
