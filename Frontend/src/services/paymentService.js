import api from './api'

export const createPaymentOrder = async ({
                                             deliveryAddress,
                                             notes
                                         }) => {
    const response = await api.post(
        '/payment/create-order',
        {
            deliveryAddress,
            notes
        }
    )

    return response.data
}


// =========================================================
// CREATE COD ORDER
// =========================================================

export const createCodOrder = async ({
                                         deliveryAddress,
                                         notes
                                     }) => {
    const response = await api.post(
        '/payment/cod',
        {
            deliveryAddress,
            notes
        }
    )

    return response.data
}


// =========================================================
// VERIFY RAZORPAY PAYMENT
// =========================================================

export const verifyPayment = async ({
                                        razorpayOrderId,
                                        razorpayPaymentId,
                                        razorpaySignature
                                    }) => {
    const response = await api.post(
        '/payment/verify',
        {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        }
    )

    return response.data
}