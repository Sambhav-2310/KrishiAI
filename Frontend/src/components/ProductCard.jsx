import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
    return (
        <article className="card h-100 overflow-hidden">

            <img
                className="card-img-top product-image"
                src={product.imageUrl || 'https://placehold.co/600x400?text=KrishiAI'}
                alt={product.name}
            />

            <div className="card-body d-flex flex-column">

                <div className="d-flex justify-content-between align-items-center">
          <span className="badge text-bg-light text-success">
            {product.categoryName}
          </span>

                    <span className="small text-success">
            {product.status}
          </span>
                </div>

                <h5 className="mt-3">
                    {product.name}
                </h5>

                <p className="small text-muted mb-2">
                    <i className="bi bi-person me-1" />
                    {product.farmerName}

                    <span className="mx-1">·</span>

                    <i className="bi bi-geo-alt me-1" />
                    {product.location}
                </p>

                {product.description && (
                    <p className="small text-muted mb-3">
                        {product.description}
                    </p>
                )}

                <div className="mt-auto d-flex align-items-center justify-content-between">

                    <div>
                        <strong className="text-success fs-5">
                            ₹{product.price}
                        </strong>

                        <small className="text-muted">
                            {' '}/ {product.unit}
                        </small>
                    </div>

                    <Link
                        className="btn btn-outline-success btn-sm"
                        to={`/products/${product.id}`}
                    >
                        View details
                    </Link>

                </div>

            </div>
        </article>
    )
}