import React, { useState, useEffect } from 'react';
import { Table, Tag, Select, message, Spin, Typography } from 'antd';
import { getAllOrdersAdmin, updateOrderStatusAdmin } from '../../api/orderApi';
import dayjs from 'dayjs';
import formatCurrency from '../../utils/formatCurrency';

const { Title, Text } = Typography;
const { Option } = Select;

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await getAllOrdersAdmin();
            console.log("Dữ liệu thực tế nè ní:", response.data); 
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
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const response = await updateOrderStatusAdmin(orderId, newStatus);
            if (response.success) {
                message.success('Cập nhật thành công!');
                fetchOrders();
            }
        } catch (error) {
            message.error('Lỗi cập nhật.');
        }
    };

    const columns = [
        { 
            title: 'Mã Đơn', 
            dataIndex: 'id', 
            key: 'id', 
            render: (id) => <Text strong>#{id}</Text> 
        },
        { 
            title: 'Khách Hàng', 
            key: 'customer', 
            render: (_, record) => {
                // TÌM TÊN TRONG MỌI NGÓC NGÁCH
                const name = record.fullName || record.user?.fullName || record.user?.username || record.name;
                const phone = record.phone || record.user?.phone;
                const userId = record.userId || record.user?.id; // Lấy cái ID người dùng ní nói

                return (
                    <div>
                        <div style={{ fontWeight: 'bold', color: '#0B3D91' }}>
                            {name ? name : (
                                userId ? <Tag color="blue">User ID: {userId}</Tag> : <Tag color="default">Khách vãng lai</Tag>
                            )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {phone || "Không có SĐT"}
                        </div>
                        {/* Nếu có User ID mà không có tên, báo lỗi dữ liệu cho Admin biết */}
                        {userId && !name && (
                            <div style={{ fontSize: '10px', color: 'red' }}>⚠️ Lỗi đồng bộ tên</div>
                        )}
                    </div>
                );
            }
        },
        { 
            title: 'Ngày Đặt', 
            dataIndex: 'createdAt', 
            render: (date) => dayjs(date).format('DD/MM/YYYY') 
        },
        { 
            title: 'Tổng Tiền', 
            dataIndex: 'totalAmount', 
            render: (val) => <Text type="danger" strong>{formatCurrency(val)}</Text> 
        },
        { 
            title: 'Trạng Thái', 
            dataIndex: 'status', 
            render: (status) => {
                const colors = { PENDING: 'orange', CONFIRMED: 'blue', SHIPPING: 'purple', DELIVERED: 'green', CANCELLED: 'red' };
                return <Tag color={colors[status]}>{status}</Tag>;
            }
        },
        {
            title: 'Cập nhật',
            key: 'action',
            render: (_, record) => (
                <Select
                    defaultValue={record.status}
                    style={{ width: 130 }}
                    onChange={(val) => handleStatusChange(record.id, val)}
                    disabled={['DELIVERED', 'CANCELLED'].includes(record.status)}
                >
                    <Option value="PENDING">Chờ duyệt</Option>
                    <Option value="CONFIRMED">Xác nhận</Option>
                    <Option value="SHIPPING">Đang giao</Option>
                    <Option value="DELIVERED">Đã giao</Option>
                    <Option value="CANCELLED">Hủy đơn</Option>
                </Select>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Quản Lý Đơn Hàng</Title>
            <Table 
                dataSource={orders} 
                columns={columns} 
                rowKey="id" 
                loading={loading}
                bordered
            />
        </div>
    );
};

export default OrderManagement;