import React, { useState, useEffect } from 'react';
import { Table, Tag, Select, message, Typography, Space, Card, Badge } from 'antd';
import { getAllOrdersAdmin, updateOrderStatusAdmin } from '../../api/orderApi';
import { getAllUsersAdmin } from '../../api/authApi';
import dayjs from 'dayjs';
import formatCurrency from '../../utils/formatCurrency';
import { CheckCircleOutlined, SyncOutlined, clockCircleOutlined, CloseCircleOutlined, CarOutlined } from '@ant-design/icons';

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
                getAllUsersAdmin().catch(e => {
                    console.error("Lỗi lấy User:", e);
                    return { data: [] };
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
                // Sắp xếp đơn hàng mới nhất lên đầu
                const sortedOrders = orderData.sort((a, b) => b.id - a.id);
                setOrders(sortedOrders);
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
        // Hiện hiệu ứng chờ vì quá trình trừ kho ở Backend có thể mất chút thời gian
        const hide = message.loading('Đang cập nhật trạng thái và xử lý kho...', 0);
        try {
            const response = await updateOrderStatusAdmin(orderId, newStatus);
            
            // Nếu backend trả về ApiResponse { success: true, ... }
            if (response.success || response) {
                message.success(response.message || 'Cập nhật trạng thái thành công!');
                fetchData(); // Tải lại để cập nhật bảng
            }
        } catch (error) { 
            console.error("Lỗi cập nhật:", error);
            // LẤY TIN NHẮN LỖI CHI TIẾT (Ví dụ: "Sản phẩm Kim Cương không đủ số lượng")
            const errorMsg = error.response?.data?.message || 'Lỗi cập nhật trạng thái.';
            message.error(errorMsg); 
            fetchData(); // Refresh để đảm bảo Select box không hiển thị sai trạng thái
        } finally {
            hide();
        }
    };

    const columns = [
        { 
            title: 'Mã Đơn', 
            dataIndex: 'id', 
            key: 'id', 
            width: 100,
            render: (id) => <Text strong>#{id}</Text> 
        },
        { 
            title: 'Khách Hàng', 
            key: 'customer', 
            render: (_, record) => {
                const userId = record.user_id || record.userId;
                const userInfo = usersMap[userId];
                return (
                    <Space direction="vertical" size={0}>
                        <Text strong>{userInfo ? userInfo.name : `ID: ${userId}`}</Text>
                        {userInfo?.phone && <Text type="secondary" style={{ fontSize: '12px' }}>{userInfo.phone}</Text>}
                    </Space>
                );
            }
        },
        { 
            title: 'Địa Chỉ Giao', 
            dataIndex: 'shipping_address',
            key: 'shipping_address',
            render: (text, record) => <Text ellipsis={{ tooltip: text || record.shippingAddress }} style={{ maxWidth: 200 }}>{text || record.shippingAddress || "N/A"}</Text>
        },
        { 
            title: 'Ngày Đặt', 
            dataIndex: 'order_date',
            width: 150,
            render: (date, record) => dayjs(date || record.orderDate).format('DD/MM/YYYY HH:mm') 
        },
        { 
            title: 'Tổng Tiền', 
            dataIndex: 'total_amount',
            width: 150,
            render: (val, record) => <Text strong style={{ color: '#cf1322' }}>{formatCurrency(val || record.totalAmount)}</Text> 
        },
        { 
            title: 'Trạng Thái', 
            dataIndex: 'status', 
            width: 150,
            render: (status) => {
                const config = {
                    PENDING: { color: 'gold', text: 'Chờ duyệt', icon: <SyncOutlined spin /> },
                    CONFIRMED: { color: 'blue', text: 'Đã xác nhận', icon: <CheckCircleOutlined /> },
                    SHIPPING: { color: 'cyan', text: 'Đang giao', icon: <CarOutlined /> },
                    DELIVERED: { color: 'green', text: 'Đã giao (Trừ kho)', icon: <CheckCircleOutlined /> },
                    CANCELLED: { color: 'red', text: 'Đã hủy', icon: <CloseCircleOutlined /> },
                };
                const item = config[status] || { color: 'default', text: status };
                return <Tag icon={item.icon} color={item.color}>{item.text.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Thao Tác',
            key: 'action',
            fixed: 'right',
            width: 180,
            render: (_, record) => (
                <Select
                    value={record.status}
                    style={{ width: 160 }}
                    onChange={(val) => handleStatusChange(record.id, val)}
                    // Khóa không cho sửa nếu đã giao hoặc đã hủy
                    disabled={['DELIVERED', 'CANCELLED'].includes(record.status)}
                >
                    <Option value="PENDING">Chờ duyệt</Option>
                    <Option value="CONFIRMED">Xác nhận</Option>
                    <Option value="SHIPPING">Đang giao</Option>
                    <Option value="DELIVERED">Đã giao (Trừ kho)</Option>
                    <Option value="CANCELLED">Hủy đơn</Option>
                </Select>
            ),
        },
    ];

    return (
        <Card style={{ margin: '24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={3} style={{ margin: 0 }}>📦 Quản Lý Đơn Hàng & Điều Tiết Kho</Title>
                <Badge count={orders.length} overflowCount={999} color="#108ee9" style={{ marginBottom: '10px' }}>
                    <Text type="secondary">Tổng số đơn hàng</Text>
                </Badge>
            </div>
            
            <Table 
                columns={columns} 
                dataSource={orders} 
                rowKey="id" 
                loading={loading} 
                bordered 
                scroll={{ x: 1000 }}
                pagination={{ 
                    pageSize: 8,
                    showTotal: (total) => `Tổng cộng ${total} đơn hàng`
                }} 
            />
        </Card>
    );
};

export default OrderManagement;