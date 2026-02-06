/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable max-lines */
import { PrismaClient, Role, ProductCondition } from '@prisma/client';
import { auth } from '../src/lib/auth';

const prisma = new PrismaClient();

// Image URL for all products
const PRODUCT_IMAGE_URL =
  'https://fk9cgv8v5q.ufs.sh/f/KUl1DcDBjt0ByOLej7tB79LWEsSXKC1NeuYMjrUd4pxlnh3R';

// Email constants
const MOBILE_STORE_EMAIL = 'yhapiep@gmail.com';
const SPICE_SHOP_EMAIL = 'adel3@gmail.com';

// Mobile device brands and models data
const MOBILE_BRANDS = [
  {
    brand: 'Samsung',
    models: [
      'Galaxy S24 Ultra',
      'Galaxy S24',
      'Galaxy Z Fold 6',
      'Galaxy Z Flip 6',
      'Galaxy A55',
      'Galaxy A35',
      'Galaxy M15',
      'Galaxy S23 FE',
      'Galaxy Tab S9',
      'Galaxy Watch 6',
    ],
  },
  {
    brand: 'Apple',
    models: [
      'iPhone 15 Pro Max',
      'iPhone 15 Pro',
      'iPhone 15',
      'iPhone 14 Pro',
      'iPhone 14',
      'iPhone 13',
      'iPad Pro 12.9',
      'iPad Air',
      'iPad Mini',
      'AirPods Pro 2',
    ],
  },
  {
    brand: 'Xiaomi',
    models: [
      '14 Ultra',
      '14 Pro',
      '14',
      '13T Pro',
      '13T',
      'Redmi Note 13 Pro+',
      'Redmi Note 13 Pro',
      'Redmi Note 13',
      'POCO F6 Pro',
      'POCO X6 Pro',
    ],
  },
  {
    brand: 'Google',
    models: [
      'Pixel 8 Pro',
      'Pixel 8',
      'Pixel 8a',
      'Pixel 7 Pro',
      'Pixel 7',
      'Pixel Fold',
      'Pixel Tablet',
      'Pixel Watch 2',
      'Pixel Buds Pro',
      'Nest Hub Max',
    ],
  },
  {
    brand: 'OnePlus',
    models: [
      '12',
      '12R',
      'Open',
      '11',
      '11R',
      'Nord 4',
      'Nord CE4',
      'Nord 3',
      'Pad Go',
      'Buds Pro 2',
    ],
  },
  {
    brand: 'Nothing',
    models: [
      'Phone (2)',
      'Phone (2a)',
      'Phone (1)',
      'Ear (2)',
      'Ear (a)',
      'Watch Pro',
      'Power (45w)',
      'Cable (1)',
      'Case (2a)',
      'Phone (2) Case',
    ],
  },
  {
    brand: 'Huawei',
    models: [
      'Mate 60 Pro',
      'Mate 60',
      'P60 Pro',
      'P60',
      'nova 12 Pro',
      'nova 12',
      'Mate X5',
      'Watch GT 4',
      'FreeBuds Pro 3',
      'MatePad Pro',
    ],
  },
  {
    brand: 'OPPO',
    models: [
      'Find X7 Ultra',
      'Find X7',
      'Reno 11 Pro',
      'Reno 11',
      'Reno 10',
      'A79 5G',
      'A58',
      'Pad Neo',
      'Watch X',
      'Enco X2',
    ],
  },
  {
    brand: 'Vivo',
    models: [
      'X100 Pro',
      'X100',
      'V30 Pro',
      'V30',
      'V29 Pro',
      'V29',
      'Y200',
      'Y100',
      'Pad 2',
      'TWS 3 Pro',
    ],
  },
  {
    brand: 'Realme',
    models: ['GT 6', 'GT 6T', '12 Pro+', '12 Pro', '12+', '12', 'C67', 'C55', 'Pad 2', 'Buds T300'],
  },
];

// Mobile categories
const MOBILE_CATEGORIES = [
  'Smartphones',
  'Tablets',
  'Smartwatches',
  'Earbuds',
  'Accessories',
  'Chargers',
  'Cases',
  'Screen Protectors',
];

// Mobile device descriptions
const MOBILE_DESCRIPTIONS = [
  'Latest flagship model with cutting-edge technology and premium build quality.',
  'High-performance device with exceptional camera capabilities and long battery life.',
  'Sleek design meets powerful performance in this must-have mobile device.',
  'Experience innovation at your fingertips with this feature-packed device.',
  'Perfect blend of style and functionality for the modern user.',
  'Elevate your mobile experience with stunning display and blazing-fast processor.',
  'Capture life moments in stunning detail with professional-grade cameras.',
  'Stay connected longer with all-day battery and fast charging support.',
  'Premium craftsmanship meets intelligent features in this exceptional device.',
  'Revolutionary technology packed in an elegant, ergonomic design.',
];

