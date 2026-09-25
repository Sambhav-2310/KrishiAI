import { useEffect, useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../services/Farmer/farmerProductService.js'

const initialFilters = {
  search: '',
  category: '',
  location: '',
  maxPrice: '',
  sort: 'recommended'
}

export default function Products() {
  const [all, setAll] = useState([])
  const [filters, setFilters] = useState(initialFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError('')

        const products = await getProducts()

        setAll(Array.isArray(products) ? products : [])
      } catch (err) {
        console.error('Failed to load products:', err)
        setError('Unable to load products.')
        setAll([])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const categories = useMemo(() => {
    return [
      ...new Set(
          all
              .map(product => product.categoryName)
              .filter(Boolean)
      )
    ]
  }, [all])

  const locations = useMemo(() => {
    return [
      ...new Set(
          all
              .map(product => product.location)
              .filter(Boolean)
      )
    ]
  }, [all])

  const filteredProducts = useMemo(() => {
    let products = [...all]

    const search = filters.search.trim().toLowerCase()

    if (search) {
      products = products.filter(product =>
          [
            product.name,
            product.description,
            product.categoryName,
            product.farmerName,
            product.location
          ]
              .filter(Boolean)
              .some(value =>
                  value.toLowerCase().includes(search)
              )
      )
    }

    if (filters.category) {
      products = products.filter(
          product => product.categoryName === filters.category
      )
    }

    if (filters.location) {
      products = products.filter(
          product => product.location === filters.location
      )
    }

    if (filters.maxPrice) {
      const maxPrice = Number(filters.maxPrice)

      products = products.filter(
          product => Number(product.price) <= maxPrice
      )
    }

    if (filters.sort === 'price-low') {
      products.sort(
          (a, b) => Number(a.price) - Number(b.price)
      )
    }

    if (filters.sort === 'price-high') {
      products.sort(
          (a, b) => Number(b.price) - Number(a.price)
      )
    }

    if (filters.sort === 'newest') {
      products.sort(
          (a, b) =>
              new Date(b.createdAt) - new Date(a.createdAt)
      )
    }

    return products
  }, [all, filters])

  const updateFilter = (name, value) => {
    setFilters(current => ({
      ...current,
      [name]: value
    }))
  }

  const clearFilters = () => {
    setFilters(initialFilters)
  }

  return (
      <main className="container py-5">

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <p className="section-label mb-1">
              Direct from farmers
            </p>

            <h1 className="mb-0">
              Marketplace
            </h1>
          </div>

          <span className="text-muted">
          {filteredProducts.length} products
        </span>
        </div>

        <div className="card p-3 mb-4">
          <div className="row g-3">

            <div className="col-md-4">
              <label className="form-label">
                Search
              </label>

              <input
                  type="text"
                  className="form-control"
                  placeholder="Search crops..."
                  value={filters.search}
                  onChange={e =>
                      updateFilter('search', e.target.value)
                  }
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Category
              </label>

              <select
                  className="form-select"
                  value={filters.category}
                  onChange={e =>
                      updateFilter('category', e.target.value)
                  }
              >
                <option value="">
                  All categories
                </option>

                {categories.map(category => (
                    <option
                        key={category}
                        value={category}
                    >
                      {category}
                    </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">
                Location
              </label>

              <select
                  className="form-select"
                  value={filters.location}
                  onChange={e =>
                      updateFilter('location', e.target.value)
                  }
              >
                <option value="">
                  All locations
                </option>

                {locations.map(location => (
                    <option
                        key={location}
                        value={location}
                    >
                      {location}
                    </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label">
                Max price
              </label>

              <input
                  type="number"
                  className="form-control"
                  placeholder="₹"
                  value={filters.maxPrice}
                  onChange={e =>
                      updateFilter('maxPrice', e.target.value)
                  }
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">
                Sort
              </label>

              <select
                  className="form-select"
                  value={filters.sort}
                  onChange={e =>
                      updateFilter('sort', e.target.value)
                  }
              >
                <option value="recommended">
                  Recommended
                </option>

                <option value="newest">
                  Newest
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>
              </select>
            </div>

            <div className="col-md-8 d-flex align-items-end">
              <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>

          </div>
        </div>

        {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-success" />
              <p className="mt-3 text-muted">
                Loading products...
              </p>
            </div>
        )}

        {!loading && error && (
            <div className="alert alert-danger">
              {error}
            </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-5">
              <h4>
                No products found
              </h4>

              <p className="text-muted">
                Try changing your filters or check back later.
              </p>
            </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
            <div className="row g-4">
              {filteredProducts.map(product => (
                  <div
                      className="col-md-6 col-lg-4"
                      key={product.id}
                  >
                    <ProductCard product={product} />
                  </div>
              ))}
            </div>
        )}

      </main>
  )
}