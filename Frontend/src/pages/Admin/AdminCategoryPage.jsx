import { useEffect, useState } from "react";

import {
    getCategories,
    createCategory,
    updateCategory,
    deactivateCategory,
    activateCategory,
} from "../../services/Admin/adminService.js";


const emptyForm = {
    name: "",
    description: "",
    imageUrl: "",
};


function AdminCategoryPage() {

    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState(emptyForm);

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // =========================
    // LOAD CATEGORIES
    // =========================

    const loadCategories = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await getCategories();

            setCategories(data);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Failed to load categories."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadCategories();
    }, []);


    // =========================
    // FORM INPUT
    // =========================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    // =========================
    // RESET FORM
    // =========================

    const resetForm = () => {

        setForm(emptyForm);

        setEditingId(null);

        setError("");
    };


    // =========================
    // ADD / UPDATE
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        if (!form.name.trim()) {

            setError("Category name is required.");

            return;
        }


        try {

            setSaving(true);


            const payload = {

                name: form.name.trim(),

                description: form.description.trim(),

                imageUrl: form.imageUrl.trim(),

            };


            if (editingId) {

                await updateCategory(
                    editingId,
                    payload
                );

                setSuccess(
                    "Category updated successfully."
                );

            } else {

                await createCategory(payload);

                setSuccess(
                    "Category created successfully."
                );
            }


            resetForm();

            await loadCategories();


        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Failed to save category."
            );

        } finally {

            setSaving(false);

        }
    };


    // =========================
    // EDIT
    // =========================

    const handleEdit = (category) => {

        setEditingId(category.id);


        setForm({

            name: category.name || "",

            description: category.description || "",

            imageUrl: category.imageUrl || "",

        });


        setError("");

        setSuccess("");


        window.scrollTo({

            top: 0,

            behavior: "smooth",

        });
    };


    // =========================
    // ACTIVATE / DEACTIVATE
    // =========================

    const handleToggleStatus = async (category) => {

        const action = category.active
            ? "deactivate"
            : "activate";


        const confirmed = window.confirm(

            `Are you sure you want to ${action} "${category.name}"?`

        );


        if (!confirmed) {

            return;
        }


        try {

            setError("");

            setSuccess("");


            if (category.active) {

                await deactivateCategory(
                    category.id
                );


                setSuccess(
                    `Category "${category.name}" deactivated successfully.`
                );

            } else {

                await activateCategory(
                    category.id
                );


                setSuccess(
                    `Category "${category.name}" activated successfully.`
                );
            }


            await loadCategories();


        } catch (err) {

            console.error(err);


            setError(

                err.response?.data?.message ||

                err.response?.data ||

                `Failed to ${action} category.`

            );
        }
    };


    // =========================
    // RENDER
    // =========================

    return (

        <div className="container-fluid py-4">


            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">

                <div>

                    <h2 className="fw-bold mb-1">

                        Category Management

                    </h2>


                    <p className="text-muted mb-0">

                        Create and manage product categories.

                    </p>

                </div>


                <button

                    type="button"

                    className="btn btn-outline-primary"

                    onClick={loadCategories}

                    disabled={loading}

                >

                    <i className="bi bi-arrow-clockwise me-2"></i>


                    {loading
                        ? "Refreshing..."
                        : "Refresh"
                    }

                </button>

            </div>



            {/* =========================
                SUCCESS MESSAGE
            ========================= */}

            {success && (

                <div

                    className="alert alert-success alert-dismissible fade show"

                    role="alert"

                >

                    <i className="bi bi-check-circle me-2"></i>


                    {success}


                    <button

                        type="button"

                        className="btn-close"

                        onClick={() => setSuccess("")}

                    ></button>

                </div>

            )}



            {/* =========================
                ERROR MESSAGE
            ========================= */}

            {error && (

                <div

                    className="alert alert-danger alert-dismissible fade show"

                    role="alert"

                >

                    <i className="bi bi-exclamation-triangle me-2"></i>


                    {error}


                    <button

                        type="button"

                        className="btn-close"

                        onClick={() => setError("")}

                    ></button>

                </div>

            )}



            <div className="row g-4">


                {/* =========================
                    CATEGORY FORM
                ========================= */}

                <div className="col-lg-4">

                    <div className="card shadow-sm border-0">


                        <div className="card-header bg-primary text-white">

                            <h5 className="mb-0">

                                <i

                                    className={

                                        editingId

                                            ? "bi bi-pencil-square me-2"

                                            : "bi bi-plus-circle me-2"

                                    }

                                ></i>


                                {editingId

                                    ? "Edit Category"

                                    : "Add Category"

                                }

                            </h5>

                        </div>



                        <div className="card-body">


                            <form onSubmit={handleSubmit}>


                                {/* CATEGORY NAME */}

                                <div className="mb-3">

                                    <label className="form-label fw-semibold">

                                        Category Name

                                    </label>


                                    <input

                                        type="text"

                                        name="name"

                                        className="form-control"

                                        placeholder="Enter category name"

                                        value={form.name}

                                        onChange={handleChange}

                                        disabled={saving}

                                        required

                                    />

                                </div>



                                {/* DESCRIPTION */}

                                <div className="mb-3">

                                    <label className="form-label fw-semibold">

                                        Description

                                    </label>


                                    <textarea

                                        name="description"

                                        className="form-control"

                                        rows="4"

                                        placeholder="Enter category description"

                                        value={form.description}

                                        onChange={handleChange}

                                        disabled={saving}

                                    ></textarea>

                                </div>



                                {/* IMAGE URL */}

                                <div className="mb-3">

                                    <label className="form-label fw-semibold">

                                        Image URL

                                    </label>


                                    <input

                                        type="url"

                                        name="imageUrl"

                                        className="form-control"

                                        placeholder="https://example.com/image.jpg"

                                        value={form.imageUrl}

                                        onChange={handleChange}

                                        disabled={saving}

                                    />

                                </div>



                                {/* BUTTONS */}

                                <div className="d-flex gap-2">


                                    <button

                                        type="submit"

                                        className="btn btn-primary flex-grow-1"

                                        disabled={saving}

                                    >

                                        {saving ? (

                                            <>

                                                <span

                                                    className="spinner-border spinner-border-sm me-2"

                                                    role="status"

                                                ></span>


                                                Saving...

                                            </>

                                        ) : (

                                            <>

                                                <i

                                                    className={

                                                        editingId

                                                            ? "bi bi-check-lg me-2"

                                                            : "bi bi-plus-lg me-2"

                                                    }

                                                ></i>


                                                {editingId

                                                    ? "Update Category"

                                                    : "Add Category"

                                                }

                                            </>

                                        )}

                                    </button>



                                    {editingId && (

                                        <button

                                            type="button"

                                            className="btn btn-secondary"

                                            onClick={resetForm}

                                            disabled={saving}

                                        >

                                            Cancel

                                        </button>

                                    )}

                                </div>


                            </form>

                        </div>

                    </div>

                </div>



                {/* =========================
                    CATEGORY TABLE
                ========================= */}

                <div className="col-lg-8">

                    <div className="card shadow-sm border-0">


                        <div className="card-header bg-white">

                            <div className="d-flex justify-content-between align-items-center">

                                <h5 className="mb-0 fw-bold">

                                    Categories

                                </h5>


                                <span className="badge bg-primary">

                                    {categories.length}

                                </span>

                            </div>

                        </div>



                        <div className="card-body p-0">


                            {loading ? (

                                /* =========================
                                   LOADING
                                ========================= */

                                <div className="text-center py-5">

                                    <div

                                        className="spinner-border text-primary"

                                        role="status"

                                    ></div>


                                    <p className="text-muted mt-3 mb-0">

                                        Loading categories...

                                    </p>

                                </div>


                            ) : categories.length === 0 ? (

                                /* =========================
                                   EMPTY
                                ========================= */

                                <div className="text-center py-5">

                                    <i

                                        className="bi bi-folder-x text-muted"

                                        style={{
                                            fontSize: "3rem"
                                        }}

                                    ></i>


                                    <h5 className="mt-3">

                                        No categories found

                                    </h5>


                                    <p className="text-muted">

                                        Add your first category using the form.

                                    </p>

                                </div>


                            ) : (

                                /* =========================
                                   TABLE
                                ========================= */

                                <div className="table-responsive">

                                    <table className="table table-hover align-middle mb-0">


                                        <thead className="table-light">

                                        <tr>

                                            <th>ID</th>

                                            <th>Category</th>

                                            <th>Description</th>

                                            <th>Status</th>

                                            <th className="text-end">

                                                Actions

                                            </th>

                                        </tr>

                                        </thead>



                                        <tbody>


                                        {categories.map(
                                            (category) => (

                                                <tr
                                                    key={category.id}
                                                >


                                                    {/* ID */}

                                                    <td>

                                                        #{category.id}

                                                    </td>



                                                    {/* CATEGORY */}

                                                    <td>

                                                        <div className="d-flex align-items-center">


                                                            {category.imageUrl ? (

                                                                <img

                                                                    src={category.imageUrl}

                                                                    alt={category.name}

                                                                    className="rounded me-3"

                                                                    style={{

                                                                        width: "45px",

                                                                        height: "45px",

                                                                        objectFit: "cover",

                                                                    }}

                                                                    onError={(e) => {

                                                                        e.currentTarget.style.display =
                                                                            "none";

                                                                    }}

                                                                />

                                                            ) : (

                                                                <div

                                                                    className="bg-light rounded d-flex align-items-center justify-content-center me-3"

                                                                    style={{

                                                                        width: "45px",

                                                                        height: "45px",

                                                                    }}

                                                                >

                                                                    <i className="bi bi-folder text-primary"></i>

                                                                </div>

                                                            )}



                                                            <div>

                                                                <div className="fw-semibold">

                                                                    {category.name}

                                                                </div>

                                                            </div>

                                                        </div>

                                                    </td>



                                                    {/* DESCRIPTION */}

                                                    <td>

                                                            <span className="text-muted">

                                                                {category.description

                                                                    ? category.description

                                                                    : "No description"

                                                                }

                                                            </span>

                                                    </td>



                                                    {/* STATUS */}

                                                    <td>

                                                        {category.active ? (

                                                            <span className="badge bg-success">

                                                                    Active

                                                                </span>

                                                        ) : (

                                                            <span className="badge bg-secondary">

                                                                    Inactive

                                                                </span>

                                                        )}

                                                    </td>



                                                    {/* ACTIONS */}

                                                    <td className="text-end">

                                                        <div className="d-flex justify-content-end gap-2">


                                                            {/* EDIT */}

                                                            <button

                                                                type="button"

                                                                className="btn btn-sm btn-outline-primary"

                                                                onClick={() =>
                                                                    handleEdit(category)
                                                                }

                                                                title="Edit category"

                                                            >

                                                                <i className="bi bi-pencil"></i>

                                                            </button>



                                                            {/* ACTIVATE / DEACTIVATE */}

                                                            <button

                                                                type="button"

                                                                className={

                                                                    category.active

                                                                        ? "btn btn-sm btn-outline-danger"

                                                                        : "btn btn-sm btn-outline-success"

                                                                }

                                                                onClick={() =>
                                                                    handleToggleStatus(
                                                                        category
                                                                    )
                                                                }

                                                                title={

                                                                    category.active

                                                                        ? "Deactivate category"

                                                                        : "Activate category"

                                                                }

                                                            >

                                                                <i

                                                                    className={

                                                                        category.active

                                                                            ? "bi bi-toggle-on"

                                                                            : "bi bi-toggle-off"

                                                                    }

                                                                ></i>

                                                            </button>


                                                        </div>

                                                    </td>


                                                </tr>

                                            )
                                        )}


                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );
}


export default AdminCategoryPage;