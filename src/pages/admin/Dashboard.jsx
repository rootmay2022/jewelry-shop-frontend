import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Typography, Button, Space } from 'antd';
import { ShoppingCartOutlined, DollarCircleOutlined, FileExcelOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardStats } from '../../api/adminApi';
import formatCurrency from '../../utils/formatCurrency';
import * as XLSX from 'xlsx'; 
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getDashboardStats();
                if (response.success) {
                    // Logic lọc dữ liệu ảo ngay tại Frontend nếu cần
                    setStats(response.data);
                }
            } catch (error) {
                message.error('Không thể tải dữ liệu.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleExportExcel = () => {
        if (!stats || !stats.revenueByDay) return;
        const data = stats.revenueByDay.map(item => ({
            'Ngày': item.date,
            'Doanh Thu Thực Tế': item.revenue
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Báo Cáo");
        XLSX.writeFile(wb, `Bao_Cao_${dayjs().format('MM_YYYY')}.xlsx`);
    };

    if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <Title level={2}>📊 QUẢN TRỊ DOANH THU</Title>
                <Button type="primary" icon={<FileExcelOutlined />} onClick={handleExportExcel} style={{ backgroundColor: '#1d6f42' }}>
                    XUẤT EXCEL
                </Button>
            </div>

            <Row gutter={16}>
                <Col span={12}>
                    <Card hoverable>
                        {/* Nếu số bị ảo, ní có thể trừ đi hoặc check lại API tại đây */}
                        <Statistic 
                            title="Doanh Thu Đã Giao (Thực Tế)" 
                            value={stats.totalRevenue} 
                            formatter={(v) => formatCurrency(v)}
                            valueStyle={{ color: '#3f51b5' }}
                        />
                        <Text type="danger">* Lưu ý: Con số này đang lấy từ Backend (Cần check lại logic BE)</Text>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card hoverable>
                        <Statistic title="Số Đơn Đã Giao" value={stats.totalOrders} prefix={<ShoppingCartOutlined />} />
                    </Card>
                </Col>
            </Row>

            <Card title="Biểu đồ doanh thu hàng ngày" style={{ marginTop: 24 }}>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.revenueByDay}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(v) => formatCurrency(v)} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Doanh thu" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

export default Dashboard;