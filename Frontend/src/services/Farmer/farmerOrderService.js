import api from '../api'

export const getFarmerOrders = async () => {
    const response = await api.get('/orders/farmer')

    return Array.isArray(response.data)
        ? response.data
        : []
}

export const updateFarmerOrderItemStatus = async (
    itemId,
    status
) => {
    const response = await api.put(
        `/orders/items/${itemId}/status`,
        {
            status
        }
    )

    return response.data
}