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
                    
                    // 1. Lấy danh sách đơn hàng
                    const ordersList = data.orders || data.allOrders || [];

                    // 2. Lọc đơn đã giao (Chấp nhận cả Tiếng Anh và Tiếng Việt)
                    const deliveredOrders = ordersList.filter(order => {
                        const status = String(order.status).toUpperCase();
                        return status === 'DELIVERED' || status === 'ĐÃ GIAO' || status === 'SUCCESS';
                    });

                    // 3. Tính tiền và Gom nhóm dữ liệu cho biểu đồ đường
                    const dailyData = {};
                    const totalRevenue = deliveredOrders.reduce((sum, order) => {
                        let price = order.totalAmount || order.totalPrice || 0;
                        if (typeof price === 'string') {
                            price = Number(price.replace(/[^0-9]/g, ""));
                        }
                        const amount = Number(price) || 0;
                        
                        // Gom tiền theo ngày để vẽ biểu đồ
                        const date = dayjs(order.createdAt || order.date || new Date()).format('DD/MM');
                        dailyData[date] = (dailyData[date] || 0) + amount;
                        
                        return sum + amount;
                    }, 0);

                    // Chuyển dữ liệu gom nhóm thành mảng cho biểu đồ
                    const chartData = Object.keys(dailyData).map(date => ({
                        date,
                        revenue: dailyData[date]
                    })).sort((a, b) => dayjs(a.date, 'DD/MM').unix() - dayjs(b.date, 'DD/MM').unix());
                    
                    setRealData({
                        revenue: totalRevenue,
                        orderCount: deliveredOrders.length,
                        chartData: chartData.length > 0 ? chartData : [{date: dayjs().format('DD/MM'), revenue: totalRevenue}]
                    });
                    setStats(data);
                }
            } catch (error) {
                console.error("Lỗi Dashboard:", error);
                message.error('Lỗi cập nhật số liệu từ hệ thống.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleExportExcel = () => {
        if (!stats) return;
        const ws = XLSX.utils.json_to_sheet([{ 
            "Ngày xuất báo cáo": dayjs().format('DD/MM/YYYY HH:mm'), 
            "Tổng Doanh Thu": realData.revenue, 
            "Tổng Đơn Thành Công": realData.orderCount 
        }]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "DoanhThu");
        XLSX.writeFile(wb, `Bao_Cao_Admin_${dayjs().format('YYYYMMDD')}.xlsx`);
    };

    if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
    if (!stats) return <div style={{ color: '#fff', textAlign: 'center' }}>Hệ thống chưa có dữ liệu đơn hàng.</div>;

    // Mapping tên trạng thái cho biểu đồ tròn để khớp với hình ảnh thực tế
    const statusMap = {
        'DELIVERED': 'Thành công',
        'Đã giao': 'Thành công',
        'PENDING': 'Chờ duyệt',
        'Chờ xác nhận': 'Chờ xác nhận',
        'CONFIRMED': 'Đã xác nhận',
        'Đã xác nhận': 'Đã xác nhận',
        'CANCELLED': 'Đã hủy',
        'Đã hủy': 'Đã hủy',
        'Đang giao': 'Đang giao'
    };

    const pieData = Object.entries(stats.ordersByStatus || {}).map(([name, value]) => ({
        name: statusMap[name] || name,
        value
    })).filter(item => item.value > 0);

    return (
        <div style={{ padding: '24px', background: '#141414', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <Title level={2} style={{ color: '#fff', margin: 0 }}>💎 HỆ THỐNG QUẢN TRỊ TRANG SỨC</Title>
                <Button 
                    type="primary" 
                    icon={<FileExcelOutlined />} 
                    onClick={handleExportExcel} 
                    style={{ backgroundColor: '#1d6f42', borderColor: '#1d6f42' }}
                >
                    XUẤT BÁO CÁO EXCEL
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
                        <Text style={{ color: '#555' }}>Chỉ tính các đơn hàng đã giao thành công</Text>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card bordered={false} style={{ background: '#1f1f1f', borderRadius: '12px' }}>
                        <Statistic 
                            title={<span style={{color: '#aaa', fontSize: '16px'}}>TỔNG ĐƠN HOÀN TẤT</span>}
                            value={realData.orderCount} 
                            valueStyle={{ color: '#1890ff', fontSize: '32px', fontWeight: 'bold' }}
                            prefix={<ShoppingCartOutlined />} 
                        />
                        <Text style={{ color: '#555' }}>Tổng số lượng đơn hàng đã đến tay khách</Text>
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 24 }}>
                <Col span={14}>
                    <Card title={<span style={{color: '#fff'}}>XU HƯỚNG DOANH THU THEO NGÀY</span>} bordered={false} style={{ background: '#1f1f1f', borderRadius: '12px' }}>
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={realData.chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip 
                                    contentStyle={{ background: '#222', border: 'none', color: '#fff' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#52c41a" 
                                    strokeWidth={4} 
                                    dot={{ r: 6 }} 
                                    name="Doanh thu" 
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={10}>
                    <Card title={<span style={{color: '#fff'}}>PHÂN BỔ TRẠNG THÁI ĐƠN</span>} bordered={false} style={{ background: '#1f1f1f', borderRadius: '12px' }}>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie 
                                    data={pieData} 
                                    dataKey="value" 
                                    cx="50%" 
                                    cy="50%" 
                                    outerRadius={100} 
                                    innerRadius={70} 
                                    paddingAngle={5}
                                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
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