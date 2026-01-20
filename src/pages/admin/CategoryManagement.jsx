// src/pages/admin/CategoryManagement.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space } from 'antd';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../api/categoryApi';

const CategoryManagement = () => {
    // Sửa lỗi 1: Khởi tạo là mảng rỗng []
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form] = Form.useForm();

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await getAllCategories();
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            message.error('Lỗi khi tải danh mục.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    // Sửa lỗi 2: Thêm dependency array []
    }, []);

    const showModal = (category = null) => {
        setEditingCategory(category);
        // Sửa lỗi 3: Dùng || thay vì |
        form.setFieldsValue(category || { name: '', description: '', imageUrl: '' });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingCategory(null);
        form.resetFields();
    };

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            try {
                if (editingCategory) {
                    await updateCategory(editingCategory.id, values);
                    message.success('Cập nhật danh mục thành công!');
                } else {
                    await createCategory(values);
                    message.success('Tạo danh mục thành công!');
                }
                handleCancel();
                fetchCategories();
            } catch (error) {
                message.error('Thao tác thất bại.');
            }
        });
    };

    const handleDelete = async (id) => {
        try {
            await deleteCategory(id);
            message.success('Xóa danh mục thành công!');
            fetchCategories();
        } catch (error) {
            message.error('Xóa thất bại.');
        }
    };

    // Sửa lỗi 4: Định nghĩa 'columns' bị thiếu
    const columns = [
        { title: 'Tên Danh Mục', dataIndex: 'name', key: 'name' },
        { title: 'Mô Tả', dataIndex: 'description', key: 'description' },
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
                Thêm Danh Mục
            </Button>
            <Table columns={columns} dataSource={categories} loading={loading} rowKey="id" />

            <Modal
                title={editingCategory ? 'Sửa Danh Mục' : 'Thêm Danh Mục'}
                // Sửa lỗi 5: 'visible' đã cũ, dùng 'open'
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Tên danh mục" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name="imageUrl" label="URL Hình ảnh">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryManagement;