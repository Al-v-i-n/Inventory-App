import React, { useState, useEffect } from 'react';
import { Plus, Package, ShoppingCart, Minus, Edit3, Eye, AlertCircle, CheckCircle, Star, StarOff } from 'lucide-react';

const InventorySystem = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockOperation, setStockOperation] = useState(null);

  useEffect(() => {
  fetch('http://localhost:3001/products') 
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch products');
      }
      return res.json();
    })
    .then(data => {
      console.log('Fetched products:', data);
      // Make sure the data structure matches what we expect
      const formattedProducts = data.products.map(product => ({
        ...product,
        variants: product.variants.map((variant, vIndex) => ({
          ...variant,
          id: variant.id || `variant-${vIndex}`, // Add ID if missing
          options: variant.options.map((option, oIndex) => ({
            ...option,
            id: option.id || `option-${oIndex}` // Add ID if missing
          }))
        }))
      }));
      setProducts(formattedProducts);
    })
    .catch(error => {
      console.error('Error fetching products:', error);
    });
}, []);

  const showMessage = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
    } else {
      setError(message);
      setSuccess('');
    }
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 3000);
  };

  // Product Form Component
  const ProductForm = () => {
    const [formData, setFormData] = useState({
  productName: '',
  productCode: '',
  hsnCode: '',
  totalStock: 0,
  isFavourite: false,
  active: true,
  updatedDate: new Date().toISOString(), // or leave this to be added on submit
  variants: [
    {
      variantName: '',
      options: [
        { name: '', stock: 0 }
      ]
    }
  ]
});
    const [formErrors, setFormErrors] = useState({});

    const validateForm = () => {
      const errors = {};
      
      if (!formData.productName.trim()) {
        errors.productName = 'Product name is required';
      }
      
      if (!formData.productCode.trim()) {
        errors.productCode = 'Product code is required';
      }
      
      if (!formData.hsnCode.trim()) {
        errors.hsnCode = 'HSN code is required';
      } else if (formData.hsnCode.length > 100) {
        errors.hsnCode = 'HSN code must not exceed 100 characters';
      }
      
      formData.variants.forEach((variant, vIndex) => {
        if (!variant.name.trim()) {
          errors[`variant_${vIndex}_name`] = 'Variant name is required';
        }
        
        variant.options.forEach((option, oIndex) => {
          if (!option.trim()) {
            errors[`variant_${vIndex}_option_${oIndex}`] = 'Option value is required';
          }
        });
      });
      
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (!validateForm()) {
        showMessage('Please fix the validation errors', 'error');
        return;
      }

      setLoading(true);
      
      // Simulate API call
      setLoading(true);

fetch("http://localhost:3001/create-product", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    productCode: formData.productCode,
    productName: formData.productName,
    productImage: null,
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    isFavourite: false,
    active: true,
    hsnCode: formData.hsnCode,
    totalStock: 0,
    variants: formData.variants.map((variant) => ({
      variantName: variant.name,
      options: variant.options.map((option) => ({
        name: option,
        stock: 0
      }))
    }))
  })
})
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to create product");
    }
    return response.json();
  })
  .then((data) => {
    // Optionally update products list if needed
    showMessage('Product created successfully!');
    setFormData({
      productName: '',
      productCode: '',
      hsnCode: '',
      variants: [{ name: '', options: [''] }]
    });
    setFormErrors({});
    setActiveTab('list');
    fetch('http://localhost:3001/products') 
      .then(res => res.json())
      .then(data => {
        setProducts(data.products);
      });
  })
  .catch((error) => {
    showMessage(error.message, 'error');
  })
  .finally(() => {
    setLoading(false);
  });};

    const addVariant = () => {
      setFormData({
        ...formData,
        variants: [...formData.variants, { name: '', options: [''] }]
      });
    };

    const removeVariant = (index) => {
      const newVariants = formData.variants.filter((_, i) => i !== index);
      setFormData({ ...formData, variants: newVariants });
    };

    const addOption = (variantIndex) => {
      const newVariants = [...formData.variants];
      newVariants[variantIndex].options.push('');
      setFormData({ ...formData, variants: newVariants });
    };

    const removeOption = (variantIndex, optionIndex) => {
      const newVariants = [...formData.variants];
      newVariants[variantIndex].options = newVariants[variantIndex].options.filter((_, i) => i !== optionIndex);
      setFormData({ ...formData, variants: newVariants });
    };

    const updateVariant = (variantIndex, field, value) => {
      const newVariants = [...formData.variants];
      newVariants[variantIndex][field] = value;
      setFormData({ ...formData, variants: newVariants });
    };

    const updateOption = (variantIndex, optionIndex, value) => {
      const newVariants = [...formData.variants];
      newVariants[variantIndex].options[optionIndex] = value;
      setFormData({ ...formData, variants: newVariants });
    };

    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Plus className="w-6 h-6" />
          Create New Product
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Product Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.productName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter product name"
              />
              {formErrors.productName && (
                <p className="text-red-500 text-sm mt-1">{formErrors.productName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Code *
              </label>
              <input
                type="text"
                value={formData.productCode}
                onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formErrors.productCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter product code"
              />
              {formErrors.productCode && (
                <p className="text-red-500 text-sm mt-1">{formErrors.productCode}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HSN Code *
            </label>
            <input
              type="text"
              value={formData.hsnCode}
              onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.hsnCode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter HSN code (max 100 characters)"
              maxLength="100"
            />
            {formErrors.hsnCode && (
              <p className="text-red-500 text-sm mt-1">{formErrors.hsnCode}</p>
            )}
          </div>

          {/* Variants Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Product Variants</h3>
              <button
                type="button"
                onClick={addVariant}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Variant
              </button>
            </div>
            
            {formData.variants.map((variant, vIndex) => (
              <div key={vIndex} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-700">Variant {vIndex + 1}</h4>
                  {formData.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(vIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="mb-3">
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) => updateVariant(vIndex, 'name', e.target.value)}
                    className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors[`variant_${vIndex}_name`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Variant name (e.g., Size, Color)"
                  />
                  {formErrors[`variant_${vIndex}_name`] && (
                    <p className="text-red-500 text-sm mt-1">{formErrors[`variant_${vIndex}_name`]}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-600">Options</label>
                    <button
                      type="button"
                      onClick={() => addOption(vIndex)}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Option
                    </button>
                  </div>
                  
                  {variant.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={option.name}
                        onChange={(e) => updateOption(vIndex, oIndex, e.target.value)}
                        className={`flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors[`variant_${vIndex}_option_${oIndex}`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Option value"
                      />
                      {variant.options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOption(vIndex, oIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-medium ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Stock Management Component
  const StockManagement = () => {
    const [stockData, setStockData] = useState({
      productId: '',
      variantId: '',
      optionId: '',
      quantity: '',
      operation: 'add' // 'add' or 'remove'
    });
    const [stockErrors, setStockErrors] = useState({});

    const validateStockForm = () => {
      const errors = {};
      
      if (!stockData.productId) {
        errors.productId = 'Please select a product';
      }
      
      if (!stockData.variantId) {
        errors.variantId = 'Please select a variant';
      }
      
      if (!stockData.optionId) {
        errors.optionId = 'Please select an option';
      }
      
      if (!stockData.quantity || stockData.quantity <= 0) {
        errors.quantity = 'Please enter a valid quantity';
      }
      
      setStockErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleStockSubmit = async (e) => {
  e.preventDefault();

  if (!validateStockForm()) {
    showMessage('Please fix the validation errors', 'error');
    return;
  }

  setLoading(true);

  try {
    const selectedProduct = products.find(p => p.id === stockData.productId);
    const selectedVariant = selectedProduct?.variants.find(v => v.id === stockData.variantId);
    const selectedOption = selectedVariant?.options.find(o => o.id === stockData.optionId);

    if (!selectedVariant || !selectedOption) {
      showMessage('Invalid variant or option selected', 'error');
      setLoading(false);
      return;
    }

    const response = await fetch('http://localhost:3001/update-stock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: stockData.productId,
        variantName: selectedVariant.variantName,
        optionName: selectedOption.name,
        quantity: stockData.quantity,
        operation: stockData.operation,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      showMessage( result.error || 'Stock update failed', 'error');
    } else {
      showMessage( result.message, 'success');
      // Optionally: refetch products here to update stock display
    }

    // Reset form
    setStockData({
      productId: '',
      variantId: '',
      optionId: '',
      quantity: '',
      operation: 'add'
    });
    setStockErrors({});
  } catch (error) {
    console.error('❌ Error updating stock:', error);
    showMessage('❌ Failed to update stock', 'error');
  } finally {
    setLoading(false);
  }
};

    const selectedProduct = products.find(p => p.id === stockData.productId);
    const selectedVariant = selectedProduct?.variants.find(v => v.id === stockData.variantId);
    const selectedOption = selectedVariant?.options.find(o => o.id === stockData.optionId);

    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Package className="w-6 h-6" />
          Stock Management
        </h2>
        
        <form onSubmit={handleStockSubmit} className="space-y-6">
          {/* Operation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operation Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="operation"
                  value="add"
                  checked={stockData.operation === 'add'}
                  onChange={(e) => setStockData({ ...stockData, operation: e.target.value })}
                  className="mr-2"
                />
                Add Stock (Purchase)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="operation"
                  value="remove"
                  checked={stockData.operation === 'remove'}
                  onChange={(e) => setStockData({ ...stockData, operation: e.target.value })}
                  className="mr-2"
                />
                Remove Stock (Sale)
              </label>
            </div>
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Product *
            </label>
            <select
              value={stockData.productId}
              onChange={(e) => setStockData({ ...stockData, productId: e.target.value, variantId: '', optionId: '' })}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                stockErrors.productId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Choose a product...</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.productName} ({product.productCode})
                </option>
              ))}
            </select>
            {stockErrors.productId && (
              <p className="text-red-500 text-sm mt-1">{stockErrors.productId}</p>
            )}
          </div>

          {/* Variant Selection */}
          {selectedProduct && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Variant *
              </label>
              <select
                value={stockData.variantId}
                onChange={(e) => setStockData({ ...stockData, variantId: e.target.value, optionId: '' })}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  stockErrors.variantId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Choose a variant...</option>
                {selectedProduct.variants.map(variant => (
                  <option key={variant.id} value={variant.id}>
                    {variant.variantName || 'unnamed'}
                  </option>
                ))}
              </select>
              {stockErrors.variantId && (
                <p className="text-red-500 text-sm mt-1">{stockErrors.variantId}</p>
              )}
            </div>
          )}

          {/* Option Selection */}
          {selectedVariant && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Option *
              </label>
              <select
                value={stockData.optionId}
                onChange={(e) => setStockData({ ...stockData, optionId: e.target.value })}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  stockErrors.optionId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Choose an option...</option>
                {selectedVariant.options.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name} (Current Stock: {option.stock})
                  </option>
                ))}
              </select>
              {stockErrors.optionId && (
                <p className="text-red-500 text-sm mt-1">{stockErrors.optionId}</p>
              )}
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              value={stockData.quantity}
              onChange={(e) => setStockData({ ...stockData, quantity: e.target.value })}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                stockErrors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter quantity"
            />
            {stockErrors.quantity && (
              <p className="text-red-500 text-sm mt-1">{stockErrors.quantity}</p>
            )}
            {selectedOption && stockData.operation === 'remove' && (
              <p className="text-sm text-gray-600 mt-1">
                Available stock: {selectedOption.stock}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-medium ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : stockData.operation === 'add'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              } text-white`}
            >
              {loading ? 'Processing...' : stockData.operation === 'add' ? 'Add Stock' : 'Remove Stock'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Product List Component
  const ProductList = () => {
    const [filteredProducts, setFilteredProducts] = useState([]);
     const [searchQuery, setSearchQuery] = useState('');
    const itemsPerPage = 6;

    useEffect(() => {
      const filtered = products.filter(product =>
        product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.productCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }, [products, searchQuery]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    const toggleFavorite = (productId) => {
      const updatedProducts = products.map(product => {
        if (product.id === productId) {
          return { ...product, isFavourite: !product.isFavourite };
        }
        return product;
      });
      setProducts(updatedProducts);
    };

    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="w-6 h-6" />
            Product Inventory ({filteredProducts.length})
          </h2>
          
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {currentProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-800">{product.productName}</h3>
                        <button
                          onClick={() => toggleFavorite(product.id)}
                          className={`p-1 rounded ${
                            product.isFavourite ? 'text-yellow-500' : 'text-gray-400'
                          } hover:text-yellow-500`}
                        >
                          {product.isFavourite ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                        </button>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Code:</span> {product.productCode}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">HSN:</span> {product.hsnCode}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Total Stock:</span> 
                        <span className={`ml-1 font-semibold ${
                          product.totalStock > 50 ? 'text-green-600' : 
                          product.totalStock > 20 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {product.totalStock}
                        </span>
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {product.variants.map((variant, vIndex) => (
  <div key={variant.id || vIndex} className="bg-gray-50 rounded-lg p-3">
    <h4 className="font-medium text-gray-700 mb-2 capitalize">
      {variant.variantName || `Variant ${vIndex + 1}`}  {/* Changed from variant.name */}
    </h4>
    <div className="grid grid-cols-2 gap-2">
      {variant.options.map((option, oIndex) => (
        <div key={option.id || oIndex} className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            {option.name || `Option ${oIndex + 1}`}  {/* Changed from option.value */}
          </span>
          <span className={`font-medium ${
            option.stock > 20 ? 'text-green-600' : 
            option.stock > 5 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {option.stock}
          </span>
        </div>
      ))}
    </div>
  </div>
))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Updated: {new Date(product.updatedDate).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 border rounded-lg ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Main App Component
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management System</h1>
            
            {/* Navigation Tabs */}
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Product List
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'create'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Create Product
              </button>
              <button
                onClick={() => setActiveTab('stock')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'stock'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Stock Management
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Alert Messages */}
      {(success || error) && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'list' && <ProductList />}
        {activeTab === 'create' && <ProductForm />}
        {activeTab === 'stock' && <StockManagement />}
      </main>
    </div>
  );
};

function App() {
  return <InventorySystem />;
}

export default App;