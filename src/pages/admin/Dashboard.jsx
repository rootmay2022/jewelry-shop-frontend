import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Typography, Button, Table, Tag } from 'antd';
import { ShoppingCartOutlined, DollarCircleOutlined, FileExcelOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardStats } from '../../api/adminApi';
import { getAllUsersAdmin } from '../../api/userApi'; // Để lấy tên khách từ ID
import formatCurrency from '../../utils/formatCurrency';
import * as XLSX from 'xlsx'; 
import dayjs from 'dayjs';

const { Title, Text } = Typography; 
const COLORS = ['#52c41a', '#1890ff', '#faad14', '#ff4d4f', '#722ed1'];

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        successOrders: 0,
        pieData: [],
        deliveredList: []
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statRes, userRes] = await Promise.all([
                getDashboardStats(),
                getAllUsersAdmin()
            ]);

            // 1. Tạo bản đồ tên người dùng {id: full_name}
            const userMap = {};
            if (userRes?.success) {
                userRes.data.forEach(u => { userMap[u.id] = u.full_name || u.username; });
            }

            // 2. Xử lý đơn hàng từ API
            const rawOrders = statRes.data?.orders || statRes.data || [];
            let revenue = 0;
            let count = 0;
            const statusCount = {};
            const successList = [];

            rawOrders.forEach(order => {
                const status = (order.status || '').toUpperCase();
                // Ép kiểu số cho total_amount (vì trong CSV nó là 4200000.00)
                const amount = parseFloat(order.total_amount || 0);

                // Thống kê trạng thái
                statusCount[status] = (statusCount[status] || 0) + 1;

                // Lọc đơn thành công để tính tiền
                if (status === 'DELIVERED') {
                    revenue += amount;
                    count += 1;
                    successList.push({
                        id: order.id,
                        customer: userMap[order.user_id] || `ID: ${order.user_id} (Đã xóa)`,
                        address: order.shipping_address,
                        amount: amount,
                        date: dayjs(order.order_date).format('DD/MM/YY HH:mm')
                    });
                }
            });

            setStats({
                totalRevenue: revenue,
                successOrders: count,
                pieData: Object.entries(statusCount).map(([name, value]) => ({ name, value })),
                deliveredList: successList
            });

        } catch (error) {
            message.error('Lỗi dữ liệu hệ thống!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const exportToExcel = () => {
        const dataExport = stats.deliveredList.map(item => ({
            "Mã Đơn": item.id,
            "Khách Hàng": item.customer,
            "Địa Chỉ": item.address,
            "Ngày Giao": item.date,
            "Doanh Thu": item.amount
        }));
        const ws = XLSX.utils.json_to_sheet(dataExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "DoanhThu");
        XLSX.writeFile(wb, `Bao_Cao_${dayjs().format('DDMM')}.xlsx`);
    };

    if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

    return (
        <div style={{ padding: '24px', background: '#f0f2f5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <Title level={2}>📊 TỔNG QUAN DOANH THU</Title>
                <Button type="primary" icon={<FileExcelOutlined />} onClick={exportToExcel} danger>XUẤT EXCEL</Button>
            </div>

            <Row gutter={16}>
                <Col span={12}>
                    <Card bordered={false}>
                        <Statistic 
                            title="TỔNG DOANH THU THỰC TẾ" 
                            value={stats.totalRevenue} 
                            formatter={v => formatCurrency(v)} 
                            valueStyle={{ color: '#cf1322', fontWeight: 'bold' }}
                            prefix={<DollarCircleOutlined />} 
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card bordered={false}>
                        <Statistic 
                            title="ĐƠN GIAO THÀNH CÔNG" 
                            value={stats.successOrders} 
                            valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
                            prefix={<CheckCircleOutlined />} 
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 20 }}>
                <Col span={10}>
                    <Card title="Tỷ lệ đơn hàng">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={stats.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
                                    {stats.pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={14}>
                    <Card title="Chi tiết đơn đã thu tiền">
                        <Table 
                            dataSource={stats.deliveredList} 
                            rowKey="id" 
                            pagination={{ pageSize: 4 }}
                            size="small"
                            columns={[
                                { title: 'Mã', dataIndex: 'id' },
                                { title: 'Khách', dataIndex: 'customer' },
                                { title: 'Tiền', dataIndex: 'amount', render: v => formatCurrency(v) }
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;