import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col, Spin, Input, Pagination, Typography, Checkbox, Slider, Space, Divider, Button, Drawer, message } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, ThunderboltOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAllProducts, searchProducts } from '../../api/productApi';
import { getAllCategories } from '../../api/categoryApi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/product/ProductCard';
import formatCurrency from '../../utils/formatCurrency';

const { Title, Text } = Typography;
const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
    const navigate = useNavigate();
    // Lấy thêm biến 'cart' để biết trong giỏ đang có gì
    const { addToCart, cart } = useCart(); 
    const { isAuthenticated } = useAuth();

    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]); 
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    
    const [addingToCartId, setAddingToCartId] = useState(null);

    const [filters, setFilters] = useState({ 
        categories: [], 
        priceRange: [0, 2000000000],
        brand: null 
    });

    const theme = {
        navy: '#001529',
        gold: '#D4AF37',
    };

    const fetchCategories = async () => {
        try {
            const response = await getAllCategories();
            const data = response.data || response;
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi lấy danh mục:", error);
        }
    };

    const fetchProducts = useCallback(async (keyword = '') => {
        setLoading(true);
        try {
            const response = keyword ? await searchProducts(keyword) : await getAllProducts();
            if (response.success) {
                const data = response.data || [];
                setAllProducts(data);
                setFilteredProducts(data);
            }
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts]);

    // --- HÀM KIỂM TRA SỐ LƯỢNG TRONG GIỎ ---
    const getQtyInCart = (productId) => {
        if (!cart || !cart.items) return 0;
        const item = cart.items.find(i => i.productId === productId || i.product?.id === productId);
        return item ? item.quantity : 0;
    };

    // --- 3. XỬ LÝ MUA NGAY ---
    const handleBuyNow = async (product) => {
        if (!isAuthenticated) return navigate('/login');
        
        // Check số lượng trong giỏ
        const currentQty = getQtyInCart(product.id);
        if (currentQty >= product.stockQuantity) {
            message.warning('Bạn đã có hết số lượng tồn kho trong giỏ hàng!');
            return navigate('/cart');
        }

        try {
            await addToCart(product, 1); 
            navigate('/cart'); 
        } catch (error) {
            // Context đã handle lỗi
        }
    };

    // --- 4. XỬ LÝ THÊM VÀO GIỎ ---
    const handleAddToCart = async (product) => {
        if (!isAuthenticated) return navigate('/login');

        // Check số lượng trong giỏ
        const currentQty = getQtyInCart(product.id);
        if (currentQty >= product.stockQuantity) {
            message.warning('Bạn đã thêm hết số lượng có trong kho vào giỏ rồi!');
            return;
        }

        setAddingToCartId(product.id);
        try {
            await addToCart(product, 1);
        } catch (error) {
            console.error(error);
        } finally {
            setAddingToCartId(null);
        }
    };

    useEffect(() => {
        let result = [...allProducts];
        if (filters.categories.length > 0) {
            result = result.filter(p => filters.categories.includes(Number(p.categoryId)));
        }
        if (filters.brand) {
            result = result.filter(p => p.name.toLowerCase().includes(filters.brand.toLowerCase()));
        }
        const [min, max] = filters.priceRange;
        result = result.filter(p => Number(p.price) >= min && Number(p.price) <= max);
        setFilteredProducts(result);
        setCurrentPage(1); 
    }, [filters, allProducts]);

    const resetFilters = () => setFilters({ categories: [], priceRange: [0, 2000000000], brand: null });

    const paginatedProducts = useMemo(() => {
        return filteredProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const FilterContent = () => (
        <Space direction="vertical" style={{ width: '100%' }} size={24}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={5} style={{ fontFamily: 'serif', margin: 0 }}>BỘ LỌC</Title>
                <Button type="link" onClick={resetFilters} style={{ color: theme.gold, padding: 0 }}>Xóa tất cả</Button>
            </div>
            <div>
                <Text strong style={{ display: 'block', marginBottom: '12px', fontSize: '12px', color: '#888' }}>DANH MỤC</Text>
                <Checkbox.Group style={{ width: '100%' }} value={filters.categories} onChange={(vals) => setFilters(prev => ({...prev, categories: vals}))}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {categories.map(cat => (
                            <Checkbox key={cat.id} value={Number(cat.id)}>{cat.name}</Checkbox>
                        ))}
                    </Space>
                </Checkbox.Group>
            </div>
            <Divider style={{ margin: '0' }} />
            <div>
                <Text strong style={{ display: 'block', marginBottom: '12px', fontSize: '12px', color: '#888' }}>KHOẢNG GIÁ</Text>
                <Slider range step={500000} min={0} max={2000000000} value={filters.priceRange} onChange={(val) => setFilters(prev => ({...prev, priceRange: val}))} trackStyle={[{ backgroundColor: theme.gold }]} />
                <Text type="secondary" style={{ fontSize: '12px' }}>{formatCurrency(filters.priceRange[0])} - {formatCurrency(filters.priceRange[1])}</Text>
            </div>
        </Space>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fff', paddingBottom: '50px' }}>
            <div style={{ backgroundColor: theme.navy, padding: '60px 20px', textAlign: 'center', marginBottom: '40px' }}>
                <Title level={1} style={{ color: theme.gold, fontFamily: 'serif', margin: 0 }}>THE COLLECTION</Title>
                <Text style={{ color: '#fff', opacity: 0.7, letterSpacing: '2px' }}>LUXURY EXPERIENCE</Text>
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 25px' }}>
                <Row gutter={[40, 40]}>
                    <Col xs={0} md={7} lg={6} xl={5}>
                        <div style={{ position: 'sticky', top: '120px', padding: '25px', border: '1px solid #f0f0f0' }}>
                            <FilterContent />
                        </div>
                    </Col>

                    <Col xs={24} md={17} lg={18} xl={19}>
                        <Input size="large" placeholder="Tìm tên sản phẩm..." prefix={<SearchOutlined />} style={{ marginBottom: '40px', borderRadius: 0 }} onPressEnter={(e) => fetchProducts(e.target.value)} />

                        {loading ? <Spin size="large" style={{ display: 'block', margin: '100px auto' }} /> : (
                            <>
                                <Row gutter={[24, 40]}>
                                    {paginatedProducts.map(product => {
                                        const isOutOfStock = product.stockQuantity <= 0;
                                        const isAdding = addingToCartId === product.id;
                                        
                                        // --- LOGIC MỚI: KIỂM TRA ĐÃ CÓ TRONG GIỎ CHƯA ---
                                        const qtyInCart = getQtyInCart(product.id);
                                        const isMaxedOut = qtyInCart >= product.stockQuantity; // Đã mua hết số lượng có thể

                                        return (
                                            <Col xs={12} sm={12} md={12} lg={8} xl={6} key={product.id}>
                                                <div className="product-item-card" style={{ border: '1px solid #f0f0f0', height: '100%', display: 'flex', flexDirection: 'column', paddingBottom: '15px', position: 'relative' }}>
                                                    
                                                    {isOutOfStock && (
                                                        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2, background: '#ff4d4f', color: 'white', padding: '2px 8px', fontSize: '12px', fontWeight: 'bold' }}>HẾT HÀNG</div>
                                                    )}

                                                    <ProductCard product={product} />
                                                    
                                                    <div style={{ padding: '0 12px', marginTop: 'auto' }}>
                                                        <Button 
                                                            block type="primary" 
                                                            icon={!isOutOfStock && <ThunderboltOutlined />} 
                                                            onClick={() => handleBuyNow(product)}
                                                            disabled={isOutOfStock || isAdding || isMaxedOut}
                                                            style={{ 
                                                                background: (isOutOfStock || isMaxedOut) ? '#d9d9d9' : theme.navy, 
                                                                borderColor: (isOutOfStock || isMaxedOut) ? '#d9d9d9' : theme.navy, 
                                                                color: (isOutOfStock || isMaxedOut) ? 'rgba(0,0,0,0.45)' : '#fff',
                                                                borderRadius: 0, marginBottom: '8px', height: '40px', fontWeight: 'bold'
                                                            }}
                                                        >
                                                            {isOutOfStock ? 'HẾT HÀNG' : isMaxedOut ? 'ĐÃ CÓ TRONG GIỎ' : 'MUA NGAY'}
                                                        </Button>

                                                        <Button 
                                                            block 
                                                            icon={!isOutOfStock && !isMaxedOut && <ShoppingCartOutlined />} 
                                                            onClick={() => handleAddToCart(product)}
                                                            disabled={isOutOfStock || isAdding || isMaxedOut}
                                                            loading={isAdding}
                                                            style={{ borderRadius: 0, height: '40px' }}
                                                        >
                                                            {isOutOfStock ? 'Tạm hết' : isMaxedOut ? 'Đủ số lượng' : (isAdding ? 'Đang thêm...' : 'Thêm vào giỏ')}
                                                        </Button>
                                                        
                                                        {/* Hiển thị dòng nhắc nhở nhỏ nếu đã có trong giỏ */}
                                                        {qtyInCart > 0 && !isOutOfStock && (
                                                            <div style={{ textAlign: 'center', marginTop: 5 }}>
                                                                <Text type="secondary" style={{ fontSize: '11px', color: theme.gold }}>
                                                                    <CheckCircleOutlined /> Đã có {qtyInCart} sản phẩm
                                                                </Text>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Col>
                                        );
                                    })}
                                </Row>
                                <Pagination current={currentPage} total={filteredProducts.length} pageSize={PRODUCTS_PER_PAGE} onChange={setCurrentPage} style={{ marginTop: 60, textAlign: 'center' }} />
                            </>
                        )}
                    </Col>
                </Row>
            </div>
            <Drawer title="BỘ LỌC" placement="right" onClose={() => setIsDrawerVisible(false)} open={isDrawerVisible}><FilterContent /></Drawer>
            <style>{`.product-item-card:hover { box-shadow: 0 10px 20px rgba(0,0,0,0.08); transform: translateY(-3px); transition: all 0.3s; } .ant-btn-primary:hover:not(:disabled) { background: ${theme.gold} !important; border-color: ${theme.gold} !important; }`}</style>
        </div>
    );
};

export default ProductsPage;