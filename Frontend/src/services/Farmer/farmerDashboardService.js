import api from '../api.js'

// =========================================================
// GET FARMER DASHBOARD
// =========================================================

export const getFarmerDashboard = async () => {
    const response = await api.get('/farmer/dashboard')

    return response.data
}