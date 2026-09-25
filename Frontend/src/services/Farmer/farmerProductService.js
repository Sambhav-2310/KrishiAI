import api from '../api.js'

export const getProducts = async () => {
  const response = await api.get('/products')

  const data = response.data

  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.products)) {
    return data.products
  }

  return []
}

export const getMyProducts = async () => {
  const response = await api.get('/products/my')
  return Array.isArray(response.data) ? response.data : []
}

export const getProduct = async id => {
  const response = await api.get(`/products/${id}`)
  return response.data
}

export const saveProduct = async data => {
  if (data.id) {
    const response = await api.put(`/products/${data.id}`, data)
    return response.data
  }

  const response = await api.post('/products', data)
  return response.data
}

export const deleteProduct = async id => {
  const response = await api.delete(`/products/${id}`)
  return response.data
}

export const activateProduct = async id => {
  const response = await api.put(`/products/${id}/activate`)
  return response.data
}

export const uploadProductImage = async file => {
  const formData = new FormData()

  formData.append('file', file)

  const response = await api.post(
      '/products/image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
  )

  return response.data
}