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

            // Fix lỗi nếu API trả về thẳng data mà không có bọc .success
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
            } else {
                console.error("Dữ liệu đơn hàng không đúng định dạng mảng:", orderRes);
            }
        } catch (error) {
            console.error("Lỗi Fetch:", error);
            message.error('Không thể tải dữ liệu. Kiểm tra Console F12');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const response = await updateOrderStatusAdmin(orderId, newStatus);
            // Kiểm tra cả response.success hoặc response (nếu trả về object thẳng)
            if (response.success || response) {
                message.success('Cập nhật thành công!');
                fetchData(); // Phải gọi lại để giao diện "ăn" trạng thái mới
            }
        } catch (error) { 
            message.error('Lỗi cập nhật trạng thái.'); 
        }
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
                // Đọc cả 2 kiểu user_id (snake_case) và userId (camelCase)
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
            dataIndex: 'shipping_address',
            key: 'shipping_address',
            // Render thêm fallback nếu shipping_address bị null
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
                    value={record.status} // Dùng value thay vì defaultValue để nó nhảy theo state
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
            <Table 
                columns={columns} 
                dataSource={orders} 
                rowKey="id" 
                loading={loading}
                bordered 
                pagination={{ pageSize: 8 }}
            />
        </div>
    );
};

export default OrderManagement;