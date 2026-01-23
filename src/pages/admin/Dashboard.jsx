import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Typography, Button, Space } from 'antd';
import { UserOutlined, ShoppingCartOutlined, DollarCircleOutlined, ContainerOutlined, FileExcelOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardStats } from '../../api/adminApi';
import formatCurrency from '../../utils/formatCurrency';
import * as XLSX from 'xlsx'; 
import dayjs from 'dayjs';

const { Title, Text } = Typography;
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

    // Hàm xuất Excel
    const handleExportExcel = () => {
        if (!stats || !stats.revenueByDay) return;
        setExportLoading(true);
        try {
            const dataToExport = stats.revenueByDay.map(item => ({
                'Ngày': item.date,
                'Doanh Thu (Thực tế)': item.revenue,
                'Số đơn': item.orderCount || 0
            }));
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Doanh Thu");
            XLSX.writeFile(workbook, `Bao_Cao_Doanh_Thu_${dayjs().format('MM_YYYY')}.xlsx`);
            message.success('Xuất Excel thành công!');
        } catch (e) { message.error('Lỗi xuất file'); }
        finally { setExportLoading(false); }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
    if (!stats) return <div>Không có dữ liệu.</div>;

    // Việt hóa trạng thái cho biểu đồ tròn
    const statusMap = {
        'PENDING': 'Đang chờ',
        'CONFIRMED': 'Đã xác nhận',
        'SHIPPING': 'Đang giao',
        'DELIVERED': 'Thành công',
        'CANCELLED': 'Đã hủy'
    };

    const ordersByStatusData = Object.entries(stats.ordersByStatus).map(([name, value]) => ({ 
        name: statusMap[name] || name, 
        value 
    }));

    return (
        <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={2}>🚀 Bảng Điều Khiển Quản Trị</Title>
                <Button 
                    type="primary" 
                    icon={<FileExcelOutlined />} 
                    onClick={handleExportExcel}
                    loading={exportLoading}
                    style={{ backgroundColor: '#1d6f42', height: '40px', borderRadius: '8px' }}
                >
                    XUẤT BÁO CÁO EXCEL
                </Button>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Card hoverable>
                        {/* Hiển thị doanh thu - Ní có thể chỉnh sửa con số này nếu BE trả về ảo */}
                        <Statistic title="Doanh Thu Thực (Đã giao)" value={stats.totalRevenue} formatter={(v) => formatCurrency(v)} prefix={<DollarCircleOutlined style={{color: '#52c41a'}} />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card hoverable>
                        <Statistic title="Đơn Thành Công" value={stats.totalOrders} prefix={<ShoppingCartOutlined style={{color: '#1890ff'}} />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card hoverable>
                        <Statistic title="Sản Phẩm" value={stats.totalProducts} prefix={<ContainerOutlined style={{color: '#faad14'}} />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card hoverable>
                        <Statistic title="Khách Hàng" value={stats.totalUsers} prefix={<UserOutlined style={{color: '#eb2f96'}} />} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                {/* Biểu đồ Line - Tăng trưởng dựa trên số liệu thật hàng ngày */}
                <Col xs={24} lg={16}>
                    <Card title="📈 Biểu Đồ Tăng Trưởng Doanh Thu (7 Ngày)">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats.revenueByDay}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(v) => formatCurrency(v)} />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#52c41a" name="Doanh thu" strokeWidth={4} dot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                
                {/* Biểu đồ tròn - Trạng thái đơn hàng */}
                <Col xs={24} lg={8}>
                    <Card title="📦 Tỷ Lệ Trạng Thái Đơn">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie 
                                    data={ordersByStatusData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    outerRadius={80} 
                                    label
                                >
                                    {ordersByStatusData.map((_, index) => (
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