require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const PropertyCategory = require('./models/PropertyCategory');
const User = require('./models/User');
const Listing = require('./models/Listing');

const categories = [
  { name: 'House', description: 'Single family home' },
  { name: 'Apartment', description: 'Multi-family residential unit' },
  { name: 'Condo', description: 'Condominium' },
  { name: 'Townhouse', description: 'Multi-floor home' },
  { name: 'Land', description: 'Vacant land' },
  { name: 'Commercial', description: 'Commercial property' }
];

// Sample users with hashed passwords
const users = [
  { name: 'John Smith', email: 'john.smith@realestate.com', password: 'Password123', role: 'agent' },
  { name: 'Sarah Johnson', email: 'sarah.johnson@realestate.com', password: 'Password123', role: 'agent' },
  { name: 'Mike Davis', email: 'mike.davis@realestate.com', password: 'Password123', role: 'agent' },
  { name: 'Emily Brown', email: 'emily.brown@realestate.com', password: 'Password123', role: 'agent' },
  { name: 'David Wilson', email: 'david.wilson@realestate.com', password: 'Password123', role: 'agent' },
  { name: 'Lisa Anderson', email: 'lisa.anderson@realestate.com', password: 'Password123', role: 'admin' }
];

// Property data generator
const generateListings = (categoryIds, agentIds) => {
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'San Francisco', 'Miami', 'Boston', 'Seattle', 'Denver'];
  const descriptions = [
    'Beautiful property with modern amenities',
    'Spacious home in a prime location',
    'Newly renovated with high-end finishes',
    'Cozy retreat in a quiet neighborhood',
    'Luxury property with stunning views',
    'Perfect for families or investors',
    'Move-in ready home',
    'Recently updated with smart home features',
    'Charming property with character',
    'Investment opportunity in growing area'
  ];

  const listings = [];
  const listingTitles = [
    'Modern Apartment Downtown',
    'Family Home with Backyard',
    'Luxury Condo with Pool',
    'Spacious House near School',
    'Urban Studio Apartment',
    'Townhouse with Garage',
    'Waterfront Property',
    'Suburban Home Perfect for Investment',
    'Contemporary Loft',
    'Executive Residence'
  ];

  // Generate 100 listings
  for (let i = 0; i < 100; i++) {
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const randomCategory = categoryIds[Math.floor(Math.random() * categoryIds.length)];
    const randomAgent = agentIds[Math.floor(Math.random() * agentIds.length)];
    const randomTitle = listingTitles[Math.floor(Math.random() * listingTitles.length)];
    const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
    const bedrooms = Math.floor(Math.random() * 5) + 1;
    const bathrooms = Math.floor(Math.random() * 4) + 1;
    const squareFeet = Math.floor(Math.random() * 4000) + 800;
    const price = Math.floor(Math.random() * 950000) + 50000;

    listings.push({
      title: `${randomTitle} #${i + 1}`,
      description: `${randomDescription}. Located in ${randomCity}. This property features ${bedrooms} bedrooms, ${bathrooms} bathrooms, and ${squareFeet} square feet.`,
      price: price,
      city: randomCity,
      address: `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Maple', 'Cedar', 'Elm', 'Pine', 'Birch', 'Walnut'][Math.floor(Math.random() * 8)]} Street, ${randomCity}`,
      category: randomCategory,
      agent: randomAgent,
      images: [
        `https://via.placeholder.com/400x300?text=Property+${i + 1}+Image+1`,
        `https://via.placeholder.com/400x300?text=Property+${i + 1}+Image+2`,
        `https://via.placeholder.com/400x300?text=Property+${i + 1}+Image+3`
      ],
      features: {
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        squareFeet: squareFeet
      }
    });
  }

  return listings;
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/realestate');
    console.log('✓ MongoDB Connected');

    // Clear existing data
    await PropertyCategory.deleteMany();
    await User.deleteMany();
    await Listing.deleteMany();
    console.log('✓ Database Cleared');

    // Seed categories
    const seededCategories = await PropertyCategory.insertMany(categories);
    console.log(`✓ ${seededCategories.length} Categories Seeded`);

    // Hash passwords and seed users
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        return {
          ...user,
          password: await bcrypt.hash(user.password, salt)
        };
      })
    );
    const seededUsers = await User.insertMany(hashedUsers);
    console.log(`✓ ${seededUsers.length} Users Seeded`);

    // Generate and seed listings
    const categoryIds = seededCategories.map(cat => cat._id);
    const agentIds = seededUsers.map(user => user._id);
    const listings = generateListings(categoryIds, agentIds);
    const seededListings = await Listing.insertMany(listings);
    console.log(`✓ ${seededListings.length} Listings Seeded`);

    console.log('\n=== SEEDING COMPLETE ===');
    console.log(`Total Users: ${seededUsers.length}`);
    console.log(`Total Categories: ${seededCategories.length}`);
    console.log(`Total Listings: ${seededListings.length}`);
    console.log('\n=== TEST CREDENTIALS ===');
    console.log('Agent: john.smith@realestate.com / Password123');
    console.log('Admin: lisa.anderson@realestate.com / Password123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();
