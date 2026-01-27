import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Typography, Button, Table, Tag, Space } from 'antd';
import { 
    ShoppingCartOutlined, 
    DollarCircleOutlined, 
    UserOutlined,
    ShoppingOutlined,
    ReloadOutlined 
} from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { getDashboardStats } from '../../api/adminApi';
// Giả sử ní có API này để lấy danh sách đơn chi tiết
import { getAllOrdersAdmin } from '../../api/orderApi'; 
import formatCurrency from '../../utils/formatCurrency';
import dayjs from 'dayjs';

const { Title, Text } = Typography; 
const COLORS = {
    'PENDING': '#faad14',
    'DELIVERED': '#52c41a',
    'CANCELLED': '#ff4d4f',
    'SHIPPING': '#1890ff',
    'CONFIRMED': '#722ed1'
};

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        actualRevenue: 0, // Doanh thu thực thu
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        pieData: [],
        recentOrders: []
    });

   const fetchData = async () => {
    setLoading(true);
    try {
        const [statRes, orderRes] = await Promise.all([
            getDashboardStats(),
            getAllOrdersAdmin() 
        ]);

        if (statRes.success) {
            const d = statRes.data;
            // API trả về mảng orders, nếu không có thì mặc định mảng rỗng
            const orders = orderRes?.data || [];

            // 1. FIX DOANH THU: Chỉ tính tiền những đơn đã DELIVERED
            // Đơn #13 (5.6tr) + #14 (3.1tr) = 8.7tr. Đơn PENDING sẽ không cộng vào đây.
            const realRevenue = orders
                .filter(o => o.status === 'DELIVERED')
                .reduce((sum, o) => sum + parseFloat(o.totalAmount || o.total_amount || 0), 0);

            // 2. FIX GIỜ GIẤC: Ép định dạng DD/MM/YYYY HH:mm:ss
            // Nhìn ảnh DB của ní là 'order_date', tui sẽ ưu tiên lấy trường đó
            const latestOrders = orders.slice(0, 5).map(o => ({
                key: o.id,
                id: `#${o.id}`,
                customer: o.fullName || o.username || 'Khách hàng',
                amount: o.totalAmount || o.total_amount,
                status: o.status,
                // Dùng dayjs format lại cho chuẩn VN
                date: dayjs(o.order_date || o.orderDate || o.createdAt).format('DD/MM/YYYY HH:mm:ss')
            }));

            // 3. Format PieData
            const formattedPieData = Object.entries(d.ordersByStatus)
                .map(([key, value]) => ({ name: key, value }))
                .filter(item => item.value > 0);

            setStats({
                totalRevenue: d.totalRevenue, // Đây là con số 16tr (tổng ảo)
                actualRevenue: realRevenue,   // Đây là con số 8.7tr (thực thu)
                totalOrders: d.totalOrders,
                totalUsers: d.totalUsers,
                totalProducts: d.totalProducts,
                pieData: formattedPieData,
                recentOrders: latestOrders
            });
        }
    } catch (error) {
        console.error('Lỗi Dashboard:', error);
        message.error('Không thể đồng bộ dữ liệu!');
    } finally {
        setLoading(false);
    }
};

    useEffect(() => { fetchData(); }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" tip="Đang tính toán doanh thu..." /></div>;

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={2} style={{ margin: 0 }}>📊 TỔNG QUAN KINH DOANH</Title>
                    <Text type="secondary">Thống kê doanh thu thực tế (Dựa trên các đơn đã hoàn tất)</Text>
                </Col>
                <Col>
                    <Button icon={<ReloadOutlined />} onClick={fetchData} type="primary">Làm mới dữ liệu</Button>
                </Col>
            </Row>

            {/* Thẻ thống kê */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable>
                        <Statistic 
                            title="THỰC THU (ĐÃ GIAO)" 
                            value={stats.actualRevenue} 
                            formatter={v => formatCurrency(v)}
                            valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                            prefix={<DollarCircleOutlined />} 
                        />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Tổng treo (Pending): {formatCurrency(stats.totalRevenue - stats.actualRevenue)}
                        </Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic title="ĐƠN HÀNG" value={stats.totalOrders} prefix={<ShoppingCartOutlined color="#1890ff" />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic title="KHÁCH HÀNG" value={stats.totalUsers} prefix={<UserOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic title="SẢN PHẨM" value={stats.totalProducts} prefix={<ShoppingOutlined />} />
                    </Card>
                </Col>
            </Row>

            

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={10}>
                    <Card title="Phân bổ trạng thái" bordered={false}>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={stats.pieData} innerRadius={60} outerRadius={90} dataKey="value">
                                        {stats.pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={14}>
                    <Card title="Danh sách đơn hàng vừa đặt" bordered={false}>
                        <Table 
                            dataSource={stats.recentOrders}
                            pagination={false}
                            size="small"
                            columns={[
                                { title: 'Mã đơn', dataIndex: 'id' },
                                { title: 'Khách hàng', dataIndex: 'customer' },
                                { title: 'Số tiền', dataIndex: 'amount', render: v => <b>{formatCurrency(v)}</b> },
                                { title: 'Trạng thái', dataIndex: 'status', render: s => (
                                    <Tag color={COLORS[s]}>{s}</Tag>
                                )},
                                { title: 'Ngày đặt', dataIndex: 'date' }
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;