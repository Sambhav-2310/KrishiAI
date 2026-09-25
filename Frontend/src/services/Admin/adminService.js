import api from '../api.js'

export const getAdminDashboard = async () => {
    const response = await api.get('/admin/dashboard')
    return response.data
}

export const getAdminReport = async (from, to) => {
    let url = "/admin/reports";

    if (from && to) {
        url += `?from=${from}&to=${to}`;
    }

    const response = await api.get(url);

    return response.data;
}


// =========================
// CATEGORY MANAGEMENT
// =========================

// GET ALL CATEGORIES FOR ADMIN
// Includes ACTIVE + INACTIVE
export const getCategories = async () => {
    const response = await api.get("/categories/admin");
    return response.data;
};


// CREATE CATEGORY
export const createCategory = async (categoryData) => {
    const response = await api.post(
        "/categories",
        categoryData
    );

    return response.data;
};


// UPDATE CATEGORY
export const updateCategory = async (id, categoryData) => {
    const response = await api.put(
        `/categories/${id}`,
        categoryData
    );

    return response.data;
};


// DEACTIVATE CATEGORY
export const deactivateCategory = async (id) => {
    const response = await api.delete(
        `/categories/${id}`
    );

    return response.data;
};


// ACTIVATE CATEGORY
export const activateCategory = async (id) => {
    const response = await api.put(
        `/categories/${id}/activate`
    );

    return response.data;
};