// Mobile tags
const MOBILE_TAGS = [
  ['5G', 'Flagship', 'Premium'],
  ['Gaming', 'High-Performance', 'Fast Charging'],
  ['Camera', 'Photography', 'Portrait Mode'],
  ['Budget', 'Value', 'Reliable'],
  ['Foldable', 'Innovative', 'Future'],
  ['Compact', 'Lightweight', 'Portable'],
  ['Large Screen', 'Entertainment', 'Media'],
  ['Business', 'Productivity', 'Professional'],
  ['Waterproof', 'Durable', 'Rugged'],
  ['Wireless Charging', 'NFC', 'Stylus Support'],
];

// Spice shop data
const SPICE_CATEGORIES = [
  'Whole Spices',
  'Ground Spices',
  'Spice Blends',
  'Herbs',
  'Seasonings',
  'Exotic Spices',
  'Organic Spices',
  'Rare Spices',
];

const SPICE_NAMES = [
  'Black Pepper',
  'White Pepper',
  'Cumin',
  'Coriander',
  'Turmeric',
  'Cardamom',
  'Cinnamon',
  'Clove',
  'Nutmeg',
  'Mace',
  'Star Anise',
  'Fennel',
  'Fenugreek',
  'Mustard Seeds',
  'Celery Seeds',
  'Caraway',
  'Dill Seeds',
  'Ajwain',
  'Saffron',
  'Vanilla',
  'Bay Leaves',
  'Curry Leaves',
  'Dried Mint',
  'Dried Basil',
  'Oregano',
  'Thyme',
  'Rosemary',
  'Sage',
  'Marjoram',
  'Tarragon',
  'Chives',
  'Parsley',
  'Paprika',
  'Cayenne',
  'Chili Powder',
  'Red Pepper Flakes',
  'Chipotle',
  'Ancho Chili',
  'Ghost Pepper',
  'Habanero',
  'Garam Masala',
  'Curry Powder',
  'Tandoori Masala',
  'Chaat Masala',
  'Ras el Hanout',
  'Baharat',
  'Five Spice',
  'Shichimi Togarashi',
  'Zaatar',
  'Dukkah',
  'Herbes de Provence',
  'Italian Seasoning',
  'Cajun Seasoning',
  'Jerk Seasoning',
  'Adobo',
  'Berbere',
  'Sumac',
  'Aleppo Pepper',
  'Urfa Biber',
  'Korean Chili Flakes',
  'Szechuan Pepper',
  'Japanese Seven Spice',
  'Chinese Five Spice',
  'Thai Curry Paste',
  'Harissa',
  'Biryani Masala',
  'Sambar Powder',
  'Rasam Powder',
  'Panch Phoron',
  'Shawarma Spice',
  'Taco Seasoning',
  'Fajita Seasoning',
  'BBQ Rub',
  'Steak Seasoning',
  'Poultry Seasoning',
  'Fish Seasoning',
  'Vegetable Seasoning',
  'All-Purpose Seasoning',
  'Smoked Paprika',
  'Sweet Paprika',
  'Hot Paprika',
  'Spanish Paprika',
  'Hungarian Paprika',
  'Kashmiri Chili',
  'Korean Gochugaru',
  'Peri-Peri',
  'Pink Himalayan Salt',
  'Black Salt',
  'Celery Salt',
  'Garlic Salt',
  'Onion Salt',
  'Seasoned Salt',
  'Sea Salt',
  'Fleur de Sel',
  'Garlic Powder',
  'Onion Powder',
  'Ginger Powder',
  'Galangal Powder',
  'Lemongrass Powder',
  'Kaffir Lime Powder',
  'Turmeric Powder',
  'Moringa Powder',
  'Asafoetida',
  'Amchur',
  'Kokum',
  'Tamarind',
  'Pomegranate Seeds',
  'Dried Mango Powder',
  'Black Cardamom',
  'Green Cardamom',
  'Cinnamon Sticks',
  'Cassia Bark',
  'Ceylon Cinnamon',
  'Indonesian Cinnamon',
  'Saigon Cinnamon',
  'Cinnamon Chips',
  'Cinnamon Sugar',
  'Pumpkin Spice',
];

const SPICE_DESCRIPTIONS = [
  'Premium quality spice sourced from the finest farms for authentic flavor.',
  'Aromatic and fresh, perfect for enhancing the taste of your dishes.',
  'Traditionally harvested and carefully processed to preserve essential oils.',
  'Rich in flavor and aroma, ideal for both cooking and medicinal purposes.',
  'Hand-picked and sun-dried to maintain the highest quality standards.',
  'Essential ingredient for authentic cuisine, adds depth to any recipe.',
  'Organically grown without pesticides, pure and natural goodness.',
  'Rare and exotic spice that brings unique flavor to your kitchen.',
  'Freshly ground for maximum potency and flavor release.',
  'Perfect balance of heat and aroma for the discerning chef.',
];

