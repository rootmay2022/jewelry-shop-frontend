import React, { useState, useEffect } from 'react';
import { Table, Tag, Select, message, Spin, Typography } from 'antd';
import { getAllOrdersAdmin, updateOrderStatusAdmin } from '../../api/orderApi';
import { getAllUsersAdmin } from '../../api/authApi'; // ĐÃ ĐỔI THÀNH authApi
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
            // Chỉ gọi API khi ní chắc chắn hàm getAllUsersAdmin có trong authApi
            const [orderRes, userRes] = await Promise.all([
                getAllOrdersAdmin(),
                getAllUsersAdmin().catch(e => {
                    console.error("Lỗi lấy User:", e);
                    return []; // Trả về mảng rỗng nếu lỗi để ko sập web
                })
            ]);

            const userData = userRes.data || userRes;
            const orderData = orderRes.data || orderRes;

            if (Array.isArray(userData)) {
                const mapping = {};
                userData.forEach(u => {
                    mapping[u.id] = {
                        name: u.full_name || u.fullName || u.username,
                        phone: u.phone
                    };
                });
                setUsersMap(mapping);
            }

            if (Array.isArray(orderData)) {
                setOrders(orderData);
            }
        } catch (error) {
            console.error("Lỗi Fetch:", error);
            message.error('Lỗi tải dữ liệu đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const response = await updateOrderStatusAdmin(orderId, newStatus);
            if (response.success || response) {
                message.success('Cập nhật thành công!');
                fetchData();
            }
        } catch (error) { 
            message.error('Lỗi cập nhật trạng thái.'); 
        }
    };

    const columns = [
        { title: 'Mã Đơn', dataIndex: 'id', key: 'id', render: (id) => <b>#{id}</b> },
        { 
            title: 'Khách Hàng', 
            key: 'customer', 
            render: (_, record) => {
                const userId = record.user_id || record.userId;
                const userInfo = usersMap[userId];
                return (
                    <div>
                        <div style={{ fontWeight: 'bold' }}>
                            {userInfo ? <Text type="primary">{userInfo.name}</Text> : <Tag color="volcano">ID: {userId}</Tag>}
                        </div>
                        {userInfo?.phone && <div style={{ fontSize: '12px', color: '#888' }}>{userInfo.phone}</div>}
                    </div>
                );
            }
        },
        { 
            title: 'Địa Chỉ Giao', 
            dataIndex: 'shipping_address',
            key: 'shipping_address',
            render: (text, record) => <Text copyable>{text || record.shippingAddress || "N/A"}</Text>
        },
        { 
            title: 'Ngày Đặt', 
            dataIndex: 'order_date',
            render: (date, record) => dayjs(date || record.orderDate).format('DD/MM/YYYY HH:mm') 
        },
        { 
            title: 'Tổng Tiền', 
            dataIndex: 'total_amount',
            render: (val, record) => <b style={{ color: '#d4380d' }}>{formatCurrency(val || record.totalAmount)}</b> 
        },
        { 
            title: 'Trạng Thái', 
            dataIndex: 'status', 
            render: (status) => {
                const colors = { PENDING: 'gold', CONFIRMED: 'blue', SHIPPING: 'cyan', DELIVERED: 'green', CANCELLED: 'red' };
                return <Tag color={colors[status] || 'default'}>{status}</Tag>;
            }
        },
        {
            title: 'Thao Tác',
            key: 'action',
            render: (_, record) => (
                <Select
                    value={record.status}
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
        <div style={{ padding: '24px', background: '#fff', minHeight: '100vh' }}>
            <Title level={2}>📦 Quản Lý Đơn Hàng</Title>
            <Table columns={columns} dataSource={orders} rowKey="id" loading={loading} bordered pagination={{ pageSize: 8 }} />
        </div>
    );
};

export default OrderManagement;