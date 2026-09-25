import { useState } from 'react'
import {
    detectDisease,
    generateListing,
    predictPrice
} from '../services/Farmer/AI/aiService'

function AITools() {
    const [activeTool, setActiveTool] = useState('disease')

    // Disease Detection
    const [selectedImage, setSelectedImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [disease, setDisease] = useState(null)
    const [diseaseLoading, setDiseaseLoading] = useState(false)
    const [diseaseError, setDiseaseError] = useState('')

    // Smart Listing
    const [listingForm, setListingForm] = useState({
        crop: '',
        quantity: '',
        location: '',
        quality: ''
    })
    const [listing, setListing] = useState(null)
    const [listingLoading, setListingLoading] = useState(false)
    const [listingError, setListingError] = useState('')

    // Price Prediction
    const [priceForm, setPriceForm] = useState({
        district: '',
        market: '',
        commodity: '',
        variety: '',
        grade: '',
        date: ''
    })
    const [price, setPrice] = useState(null)
    const [priceLoading, setPriceLoading] = useState(false)
    const [priceError, setPriceError] = useState('')

    // ==============================
    // DISEASE DETECTION
    // ==============================

    const handleImageChange = (event) => {
        const file = event.target.files?.[0]

        if (!file) {
            return
        }

        setSelectedImage(file)
        setDisease(null)
        setDiseaseError('')

        const previewUrl = URL.createObjectURL(file)
        setImagePreview(previewUrl)
    }

    const handleDiseaseDetection = async () => {
        if (!selectedImage) {
            setDiseaseError('Please select an image first.')
            return
        }

        setDiseaseLoading(true)
        setDiseaseError('')
        setDisease(null)

        try {
            const result = await detectDisease(selectedImage)

            if (!result?.success) {
                setDiseaseError(
                    result?.message || 'Disease detection failed.'
                )
                return
            }

            setDisease(result)
        } catch (error) {
            console.error('Disease detection error:', error)

            setDiseaseError(
                error.response?.data?.message ||
                'Unable to connect to the disease detection service.'
            )
        } finally {
            setDiseaseLoading(false)
        }
    }

    // ==============================
    // SMART LISTING
    // ==============================

    const handleListingChange = (event) => {
        const { name, value } = event.target

        setListingForm((previous) => ({
            ...previous,
            [name]: value
        }))
    }

    const handleGenerateListing = async (event) => {
        event.preventDefault()

        setListingLoading(true)
        setListingError('')
        setListing(null)

        try {
            const result = await generateListing(listingForm)

            if (!result?.success) {
                setListingError(
                    result?.message || 'Unable to generate listing.'
                )
                return
            }

            setListing(result)
        } catch (error) {
            console.error('Smart listing error:', error)

            setListingError(
                error.response?.data?.message ||
                'Unable to connect to the AI service.'
            )
        } finally {
            setListingLoading(false)
        }
    }

    // ==============================
    // PRICE PREDICTION
    // ==============================

    const handlePriceChange = (event) => {
        const { name, value } = event.target

        setPriceForm((previous) => ({
            ...previous,
            [name]: value
        }))
    }

    const handlePredictPrice = async (event) => {
        event.preventDefault()

        setPriceLoading(true)
        setPriceError('')
        setPrice(null)

        try {
            const result = await predictPrice(priceForm)

            if (!result?.success) {
                setPriceError(
                    result?.message || 'Unable to predict price.'
                )
                return
            }

            setPrice(result)
        } catch (error) {
            console.error('Price prediction error:', error)

            setPriceError(
                error.response?.data?.message ||
                'Unable to connect to the AI service.'
            )
        } finally {
            setPriceLoading(false)
        }
    }

    return (
        <div className="container py-4">

            {/* PAGE HEADER */}
            <div className="mb-4">
                <h2 className="fw-bold">AI Tools</h2>
                <p className="text-muted mb-0">
                    Use KrishiAI tools to detect diseases, generate listings,
                    and predict crop prices.
                </p>
            </div>

            {/* TOOL TABS */}
            <div className="btn-group mb-4" role="group">
                <button
                    type="button"
                    className={`btn ${
                        activeTool === 'disease'
                            ? 'btn-success'
                            : 'btn-outline-success'
                    }`}
                    onClick={() => setActiveTool('disease')}
                >
                    Disease Detection
                </button>

                <button
                    type="button"
                    className={`btn ${
                        activeTool === 'listing'
                            ? 'btn-success'
                            : 'btn-outline-success'
                    }`}
                    onClick={() => setActiveTool('listing')}
                >
                    Smart Listing
                </button>

                <button
                    type="button"
                    className={`btn ${
                        activeTool === 'price'
                            ? 'btn-success'
                            : 'btn-outline-success'
                    }`}
                    onClick={() => setActiveTool('price')}
                >
                    Price Prediction
                </button>
            </div>

            {/* =========================================
          DISEASE DETECTION
      ========================================= */}
            {activeTool === 'disease' && (
                <div className="card shadow-sm">
                    <div className="card-body p-4">

                        <h4 className="fw-bold mb-2">
                            Crop Disease Detection
                        </h4>

                        <p className="text-muted">
                            Upload a crop leaf image and let KrishiAI
                            identify the crop and possible disease.
                        </p>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">
                                Select Leaf Image
                            </label>

                            <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>

                        {/* IMAGE PREVIEW */}
                        {imagePreview && (
                            <div className="mb-4">
                                <img
                                    src={imagePreview}
                                    alt="Selected crop"
                                    className="img-fluid rounded border"
                                    style={{
                                        maxHeight: '350px',
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>
                        )}

                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={handleDiseaseDetection}
                            disabled={!selectedImage || diseaseLoading}
                        >
                            {diseaseLoading ? (
                                <>
                  <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                  />
                                    Analyzing...
                                </>
                            ) : (
                                'Detect Disease'
                            )}
                        </button>

                        {/* ERROR */}
                        {diseaseError && (
                            <div className="alert alert-danger mt-4 mb-0">
                                {diseaseError}
                            </div>
                        )}

                        {/* RESULT */}
                        {disease && (
                            <div className="card border-success mt-4">
                                <div className="card-header bg-success text-white">
                                    <strong>Detection Result</strong>
                                </div>

                                <div className="card-body">

                                    <div className="row g-3">

                                        <div className="col-md-6">
                                            <div className="border rounded p-3 h-100">
                                                <small className="text-muted d-block">
                                                    Crop
                                                </small>
                                                <h5 className="fw-bold mb-0">
                                                    {disease.crop}
                                                </h5>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="border rounded p-3 h-100">
                                                <small className="text-muted d-block">
                                                    Disease
                                                </small>
                                                <h5 className="fw-bold mb-0">
                                                    {disease.disease}
                                                </h5>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="border rounded p-3 h-100">
                                                <small className="text-muted d-block">
                                                    Health Status
                                                </small>

                                                <h5
                                                    className={`fw-bold mb-0 ${
                                                        disease.health_status === 'Healthy'
                                                            ? 'text-success'
                                                            : 'text-danger'
                                                    }`}
                                                >
                                                    {disease.health_status}
                                                </h5>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="border rounded p-3 h-100">
                                                <small className="text-muted d-block">
                                                    Confidence
                                                </small>

                                                <h5 className="fw-bold mb-0">
                                                    {disease.confidence}%
                                                </h5>
                                            </div>
                                        </div>

                                    </div>

                                    {/* CONFIDENCE BAR */}
                                    <div className="mt-4">
                                        <div className="d-flex justify-content-between mb-1">
                      <span className="fw-semibold">
                        Model Confidence
                      </span>

                                            <span>
                        {disease.confidence}%
                      </span>
                                        </div>

                                        <div
                                            className="progress"
                                            role="progressbar"
                                            aria-valuenow={disease.confidence}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                        >
                                            <div
                                                className={`progress-bar ${
                                                    disease.confidence >= 80
                                                        ? 'bg-success'
                                                        : disease.confidence >= 60
                                                            ? 'bg-warning'
                                                            : 'bg-danger'
                                                }`}
                                                style={{
                                                    width: `${disease.confidence}%`
                                                }}
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* =========================================
          SMART LISTING
      ========================================= */}
            {activeTool === 'listing' && (
                <div className="card shadow-sm">
                    <div className="card-body p-4">

                        <h4 className="fw-bold mb-2">
                            Smart Listing Generator
                        </h4>

                        <p className="text-muted">
                            Generate a professional product title and
                            description using AI.
                        </p>

                        <form onSubmit={handleGenerateListing}>

                            <div className="row g-3">

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Crop
                                    </label>

                                    <input
                                        type="text"
                                        name="crop"
                                        className="form-control"
                                        value={listingForm.crop}
                                        onChange={handleListingChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Quantity
                                    </label>

                                    <input
                                        type="number"
                                        name="quantity"
                                        className="form-control"
                                        min="0.01"
                                        step="0.01"
                                        value={listingForm.quantity}
                                        onChange={handleListingChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Location
                                    </label>

                                    <input
                                        type="text"
                                        name="location"
                                        className="form-control"
                                        value={listingForm.location}
                                        onChange={handleListingChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Quality
                                    </label>

                                    <input
                                        type="text"
                                        name="quality"
                                        className="form-control"
                                        value={listingForm.quality}
                                        onChange={handleListingChange}
                                        required
                                    />
                                </div>

                            </div>

                            <button
                                type="submit"
                                className="btn btn-success mt-4"
                                disabled={listingLoading}
                            >
                                {listingLoading ? 'Generating...' : 'Generate Listing'}
                            </button>

                        </form>

                        {listingError && (
                            <div className="alert alert-danger mt-4">
                                {listingError}
                            </div>
                        )}

                        {listing?.data && (
                            <div className="card border-success mt-4">
                                <div className="card-header bg-success text-white">
                                    Generated Listing
                                </div>

                                <div className="card-body">
                                    <h5 className="fw-bold">
                                        {listing.data.title}
                                    </h5>

                                    <p>
                                        {listing.data.description}
                                    </p>

                                    <span className="badge bg-secondary">
                    {listing.data.category}
                  </span>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* =========================================
          PRICE PREDICTION
      ========================================= */}
            {activeTool === 'price' && (
                <div className="card shadow-sm">
                    <div className="card-body p-4">

                        <h4 className="fw-bold mb-2">
                            Crop Price Prediction
                        </h4>

                        <p className="text-muted">
                            Predict the expected crop price per quintal
                            and per kilogram.
                        </p>

                        <form onSubmit={handlePredictPrice}>

                            <div className="row g-3">

                                <div className="col-md-6">
                                    <label className="form-label">
                                        District
                                    </label>

                                    <input
                                        type="text"
                                        name="district"
                                        className="form-control"
                                        value={priceForm.district}
                                        onChange={handlePriceChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Market
                                    </label>

                                    <input
                                        type="text"
                                        name="market"
                                        className="form-control"
                                        value={priceForm.market}
                                        onChange={handlePriceChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Commodity
                                    </label>

                                    <input
                                        type="text"
                                        name="commodity"
                                        className="form-control"
                                        value={priceForm.commodity}
                                        onChange={handlePriceChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Variety
                                    </label>

                                    <input
                                        type="text"
                                        name="variety"
                                        className="form-control"
                                        value={priceForm.variety}
                                        onChange={handlePriceChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Grade
                                    </label>

                                    <input
                                        type="text"
                                        name="grade"
                                        className="form-control"
                                        value={priceForm.grade}
                                        onChange={handlePriceChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Date
                                    </label>

                                    <input
                                        type="date"
                                        name="date"
                                        className="form-control"
                                        value={priceForm.date}
                                        onChange={handlePriceChange}
                                        required
                                    />
                                </div>

                            </div>

                            <button
                                type="submit"
                                className="btn btn-success mt-4"
                                disabled={priceLoading}
                            >
                                {priceLoading ? 'Predicting...' : 'Predict Price'}
                            </button>

                        </form>

                        {priceError && (
                            <div className="alert alert-danger mt-4">
                                {priceError}
                            </div>
                        )}

                        {price && (
                            <div className="card border-success mt-4">
                                <div className="card-header bg-success text-white">
                                    Price Prediction Result
                                </div>

                                <div className="card-body">

                                    <h5 className="fw-bold">
                                        {price.commodity}
                                    </h5>

                                    <div className="row g-3 mt-1">

                                        <div className="col-md-6">
                                            <div className="border rounded p-3">
                                                <small className="text-muted d-block">
                                                    Price per Quintal
                                                </small>

                                                <h4 className="fw-bold mb-0">
                                                    ₹{Number(
                                                    price.predicted_price_per_quintal
                                                ).toFixed(2)}
                                                </h4>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="border rounded p-3">
                                                <small className="text-muted d-block">
                                                    Price per KG
                                                </small>

                                                <h4 className="fw-bold mb-0">
                                                    ₹{Number(
                                                    price.predicted_price_per_kg
                                                ).toFixed(2)}
                                                </h4>
                                            </div>
                                        </div>

                                    </div>

                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}

        </div>
    )
}

export default AITools