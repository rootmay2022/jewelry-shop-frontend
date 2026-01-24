import React, { useState, useEffect } from 'react';
import { Table, Tag, Select, message, Spin, Typography } from 'antd';
import { getAllOrdersAdmin, updateOrderStatusAdmin } from '../../api/orderApi';
import { getAllUsersAdmin } from '../../api/userApi';
import dayjs from 'dayjs';
import formatCurrency from '../../utils/formatCurrency';

const { Title, Text } = Typography;
const { Option } = Select;

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [usersMap, setUsersMap] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [orderRes, userRes] = await Promise.all([
                getAllOrdersAdmin(),
                getAllUsersAdmin()
            ]);

            if (userRes.success) {
                const mapping = {};
                userRes.data.forEach(u => {
                    mapping[u.id] = {
                        name: u.full_name || u.username, // Khớp với cột full_name trong user.csv
                        phone: u.phone
                    };
                });
                setUsersMap(mapping);
            }
            if (orderRes.success) setOrders(orderRes.data);
        } catch (error) {
            message.error('Không thể tải dữ liệu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const response = await updateOrderStatusAdmin(orderId, newStatus);
            if (response.success) {
                message.success('Cập nhật thành công!');
                fetchData();
            }
        } catch (error) { message.error('Lỗi cập nhật.'); }
    };

    const columns = [
        { 
            title: 'Mã Đơn', 
            dataIndex: 'id', 
            key: 'id', 
            render: (id) => <b>#{id}</b> 
        },
        { 
            title: 'Khách Hàng', 
            key: 'customer', 
            render: (_, record) => {
                // Kiểm tra user_id (từ bangodder.csv)
                const userId = record.user_id || record.userId;
                const userInfo = usersMap[userId];

                return (
                    <div>
                        <div style={{ fontWeight: 'bold' }}>
                            {userInfo ? (
                                <Text type="primary">{userInfo.name}</Text>
                            ) : (
                                <Tag color="volcano">Người dùng đã xóa (ID: {userId})</Tag>
                            )}
                        </div>
                        {userInfo?.phone && <div style={{ fontSize: '12px', color: '#888' }}>{userInfo.phone}</div>}
                    </div>
                );
            }
        },
        { 
            title: 'Địa Chỉ Giao', 
            dataIndex: 'shipping_address', // Khớp với shipping_address trong CSV
            key: 'shipping_address',
            render: (address) => <Text copyable>{address || "Chưa có địa chỉ"}</Text>
        },
        { 
            title: 'Ngày Đặt', 
            dataIndex: 'order_date', // Khớp với order_date trong CSV
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm') 
        },
        { 
            title: 'Tổng Tiền', 
            dataIndex: 'total_amount', // Khớp với total_amount trong CSV
            render: (val) => <b style={{ color: '#d4380d' }}>{formatCurrency(val)}</b> 
        },
        { 
            title: 'Trạng Thái', 
            dataIndex: 'status', 
            render: (status) => {
                const colors = { PENDING: 'gold', CONFIRMED: 'blue', SHIPPING: 'cyan', DELIVERED: 'green', CANCELLED: 'red' };
                return <Tag color={colors[status]}>{status}</Tag>;
            }
        },
        {
            title: 'Cập Nhật',
            render: (_, record) => (
                <Select
                    defaultValue={record.status}
                    style={{ width: 140 }}
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
                columns={columns} 
                dataSource={orders} 
                rowKey="id" 
                loading={loading}
                bordered 
            />
        </div>
    );
};

export default OrderManagement;