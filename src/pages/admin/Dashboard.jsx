import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Typography, Button, Table, Tag } from 'antd';
import { 
    ShoppingCartOutlined, 
    DollarCircleOutlined, 
    FileExcelOutlined, 
    UserOutlined,
    ShoppingOutlined 
} from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { getDashboardStats } from '../../api/adminApi';
import { getAllUsersAdmin } from '../../api/authApi';
import formatCurrency from '../../utils/formatCurrency';
import * as XLSX from 'xlsx'; 
import dayjs from 'dayjs';

const { Title, Text } = Typography; 
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        totalRevenue: 0,
        orderCount: 0,
        userCount: 0,
        productCount: 0,
        pieData: [],
        recentOrders: []
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            // Gọi song song API Thống kê và API Người dùng
            const [statRes, userRes] = await Promise.all([
                getDashboardStats(),
                getAllUsersAdmin()
            ]);

            // 1. Tạo bản đồ người dùng (ID -> Tên)
            const users = userRes?.data || [];
            const userMap = {};
            users.forEach(u => {
                userMap[u.id] = u.fullName || u.full_name || u.username || u.email;
            });

            // 2. Lấy dữ liệu từ API
            const orders = statRes.data?.orders || [];
            const products = statRes.data?.products || [];
            
            let revenue = 0;
            const statusMap = {};

            const processedOrders = orders.map(order => {
                const amount = parseFloat(order.totalAmount || order.total_amount || 0);
                const status = (order.status || 'PENDING').toUpperCase();
                
                // Chỉ tính doanh thu cho đơn hàng đã hoàn tất thành công
                if (['DELIVERED', 'COMPLETED', 'PAID', 'SUCCESS'].includes(status)) {
                    revenue += amount;
                }

                // Đếm số lượng theo trạng thái để vẽ biểu đồ
                statusMap[status] = (statusMap[status] || 0) + 1;

                return {
                    key: order.id,
                    id: `#${order.id}`,
                    customer: userMap[order.userId || order.user_id] || 'Khách vãng lai',
                    amount: amount,
                    status: status,
                    date: dayjs(order.orderDate || order.order_date).format('DD/MM/YYYY HH:mm')
                };
            });

            // Sắp xếp đơn hàng mới nhất lên trên
            processedOrders.sort((a, b) => b.key - a.key);

            setData({
                totalRevenue: revenue,
                orderCount: orders.length,
                userCount: users.length,
                productCount: products.length,
                pieData: Object.entries(statusMap).map(([name, value]) => ({ name, value })),
                recentOrders: processedOrders.slice(0, 8) 
            });

        } catch (error) {
            console.error('Lỗi Dashboard:', error);
            message.error('Không thể lấy dữ liệu mới nhất từ máy chủ!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const exportExcel = () => {
        try {
            const ws = XLSX.utils.json_to_sheet(data.recentOrders);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Báo Cáo Doanh Thu");
            XLSX.writeFile(wb, `Gems_Report_${dayjs().format('DD_MM_YYYY')}.xlsx`);
            message.success('Đã xuất file báo cáo thành công!');
        } catch (err) {
            message.error('Lỗi khi xuất file Excel');
        }
    };

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '100px' }}>
            <Spin size="large" tip="Đang đồng bộ dữ liệu hệ thống..." />
        </div>
    );

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2}>📊 TỔNG QUAN HỆ THỐNG</Title>
                <Button type="primary" danger icon={<FileExcelOutlined />} onClick={exportExcel}>
                    XUẤT BÁO CÁO EXCEL
                </Button>
            </div>

            {/* Thẻ thống kê */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable>
                        <Statistic 
                            title="Thực Thu (Đã Giao)" 
                            value={data.totalRevenue} 
                            prefix={<DollarCircleOutlined />} 
                            formatter={v => formatCurrency(v)}
                            valueStyle={{ color: '#3f8600', fontWeight: 'bold' }} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable>
                        <Statistic title="Tổng Đơn Hàng" value={data.orderCount} prefix={<ShoppingCartOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable>
                        <Statistic title="Khách Hàng" value={data.userCount} prefix={<UserOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable>
                        <Statistic title="Sản Phẩm" value={data.productCount} prefix={<ShoppingOutlined />} />
                    </Card>
                </Col>
            </Row>

            {/* Biểu đồ và Bảng dữ liệu */}
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={10}>
                    <Card title="Phân bổ trạng thái đơn hàng">
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={data.pieData} 
                                        innerRadius={60} 
                                        outerRadius={100} 
                                        paddingAngle={5} 
                                        dataKey="value"
                                    >
                                        {data.pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} lg={14}>
                    <Card title="Các giao dịch mới nhất">
                        <Table 
                            columns={[
                                { title: 'Mã đơn', dataIndex: 'id', key: 'id' },
                                { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
                                { title: 'Số tiền', dataIndex: 'amount', render: v => <b>{formatCurrency(v)}</b> },
                                { 
                                    title: 'Trạng thái', 
                                    dataIndex: 'status', 
                                    render: (status) => (
                                        <Tag color={status === 'DELIVERED' || status === 'COMPLETED' ? 'green' : 'orange'}>
                                            {status}
                                        </Tag>
                                    ) 
                                },
                                { title: 'Ngày đặt', dataIndex: 'date' }
                            ]} 
                            dataSource={data.recentOrders} 
                            pagination={false}
                            size="middle"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;