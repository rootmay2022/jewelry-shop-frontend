// src/pages/order/MyOrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, message, Spin, Typography, Modal, Space } from 'antd';
import { getUserOrders, cancelOrder } from '../../api/orderApi';
import dayjs from 'dayjs';
import formatCurrency from '../../utils/formatCurrency';

const { Title, Text } = Typography;

const MyOrdersPage = () => {
    // Sửa lỗi 1: Khởi tạo là mảng rỗng []
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    // Sửa lỗi 2: Thiếu [selectedOrder, setSelectedOrder]
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await getUserOrders();
                if (response.success) {
                    setOrders(response.data);
                }
            } catch (error) {
                message.error('Không thể tải lịch sử đơn hàng.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    // Sửa lỗi 3: Thiếu dependency array []
    }, []);

    const handleCancelOrder = async (orderId) => {
        try {
            const response = await cancelOrder(orderId);
            if (response.success) {
                message.success('Hủy đơn hàng thành công.');
                setOrders(orders.map(o => o.id === orderId ? {...o, status: 'CANCELLED' } : o));
            } else {
                message.error(response.message);
            }
        } catch (error) {
            // Sửa lỗi 4: Dùng || thay vì |
            message.error(error.response?.data?.message || 'Không thể hủy đơn hàng.');
        }
    };

    const showOrderDetails = (order) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
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

    // Sửa lỗi 5: Khai báo columns bị thiếu hoàn toàn
    const columns = [
        { title: 'Mã Đơn Hàng', dataIndex: 'id', key: 'id', render: (id) => `#${id}` },
        { title: 'Ngày Đặt', dataIndex: 'createdAt', key: 'createdAt', render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm') },
        { title: 'Tổng Tiền', dataIndex: 'totalAmount', key: 'totalAmount', render: (text) => formatCurrency(text) },
        { title: 'Trạng Thái', dataIndex: 'status', key: 'status', render: (status) => getStatusTag(status) },
        {
            title: 'Hành Động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button onClick={() => showOrderDetails(record)}>Xem Chi Tiết</Button>
                    {/* Chỉ cho phép hủy khi đơn hàng đang PENDING */}
                    {record.status === 'PENDING' && (
                        <Button danger onClick={() => handleCancelOrder(record.id)}>
                            Hủy Đơn
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Lịch Sử Đơn Hàng</Title>
            <Spin spinning={loading}>
                <Table columns={columns} dataSource={orders} rowKey="id" />
            </Spin>
            <Modal
                title={`Chi tiết đơn hàng #${selectedOrder?.id}`}
                open={isModalVisible} // 'visible' đã cũ, 'open' là thuộc tính mới
                onCancel={() => setIsModalVisible(false)}
                // Sửa lỗi 6: footer={} không hợp lệ, dùng footer={null} để ẩn footer
                footer={null}
            >
                {selectedOrder && (
                    <div>
                        <p><Text strong>Địa chỉ giao hàng:</Text> {selectedOrder.shippingAddress}</p>
                        <p><Text strong>Phương thức thanh toán:</Text> {selectedOrder.paymentMethod}</p>
                        <Title level={5}>Các sản phẩm:</Title>
                        <ul>
                            {selectedOrder.items.map(item => (
                                <li key={item.id}>
                                    {item.productName} (x{item.quantity}) - {formatCurrency(item.price)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MyOrdersPage;