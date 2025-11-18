require('dotenv').config(); //run the env variables

//import native client MongoDb
const { MongoClient } = require('mongodb');


let _db;//private variable that will store the conection - avoid several conecctions

// connect to the mongodb using env security variables that store credentials
function buildMongoURI(user, pass, host, dbName) {

  if (!user || !pass || !host || !dbName) {
    throw new Error('Missing MongoDB environment variables (MONGO_USER, MONGO_PASS, MONGO_HOST, MONGO_DB).');
  }

  const safeUser = encodeURIComponent(user);
  const safePass = encodeURIComponent(pass);
  return `mongodb+srv://${safeUser}:${safePass}@${host}/${dbName}?retryWrites=true&w=majority`;//encode special characters (@...) used in the credentials
}

const initDb = (callback) => {//initiate the conection to the mongodb using the env variables
  
  try {
    if (_db) {
      console.log('database initialized!');
      return callback(null, _db);
    }

    // data .env that store credentials
    const user = process.env.MONGO_USER;
    const pass = process.env.MONGO_PASS;
    const host = process.env.MONGO_HOST;
    const dbName = process.env.MONGO_DB;

    // Validate .env configuration before connecting
    if (!user || !pass || !host || !dbName) {
      const missing = [
        !user && 'MONGO_USER',
        !pass && 'MONGO_PASS',
        !host && 'MONGO_HOST',
        !dbName && 'MONGO_DB'
      ].filter(Boolean);
      const errorMsg = `Missing required environment variables: ${missing.join(', ')}`;
      console.error(errorMsg);
      return callback(new Error(errorMsg));
    }

    // Build URI (can throw if values are invalid)
    const uri = buildMongoURI(user, pass, host, dbName); 
    
    //try to connect
    MongoClient.connect(uri)//connect to the db cluster
      .then((client) => {
        _db = client.db(dbName);
        console.log('Successfully connection at MongoDB!');
        callback(null, _db);
      })
      .catch((err) => {
        //err call
        console.error('Err to connect to MongoDB:', err.message);
        callback(err);
      });
  } catch (err) {
    
    console.error('Error initializing MongoDB connection:', err.message);
    callback(err);
  }
};

  const getDb = () => {//return an active instance of the db
    if (!_db) {
      throw Error('Database was not connected!');
    }
    return _db;
  };

module.exports = { initDb, getDb }; //export initDb to server.js and getDb to controllers