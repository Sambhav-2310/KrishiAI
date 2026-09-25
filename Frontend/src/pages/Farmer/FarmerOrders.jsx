import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    getFarmerOrders,
    updateFarmerOrderItemStatus
} from '../../services/Farmer/farmerOrderService'

export default function FarmerOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [updatingItem, setUpdatingItem] = useState(null)

    useEffect(() => {
        loadOrders()
    }, [])

    const loadOrders = async () => {
        try {
            setLoading(true)
            setError('')

            const data = await getFarmerOrders()

            setOrders(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Failed to load farmer orders:', err)

            setError(
                err?.response?.data?.message ||
                'Unable to load your orders.'
            )
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (itemId, status) => {
        try {
            setUpdatingItem(itemId)
            setError('')

            await updateFarmerOrderItemStatus(
                itemId,
                status
            )

            await loadOrders()
        } catch (err) {
            console.error(
                'Failed to update order item status:',
                err
            )

            setError(
                err?.response?.data?.message ||
                'Unable to update order status.'
            )
        } finally {
            setUpdatingItem(null)
        }
    }

    const formatCurrency = amount => {
        return Number(amount || 0).toLocaleString(
            'en-IN',
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )
    }

    const formatDate = date => {
        if (!date) {
            return '—'
        }

        return new Date(date).toLocaleString(
            'en-IN',
            {
                dateStyle: 'medium',
                timeStyle: 'short'
            }
        )
    }

    // =========================================================
    // ORDER STATUS BADGE
    // =========================================================

    const getOrderStatusBadge = status => {
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
    // ITEM STATUS BADGE
    // =========================================================

    const getItemStatusBadge = status => {
        switch (status) {
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
    // PAYMENT METHOD
    // =========================================================

    const getPaymentMethodBadge = paymentMethod => {
        if (paymentMethod === 'COD') {
            return (
                <span className="badge text-bg-warning text-dark">
                    <i className="bi bi-cash-stack me-1"></i>
                    Cash on Delivery
                </span>
            )
        }

        if (paymentMethod === 'ONLINE') {
            return (
                <span className="badge text-bg-primary">
                    <i className="bi bi-credit-card me-1"></i>
                    Online Payment
                </span>
            )
        }

        return (
            <span className="badge text-bg-secondary">
                {paymentMethod || 'Unknown'}
            </span>
        )
    }

    // =========================================================
    // PAYMENT STATUS
    // =========================================================

    const getPaymentStatusBadge = paymentStatus => {
        switch (paymentStatus) {
            case 'PAID':
                return (
                    <span className="badge text-bg-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Paid
                    </span>
                )

            case 'PENDING':
                return (
                    <span className="badge text-bg-warning text-dark">
                        <i className="bi bi-clock me-1"></i>
                        Payment Pending
                    </span>
                )

            case 'FAILED':
                return (
                    <span className="badge text-bg-danger">
                        Payment Failed
                    </span>
                )

            case 'REFUNDED':
                return (
                    <span className="badge text-bg-secondary">
                        Refunded
                    </span>
                )

            default:
                return (
                    <span className="badge text-bg-secondary">
                        {paymentStatus || 'Unknown'}
                    </span>
                )
        }
    }

    // =========================================================
    // NEXT ALLOWED STATUSES
    // =========================================================

    const getNextStatuses = status => {
        switch (status) {
            case 'CONFIRMED':
                return [
                    'PROCESSING',
                    'CANCELLED'
                ]

            case 'PROCESSING':
                return [
                    'SHIPPED',
                    'CANCELLED'
                ]

            case 'SHIPPED':
                return [
                    'DELIVERED',
                    'CANCELLED'
                ]

            default:
                return []
        }
    }

    // =========================================================
    // DELIVERY CHECK
    // =========================================================

    const canMarkDelivered = order => {
        if (!order) {
            return false
        }

        // COD can be delivered because cash is collected
        // at delivery. Backend will mark payment as PAID.
        if (order.paymentMethod === 'COD') {
            return true
        }

        // Online payment must already be PAID.
        if (order.paymentMethod === 'ONLINE') {
            return order.paymentStatus === 'PAID'
        }

        return false
    }

    // =========================================================
    // DELIVERY ACTION LABEL
    // =========================================================

    const getDeliveryActionLabel = order => {
        if (order.paymentMethod === 'COD') {
            return (
                <>
                    <i className="bi bi-cash-coin me-2"></i>
                    Collect Cash & Mark Delivered
                </>
            )
        }

        if (
            order.paymentMethod === 'ONLINE' &&
            order.paymentStatus === 'PAID'
        ) {
            return (
                <>
                    <i className="bi bi-check2-circle me-2"></i>
                    Mark as Delivered
                </>
            )
        }

        return (
            <>
                <i className="bi bi-lock me-2"></i>
                Payment Pending
            </>
        )
    }

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <main className="container py-5">

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

            </main>
        )
    }

    // =========================================================
    // MAIN
    // =========================================================

    return (
        <main className="container py-5">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">

                <div>

                    <p className="text-success fw-semibold mb-1">
                        FARMER WORKSPACE
                    </p>

                    <h1 className="mb-1">
                        Farmer Orders
                    </h1>

                    <p className="text-muted mb-0">
                        Manage orders containing your products.
                    </p>

                </div>

                <div className="mt-3 mt-md-0">

                    <Link
                        to="/farmer/dashboard"
                        className="btn btn-outline-success"
                    >
                        <i className="bi bi-speedometer2 me-1"></i>
                        Dashboard
                    </Link>

                </div>

            </div>

            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (
                <div
                    className="alert alert-danger d-flex justify-content-between align-items-center"
                    role="alert"
                >

                    <div>
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                    </div>

                    <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={loadOrders}
                    >
                        Try Again
                    </button>

                </div>
            )}

            {/* =====================================================
                EMPTY STATE
            ===================================================== */}

            {!error && orders.length === 0 && (
                <div className="card border-0 shadow-sm">

                    <div className="card-body text-center py-5">

                        <i className="bi bi-bag-x display-4 text-muted"></i>

                        <h3 className="h5 mt-3">
                            No orders yet
                        </h3>

                        <p className="text-muted mb-4">
                            Orders containing your products will
                            appear here.
                        </p>

                        <Link
                            to="/farmer/products"
                            className="btn btn-success"
                        >
                            Manage Products
                        </Link>

                    </div>

                </div>
            )}

            {/* =====================================================
                ORDERS
            ===================================================== */}

            {!error && orders.length > 0 && (
                <div className="d-flex flex-column gap-4">

                    {orders.map(order => (

                        <div
                            key={order.orderId}
                            className="card border-0 shadow-sm"
                        >

                            {/* =================================================
                                ORDER HEADER
                            ================================================= */}

                            <div className="card-header bg-white border-bottom p-3">

                                <div className="row g-3 align-items-center">

                                    <div className="col-md-2">

                                        <div className="small text-muted">
                                            Order
                                        </div>

                                        <div className="fw-bold">
                                            #{order.orderId}
                                        </div>

                                    </div>

                                    <div className="col-md-3">

                                        <div className="small text-muted">
                                            Customer
                                        </div>

                                        <div className="fw-semibold">
                                            {order.consumerName || 'Customer'}
                                        </div>

                                        {order.consumerPhone && (
                                            <div className="small text-muted">
                                                <i className="bi bi-telephone me-1"></i>
                                                {order.consumerPhone}
                                            </div>
                                        )}

                                    </div>

                                    <div className="col-md-2">

                                        <div className="small text-muted">
                                            Order Status
                                        </div>

                                        <div className="mt-1">
                                            {getOrderStatusBadge(
                                                order.orderStatus
                                            )}
                                        </div>

                                    </div>

                                    <div className="col-md-2">

                                        <div className="small text-muted">
                                            Payment
                                        </div>

                                        <div className="mt-1">
                                            {getPaymentMethodBadge(
                                                order.paymentMethod
                                            )}
                                        </div>

                                        <div className="mt-1">
                                            {getPaymentStatusBadge(
                                                order.paymentStatus
                                            )}
                                        </div>

                                    </div>

                                    <div className="col-md-1">

                                        <div className="small text-muted">
                                            Earnings
                                        </div>

                                        <div className="fw-bold text-success">
                                            ₹{formatCurrency(
                                            order.farmerTotalAmount
                                        )}
                                        </div>

                                    </div>

                                    <div className="col-md-2">

                                        <div className="small text-muted">
                                            Ordered
                                        </div>

                                        <div className="small">
                                            {formatDate(order.createdAt)}
                                        </div>

                                    </div>

                                </div>

                            </div>

                            {/* =================================================
                                ORDER BODY
                            ================================================= */}

                            <div className="card-body">

                                {/* =============================================
                                    PAYMENT INFORMATION
                                ============================================= */}

                                <div className="alert alert-light border mb-4">

                                    <div className="d-flex flex-column flex-md-row justify-content-between gap-3">

                                        <div>
                                            <div className="small text-muted">
                                                Payment Method
                                            </div>

                                            <div className="fw-semibold mt-1">
                                                {order.paymentMethod === 'COD'
                                                    ? (
                                                        <>
                                                            <i className="bi bi-cash-stack text-warning me-2"></i>
                                                            Cash on Delivery
                                                        </>
                                                    )
                                                    : (
                                                        <>
                                                            <i className="bi bi-credit-card text-primary me-2"></i>
                                                            Online Payment
                                                        </>
                                                    )}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="small text-muted">
                                                Payment Status
                                            </div>

                                            <div className="mt-1">
                                                {getPaymentStatusBadge(
                                                    order.paymentStatus
                                                )}
                                            </div>
                                        </div>

                                        {order.paymentMethod === 'COD' &&
                                            order.paymentStatus === 'PENDING' && (
                                                <div className="text-warning-emphasis small d-flex align-items-center">
                                                    <i className="bi bi-info-circle me-2"></i>
                                                    Collect cash from the customer
                                                    when delivering the order.
                                                </div>
                                            )}

                                        {order.paymentMethod === 'ONLINE' &&
                                            order.paymentStatus === 'PENDING' && (
                                                <div className="text-danger small d-flex align-items-center">
                                                    <i className="bi bi-exclamation-circle me-2"></i>
                                                    Do not mark this order as
                                                    delivered until payment is completed.
                                                </div>
                                            )}

                                    </div>

                                </div>

                                {/* =============================================
                                    DELIVERY ADDRESS
                                ============================================= */}

                                <div className="mb-4">

                                    <div className="small text-muted mb-1">
                                        <i className="bi bi-geo-alt me-1"></i>
                                        Delivery Address
                                    </div>

                                    <div>
                                        {order.deliveryAddress ||
                                            'Address not available'}
                                    </div>

                                </div>

                                {/* =============================================
                                    ITEMS
                                ============================================= */}

                                <div className="table-responsive">

                                    <table className="table align-middle mb-0">

                                        <thead className="table-light">

                                        <tr>

                                            <th>
                                                Product
                                            </th>

                                            <th>
                                                Quantity
                                            </th>

                                            <th>
                                                Price
                                            </th>

                                            <th>
                                                Subtotal
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th className="text-end">
                                                Action
                                            </th>

                                        </tr>

                                        </thead>

                                        <tbody>

                                        {(order.items || []).map(item => {

                                            const nextStatuses =
                                                getNextStatuses(item.status)

                                            const isUpdating =
                                                updatingItem === item.itemId

                                            const deliveryBlocked =
                                                item.status === 'SHIPPED' &&
                                                !canMarkDelivered(order)

                                            return (
                                                <tr key={item.itemId}>

                                                    {/* PRODUCT */}

                                                    <td>

                                                        <div className="d-flex align-items-center gap-3">

                                                            <img
                                                                src={
                                                                    item.imageUrl ||
                                                                    'https://placehold.co/70x70?text=Product'
                                                                }
                                                                alt={item.productName}
                                                                className="rounded"
                                                                style={{
                                                                    width: '55px',
                                                                    height: '55px',
                                                                    objectFit: 'cover'
                                                                }}
                                                            />

                                                            <div>

                                                                <div className="fw-semibold">
                                                                    {item.productName}
                                                                </div>

                                                                <div className="small text-muted">
                                                                    {item.unit || ''}
                                                                </div>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* QUANTITY */}

                                                    <td>

                                                            <span className="fw-semibold">
                                                                {item.quantity}
                                                            </span>

                                                        {item.unit && (
                                                            <span className="text-muted ms-1">
                                                                    {item.unit}
                                                                </span>
                                                        )}

                                                    </td>

                                                    {/* PRICE */}

                                                    <td>
                                                        ₹{formatCurrency(item.price)}
                                                    </td>

                                                    {/* SUBTOTAL */}

                                                    <td>

                                                            <span className="fw-semibold">
                                                                ₹{formatCurrency(
                                                                item.subtotal
                                                            )}
                                                            </span>

                                                    </td>

                                                    {/* STATUS */}

                                                    <td>
                                                        {getItemStatusBadge(
                                                            item.status
                                                        )}
                                                    </td>

                                                    {/* ACTION */}

                                                    <td className="text-end">

                                                        {nextStatuses.length === 0 ? (

                                                            <span className="small text-muted">
                                                                    No actions
                                                                </span>

                                                        ) : (

                                                            <div className="dropdown">

                                                                <button
                                                                    className="btn btn-sm btn-outline-success dropdown-toggle"
                                                                    type="button"
                                                                    data-bs-toggle="dropdown"
                                                                    disabled={isUpdating}
                                                                >

                                                                    {isUpdating ? (
                                                                        <>
                                                                                <span
                                                                                    className="spinner-border spinner-border-sm me-1"
                                                                                    role="status"
                                                                                />

                                                                            Updating
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            Update Status
                                                                        </>
                                                                    )}

                                                                </button>

                                                                <ul className="dropdown-menu dropdown-menu-end">

                                                                    {nextStatuses.map(
                                                                        nextStatus => {

                                                                            const isDelivery =
                                                                                nextStatus === 'DELIVERED'

                                                                            const deliveryDisabled =
                                                                                isDelivery &&
                                                                                deliveryBlocked

                                                                            return (
                                                                                <li
                                                                                    key={nextStatus}
                                                                                >

                                                                                    <button
                                                                                        type="button"
                                                                                        className={
                                                                                            `dropdown-item ${
                                                                                                deliveryDisabled
                                                                                                    ? 'disabled text-muted'
                                                                                                    : ''
                                                                                            }`
                                                                                        }
                                                                                        disabled={
                                                                                            deliveryDisabled
                                                                                        }
                                                                                        onClick={() => {

                                                                                            if (
                                                                                                deliveryDisabled
                                                                                            ) {
                                                                                                return
                                                                                            }

                                                                                            handleStatusUpdate(
                                                                                                item.itemId,
                                                                                                nextStatus
                                                                                            )
                                                                                        }}
                                                                                    >

                                                                                        {nextStatus ===
                                                                                            'PROCESSING' && (
                                                                                                <>
                                                                                                    <i className="bi bi-box-seam me-2"></i>
                                                                                                    Start Processing
                                                                                                </>
                                                                                            )}

                                                                                        {nextStatus ===
                                                                                            'SHIPPED' && (
                                                                                                <>
                                                                                                    <i className="bi bi-truck me-2"></i>
                                                                                                    Mark as Shipped
                                                                                                </>
                                                                                            )}

                                                                                        {nextStatus ===
                                                                                            'DELIVERED' && (
                                                                                                <>
                                                                                                    {getDeliveryActionLabel(
                                                                                                        order
                                                                                                    )}
                                                                                                </>
                                                                                            )}

                                                                                        {nextStatus ===
                                                                                            'CANCELLED' && (
                                                                                                <>
                                                                                                    <i className="bi bi-x-circle me-2"></i>
                                                                                                    Cancel Item
                                                                                                </>
                                                                                            )}

                                                                                    </button>

                                                                                </li>
                                                                            )
                                                                        }
                                                                    )}

                                                                </ul>

                                                            </div>

                                                        )}

                                                    </td>

                                                </tr>
                                            )
                                        })}

                                        </tbody>

                                    </table>

                                </div>

                                {/* =============================================
                                    ONLINE PAYMENT WARNING
                                ============================================= */}

                                {order.paymentMethod === 'ONLINE' &&
                                    order.paymentStatus === 'PENDING' &&
                                    (order.items || []).some(
                                        item => item.status === 'SHIPPED'
                                    ) && (
                                        <div className="alert alert-warning mt-4 mb-0">

                                            <i className="bi bi-shield-exclamation me-2"></i>

                                            <strong>Payment pending.</strong>{' '}

                                            This order cannot be marked as
                                            delivered until the online payment
                                            is completed.

                                        </div>
                                    )}

                                {/* =============================================
                                    COD DELIVERY INFORMATION
                                ============================================= */}

                                {order.paymentMethod === 'COD' &&
                                    order.paymentStatus === 'PENDING' &&
                                    (order.items || []).some(
                                        item => item.status === 'SHIPPED'
                                    ) && (
                                        <div className="alert alert-success mt-4 mb-0">

                                            <i className="bi bi-cash-coin me-2"></i>

                                            <strong>COD order.</strong>{' '}

                                            Collect ₹
                                            {formatCurrency(
                                                order.orderTotalAmount
                                            )}{' '}
                                            from the customer when delivering.

                                        </div>
                                    )}

                                {/* =============================================
                                    NOTES
                                ============================================= */}

                                {order.notes && (
                                    <div className="alert alert-light border mt-4 mb-0">

                                        <div className="small fw-semibold mb-1">
                                            <i className="bi bi-chat-left-text me-1"></i>
                                            Customer Notes
                                        </div>

                                        <div className="small">
                                            {order.notes}
                                        </div>

                                    </div>
                                )}

                            </div>

                        </div>

                    ))}

                </div>
            )}

        </main>
    )
}