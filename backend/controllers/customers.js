const mongodb = require('../db/connect');//imports the db access module
const { ObjectId } = require('mongodb');//import the objectId from mongodb 

const getAllData = async (req, res, next) => {//get data async way
  
  try {
    const result = await mongodb.getDb().collection('customers').find(); //result waits from the connect to the db and get the collection customers executing the query 'find'
    //format data and send a reposnse HTTP
      result.toArray().then((lists) => { //convert result int an array
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(lists); //send HTTP response: STATUS 200 (OK) and all elements of the collection (JSON format)
    })
      .catch((err) => {
        console.error('Error converting data to array:', err);
        res.status(500).json({
          message: 'Error processing data.',
          error: err.message
        });
      });
    } catch (err) {
    
     console.error('Database error in getAllData:', err);
      res.status(500).json({
      message: 'Database connection error.',
      error: err.message
    });
  }
};
       

// Get customer by ID
const getClientById = async (req, res, next) => {
  try {
    const userId = new ObjectId(req.params.id);

    const result = await mongodb.getDb().collection('customers').find({ _id: userId });
    result.toArray()
      .then((lists) => {
        if (lists.length > 0) {
          res.setHeader('Content-type', 'application/json');
          res.status(200).json(lists[0]);
        } else {
          res.status(404).json({ message: `Client not found with ID: ${req.params.id}` });
        }
      })
      .catch((err) => {
        res.status(500).json({
          message: 'Error processing query results.',
          error: err.message
        });
      });

  } catch (err) {
    if (err.name === 'BSONError' || err.message.includes('24 character hex')) {
      return res.status(400).json({
        message: 'Invalid ID format provided.',
        details: 'The ID must be a valid 24-character hexadecimal string.'
      });
    }
    res.status(500).json({ message: 'Error retrieving customers.', error: err.message });
  }
};

// Create a new client
const createClient = async (req, res) => {
  try {
    // Simple validation for required fields
    const { firstName, lastName, email, contact, address:{street, city, state, zipcode} } = req.body;

    if (!firstName || !lastName || !email || !contact) {
      return res.status(400).json({
        message: 'Missing required fields: firstName, lastName, email, contact are required.'
      });
    }

    // Optional: basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    const customer = { firstName, lastName, email, contact, address:{street, city, state, zipcode}};

    const response = await mongodb.getDb().collection('customers').insertOne(customer);

    if (response.acknowledged) {
      res.status(201).json({
        message: 'Client created successfully.',
        id: response.insertedId
      });
    } else {
      res.status(500).json({ message: 'Failed to create client.' });
    }

  } catch (err) {
    console.error('Error creating client:', err);
    res.status(500).json({ message: 'Server error creating client.', error: err.message });
  }
};

const updateClient = async (req, res, next) => {
  try {
    const userId = new ObjectId(req.params.id);
    const updateData = req.body;

    // Garantir que exista ao menos um campo no body
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No data provided to update.' });
    }

    const result = await mongodb.getDb()
      .collection('customers')
      .updateOne({ _id: userId }, { $set: updateData });

    if (result.modifiedCount > 0) {
      console.log('Customer updated successfully');
      return res.status(200).json({ message: 'Customer updated successfully' });
    } else {
      return res.status(404).json({ message: 'Client not found or no changes applied.' });
    }

  } catch (err) {
    return res.status(500).json({ 
      message: 'Error updating client.',
      error: err.message 
    });
  }
};

const deleteClient = async (req, res) => {
  try {
    const userId = new ObjectId(req.params.id);
    const response = await mongodb.getDb().collection('customers').deleteOne({ _id: userId });

    if (response.deletedCount > 0) {
      res.status(200).json({messsage: "Customer deleted successfully"});
      
    } else {
      res.status(404).json({ message: 'Client not found.' });
    }
  } catch (err) {
    if (err.name === 'BSONError') {
      return res.status(400).json({
        message: 'Invalid ID format.',
        details: 'The ID must be a valid 24-character hexadecimal string.'
      });
    }
    res.status(500).json({ message: 'Error deleting client.', error: err.message });
  }
};



module.exports = {getAllData, getClientById, createClient, updateClient, deleteClient };//exposts the functions to be used by Router