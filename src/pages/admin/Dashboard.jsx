import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Typography, Button, Space } from 'antd';
import { UserOutlined, ShoppingCartOutlined, DollarCircleOutlined, ContainerOutlined, FileExcelOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardStats } from '../../api/adminApi';
import formatCurrency from '../../utils/formatCurrency';
import * as XLSX from 'xlsx'; 
import dayjs from 'dayjs';

const { Title } = Typography;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exportLoading, setExportLoading] = useState(false);

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
    }, []);

    const handleExportExcel = () => {
        if (!stats || !stats.revenueByDay) {
            message.warning("Không có dữ liệu để xuất!");
            return;
        }
        
        setExportLoading(true);
        try {
            const dataToExport = stats.revenueByDay.map(item => ({
                'Ngày': item.date,
                'Số Đơn Hàng': item.orderCount || 0,
                'Doanh Thu (VNĐ)': item.revenue
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Doanh Thu");
            XLSX.writeFile(workbook, `Doanh_Thu_Thang_${dayjs().format('MM_YYYY')}.xlsx`);
            message.success('Đã tải file Excel xuống máy ní rồi đó!');
        } catch (error) {
            message.error('Lỗi xuất file!');
        } finally {
            setExportLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
    if (!stats) return <div>Không có dữ liệu.</div>;

    const ordersByStatusData = Object.entries(stats.ordersByStatus).map(([name, value]) => ({ name, value }));

    return (
        <div style={{ padding: '24px' }}>
            {/* KHU VỰC TIÊU ĐỀ VÀ NÚT XUẤT FILE - NÓ NẰM Ở ĐÂY NÈ NÍ */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: '#fff', padding: '15px', borderRadius: '8px' }}>
                <Title level={3} style={{ margin: 0 }}>📊 HỆ THỐNG QUẢN TRỊ DOANH THU</Title>
                <Button 
                    type="primary" 
                    icon={<FileExcelOutlined />} 
                    onClick={handleExportExcel}
                    loading={exportLoading}
                    style={{ backgroundColor: '#1d6f42', borderColor: '#1d6f42', height: '40px' }}
                >
                    XUẤT FILE EXCEL
                </Button>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Card><Statistic title="Doanh Thu" value={stats.totalRevenue} formatter={(v) => formatCurrency(v)} prefix={<DollarCircleOutlined />} /></Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card><Statistic title="Đơn Thành Công" value={stats.totalOrders} prefix={<ShoppingCartOutlined />} /></Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card><Statistic title="Sản Phẩm" value={stats.totalProducts} prefix={<ContainerOutlined />} /></Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card><Statistic title="Khách Hàng" value={stats.totalUsers} prefix={<UserOutlined />} /></Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                    <Card title="Thống Kê Đơn Hàng & Tiền Bán Được">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats.revenueByDay}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" orientation="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" name="Tiền (VNĐ)" strokeWidth={3} />
                                <Line yAxisId="right" type="monotone" dataKey="orderCount" stroke="#82ca9d" name="Số Đơn" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Trạng Thái Đơn">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={ordersByStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {ordersByStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;