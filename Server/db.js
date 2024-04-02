// db.js

const { MongoClient } = require('mongodb');

const mongoURL = 'mongodb://127.0.0.1:27017';
const dbName = 'NIELIT';

class Database {
  constructor() {
    this.client = new MongoClient(mongoURL, { useUnifiedTopology: true });
  }

  async connect() {
    if (!this.client.isConnected()) {
      await this.client.connect();
      this.db = this.client.db(dbName);
    }
  }

  async disconnect() {
    if (this.client.isConnected()) {
      await this.client.close();
    }
  }
}

const database = new Database();

module.exports = database;
