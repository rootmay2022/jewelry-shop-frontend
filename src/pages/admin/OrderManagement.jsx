import React, { useState, useEffect } from 'react';
import { Table, Tag, Select, message, Spin, Typography } from 'antd';
import { getAllOrdersAdmin, updateOrderStatusAdmin } from '../../api/orderApi';
import { getAllUsersAdmin } from '../../api/userApi'; // Ní cần có hàm lấy danh sách User
import dayjs from 'dayjs';
import formatCurrency from '../../utils/formatCurrency';

const { Title, Text } = Typography;

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [usersMap, setUsersMap] = useState({}); // Nơi lưu trữ: { "ID_1": "Tên A", "ID_2": "Tên B" }
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Lấy tất cả đơn hàng
            const orderRes = await getAllOrdersAdmin();
            
            // 2. Lấy tất cả User để làm "danh bạ" tra cứu
            // Nếu ní chưa có API getAllUsersAdmin, hãy kiểm tra lại file userApi của ní nhé
            const userRes = await getAllUsersAdmin();

            if (orderRes.success && userRes.success) {
                // Tạo một cái bản đồ tra cứu (Map) cho nhanh
                const userMapping = {};
                userRes.data.forEach(u => {
                    userMapping[u.id] = {
                        name: u.fullName || u.username,
                        phone: u.phone
                    };
                });
                
                setUsersMap(userMapping);
                setOrders(orderRes.data);
            }
        } catch (error) {
            console.error("Lỗi tra cứu:", error);
            message.error('Không thể đồng bộ dữ liệu người dùng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        { title: 'Mã Đơn', dataIndex: 'id', key: 'id' },
        { 
            title: 'Khách Hàng', 
            key: 'customer', 
            render: (_, record) => {
                // Bước 1: Thử lấy tên trực tiếp trên đơn (nếu có)
                // Bước 2: Nếu không có, dùng userId để tra trong "danh bạ" usersMap
                const userId = record.userId || record.user?.id;
                const userInfo = usersMap[userId];

                const finalName = record.fullName || userInfo?.name;
                const finalPhone = record.phone || userInfo?.phone;

                return (
                    <div>
                        <div style={{ fontWeight: 'bold', color: '#0B3D91' }}>
                            {finalName || (userId ? `User ID: ${userId}` : "Khách vãng lai")}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {finalPhone || "---"}
                        </div>
                    </div>
                );
            }
        },
        { 
            title: 'Ngày Đặt', 
            dataIndex: 'createdAt', 
            render: (d) => dayjs(d).format('DD/MM/YYYY') 
        },
        { 
            title: 'Tổng Tiền', 
            dataIndex: 'totalAmount', 
            render: (v) => <Text strong type="danger">{formatCurrency(v)}</Text> 
        },
        { 
            title: 'Trạng Thái', 
            dataIndex: 'status', 
            render: (s) => <Tag color="blue">{s}</Tag> 
        }
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