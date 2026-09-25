import api from './api'

export const getOrders = async () => {
  const response = await api.get('/orders/my')
  return response.data
}

export const getOrder = async orderId => {
  const response = await api.get(`/orders/${orderId}`)
  return response.data
}