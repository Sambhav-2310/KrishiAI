import api from './api'

export const getCategories = async () => {
    const response = await api.get('/categories')

    return Array.isArray(response.data)
        ? response.data
        : []
}