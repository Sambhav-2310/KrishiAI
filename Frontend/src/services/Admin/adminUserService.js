import api from '../api.js'

export const getAdminUsers = async () => {
    const response = await api.get('/admin/users')
    return response.data
}

export const updateAdminUserStatus = async (userId, status) => {
    const response = await api.put(
        `/admin/users/${userId}/status`,
        { status }
    )
    return response.data
}