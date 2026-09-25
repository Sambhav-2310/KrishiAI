import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFarmerDashboard } from '../../services/Farmer/farmerDashboardService.js'

function FarmerDashboard() {
    const [dashboard, setDashboard] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // =========================================================
    // LOAD DASHBOARD
    // =========================================================

    useEffect(() => {
        loadDashboard()
    }, [])

    const loadDashboard = async () => {
        try {
            setLoading(true)
            setError('')

            const data = await getFarmerDashboard()

            setDashboard(data)
        } catch (err) {
            console.error('Farmer dashboard error:', err)

            setError(
                err?.response?.data?.message ||
                'Unable to load farmer dashboard.'
            )
        } finally {
            setLoading(false)
        }
    }


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center py-5">
                    <div
                        className="spinner-border text-success"
                        role="status"
                    >
            <span className="visually-hidden">
              Loading...
            </span>
                    </div>

                    <p className="text-muted mt-3 mb-0">
                        Loading your dashboard...
                    </p>
                </div>
            </div>
        )
    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error) {
        return (
            <div className="container py-5">
                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    <div className="d-flex align-items-center">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>

                        <div>
                            <strong>Unable to load dashboard</strong>

                            <div className="small mt-1">
                                {error}
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm mt-3"
                        onClick={loadDashboard}
                    >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Try Again
                    </button>
                </div>
            </div>
        )
    }


    // =========================================================
    // SAFETY
    // =========================================================

    if (!dashboard) {
        return null
    }


    // =========================================================
    // DASHBOARD UI
    // =========================================================

    return (
        <section className="container py-4">

            {/* =====================================================
          HEADER
      ===================================================== */}

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">

                <div>
                    <p className="text-success fw-semibold mb-1">
                        FARMER WORKSPACE
                    </p>

                    <h1 className="h2 mb-1">
                        Farmer Dashboard
                    </h1>

                    <p className="text-muted mb-0">
                        Manage your products, orders, and sales.
                    </p>
                </div>

                <div className="d-flex gap-2 mt-3 mt-md-0">

                    <Link
                        to="/farmer/products/new"
                        className="btn btn-success"
                    >
                        <i className="bi bi-plus-lg me-1"></i>
                        Add Product
                    </Link>

                    <Link
                        to="/farmer/orders"
                        className="btn btn-outline-success"
                    >
                        <i className="bi bi-bag-check me-1"></i>
                        Orders
                    </Link>

                </div>
            </div>


            {/* =====================================================
          SALES CARD
      ===================================================== */}

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">

                    <div className="row align-items-center">

                        <div className="col-md-8">

                            <p className="text-muted mb-1">
                                Total Sales
                            </p>

                            <h2 className="display-6 fw-bold mb-2">
                                ₹
                                {Number(
                                    dashboard.totalSales || 0
                                ).toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </h2>

                            <p className="text-muted mb-0">
                                Sales generated from your orders
                            </p>

                        </div>

                        <div className="col-md-4 text-md-end mt-3 mt-md-0">

                            <div className="display-4 text-success">
                                <i className="bi bi-currency-rupee"></i>
                            </div>

                        </div>

                    </div>

                </div>
            </div>


            {/* =====================================================
          PRODUCT STATISTICS
      ===================================================== */}

            <div className="d-flex justify-content-between align-items-center mb-3">

                <h2 className="h5 mb-0">
                    Product Overview
                </h2>

                <Link
                    to="/farmer/products"
                    className="btn btn-sm btn-outline-secondary"
                >
                    View Products
                </Link>

            </div>


            <div className="row g-3 mb-4">

                {/* TOTAL PRODUCTS */}

                <div className="col-6 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-start">

                                <div>
                                    <p className="text-muted small mb-1">
                                        Total Products
                                    </p>

                                    <h3 className="mb-0">
                                        {dashboard.totalProducts}
                                    </h3>
                                </div>

                                <i className="bi bi-box-seam fs-3 text-primary"></i>

                            </div>

                        </div>
                    </div>
                </div>


                {/* ACTIVE PRODUCTS */}

                <div className="col-6 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-start">

                                <div>
                                    <p className="text-muted small mb-1">
                                        Active
                                    </p>

                                    <h3 className="mb-0 text-success">
                                        {dashboard.activeProducts}
                                    </h3>
                                </div>

                                <i className="bi bi-check-circle fs-3 text-success"></i>

                            </div>

                        </div>
                    </div>
                </div>


                {/* SOLD OUT */}

                <div className="col-6 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-start">

                                <div>
                                    <p className="text-muted small mb-1">
                                        Sold Out
                                    </p>

                                    <h3 className="mb-0 text-warning">
                                        {dashboard.soldOutProducts}
                                    </h3>
                                </div>

                                <i className="bi bi-exclamation-circle fs-3 text-warning"></i>

                            </div>

                        </div>
                    </div>
                </div>


                {/* INACTIVE */}

                <div className="col-6 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-start">

                                <div>
                                    <p className="text-muted small mb-1">
                                        Inactive
                                    </p>

                                    <h3 className="mb-0 text-secondary">
                                        {dashboard.inactiveProducts}
                                    </h3>
                                </div>

                                <i className="bi bi-pause-circle fs-3 text-secondary"></i>

                            </div>

                        </div>
                    </div>
                </div>

            </div>


            {/* =====================================================
          ORDER STATISTICS
      ===================================================== */}

            <div className="d-flex justify-content-between align-items-center mb-3">

                <h2 className="h5 mb-0">
                    Order Overview
                </h2>

                <Link
                    to="/farmer/orders"
                    className="btn btn-sm btn-outline-secondary"
                >
                    View Orders
                </Link>

            </div>


            <div className="row g-3 mb-4">

                {/* TOTAL ORDERS */}

                <div className="col-6 col-md-4 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">

                            <p className="text-muted small mb-1">
                                Total Orders
                            </p>

                            <h3 className="mb-0">
                                {dashboard.totalOrders}
                            </h3>

                        </div>
                    </div>
                </div>


                {/* CONFIRMED */}

                <div className="col-6 col-md-4 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">

                            <p className="text-muted small mb-1">
                                Confirmed
                            </p>

                            <h3 className="mb-0 text-primary">
                                {dashboard.confirmedOrders}
                            </h3>

                        </div>
                    </div>
                </div>


                {/* PROCESSING */}

                <div className="col-6 col-md-4 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">

                            <p className="text-muted small mb-1">
                                Processing
                            </p>

                            <h3 className="mb-0 text-info">
                                {dashboard.processingOrders}
                            </h3>

                        </div>
                    </div>
                </div>


                {/* SHIPPED */}

                <div className="col-6 col-md-4 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">

                            <p className="text-muted small mb-1">
                                Shipped
                            </p>

                            <h3 className="mb-0 text-warning">
                                {dashboard.shippedOrders}
                            </h3>

                        </div>
                    </div>
                </div>


                {/* DELIVERED */}

                <div className="col-6 col-md-4 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">

                            <p className="text-muted small mb-1">
                                Delivered
                            </p>

                            <h3 className="mb-0 text-success">
                                {dashboard.deliveredOrders}
                            </h3>

                        </div>
                    </div>
                </div>


                {/* CANCELLED */}

                <div className="col-6 col-md-4 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">

                            <p className="text-muted small mb-1">
                                Cancelled
                            </p>

                            <h3 className="mb-0 text-danger">
                                {dashboard.cancelledOrders}
                            </h3>

                        </div>
                    </div>
                </div>

            </div>


            {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

            <div className="card border-0 shadow-sm">

                <div className="card-body p-4">

                    <h2 className="h5 mb-3">
                        Quick Actions
                    </h2>

                    <div className="row g-3">

                        <div className="col-md-4">

                            <Link
                                to="/farmer/products/new"
                                className="btn btn-outline-success w-100 py-3"
                            >
                                <i className="bi bi-plus-circle fs-5 me-2"></i>
                                Add New Product
                            </Link>

                        </div>


                        <div className="col-md-4">

                            <Link
                                to="/farmer/products"
                                className="btn btn-outline-primary w-100 py-3"
                            >
                                <i className="bi bi-box-seam fs-5 me-2"></i>
                                Manage Products
                            </Link>

                        </div>


                        <div className="col-md-4">

                            <Link
                                to="/farmer/orders"
                                className="btn btn-outline-dark w-100 py-3"
                            >
                                <i className="bi bi-receipt fs-5 me-2"></i>
                                Manage Orders
                            </Link>

                        </div>

                    </div>

                </div>

            </div>

        </section>
    )
}

export default FarmerDashboard