const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const router = express.Router();
const { Schema } = mongoose;

// 1. MongoDB Connection
mongoose.connect(process.env.MONGO_PASSWORD, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('connected', () => console.log('✅ MongoDB connected'));
mongoose.connection.on('error', err => console.error('❌ MongoDB connection error:', err));

// 2. Multer Setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 3. Mongoose Schema
const variantSchema = new Schema({
  variantName: String,
  options: [{
    name: String,
    stock: { type: Number, default: 0 }
  }]

}, { _id: false });

const productSchema = new Schema({
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  productCode: { type: String, required: true },
  productName: { type: String, required: true },
  productImage: { type: Buffer },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
  createdUser: { type: String, default: "admin" },
  isFavourite: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  hsnCode: { type: String, maxlength: 100 },
  totalStock: { type: mongoose.Types.Decimal128, default: 0.0 },
  variants: [variantSchema]
});

const Product = mongoose.model('Product', productSchema);

// 4. Routes

// GET form page
router.get('/', (req, res) => {
  res.render('index', { title: 'Create Product' });
});

// POST create product
router.post('/create-product', upload.single('productImage'), async (req, res) => {
  try {
    const {
      productName,
      productCode,
      hsnCode,
      totalStock,
      variants,
      isFavourite,
      active
    } = req.body;

    console.log('Incoming Variants:', variants);

    const product = new Product({
      productName,
      productCode,
      hsnCode,
      productImage: req.file?.buffer || null,
      totalStock: parseFloat(totalStock || 0),
      isFavourite: isFavourite === 'true' || isFavourite === true,
      active: active === 'true' || active === true,
      createdUser: "admin",
      variants: Array.isArray(variants) ? variants : JSON.parse(variants || "[]")
    });

    console.log('Product before save:', product.variants);
    await product.save();
    console.log('Product after save:', product.variants);
    
    res.send({ message: '✅ Product created successfully', productId: product.id });
  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).send("❌ Internal Server Error");
  }
});


router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({}, null, {
      sort: { updatedDate: -1 }
    });

    const response = products.map(product => ({
      id: product.id,
      productName: product.productName,
      productCode: product.productCode,
      hsnCode: product.hsnCode,
      totalStock: parseFloat(product.totalStock?.toString() || "0"),
      isFavourite: product.isFavourite,
      active: product.active,
      updatedDate: product.updatedDate,
      variants: product.variants.map((variant, index) => ({
        id: `variant-${index}`,
        variantName: variant.variantName || `Variant ${index + 1}`, // Fallback for missing names
        options: variant.options.map((option, optIndex) => ({
          id: `option-${optIndex}`,
          name: option.name || `Option ${optIndex + 1}`, // Fallback for missing names
          stock: option.stock || 0
        }))
      }))
    }));

    res.json({ count: response.length, products: response });
  } catch (err) {
    console.error('❌ Failed to fetch products:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/update-stock', async (req, res) => {
  try {
    const { productId, variantName, optionName, quantity, operation } = req.body;

    const product = await Product.findOne({ id: productId });
    if (!product) return res.status(404).send({ error: 'Product not found' });

    const variant = product.variants.find(v => v.variantName === variantName);
    if (!variant) return res.status(404).send({ error: 'Variant not found' });

    const option = variant.options.find(opt => opt.name === optionName);
    if (!option) return res.status(404).send({ error: 'Option not found' });

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) return res.status(400).send({ error: 'Invalid quantity' });

    if (operation === 'add') {
      option.stock += qty;
    } else if (operation === 'remove') {
      if (option.stock < qty) return res.status(400).send({ error: 'Not enough stock' });
      option.stock -= qty;
    } else {
      return res.status(400).send({ error: 'Invalid operation type' });
    }

    // Update total stock
    product.totalStock = product.variants.reduce((sum, v) =>
      sum + v.options.reduce((s, o) => s + o.stock, 0), 0);

    product.updatedDate = new Date();
    await product.save();

    res.send({ message: `✅ Stock ${operation === 'add' ? 'added' : 'removed'} successfully`, totalStock: product.totalStock });
  } catch (err) {
    console.error('❌ Error updating stock:', err);
    res.status(500).send({ error: 'Internal Server Error' });
  }
}); 

module.exports = router;
