const mongodb = require('../db/connect');
const { ObjectId } = require('mongodb');


const getAllProducts = async (req, res) => {
  try {
    const result = await mongodb.getDb().collection('products').find();

    result.toArray()
      .then((lists) => {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(lists);
      })
      .catch((err) => {
        console.error('Error converting data to array:', err);
        res.status(500).json({
          message: 'Error processing data.',
          error: err.message
        });
      });

  } catch (err) {
    console.error('Database error in getAllProducts:', err);
    res.status(500).json({
      message: 'Database connection error.',
      error: err.message
    });
  }
};



const getProductById = async (req, res) => {
  try {
    const productId = new ObjectId(req.params.id);

    const result = await mongodb.getDb().collection('products').find({ _id: productId });
    
    result.toArray()
      .then((lists) => {
        if (lists.length > 0) {
          res.setHeader('Content-type', 'application/json');
          res.status(200).json(lists[0]);
        } else {
          res.status(404).json({ message: `Product not found with ID: ${req.params.id}` });
        }
      })
      .catch((err) => {
        res.status(500).json({
          message: 'Error processing query results.',
          error: err.message
        });
      });

  } catch (err) {
    if (err.name === 'BSONError') {
      return res.status(400).json({
        message: 'Invalid ID format.',
        details: 'The ID must be a valid 24-character hexadecimal string.'
      });
    }

    res.status(500).json({
      message: 'Error retrieving product.',
      error: err.message
    });
  }
};



const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, sku, createdAt } = req.body;

    // Required fields validation
    if (!name || !description || !price || !category || stock === undefined || !sku) {
      return res.status(400).json({
        message: 'Missing required fields: name, description, price, category, stock, and sku are required.'
      });
    }

    const newProduct = {
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      sku,
      createdAt: createdAt ? new Date(createdAt) : new Date()
    };

    const response = await mongodb.getDb().collection('products').insertOne(newProduct);

    if (response.acknowledged) {
      res.status(201).json({
        message: 'Product created successfully.',
        id: response.insertedId
      });
    } else {
      res.status(500).json({ message: 'Failed to create product.' });
    }

  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: 'Server error creating product.', error: err.message });
  }
};


const updateProduct = async (req, res) => {
  try {
    const productId = new ObjectId(req.params.id);
    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No data provided to update.' });
    }

    const result = await mongodb.getDb()
      .collection('products')
      .updateOne({ _id: productId }, { $set: updateData });

    if (result.modifiedCount > 0) {
      return res.status(200).json({ message: 'Product updated successfully.' });
    } else {
      return res.status(404).json({ message: 'Product not found or no changes applied.' });
    }

  } catch (err) {
    res.status(500).json({
      message: 'Error updating product.',
      error: err.message
    });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const productId = new ObjectId(req.params.id);

    const response = await mongodb.getDb().collection('products').deleteOne({ _id: productId });

    if (response.deletedCount > 0) {
      res.status(200).json({ message: 'Product deleted successfully.' });
    } else {
      res.status(404).json({ message: 'Product not found.' });
    }

  } catch (err) {
    if (err.name === 'BSONError') {
      return res.status(400).json({
        message: 'Invalid ID format.',
        details: 'The ID must be a valid 24-character hexadecimal string.'
      });
    }
    res.status(500).json({
      message: 'Error deleting product.',
      error: err.message
    });
  }
};


module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct};
