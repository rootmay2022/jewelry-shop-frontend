import React, { useState, useEffect } from 'react';
import { 
    Table, Button, Modal, Form, Input, InputNumber, Select, 
    message, Popconfirm, Space, Tag, Card, Row, Col, Statistic, Upload, Image 
} from 'antd';
import { 
    PlusOutlined, 
    ImportOutlined, 
    DeleteOutlined, 
    EditOutlined, 
    ShoppingOutlined,
    WarningOutlined,
    DollarOutlined
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

    // --- TÍNH NĂNG IMPORT EXCEL ---
    const handleImportExcel = (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const parsedData = XLSX.utils.sheet_to_json(sheet);

                message.loading({ content: 'Đang import dữ liệu...', key: 'import' });
                
                // Gửi từng sản phẩm lên Server
                let successCount = 0;
                for (const item of parsedData) {
                    const productData = {
                        name: item["Tên Sản Phẩm"] || item.name,
                        price: item["Giá"] || item.price,
                        stockQuantity: item["Số lượng"] || item.stockQuantity,
                        categoryId: item["Mã Danh Mục"] || item.categoryId,
                        description: item["Mô tả"] || item.description,
                        imageUrl: item["Link Ảnh"] || item.imageUrl,
                        material: item["Chất liệu"] || item.material,
                        weight: item["Trọng lượng"] || item.weight
                    };
                    await createProduct(productData);
                    successCount++;
                }

                message.success({ content: `Đã import thành công ${successCount} sản phẩm!`, key: 'import' });
                fetchProductsAndCategories();
            } catch (error) {
                message.error({ content: 'Lỗi định dạng file Excel hoặc kết nối API.', key: 'import' });
            }
        };
        reader.readAsBinaryString(file);
        return false; // Chặn không cho upload file lên server theo cách mặc định của Antd
    };

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            render: (url) => <Image src={url} alt="product" width={50} fallback="https://via.placeholder.com/50" />
        },
        { title: 'Tên Sản Phẩm', dataIndex: 'name', key: 'name', filterable: true },
        { 
            title: 'Danh Mục', 
            dataIndex: 'categoryName', 
            key: 'categoryName',
            render: (name) => <Tag color="blue">{name || 'Trang sức'}</Tag>
        },
        { 
            title: 'Giá', 
            dataIndex: 'price', 
            key: 'price', 
            sorter: (a, b) => a.price - b.price,
            render: (text) => <b style={{color: '#d4380d'}}>{formatCurrency(text)}</b> 
        },
        { 
            title: 'Tồn Kho', 
            dataIndex: 'stockQuantity', 
            key: 'stockQuantity',
            render: (q) => (
                <Tag color={q < 10 ? 'red' : 'green'}>{q} món</Tag>
            )
        },
        {
            title: 'Hành Động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" ghost icon={<EditOutlined />} onClick={() => showModal(record)} />
                    <Popconfirm title="Xóa sản phẩm này?" onConfirm={() => handleDelete(record.id)}>
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card><Statistic title="Tổng sản phẩm" value={products.length} prefix={<ShoppingOutlined />} /></Card>
                </Col>
                <Col span={8}>
                    <Card><Statistic title="Sắp hết hàng (<10)" value={products.filter(p => p.stockQuantity < 10).length} valueStyle={{color: '#cf1322'}} prefix={<WarningOutlined />} /></Card>
                </Col>
                <Col span={8}>
                    <Card><Statistic title="Giá trị kho" value={products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0)} formatter={v => formatCurrency(v)} prefix={<DollarOutlined />} /></Card>
                </Col>
            </Row>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Space>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Thêm Sản Phẩm</Button>
                    <Upload beforeUpload={handleImportExcel} showUploadList={false}>
                        <Button icon={<ImportOutlined />}>Import Excel</Button>
                    </Upload>
                </Space>
                <i style={{color: 'gray'}}>* File Excel cần cột: name, price, stockQuantity, categoryId...</i>
            </div>

            <Table columns={columns} dataSource={products} loading={loading} rowKey="id" bordered />

            {/* Modal Form giữ nguyên như cũ của ní nhưng thêm style cho đẹp */}
            <Modal
                title={editingProduct ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                open={isModalVisible}
                onOk={() => form.submit()}
                onCancel={() => setIsModalVisible(false)}
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={async (values) => {
                    try {
                        if (editingProduct) await updateProduct(editingProduct.id, values);
                        else await createProduct(values);
                        message.success('Thành công!');
                        setIsModalVisible(false);
                        fetchProductsAndCategories();
                    } catch (e) { message.error('Thất bại'); }
                }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}><Input /></Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}>
                                <Select>{categories.map(cat => <Option key={cat.id} value={cat.id}>{cat.name}</Option>)}</Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="price" label="Giá" rules={[{ required: true }]}><InputNumber style={{width:'100%'}} /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="stockQuantity" label="Tồn kho" rules={[{ required: true }]}><InputNumber style={{width:'100%'}} /></Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="weight" label="Trọng lượng (g)"><InputNumber style={{width:'100%'}} /></Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="imageUrl" label="URL Hình ảnh"><Input placeholder="https://..." /></Form.Item>
                    <Form.Item name="description" label="Mô tả"><TextArea rows={3} /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductManagement;