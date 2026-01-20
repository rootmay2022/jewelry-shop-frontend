// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Typography } from 'antd';
import { UserOutlined, ShoppingCartOutlined, DollarCircleOutlined, ContainerOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardStats } from '../../api/adminApi';
import formatCurrency from '../../utils/formatCurrency';

const { Title } = Typography;

// Sửa lỗi 1: Khai báo mảng COLORS bị thiếu
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard = () => {
    // Sửa lỗi 2: Thiếu [stats, setStats]
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getDashboardStats();
                if (response.success) {
                    setStats(response.data);
                }
            } catch (error) {
                message.error('Không thể tải dữ liệu thống kê.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    // Sửa lỗi 3: Thiếu dependency array []
    }, []);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px 0' }}><Spin size="large" /></div>;
    }

    if (!stats) {
        return <div>Không có dữ liệu.</div>;
    }

    const ordersByStatusData = Object.entries(stats.ordersByStatus).map(([name, value]) => ({ name, value }));

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Dashboard</Title>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic title="Tổng Doanh Thu" value={formatCurrency(stats.totalRevenue)} prefix={<DollarCircleOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic title="Tổng Đơn Hàng" value={stats.totalOrders} prefix={<ShoppingCartOutlined />} />
                    </Card>
              _ </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic title="Tổng Sản Phẩm" value={stats.totalProducts} prefix={<ContainerOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic title="Tổng Khách Hàng" value={stats.totalUsers} prefix={<UserOutlined />} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                    <Card title="Doanh thu 7 ngày gần nhất">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats.revenueByDay}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Doanh thu" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Trạng thái đơn hàng">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                    <Pie data={ordersByStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                    {ordersByStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;