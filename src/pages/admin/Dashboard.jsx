import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Typography, Button, Space, Tag } from 'antd';
import { 
    UserOutlined, 
    ShoppingCartOutlined, 
    DollarCircleOutlined, 
    ContainerOutlined, 
    FileExcelOutlined,
    CheckCircleOutlined 
} from '@ant-design/icons';
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
                message.error('Không thể tải dữ liệu thống kê từ hệ thống.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Hàm xuất Excel: Chỉ lấy dữ liệu doanh thu thực tế
    const handleExportExcel = () => {
        if (!stats || !stats.revenueByDay) {
            message.warning("Hệ thống chưa có dữ liệu đơn hàng để xuất!");
            return;
        }
        
        setExportLoading(true);
        try {
            const dataToExport = stats.revenueByDay.map(item => ({
                'Ngày': item.date,
                'Số Đơn Giao Thành Công': item.orderCount || 0,
                'Doanh Thu Thực Tế (VNĐ)': item.revenue,
                'Ghi Chú': 'Dữ liệu tính trên đơn hàng trạng thái DELIVERED'
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Báo Cáo Doanh Thu");
            
            // Tên file theo tháng hiện tại
            const fileName = `Bao_Cao_Doanh_Thu_Thanh_Cong_${dayjs().format('MM_YYYY')}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            message.success('Đã xuất báo cáo doanh thu thành công!');
        } catch (error) {
            message.error('Lỗi trong quá trình tạo file Excel.');
        } finally {
            setExportLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" tip="Đang lấy dữ liệu thực tế..." /></div>;
    if (!stats) return <div style={{ padding: '24px' }}>Không tìm thấy dữ liệu thống kê.</div>;

    // Chuyển đổi dữ liệu trạng thái đơn hàng sang tiếng Việt
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
        <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            {/* THANH TIÊU ĐỀ VÀ NÚT XUẤT EXCEL */}
            <Card style={{ marginBottom: '24px', borderRadius: '12px' }} bodyStyle={{ padding: '16px 24px' }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={2} style={{ margin: 0, color: '#001529' }}>
                            📊 Bảng Điều Khiển Quản Trị
                        </Title>
                        <Text type="secondary">Thống kê dựa trên các đơn hàng đã giao thành công</Text>
                    </Col>
                    <Col>
                        <Button 
                            type="primary" 
                            icon={<FileExcelOutlined />} 
                            onClick={handleExportExcel}
                            loading={exportLoading}
                            size="large"
                            style={{ backgroundColor: '#1d6f42', borderColor: '#1d6f42', borderRadius: '8px', fontWeight: 'bold' }}
                        >
                            XUẤT BÁO CÁO EXCEL
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* CÁC CHỈ SỐ TỔNG QUÁT */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Card hoverable style={{ borderRadius: '12px', borderLeft: '5px solid #52c41a' }}>
                        <Statistic 
                            title="Doanh Thu Thực (Đã Giao)" 
                            value={stats.totalRevenue} 
                            formatter={(v) => formatCurrency(v)} 
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<DollarCircleOutlined />} 
                        />
                        <Tag color="green" icon={<CheckCircleOutlined />} style={{ marginTop: '8px' }}>Chỉ tính đơn DELIVERED</Tag>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card hoverable style={{ borderRadius: '12px', borderLeft: '5px solid #1890ff' }}>
                        <Statistic title="Đơn Hàng Thành Công" value={stats.totalOrders} prefix={<ShoppingCartOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card hoverable style={{ borderRadius: '12px', borderLeft: '5px solid #faad14' }}>
                        <Statistic title="Sản Phẩm Trong Kho" value={stats.totalProducts} prefix={<ContainerOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card hoverable style={{ borderRadius: '12px', borderLeft: '5px solid #eb2f96' }}>
                        <Statistic title="Khách Hàng Đăng Ký" value={stats.totalUsers} prefix={<UserOutlined />} />
                    </Card>
                </Col>
            </Row>

            {/* BIỂU ĐỒ CHI TIẾT */}
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                    <Card title="📈 Biểu đồ Doanh thu & Sản lượng (7 ngày qua)" style={{ borderRadius: '12px' }}>
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={stats.revenueByDay}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" orientation="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip formatter={(value, name) => name === 'Doanh thu' ? formatCurrency(value) : value} />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#52c41a" name="Doanh thu" strokeWidth={4} dot={{ r: 6 }} />
                                <Line yAxisId="right" type="monotone" dataKey="orderCount" stroke="#1890ff" name="Số Đơn Giao Xong" strokeWidth={4} dot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="📦 Tỷ lệ Trạng thái Đơn hàng" style={{ borderRadius: '12px' }}>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie 
                                    data={ordersByStatusData} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={70}
                                    outerRadius={100} 
                                    label
                                >
                                    {ordersByStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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