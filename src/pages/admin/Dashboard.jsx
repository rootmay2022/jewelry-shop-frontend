import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Typography, Button } from 'antd';
import { ShoppingCartOutlined, DollarCircleOutlined, FileExcelOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardStats } from '../../api/adminApi';
import formatCurrency from '../../utils/formatCurrency';
import * as XLSX from 'xlsx'; 
import dayjs from 'dayjs';

const { Title, Text } = Typography; 
const COLORS = ['#52c41a', '#1890ff', '#faad14', '#ff4d4f', '#722ed1'];

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        totalRevenue: 0,
        successOrders: 0,
        chartData: [],
        pieData: []
    });

    useEffect(() => {
        const fetchAndCalculate = async () => {
            setLoading(true);
            try {
                const response = await getDashboardStats();
                if (response.success && response.data) {
                    const rawOrders = response.data.orders || response.data || [];
                    
                    let totalRev = 0;
                    let successCount = 0;
                    const dailyMap = {};
                    const statusMap = {};

                    rawOrders.forEach(order => {
                        // 1. CHUẨN HÓA DỮ LIỆU (Snake_case vs CamelCase)
                        const amount = Number(order.total_amount || order.totalAmount || 0);
                        const status = (order.status || '').toUpperCase();
                        const dateRaw = order.order_date || order.createdAt || order.date;
                        const dateLabel = dayjs(dateRaw).format('DD/MM');

                        // 2. TÍNH DOANH THU & ĐƠN THÀNH CÔNG (Chỉ tính DELIVERED)
                        if (status === 'DELIVERED') {
                            totalRev += amount;
                            successCount += 1;
                            
                            // Gom nhóm doanh thu theo ngày cho biểu đồ đường
                            dailyMap[dateLabel] = (dailyMap[dateLabel] || 0) + amount;
                        }

                        // 3. THỐNG KÊ TRẠNG THÁI (Cho biểu đồ tròn)
                        const statusVN = {
                            'DELIVERED': 'Thành công',
                            'PENDING': 'Chờ duyệt',
                            'CONFIRMED': 'Đã xác nhận',
                            'SHIPPING': 'Đang giao',
                            'CANCELLED': 'Đã hủy'
                        };
                        const label = statusVN[status] || status;
                        statusMap[label] = (statusMap[label] || 0) + 1;
                    });

                    // 4. CHUYỂN ĐỔI SANG ĐỊNH DẠNG BIỂU ĐỒ
                    const chartData = Object.keys(dailyMap).map(date => ({
                        date,
                        revenue: dailyMap[date]
                    })).sort((a, b) => dayjs(a.date, 'DD/MM').unix() - dayjs(b.date, 'DD/MM').unix());

                    const pieData = Object.keys(statusMap).map(name => ({
                        name,
                        value: statusMap[name]
                    }));

                    setData({
                        totalRevenue: totalRev,
                        successOrders: successCount,
                        chartData: chartData.length > 0 ? chartData : [{ date: dayjs().format('DD/MM'), revenue: 0 }],
                        pieData
                    });
                }
            } catch (error) {
                message.error('Không thể tính toán dữ liệu thống kê.');
            } finally {
                setLoading(false);
            }
        };
        fetchAndCalculate();
    }, []);

    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet([{ 
            "Ngày xuất": dayjs().format('DD/MM/YYYY HH:mm'), 
            "Tổng doanh thu": data.totalRevenue, 
            "Tổng đơn thành công": data.successOrders 
        }]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Thống Kê");
        XLSX.writeFile(wb, `Bao_Cao_${dayjs().format('YYYYMMDD')}.xlsx`);
    };

    if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

    return (
        <div style={{ padding: '24px', background: '#141414', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <Title level={2} style={{ color: '#fff', margin: 0 }}>📊 HỆ THỐNG THỐNG KÊ KINH DOANH</Title>
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
                            title={<span style={{color: '#aaa', fontSize: '16px'}}>DOANH THU HOÀN TẤT</span>}
                            value={data.totalRevenue} 
                            formatter={(v) => formatCurrency(v)}
                            valueStyle={{ color: '#52c41a', fontSize: '32px', fontWeight: 'bold' }}
                            prefix={<DollarCircleOutlined />} 
                        />
                        <Text style={{ color: '#555' }}>Tổng tiền từ các đơn hàng có trạng thái "DELIVERED"</Text>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card bordered={false} style={{ background: '#1f1f1f', borderRadius: '12px' }}>
                        <Statistic 
                            title={<span style={{color: '#aaa', fontSize: '16px'}}>ĐƠN HÀNG THÀNH CÔNG</span>}
                            value={data.successOrders} 
                            valueStyle={{ color: '#1890ff', fontSize: '32px', fontWeight: 'bold' }}
                            prefix={<ShoppingCartOutlined />} 
                        />
                        <Text style={{ color: '#555' }}>Số lượng đơn đã giao thành công cho khách</Text>
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 24 }}>
                <Col span={14}>
                    <Card title={<span style={{color: '#fff'}}>BIỂU ĐỒ DOANH THU THEO NGÀY</span>} bordered={false} style={{ background: '#1f1f1f', borderRadius: '12px' }}>
                        <ResponsiveContainer width="100%" height={320}>
                            <LineChart data={data.chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip contentStyle={{ background: '#222', border: 'none', color: '#fff' }} />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#52c41a" strokeWidth={4} dot={{ r: 6 }} name="Doanh thu (VNĐ)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={10}>
                    <Card title={<span style={{color: '#fff'}}>PHÂN TỶ LỆ TRẠNG THÁI</span>} bordered={false} style={{ background: '#1f1f1f', borderRadius: '12px' }}>
                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                <Pie data={data.pieData} dataKey="value" cx="50%" cy="50%" outerRadius={90} innerRadius={65} paddingAngle={5} label>
                                    {data.pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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