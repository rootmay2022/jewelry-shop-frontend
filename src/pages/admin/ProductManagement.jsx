import React, { useState, useEffect } from 'react';
import { 
    Table, Button, Modal, Form, Input, InputNumber, Select, 
    message, Popconfirm, Space, Tag, Card, Row, Col, Statistic, Upload, Image 
} from 'antd';
import { 
    PlusOutlined, ImportOutlined, DeleteOutlined, EditOutlined, 
    ShoppingOutlined, WarningOutlined, DollarOutlined 
} from '@ant-design/icons';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../../api/productApi';
import { getAllCategories } from '../../api/categoryApi';
import formatCurrency from '../../utils/formatCurrency';
import * as XLSX from 'xlsx';

const { Option } = Select;
const { TextArea } = Input;

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [submitting, setSubmitting] = useState(false); // Trạng thái khi đang lưu
    const [form] = Form.useForm();

    const fetchProductsAndCategories = async () => {
        setLoading(true);
        try {
            const [productsRes, categoriesRes] = await Promise.all([getAllProducts(), getAllCategories()]);
            if (productsRes.success) setProducts(productsRes.data);
            if (categoriesRes.success) setCategories(categoriesRes.data);
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProductsAndCategories(); }, []);

    // --- SỬA LỖI NÚT SỬA Ở ĐÂY ---
    const showModal = (product = null) => {
        if (product) {
            // Nếu là SỬA: Đổ data vào form
            setEditingProduct(product);
            form.setFieldsValue({
                ...product,
                categoryId: product.categoryId || product.category?.id // Đảm bảo ăn đúng ID danh mục
            });
        } else {
            // Nếu là THÊM MỚI: Reset form trống
            setEditingProduct(null);
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingProduct(null);
        form.resetFields();
    };

    // Hàm xử lý khi bấm "Lưu" trên Modal
    const handleFinish = async (values) => {
        setSubmitting(true);
        try {
            if (editingProduct) {
                // Gọi API Update
                await updateProduct(editingProduct.id, values);
                message.success('Cập nhật sản phẩm thành công!');
            } else {
                // Gọi API Create
                await createProduct(values);
                message.success('Thêm sản phẩm mới thành công!');
            }
            handleCancel();
            fetchProductsAndCategories();
        } catch (error) {
            message.error('Thao tác thất bại. Vui lòng kiểm tra lại!');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteProduct(id);
            message.success('Đã xóa sản phẩm!');
            fetchProductsAndCategories();
        } catch (error) {
            message.error('Xóa thất bại!');
        }
    };

    const columns = [
        {
            title: 'Ảnh',
            dataIndex: 'imageUrl',
            render: (url) => <Image src={url} width={50} fallback="https://via.placeholder.com/50" />
        },
        { title: 'Tên Sản Phẩm', dataIndex: 'name', key: 'name' },
        { 
            title: 'Giá', 
            dataIndex: 'price', 
            render: (p) => <b>{formatCurrency(p)}</b> 
        },
        { 
            title: 'Kho', 
            dataIndex: 'stockQuantity', 
            render: (q) => <Tag color={q < 10 ? 'red' : 'green'}>{q}</Tag> 
        },
        {
            title: 'Hành Động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button 
                        type="primary" 
                        icon={<EditOutlined />} 
                        onClick={() => showModal(record)} // Nút Sửa gọi hàm đổ data
                    >
                        Sửa
                    </Button>
                    <Popconfirm title="Xóa món này?" onConfirm={() => handleDelete(record.id)}>
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Title level={4}>QUẢN LÝ KHO HÀNG</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                    Thêm Sản Phẩm
                </Button>
            </div>

            <Table columns={columns} dataSource={products} loading={loading} rowKey="id" />

            <Modal
                title={editingProduct ? 'CẬP NHẬT SẢN PHẨM' : 'THÊM MỚI SẢN PHẨM'}
                open={isModalVisible}
                onCancel={handleCancel}
                onOk={() => form.submit()} // Kích hoạt submit form
                confirmLoading={submitting}
                okText="Lưu lại"
                cancelText="Hủy"
                width={650}
            >
                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={handleFinish} // Khi bấm OK hoặc Enter sẽ chạy hàm này
                >
                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Không được để trống!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
                                <Select>
                                    {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="price" label="Giá bán" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="stockQuantity" label="Số lượng tồn" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="imageUrl" label="Link hình ảnh">
                        <Input placeholder="https://..." />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả chi tiết">
                        <TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

const Title = Typography.Title; // Thêm cái này để chạy được Title

export default ProductManagement;