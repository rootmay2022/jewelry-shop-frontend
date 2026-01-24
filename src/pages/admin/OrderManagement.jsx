import React, { useState, useEffect } from 'react';
import { Table, Tag, Select, message, Spin, Typography } from 'antd';
import { getAllOrdersAdmin, updateOrderStatusAdmin } from '../../api/orderApi';
import dayjs from 'dayjs';
import formatCurrency from '../../utils/formatCurrency';

const { Title } = Typography;
const { Option } = Select;

const OrderManagement = () => {
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
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const response = await updateOrderStatusAdmin(orderId, newStatus);
            if (response.success) {
                message.success('Cập nhật trạng thái thành công!');
                fetchOrders();
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

    const columns = [
        { 
            title: 'Mã Đơn Hàng', 
            dataIndex: 'id', 
            key: 'id', 
            render: (id) => <b>#{id}</b> 
        },
        { 
            title: 'Khách Hàng', 
            key: 'customer', 
            render: (_, record) => {
                // ƯU TIÊN 1: Lấy trực tiếp từ đơn hàng (fullName, phone này lưu lúc khách bấm đặt hàng)
                // ƯU TIÊN 2: Lấy từ object user liên kết (nếu khách không nhập form mà lấy từ profile)
                // ƯU TIÊN 3: Lấy username nếu không có tên thật
                const displayName = record.fullName || record.user?.fullName || record.user?.username || record.name;
                const displayPhone = record.phone || record.user?.phone;

                // CHỈ HIỆN "ĐÃ XÓA" KHI: Không tìm thấy bất cứ cái tên nào VÀ object user bị null hoàn toàn
                const isUserDeleted = !record.user && !record.fullName && !record.name;

                return (
                    <div>
                        <div style={{ fontWeight: 'bold', color: isUserDeleted ? '#999' : '#0B3D91' }}>
                            {isUserDeleted ? (
                                <Tag color="default">Người dùng đã xóa</Tag>
                            ) : (
                                displayName || "Khách ẩn danh"
                            )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {displayPhone || "---"}
                        </div>
                    </div>
                );
            }
        },
        { 
            title: 'Ngày Đặt', 
            dataIndex: 'createdAt', 
            key: 'createdAt', 
            render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm') 
        },
        { 
            title: 'Tổng Tiền', 
            dataIndex: 'totalAmount', 
            key: 'totalAmount', 
            render: (text) => <b style={{ color: '#d4380d' }}>{formatCurrency(text)}</b> 
        },
        { 
            title: 'Trạng Thái', 
            dataIndex: 'status', 
            key: 'status', 
            render: (status) => getStatusTag(status) 
        },
        {
            title: 'Thao Tác',
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
        <div style={{ padding: '24px', background: '#fff', borderRadius: '8px' }}>
            <Title level={2} style={{ marginBottom: '24px' }}>Quản Lý Đơn Hàng</Title>
            <Spin spinning={loading}>
                <Table 
                    columns={columns} 
                    dataSource={orders} 
                    rowKey="id"
                    bordered
                    pagination={{ 
                        pageSize: 10,
                        showTotal: (total) => `Tổng cộng ${total} đơn hàng`
                    }}
                />
            </Spin>
        </div>
    );
};

export default OrderManagement;