import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import About from './pages/About'
import AuthPage from './pages/AuthPage'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import ConsumerDashboard from './pages/ConsumerDashboard.jsx'
import ProductForm from './pages/ProductForm'
import ConsumerOrders from './pages/ConsumerOrders.jsx'
import Messages from './pages/Messages'
import AITools from './pages/AITools'
import Management from './pages/Management'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

import ConsumerCart from './pages/ConsumerCart.jsx'

import FarmerOrders from './pages/Farmer/FarmerOrders.jsx'
import FarmerDashboard from './pages/Farmer/FarmerDashboard.jsx'
import MyProducts from './pages/Farmer/MyProducts'

import AdminDashboard from './pages/Admin/AdminDashboard.jsx'
import AdminUsers from './pages/Admin/AdminUsers.jsx'
import AdminProducts from './pages/Admin/AdminProducts.jsx'
import AdminReportPage from './pages/Admin/AdminReportPage.jsx'
import AdminCategoryPage from './pages/admin/AdminCategoryPage'


// =========================================================
// SECURE ROUTE
// =========================================================

const Secure = ({ roles, children }) => (
    <ProtectedRoute roles={roles}>
        {children}
    </ProtectedRoute>
)


// =========================================================
// APP
// =========================================================

export default function App() {
    return (
        <AuthProvider>

            <BrowserRouter>

                <Navbar />

                <main className="min-vh-100">

                    <Routes>

                        {/* =================================================
                PUBLIC ROUTES
            ================================================= */}

                        <Route
                            path="/"
                            element={<Home />}
                        />

                        <Route
                            path="/about"
                            element={<About />}
                        />

                        <Route
                            path="/marketplace"
                            element={<Products />}
                        />

                        <Route
                            path="/products/:id"
                            element={<ProductDetails />}
                        />

                        <Route
                            path="/login"
                            element={<AuthPage />}
                        />

                        <Route
                            path="/register"
                            element={<AuthPage register />}
                        />


                        {/* =================================================
                COMMON AUTHENTICATED ROUTES
            ================================================= */}

                        <Route
                            path="/profile"
                            element={
                                <Secure
                                    roles={[
                                        'FARMER',
                                        'CONSUMER',
                                        'ADMIN'
                                    ]}
                                >
                                    <Profile />
                                </Secure>
                            }
                        />


                        <Route
                            path="/farmer/messages"
                            element={
                                <Secure
                                    roles={[
                                        'FARMER',
                                        'CONSUMER',
                                        'ADMIN'
                                    ]}
                                >
                                    <Messages />
                                </Secure>
                            }
                        />


                        <Route
                            path="/farmer/ai-tools"
                            element={
                                <Secure
                                    roles={[
                                        'FARMER',
                                        'CONSUMER',
                                        'ADMIN'
                                    ]}
                                >
                                    <AITools />
                                </Secure>
                            }
                        />


                        <Route
                            path="/consumer/messages"
                            element={
                                <Secure
                                    roles={[
                                        'CONSUMER',
                                        'FARMER',
                                        'ADMIN'
                                    ]}
                                >
                                    <Messages />
                                </Secure>
                            }
                        />


                        {/* =================================================
                FARMER DASHBOARD
            ================================================= */}

                        <Route
                            path="/farmer/dashboard"
                            element={
                                <Secure roles={['FARMER']}>
                                    <FarmerDashboard />
                                </Secure>
                            }
                        />


                        <Route
                            path="/farmer/analytics"
                            element={
                                <Secure roles={['FARMER']}>
                                    <ConsumerDashboard role="analytics" />
                                </Secure>
                            }
                        />


                        {/* =================================================
                FARMER PRODUCT MANAGEMENT
            ================================================= */}

                        <Route
                            path="/farmer/products"
                            element={
                                <Secure roles={['FARMER']}>
                                    <MyProducts />
                                </Secure>
                            }
                        />


                        <Route
                            path="/farmer/products/new"
                            element={
                                <Secure roles={['FARMER']}>
                                    <ProductForm />
                                </Secure>
                            }
                        />


                        <Route
                            path="/farmer/products/:id/edit"
                            element={
                                <Secure roles={['FARMER']}>
                                    <ProductForm />
                                </Secure>
                            }
                        />


                        {/* =================================================
                FARMER ORDERS
            ================================================= */}

                        <Route
                            path="/farmer/orders"
                            element={
                                <Secure roles={['FARMER']}>
                                    <FarmerOrders />
                                </Secure>
                            }
                        />


                        {/* =================================================
                CONSUMER DASHBOARD
            ================================================= */}

                        <Route
                            path="/consumer/dashboard"
                            element={
                                <Secure roles={['CONSUMER']}>
                                    <ConsumerDashboard role="consumer" />
                                </Secure>
                            }
                        />


                        <Route
                            path="/consumer/orders"
                            element={
                                <Secure roles={['CONSUMER']}>
                                    <ConsumerOrders role="consumer" />
                                </Secure>
                            }
                        />


                        <Route
                            path="/consumer/cart"
                            element={
                                <Secure roles={['CONSUMER']}>
                                    <ConsumerCart />
                                </Secure>
                            }
                        />


                        {/* =================================================
                ADMIN
            ================================================= */}

                        <Route
                            path="/admin/dashboard"
                            element={
                                <Secure roles={['ADMIN']}>
                                    <AdminDashboard />
                                </Secure>
                            }
                        />


                        <Route
                            path="/admin/users"
                            element={
                                <Secure roles={['ADMIN']}>
                                    <AdminUsers />
                                </Secure>
                            }
                        />


                        <Route
                            path="/admin/products"
                            element={
                                <Secure roles={['ADMIN']}>
                                    <AdminProducts />
                                </Secure>
                            }
                        />


                        <Route
                            path="/admin/reports"
                            element={
                                <Secure roles={['ADMIN']}>
                                    <AdminReportPage />
                                </Secure>
                            }
                        />


                        <Route
                            path="/admin/categories"
                            element={
                                <Secure roles={['ADMIN']}>
                                    <AdminCategoryPage />
                                </Secure>
                            }
                        />


                        {/* =================================================
                FALLBACK
            ================================================= */}

                        <Route
                            path="/404"
                            element={<NotFound />}
                        />

                        <Route
                            path="*"
                            element={
                                <Navigate
                                    to="/404"
                                    replace
                                />
                            }
                        />

                    </Routes>

                </main>

                <Footer />

            </BrowserRouter>

        </AuthProvider>
    )
}