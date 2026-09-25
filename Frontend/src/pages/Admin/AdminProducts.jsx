import { useEffect, useState } from 'react'
import {
    getAdminProducts
} from '../../services/Admin/adminProductService.js'

export default function AdminProducts() {

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [deletingId, setDeletingId] = useState(null)

    const loadProducts = async () => {
        try {
            setLoading(true)
            setError('')

            const data = await getAdminProducts()
            setProducts(data)
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to load products'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadProducts()
    }, [])

    const handleDelete = async product => {

        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.name}"?`
        )

        if (!confirmed) {
            return
        }

        try {
            setDeletingId(product.id)
            setError('')

            await deleteAdminProduct(product.id)

            setProducts(prev =>
                prev.filter(item => item.id !== product.id)
            )

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to delete product'
            )
        } finally {
            setDeletingId(null)
        }
    }

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div
                    className="spinner-border"
                    role="status"
                />

                <p className="mt-3 text-muted">
                    Loading products...
                </p>
            </div>
        )
    }

    return (
        <div className="container py-4">

            {/* Header */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2 className="fw-bold mb-1">
                        Product Management
                    </h2>

                    <p className="text-muted mb-0">
                        Manage products listed by farmers.
                    </p>
                </div>

                <button
                    className="btn btn-outline-primary"
                    onClick={loadProducts}
                >
                    Refresh
                </button>

            </div>

            {/* Error */}

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* Summary */}

            <div className="row g-3 mb-4">

                <div className="col-md-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <small className="text-muted">
                                Total Products
                            </small>

                            <h3 className="fw-bold mb-0">
                                {products.length}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <small className="text-muted">
                                Available
                            </small>

                            <h3 className="fw-bold text-success mb-0">
                                {
                                    products.filter(
                                        product =>
                                            product.status === 'AVAILABLE'
                                    ).length
                                }
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <small className="text-muted">
                                Other Status
                            </small>

                            <h3 className="fw-bold text-secondary mb-0">
                                {
                                    products.filter(
                                        product =>
                                            product.status !== 'AVAILABLE'
                                    ).length
                                }
                            </h3>
                        </div>
                    </div>
                </div>

            </div>

            {/* Products */}

            <div className="card border-0 shadow-sm">

                <div className="card-body p-0">

                    <div className="table-responsive">

                        <table className="table table-hover align-middle mb-0">

                            <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Product</th>
                                <th>Farmer</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                            </tr>
                            </thead>

                            <tbody>

                            {products.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan="8"
                                        className="text-center py-5 text-muted"
                                    >
                                        No products found.
                                    </td>
                                </tr>

                            ) : (

                                products.map(product => (

                                    <tr key={product.id}>

                                        <td>
                                            #{product.id}
                                        </td>

                                        <td>

                                            <div className="d-flex align-items-center">

                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="rounded me-3"
                                                        style={{
                                                            width: '55px',
                                                            height: '55px',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="bg-light rounded me-3 d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: '55px',
                                                            height: '55px'
                                                        }}
                                                    >
                                                            <span className="text-muted">
                                                                N/A
                                                            </span>
                                                    </div>
                                                )}

                                                <div>

                                                    <div className="fw-semibold">
                                                        {product.name}
                                                    </div>

                                                    <small className="text-muted">
                                                        {product.unit}
                                                    </small>

                                                </div>

                                            </div>

                                        </td>

                                        <td>

                                            <div className="fw-semibold">
                                                {product.farmerName || '-'}
                                            </div>

                                            <small className="text-muted">
                                                {product.farmerEmail || ''}
                                            </small>

                                        </td>

                                        <td>
                                            {product.categoryName || '-'}
                                        </td>

                                        <td>
                                            ₹{product.price}
                                        </td>

                                        <td>
                                            {product.quantity} {product.unit}
                                        </td>

                                        <td>

                                                <span
                                                    className={`badge ${
                                                        product.status === 'AVAILABLE'
                                                            ? 'bg-success'
                                                            : 'bg-secondary'
                                                    }`}
                                                >
                                                    {product.status}
                                                </span>

                                        </td>

                                    </tr>

                                ))

                            )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>
    )
}