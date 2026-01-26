import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Typography, Card, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../api/categoryApi';

const { Title } = Typography;

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [submitting, setSubmitting] = useState(false); // Trạng thái khi đang bấm lưu
    const [form] = Form.useForm();

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await getAllCategories();
            // Tùy theo cấu trúc API của ní, thường là response.data hoặc response
            const data = response.data || response;
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            message.error('Không thể kết nối danh sách danh mục.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const showModal = (category = null) => {
        setEditingCategory(category);
        if (category) {
            form.setFieldsValue(category);
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingCategory(null);
        form.resetFields();
    };

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            setSubmitting(true);
            try {
                if (editingCategory) {
                    await updateCategory(editingCategory.id, values);
                    message.success('Cập nhật danh mục thành công!');
                } else {
                    await createCategory(values);
                    message.success('Thêm danh mục mới thành công!');
                }
                handleCancel();
                fetchCategories();
            } catch (error) {
                message.error('Thao tác thất bại, vui lòng kiểm tra lại.');
            } finally {
                setSubmitting(false);
            }
        });
    };

    const handleDelete = async (id) => {
        try {
            await deleteCategory(id);
            message.success('Đã xóa danh mục!');
            fetchCategories();
        } catch (error) {
            message.error('Xóa thất bại (Danh mục có thể đang chứa sản phẩm).');
        }
    };

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            width: 100,
            render: (url) => (
                <Image
                    src={url || 'https://via.placeholder.com/50'}
                    alt="category"
                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                    fallback="https://via.placeholder.com/50?text=No+Image"
                />
            ),
        },
        { 
            title: 'Tên Danh Mục', 
            dataIndex: 'name', 
            key: 'name',
            render: (text) => <b style={{ color: '#1677ff' }}>{text}</b>
        },
        { 
            title: 'Mô Tả', 
            dataIndex: 'description', 
            key: 'description',
            ellipsis: true, // Tự động thu gọn nếu quá dài
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        type="primary" 
                        ghost 
                        icon={<EditOutlined />} 
                        onClick={() => showModal(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm 
                        title="Xóa danh mục này?" 
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDelete(record.id)} 
                        okText="Xóa" 
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={3} style={{ margin: 0 }}>📂 QUẢN LÝ DANH MỤC</Title>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    size="large"
                    onClick={() => showModal()}
                >
                    Thêm Danh Mục Mới
                </Button>
            </div>

            <Table 
                columns={columns} 
                dataSource={categories} 
                loading={loading} 
                rowKey="id"
                pagination={{ pageSize: 8 }}
                bordered
            />

            <Modal
                title={editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                confirmLoading={submitting}
                okText="Lưu lại"
                cancelText="Hủy bỏ"
                destroyOnClose // Xóa dữ liệu form khi đóng modal
            >
                <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
                    <Form.Item 
                        name="name" 
                        label="Tên danh mục" 
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                    >
                        <Input placeholder="Ví dụ: Nhẫn Kim Cương, Dây Chuyền..." />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả danh mục">
                        <Input.TextArea rows={3} placeholder="Mô tả ngắn gọn về loại sản phẩm này" />
                    </Form.Item>
                    <Form.Item 
                        name="imageUrl" 
                        label="Đường dẫn hình ảnh (URL)"
                    >
                        <Input placeholder="https://example.com/image.jpg" />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default CategoryManagement;