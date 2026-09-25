import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

import {
    getCart,
    updateCartItem,
    removeCartItem
} from '../services/cartService'

import {
    createPaymentOrder,
    createCodOrder,
    verifyPayment
} from '../services/paymentService'


export default function ConsumerCart() {

    const { user } = useContext(AuthContext)
    const navigate = useNavigate()

    const [cart, setCart] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [processingPayment, setProcessingPayment] =
        useState(false)

    // Checkout form
    const [deliveryAddress, setDeliveryAddress] =
        useState(user?.location || '')

    const [notes, setNotes] = useState('')

    // Payment method
    const [paymentMethod, setPaymentMethod] =
        useState('ONLINE')


    // =========================================================
    // LOAD CART
    // =========================================================

    const loadCart = async () => {

        try {

            setLoading(true)
            setError('')

            const data = await getCart()

            setCart(data)

        } catch (err) {

            console.error(
                'Unable to load cart:',
                err
            )

            setError(
                err.response?.data?.message ||
                'Unable to load your cart.'
            )

        } finally {

            setLoading(false)

        }
    }


    useEffect(() => {

        if (!user) {

            navigate('/login', {
                state: {
                    from: '/consumer/cart',
                    message:
                        'Please log in to view your cart.'
                }
            })

            return
        }


        if (user.role !== 'CONSUMER') {

            setError(
                'Only consumers can use the cart.'
            )

            setLoading(false)

            return
        }


        // Pre-fill saved location if available
        setDeliveryAddress(
            user.location || ''
        )

        loadCart()

    }, [user])


    // =========================================================
    // QUANTITY
    // =========================================================

    const handleQuantityChange = async (
        item,
        newQuantity
    ) => {

        // Allow the user to temporarily clear the input
        if (newQuantity === '') {
            return
        }

        const quantity = Number(newQuantity)


        // If quantity becomes 0, remove the item
        if (quantity === 0) {

            try {

                const updatedCart =
                    await removeCartItem(item.id)

                setCart(updatedCart)

            } catch (err) {

                console.error(
                    'Unable to remove item:',
                    err
                )

                alert(
                    err.response?.data?.message ||
                    'Unable to remove item.'
                )

                loadCart()
            }

            return
        }


        // Reject negative values
        if (quantity < 0) {
            return
        }


        try {

            const updatedCart =
                await updateCartItem(
                    item.id,
                    quantity
                )

            setCart(updatedCart)

        } catch (err) {

            console.error(
                'Unable to update cart:',
                err
            )

            alert(
                err.response?.data?.message ||
                'Unable to update quantity.'
            )

            loadCart()
        }
    }


    // =========================================================
    // REMOVE ITEM
    // =========================================================

    const handleRemove = async itemId => {

        try {

            const updatedCart =
                await removeCartItem(itemId)

            setCart(updatedCart)

        } catch (err) {

            console.error(
                'Unable to remove item:',
                err
            )

            alert(
                err.response?.data?.message ||
                'Unable to remove item.'
            )
        }
    }


    // =========================================================
    // PAYMENT / COD
    // =========================================================

    const handlePayment = async () => {

        // Check cart
        if (!cart?.items?.length) {

            alert(
                'Your cart is empty.'
            )

            return
        }


        // Check delivery address
        if (!deliveryAddress.trim()) {

            alert(
                'Please enter your delivery address.'
            )

            return
        }


        try {

            setProcessingPayment(true)
            setError('')


            // =================================================
            // CASH ON DELIVERY
            // =================================================

            if (paymentMethod === 'COD') {

                const codOrder =
                    await createCodOrder({
                        deliveryAddress:
                            deliveryAddress.trim(),

                        notes:
                            notes.trim()
                    })


                console.log(
                    'COD order response:',
                    codOrder
                )


                alert(
                    codOrder.message ||
                    'COD order placed successfully!'
                )


                navigate(
                    '/consumer/orders',
                    {
                        replace: true
                    }
                )

                return
            }


            // =================================================
            // ONLINE PAYMENT - RAZORPAY
            // =================================================

            // Check Razorpay only for online payment
            if (!window.Razorpay) {

                alert(
                    'Razorpay Checkout failed to load. Please refresh the page.'
                )

                setProcessingPayment(false)

                return
            }


            /*
             * 1. Create internal pending order
             *    + Razorpay order
             *    + pending payment
             *
             * Send the address and notes
             * entered by the consumer.
             */

            const paymentOrder =
                await createPaymentOrder({

                    deliveryAddress:
                        deliveryAddress.trim(),

                    notes:
                        notes.trim()
                })


            /*
             * 2. Configure Razorpay
             */

            const options = {

                key:
                paymentOrder.razorpayKeyId,

                amount:
                    Math.round(
                        Number(
                            paymentOrder.amount
                        ) * 100
                    ),

                currency:
                paymentOrder.currency,

                name:
                    'KrishiAI',

                description:
                    'Agricultural marketplace order',

                order_id:
                paymentOrder.razorpayOrderId,


                prefill: {

                    name:
                        user?.name || '',

                    email:
                        user?.email || '',

                    contact:
                        user?.phone || ''
                },


                notes: {

                    krishiOrderId:
                        String(
                            paymentOrder.orderId
                        )
                },


                theme: {

                    color:
                        '#198754'
                },


                /*
                 * 3. Successful payment
                 */

                handler:
                    async function (response) {

                        try {

                            console.log(
                                'Razorpay success response:',
                                response
                            )


                            /*
                             * 4. Verify payment
                             *    on Spring Boot
                             */

                            const verification =
                                await verifyPayment({

                                    razorpayOrderId:
                                    response.razorpay_order_id,

                                    razorpayPaymentId:
                                    response.razorpay_payment_id,

                                    razorpaySignature:
                                    response.razorpay_signature
                                })


                            console.log(
                                'Payment verification response:',
                                verification
                            )


                            alert(
                                verification?.message ||
                                'Payment successful! Your order has been confirmed.'
                            )


                            navigate(
                                '/consumer/orders',
                                {
                                    replace: true
                                }
                            )

                        } catch (err) {

                            console.error(
                                'Payment verification failed:',
                                err
                            )


                            alert(
                                err.response?.data?.message ||
                                err.message ||
                                'Payment verification failed.'
                            )

                        } finally {

                            setProcessingPayment(
                                false
                            )
                        }
                    }
            }


            /*
             * 5. Create Razorpay instance
             */

            const razorpay =
                new window.Razorpay(
                    options
                )


            /*
             * 6. Payment failure
             */

            razorpay.on(
                'payment.failed',
                response => {

                    console.error(
                        'Razorpay payment failed:',
                        response
                    )


                    alert(
                        response.error?.description ||
                        'Payment failed. Please try again.'
                    )


                    setProcessingPayment(
                        false
                    )
                }
            )


            /*
             * 7. Payment modal dismissed
             */

            options.modal = {

                ondismiss: function () {

                    setProcessingPayment(
                        false
                    )
                }
            }


            /*
             * 8. Open Razorpay
             */

            razorpay.open()

        } catch (err) {

            console.error(
                'Unable to start checkout:',
                err
            )


            alert(
                err.response?.data?.message ||
                err.message ||
                'Unable to place the order.'
            )


            setProcessingPayment(
                false
            )
        }
    }


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <section className="container py-5 text-center">

                <div
                    className="spinner-border text-success"
                    role="status"
                >
                    <span className="visually-hidden">
                        Loading...
                    </span>
                </div>

                <p className="mt-3 text-muted">
                    Loading cart...
                </p>

            </section>
        )
    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error) {

        return (

            <section className="container py-5">

                <div className="alert alert-danger">
                    {error}
                </div>

            </section>
        )
    }


    const items =
        cart?.items || []


    const total =
        Number(
            cart?.totalAmount || 0
        )


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <section
            className="container py-5"
            style={{
                minHeight:
                    'calc(100vh - 75px)'
            }}
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-4">

                <p
                    className="text-success fw-semibold text-uppercase mb-2"
                    style={{
                        letterSpacing: '1px'
                    }}
                >
                    Shopping Cart
                </p>


                <h1 className="fw-bold mb-1">
                    Your Cart
                </h1>


                <p className="text-muted mb-0">
                    Review your products and enter delivery details before payment.
                </p>

            </div>


            {/* =================================================
                EMPTY CART
            ================================================= */}

            {!items.length ? (

                <div className="card border-0 shadow-sm">

                    <div className="card-body text-center py-5">

                        <i
                            className="bi bi-cart3 text-success"
                            style={{
                                fontSize: '4rem'
                            }}
                        />


                        <h3 className="mt-3">
                            Your cart is empty
                        </h3>


                        <p className="text-muted">
                            Add products from the marketplace to continue.
                        </p>


                        <button
                            className="btn btn-success px-4"
                            onClick={() =>
                                navigate(
                                    '/marketplace'
                                )
                            }
                        >

                            <i
                                className="bi bi-shop me-2"
                            />

                            Browse Marketplace

                        </button>

                    </div>

                </div>

            ) : (

                <div className="row g-4">

                    {/* =================================================
                        LEFT SIDE
                    ================================================= */}

                    <div className="col-lg-8">


                        {/* =================================================
                            CART ITEMS
                        ================================================= */}

                        <div className="card border-0 shadow-sm mb-4">

                            <div className="card-header bg-white py-3">

                                <div className="d-flex justify-content-between align-items-center">

                                    <h5 className="mb-0 fw-semibold">

                                        <i
                                            className="bi bi-basket text-success me-2"
                                        />

                                        Cart Items

                                    </h5>


                                    <span className="badge bg-success">

                                        {items.length}{' '}

                                        {items.length === 1
                                            ? 'Item'
                                            : 'Items'}

                                    </span>

                                </div>

                            </div>


                            <div className="card-body p-0">

                                {items.map(item => {

                                    const product =
                                        item.product || {}


                                    /*
                                     * Backend may return either:
                                     *
                                     * item.subtotal
                                     *
                                     * or
                                     *
                                     * item.itemTotal
                                     *
                                     * or flattened product fields.
                                     */

                                    const itemTotal =
                                        Number(
                                            item.itemTotal ??
                                            item.subtotal ??
                                            (
                                                Number(
                                                    item.price ??
                                                    product.price ??
                                                    0
                                                ) *
                                                Number(
                                                    item.quantity || 0
                                                )
                                            )
                                        )


                                    const productName =
                                        item.productName ||
                                        product.name ||
                                        `Product #${
                                            item.productId ||
                                            item.id
                                        }`


                                    const productPrice =
                                        Number(
                                            item.price ??
                                            product.price ??
                                            0
                                        )


                                    const productUnit =
                                        item.unit ||
                                        product.unit ||
                                        ''


                                    const productLocation =
                                        item.location ||
                                        product.location ||
                                        ''


                                    const imageUrl =
                                        item.imageUrl ||
                                        product.imageUrl


                                    return (

                                        <div
                                            key={item.id}
                                            className="p-3 p-md-4 border-bottom"
                                        >

                                            <div className="row align-items-center g-3">


                                                {/* Product Image */}

                                                <div className="col-3 col-md-2">

                                                    <div
                                                        className="bg-light rounded-3 d-flex align-items-center justify-content-center overflow-hidden"
                                                        style={{
                                                            height: '90px'
                                                        }}
                                                    >

                                                        {imageUrl ? (

                                                            <img
                                                                src={imageUrl}
                                                                alt={productName}
                                                                className="img-fluid w-100 h-100"
                                                                style={{
                                                                    objectFit:
                                                                        'cover'
                                                                }}
                                                            />

                                                        ) : (

                                                            <i
                                                                className="bi bi-image text-secondary"
                                                                style={{
                                                                    fontSize:
                                                                        '2rem'
                                                                }}
                                                            />

                                                        )}

                                                    </div>

                                                </div>


                                                {/* Product Information */}

                                                <div className="col-9 col-md-4">

                                                    <h5 className="fw-semibold mb-1">
                                                        {productName}
                                                    </h5>


                                                    <p className="text-success mb-1">

                                                        ₹
                                                        {productPrice.toFixed(2)}

                                                        {productUnit
                                                            ? ` / ${productUnit}`
                                                            : ''}

                                                    </p>


                                                    {productLocation && (

                                                        <p className="small text-muted mb-0">

                                                            <i
                                                                className="bi bi-geo-alt me-1"
                                                            />

                                                            {productLocation}

                                                        </p>

                                                    )}

                                                </div>


                                                {/* Quantity */}

                                                <div className="col-6 col-md-3">

                                                    <label
                                                        className="form-label small fw-semibold"
                                                    >
                                                        Quantity
                                                    </label>


                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.quantity}
                                                        onChange={event =>
                                                            handleQuantityChange(
                                                                item,
                                                                event.target.value
                                                            )
                                                        }
                                                    />

                                                </div>


                                                {/* Item Total */}

                                                <div className="col-5 col-md-2 text-md-end">

                                                    <small className="text-muted d-block">
                                                        Total
                                                    </small>


                                                    <strong className="text-success">

                                                        ₹
                                                        {itemTotal.toFixed(2)}

                                                    </strong>

                                                </div>


                                                {/* Delete */}

                                                <div className="col-1 text-end">

                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger btn-sm"
                                                        title="Remove item"
                                                        onClick={() =>
                                                            handleRemove(
                                                                item.id
                                                            )
                                                        }
                                                    >

                                                        <i className="bi bi-trash" />

                                                    </button>

                                                </div>

                                            </div>

                                        </div>
                                    )
                                })}

                            </div>

                        </div>


                        {/* =================================================
                            DELIVERY DETAILS
                        ================================================= */}

                        <div className="card border-0 shadow-sm">

                            <div className="card-header bg-white py-3">

                                <h5 className="mb-0 fw-semibold">

                                    <i
                                        className="bi bi-truck text-success me-2"
                                    />

                                    Delivery Details

                                </h5>

                            </div>


                            <div className="card-body p-4">


                                {/* Address */}

                                <div className="mb-4">

                                    <label
                                        htmlFor="deliveryAddress"
                                        className="form-label fw-semibold"
                                    >

                                        Delivery Address

                                        <span className="text-danger">
                                            {' '}*
                                        </span>

                                    </label>


                                    <textarea
                                        id="deliveryAddress"
                                        className="form-control"
                                        rows="4"
                                        placeholder="Enter your complete delivery address..."
                                        value={
                                            deliveryAddress
                                        }
                                        onChange={event =>
                                            setDeliveryAddress(
                                                event.target.value
                                            )
                                        }
                                        required
                                    />


                                    <div className="form-text">

                                        Please provide a complete address including
                                        house/door number, street, city and PIN code.

                                    </div>

                                </div>


                                {/* Notes */}

                                <div className="mb-2">

                                    <label
                                        htmlFor="orderNotes"
                                        className="form-label fw-semibold"
                                    >

                                        Order Notes

                                        <span className="text-muted fw-normal">
                                            {' '}(Optional)
                                        </span>

                                    </label>


                                    <textarea
                                        id="orderNotes"
                                        className="form-control"
                                        rows="3"
                                        placeholder="Example: Please deliver in the morning..."
                                        value={notes}
                                        onChange={event =>
                                            setNotes(
                                                event.target.value
                                            )
                                        }
                                    />


                                    <div className="form-text">

                                        Add any special instructions for your order.

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        RIGHT SIDE
                    ================================================= */}

                    <div className="col-lg-4">


                        {/* =================================================
                            ORDER SUMMARY
                        ================================================= */}

                        <div
                            className="card border-0 shadow-sm sticky-top"
                            style={{
                                top: '90px'
                            }}
                        >

                            <div className="card-body p-4">

                                <h4 className="fw-bold mb-4">
                                    Order Summary
                                </h4>


                                {/* Items */}

                                <div className="d-flex justify-content-between mb-3">

                                    <span className="text-muted">
                                        Items
                                    </span>


                                    <span className="fw-semibold">
                                        {items.length}
                                    </span>

                                </div>


                                {/* Total */}

                                <hr />


                                <div className="d-flex justify-content-between align-items-center mb-4">

                                    <strong>
                                        Total
                                    </strong>


                                    <strong className="text-success fs-3">

                                        ₹
                                        {total.toFixed(2)}

                                    </strong>

                                </div>


                                {/* Address reminder */}

                                <div
                                    className={
                                        `alert ${
                                            deliveryAddress.trim()
                                                ? 'alert-success'
                                                : 'alert-warning'
                                        } small`
                                    }
                                >

                                    <i
                                        className={
                                            `bi ${
                                                deliveryAddress.trim()
                                                    ? 'bi-check-circle'
                                                    : 'bi-exclamation-circle'
                                            } me-2`
                                        }
                                    />


                                    {deliveryAddress.trim()
                                        ? 'Delivery address added.'
                                        : 'Please enter your delivery address.'}

                                </div>


                                {/* =================================================
                                    PAYMENT METHOD
                                ================================================= */}

                                <div className="mb-4">

                                    <label className="form-label fw-semibold">
                                        Payment Method
                                    </label>


                                    <div className="border rounded p-3">


                                        {/* ONLINE PAYMENT */}

                                        <div className="form-check mb-3">

                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="paymentMethod"
                                                id="onlinePayment"
                                                value="ONLINE"
                                                checked={
                                                    paymentMethod === 'ONLINE'
                                                }
                                                onChange={event =>
                                                    setPaymentMethod(
                                                        event.target.value
                                                    )
                                                }
                                                disabled={
                                                    processingPayment
                                                }
                                            />


                                            <label
                                                className="form-check-label"
                                                htmlFor="onlinePayment"
                                            >

                                                <span className="fw-semibold">
                                                    Online Payment
                                                </span>


                                                <div className="small text-muted mt-1">

                                                    <i className="bi bi-credit-card me-1" />

                                                    Pay securely using Razorpay

                                                </div>

                                            </label>

                                        </div>


                                        {/* CASH ON DELIVERY */}

                                        <div className="form-check">

                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="paymentMethod"
                                                id="codPayment"
                                                value="COD"
                                                checked={
                                                    paymentMethod === 'COD'
                                                }
                                                onChange={event =>
                                                    setPaymentMethod(
                                                        event.target.value
                                                    )
                                                }
                                                disabled={
                                                    processingPayment
                                                }
                                            />


                                            <label
                                                className="form-check-label"
                                                htmlFor="codPayment"
                                            >

                                                <span className="fw-semibold">
                                                    Cash on Delivery
                                                </span>


                                                <div className="small text-muted mt-1">

                                                    <i className="bi bi-cash-stack me-1" />

                                                    Pay when your order is delivered

                                                </div>

                                            </label>

                                        </div>

                                    </div>

                                </div>


                                {/* =================================================
                                    CHECKOUT BUTTON
                                ================================================= */}

                                <button
                                    type="button"
                                    className="btn btn-success w-100 py-2"
                                    onClick={
                                        handlePayment
                                    }
                                    disabled={
                                        processingPayment ||
                                        !deliveryAddress.trim()
                                    }
                                >

                                    {processingPayment ? (

                                        <>

                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            />

                                            Processing...

                                        </>

                                    ) : paymentMethod === 'COD' ? (

                                        <>

                                            <i
                                                className="bi bi-box-seam me-2"
                                            />

                                            Place COD Order

                                        </>

                                    ) : (

                                        <>

                                            <i
                                                className="bi bi-credit-card me-2"
                                            />

                                            Pay ₹
                                            {total.toFixed(2)}

                                        </>

                                    )}

                                </button>


                                {/* Continue Shopping */}

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary w-100 mt-2"
                                    onClick={() =>
                                        navigate(
                                            '/marketplace'
                                        )
                                    }
                                    disabled={
                                        processingPayment
                                    }
                                >

                                    <i
                                        className="bi bi-arrow-left me-2"
                                    />

                                    Continue Shopping

                                </button>


                                {/* =================================================
                                    PAYMENT INFORMATION
                                ================================================= */}

                                <div className="text-center mt-4">

                                    <small className="text-muted">

                                        {paymentMethod === 'ONLINE' ? (

                                            <>

                                                <i
                                                    className="bi bi-shield-check text-success me-1"
                                                />

                                                Secure payment powered by Razorpay

                                            </>

                                        ) : (

                                            <>

                                                <i
                                                    className="bi bi-cash-stack text-success me-1"
                                                />

                                                Pay cash when your order is delivered

                                            </>

                                        )}

                                    </small>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>
            )}

        </section>
    )
}