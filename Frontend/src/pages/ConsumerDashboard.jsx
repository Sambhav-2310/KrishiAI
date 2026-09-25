import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { getOrders } from '../services/orderService'
import { getProducts } from '../services/Farmer/farmerProductService.js'

export default function Dashboard({ role }) {
  const { user } = useContext(AuthContext)

  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        /*
         * Consumer dashboard uses the authenticated
         * consumer's own orders.
         */
        const [productData, orderData] =
            await Promise.all([
              getProducts(),
              getOrders()
            ])

        setProducts(
            Array.isArray(productData)
                ? productData
                : []
        )

        setOrders(
            Array.isArray(orderData)
                ? orderData
                : []
        )
      } catch (err) {
        console.error(
            'Failed to load dashboard:',
            err
        )

        setError(
            err?.response?.data?.message ||
            'Unable to load dashboard data.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [user])


  // =========================================================
  // FORMATTERS
  // =========================================================

  const formatCurrency = amount => {
    return Number(amount || 0).toLocaleString(
        'en-IN',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
    )
  }


  const formatDate = value => {
    if (!value) {
      return '—'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return date.toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }
    )
  }


  // =========================================================
  // ORDER STATISTICS
  // =========================================================

  const totalOrders = orders.length

  const activeOrders =
      orders.filter(order =>
          [
            'PENDING',
            'CONFIRMED',
            'PROCESSING',
            'SHIPPED'
          ].includes(order.status)
      ).length

  const deliveredOrders =
      orders.filter(
          order =>
              order.status === 'DELIVERED'
      ).length

  const cancelledOrders =
      orders.filter(
          order =>
              order.status === 'CANCELLED'
      ).length

  const totalSpent =
      orders
          .filter(
              order =>
                  order.status !== 'CANCELLED'
          )
          .reduce(
              (sum, order) =>
                  sum +
                  Number(
                      order.totalAmount || 0
                  ),
              0
          )


  // =========================================================
  // RECENT ORDERS
  // =========================================================

  const recentOrders =
      orders.slice(0, 5)


  // =========================================================
  // RECENT PRODUCTS FROM ORDERS
  // =========================================================

  const purchasedProductIds = new Set()

  orders.forEach(order => {
    ;(order.items || []).forEach(item => {
      if (item.productId) {
        purchasedProductIds.add(
            String(item.productId)
        )
      }
    })
  })

  /*
   * Show active marketplace products that the
   * consumer has not already purchased recently.
   */
  const recommendedProducts =
      products
          .filter(product =>
              product.status === 'ACTIVE'
          )
          .filter(product =>
              !purchasedProductIds.has(
                  String(product.id)
              )
          )
          .slice(0, 4)


  // =========================================================
  // STATUS BADGE
  // =========================================================

  const getStatusBadge = status => {
    switch (status) {

      case 'PENDING':
        return (
            <span className="badge text-bg-warning">
                        Pending
                    </span>
        )

      case 'CONFIRMED':
        return (
            <span className="badge text-bg-primary">
                        Confirmed
                    </span>
        )

      case 'PROCESSING':
        return (
            <span className="badge text-bg-info">
                        Processing
                    </span>
        )

      case 'SHIPPED':
        return (
            <span className="badge text-bg-dark">
                        Shipped
                    </span>
        )

      case 'DELIVERED':
        return (
            <span className="badge text-bg-success">
                        Delivered
                    </span>
        )

      case 'CANCELLED':
        return (
            <span className="badge text-bg-danger">
                        Cancelled
                    </span>
        )

      default:
        return (
            <span className="badge text-bg-secondary">
                        {status || 'Unknown'}
                    </span>
        )
    }
  }


  // =========================================================
  // NON-CONSUMER ROLES
  // =========================================================

  if (role !== 'consumer') {
    return (
        <section className="container py-5">

          <div className="alert alert-info">
            This dashboard is currently configured
            for consumers.
          </div>

        </section>
    )
  }


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
        <section className="container py-5">

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

        </section>
    )
  }


  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
      <section className="container py-5">

        {/* =================================================
                HEADER
            ================================================= */}

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">

          <div>

            <p className="text-success fw-semibold mb-1">
              CONSUMER WORKSPACE
            </p>

            <h1 className="mb-1">
              Welcome, {user?.name || 'Consumer'}
            </h1>

            <p className="text-muted mb-0">
              Track your purchases and discover
              fresh products from local farmers.
            </p>

          </div>

          <div className="d-flex gap-2 mt-3 mt-md-0">

            <Link
                to="/marketplace"
                className="btn btn-success"
            >
              <i className="bi bi-shop me-1"></i>
              Marketplace
            </Link>

            <Link
                to="/consumer/orders"
                className="btn btn-outline-success"
            >
              <i className="bi bi-box-seam me-1"></i>
              My Orders
            </Link>

          </div>

        </div>


        {/* =================================================
                ERROR
            ================================================= */}

        {error && (
            <div
                className="alert alert-danger"
                role="alert"
            >
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
        )}


        {/* =================================================
                STATISTICS
            ================================================= */}

        <div className="row g-3 mb-5">

          {/* Total ConsumerOrders */}

          <div className="col-6 col-lg-3">

            <div className="card border-0 shadow-sm h-100">

              <div className="card-body">

                <div className="d-flex justify-content-between align-items-start">

                  <div>

                    <p className="text-muted small mb-1">
                      Total Orders
                    </p>

                    <h3 className="mb-0">
                      {totalOrders}
                    </h3>

                  </div>

                  <i className="bi bi-bag-check fs-2 text-success"></i>

                </div>

              </div>

            </div>

          </div>


          {/* Active ConsumerOrders */}

          <div className="col-6 col-lg-3">

            <div className="card border-0 shadow-sm h-100">

              <div className="card-body">

                <div className="d-flex justify-content-between align-items-start">

                  <div>

                    <p className="text-muted small mb-1">
                      Active Orders
                    </p>

                    <h3 className="mb-0">
                      {activeOrders}
                    </h3>

                  </div>

                  <i className="bi bi-truck fs-2 text-primary"></i>

                </div>

              </div>

            </div>

          </div>


          {/* Delivered */}

          <div className="col-6 col-lg-3">

            <div className="card border-0 shadow-sm h-100">

              <div className="card-body">

                <div className="d-flex justify-content-between align-items-start">

                  <div>

                    <p className="text-muted small mb-1">
                      Delivered
                    </p>

                    <h3 className="mb-0 text-success">
                      {deliveredOrders}
                    </h3>

                  </div>

                  <i className="bi bi-check-circle fs-2 text-success"></i>

                </div>

              </div>

            </div>

          </div>


          {/* Total Spent */}

          <div className="col-6 col-lg-3">

            <div className="card border-0 shadow-sm h-100">

              <div className="card-body">

                <div className="d-flex justify-content-between align-items-start">

                  <div>

                    <p className="text-muted small mb-1">
                      Total Spent
                    </p>

                    <h3 className="mb-0">
                      ₹{formatCurrency(
                        totalSpent
                    )}
                    </h3>

                  </div>

                  <i className="bi bi-currency-rupee fs-2 text-success"></i>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
                ORDER SUMMARY
            ================================================= */}

        <div className="row g-4">

          <div className="col-lg-7">

            <div className="card border-0 shadow-sm h-100">

              <div className="card-body p-4">

                <div className="d-flex justify-content-between align-items-center mb-3">

                  <div>

                    <h2 className="h5 mb-1">
                      Recent Orders
                    </h2>

                    <p className="text-muted small mb-0">
                      Your latest purchases
                    </p>

                  </div>

                  <Link
                      to="/consumer/orders"
                      className="text-success small text-decoration-none fw-semibold"
                  >
                    View all
                    <i className="bi bi-arrow-right ms-1"></i>
                  </Link>

                </div>


                {recentOrders.length === 0 ? (

                    <div className="text-center py-5">

                      <i className="bi bi-bag-x display-5 text-muted"></i>

                      <h3 className="h6 mt-3">
                        No orders yet
                      </h3>

                      <p className="text-muted small">
                        Start shopping from the
                        farmer marketplace.
                      </p>

                      <Link
                          to="/marketplace"
                          className="btn btn-success btn-sm"
                      >
                        Browse Marketplace
                      </Link>

                    </div>

                ) : (

                    <div className="table-responsive">

                      <table className="table align-middle mb-0">

                        <thead className="table-light">

                        <tr>

                          <th>
                            Order
                          </th>

                          <th>
                            Products
                          </th>

                          <th>
                            Amount
                          </th>

                          <th>
                            Status
                          </th>

                          <th>
                            Date
                          </th>

                        </tr>

                        </thead>

                        <tbody>

                        {recentOrders.map(order => {

                          const items =
                              order.items || []

                          const productNames =
                              items
                                  .map(
                                      item =>
                                          item.productName
                                  )
                                  .filter(Boolean)

                          return (
                              <tr key={order.id}>

                                <td>
                                                            <span className="fw-semibold">
                                                                #{order.id}
                                                            </span>
                                </td>

                                <td>

                                  <div
                                      className="small"
                                      style={{
                                        maxWidth:
                                            '220px'
                                      }}
                                  >
                                    {productNames.length >
                                    0
                                        ? productNames.join(
                                            ', '
                                        )
                                        : 'Products'}
                                  </div>

                                </td>

                                <td>

                                                            <span className="fw-semibold">
                                                                ₹
                                                              {formatCurrency(
                                                                  order.totalAmount
                                                              )}
                                                            </span>

                                </td>

                                <td>
                                  {getStatusBadge(
                                      order.status
                                  )}
                                </td>

                                <td>

                                                            <span className="small text-muted">
                                                                {formatDate(
                                                                    order.createdAt
                                                                )}
                                                            </span>

                                </td>

                              </tr>
                          )
                        })}

                        </tbody>

                      </table>

                    </div>

                )}

              </div>

            </div>

          </div>


          {/* =================================================
                    ORDER STATUS
                ================================================= */}

          <div className="col-lg-5">

            <div className="card border-0 shadow-sm h-100">

              <div className="card-body p-4">

                <h2 className="h5 mb-1">
                  Order Overview
                </h2>

                <p className="text-muted small mb-4">
                  Current status of your orders
                </p>


                {/* Active */}

                <div className="d-flex justify-content-between align-items-center py-3 border-bottom">

                  <div className="d-flex align-items-center gap-3">

                    <div className="rounded-circle bg-light p-2">
                      <i className="bi bi-truck text-primary"></i>
                    </div>

                    <span>
                                        Active Orders
                                    </span>

                  </div>

                  <strong>
                    {activeOrders}
                  </strong>

                </div>


                {/* Delivered */}

                <div className="d-flex justify-content-between align-items-center py-3 border-bottom">

                  <div className="d-flex align-items-center gap-3">

                    <div className="rounded-circle bg-light p-2">
                      <i className="bi bi-check-circle text-success"></i>
                    </div>

                    <span>
                                        Delivered
                                    </span>

                  </div>

                  <strong>
                    {deliveredOrders}
                  </strong>

                </div>


                {/* Cancelled */}

                <div className="d-flex justify-content-between align-items-center py-3">

                  <div className="d-flex align-items-center gap-3">

                    <div className="rounded-circle bg-light p-2">
                      <i className="bi bi-x-circle text-danger"></i>
                    </div>

                    <span>
                                        Cancelled
                                    </span>

                  </div>

                  <strong>
                    {cancelledOrders}
                  </strong>

                </div>


                <Link
                    to="/consumer/orders"
                    className="btn btn-outline-success w-100 mt-3"
                >
                  Track My Orders
                </Link>

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
                RECOMMENDED PRODUCTS
            ================================================= */}

        <div className="mt-5">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <div>

              <h2 className="h4 mb-1">
                Fresh From Farmers
              </h2>

              <p className="text-muted small mb-0">
                Discover products available now.
              </p>

            </div>

            <Link
                to="/marketplace"
                className="text-success text-decoration-none fw-semibold small"
            >
              View Marketplace
              <i className="bi bi-arrow-right ms-1"></i>
            </Link>

          </div>


          {recommendedProducts.length === 0 ? (

              <div className="card border-0 shadow-sm">

                <div className="card-body text-center py-5">

                  <i className="bi bi-shop display-5 text-muted"></i>

                  <p className="text-muted mt-3 mb-3">
                    No active products available right now.
                  </p>

                  <Link
                      to="/marketplace"
                      className="btn btn-success"
                  >
                    Browse Marketplace
                  </Link>

                </div>

              </div>

          ) : (

              <div className="row g-3">

                {recommendedProducts.map(product => (

                    <div
                        className="col-sm-6 col-lg-3"
                        key={product.id}
                    >

                      <Link
                          to={`/products/${product.id}`}
                          className="text-decoration-none text-dark"
                      >

                        <div className="card border-0 shadow-sm h-100">

                          <img
                              src={
                                  product.imageUrl ||
                                  'https://placehold.co/500x350?text=Product'
                              }
                              alt={product.name}
                              className="card-img-top"
                              style={{
                                height: '180px',
                                objectFit: 'cover'
                              }}
                          />

                          <div className="card-body">

                            <h3 className="h6 mb-1">
                              {product.name}
                            </h3>

                            <div className="text-success fw-semibold">

                              ₹
                              {formatCurrency(
                                  product.price
                              )}

                              <span className="text-muted fw-normal small">
                                                    {' '}
                                / {product.unit}
                                                </span>

                            </div>

                            {product.location && (
                                <div className="small text-muted mt-2">

                                  <i className="bi bi-geo-alt me-1"></i>

                                  {product.location}

                                </div>
                            )}

                          </div>

                        </div>

                      </Link>

                    </div>

                ))}

              </div>

          )}

        </div>


        {/* =================================================
                QUICK ACTIONS
            ================================================= */}

        <div className="mt-5">

          <h2 className="h5 mb-3">
            Quick Actions
          </h2>

          <div className="row g-3">

            <div className="col-md-4">

              <Link
                  to="/marketplace"
                  className="card border-0 shadow-sm text-decoration-none text-dark h-100"
              >

                <div className="card-body p-4">

                  <i className="bi bi-shop fs-2 text-success"></i>

                  <h3 className="h6 mt-3">
                    Browse Marketplace
                  </h3>

                  <p className="text-muted small mb-0">
                    Find fresh products directly
                    from farmers.
                  </p>

                </div>

              </Link>

            </div>


            <div className="col-md-4">

              <Link
                  to="/consumer/cart"
                  className="card border-0 shadow-sm text-decoration-none text-dark h-100"
              >

                <div className="card-body p-4">

                  <i className="bi bi-cart3 fs-2 text-success"></i>

                  <h3 className="h6 mt-3">
                    View Cart
                  </h3>

                  <p className="text-muted small mb-0">
                    Review your selected products
                    before checkout.
                  </p>

                </div>

              </Link>

            </div>


            <div className="col-md-4">

              <Link
                  to="/consumer/orders"
                  className="card border-0 shadow-sm text-decoration-none text-dark h-100"
              >

                <div className="card-body p-4">

                  <i className="bi bi-box-seam fs-2 text-success"></i>

                  <h3 className="h6 mt-3">
                    Track Orders
                  </h3>

                  <p className="text-muted small mb-0">
                    Check payment and delivery
                    status of your orders.
                  </p>

                </div>

              </Link>

            </div>

          </div>

        </div>

      </section>
  )
}