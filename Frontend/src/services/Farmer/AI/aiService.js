import api from '../../api'

export const generateListing = async (data) => {
    const response = await api.post('/ai/smart-listing', {
        crop: data.crop,
        quantity: Number(data.quantity),
        location: data.location,
        quality: data.quality
    })

    return response.data
}

export const predictPrice = async (data) => {
    const response = await api.post('/ai/predict-price', {
        district: data.district,
        market: data.market,
        commodity: data.commodity,
        variety: data.variety,
        grade: data.grade,
        date: data.date
    })

    return response.data
}

export const detectDisease = async (file) => {
    const formData = new FormData()

    formData.append('file', file)

    const response = await api.post(
        '/ai/predict-disease',
        formData
    )

    return response.data
}