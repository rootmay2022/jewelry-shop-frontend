// src/pages/admin/OrderManagement.jsx
import React, { useState, useEffect } from 'react';
import { Table, Tag, Select, message, Spin, Typography } from 'antd';
import { getAllOrdersAdmin, updateOrderStatusAdmin } from '../../api/orderApi';
import dayjs from 'dayjs';
import formatCurrency from '../../utils/formatCurrency';

const { Title } = Typography;
const { Option } = Select;

const OrderManagement = () => {
    // Sửa lỗi 1: Khởi tạo là mảng rỗng []
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await getAllOrdersAdmin();
            if (response.success) {
                setOrders(response.data);
            }
        } catch (error) {
            message.error('Không thể tải danh sách đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    // Sửa lỗi 2: Thêm dependency array []
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const response = await updateOrderStatusAdmin(orderId, newStatus);
            if (response.success) {
                message.success('Cập nhật trạng thái thành công!');
                fetchOrders(); // Tải lại danh sách để cập nhật
            } else {
                message.error(response.message);
            }
        } catch (error) {
            message.error('Cập nhật trạng thái thất bại.');
        }
    };

    const getStatusTag = (status) => {
        switch (status) {
            case 'PENDING': return <Tag color="gold">Chờ xác nhận</Tag>;
            case 'CONFIRMED': return <Tag color="blue">Đã xác nhận</Tag>;
            case 'SHIPPING': return <Tag color="cyan">Đang giao</Tag>;
            case 'DELIVERED': return <Tag color="green">Đã giao</Tag>;
            case 'CANCELLED': return <Tag color="red">Đã hủy</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    // Sửa lỗi 3: Định nghĩa 'columns' bị thiếu
    const columns = [
        { title: 'Mã Đơn Hàng', dataIndex: 'id', key: 'id', render: (id) => `#${id}` },
        { title: 'Khách Hàng', dataIndex: 'customerName', key: 'customerName' }, // Giả sử API trả về 'customerName'
        { title: 'Ngày Đặt', dataIndex: 'createdAt', key: 'createdAt', render: (text) => dayjs(text).format('DD/MM/YYYY') },
        { title: 'Tổng Tiền', dataIndex: 'totalAmount', key: 'totalAmount', render: (text) => formatCurrency(text) },
        { title: 'Trạng Thái Cũ', dataIndex: 'status', key: 'status', render: (status) => getStatusTag(status) },
        {
            title: 'Cập Nhật Trạng Thái',
            key: 'action',
            render: (_, record) => (
                <Select
                    defaultValue={record.status}
                    style={{ width: 150 }}
                    onChange={(value) => handleStatusChange(record.id, value)}
                    disabled={record.status === 'DELIVERED' || record.status === 'CANCELLED'}
                >
                    <Option value="PENDING">Chờ xác nhận</Option>
                    <Option value="CONFIRMED">Đã xác nhận</Option>
                    <Option value="SHIPPING">Đang giao</Option>
                    <Option value="DELIVERED">Đã giao</Option>
                    <Option value="CANCELLED">Đã hủy</Option>
                </Select>
            ),
        },
    ];

    return (
        <div>
            <Title level={2}>Quản Lý Đơn Hàng</Title>
            <Spin spinning={loading}>
                <Table columns={columns} dataSource={orders} rowKey="id" />
            </Spin>
        </div>
    );
};

export default OrderManagement;