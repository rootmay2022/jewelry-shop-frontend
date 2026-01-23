import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Typography, Button, DatePicker, Space } from 'antd';
import { UserOutlined, ShoppingCartOutlined, DollarCircleOutlined, ContainerOutlined, FileExcelOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardStats } from '../../api/adminApi';
import formatCurrency from '../../utils/formatCurrency';
import * as XLSX from 'xlsx'; // Thư viện xuất Excel
import dayjs from 'dayjs';

const { Title } = Typography;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exportLoading, setExportLoading] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
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

    // Hàm xuất Excel theo tháng
    const handleExportExcel = () => {
        if (!stats || !stats.revenueByDay) return;
        
        setExportLoading(true);
        try {
            // Chuẩn bị dữ liệu để xuất
            const dataToExport = stats.revenueByDay.map(item => ({
                'Ngày': item.date,
                'Số Đơn Hàng Thành Công': item.orderCount || 0, // Dựa trên số lượng đơn thực tế
                'Doanh Thu (VNĐ)': item.revenue
            }));

            // Tạo sheet và workbook
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Bao-Cao-Doanh-Thu");

            // Xuất file
            const fileName = `Bao_Cao_Doanh_Thu_${dayjs().format('MM_YYYY')}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            message.success('Xuất file Excel thành công!');
        } catch (error) {
            message.error('Lỗi khi xuất file Excel.');
        } finally {
            setExportLoading(false);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" tip="Đang tải dữ liệu..." /></div>;
    }

    if (!stats) return <div>Không có dữ liệu.</div>;

    const ordersByStatusData = Object.entries(stats.ordersByStatus).map(([name, value]) => ({ name, value }));

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={2} style={{ margin: 0 }}>Báo Cáo Quản Trị</Title>
                <Space>
                    <Button 
                        type="primary" 
                        icon={<FileExcelOutlined />} 
                        onClick={handleExportExcel}
                        loading={exportLoading}
                        style={{ backgroundColor: '#1d6f42', borderColor: '#1d6f42' }} // Màu xanh Excel
                    >
                        Xuất Excel Tháng {dayjs().format('MM/YYYY')}
                    </Button>
                </Space>
            </div>

            {/* Hàng thống kê tổng quát */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Card hoverable>
                        <Statistic 
                            title="Doanh Thu Thực (Đã Giao)" 
                            value={stats.totalRevenue} 
                            formatter={(value) => formatCurrency(value)}
                            prefix={<DollarCircleOutlined style={{ color: '#3f51b5' }} />} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card hoverable>
                        <Statistic 
                            title="Đơn Hàng Thành Công" 
                            value={stats.totalOrders} 
                            prefix={<ShoppingCartOutlined style={{ color: '#4caf50' }} />} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card hoverable>
                        <Statistic 
                            title="Sản Phẩm Đang Kinh Doanh" 
                            value={stats.totalProducts} 
                            prefix={<ContainerOutlined style={{ color: '#fb8c00' }} />} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card hoverable>
                        <Statistic 
                            title="Khách Hàng Đăng Ký" 
                            value={stats.totalUsers} 
                            prefix={<UserOutlined style={{ color: '#e91e63' }} />} 
                        />
                    </Card>
                </Col>
            </Row>

            {/* Biểu đồ chi tiết */}
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                    <Card title="Diễn biến doanh thu & Đơn hàng (7 ngày qua)">
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={stats.revenueByDay}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                <Tooltip formatter={(value, name) => name === 'Doanh thu' ? formatCurrency(value) : value} />
                                <Legend />
                                <Line 
                                    yAxisId="left"
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#8884d8" 
                                    name="Doanh thu" 
                                    strokeWidth={3}
                                    activeDot={{ r: 8 }}
                                />
                                <Line 
                                    yAxisId="right"
                                    type="monotone" 
                                    dataKey="orderCount" 
                                    stroke="#82ca9d" 
                                    name="Số lượng đơn" 
                                    strokeWidth={3}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                
                <Col xs={24} lg={8}>
                    <Card title="Tỉ lệ trạng thái đơn hàng">
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie 
                                    data={ordersByStatusData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={60}
                                    outerRadius={100} 
                                    paddingAngle={5}
                                    label
                                >
                                    {ordersByStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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