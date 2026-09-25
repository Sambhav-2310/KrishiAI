import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    getMyProducts,
    deleteProduct,
    activateProduct
} from '../../services/Farmer/farmerProductService.js'

export default function MyProducts() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [actionLoading, setActionLoading] = useState(null)

    // =========================================================
    // LOAD MY PRODUCTS
    // =========================================================

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        try {
            setLoading(true)
            setError('')

            const data = await getMyProducts()

            setProducts(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Failed to load farmer products:', err)

            setError(
                err?.response?.data?.message ||
                'Unable to load your products.'
            )
        } finally {
            setLoading(false)
        }
    }

    // =========================================================
    // DEACTIVATE PRODUCT
    // =========================================================

    const handleDeactivate = async product => {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate "${product.name}"?`
        )

        if (!confirmed) {
            return
        }

        try {
            setActionLoading(product.id)
            setError('')

            await deleteProduct(product.id)

            await loadProducts()
        } catch (err) {
            console.error('Failed to deactivate product:', err)

            setError(
                err?.response?.data?.message ||
                'Unable to deactivate product.'
            )
        } finally {
            setActionLoading(null)
        }
    }

    // =========================================================
    // ACTIVATE PRODUCT
    // =========================================================

    const handleActivate = async product => {
        try {
            setActionLoading(product.id)
            setError('')

            await activateProduct(product.id)

            await loadProducts()
        } catch (err) {
            console.error('Failed to activate product:', err)

            setError(
                err?.response?.data?.message ||
                'Unable to activate product.'
            )
        } finally {
            setActionLoading(null)
        }
    }

    // =========================================================
    // STATUS BADGE
    // =========================================================

    const getStatusBadge = status => {
        switch (status) {
            case 'ACTIVE':
                return (
                    <span className="badge text-bg-success">
            Active
          </span>
                )

            case 'SOLD_OUT':
                return (
                    <span className="badge text-bg-warning">
            Sold Out
          </span>
                )

            case 'INACTIVE':
                return (
                    <span className="badge text-bg-secondary">
            Inactive
          </span>
                )

            default:
                return (
                    <span className="badge text-bg-light">
            {status || 'Unknown'}
          </span>
                )
        }
    }

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <main className="container py-5">

                <div className="text-center py-5">

                    <div
                        className="spinner-border text-success"
                        role="status"
                    >
            <span className="visually-hidden">
              Loading...
            </span>
                    </div>

                    <p className="text-muted mt-3 mb-0">
                        Loading your products...
                    </p>

                </div>

            </main>
        )
    }

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <main className="container py-5">

            {/* =====================================================
          HEADER
      ===================================================== */}

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">

                <div>
                    <p className="text-success fw-semibold mb-1">
                        FARMER WORKSPACE
                    </p>

                    <h1 className="mb-1">
                        My Products
                    </h1>

                    <p className="text-muted mb-0">
                        Manage the products you are selling on KrishiAI.
                    </p>
                </div>

                <div className="mt-3 mt-md-0">

                    <Link
                        to="/farmer/products/new"
                        className="btn btn-success"
                    >
                        <i className="bi bi-plus-lg me-1"></i>
                        Add Product
                    </Link>

                </div>

            </div>


            {/* =====================================================
          ERROR
      ===================================================== */}

            {error && (
                <div
                    className="alert alert-danger d-flex justify-content-between align-items-center"
                    role="alert"
                >

                    <div>
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                    </div>

                    <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={loadProducts}
                    >
                        Try Again
                    </button>

                </div>
            )}


            {/* =====================================================
          SUMMARY
      ===================================================== */}

            <div className="row g-3 mb-4">

                <div className="col-6 col-md-3">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body">

                            <p className="text-muted small mb-1">
                                Total
                            </p>

                            <h3 className="mb-0">
                                {products.length}
                            </h3>

                        </div>

                    </div>

                </div>


                <div className="col-6 col-md-3">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body">

                            <p className="text-muted small mb-1">
                                Active
                            </p>

                            <h3 className="text-success mb-0">
                                {
                                    products.filter(
                                        product => product.status === 'ACTIVE'
                                    ).length
                                }
                            </h3>

                        </div>

                    </div>

                </div>


                <div className="col-6 col-md-3">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body">

                            <p className="text-muted small mb-1">
                                Sold Out
                            </p>

                            <h3 className="text-warning mb-0">
                                {
                                    products.filter(
                                        product => product.status === 'SOLD_OUT'
                                    ).length
                                }
                            </h3>

                        </div>

                    </div>

                </div>


                <div className="col-6 col-md-3">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body">

                            <p className="text-muted small mb-1">
                                Inactive
                            </p>

                            <h3 className="text-secondary mb-0">
                                {
                                    products.filter(
                                        product => product.status === 'INACTIVE'
                                    ).length
                                }
                            </h3>

                        </div>

                    </div>

                </div>

            </div>


            {/* =====================================================
          EMPTY STATE
      ===================================================== */}

            {!error && products.length === 0 && (

                <div className="card border-0 shadow-sm">

                    <div className="card-body text-center py-5">

                        <i className="bi bi-box-seam display-4 text-muted"></i>

                        <h3 className="h5 mt-3">
                            You don't have any products yet
                        </h3>

                        <p className="text-muted">
                            Add your first product to start selling.
                        </p>

                        <Link
                            to="/farmer/products/new"
                            className="btn btn-success"
                        >
                            <i className="bi bi-plus-lg me-1"></i>
                            Add Your First Product
                        </Link>

                    </div>

                </div>

            )}


            {/* =====================================================
          PRODUCTS TABLE
      ===================================================== */}

            {!error && products.length > 0 && (

                <div className="card border-0 shadow-sm">

                    <div className="card-body p-0">

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">

                                <thead className="table-light">

                                <tr>

                                    <th className="px-3 py-3">
                                        Product
                                    </th>

                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        Price
                                    </th>

                                    <th>
                                        Quantity
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th className="text-end px-3">
                                        Actions
                                    </th>

                                </tr>

                                </thead>


                                <tbody>

                                {products.map(product => (

                                    <tr key={product.id}>

                                        {/* PRODUCT */}

                                        <td className="px-3">

                                            <div className="d-flex align-items-center gap-3">

                                                <img
                                                    src={
                                                        product.imageUrl ||
                                                        'https://placehold.co/80x80?text=Product'
                                                    }
                                                    alt={product.name}
                                                    className="rounded"
                                                    style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        objectFit: 'cover'
                                                    }}
                                                />

                                                <div>

                                                    <div className="fw-semibold">
                                                        {product.name}
                                                    </div>

                                                    <div className="small text-muted">
                                                        {product.location || 'Location not specified'}
                                                    </div>

                                                </div>

                                            </div>

                                        </td>


                                        {/* CATEGORY */}

                                        <td>
                                            {product.categoryName || '—'}
                                        </td>


                                        {/* PRICE */}

                                        <td>

                        <span className="fw-semibold">
                          ₹
                            {Number(product.price || 0).toLocaleString(
                                'en-IN',
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }
                            )}
                        </span>

                                            <div className="small text-muted">
                                                / {product.unit}
                                            </div>

                                        </td>


                                        {/* QUANTITY */}

                                        <td>

                        <span className="fw-semibold">
                          {product.quantity}
                        </span>

                                            <span className="text-muted ms-1">
                          {product.unit}
                        </span>

                                        </td>


                                        {/* STATUS */}

                                        <td>
                                            {getStatusBadge(product.status)}
                                        </td>


                                        {/* ACTIONS */}

                                        <td className="text-end px-3">

                                            <div className="d-flex justify-content-end gap-2 flex-wrap">

                                                {/* VIEW */}

                                                <Link
                                                    to={`/products/${product.id}`}
                                                    className="btn btn-sm btn-outline-secondary"
                                                    title="View product"
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </Link>


                                                {/* EDIT */}

                                                <Link
                                                    to={`/farmer/products/${product.id}/edit`}
                                                    className="btn btn-sm btn-outline-primary"
                                                    title="Edit product"
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </Link>


                                                {/* ACTIVATE */}

                                                {product.status === 'INACTIVE' && (

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-success"
                                                        onClick={() =>
                                                            handleActivate(product)
                                                        }
                                                        disabled={
                                                            actionLoading === product.id
                                                        }
                                                        title="Activate product"
                                                    >

                                                        {actionLoading === product.id ? (
                                                            <span
                                                                className="spinner-border spinner-border-sm"
                                                                role="status"
                                                            />
                                                        ) : (
                                                            <i className="bi bi-check-circle"></i>
                                                        )}

                                                    </button>

                                                )}


                                                {/* DEACTIVATE */}

                                                {product.status === 'ACTIVE' && (

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() =>
                                                            handleDeactivate(product)
                                                        }
                                                        disabled={
                                                            actionLoading === product.id
                                                        }
                                                        title="Deactivate product"
                                                    >

                                                        {actionLoading === product.id ? (
                                                            <span
                                                                className="spinner-border spinner-border-sm"
                                                                role="status"
                                                            />
                                                        ) : (
                                                            <i className="bi bi-pause-circle"></i>
                                                        )}

                                                    </button>

                                                )}

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            )}

        </main>
    )
}