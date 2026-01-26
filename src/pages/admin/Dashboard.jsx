import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Typography, Button, Table, Tag } from 'antd';
import { ShoppingCartOutlined, DollarCircleOutlined, FileExcelOutlined, UserOutlined, ShoppingOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardStats } from '../../api/adminApi';
import { getAllUsersAdmin } from '../../api/authApi';
import formatCurrency from '../../utils/formatCurrency';
import * as XLSX from 'xlsx'; 
import dayjs from 'dayjs';

const { Title } = Typography; 
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
            const [statRes, userRes] = await Promise.all([
                getDashboardStats(),
                getAllUsersAdmin()
            ]);

            const users = userRes?.data || [];
            const userMap = {};
            users.forEach(u => userMap[u.id] = u.fullName || u.full_name || u.username);

            const orders = statRes.data?.orders || [];
            const products = statRes.data?.products || [];
            
            let revenue = 0;
            const statusCount = {};

            // Các trạng thái được coi là "Đã thu tiền thành công"
            const SUCCESS_STATUSES = ['DELIVERED', 'COMPLETED', 'PAID', 'SUCCESS'];

            const processedOrders = orders.map(order => {
                const amount = parseFloat(order.totalAmount || order.total_amount || 0);
                // CHỖ NÀY QUAN TRỌNG: Chuẩn hóa chữ hoa và xóa khoảng trắng thừa
                const rawStatus = order.status ? order.status.trim().toUpperCase() : 'PENDING';
                
                // 1. Tính doanh thu nếu trạng thái nằm trong danh sách thành công
                if (SUCCESS_STATUSES.includes(rawStatus)) {
                    revenue += amount;
                }

                // 2. Đếm số lượng đơn theo trạng thái để vẽ biểu đồ
                statusCount[rawStatus] = (statusCount[rawStatus] || 0) + 1;

                return {
                    key: order.id,
                    id: `#${order.id}`,
                    customer: userMap[order.userId || order.user_id] || 'Khách vãng lai',
                    amount: amount,
                    status: rawStatus,
                    date: dayjs(order.orderDate || order.order_date).format('DD/MM/YYYY HH:mm')
                };
            });

            // Sắp xếp đơn mới nhất lên đầu bảng
            processedOrders.sort((a, b) => b.key - a.key);

            setData({
                totalRevenue: revenue,
                orderCount: orders.length,
                userCount: users.length,
                productCount: products.length,
                pieData: Object.entries(statusCount).map(([name, value]) => ({ name, value })),
                recentOrders: processedOrders.slice(0, 10) // Tăng lên 10 đơn cho máu
            });

        } catch (error) {
            console.error('Dashboard Error:', error);
            message.error('Lỗi cập nhật dữ liệu từ server!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Logic Export Excel giữ nguyên...
    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(data.recentOrders);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "BaoCao");
        XLSX.writeFile(wb, `DoanhThu_Gems_${dayjs().format('DD_MM_YYYY')}.xlsx`);
    };

    if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

    return (
        <div style={{ padding: '24px', background: '#f0f2f5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2}>📊 HỆ THỐNG BÁO CÁO DOANH THU</Title>
                <Button type="primary" icon={<FileExcelOutlined />} onClick={exportExcel}>XUẤT FILE EXCEL</Button>
            </div>

            <Row gutter={[16, 16]}>
                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic title="Thực Thu (Đã Giao)" value={data.totalRevenue} prefix={<DollarCircleOutlined />} formatter={v => formatCurrency(v)} valueStyle={{ color: '#3f8600', fontWeight: 'bold' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic title="Tổng Đơn Phát Sinh" value={data.orderCount} prefix={<ShoppingCartOutlined />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic title="Thành Viên" value={data.userCount} prefix={<UserOutlined />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false}>
                        <Statistic title="Hàng Trong Kho" value={data.productCount} prefix={<ShoppingOutlined />} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={10}>
                    <Card title="Cơ cấu trạng thái đơn">
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={data.pieData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                        {data.pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
                <Col span={14}>
                    <Card title="Các đơn hàng mới nhất cần xử lý">
                        <Table 
                            columns={[
                                { title: 'Mã đơn', dataIndex: 'id' },
                                { title: 'Khách hàng', dataIndex: 'customer' },
                                { title: 'Số tiền', dataIndex: 'amount', render: v => formatCurrency(v) },
                                { 
                                    title: 'Trạng thái', 
                                    dataIndex: 'status',
                                    render: (st) => (
                                        <Tag color={SUCCESS_STATUSES.includes(st) ? 'green' : 'orange'}>{st}</Tag>
                                    )
                                },
                                { title: 'Ngày đặt', dataIndex: 'date' }
                            ]} 
                            dataSource={data.recentOrders} 
                            pagination={false} 
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;