const SPICE_TAGS = [
  ['Organic', 'Premium', 'Fresh'],
  ['Traditional', 'Authentic', 'Pure'],
  ['Aromatic', 'Flavorful', 'Essential'],
  ['Exotic', 'Rare', 'Specialty'],
  ['Handpicked', 'Natural', 'Quality'],
  ['Culinary', 'Cooking', 'Gourmet'],
  ['Medicinal', 'Healthy', 'Ayurvedic'],
  ['Spicy', 'Hot', 'Bold'],
  ['Sweet', 'Aromatic', 'Warm'],
  ['Whole', 'Raw', 'Unprocessed'],
];

// Generate mobile products
function generateMobileProducts(count: number) {
  const products = [];

  for (let i = 0; i < count; i += 1) {
    const brandData = MOBILE_BRANDS[i % MOBILE_BRANDS.length];
    const model = brandData.models[i % brandData.models.length];
    const category = MOBILE_CATEGORIES[i % MOBILE_CATEGORIES.length];
    const description = MOBILE_DESCRIPTIONS[i % MOBILE_DESCRIPTIONS.length];
    const tags = MOBILE_TAGS[i % MOBILE_TAGS.length];

    // Generate realistic prices
    const basePrice = 200 + ((i * 15) % 1300); // Prices between 200 and 1500 USD
    const exchangeRate = 15000; // SYP to USD rate

    products.push({
      name: `${brandData.brand} ${model}`,
      description: `${description} The ${brandData.brand} ${model} offers exceptional performance and reliability.`,
      priceUSD: Math.round(basePrice * 100) / 100,
      priceSYP: Math.round(basePrice * exchangeRate),
      exchangeRate,
      imageUrls: [PRODUCT_IMAGE_URL],
      category,
      stock: Math.floor(Math.random() * 50) + 10, // 10-60 items in stock
      isPublished: true,
      tags,
      condition: ProductCondition.NEW,
    });
  }

  return products;
}

// Generate spice products
function generateSpiceProducts(count: number) {
  const products = [];

  for (let i = 0; i < count; i += 1) {
    const spiceName = SPICE_NAMES[i % SPICE_NAMES.length];
    const category = SPICE_CATEGORIES[i % SPICE_CATEGORIES.length];
    const description = SPICE_DESCRIPTIONS[i % SPICE_DESCRIPTIONS.length];
    const tags = SPICE_TAGS[i % SPICE_TAGS.length];

    // Generate realistic prices for spices (much lower than mobile devices)
    const basePrice = 5 + ((i * 0.5) % 95); // Prices between 5 and 100 USD
    const exchangeRate = 15000;

    const variations = ['Premium', 'Organic', 'Whole', 'Ground', 'Grade A', 'Select'];
    const variation = variations[i % variations.length];

    products.push({
      name: `${variation} ${spiceName}`,
      description: `${description} Our ${spiceName.toLowerCase()} is carefully selected and packaged to ensure maximum freshness and flavor.`,
      priceUSD: Math.round(basePrice * 100) / 100,
      priceSYP: Math.round(basePrice * exchangeRate),
      exchangeRate,
      imageUrls: [PRODUCT_IMAGE_URL],
      category,
      stock: Math.floor(Math.random() * 200) + 50, // 50-250 items in stock
      isPublished: true,
      tags,
      condition: ProductCondition.NEW,
    });
  }

  return products;
}

// Create merchant using Better Auth API
async function createMerchantWithAuth(
  email: string,
  password: string,
  name: string,
  storeName: string,
  storeDescription: string
) {
  // Create user using Better Auth's signUp API
  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
    },
  });

  if (!result) {
    throw new Error(`Failed to create user: ${email}`);
  }

  // Get the created user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error(`User not found after creation: ${email}`);
  }

  // Update user role and emailVerified
  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: Role.MERCHANT,
      emailVerified: true,
    },
  });

  // Create or update merchant profile
  const slug = `${email.split('@')[0].toLowerCase()}-${Date.now().toString(36)}`;

  const merchant = await prisma.merchant.create({
    data: {
      userId: user.id,
      name: storeName,
      slug,
      description: storeDescription,
      logoUrl: PRODUCT_IMAGE_URL,
      address: 'Main Street, City Center',
      isChatEnabled: true,
      subscriptionTier: 'FREE',
    },
  });

  return { user, merchant };
}

