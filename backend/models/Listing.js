const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PropertyCategory',
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    type: String // Array of image URLs/paths
  }],
  features: {
    bedrooms: Number,
    bathrooms: Number,
    squareFeet: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);
