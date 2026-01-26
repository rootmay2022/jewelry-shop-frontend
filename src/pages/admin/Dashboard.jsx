import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Typography, Button, Table, Tag } from 'antd';
import { 
    ShoppingCartOutlined, 
    DollarCircleOutlined, 
    FileExcelOutlined, 
    UserOutlined,
    ShoppingOutlined 
} from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getDashboardStats } from '../../api/adminApi';
import { getAllUsersAdmin } from '../../api/authApi';
import formatCurrency from '../../utils/formatCurrency';
import * as XLSX from 'xlsx'; 
import dayjs from 'dayjs';

const { Title } = Typography; 
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        totalRevenue: 0,
        orderCount: 0,
        userCount: 0,
        productCount: 0,
        pieData: [],
        recentOrders: []
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            // Gọi song song 2 API
            const [statRes, userRes] = await Promise.all([
                getDashboardStats(),
                getAllUsersAdmin()
            ]);

            // 1. Xử lý User
            const users = userRes?.data || [];
            const userMap = {};
            users.forEach(u => userMap[u.id] = u.full_name || u.email);

            // 2. Xử lý Đơn hàng & Sản phẩm (Dựa trên dữ liệu SQL ní gửi)
            const orders = statRes.data?.orders || [];
            const products = statRes.data?.products || [];
            
            let revenue = 0;
            const statusMap = {};

            const processedOrders = orders.map(order => {
                const amount = parseFloat(order.total_amount || 0);
                const status = (order.status || 'PENDING').toUpperCase();
                
                // Chỉ tính doanh thu cho đơn đã giao (DELIVERED) hoặc đã thanh toán (PAID)
                if (status === 'DELIVERED' || status === 'COMPLETED') {
                    revenue += amount;
                }

                statusMap[status] = (statusMap[status] || 0) + 1;

                return {
                    key: order.id,
                    id: `#${order.id}`,
                    customer: userMap[order.user_id] || `User ID: ${order.user_id}`,
                    amount: amount,
                    status: status,
                    date: dayjs(order.order_date).format('DD/MM/YYYY')
                };
            });

            setData({
                totalRevenue: revenue,
                orderCount: orders.length,
                userCount: users.length,
                productCount: products.length,
                pieData: Object.entries(statusMap).map(([name, value]) => ({ name, value })),
                recentOrders: processedOrders.slice(0, 5) // Lấy 5 đơn mới nhất
            });

        } catch (error) {
            console.error(error);
            message.error('Không thể kết nối đến máy chủ Railway!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(data.recentOrders);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "DoanhThu");
        XLSX.writeFile(wb, `Bao_Cao_T1_${dayjs().format('YYYY')}.xlsx`);
    };

    if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2}>💎 QUẢN TRỊ TRANG SỨC - REALTIME</Title>
                <Button type="primary" danger icon={<FileExcelOutlined />} onClick={exportExcel}>
                    XUẤT BÁO CÁO
                </Button>
            </div>

            {/* Hàng 1: Thống kê tổng quan */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic 
                            title="Tổng Doanh Thu" 
                            value={data.totalRevenue} 
                            prefix={<DollarCircleOutlined />} 
                            formatter={v => formatCurrency(v)}
                            valueStyle={{ color: '#cf1322' }} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic 
                            title="Tổng Đơn Hàng" 
                            value={data.orderCount} 
                            prefix={<ShoppingCartOutlined />} 
                            valueStyle={{ color: '#1d39c4' }} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic 
                            title="Khách Hàng" 
                            value={data.userCount} 
                            prefix={<UserOutlined />} 
                            valueStyle={{ color: '#3f8600' }} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic 
                            title="Sản Phẩm" 
                            value={data.productCount} 
                            prefix={<ShoppingOutlined />} 
                            valueStyle={{ color: '#d46b08' }} 
                        />
                    </Card>
                </Col>
            </Row>

            {/* Hàng 2: Biểu đồ và Bảng */}
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={10}>
                    <Card title="Phân tích Trạng thái Đơn hàng">
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={data.pieData} 
                                        innerRadius={60} 
                                        outerRadius={100} 
                                        paddingAngle={5} 
                                        dataKey="value"
                                    >
                                        {data.pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                    <Card title="Đơn hàng gần đây">
                        <Table 
                            columns={[
                                { title: 'Mã đơn', dataIndex: 'id', key: 'id' },
                                { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
                                { title: 'Tổng tiền', dataIndex: 'amount', render: v => formatCurrency(v) },
                                { 
                                    title: 'Trạng thái', 
                                    dataIndex: 'status', 
                                    render: (status) => (
                                        <Tag color={status === 'DELIVERED' ? 'green' : 'gold'}>
                                            {status}
                                        </Tag>
                                    ) 
                                },
                            ]} 
                            dataSource={data.recentOrders} 
                            pagination={false}
                            size="middle"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;