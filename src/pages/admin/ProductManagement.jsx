import React, { useState, useEffect } from 'react';
import { 
    Table, Button, Modal, Form, Input, InputNumber, Select, 
    message, Popconfirm, Space, Tag, Card, Row, Col, Statistic, Image, Typography, Tooltip, Divider 
} from 'antd';
import { 
    PlusOutlined, DeleteOutlined, EditOutlined, 
    ShoppingOutlined, WarningOutlined, DollarOutlined, SearchOutlined, ReloadOutlined,
    PercentageOutlined, TagOutlined 
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

    const [isVoucherModalVisible, setIsVoucherModalVisible] = useState(false);
    const [vouchers, setVouchers] = useState([
        { id: 1, code: 'TET2026', type: 'fixed', value: 100000, minOrder: 500000, status: 'active' },
        { id: 2, code: 'FREE_SHIP', type: 'fixed', value: 30000, minOrder: 0, status: 'active' },
    ]);
    const [voucherForm] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsRes, categoriesRes] = await Promise.all([getAllProducts(), getAllCategories()]);
            const prodData = productsRes.data || productsRes;
            const cateData = categoriesRes.data || categoriesRes;
            setProducts(Array.isArray(prodData) ? prodData : []);
            setFilteredProducts(Array.isArray(prodData) ? prodData : []);
            setCategories(Array.isArray(cateData) ? cateData : []);
        } catch (error) {
            message.error('Không thể kết nối máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        const filtered = products.filter(p => 
            p.name?.toLowerCase().includes(value) || 
            p.description?.toLowerCase().includes(value)
        );
        setFilteredProducts(filtered);
    };

    const showModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            form.setFieldsValue({ ...product, categoryId: product.categoryId || product.category?.id });
        } else {
            setEditingProduct(null);
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleFinish = async (values) => {
        setSubmitting(true);
        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, values);
                message.success('Đã cập nhật sản phẩm!');
            } else {
                await createProduct(values);
                message.success('Thêm sản phẩm thành công!');
            }
            setIsModalVisible(false);
            fetchData();
        } catch (error) {
            message.error('Thao tác thất bại!');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddVoucher = (values) => {
        const newVoucher = { ...values, id: Date.now(), status: 'active' };
        setVouchers([...vouchers, newVoucher]);
        voucherForm.resetFields();
        message.success('Đã tạo mã giảm giá mới!');
    };

    const columns = [
        {
            title: 'Ảnh',
            dataIndex: 'imageUrl',
            width: 80,
            render: (url) => <Image src={url} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} fallback="https://via.placeholder.com/50?text=No+Image" />
        },
        { 
            title: 'Sản phẩm', 
            key: 'info',
            render: (_, record) => (
                <div>
                    <Text strong>{record.name}</Text><br />
                    <Tag color="blue">{categories.find(c => c.id === (record.categoryId || record.category?.id))?.name || 'Chưa phân loại'}</Tag>
                </div>
            )
        },
        { 
            title: 'Giá gốc', 
            dataIndex: 'price', 
            render: (p) => <Text delete type="secondary">{formatCurrency(p)}</Text> 
        },
        { 
            title: 'Giá sau giảm', 
            key: 'discount',
            render: (_, record) => {
                const price = record.price || 0;
                const discount = record.discountValue || 0;
                
                // FIX: Nếu không có giảm giá, hiển thị giá gốc bình thường
                if (discount <= 0) {
                    return <Text strong>{formatCurrency(price)}</Text>;
                }

                const finalPrice = record.discountType === 'percent' 
                    ? price * (1 - discount / 100) 
                    : price - discount;

                return (
                    <Space direction="vertical" size={0}>
                        <Text type="danger" strong>{formatCurrency(finalPrice)}</Text>
                        <Tag color="volcano">-{discount}{record.discountType === 'percent' ? '%' : 'đ'}</Tag>
                    </Space>
                );
            }
        },
        { title: 'Kho', dataIndex: 'stockQuantity', render: (q) => <Tag color={q > 10 ? 'green' : 'red'}>{q}</Tag> },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button type="primary" ghost icon={<EditOutlined />} onClick={() => showModal(record)} />
                    <Popconfirm title="Xóa sản phẩm này?" onConfirm={() => deleteProduct(record.id).then(fetchData)}>
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
                <Col flex="auto"><Title level={3} style={{ margin: 0 }}>📦 QUẢN LÝ SẢN PHẨM & VOUCHER</Title></Col>
                <Col>
                    <Space>
                        <Button 
                            icon={<TagOutlined />} 
                            onClick={() => setIsVoucherModalVisible(true)}
                            style={{ background: '#f9f0ff', color: '#722ed1', borderColor: '#d3adf7' }}
                        >
                            Quản lý Voucher
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Thêm Sản Phẩm</Button>
                        <Button icon={<ReloadOutlined />} onClick={fetchData} />
                    </Space>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={8}>
                    <Input placeholder="Tìm tên sản phẩm..." prefix={<SearchOutlined />} onChange={handleSearch} allowClear />
                </Col>
            </Row>

            <Table columns={columns} dataSource={filteredProducts} loading={loading} rowKey="id" bordered pagination={{ pageSize: 5 }} />

            <Modal title={editingProduct ? '📑 CẬP NHẬT' : '🆕 THÊM MỚI'} open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()} confirmLoading={submitting}>
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <Row gutter={16}>
                        <Col span={16}><Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={8}>
                            <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
                                <Select>{categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}</Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="price" label="Giá gốc"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="stockQuantity" label="Tồn kho"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                    </Row>
                    <Divider orientation="left"><Text type="secondary"><PercentageOutlined /> Giảm giá tại món</Text></Divider>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="discountType" label="Loại" initialValue="percent">
                                <Select><Option value="percent">Phần trăm (%)</Option><Option value="fixed">Số tiền (đ)</Option></Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}><Form.Item name="discountValue" label="Giá trị giảm" initialValue={0}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                    </Row>
                    <Form.Item name="imageUrl" label="Link ảnh"><Input /></Form.Item>
                    <Form.Item name="description" label="Mô tả"><TextArea rows={3} /></Form.Item>
                </Form>
            </Modal>

            <Modal
                title={<span><TagOutlined /> QUẢN LÝ MÃ GIẢM GIÁ TOÀN SHOP</span>}
                open={isVoucherModalVisible}
                onCancel={() => setIsVoucherModalVisible(false)}
                width={850}
                footer={null}
            >
                <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 20 }}>
                    <Title level={5}>Tạo mã Voucher mới</Title>
                    <Form form={voucherForm} layout="inline" onFinish={handleAddVoucher}>
                        <Form.Item name="code" rules={[{ required: true, message: 'Nhập mã!' }]}><Input placeholder="Ví dụ: SALE50K" style={{ width: 150 }} /></Form.Item>
                        <Form.Item name="type" initialValue="fixed"><Select style={{ width: 120 }}><Option value="fixed">Tiền mặt</Option><Option value="percent">% Giảm</Option></Select></Form.Item>
                        <Form.Item name="value" rules={[{ required: true }]}><InputNumber placeholder="Giá trị" style={{ width: 100 }} /></Form.Item>
                        <Form.Item name="minOrder" label="Đơn tối thiểu" initialValue={0}><InputNumber style={{ width: 120 }} /></Form.Item>
                        <Form.Item><Button type="primary" htmlType="submit" icon={<PlusOutlined />} style={{ background: '#722ed1' }}>Lưu mã</Button></Form.Item>
                    </Form>
                </div>

                <Table 
                    dataSource={vouchers} 
                    rowKey="id" 
                    size="small"
                    columns={[
                        { title: 'Mã', dataIndex: 'code', render: c => <Tag color="purple" style={{fontWeight: 'bold'}}>{c}</Tag> },
                        { title: 'Giảm', render: (_, r) => r.type === 'percent' ? `${r.value}%` : formatCurrency(r.value) },
                        { title: 'Đơn tối thiểu', dataIndex: 'minOrder', render: v => formatCurrency(v) },
                        { title: 'Trạng thái', render: () => <Tag color="green">Đang chạy</Tag> },
                        { title: 'Xóa', render: (_, r) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setVouchers(vouchers.filter(v => v.id !== r.id))} /> }
                    ]}
                />
            </Modal>
        </Card>
    );
};

export default ProductManagement;