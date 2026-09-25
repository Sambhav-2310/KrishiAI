import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    activateProduct,
    deleteProduct,
    getMyProducts
} from '../services/Farmer/farmerProductService.js'

export default function Management({ type, admin }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true)
                setError('')

                const products = await getMyProducts()
                setItems(products)
            } catch (err) {
                console.error('Failed to load farmer products:', err)

                setError(
                    err?.response?.data?.message ||
                    err?.response?.data ||
                    'Failed to load products.'
                )

                setItems([])
            } finally {
                setLoading(false)
            }
        }

        if (type === 'products' && !admin) {
            loadProducts()
        }
    }, [type, admin])

    const remove = async id => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this product? It will be hidden from consumers.'
        )

        if (!confirmed) {
            return
        }

        try {
            await deleteProduct(id)

            setItems(current =>
                current.map(item =>
                    item.id === id
                        ? { ...item, status: 'INACTIVE' }
                        : item
                )
            )
        } catch (err) {
            console.error('Failed to delete product:', err)

            alert(
                err?.response?.data?.message ||
                err?.response?.data ||
                'Failed to delete product.'
            )
        }
    }

    const activate = async id => {
        try {
            await activateProduct(id)

            setItems(current =>
                current.map(item =>
                    item.id === id
                        ? {
                            ...item,
                            status:
                                Number(item.quantity) === 0
                                    ? 'SOLD_OUT'
                                    : 'ACTIVE'
                        }
                        : item
                )
            )
        } catch (err) {
            console.error('Failed to activate product:', err)

            alert(
                err?.response?.data?.message ||
                err?.response?.data ||
                'Failed to activate product.'
            )
        }
    }

    if (type === 'users') {
        return (
            <section className="container py-5">
                <p className="section-label">
                    Administration
                </p>

                <h1 className="h2 mb-4">
                    Manage Users
                </h1>

                <div className="card p-5 text-center">
                    <i className="bi bi-people fs-1 text-muted" />

                    <h4 className="mt-3">
                        User management is available in Admin Users
                    </h4>

                    <p className="text-muted mb-0">
                        Use the dedicated admin user management page.
                    </p>
                </div>
            </section>
        )
    }

    return (
        <section className="container py-5">

            <p className="section-label mb-1">
                Farmer workspace
            </p>

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h1 className="h2 mb-1">
                        My Products
                    </h1>

                    <p className="text-muted mb-0">
                        Manage your crop listings.
                    </p>
                </div>

                <Link
                    className="btn btn-success"
                    to="/farmer/products/new"
                >
                    <i className="bi bi-plus-lg me-1" />
                    Add product
                </Link>

            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            <div className="card p-3 mt-4">

                {loading ? (

                    <div className="text-center py-5">

                        <div className="spinner-border text-success" />

                        <p className="mt-2 text-muted">
                            Loading products...
                        </p>

                    </div>

                ) : items.length === 0 ? (

                    <div className="text-center py-5">

                        <i className="bi bi-inbox fs-1 text-muted" />

                        <h4 className="mt-3">
                            No products found
                        </h4>

                        <p className="text-muted">
                            You haven't listed any crops yet.
                        </p>

                        <Link
                            className="btn btn-success btn-sm"
                            to="/farmer/products/new"
                        >
                            <i className="bi bi-plus-lg me-1" />
                            Add your first product
                        </Link>

                    </div>

                ) : (

                    <div className="table-responsive">

                        <table className="table align-middle mb-0">

                            <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>

                            {items.map(product => (

                                <tr key={product.id}>

                                    <td>
                                        <div className="d-flex align-items-center gap-2">

                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    width="44"
                                                    height="44"
                                                    className="rounded object-fit-cover shadow-sm"
                                                />
                                            ) : (
                                                <div
                                                    className="rounded bg-light d-flex align-items-center justify-content-center"
                                                    style={{
                                                        width: '44px',
                                                        height: '44px'
                                                    }}
                                                >
                                                    <i className="bi bi-image text-muted" />
                                                </div>
                                            )}

                                            <strong>
                                                {product.name}
                                            </strong>

                                        </div>
                                    </td>

                                    <td>
                                            <span className="badge text-bg-light text-success">
                                                {product.categoryName || '—'}
                                            </span>
                                    </td>

                                    <td>
                                        {product.quantity ?? '—'}{' '}
                                        {product.unit || ''}
                                    </td>

                                    <td className="text-success fw-bold">
                                        ₹{product.price ?? '0'}
                                        <small className="text-muted">
                                            /{product.unit || 'unit'}
                                        </small>
                                    </td>

                                    <td>
                                            <span
                                                className={
                                                    product.status === 'ACTIVE'
                                                        ? 'badge text-bg-success'
                                                        : product.status === 'SOLD_OUT'
                                                            ? 'badge text-bg-danger'
                                                            : 'badge text-bg-secondary'
                                                }
                                            >
                                                {product.status || 'ACTIVE'}
                                            </span>
                                    </td>

                                    <td>

                                        <div className="d-flex align-items-center gap-1">

                                            <Link
                                                className="btn btn-outline-secondary btn-sm"
                                                to={`/products/${product.id}`}
                                                title="View product"
                                            >
                                                <i className="bi bi-eye" />
                                            </Link>

                                            <Link
                                                className="btn btn-outline-success btn-sm"
                                                to={`/farmer/products/${product.id}/edit`}
                                                title="Edit product"
                                            >
                                                <i className="bi bi-pencil" />
                                            </Link>

                                            {product.status === 'INACTIVE' ? (

                                                <button
                                                    className="btn btn-outline-success btn-sm"
                                                    onClick={() =>
                                                        activate(product.id)
                                                    }
                                                    title="Activate product"
                                                >
                                                    <i className="bi bi-check-circle" />
                                                </button>

                                            ) : (

                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() =>
                                                        remove(product.id)
                                                    }
                                                    title="Delete product"
                                                >
                                                    <i className="bi bi-trash" />
                                                </button>

                                            )}

                                        </div>

                                    </td>

                                </tr>

                            ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </section>
    )
}