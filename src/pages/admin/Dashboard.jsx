import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Typography, Button, Table, Tag, Space } from 'antd';
import { 
    ShoppingCartOutlined, 
    DollarCircleOutlined, 
    FileExcelOutlined, 
    UserOutlined,
    ShoppingOutlined,
    ReloadOutlined 
} from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { getDashboardStats } from '../../api/adminApi';
import formatCurrency from '../../utils/formatCurrency';
import dayjs from 'dayjs';

const { Title, Text } = Typography; 
// Palette màu sắc cho các trạng thái đơn hàng
const COLORS = {
    'PENDING': '#faad14',   // Vàng
    'DELIVERED': '#52c41a', // Xanh lá
    'CANCELLED': '#ff4d4f', // Đỏ
    'SHIPPING': '#1890ff',  // Xanh dương
    'CONFIRMED': '#722ed1'  // Tím
};

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        pieData: []
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getDashboardStats();
            if (res.success) {
                const d = res.data;

                // 1. Chuyển đổi Object ordersByStatus thành mảng cho biểu đồ Recharts
                // Từ { PENDING: 3, DELIVERED: 1... } -> [{ name: 'PENDING', value: 3 }...]
                const formattedPieData = Object.entries(d.ordersByStatus).map(([key, value]) => ({
                    name: key,
                    value: value
                })).filter(item => item.value > 0); // Chỉ hiện những cái có dữ liệu

                setStats({
                    totalRevenue: d.totalRevenue,
                    totalOrders: d.totalOrders,
                    totalUsers: d.totalUsers,
                    totalProducts: d.totalProducts,
                    pieData: formattedPieData
                });
            }
        } catch (error) {
            console.error('Lỗi Dashboard:', error);
            message.error('Không thể lấy dữ liệu thống kê!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={2} style={{ margin: 0 }}>📊 TỔNG QUAN HỆ THỐNG</Title>
                    <Text type="secondary">Dữ liệu cập nhật mới nhất từ máy chủ</Text>
                </Col>
                <Col>
                    <Button icon={<ReloadOutlined />} onClick={fetchData} type="primary" ghost>Làm mới</Button>
                </Col>
            </Row>

            {/* Các thẻ Statistic khớp 100% với JSON */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic 
                            title="TỔNG DOANH THU" 
                            value={stats.totalRevenue} 
                            formatter={v => formatCurrency(v)}
                            valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                            prefix={<DollarCircleOutlined />} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic 
                            title="TỔNG ĐƠN HÀNG" 
                            value={stats.totalOrders} 
                            prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic 
                            title="KHÁCH HÀNG" 
                            value={stats.totalUsers} 
                            prefix={<UserOutlined style={{ color: '#722ed1' }} />} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic 
                            title="SẢN PHẨM" 
                            value={stats.totalProducts} 
                            prefix={<ShoppingOutlined style={{ color: '#fa8c16' }} />} 
                        />
                    </Card>
                </Col>
            </Row>

            

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                {/* Biểu đồ trạng thái */}
                <Col xs={24} lg={10}>
                    <Card title="Phân bổ trạng thái đơn hàng" bordered={false}>
                        <div style={{ height: 350 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={stats.pieData} 
                                        innerRadius={70} 
                                        outerRadius={100} 
                                        paddingAngle={5} 
                                        dataKey="value"
                                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {stats.pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} đơn hàng`, 'Số lượng']} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {/* Gợi ý thêm: Bảng phân tích trạng thái */}
                <Col xs={24} lg={14}>
                    <Card title="Chi tiết số lượng đơn" bordered={false}>
                        <Table 
                            dataSource={stats.pieData}
                            pagination={false}
                            rowKey="name"
                            columns={[
                                { 
                                    title: 'Trạng thái', 
                                    dataIndex: 'name', 
                                    render: (text) => (
                                        <Tag color={COLORS[text]} style={{fontWeight: 'bold'}}>{text}</Tag>
                                    ) 
                                },
                                { 
                                    title: 'Số lượng đơn', 
                                    dataIndex: 'value', 
                                    render: (val) => <Text strong>{val} đơn</Text>
                                },
                                {
                                    title: 'Tỉ lệ',
                                    render: (_, record) => (
                                        <span>{((record.value / stats.totalOrders) * 100).toFixed(1)}%</span>
                                    )
                                }
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;