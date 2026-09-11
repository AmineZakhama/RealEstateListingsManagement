const Listing = require('../models/Listing');
const fs = require('fs');
const path = require('path');


const getListings = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    // Filters
    const keyword = req.query.keyword ? {
      $or: [
        { title: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } }
      ]
    } : {};
    
    const city = req.query.city ? { city: { $regex: req.query.city, $options: 'i' } } : {};
    const category = req.query.category ? { category: req.query.category } : {};
    
    let priceFilter = {};
    if (req.query.minPrice || req.query.maxPrice) {
      priceFilter.price = {};
      if (req.query.minPrice) priceFilter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) priceFilter.price.$lte = Number(req.query.maxPrice);
    }

    const excludeAgent = req.query.excludeAgent ? { agent: { $ne: req.query.excludeAgent } } : {};

    const filter = { ...keyword, ...city, ...category, ...priceFilter, ...excludeAgent };


    const sortOrder = req.query.sort === 'price_asc' ? { price: 1 } : req.query.sort === 'price_desc' ? { price: -1 } : { createdAt: -1 };

    const count = await Listing.countDocuments(filter);
    const listings = await Listing.find(filter)
      .populate('category', 'name')
      .populate('agent', 'name email phone contactEmail facebookLink')
      .sort(sortOrder)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      listings,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('category', 'name description')
      .populate('agent', 'name email phone contactEmail facebookLink');
      
    if (listing) {
      res.json(listing);
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ agent: req.user._id })
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const createListing = async (req, res) => {
  try {
    const { title, description, price, city, address, category, features } = req.body;

    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const listing = new Listing({
      title,
      description,
      price,
      city,
      address,
      category,
      agent: req.user._id,
      images,
      features: features ? JSON.parse(features) : {}
    });

    const createdListing = await listing.save();
    res.status(201).json(createdListing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (listing) {
      // Check ownership or admin
      if (listing.agent.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to update this listing' });
      }

      listing.title = req.body.title || listing.title;
      listing.description = req.body.description || listing.description;
      listing.price = req.body.price || listing.price;
      listing.city = req.body.city || listing.city;
      listing.address = req.body.address || listing.address;
      listing.category = req.body.category || listing.category;
      
      if (req.body.features) {
         listing.features = JSON.parse(req.body.features);
      }

      if (req.body.removedImages) {
        const removed = JSON.parse(req.body.removedImages);
        removed.forEach(img => {
          // Remove from array
          listing.images = listing.images.filter(i => i !== img);
          // Delete physical file
          const filePath = path.join(__dirname, '..', img);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }

      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => `/uploads/${file.filename}`);
        listing.images = [...listing.images, ...newImages];
      }

      const updatedListing = await listing.save();
      res.json(updatedListing);
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (listing) {
      if (listing.agent.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to delete this listing' });
      }

      listing.images.forEach(img => {
        const filePath = path.join(__dirname, '..', img);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      await listing.deleteOne();
      res.json({ message: 'Listing removed' });
    } else {
      res.status(404).json({ message: 'Listing not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getListings, getListingById, getMyListings, createListing, updateListing, deleteListing };
