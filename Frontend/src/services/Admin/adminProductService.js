import api from '../api.js'

export const getAdminProducts = async () => {
    const response = await api.get('/admin/products')
    return response.data
}