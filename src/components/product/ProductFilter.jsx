// src/components/product/ProductFilter.jsx
import React, { useState, useEffect } from 'react';
import { Card, Select, Slider, Typography } from 'antd';
import { getAllCategories } from '../../api/categoryApi';

const { Title } = Typography;
const { Option } = Select;

const ProductFilter = ({ onFilterChange }) => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [priceRange, setPriceRange] = useState([0, 50000000]);

    useEffect(() => {
        const fetchCategories = async () => {
            const response = await getAllCategories();
            if (response.success) {
                setCategories(response.data);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
        onFilterChange({ category: value });
    };

    // Sửa logic của hàm này
    const handlePriceChange = (value) => {
        setPriceRange(value);
        // SỬA LỖI: Thêm dòng này để gửi 
        // khoảng giá mới về component cha (ProductsPage)
        onFilterChange({ priceRange: value });
    };

    return (
        <Card>
            <Title level={4}>Bộ Lọc</Title>
            <div style={{ marginBottom: 24 }}>
                <Title level={5}>Danh mục</Title>
                <Select
                    placeholder="Chọn danh mục"
                    style={{ width: '100%' }}
                    onChange={handleCategoryChange}
                    allowClear
                >
                    {categories.map(cat => (
                        <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                    ))}
                </Select>
            </div>
            <div>
                <Title level={5}>Khoảng giá</Title>
                <Slider
                    range
                    min={0}
                    max={50000000}
                    step={100000}
                    defaultValue={[0, 50000000]}
                    // Dùng onAfterChange để chỉ gọi hàm khi người dùng nhả chuột
                    onAfterChange={handlePriceChange}
                    tipFormatter={value => `${(value / 1000000).toFixed(1)}tr`}
                />
            </div>
        </Card>
    );
};

export default ProductFilter;
