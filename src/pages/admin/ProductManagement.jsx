// src/pages/admin/ProductManagement.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Space } from 'antd';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../../api/productApi';
import { getAllCategories } from '../../api/categoryApi';
import formatCurrency from '../../utils/formatCurrency';

const { Option } = Select;
const { TextArea } = Input;

const ProductManagement = () => {
    // Sửa lỗi 1: Khởi tạo là mảng rỗng []
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form] = Form.useForm();

    const fetchProductsAndCategories = async () => {
        setLoading(true);
        try {
            // Sửa lỗi 2: Destructuring kết quả từ Promise.all
            const [productsRes, categoriesRes] = await Promise.all([getAllProducts(), getAllCategories()]);
            if (productsRes.success) setProducts(productsRes.data);
            if (categoriesRes.success) setCategories(categoriesRes.data);
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductsAndCategories();
    // Sửa lỗi 3: Thêm dependency array []
    }, []);

    const showModal = (product = null) => {
        setEditingProduct(product);
        // Sửa lỗi 4: Đơn giản hóa setFieldsValue
        form.setFieldsValue(product || { name: '', categoryId: null, price: 0, stockQuantity: 0, description: '', imageUrl: '', material: '', weight: 0 });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingProduct(null);
        form.resetFields();
    };

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            try {
                if (editingProduct) {
                    await updateProduct(editingProduct.id, values);
                    message.success('Cập nhật sản phẩm thành công!');
                } else {
                    await createProduct(values);
                    message.success('Tạo sản phẩm thành công!');
                }
                handleCancel();
                fetchProductsAndCategories();
            } catch (error) {
                message.error('Thao tác thất bại.');
            }
        });
    };

    const handleDelete = async (id) => {
        try {
            await deleteProduct(id);
            message.success('Xóa sản phẩm thành công!');
            fetchProductsAndCategories();
        } catch (error) {
            message.error('Xóa thất bại.');
        }
    };

    // Sửa lỗi 5: Định nghĩa 'columns' bị thiếu
    const columns = [
        { title: 'Tên Sản Phẩm', dataIndex: 'name', key: 'name' },
        { title: 'Danh Mục', dataIndex: 'categoryName', key: 'categoryName' }, // Giả sử API trả về 'categoryName'
        { title: 'Giá', dataIndex: 'price', key: 'price', render: (text) => formatCurrency(text) },
        { title: 'Tồn Kho', dataIndex: 'stockQuantity', key: 'stockQuantity' },
        {
            title: 'Hành Động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button onClick={() => showModal(record)}>Sửa</Button>
                    <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
                        <Button danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Button type="primary" onClick={() => showModal()} style={{ marginBottom: 16 }}>
                Thêm Sản Phẩm
            </Button>
            <Table columns={columns} dataSource={products} loading={loading} rowKey="id" />

            <Modal
                title={editingProduct ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}
                // Sửa lỗi 7: 'visible' đã cũ, dùng 'open'
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
                        <Select>
                            {/* Sửa lỗi 6: categories.map() an toàn vì đã khởi tạo [] */}
                            {categories.map(cat => <Option key={cat.id} value={cat.id}>{cat.name}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="stockQuantity" label="Số lượng tồn kho" rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <TextArea />
                    </Form.Item>
                    <Form.Item name="imageUrl" label="URL Hình ảnh">
                        <Input />
                    </Form.Item>
                    <Form.Item name="material" label="Chất liệu">
                        <Input />
                    </Form.Item>
                    <Form.Item name="weight" label="Trọng lượng (gram)">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductManagement;