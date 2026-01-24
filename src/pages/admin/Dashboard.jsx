import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Typography, Button } from 'antd';
import { ShoppingCartOutlined, DollarCircleOutlined, FileExcelOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardStats } from '../../api/adminApi';
import formatCurrency from '../../utils/formatCurrency';
import * as XLSX from 'xlsx'; 
import dayjs from 'dayjs';

const { Title, Text } = Typography; 
const COLORS = ['#52c41a', '#FFBB28', '#FF8042', '#1890ff', '#FF4D4F'];

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [realData, setRealData] = useState({ revenue: 0, orderCount: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await getDashboardStats();
                if (response.success && response.data) {
                    const data = response.data;
                    
                    // Lấy danh sách đơn hàng thực tế
                    const ordersList = data.orders || data.allOrders || [];

                    // Lọc đơn hàng đã giao (Chấp nhận cả DELIVERED và "Đã giao")
                    const deliveredOrders = ordersList.filter(order => {
                        const status = String(order.status).toUpperCase();
                        return status === 'DELIVERED' || status === 'ĐÃ GIAO';
                    });

                    // Tính tổng doanh thu (Xử lý trường hợp tiền là chuỗi như "4.200.000 ₫")
                    const totalRevenue = deliveredOrders.reduce((sum, order) => {
                        let price = order.totalAmount || order.totalPrice || 0;
                        if (typeof price === 'string') {
                            // Xóa bỏ tất cả ký tự không phải số (₫, dấu chấm, dấu phẩy)
                            price = Number(price.replace(/[^0-9]/g, ""));
                        }
                        return sum + (Number(price) || 0);
                    }, 0);
                    
                    setRealData({
                        revenue: totalRevenue,
                        orderCount: deliveredOrders.length
                    });
                    setStats(data);
                }
            } catch (error) {
                console.error("Lỗi Dashboard:", error);
                message.error('Lỗi cập nhật số liệu thực.');
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
            "Doanh Thu Thực": realData.revenue, 
            "Đơn Thành Công": realData.orderCount 
        }]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bao_Cao");
        XLSX.writeFile(wb, `Bao_Cao_Doanh_Thu_${dayjs().format('YYYYMMDD')}.xlsx`);
    };

    if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
    if (!stats) return <div style={{ color: '#fff', textAlign: 'center' }}>Không có dữ liệu thống kê.</div>;

    const pieData = Object.entries(stats.ordersByStatus || {}).map(([name, value]) => ({
        name: name === 'DELIVERED' || name === 'Đã giao' ? 'Thành công' : 
              (name === 'PENDING' || name === 'Chờ duyệt' ? 'Chờ duyệt' : name),
        value
    })).filter(item => item.value > 0);

    return (
        <div style={{ padding: '24px', background: '#141414', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <Title level={2} style={{ color: '#fff', margin: 0 }}>📊 HỆ THỐNG QUẢN TRỊ KINH DOANH</Title>
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
                            title={<span style={{color: '#aaa', fontSize: '16px'}}>DOANH THU THỰC TẾ</span>}
                            value={realData.revenue} 
                            formatter={(v) => formatCurrency(v)}
                            valueStyle={{ color: '#52c41a', fontSize: '32px', fontWeight: 'bold' }}
                            prefix={<DollarCircleOutlined />} 
                        />
                        <Text style={{ color: '#555' }}>Dựa trên các đơn hàng đã giao thành công</Text>
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
                        <Text style={{ color: '#555' }}>Số lượng đơn đã hoàn tất vận chuyển</Text>
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 24 }}>
                <Col span={14}>
                    <Card title={<span style={{color: '#fff'}}>XU HƯỚNG TĂNG TRƯỞNG</span>} bordered={false} style={{ background: '#1f1f1f', borderRadius: '12px' }}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={[{date: dayjs().format('DD/MM'), revenue: realData.revenue}]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip contentStyle={{ background: '#222', border: 'none' }} />
                                <Line type="monotone" dataKey="revenue" stroke="#52c41a" strokeWidth={4} dot={{ r: 6 }} name="Doanh thu" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={10}>
                    <Card title={<span style={{color: '#fff'}}>PHÂN BỔ TRẠNG THÁI</span>} bordered={false} style={{ background: '#1f1f1f', borderRadius: '12px' }}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={60} paddingAngle={5}>
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