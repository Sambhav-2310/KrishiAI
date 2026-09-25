import { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { getProduct } from '../services/Farmer/farmerProductService.js'
import { addToCart } from '../services/cartService'
import { startConversation } from '../services/messageService'

export default function ProductDetails() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  const [product, setProduct] = useState()
  const [quantity, setQuantity] = useState('1')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    getProduct(id)
        .then(setProduct)
        .catch(error => {
          console.error('Unable to load product:', error)
        })
  }, [id])

  const isOwner =
      user &&
      product &&
      (
          user.name?.toLowerCase() ===
          product.farmerName?.toLowerCase() ||

          user.email?.toLowerCase() ===
          product.farmerEmail?.toLowerCase() ||

          (
              user.role === 'FARMER' &&
              user.name === product.farmerName
          )
      )


  // =========================================================
  // QUANTITY CHANGE
  // =========================================================

  const handleQuantityChange = event => {

    const value = event.target.value

    // Allow the user to completely clear the input
    if (value === '') {
      setQuantity('')
      return
    }

    // Allow only numbers and decimals
    if (!/^\d*\.?\d*$/.test(value)) {
      return
    }

    setQuantity(value)
  }


  // =========================================================
  // ADD TO CART
  // =========================================================

  const handleAddToCart = async () => {

    // User login check
    if (!user) {
      navigate('/login', {
        state: {
          from: location.pathname,
          message:
              'Please log in to add products to your cart.'
        }
      })

      return
    }


    // Consumer check
    if (user.role !== 'CONSUMER') {
      alert(
          'Only consumers can add products to the cart.'
      )

      return
    }


    // Product availability check
    if (!product || product.status !== 'ACTIVE') {

      alert(
          'This product is currently unavailable.'
      )

      return
    }


    // Convert input to number
    const selectedQuantity =
        Number(quantity)


    // Empty / invalid quantity
    if (
        quantity === '' ||
        !Number.isFinite(selectedQuantity) ||
        selectedQuantity <= 0
    ) {

      alert(
          'Please enter a valid quantity.'
      )

      return
    }


    // Available stock
    const availableQuantity =
        Number(product.quantity)


    if (
        !Number.isFinite(availableQuantity) ||
        availableQuantity <= 0
    ) {

      alert(
          'This product is out of stock.'
      )

      return
    }


    // Requested quantity greater than stock
    if (
        selectedQuantity >
        availableQuantity
    ) {

      alert(
          `Requested quantity is greater than available stock. Only ${availableQuantity} ${product.unit} available.`
      )

      return
    }


    try {

      await addToCart(
          product.id,
          selectedQuantity
      )


      alert(
          `${product.name} added to your cart.`
      )


      navigate(
          '/consumer/cart'
      )

    } catch (error) {

      console.error(
          'Unable to add product to cart:',
          error
      )


      alert(
          error.response?.data?.message ||
          'Unable to add product to cart.'
      )
    }
  }


  // =========================================================
  // CONTACT FARMER
  // =========================================================

  const contactFarmer = async () => {

    if (!user) {

      navigate('/login', {
        state: {
          from: location.pathname,
          message:
              'Please log in to contact the farmer.'
        }
      })

      return
    }


    try {

      const conv =
          await startConversation({

            productId:
            product.id,

            productName:
            product.name,

            farmerName:
                product.farmerName ||
                'Farmer',

            farmerEmail:
                product.farmerEmail ||
                '',

            consumerName:
                user.name ||
                user.email?.split('@')[0] ||
                'Customer',

            consumerEmail:
                user.email ||
                '',

            initialMessage:
                `Hello ${
                    product.farmerName ||
                    'Farmer'
                }, I am interested in your ${
                    product.name
                }. Is it available for order?`

          })


      setSent(true)


      const targetRoute =
          user.role === 'FARMER'
              ? '/farmer/messages'
              : '/consumer/messages'


      navigate(
          targetRoute,
          {
            state: {
              conversationId:
              conv.id
            }
          }
      )

    } catch (error) {

      console.error(
          'Unable to contact farmer:',
          error
      )


      alert(
          error.response?.data?.message ||
          'Unable to contact farmer.'
      )
    }
  }


  // =========================================================
  // LOADING
  // =========================================================

  if (!product) {

    return (

        <div className="text-center py-5">

          <div
              className="spinner-border text-success"
              role="status"
          >

          <span className="visually-hidden">
            Loading...
          </span>

          </div>

          <p className="text-muted mt-3">
            Loading product...
          </p>

        </div>
    )
  }


  // =========================================================
  // PAGE
  // =========================================================

  return (

      <section className="container py-5">

        <div className="row g-5">


          {/* =====================================================
            PRODUCT IMAGE
        ===================================================== */}

          <div className="col-lg-6">

            <img
                className="img-fluid rounded-4 shadow-sm w-100"
                src={
                    product.imageUrl ||
                    'https://placehold.co/800x600?text=KrishiAI+Product'
                }
                alt={product.name}
            />

          </div>


          {/* =====================================================
            PRODUCT INFORMATION
        ===================================================== */}

          <div className="col-lg-6">

          <span className="badge text-bg-light text-success">

            {product.categoryName}

          </span>


            <h1 className="mt-2">

              {product.name}

            </h1>


            {/* Rating */}

            <p className="text-warning">

              <i className="bi bi-star-fill" />

              {' '}

              {product.rating || 'No'} rating

            </p>


            {/* Price */}

            <h2 className="text-success">

              ₹
              {Number(product.price).toFixed(2)}

              <small className="fs-6 text-muted">

                {' '}/ {product.unit}

              </small>

            </h2>


            {/* Description */}

            <p>

              {product.description}

            </p>


            {/* Product Details */}

            <dl className="row">

              <dt className="col-5">
                Available quantity
              </dt>

              <dd className="col-7">

                {product.quantity}
                {' '}
                {product.unit}

              </dd>


              <dt className="col-5">
                Location
              </dt>

              <dd className="col-7">

                {product.location}

              </dd>


              <dt className="col-5">
                Farmer
              </dt>

              <dd className="col-7">

                {product.farmerName}

              </dd>

            </dl>


            {/* =================================================
              FARMER'S OWN PRODUCT
          ================================================= */}

            {isOwner ? (

                <div className="card p-3 bg-light border-0">

                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">

                    <div>

                  <span className="badge text-bg-success mb-1">

                    <i className="bi bi-person-check me-1" />

                    Your Product Listing

                  </span>


                      <p className="small text-muted mb-0">

                        You are the seller of this product.
                        You can update price, quantity, or details anytime.

                      </p>

                    </div>


                    <div className="d-flex gap-2">

                      <Link
                          className="btn btn-success"
                          to={`/farmer/products/${product.id}/edit`}
                      >

                        <i className="bi bi-pencil me-1" />

                        Edit Listing

                      </Link>


                      <Link
                          className="btn btn-outline-secondary"
                          to="/farmer/products"
                      >

                        <i className="bi bi-grid me-1" />

                        My Products

                      </Link>

                    </div>

                  </div>

                </div>

            ) : (

                /* =================================================
                   CONSUMER ACTIONS
                ================================================= */

                <>

                  <div className="d-flex gap-2 align-items-center flex-wrap">


                    {/* Quantity */}

                    <div
                        className="input-group"
                        style={{
                          width: '135px'
                        }}
                    >

                  <span className="input-group-text bg-white">

                    Qty

                  </span>


                      <input
                          type="text"
                          inputMode="decimal"
                          className="form-control"
                          value={quantity}
                          placeholder="1"
                          onChange={
                            handleQuantityChange
                          }
                          aria-label="Product quantity"
                      />

                    </div>


                    {/* Contact Farmer */}

                    <button
                        className="btn btn-outline-success"
                        onClick={
                          contactFarmer
                        }
                    >

                      <i className="bi bi-chat-dots me-1" />

                      Contact farmer

                    </button>


                    {/* Add To ConsumerCart */}

                    <button
                        className="btn btn-success"
                        onClick={
                          handleAddToCart
                        }
                        disabled={
                            product.status !== 'ACTIVE' ||
                            Number(product.quantity) <= 0
                        }
                    >

                      <i className="bi bi-cart-plus me-1" />


                      {product.status === 'SOLD_OUT'
                          ? 'Sold Out'
                          : 'Add to ConsumerCart'}

                    </button>

                  </div>


                  {/* Quantity helper */}

                  <div className="small text-muted mt-2">

                    <i className="bi bi-info-circle me-1" />

                    Available:
                    {' '}
                    {product.quantity}
                    {' '}
                    {product.unit}

                  </div>

                </>

            )}

          </div>

        </div>


        {/* =====================================================
          CUSTOMER REVIEWS
      ===================================================== */}

        <div className="card p-4 mt-5 border-0 shadow-sm">

          <h3 className="h5">

            Customer reviews

          </h3>


          <p className="mb-0 text-muted">

            <i className="bi bi-star-fill text-warning" />

            {' '}

            “Fresh and exactly as described.”

            {' '}

            — Verified buyer

          </p>

        </div>

      </section>
  )
}