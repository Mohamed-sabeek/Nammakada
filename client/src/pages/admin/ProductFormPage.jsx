import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UploadSimple, Image as ImageIcon, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import api from '../../services/api';
import CustomSelect from '../../components/ui/CustomSelect';
import PageHeader from '../../components/ui/PageHeader';

const CATEGORIES = [
    'Groceries', 'Food', 'Fashion', 'Electronics', 'Beauty', 'Home & Kitchen', 'Books', 'Sports'
];

const ProductFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        quality: '',
        stock: '',
        category: CATEGORIES[0],
        image: null // File object
    });

    useEffect(() => {
        if (isEditMode) {
            const fetchProduct = async () => {
                try {
                    const { data } = await api.get(`/products/${id}`);
                    const p = data.data;
                    setFormData({
                        name: p.name,
                        description: p.description,
                        price: p.price,
                        discountPrice: p.discountPrice || '',
                        quality: p.quality || '',
                        stock: p.stock,
                        category: p.category,
                        image: null // Keep null so we only upload if new
                    });
                    setImagePreview(p.image); // Set existing image URL as preview
                } catch (err) {
                    setError('Failed to fetch product details');
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [id, isEditMode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (jpg, jpeg, png, webp)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        setFormData(prev => ({ ...prev, image: file }));
        setImagePreview(URL.createObjectURL(file));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('description', formData.description);
            submitData.append('price', formData.price);
            submitData.append('quality', formData.quality);
            if (formData.discountPrice) submitData.append('discountPrice', formData.discountPrice);
            submitData.append('stock', formData.stock);
            submitData.append('category', formData.category);
            
            if (formData.image) {
                submitData.append('image', formData.image);
            }

            if (isEditMode) {
                await api.put(`/products/${id}`, submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                if (!formData.image) {
                    throw new Error('Please select an image for the product');
                }
                await api.post('/products', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            navigate('/admin/products');
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to save product');
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-24">
            <div className="flex flex-col items-start mb-2">
                <Link to="/admin/products" className="text-sm font-bold text-gray-500 hover:text-green-600 flex items-center gap-2 mb-4 transition-colors">
                    <ArrowLeft size={16} weight="bold" /> Back to Products
                </Link>
                <PageHeader 
                    title={isEditMode ? 'Edit Product' : 'Add Product'} 
                    subtitle={isEditMode ? 'Update product information, pricing, inventory, and images.' : 'Add a new product to your NammaKada store.'} 
                />
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                    <WarningCircle size={20} weight="fill" /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Image Upload */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-gray-700">Product Image</label>
                        <div className="relative group cursor-pointer aspect-square rounded-2xl border-2 border-dashed border-gray-200 hover:border-green-500 bg-gray-50 flex flex-col items-center justify-center overflow-hidden transition-colors">
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                                        <UploadSimple size={32} />
                                        <span className="font-bold mt-2">Change Image</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-gray-400 p-6">
                                    <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                                    <p className="font-medium text-sm text-gray-600">Click to upload image</p>
                                    <p className="text-xs mt-2">JPG, PNG, WEBP (Max 5MB)</p>
                                </div>
                            )}
                            <input 
                                type="file" 
                                accept="image/jpeg, image/png, image/webp" 
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Right: Form Details */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
                            <input 
                                required 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                            <CustomSelect 
                                value={formData.category}
                                onChange={(value) => handleInputChange({ target: { name: 'category', value } })}
                                options={CATEGORIES.map(c => ({ value: c, label: c }))}
                                placeholder="Select a category"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
                                <input 
                                    required 
                                    type="number" 
                                    min="0"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Quality </label>
                                <CustomSelect 
                                    value={formData.quality || 'Standard'}
                                    onChange={(value) => handleInputChange({ target: { name: 'quality', value } })}
                                    options={[
                                        { value: 'Standard', label: 'Standard' },
                                        { value: 'Good', label: 'Good' },
                                        { value: 'Premium', label: 'Premium' }
                                    ]}
                                    placeholder="Select Quality"
                                />
                            </div>
                           
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Discount Price (Optional)</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    name="discountPrice"
                                    value={formData.discountPrice}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Stock Quantity</label>
                            <input 
                                required 
                                type="number" 
                                min="0"
                                name="stock"
                                value={formData.stock}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea 
                                required
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all resize-none"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end gap-4">
                    <Link 
                        to="/admin/products"
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                    >
                        Cancel
                    </Link>
                    <button 
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed w-48 justify-center"
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={20} weight="bold" /> 
                                {isEditMode ? 'Update Product' : 'Save Product'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductFormPage;
