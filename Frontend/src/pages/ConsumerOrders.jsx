import { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { getOrders } from '../services/orderService'


export default function Orders() {

  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)


  // =========================================================
  // LOAD ORDERS
  // =========================================================

  useEffect(() => {

    const loadOrders = async () => {

      if (!user) {
        setOrders([])
        setLoading(false)
        return
      }

      if (user.role !== 'CONSUMER') {

        setError(
            'Only consumers can view these orders.'
        )

        setOrders([])
        setLoading(false)

        return
      }


      try {

        setLoading(true)
        setError('')

        const data = await getOrders()

        setOrders(
            Array.isArray(data)
                ? data
                : []
        )

      } catch (err) {

        console.error(
            'Failed to load orders:',
            err
        )

        setError(
            err?.response?.data?.message ||
            'Failed to load orders.'
        )

        setOrders([])

      } finally {

        setLoading(false)

      }
    }


    loadOrders()

  }, [user])


  // =========================================================
  // SEARCH
  // =========================================================

  const filteredOrders = orders.filter(order => {

    const searchText =
        search.trim().toLowerCase()


    if (!searchText) {
      return true
    }


    const orderId =
        String(
            order.id ??
            order.orderId ??
            ''
        ).toLowerCase()


    const status =
        String(
            order.status ??
            ''
        ).toLowerCase()


    const paymentStatus =
        String(
            order.paymentStatus ??
            ''
        ).toLowerCase()


    return (
        orderId.includes(searchText) ||
        status.includes(searchText) ||
        paymentStatus.includes(searchText)
    )
  })


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = value => {

    if (!value) {
      return '—'
    }


    const date = new Date(value)


    if (Number.isNaN(date.getTime())) {
      return value
    }


    return date.toLocaleString()
  }


  // =========================================================
  // FORMAT AMOUNT
  // =========================================================

  const formatAmount = value => {

    const amount = Number(value)


    if (Number.isNaN(amount)) {
      return '₹0.00'
    }


    return `₹${amount.toFixed(2)}`
  }


  // =========================================================
  // GET ITEM TOTAL
  // =========================================================

  const getItemTotal = item => {

    return Number(
        item.subtotal ??
        item.itemTotal ??
        (
            Number(item.price || 0) *
            Number(item.quantity || 0)
        )
    )
  }


  // =========================================================
  // GET ORDER ID
  // =========================================================

  const getOrderId = order => {

    return (
        order.id ??
        order.orderId ??
        '—'
    )
  }


  // =========================================================
  // ORDER STATUS BADGE
  // =========================================================

  const getStatusBadge = status => {

    switch (status) {

      case 'CONFIRMED':
        return 'bg-success'

      case 'PROCESSING':
        return 'bg-warning text-dark'

      case 'SHIPPED':
        return 'bg-primary'

      case 'DELIVERED':
        return 'bg-success'

      case 'CANCELLED':
        return 'bg-danger'

      case 'PENDING':
      default:
        return 'bg-secondary'
    }
  }


  // =========================================================
  // ITEM STATUS BADGE
  // =========================================================

  const getItemStatusBadge = status => {

    switch (status) {

      case 'CONFIRMED':
        return 'text-bg-success'

      case 'PROCESSING':
        return 'text-bg-warning'

      case 'SHIPPED':
        return 'text-bg-primary'

      case 'DELIVERED':
        return 'text-bg-success'

      case 'CANCELLED':
        return 'text-bg-danger'

      case 'PENDING':
      default:
        return 'text-bg-secondary'
    }
  }


  // =========================================================
  // PAYMENT BADGE
  // =========================================================

  const getPaymentBadge = status => {

    switch (status) {

      case 'PAID':
        return 'bg-success'

      case 'FAILED':
        return 'bg-danger'

      case 'REFUNDED':
        return 'bg-warning text-dark'

      case 'PENDING':
      default:
        return 'bg-secondary'
    }
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
              Loading your orders...
            </p>

          </div>

        </section>
    )
  }


  // =========================================================
  // NOT LOGGED IN
  // =========================================================

  if (!user) {

    return (

        <section className="container py-5">

          <div className="card border-0 shadow-sm">

            <div className="card-body text-center py-5">

              <i
                  className="bi bi-person-lock text-success"
                  style={{
                    fontSize: '3rem'
                  }}
              />

              <h3 className="mt-3">
                Please log in
              </h3>

              <p className="text-muted">
                You need to log in to view your orders.
              </p>

              <button
                  type="button"
                  className="btn btn-success px-4"
                  onClick={() =>
                      navigate('/login')
                  }
              >
                Login
              </button>

            </div>

          </div>

        </section>
    )
  }


  // =========================================================
  // PAGE
  // =========================================================

  return (

      <section
          className="container py-4 py-md-5"
          style={{
            minHeight: 'calc(100vh - 75px)'
          }}
      >

        {/* =================================================
                PAGE HEADER
            ================================================= */}

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

          <div>

            <div className="d-flex align-items-center gap-2 mb-2">

              <i className="bi bi-bag-check-fill text-success fs-4" />

              <span
                  className="text-success fw-semibold text-uppercase"
                  style={{
                    fontSize: '0.8rem',
                    letterSpacing: '1px'
                  }}
              >
                            Orders
                        </span>

            </div>

            <h1 className="fw-bold mb-1">
              My Orders
            </h1>

            <p className="text-muted mb-0">
              View and track your orders
            </p>

          </div>


          <Link
              to="/marketplace"
              className="btn btn-success px-4"
          >
            <i className="bi bi-shop me-2" />
            Continue Shopping
          </Link>

        </div>


        {/* =================================================
                SEARCH + COUNT
            ================================================= */}

        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body p-3 p-md-4">

            <div className="row g-3 align-items-center">

              <div className="col-md-8">

                <div className="input-group">

                                <span className="input-group-text bg-white">
                                    <i className="bi bi-search text-muted" />
                                </span>

                  <input
                      type="text"
                      className="form-control"
                      placeholder="Search by order ID or status..."
                      value={search}
                      onChange={e =>
                          setSearch(e.target.value)
                      }
                  />

                </div>

              </div>


              <div className="col-md-4 text-md-end">

                            <span className="text-muted">

                                <strong className="text-dark">
                                    {filteredOrders.length}
                                </strong>

                              {' '}
                              order
                              {filteredOrders.length !== 1
                                  ? 's'
                                  : ''}

                            </span>

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
                ERROR
            ================================================= */}

        {error && (

            <div
                className="alert alert-danger d-flex align-items-center"
                role="alert"
            >

              <i className="bi bi-exclamation-triangle-fill me-2" />

              <div>
                {error}
              </div>

            </div>

        )}


        {/* =================================================
                EMPTY
            ================================================= */}

        {!error &&
            filteredOrders.length === 0 && (

                <div className="card border-0 shadow-sm">

                  <div className="card-body text-center py-5">

                    <div
                        className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                        style={{
                          width: '80px',
                          height: '80px'
                        }}
                    >

                      <i
                          className={
                            search
                                ? 'bi bi-search text-success'
                                : 'bi bi-bag-x text-success'
                          }
                          style={{
                            fontSize: '2rem'
                          }}
                      />

                    </div>


                    <h3 className="fw-semibold">

                      {search
                          ? 'No orders found'
                          : 'No orders yet'}

                    </h3>


                    <p className="text-muted mb-4">

                      {search
                          ? 'Try a different search term.'
                          : 'You have not placed any orders yet.'}

                    </p>


                    {!search && (

                        <Link
                            to="/marketplace"
                            className="btn btn-success px-4"
                        >

                          <i className="bi bi-shop me-2" />

                          Browse Products

                        </Link>

                    )}

                  </div>

                </div>

            )}


        {/* =================================================
                ORDERS LIST
            ================================================= */}

        {filteredOrders.length > 0 && (

            <div className="d-flex flex-column gap-4">

              {filteredOrders.map(order => {

                const orderId =
                    getOrderId(order)


                const orderItems =
                    Array.isArray(order.items)
                        ? order.items
                        : []


                return (

                    <div
                        className="card border-0 shadow-sm overflow-hidden"
                        key={orderId}
                    >

                      {/* =================================================
                                    ORDER HEADER
                                ================================================= */}

                      <div className="card-header bg-white border-bottom p-3 p-md-4">

                        <div className="row align-items-center g-3">

                          <div className="col-md-6">

                            <div className="d-flex align-items-center gap-3">

                              <div
                                  className="bg-success bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                                  style={{
                                    width: '48px',
                                    height: '48px'
                                  }}
                              >

                                <i className="bi bi-receipt text-success fs-4" />

                              </div>


                              <div>

                                <h5 className="fw-bold mb-1">
                                  Order #{orderId}
                                </h5>

                                <small className="text-muted">

                                  <i className="bi bi-calendar3 me-1" />

                                  {formatDate(
                                      order.createdAt
                                  )}

                                </small>

                              </div>

                            </div>

                          </div>


                          <div className="col-md-6">

                            <div className="d-flex justify-content-md-end flex-wrap gap-2">

                                                <span
                                                    className={`badge ${getStatusBadge(
                                                        order.status
                                                    )} px-3 py-2`}
                                                >

                                                    <i className="bi bi-box-seam me-1" />

                                                  {order.status ||
                                                      'PENDING'}

                                                </span>


                              <span
                                  className={`badge ${getPaymentBadge(
                                      order.paymentStatus
                                  )} px-3 py-2`}
                              >

                                                    <i className="bi bi-credit-card me-1" />

                                                    Payment:{' '}

                                {order.paymentStatus ||
                                    'PENDING'}

                                                </span>

                            </div>

                          </div>

                        </div>

                      </div>


                      {/* =================================================
                                    ORDER ITEMS
                                ================================================= */}

                      <div className="card-body p-0">

                        {orderItems.length > 0 ? (

                            orderItems.map(item => (

                                <div
                                    key={item.id}
                                    className="border-bottom p-3 p-md-4"
                                >

                                  <div className="row align-items-center g-3">

                                    {/* PRODUCT ICON */}

                                    <div className="col-auto">

                                      <div
                                          className="bg-light rounded-3 d-flex align-items-center justify-content-center overflow-hidden"
                                          style={{
                                            width: '58px',
                                            height: '58px'
                                          }}
                                      >

                                        {item.imageUrl ? (

                                            <img
                                                src={item.imageUrl}
                                                alt={
                                                    item.productName ||
                                                    'Product'
                                                }
                                                style={{
                                                  width: '100%',
                                                  height: '100%',
                                                  objectFit: 'cover'
                                                }}
                                            />

                                        ) : (

                                            <i className="bi bi-basket text-success fs-4" />

                                        )}

                                      </div>

                                    </div>


                                    {/* PRODUCT */}

                                    <div className="col">

                                      <h6 className="fw-semibold mb-1">

                                        {item.productName ||
                                            item.product?.name ||
                                            `Product #${
                                                item.productId ||
                                                item.id
                                            }`}

                                      </h6>


                                      <div className="small text-muted">

                                        Quantity:{' '}

                                        <strong className="text-dark">

                                          {item.quantity ??
                                              '—'}

                                          {item.unit
                                              ? ` ${item.unit}`
                                              : ''}

                                        </strong>

                                      </div>


                                      {/* ITEM STATUS */}

                                      {item.status && (

                                          <div className="small mt-2">

                                                                <span className="text-muted">
                                                                    Item Status:{' '}
                                                                </span>

                                            <span
                                                className={`badge ${getItemStatusBadge(
                                                    item.status
                                                )}`}
                                            >
                                                                    {item.status}
                                                                </span>

                                          </div>

                                      )}

                                    </div>


                                    {/* PRICE */}

                                    <div className="col-6 col-md-auto text-md-end">

                                      <div className="small text-muted">
                                        Price
                                      </div>

                                      <div className="fw-semibold">
                                        {formatAmount(
                                            item.price
                                        )}
                                      </div>

                                    </div>


                                    {/* ITEM TOTAL */}

                                    <div className="col-6 col-md-auto text-end">

                                      <div className="small text-muted">
                                        Item Total
                                      </div>

                                      <div className="fw-bold text-success">

                                        {formatAmount(
                                            getItemTotal(
                                                item
                                            )
                                        )}

                                      </div>

                                    </div>

                                  </div>

                                </div>

                            ))

                        ) : (

                            <div className="p-4">

                              <p className="text-muted mb-0">

                                <i className="bi bi-info-circle me-2" />

                                No item information available.

                              </p>

                            </div>

                        )}

                      </div>


                      {/* =================================================
                                    ORDER FOOTER
                                ================================================= */}

                      <div className="card-footer bg-white p-3 p-md-4">

                        <div className="row align-items-center g-3">

                          <div className="col-md-6">

                            <small className="text-muted d-block">
                              Order Total
                            </small>

                            <span className="fs-4 fw-bold text-success">

                                                {formatAmount(
                                                    order.totalAmount
                                                )}

                                            </span>

                          </div>


                          <div className="col-md-6 text-md-end">

                            <button
                                type="button"
                                className="btn btn-outline-success px-4"
                                onClick={() =>
                                    setSelectedOrder(
                                        order
                                    )
                                }
                            >

                              <i className="bi bi-eye me-2" />

                              View Details

                            </button>

                          </div>

                        </div>

                      </div>

                    </div>

                )

              })}

            </div>

        )}


        {/* =================================================
                ORDER DETAILS MODAL
            ================================================= */}

        {selectedOrder && (

            <div
                className="modal show d-block"
                tabIndex="-1"
                role="dialog"
                style={{
                  backgroundColor:
                      'rgba(0, 0, 0, 0.55)'
                }}
                onClick={() =>
                    setSelectedOrder(null)
                }
            >

              <div
                  className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
                  role="document"
                  onClick={e =>
                      e.stopPropagation()
                  }
              >

                <div className="modal-content border-0 shadow-lg">


                  {/* =================================================
                                MODAL HEADER
                            ================================================= */}

                  <div className="modal-header">

                    <div>

                      <h5 className="modal-title fw-bold">

                        <i className="bi bi-receipt text-success me-2" />

                        Order #{getOrderId(
                          selectedOrder
                      )}

                      </h5>


                      <small className="text-muted">

                        {formatDate(
                            selectedOrder.createdAt
                        )}

                      </small>

                    </div>


                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={() =>
                            setSelectedOrder(null)
                        }
                    />

                  </div>


                  {/* =================================================
                                MODAL BODY
                            ================================================= */}

                  <div className="modal-body">


                    {/* STATUS CARDS */}

                    <div className="row g-3 mb-4">

                      <div className="col-md-6">

                        <div className="border rounded-3 p-3 h-100">

                          <small className="text-muted d-block mb-2">
                            Order Status
                          </small>

                          <span
                              className={`badge ${getStatusBadge(
                                  selectedOrder.status
                              )} px-3 py-2`}
                          >
                                                {selectedOrder.status ||
                                                    'PENDING'}
                                            </span>

                        </div>

                      </div>


                      <div className="col-md-6">

                        <div className="border rounded-3 p-3 h-100">

                          <small className="text-muted d-block mb-2">
                            Payment Status
                          </small>

                          <span
                              className={`badge ${getPaymentBadge(
                                  selectedOrder.paymentStatus
                              )} px-3 py-2`}
                          >

                                                <i className="bi bi-credit-card me-1" />

                            {selectedOrder.paymentStatus ||
                                'PENDING'}

                                            </span>

                        </div>

                      </div>

                    </div>


                    {/* DELIVERY ADDRESS */}

                    <div className="mb-4">

                      <h6 className="fw-bold mb-3">

                        <i className="bi bi-geo-alt text-success me-2" />

                        Delivery Address

                      </h6>


                      <div className="bg-light rounded-3 p-3">

                        <p className="mb-0">

                          {selectedOrder.deliveryAddress ||
                              'No delivery address available.'}

                        </p>

                      </div>

                    </div>


                    {/* NOTES */}

                    {selectedOrder.notes && (

                        <div className="mb-4">

                          <h6 className="fw-bold mb-3">

                            <i className="bi bi-chat-left-text text-success me-2" />

                            Notes

                          </h6>


                          <div className="bg-light rounded-3 p-3">

                            <p className="mb-0">

                              {selectedOrder.notes}

                            </p>

                          </div>

                        </div>

                    )}


                    {/* ORDER ITEMS */}

                    <div className="mb-3">

                      <h6 className="fw-bold mb-3">

                        <i className="bi bi-basket text-success me-2" />

                        Order Items

                      </h6>


                      <div className="border rounded-3 overflow-hidden">

                        {Array.isArray(
                            selectedOrder.items
                        ) &&
                        selectedOrder.items.length > 0 ? (

                            selectedOrder.items.map(item => (

                                <div
                                    key={item.id}
                                    className="p-3 border-bottom"
                                >

                                  <div className="row align-items-center g-3">

                                    <div className="col">

                                      <h6 className="fw-semibold mb-1">

                                        {item.productName ||
                                            item.product?.name ||
                                            `Product #${
                                                item.productId ||
                                                item.id
                                            }`}

                                      </h6>


                                      <small className="text-muted">

                                        Quantity:{' '}

                                        {item.quantity ??
                                            '—'}

                                        {item.unit
                                            ? ` ${item.unit}`
                                            : ''}

                                      </small>


                                      {/* ITEM STATUS */}

                                      {item.status && (

                                          <div className="mt-2">

                                                                    <span className="small text-muted me-2">
                                                                        Status:
                                                                    </span>

                                            <span
                                                className={`badge ${getItemStatusBadge(
                                                    item.status
                                                )}`}
                                            >
                                                                        {item.status}
                                                                    </span>

                                          </div>

                                      )}

                                    </div>


                                    <div className="col-auto text-end">

                                      <small className="text-muted d-block">

                                        {formatAmount(
                                            item.price
                                        )}{' '}
                                        each

                                      </small>


                                      <strong className="text-success">

                                        {formatAmount(
                                            getItemTotal(
                                                item
                                            )
                                        )}

                                      </strong>

                                    </div>

                                  </div>

                                </div>

                            ))

                        ) : (

                            <div className="p-3">

                              <p className="text-muted mb-0">
                                No item information available.
                              </p>

                            </div>

                        )}

                      </div>

                    </div>

                  </div>


                  {/* =================================================
                                MODAL FOOTER
                            ================================================= */}

                  <div className="modal-footer bg-light">

                    <div className="w-100 d-flex justify-content-between align-items-center">

                      <div>

                        <small className="text-muted d-block">
                          Total Amount
                        </small>

                        <strong className="fs-4 text-success">

                          {formatAmount(
                              selectedOrder.totalAmount
                          )}

                        </strong>

                      </div>


                      <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() =>
                              setSelectedOrder(null)
                          }
                      >
                        Close
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            </div>

        )}

      </section>
  )
}