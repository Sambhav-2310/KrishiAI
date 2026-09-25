import { useContext } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import logoMark from '../assets/logo/krishiai-mark.png'

export default function Navbar() {
    const { user, logout } = useContext(AuthContext)
    const go = useNavigate()

    const links =
        user?.role === 'FARMER'
            ? [
                ['Dashboard', '/farmer/dashboard'],
                ['Marketplace', '/marketplace'],
                ['My Products', '/farmer/products'],
                ['Orders', '/farmer/orders'],
                ['Messages', '/farmer/messages'],
                ['AI Tools', '/farmer/ai-tools']
            ]
            : user?.role === 'CONSUMER'
                ? [
                    ['Dashboard', '/consumer/dashboard'],
                    ['Marketplace', '/marketplace'],
                    ['My Cart', '/consumer/cart'],
                    ['My Orders', '/consumer/orders'],
                    ['Messages', '/consumer/messages']
                ]
                : user?.role === 'ADMIN'
                    ? [
                        ['Dashboard', '/admin/dashboard'],
                        ['Marketplace', '/marketplace'],
                        ['Users', '/admin/users'],
                        ['Products', '/admin/products'],
                        ['Categories', '/admin/categories'],
                        ['Reports', '/admin/reports']
                    ]
                    : [
                        ['Home', '/'],
                        ['Marketplace', '/marketplace'],
                        ['About', '/about']
                    ]

    return (
        <nav className="navbar navbar-expand-lg navbar-light sticky-top border-bottom shadow-sm">
            <div className="container">

                {/* LOGO */}

                <Link
                    className="navbar-brand fs-4 d-flex align-items-center"
                    to="/"
                >
                    <img
                        className="brand-logo"
                        src={logoMark}
                        alt="KrishiAI"
                    />

                    KrishiAI
                </Link>


                {/* MOBILE MENU */}

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#nav"
                    aria-controls="nav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon" />
                </button>


                {/* NAVIGATION */}

                <div
                    className="collapse navbar-collapse"
                    id="nav"
                >

                    <div className="navbar-nav ms-auto align-items-lg-center gap-lg-1">

                        {links.map(([name, path]) => (

                            <NavLink
                                key={name}
                                to={path}
                                className={({ isActive }) =>
                                    `nav-link ${
                                        isActive
                                            ? 'active fw-semibold text-success'
                                            : ''
                                    }`
                                }
                            >
                                {name}
                            </NavLink>

                        ))}


                        {/* USER */}

                        {user ? (

                            <>

                                <Link
                                    to="/profile"
                                    className="nav-link small d-flex align-items-center gap-1 text-decoration-none text-dark"
                                    title="View and edit profile"
                                >

                                    <i className="bi bi-person-circle text-success fs-5 me-1" />

                                    <span className="fw-semibold">
                                        Hi, {user.name}
                                    </span>

                                    <span className="badge text-bg-light border text-success">
                                        {user.role}
                                    </span>

                                </Link>


                                {/* LOGOUT */}

                                <button
                                    type="button"
                                    className="btn btn-outline-success btn-sm ms-lg-2"
                                    onClick={() => {
                                        logout()
                                        go('/')
                                    }}
                                >
                                    Logout
                                </button>

                            </>

                        ) : (

                            <>

                                <Link
                                    className="btn btn-outline-success btn-sm ms-lg-2"
                                    to="/login"
                                >
                                    Login
                                </Link>

                                <Link
                                    className="btn btn-success btn-sm ms-lg-1"
                                    to="/register"
                                >
                                    Join KrishiAI
                                </Link>

                            </>

                        )}

                    </div>

                </div>

            </div>
        </nav>
    )
}