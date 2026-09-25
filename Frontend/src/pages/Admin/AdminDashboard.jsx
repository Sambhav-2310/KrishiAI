import { useEffect, useState } from 'react'
import { getAdminDashboard } from '../../services/Admin/adminService.js'

export default function AdminDashboard() {
    const [dashboard, setDashboard] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const loadDashboard = async () => {
        try {
            setLoading(true)
            setError('')

            const data = await getAdminDashboard()
            setDashboard(data)
        } catch (err) {
            console.error(err)

            setError(
                err.response?.data?.message ||
                'Failed to load admin dashboard.'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadDashboard()
    }, [])

    const formatCurrency = amount => {
        return `₹${Number(amount || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`
    }

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center">

                    <div
                        className="spinner-border text-success"
                        role="status"
                    />

                    <p className="text-muted mt-3 mb-0">
                        Loading admin dashboard...
                    </p>

                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container py-5">

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">
                            Admin Dashboard
                        </h2>

                        <p className="text-muted mb-0">
                            Overview of your KrishiAI platform.
                        </p>
                    </div>

                    <button
                        className="btn btn-outline-success"
                        onClick={loadDashboard}
                    >
                        <i className="bi bi-arrow-clockwise me-1" />
                        Retry
                    </button>
                </div>

                <div className="alert alert-danger">
                    {error}
                </div>

            </div>
        )
    }

    return (
        <div className="container py-4">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2 className="fw-bold mb-1">
                        Admin Dashboard
                    </h2>

                    <p className="text-muted mb-0">
                        Overview of your KrishiAI platform.
                    </p>
                </div>

                <button
                    className="btn btn-outline-success"
                    onClick={loadDashboard}
                >
                    <i className="bi bi-arrow-clockwise me-1" />
                    Refresh
                </button>

            </div>

            {/* Main Statistics */}
            <div className="row g-4 mb-4">

                {/* Users */}
                <div className="col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-start">

                                <div>
                                    <p className="text-muted mb-1">
                                        Total Users
                                    </p>

                                    <h3 className="fw-bold mb-0">
                                        {dashboard.totalUsers}
                                    </h3>
                                </div>

                                <div className="fs-2 text-primary">
                                    <i className="bi bi-people" />
                                </div>

                            </div>

                            <small className="text-muted">
                                {dashboard.activeUsers} active
                            </small>

                        </div>
                    </div>
                </div>

                {/* Farmers */}
                <div className="col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-start">

                                <div>
                                    <p className="text-muted mb-1">
                                        Farmers
                                    </p>

                                    <h3 className="fw-bold mb-0">
                                        {dashboard.totalFarmers}
                                    </h3>
                                </div>

                                <div className="fs-2 text-success">
                                    <i className="bi bi-person-badge" />
                                </div>

                            </div>

                            <small className="text-muted">
                                Product sellers
                            </small>

                        </div>
                    </div>
                </div>

                {/* Consumers */}
                <div className="col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-start">

                                <div>
                                    <p className="text-muted mb-1">
                                        Consumers
                                    </p>

                                    <h3 className="fw-bold mb-0">
                                        {dashboard.totalConsumers}
                                    </h3>
                                </div>

                                <div className="fs-2 text-info">
                                    <i className="bi bi-person-check" />
                                </div>

                            </div>

                            <small className="text-muted">
                                Buyers on platform
                            </small>

                        </div>
                    </div>
                </div>

                {/* Products */}
                <div className="col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-start">

                                <div>
                                    <p className="text-muted mb-1">
                                        Products
                                    </p>

                                    <h3 className="fw-bold mb-0">
                                        {dashboard.totalProducts}
                                    </h3>
                                </div>

                                <div className="fs-2 text-warning">
                                    <i className="bi bi-box-seam" />
                                </div>

                            </div>

                            <small className="text-muted">
                                Listed products
                            </small>

                        </div>
                    </div>
                </div>

            </div>

            {/* ConsumerOrders / Revenue */}
            <div className="row g-4 mb-4">

                {/* ConsumerOrders */}
                <div className="col-md-6">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center mb-4">

                                <div>
                                    <h5 className="fw-bold mb-1">
                                        Orders
                                    </h5>

                                    <p className="text-muted mb-0">
                                        Platform order activity
                                    </p>
                                </div>

                                <i className="bi bi-cart-check fs-2 text-success" />

                            </div>

                            <div className="row text-center">

                                <div className="col-6 border-end">

                                    <h3 className="fw-bold">
                                        {dashboard.totalOrders}
                                    </h3>

                                    <small className="text-muted">
                                        Total Orders
                                    </small>

                                </div>

                                <div className="col-6">

                                    <h3 className="fw-bold text-success">
                                        {dashboard.paidOrders}
                                    </h3>

                                    <small className="text-muted">
                                        Paid Orders
                                    </small>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                {/* Revenue */}
                <div className="col-md-6">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-center mb-4">

                                <div>
                                    <h5 className="fw-bold mb-1">
                                        Revenue
                                    </h5>

                                    <p className="text-muted mb-0">
                                        Successfully paid payments
                                    </p>
                                </div>

                                <i className="bi bi-currency-rupee fs-2 text-success" />

                            </div>

                            <h2 className="fw-bold text-success mb-0">
                                {formatCurrency(dashboard.totalRevenue)}
                            </h2>

                        </div>

                    </div>

                </div>

            </div>

            {/* User Breakdown */}
            <div className="row g-4">

                <div className="col-md-6">

                    <div className="card border-0 shadow-sm">

                        <div className="card-body">

                            <h5 className="fw-bold mb-4">
                                User Breakdown
                            </h5>

                            <div className="d-flex justify-content-between mb-3">
                                <span>
                                    Farmers
                                </span>

                                <span className="fw-semibold">
                                    {dashboard.totalFarmers}
                                </span>
                            </div>

                            <div className="progress mb-3" style={{ height: '8px' }}>
                                <div
                                    className="progress-bar bg-success"
                                    style={{
                                        width: dashboard.totalUsers
                                            ? `${(dashboard.totalFarmers / dashboard.totalUsers) * 100}%`
                                            : '0%'
                                    }}
                                />
                            </div>

                            <div className="d-flex justify-content-between mb-3">
                                <span>
                                    Consumers
                                </span>

                                <span className="fw-semibold">
                                    {dashboard.totalConsumers}
                                </span>
                            </div>

                            <div className="progress mb-3" style={{ height: '8px' }}>
                                <div
                                    className="progress-bar bg-info"
                                    style={{
                                        width: dashboard.totalUsers
                                            ? `${(dashboard.totalConsumers / dashboard.totalUsers) * 100}%`
                                            : '0%'
                                    }}
                                />
                            </div>

                            <div className="d-flex justify-content-between">
                                <span>
                                    Admins
                                </span>

                                <span className="fw-semibold">
                                    {dashboard.totalAdmins}
                                </span>
                            </div>

                        </div>

                    </div>

                </div>

                <div className="col-md-6">

                    <div className="card border-0 shadow-sm">

                        <div className="card-body">

                            <h5 className="fw-bold mb-4">
                                Account Status
                            </h5>

                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span>
                                    Active Users
                                </span>

                                <span className="badge text-bg-success">
                                    {dashboard.activeUsers}
                                </span>
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                                <span>
                                    Blocked Users
                                </span>

                                <span className="badge text-bg-danger">
                                    {dashboard.blockedUsers}
                                </span>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    )
}