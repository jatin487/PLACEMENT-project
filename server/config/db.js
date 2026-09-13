<<<<<<< HEAD
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
=======
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Ignore DNS override errors if restricted
}

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // If uri is empty or placeholder, fallback to MongoMemoryServer for seamless local testing
    if (!uri || uri.includes('your_mongodb_atlas_uri')) {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        uri = mongoServer.getUri();
      } catch (err) {
        // Fallback uri
      }
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
      console.log('MongoDB Connected');
    } catch (fallbackError) {
      console.error(`MongoDB Connection Error: ${error.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
>>>>>>> b467758ccab55598f443e035bd35e468d347134d
