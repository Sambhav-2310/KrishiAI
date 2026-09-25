import { useEffect, useState } from 'react'
import {
    getAdminUsers,
    updateAdminUserStatus
} from '../../services/Admin/adminUserService.js'

export default function AdminUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [updatingId, setUpdatingId] = useState(null)

    const loadUsers = async () => {
        try {
            setLoading(true)
            setError('')

            const data = await getAdminUsers()
            setUsers(data)
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to load users'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUsers()
    }, [])

    const handleStatusChange = async (userId, status) => {
        try {
            setUpdatingId(userId)
            setError('')

            const updatedUser = await updateAdminUserStatus(
                userId,
                status
            )

            setUsers(prev =>
                prev.map(user =>
                    user.id === updatedUser.id
                        ? updatedUser
                        : user
                )
            )
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to update user status'
            )
        } finally {
            setUpdatingId(null)
        }
    }

    const getStatusBadge = status => {
        if (status === 'ACTIVE') {
            return 'bg-success'
        }

        if (status === 'BLOCKED') {
            return 'bg-danger'
        }

        return 'bg-secondary'
    }

    const getRoleBadge = role => {
        if (role === 'ADMIN') {
            return 'bg-dark'
        }

        if (role === 'FARMER') {
            return 'bg-success'
        }

        return 'bg-primary'
    }

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div
                    className="spinner-border"
                    role="status"
                />
                <p className="mt-3 text-muted">
                    Loading users...
                </p>
            </div>
        )
    }

    return (
        <div className="container py-4">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">
                        User Management
                    </h2>
                    <p className="text-muted mb-0">
                        Manage KrishiAI users and account status.
                    </p>
                </div>

                <button
                    className="btn btn-outline-primary"
                    onClick={loadUsers}
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            <div className="row g-3 mb-4">

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <small className="text-muted">
                                Total Users
                            </small>
                            <h3 className="fw-bold mb-0">
                                {users.length}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <small className="text-muted">
                                Farmers
                            </small>
                            <h3 className="fw-bold mb-0">
                                {
                                    users.filter(
                                        user => user.role === 'FARMER'
                                    ).length
                                }
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <small className="text-muted">
                                Consumers
                            </small>
                            <h3 className="fw-bold mb-0">
                                {
                                    users.filter(
                                        user => user.role === 'CONSUMER'
                                    ).length
                                }
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <small className="text-muted">
                                Blocked
                            </small>
                            <h3 className="fw-bold text-danger mb-0">
                                {
                                    users.filter(
                                        user => user.status === 'BLOCKED'
                                    ).length
                                }
                            </h3>
                        </div>
                    </div>
                </div>

            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">

                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">

                            <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>User</th>
                                <th>Contact</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Location</th>
                                <th>Action</th>
                            </tr>
                            </thead>

                            <tbody>

                            {users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="text-center py-5 text-muted"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id}>

                                        <td>
                                            #{user.id}
                                        </td>

                                        <td>
                                            <div className="fw-semibold">
                                                {user.name}
                                            </div>
                                            <small className="text-muted">
                                                {user.email}
                                            </small>
                                        </td>

                                        <td>
                                            {user.phone}
                                        </td>

                                        <td>
                                                <span
                                                    className={`badge ${getRoleBadge(
                                                        user.role
                                                    )}`}
                                                >
                                                    {user.role}
                                                </span>
                                        </td>

                                        <td>
                                                <span
                                                    className={`badge ${getStatusBadge(
                                                        user.status
                                                    )}`}
                                                >
                                                    {user.status}
                                                </span>
                                        </td>

                                        <td>
                                            <small>
                                                {[
                                                    user.city,
                                                    user.state
                                                ]
                                                    .filter(Boolean)
                                                    .join(', ') || '-'}
                                            </small>
                                        </td>

                                        <td>

                                            {user.role === 'ADMIN' ? (
                                                <span className="text-muted small">
                                                        Protected
                                                    </span>
                                            ) : user.status === 'BLOCKED' ? (
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    disabled={
                                                        updatingId ===
                                                        user.id
                                                    }
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            user.id,
                                                            'ACTIVE'
                                                        )
                                                    }
                                                >
                                                    {updatingId ===
                                                    user.id
                                                        ? 'Updating...'
                                                        : 'Activate'}
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    disabled={
                                                        updatingId ===
                                                        user.id
                                                    }
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            user.id,
                                                            'BLOCKED'
                                                        )
                                                    }
                                                >
                                                    {updatingId ===
                                                    user.id
                                                        ? 'Updating...'
                                                        : 'Block'}
                                                </button>
                                            )}

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