import {
    useContext,
    useEffect,
    useRef,
    useState
} from 'react'

import {
    useNavigate,
    useParams
} from 'react-router-dom'

import { AuthContext } from '../context/AuthContext'

import {
    getProduct,
    saveProduct,
    uploadProductImage
} from '../services/Farmer/farmerProductService.js'

import { getCategories } from '../services/categoryService'


const initialForm = {
    name: '',
    categoryId: '',
    description: '',
    quantity: '',
    unit: 'kg',
    price: '',
    location: '',
    imageUrl: ''
}


export default function ProductForm() {

    const { user } =
        useContext(AuthContext)

    const navigate =
        useNavigate()

    const { id } =
        useParams()


    const [form, setForm] =
        useState(initialForm)

    const [categories, setCategories] =
        useState([])

    const [loading, setLoading] =
        useState(false)

    const [loadingProduct, setLoadingProduct] =
        useState(Boolean(id))

    const [uploadingImage, setUploadingImage] =
        useState(false)

    const [imagePreview, setImagePreview] =
        useState('')

    const [error, setError] =
        useState('')

    const [success, setSuccess] =
        useState('')


    /*
     * Hidden file inputs
     */
    const fileInputRef =
        useRef(null)

    const cameraInputRef =
        useRef(null)


    const isEdit =
        Boolean(id)


    // =========================================================
    // LOAD CATEGORIES
    // =========================================================

    useEffect(() => {

        const loadCategories =
            async () => {

                try {

                    const data =
                        await getCategories()

                    setCategories(
                        Array.isArray(data)
                            ? data
                            : []
                    )

                } catch (err) {

                    console.error(
                        'Failed to load categories:',
                        err
                    )

                    setError(
                        'Unable to load categories.'
                    )
                }
            }

        loadCategories()

    }, [])


    // =========================================================
    // LOAD PRODUCT WHEN EDITING
    // =========================================================

    useEffect(() => {

        if (!id) {

            setLoadingProduct(false)

            return
        }


        const loadProduct =
            async () => {

                try {

                    setLoadingProduct(true)

                    const product =
                        await getProduct(id)


                    setForm({

                        name:
                            product.name || '',

                        categoryId:
                            product.categoryId
                                ? String(
                                    product.categoryId
                                )
                                : '',

                        description:
                            product.description || '',

                        quantity:
                            product.quantity ?? '',

                        unit:
                            product.unit || 'kg',

                        price:
                            product.price ?? '',

                        location:
                            product.location || '',

                        imageUrl:
                            product.imageUrl || ''
                    })


                    /*
                     * Show existing product image
                     * when editing.
                     */
                    if (product.imageUrl) {

                        setImagePreview(
                            product.imageUrl
                        )
                    }

                } catch (err) {

                    console.error(
                        'Failed to load product:',
                        err
                    )

                    setError(
                        'Unable to load product.'
                    )

                } finally {

                    setLoadingProduct(false)
                }
            }


        loadProduct()

    }, [id])


    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleChange =
        event => {

            const {
                name,
                value
            } = event.target


            setForm(current => ({

                ...current,

                [name]: value
            }))
        }


    // =========================================================
    // IMAGE VALIDATION
    // =========================================================

    const validateImage =
        file => {

            if (!file) {

                return false
            }


            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/webp'
            ]


            if (!allowedTypes.includes(file.type)) {

                setError(
                    'Only JPG, PNG and WEBP images are allowed.'
                )

                return false
            }


            if (file.size > 5 * 1024 * 1024) {

                setError(
                    'Image size must be less than 5 MB.'
                )

                return false
            }


            return true
        }


    // =========================================================
    // IMAGE SELECTION / CAMERA
    // =========================================================

    const handleImageChange =
        async event => {

            const file =
                event.target.files?.[0]


            /*
             * Reset input so the same image
             * can be selected again.
             */
            event.target.value = ''


            if (!file) {

                return
            }


            setError('')
            setSuccess('')


            if (!validateImage(file)) {

                return
            }


            /*
             * Create immediate local preview.
             */
            const localPreview =
                URL.createObjectURL(file)

            setImagePreview(
                localPreview
            )


            try {

                setUploadingImage(true)


                /*
                 * Upload actual file to Spring Boot.
                 */
                const response =
                    await uploadProductImage(
                        file
                    )


                if (!response?.imageUrl) {

                    throw new Error(
                        'Image URL was not returned by server.'
                    )
                }


                /*
                 * Backend-generated image URL.
                 */
                setForm(current => ({

                    ...current,

                    imageUrl:
                    response.imageUrl
                }))


                /*
                 * Replace local preview with
                 * server image.
                 */
                setImagePreview(
                    response.imageUrl
                )


                setSuccess(
                    'Product image uploaded successfully.'
                )

            } catch (err) {

                console.error(
                    'Failed to upload product image:',
                    err
                )


                /*
                 * Restore old image if editing.
                 */
                setImagePreview(
                    isEdit
                        ? form.imageUrl
                        : ''
                )


                const message =
                    err.response?.data?.message ||
                    err.response?.data ||
                    err.message ||
                    'Unable to upload image.'


                setError(
                    typeof message === 'string'
                        ? message
                        : 'Unable to upload image.'
                )

            } finally {

                setUploadingImage(false)
            }
        }


    // =========================================================
    // REMOVE IMAGE
    // =========================================================

    const handleRemoveImage =
        () => {

            setForm(current => ({

                ...current,

                imageUrl: ''
            }))


            setImagePreview('')

            setSuccess('')


            if (fileInputRef.current) {

                fileInputRef.current.value = ''
            }


            if (cameraInputRef.current) {

                cameraInputRef.current.value = ''
            }
        }


    // =========================================================
    // SUBMIT PRODUCT
    // =========================================================

    const handleSubmit =
        async event => {

            event.preventDefault()

            setError('')
            setSuccess('')


            if (!user) {

                setError(
                    'Please login as a farmer first.'
                )

                return
            }


            if (user.role !== 'FARMER') {

                setError(
                    'Only farmers can create or edit products.'
                )

                return
            }


            if (!form.categoryId) {

                setError(
                    'Please select a category.'
                )

                return
            }


            if (!form.name.trim()) {

                setError(
                    'Product name is required.'
                )

                return
            }


            if (
                !form.price ||
                Number(form.price) <= 0
            ) {

                setError(
                    'Price must be greater than zero.'
                )

                return
            }


            if (
                !form.quantity ||
                Number(form.quantity) <= 0
            ) {

                setError(
                    'Quantity must be greater than zero.'
                )

                return
            }


            if (uploadingImage) {

                setError(
                    'Please wait for the image upload to finish.'
                )

                return
            }


            /*
             * Product payload.
             *
             * imageUrl now contains the URL generated
             * by the backend after uploading the image.
             */
            const payload = {

                name:
                    form.name.trim(),

                description:
                    form.description.trim(),

                price:
                    Number(form.price),

                quantity:
                    Number(form.quantity),

                unit:
                    form.unit.trim(),

                location:
                    form.location.trim(),

                imageUrl:
                    form.imageUrl || null,

                categoryId:
                    Number(form.categoryId)
            }


            try {

                setLoading(true)


                const savedProduct =
                    await saveProduct(

                        isEdit

                            ? {
                                ...payload,
                                id: Number(id)
                            }

                            : payload
                    )


                setSuccess(

                    isEdit

                        ? 'Product updated successfully.'

                        : 'Product created successfully.'
                )


                setTimeout(() => {
                    navigate('/farmer/products')
                }, 100)

            } catch (err) {

                console.error(
                    'Failed to save product:',
                    err
                )


                const message =
                    err.response?.data?.message ||
                    err.response?.data ||
                    'Unable to save product.'


                setError(

                    typeof message === 'string'

                        ? message

                        : 'Unable to save product.'
                )

            } finally {

                setLoading(false)
            }
        }


    // =========================================================
    // LOADING
    // =========================================================

    if (loadingProduct) {

        return (

            <main className="container py-5 text-center">

                <div
                    className="spinner-border text-success"
                />

                <p className="mt-3 text-muted">
                    Loading product...
                </p>

            </main>
        )
    }


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <main className="container py-5">

            <div className="mb-4">

                <p className="section-label mb-1">
                    Farmer marketplace
                </p>

                <h1>
                    {isEdit
                        ? 'Edit Product'
                        : 'Add Product'}
                </h1>

                <p className="text-muted">
                    Add your crop details and publish them to the marketplace.
                </p>

            </div>


            {/* ERROR */}

            {error && (

                <div className="alert alert-danger">

                    <i className="bi bi-exclamation-triangle me-2" />

                    {error}

                </div>
            )}


            {/* SUCCESS */}

            {success && (

                <div className="alert alert-success">

                    <i className="bi bi-check-circle me-2" />

                    {success}

                </div>
            )}


            <form
                className="card p-4"
                onSubmit={handleSubmit}
            >

                <div className="row g-4">


                    {/* =================================================
                        PRODUCT NAME
                    ================================================= */}

                    <div className="col-md-6">

                        <label className="form-label">
                            Product name *
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g. Fresh Tomatoes"
                            required
                        />

                    </div>


                    {/* =================================================
                        CATEGORY
                    ================================================= */}

                    <div className="col-md-6">

                        <label className="form-label">
                            Category *
                        </label>

                        <select
                            className="form-select"
                            name="categoryId"
                            value={form.categoryId}
                            onChange={handleChange}
                            required
                        >

                            <option value="">
                                Select category
                            </option>

                            {categories.map(
                                category => (

                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* =================================================
                        DESCRIPTION
                    ================================================= */}

                    <div className="col-12">

                        <label className="form-label">
                            Description
                        </label>

                        <textarea
                            className="form-control"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Describe your crop..."
                        />

                    </div>


                    {/* =================================================
                        QUANTITY
                    ================================================= */}

                    <div className="col-md-4">

                        <label className="form-label">
                            Quantity *
                        </label>

                        <input
                            type="number"
                            className="form-control"
                            name="quantity"
                            value={form.quantity}
                            onChange={handleChange}
                            min="0.01"
                            step="0.01"
                            required
                        />

                    </div>


                    {/* =================================================
                        UNIT
                    ================================================= */}

                    <div className="col-md-4">

                        <label className="form-label">
                            Unit *
                        </label>

                        <select
                            className="form-select"
                            name="unit"
                            value={form.unit}
                            onChange={handleChange}
                        >

                            <option value="kg">
                                kg
                            </option>

                            <option value="quintal">
                                quintal
                            </option>

                            <option value="ton">
                                ton
                            </option>

                            <option value="piece">
                                piece
                            </option>

                            <option value="dozen">
                                dozen
                            </option>

                            <option value="litre">
                                litre
                            </option>

                        </select>

                    </div>


                    {/* =================================================
                        PRICE
                    ================================================= */}

                    <div className="col-md-4">

                        <label className="form-label">
                            Price (₹) *
                        </label>

                        <input
                            type="number"
                            className="form-control"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            min="0.01"
                            step="0.01"
                            required
                        />

                    </div>


                    {/* =================================================
                        LOCATION
                    ================================================= */}

                    <div className="col-md-6">

                        <label className="form-label">
                            Location
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            placeholder="e.g. Nashik, Maharashtra"
                        />

                    </div>


                    {/* =================================================
                        IMAGE UPLOAD
                    ================================================= */}

                    <div className="col-md-6">

                        <label className="form-label">
                            Product Image
                        </label>


                        <div className="card border">

                            <div className="card-body">


                                {/* IMAGE PREVIEW */}

                                {imagePreview ? (

                                    <div className="mb-3">

                                        <div
                                            className="position-relative"
                                            style={{
                                                width: '100%',
                                                maxWidth: '350px'
                                            }}
                                        >

                                            <img
                                                src={imagePreview}
                                                alt="Product preview"
                                                className="img-fluid rounded border"
                                                style={{
                                                    width: '100%',
                                                    height: '220px',
                                                    objectFit: 'cover'
                                                }}
                                            />


                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                                                onClick={
                                                    handleRemoveImage
                                                }
                                                disabled={
                                                    uploadingImage
                                                }
                                                title="Remove image"
                                            >

                                                <i className="bi bi-x-lg" />

                                            </button>

                                        </div>

                                    </div>

                                ) : (

                                    <div
                                        className="border rounded bg-light d-flex flex-column align-items-center justify-content-center mb-3"
                                        style={{
                                            height: '220px'
                                        }}
                                    >

                                        <i
                                            className="bi bi-image text-muted"
                                            style={{
                                                fontSize: '3rem'
                                            }}
                                        />

                                        <p className="text-muted mb-0">
                                            No image selected
                                        </p>

                                    </div>

                                )}


                                {/* BUTTONS */}

                                <div className="d-flex flex-wrap gap-2">


                                    {/* FILE / GALLERY */}

                                    <button
                                        type="button"
                                        className="btn btn-outline-success"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        disabled={
                                            uploadingImage
                                        }
                                    >

                                        <i className="bi bi-folder2-open me-2" />

                                        Choose from Files

                                    </button>


                                    {/* CAMERA */}

                                    <button
                                        type="button"
                                        className="btn btn-outline-primary"
                                        onClick={() =>
                                            cameraInputRef.current?.click()
                                        }
                                        disabled={
                                            uploadingImage
                                        }
                                    >

                                        <i className="bi bi-camera me-2" />

                                        Take Photo

                                    </button>

                                </div>


                                {/* NORMAL FILE INPUT */}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="d-none"
                                    onChange={
                                        handleImageChange
                                    }
                                />


                                {/* CAMERA INPUT */}

                                <input
                                    ref={cameraInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="d-none"
                                    onChange={
                                        handleImageChange
                                    }
                                />


                                {/* UPLOADING */}

                                {uploadingImage && (

                                    <div className="mt-3 text-primary">

                                        <div
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                        />

                                        Uploading image...

                                    </div>
                                )}


                                {!uploadingImage && (

                                    <div className="form-text mt-3">

                                        <i className="bi bi-info-circle me-1" />

                                        JPG, PNG or WEBP.
                                        Maximum size: 5 MB.

                                    </div>
                                )}

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        FARMER
                    ================================================= */}

                    <div className="col-12">

                        <div className="alert alert-light border mb-0">

                            <strong>
                                Farmer:
                            </strong>{' '}

                            {user?.name ||
                                'Not logged in'}

                            {' · '}

                            {user?.email || ''}

                        </div>

                    </div>


                    {/* =================================================
                        BUTTONS
                    ================================================= */}

                    <div className="col-12 d-flex gap-2">

                        <button
                            type="submit"
                            className="btn btn-success"
                            disabled={
                                loading ||
                                uploadingImage
                            }
                        >

                            {uploadingImage

                                ? 'Uploading image...'

                                : loading

                                    ? 'Saving...'

                                    : isEdit

                                        ? 'Update Product'

                                        : 'Publish Product'}

                        </button>


                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() =>
                                navigate('/farmer/products')
                            }
                            disabled={
                                loading ||
                                uploadingImage
                            }
                        >

                            Cancel

                        </button>

                    </div>

                </div>

            </form>

        </main>
    )
}