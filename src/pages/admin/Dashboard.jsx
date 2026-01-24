import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Typography, Button } from 'antd';
import { ShoppingCartOutlined, DollarCircleOutlined, FileExcelOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardStats } from '../../api/adminApi';
import formatCurrency from '../../utils/formatCurrency';
import * as XLSX from 'xlsx'; 
import dayjs from 'dayjs';

const { Title, Text } = Typography; 
const COLORS = ['#52c41a', '#FFBB28', '#FF8042', '#1890ff', '#FF4D4F', '#722ed1'];

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [realData, setRealData] = useState({ revenue: 0, orderCount: 0, chartData: [] });

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await getDashboardStats();
                if (response.success && response.data) {
                    const data = response.data;
                    
                    // 1. Lấy danh sách đơn hàng thực tế từ API
                    const ordersList = data.orders || data.allOrders || data.list || [];

                    // 2. Lọc đơn đã giao (Hỗ trợ cả Tiếng Anh/Tiếng Việt/Viết hoa/thường)
                    const deliveredOrders = ordersList.filter(order => {
                        const status = String(order.status || '').toUpperCase();
                        return status === 'DELIVERED' || status === 'ĐÃ GIAO' || status === 'SUCCESS';
                    });

                    // 3. Tính toán tiền và chuẩn bị dữ liệu biểu đồ
                    const dailyGroups = {};
                    const totalRevenue = deliveredOrders.reduce((sum, order) => {
                        // Xử lý nếu tiền là chuỗi "4.200.000 ₫" hoặc số
                        let price = order.totalAmount || order.totalPrice || 0;
                        if (typeof price === 'string') {
                            price = Number(price.replace(/[^0-9]/g, ""));
                        }
                        const amount = Number(price) || 0;

                        // Gom nhóm theo ngày để vẽ biểu đồ đường
                        const dateLabel = dayjs(order.createdAt || order.date).format('DD/MM');
                        dailyGroups[dateLabel] = (dailyGroups[dateLabel] || 0) + amount;

                        return sum + amount;
                    }, 0);

                    // Chuyển object ngày thành mảng cho Recharts
                    const chartData = Object.keys(dailyGroups).map(date => ({
                        date,
                        revenue: dailyGroups[date]
                    })).sort((a, b) => dayjs(a.date, 'DD/MM').unix() - dayjs(b.date, 'DD/MM').unix());
                    
                    setRealData({
                        revenue: totalRevenue,
                        orderCount: deliveredOrders.length,
                        chartData: chartData.length > 0 ? chartData : [{date: dayjs().format('DD/MM'), revenue: totalRevenue}]
                    });
                    setStats(data);
                }
            } catch (error) {
                console.error("Lỗi Dashboard API:", error);
                message.error('Không thể kết nối lấy dữ liệu thống kê.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleExportExcel = () => {
        if (!stats) return;
        const ws = XLSX.utils.json_to_sheet([{ 
            "Ngày xuất": dayjs().format('DD/MM/YYYY HH:mm'), 
            "Doanh Thu": realData.revenue, 
            "Đơn Thành Công": realData.orderCount 
        }]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Thong_Ke");
        XLSX.writeFile(wb, `Bao_Cao_Admin_${dayjs().format('YYYYMMDD')}.xlsx`);
    };

    if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
    if (!stats) return <div style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>Chưa có dữ liệu đơn hàng nào.</div>;

    // Chuẩn hóa tên trạng thái cho biểu đồ tròn
    const pieData = Object.entries(stats.ordersByStatus || {}).map(([name, value]) => {
        let label = name;
        if (name === 'DELIVERED' || name === 'Đã giao') label = 'Thành công';
        if (name === 'CANCELLED' || name === 'Đã hủy') label = 'Đã hủy';
        if (name === 'PENDING' || name === 'Chờ duyệt') label = 'Chờ duyệt';
        if (name === 'CONFIRMED' || name === 'Đã xác nhận') label = 'Đã xác nhận';
        return { name: label, value };
    }).filter(item => item.value > 0);

    return (
        <div style={{ padding: '24px', background: '#141414', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <Title level={2} style={{ color: '#fff', margin: 0 }}>💎 QUẢN TRỊ KINH DOANH TRANG SỨC</Title>
                <Button 
                    type="primary" 
                    icon={<FileExcelOutlined />} 
                    onClick={handleExportExcel} 
                    style={{ backgroundColor: '#1d6f42', borderColor: '#1d6f42' }}
                >
                    XUẤT EXCEL
                </Button>
            </div>

            <Row gutter={16}>
                <Col span={12}>
                    <Card bordered={false} style={{ background: '#1f1f1f', borderRadius: '12px' }}>
                        <Statistic 
                            title={<span style={{color: '#aaa', fontSize: '16px'}}>DOANH THU THỰC TẾ (VNĐ)</span>}
                            value={realData.revenue} 
                            formatter={(v) => formatCurrency(v)}
                            valueStyle={{ color: '#52c41a', fontSize: '32px', fontWeight: 'bold' }}
                            prefix={<DollarCircleOutlined />} 
                        />
                        <Text style={{ color: '#555' }}>Dựa trên các đơn hàng đã giao hoàn tất</Text>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card bordered={false} style={{ background: '#1f1f1f', borderRadius: '12px' }}>
                        <Statistic 
                            title={<span style={{color: '#aaa', fontSize: '16px'}}>ĐƠN HÀNG THÀNH CÔNG</span>}
                            value={realData.orderCount} 
                            valueStyle={{ color: '#1890ff', fontSize: '32px', fontWeight: 'bold' }}
                            prefix={<ShoppingCartOutlined />} 
                        />
                        <Text style={{ color: '#555' }}>Số lượng đơn đã tới tay khách hàng</Text>
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 24 }}>
                <Col span={14}>
                    <Card title={<span style={{color: '#fff'}}>BIỂU ĐỒ TĂNG TRƯỞNG</span>} bordered={false} style={{ background: '#1f1f1f', borderRadius: '12px' }}>
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart data={realData.chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip contentStyle={{ background: '#222', border: 'none', color: '#fff' }} />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#52c41a" strokeWidth={4} dot={{ r: 6 }} name="Doanh thu" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={10}>
                    <Card title={<span style={{color: '#fff'}}>TỶ LỆ TRẠNG THÁI</span>} bordered={false} style={{ background: '#1f1f1f', borderRadius: '12px' }}>
                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={90} innerRadius={65} paddingAngle={5}>
                                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;