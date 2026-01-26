import React, { useState, useEffect } from 'react';
import { 
    Table, Button, Modal, Form, Input, InputNumber, Select, 
    message, Popconfirm, Space, Tag, Card, Row, Col, Statistic, Image, Typography, Tooltip 
} from 'antd';
import { 
    PlusOutlined, DeleteOutlined, EditOutlined, 
    ShoppingOutlined, WarningOutlined, DollarOutlined, SearchOutlined, ReloadOutlined 
} from '@ant-design/icons';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../../api/productApi';
import { getAllCategories } from '../../api/categoryApi';
import formatCurrency from '../../utils/formatCurrency';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsRes, categoriesRes] = await Promise.all([getAllProducts(), getAllCategories()]);
            
            // Xử lý data linh hoạt (phòng trường hợp API trả về response.data hoặc trực tiếp mảng)
            const prodData = productsRes.data || productsRes;
            const cateData = categoriesRes.data || categoriesRes;

            setProducts(Array.isArray(prodData) ? prodData : []);
            setFilteredProducts(Array.isArray(prodData) ? prodData : []);
            setCategories(Array.isArray(cateData) ? cateData : []);
        } catch (error) {
            message.error('Không thể kết nối máy chủ để tải dữ liệu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Logic Tìm kiếm
    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        const filtered = products.filter(p => 
            p.name?.toLowerCase().includes(value) || 
            p.description?.toLowerCase().includes(value)
        );
        setFilteredProducts(filtered);
    };

    // Logic Lọc theo danh mục
    const handleFilterCategory = (value) => {
        if (!value) {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter(p => (p.categoryId || p.category?.id) === value);
            setFilteredProducts(filtered);
        }
    };

    const showModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            form.setFieldsValue({
                ...product,
                categoryId: product.categoryId || product.category?.id
            });
        } else {
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

    const handleFinish = async (values) => {
        setSubmitting(true);
        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, values);
                message.success('Đã cập nhật sản phẩm!');
            } else {
                await createProduct(values);
                message.success('Thêm sản phẩm mới thành công!');
            }
            handleCancel();
            fetchData();
        } catch (error) {
            message.error('Thao tác thất bại. Vui lòng thử lại!');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteProduct(id);
            message.success('Đã xóa sản phẩm khỏi kho!');
            fetchData();
        } catch (error) {
            message.error('Không thể xóa sản phẩm này!');
        }
    };

    const columns = [
        {
            title: 'Ảnh',
            dataIndex: 'imageUrl',
            width: 80,
            render: (url) => (
                <Image 
                    src={url} 
                    width={50} 
                    height={50} 
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                    fallback="https://via.placeholder.com/50?text=No+Image" 
                />
            )
        },
        { 
            title: 'Thông tin sản phẩm', 
            key: 'info',
            render: (_, record) => (
                <div>
                    <Text strong>{record.name}</Text>
                    <br />
                    <Tag color="blue">{categories.find(c => c.id === (record.categoryId || record.category?.id))?.name || 'Chưa phân loại'}</Tag>
                </div>
            )
        },
        { 
            title: 'Giá bán', 
            dataIndex: 'price', 
            sorter: (a, b) => a.price - b.price,
            render: (p) => <Text type="danger" strong>{formatCurrency(p)}</Text> 
        },
        { 
            title: 'Tồn kho', 
            dataIndex: 'stockQuantity', 
            sorter: (a, b) => a.stockQuantity - b.stockQuantity,
            render: (q) => {
                let color = q > 20 ? 'green' : (q > 0 ? 'orange' : 'red');
                let text = q > 0 ? q : 'Hết hàng';
                return <Tag color={color} style={{ fontWeight: 'bold' }}>{text}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Sửa">
                        <Button type="primary" ghost icon={<EditOutlined />} onClick={() => showModal(record)} />
                    </Tooltip>
                    <Popconfirm 
                        title="Xác nhận xóa?" 
                        description="Sản phẩm sẽ bị gỡ khỏi cửa hàng."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Tính toán thống kê
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);
    const lowStock = products.filter(p => p.stockQuantity < 10).length;

    return (
        <Card>
            <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
                <Col flex="auto">
                    <Title level={3} style={{ margin: 0 }}>📦 QUẢN LÝ KHO HÀNG</Title>
                </Col>
                <Col>
                    <Button icon={<ReloadOutlined />} onClick={fetchData}>Làm mới</Button>
                </Col>
            </Row>

            {/* Thống kê nhanh */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ background: '#f9f0ff' }}>
                        <Statistic title="Tổng mặt hàng" value={products.length} prefix={<ShoppingOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ background: '#fff7e6' }}>
                        <Statistic 
                            title="Sản phẩm sắp hết" 
                            value={lowStock} 
                            valueStyle={{ color: '#fa8c16' }} 
                            prefix={<WarningOutlined />} 
                            suffix="/ mặt hàng"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ background: '#f6ffed' }}>
                        <Statistic title="Tổng giá trị kho" value={totalValue} formatter={(v) => formatCurrency(v)} prefix={<DollarOutlined />} />
                    </Card>
                </Col>
            </Row>

            {/* Thanh công cụ */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={8}>
                    <Input 
                        placeholder="Tìm tên sản phẩm..." 
                        prefix={<SearchOutlined />} 
                        onChange={handleSearch}
                        allowClear
                    />
                </Col>
                <Col xs={24} md={6}>
                    <Select 
                        placeholder="Lọc theo danh mục" 
                        style={{ width: '100%' }} 
                        onChange={handleFilterCategory}
                        allowClear
                    >
                        {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                    </Select>
                </Col>
                <Col xs={24} md={10} style={{ textAlign: 'right' }}>
                    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => showModal()}>
                        Thêm Sản Phẩm Mới
                    </Button>
                </Col>
            </Row>

            <Table 
                columns={columns} 
                dataSource={filteredProducts} 
                loading={loading} 
                rowKey="id" 
                bordered
                pagination={{ pageSize: 6 }}
            />

            <Modal
                title={editingProduct ? '📑 CẬP NHẬT THÔNG TIN' : '🆕 THÊM SẢN PHẨM MỚI'}
                open={isModalVisible}
                onCancel={handleCancel}
                onOk={() => form.submit()}
                confirmLoading={submitting}
                okText="Lưu dữ liệu"
                cancelText="Hủy bỏ"
                width={700}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 20 }}>
                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                                <Input placeholder="Ví dụ: Nhẫn Kim Cương PNJ" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Chọn 1 nhóm' }]}>
                                <Select placeholder="Chọn danh mục">
                                    {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="price" label="Giá bán (VNĐ)" rules={[{ required: true }]}>
                                <InputNumber 
                                    style={{ width: '100%' }} 
                                    min={0}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="stockQuantity" label="Số lượng tồn kho" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="imageUrl" label="Đường dẫn hình ảnh">
                        <Input placeholder="Dán link ảnh tại đây (https://...)" />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả sản phẩm">
                        <TextArea rows={4} placeholder="Nhập thông tin chi tiết về chất liệu, kích thước..." />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default ProductManagement;