// Create products for a merchant
async function createProducts(
  products: Array<ReturnType<typeof generateMobileProducts>[number]>,
  merchantId: string
) {
  const productCreates = products.map((product) =>
    prisma.product.create({
      data: {
        ...product,
        merchantId,
      },
    })
  );

  await Promise.all(productCreates);
}

// Main seed function
async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clean existing data (wrapped in try-catch to handle case when tables don't exist yet)
  console.log('🧹 Cleaning existing data...');
  try {
    await prisma.product.deleteMany({});
  } catch {
    // Table doesn't exist yet, skip
  }
  try {
    await prisma.merchantContext.deleteMany({});
  } catch {
    // Table doesn't exist yet, skip
  }
  try {
    await prisma.chatMessage.deleteMany({});
  } catch {
    // Table doesn't exist yet, skip
  }
  try {
    await prisma.chatSession.deleteMany({});
  } catch {
    // Table doesn't exist yet, skip
  }

  // Find existing merchants
  // Wrap the rest of cleanup in try-catch in case tables don't exist
  try {
    const existingMerchants = await prisma.merchant.findMany({
      where: {
        user: {
          email: {
            in: [MOBILE_STORE_EMAIL, SPICE_SHOP_EMAIL],
          },
        },
      },
      include: { user: true },
    });

    // Delete existing accounts and sessions
    for (const merchant of existingMerchants) {
      await prisma.account.deleteMany({ where: { userId: merchant.userId } });
      await prisma.session.deleteMany({ where: { userId: merchant.userId } });
    }

    // Delete existing merchants and users
    await prisma.merchant.deleteMany({
      where: {
        user: {
          email: {
            in: [MOBILE_STORE_EMAIL, SPICE_SHOP_EMAIL],
          },
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [MOBILE_STORE_EMAIL, SPICE_SHOP_EMAIL],
        },
      },
    });

    await prisma.verification.deleteMany({});
    console.log('✅ Cleaned existing data\n');
  } catch {
    // Tables don't exist yet (fresh database), skip cleanup
    console.log('ℹ️  Fresh database detected, skipping cleanup\n');
  }

  // Create Mobile Store Merchant
  console.log('🏪 Creating Mobile Store merchant...');
  const mobileStoreData = await createMerchantWithAuth(
    MOBILE_STORE_EMAIL,
    MOBILE_STORE_EMAIL,
    'Mobile Store Owner',
    'Mobile Store',
    'Your one-stop shop for the latest smartphones, tablets, smartwatches, and mobile accessories. We offer premium devices from top brands at competitive prices.'
  );

  console.log(`✅ Created Mobile Store merchant: ${mobileStoreData.user.email}`);
  console.log(`   Store Name: ${mobileStoreData.merchant.name}`);
  console.log(`   Store Slug: ${mobileStoreData.merchant.slug}\n`);

  // Create Spice Shop Merchant
  console.log('🏪 Creating Spice Shop merchant...');
  const spiceShopData = await createMerchantWithAuth(
    SPICE_SHOP_EMAIL,
    SPICE_SHOP_EMAIL,
    'Spice Shop Owner',
    'Spice Shop',
    'Discover the world of flavors with our premium collection of spices, herbs, and seasonings. From everyday essentials to exotic specialties, we bring authentic taste to your kitchen.'
  );

  console.log(`✅ Created Spice Shop merchant: ${spiceShopData.user.email}`);
  console.log(`   Store Name: ${spiceShopData.merchant.name}`);
  console.log(`   Store Slug: ${spiceShopData.merchant.slug}\n`);

  // Generate and insert mobile products
  console.log('📱 Generating 100 mobile products...');
  const mobileProducts = generateMobileProducts(100);
  await createProducts(mobileProducts, mobileStoreData.merchant.id);
  console.log('✅ Created 100 mobile products\n');

  // Generate and insert spice products
  console.log('🌶️ Generating 100 spice products...');
  const spiceProducts = generateSpiceProducts(100);
  await createProducts(spiceProducts, spiceShopData.merchant.id);
  console.log('✅ Created 100 spice products\n');

  // Summary
  console.log('🎉 Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   • Mobile Store (${MOBILE_STORE_EMAIL} / ${MOBILE_STORE_EMAIL})`);
  console.log('     - 100 mobile devices and accessories');
  console.log(`   • Spice Shop (${SPICE_SHOP_EMAIL} / ${SPICE_SHOP_EMAIL})`);
  console.log('     - 100 spices, herbs, and seasonings');
  console.log('\n🔑 Login Credentials:');
  console.log(`   Mobile Store: ${MOBILE_STORE_EMAIL} / ${MOBILE_STORE_EMAIL}`);
  console.log(`   Spice Shop:   ${SPICE_SHOP_EMAIL} / ${SPICE_SHOP_EMAIL}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
