import React, { useState, useEffect } from 'react';
// THÊM Typography vào dải import của antd ở đây nè ní
import { 
    Row, Col, Card, Statistic, Spin, message, 
    Typography, Button, Table, Tag, Badge 
} from 'antd';
import { 
    ShoppingCartOutlined, 
    DollarCircleOutlined, 
    FileExcelOutlined, 
    UserOutlined, 
    ShoppingOutlined,
    ArrowUpOutlined 
} from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { getDashboardStats } from '../../api/adminApi';
import { getAllUsersAdmin } from '../../api/authApi';
import formatCurrency from '../../utils/formatCurrency';
import * as XLSX from 'xlsx'; 
import dayjs from 'dayjs';

// ĐỊNH NGHĨA Title và Text ở đây để dùng trong code
const { Title, Text } = Typography; 
const COLORS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1'];

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

    // Danh sách trạng thái được tính vào doanh thu (Chống lỗi chữ hoa/thường)
    const SUCCESS_STATUSES = ['DELIVERED', 'COMPLETED', 'PAID', 'SUCCESS'];

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statRes, userRes] = await Promise.all([
                getDashboardStats(),
                getAllUsersAdmin()
            ]);

            // Map tên user
            const users = userRes?.data || [];
            const userMap = {};
            users.forEach(u => userMap[u.id] = u.fullName || u.full_name || u.username);

            const orders = statRes.data?.orders || [];
            const products = statRes.data?.products || [];
            
            let revenue = 0;
            const statusCount = {};

            const processedOrders = orders.map(order => {
                // Xử lý linh hoạt cả snake_case và camelCase từ API
                const amount = parseFloat(order.totalAmount || order.total_amount || 0);
                const rawStatus = order.status ? order.status.trim().toUpperCase() : 'PENDING';
                
                // Cộng dồn doanh thu nếu trạng thái hợp lệ
                if (SUCCESS_STATUSES.includes(rawStatus)) {
                    revenue += amount;
                }

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

            // Sắp xếp đơn mới nhất lên đầu
            processedOrders.sort((a, b) => b.key - a.key);

            setData({
                totalRevenue: revenue,
                orderCount: orders.length,
                userCount: users.length,
                productCount: products.length,
                pieData: Object.entries(statusCount).map(([name, value]) => ({ name, value })),
                recentOrders: processedOrders.slice(0, 8)
            });

        } catch (error) {
            console.error('Dashboard Error:', error);
            message.error('Không thể cập nhật số liệu mới nhất!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(data.recentOrders);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Báo Cáo Doanh Thu");
        XLSX.writeFile(wb, `Bao_Cao_Gems_${dayjs().format('YYYYMMDD')}.xlsx`);
    };

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '100px' }}>
            <Spin size="large" tip="Đang tải dữ liệu realtime..." />
        </div>
    );

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={3}>💎 TỔNG QUAN KINH DOANH</Title>
                <Button type="primary" danger icon={<FileExcelOutlined />} onClick={exportExcel}>
                    XUẤT BÁO CÁO EXCEL
                </Button>
            </div>

            {/* Thống kê Card */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable>
                        <Statistic 
                            title="Thực Thu (Đã giao)" 
                            value={data.totalRevenue} 
                            formatter={v => formatCurrency(v)}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<DollarCircleOutlined />}
                        />
                        <Text type="secondary"><ArrowUpOutlined /> Cập nhật ngay khi đơn hoàn thành</Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable>
                        <Statistic title="Tổng Đơn Hàng" value={data.orderCount} prefix={<ShoppingCartOutlined />} />
                        <Text type="secondary">Tất cả trạng thái</Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable>
                        <Statistic title="Người Dùng" value={data.userCount} prefix={<UserOutlined />} />
                        <Text type="secondary">Khách hàng hệ thống</Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card hoverable>
                        <Statistic title="Sản Phẩm" value={data.productCount} prefix={<ShoppingOutlined />} />
                        <Text type="secondary">Đang kinh doanh</Text>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={10}>
                    <Card title="Phân tích trạng thái đơn">
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={data.pieData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                                        {data.pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
                
                <Col xs={24} lg={14}>
                    <Card title="Giao dịch mới nhất">
                        <Table 
                            columns={[
                                { title: 'Mã đơn', dataIndex: 'id' },
                                { title: 'Khách hàng', dataIndex: 'customer' },
                                { title: 'Tổng tiền', dataIndex: 'amount', render: v => <b>{formatCurrency(v)}</b> },
                                { 
                                    title: 'Trạng thái', 
                                    dataIndex: 'status',
                                    render: (st) => (
                                        <Tag color={SUCCESS_STATUSES.includes(st) ? 'green' : 'orange'}>
                                            {st}
                                        </Tag>
                                    )
                                },
                            ]} 
                            dataSource={data.recentOrders} 
                            pagination={false} 
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;