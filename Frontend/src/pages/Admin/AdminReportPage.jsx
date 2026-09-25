import { useEffect, useState } from "react";
import { getAdminReport } from "../../services/Admin/adminService.js";

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
} from "chart.js";

import { Doughnut, Bar } from "react-chartjs-2";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement
);

function AdminReportPage() {
    const [report, setReport] = useState(null);

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
     * When both dates are selected, the report is considered filtered.
     *
     * Filtered mode:
     * - Orders
     * - Payments
     * - Order chart
     * - Payment chart
     * - Revenue summary
     *
     * Hidden in filtered mode:
     * - Users
     * - Products
     * - Product status chart
     */
    const isFiltered = Boolean(fromDate && toDate);

    useEffect(() => {
        loadReport();
    }, []);

    const loadReport = async (from = "", to = "") => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminReport(from, to);

            setReport(data);
        } catch (err) {
            console.error("Admin report error:", err);
            setError("Failed to load admin report.");
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       FILTER
    ===================================================== */

    const handleApplyFilter = () => {
        setError("");

        if (!fromDate || !toDate) {
            setError("Please select both From Date and To Date.");
            return;
        }

        if (fromDate > toDate) {
            setError("From Date cannot be after To Date.");
            return;
        }

        loadReport(fromDate, toDate);
    };

    const handleRefresh = () => {
        if (fromDate && toDate) {
            loadReport(fromDate, toDate);
        } else {
            loadReport();
        }
    };

    const handleClearFilter = () => {
        setFromDate("");
        setToDate("");
        setError("");

        loadReport();
    };

    /* =====================================================
       CSV EXPORT
    ===================================================== */

    const handleExportCSV = () => {
        if (!report) {
            return;
        }

        const rows = [
            ["KRISHIAI ADMIN REPORT"],
            [],

            ...(isFiltered
                ? [["Report Period", `${fromDate} to ${toDate}`], []]
                : []),

            /*
             * Users and Products are exported only when
             * there is no date filter.
             */
            ...(!isFiltered
                ? [
                    ["USERS"],
                    ["Total Users", report.users.total],
                    ["Farmers", report.users.farmers],
                    ["Consumers", report.users.consumers],
                    ["Active Users", report.users.active],
                    ["Blocked Users", report.users.blocked],

                    [],

                    ["PRODUCTS"],
                    ["Total Products", report.products.total],
                    ["Active Products", report.products.active],
                    ["Sold Out", report.products.soldOut],
                    ["Inactive Products", report.products.inactive],

                    [],
                ]
                : []),

            ["ORDERS"],
            ["Total Orders", report.orders.total],
            ["Pending", report.orders.pending],
            ["Confirmed", report.orders.confirmed],
            ["Processing", report.orders.processing],
            ["Shipped", report.orders.shipped],
            ["Delivered", report.orders.delivered],
            ["Cancelled", report.orders.cancelled],

            [],

            ["PAYMENTS"],
            ["Paid Orders", report.payments.paidOrders],
            ["Pending Payments", report.payments.pendingPayments],
            ["Failed Payments", report.payments.failedPayments],
            ["Refunded Payments", report.payments.refundedPayments],
            ["Total Revenue", report.payments.totalRevenue],
        ];

        const csvContent = rows
            .map((row) =>
                row
                    .map(
                        (value) =>
                            `"${String(value).replace(/"/g, '""')}"`
                    )
                    .join(",")
            )
            .join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        const fileName =
            isFiltered
                ? `krishiai-report-${fromDate}-to-${toDate}.csv`
                : "krishiai-admin-report.csv";

        link.setAttribute("download", fileName);

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    /* =====================================================
       PDF EXPORT
    ===================================================== */

    const handleExportPDF = () => {
        if (!report) {
            return;
        }

        const doc = new jsPDF();

        const pageWidth = doc.internal.pageSize.getWidth();

        /* =====================================================
           HEADER
        ===================================================== */

        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");

        doc.text(
            "KrishiAI Admin Report",
            pageWidth / 2,
            20,
            {
                align: "center",
            }
        );

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        doc.text(
            "Agricultural Marketplace Management Report",
            pageWidth / 2,
            27,
            {
                align: "center",
            }
        );

        /* =====================================================
           REPORT PERIOD
        ===================================================== */

        let currentY = 38;

        if (isFiltered) {
            doc.text(
                `Report Period: ${fromDate} to ${toDate}`,
                14,
                currentY
            );

            currentY += 7;
        } else {
            doc.text(
                "Report Period: Default",
                14,
                currentY
            );

            currentY += 7;
        }

        doc.text(
            `Generated: ${new Date().toLocaleString("en-IN")}`,
            14,
            currentY
        );

        currentY += 10;

        /* =====================================================
           USERS + PRODUCTS
           ONLY FOR UNFILTERED REPORT
        ===================================================== */

        if (!isFiltered) {
            /* =====================================================
               USERS TABLE
            ===================================================== */

            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");

            doc.text(
                "Users",
                14,
                currentY
            );

            currentY += 4;

            autoTable(doc, {
                startY: currentY,

                head: [
                    ["Metric", "Value"],
                ],

                body: [
                    ["Total Users", report.users.total],
                    ["Farmers", report.users.farmers],
                    ["Consumers", report.users.consumers],
                    ["Active Users", report.users.active],
                    ["Blocked Users", report.users.blocked],
                ],

                theme: "striped",

                headStyles: {
                    fillColor: [25, 135, 84],
                },
            });

            currentY = doc.lastAutoTable.finalY + 12;

            /* =====================================================
               PRODUCTS TABLE
            ===================================================== */

            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");

            doc.text(
                "Products",
                14,
                currentY
            );

            currentY += 4;

            autoTable(doc, {
                startY: currentY,

                head: [
                    ["Metric", "Value"],
                ],

                body: [
                    ["Total Products", report.products.total],
                    ["Active Products", report.products.active],
                    ["Sold Out", report.products.soldOut],
                    ["Inactive Products", report.products.inactive],
                ],

                theme: "striped",

                headStyles: {
                    fillColor: [13, 110, 253],
                },
            });

            currentY = doc.lastAutoTable.finalY + 12;
        }

        /* =====================================================
           ORDERS TABLE
        ===================================================== */

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");

        doc.text(
            "Orders",
            14,
            currentY
        );

        currentY += 4;

        autoTable(doc, {
            startY: currentY,

            head: [
                ["Order Status", "Count"],
            ],

            body: [
                ["Total Orders", report.orders.total],
                ["Pending", report.orders.pending],
                ["Confirmed", report.orders.confirmed],
                ["Processing", report.orders.processing],
                ["Shipped", report.orders.shipped],
                ["Delivered", report.orders.delivered],
                ["Cancelled", report.orders.cancelled],
            ],

            theme: "striped",

            headStyles: {
                fillColor: [111, 66, 193],
            },
        });

        currentY = doc.lastAutoTable.finalY + 12;

        /* =====================================================
           PAYMENT TABLE
        ===================================================== */

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");

        doc.text(
            "Payments",
            14,
            currentY
        );

        currentY += 4;

        autoTable(doc, {
            startY: currentY,

            head: [
                ["Payment Metric", "Value"],
            ],

            body: [
                [
                    "Paid Orders",
                    report.payments.paidOrders,
                ],
                [
                    "Pending Payments",
                    report.payments.pendingPayments,
                ],
                [
                    "Failed Payments",
                    report.payments.failedPayments,
                ],
                [
                    "Refunded Payments",
                    report.payments.refundedPayments,
                ],
                [
                    "Total Revenue",
                    `Rs. ${Number(
                        report.payments.totalRevenue
                    ).toLocaleString("en-IN")}`,
                ],
            ],

            theme: "striped",

            headStyles: {
                fillColor: [255, 193, 7],
            },
        });

        currentY = doc.lastAutoTable.finalY + 12;

        /* =====================================================
           REVENUE SUMMARY
        ===================================================== */

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");

        doc.text(
            "Revenue Summary",
            14,
            currentY
        );

        currentY += 4;

        const averageOrderValue =
            report.payments.paidOrders > 0
                ? Number(report.payments.totalRevenue) /
                report.payments.paidOrders
                : 0;

        autoTable(doc, {
            startY: currentY,

            head: [
                ["Metric", "Amount"],
            ],

            body: [
                [
                    "Total Revenue",
                    `Rs. ${Number(
                        report.payments.totalRevenue
                    ).toLocaleString("en-IN")}`,
                ],
                [
                    "Paid Orders",
                    report.payments.paidOrders,
                ],
                [
                    "Average Order Value",
                    `Rs. ${averageOrderValue.toLocaleString(
                        "en-IN",
                        {
                            maximumFractionDigits: 2,
                        }
                    )}`,
                ],
            ],

            theme: "grid",

            headStyles: {
                fillColor: [25, 135, 84],
            },
        });

        /* =====================================================
           FOOTER
        ===================================================== */

        const pageCount =
            doc.internal.getNumberOfPages();

        for (
            let page = 1;
            page <= pageCount;
            page++
        ) {
            doc.setPage(page);

            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");

            doc.text(
                `KrishiAI Admin Report - Page ${page} of ${pageCount}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                {
                    align: "center",
                }
            );
        }

        /* =====================================================
           SAVE
        ===================================================== */

        const fileName =
            isFiltered
                ? `krishiai-report-${fromDate}-to-${toDate}.pdf`
                : "krishiai-admin-report.pdf";

        doc.save(fileName);
    };

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading && !report) {
        return (
            <div className="container-fluid py-5">
                <div className="text-center">
                    <div
                        className="spinner-border text-primary"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Loading...
                        </span>
                    </div>

                    <p className="text-muted mt-3">
                        Loading admin report...
                    </p>
                </div>
            </div>
        );
    }

    /* =====================================================
       ERROR
    ===================================================== */

    if (!report) {
        return (
            <div className="container-fluid py-4">
                <div className="alert alert-danger">
                    {error || "Unable to load admin report."}
                </div>

                <button
                    className="btn btn-primary"
                    onClick={() => loadReport()}
                >
                    Try Again
                </button>
            </div>
        );
    }

    /* =====================================================
       CHART DATA
    ===================================================== */

    const orderChartData = {
        labels: [
            "Pending",
            "Confirmed",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled",
        ],

        datasets: [
            {
                label: "Orders",

                data: [
                    report.orders.pending,
                    report.orders.confirmed,
                    report.orders.processing,
                    report.orders.shipped,
                    report.orders.delivered,
                    report.orders.cancelled,
                ],

                backgroundColor: [
                    "#ffc107",
                    "#0d6efd",
                    "#6f42c1",
                    "#0dcaf0",
                    "#198754",
                    "#dc3545",
                ],

                borderWidth: 1,
            },
        ],
    };

    const paymentChartData = {
        labels: [
            "Paid",
            "Pending",
            "Failed",
            "Refunded",
        ],

        datasets: [
            {
                label: "Payments",

                data: [
                    report.payments.paidOrders,
                    report.payments.pendingPayments,
                    report.payments.failedPayments,
                    report.payments.refundedPayments,
                ],

                backgroundColor: [
                    "#198754",
                    "#ffc107",
                    "#dc3545",
                    "#6c757d",
                ],

                borderWidth: 1,
            },
        ],
    };

    const productChartData = {
        labels: [
            "Active",
            "Sold Out",
            "Inactive",
        ],

        datasets: [
            {
                label: "Products",

                data: [
                    report.products.active,
                    report.products.soldOut,
                    report.products.inactive,
                ],

                backgroundColor: [
                    "#198754",
                    "#ffc107",
                    "#6c757d",
                ],

                borderWidth: 1,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                position: "bottom",
            },
        },
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                display: false,
            },
        },

        scales: {
            y: {
                beginAtZero: true,

                ticks: {
                    precision: 0,
                },
            },
        },
    };

    return (
        <div className="container-fluid py-4">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

                <div>
                    <h2 className="fw-bold mb-1">
                        Admin Reports
                    </h2>

                    <p className="text-muted mb-0">
                        {isFiltered
                            ? `Orders and payments from ${fromDate} to ${toDate}`
                            : "Overview of users, products, orders and payments"}
                    </p>
                </div>

                <div className="d-flex gap-2 flex-wrap">

                    <button
                        className="btn btn-success"
                        onClick={handleExportCSV}
                        disabled={loading}
                    >
                        <i className="bi bi-file-earmark-spreadsheet me-2"></i>
                        Export CSV
                    </button>

                    <button
                        className="btn btn-danger"
                        onClick={handleExportPDF}
                        disabled={loading}
                    >
                        <i className="bi bi-file-earmark-pdf me-2"></i>
                        Export PDF
                    </button>

                    <button
                        className="btn btn-outline-primary"
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        <i className="bi bi-arrow-clockwise me-2"></i>

                        {loading
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>

                </div>

            </div>

            {/* =================================================
                DATE FILTER
            ================================================= */}

            <div className="card border-0 shadow-sm mb-4">

                <div className="card-body">

                    <div className="d-flex align-items-center mb-3">

                        <i className="bi bi-calendar3 fs-4 text-primary me-2"></i>

                        <div>
                            <h5 className="fw-bold mb-0">
                                Report Period
                            </h5>

                            <small className="text-muted">
                                Select a date range for orders and payments
                            </small>
                        </div>

                    </div>

                    <div className="row g-3 align-items-end">

                        <div className="col-12 col-md-4">

                            <label className="form-label fw-semibold">
                                From Date
                            </label>

                            <input
                                type="date"
                                className="form-control"
                                value={fromDate}
                                onChange={(e) =>
                                    setFromDate(e.target.value)
                                }
                            />

                        </div>

                        <div className="col-12 col-md-4">

                            <label className="form-label fw-semibold">
                                To Date
                            </label>

                            <input
                                type="date"
                                className="form-control"
                                value={toDate}
                                onChange={(e) =>
                                    setToDate(e.target.value)
                                }
                            />

                        </div>

                        <div className="col-12 col-md-4">

                            <div className="d-flex gap-2">

                                <button
                                    className="btn btn-primary flex-grow-1"
                                    onClick={handleApplyFilter}
                                    disabled={loading}
                                >
                                    <i className="bi bi-funnel me-2"></i>
                                    Apply Filter
                                </button>

                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={handleClearFilter}
                                    disabled={loading}
                                    title="Clear filter"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* =================================================
                FILTERED REPORT INDICATOR
            ================================================= */}

            {isFiltered && (
                <div className="alert alert-info d-flex align-items-center justify-content-between">

                    <div>
                        <i className="bi bi-funnel-fill me-2"></i>

                        <strong>Filtered Report:</strong>{" "}

                        Showing only orders and payments from{" "}
                        {fromDate} to {toDate}.
                    </div>

                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={handleClearFilter}
                        disabled={loading}
                    >
                        Clear Filter
                    </button>

                </div>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="alert alert-danger">

                    <i className="bi bi-exclamation-triangle me-2"></i>

                    {error}

                </div>
            )}

            {/* =================================================
                USERS
                HIDDEN WHEN FILTER IS ACTIVE
            ================================================= */}

            {!isFiltered && (
                <ReportSection
                    title="Users"
                    icon="bi-people"
                >

                    <ReportCard
                        title="Total Users"
                        value={report.users.total}
                        icon="bi-people"
                    />

                    <ReportCard
                        title="Farmers"
                        value={report.users.farmers}
                        icon="bi-person-badge"
                    />

                    <ReportCard
                        title="Consumers"
                        value={report.users.consumers}
                        icon="bi-person"
                    />

                    <ReportCard
                        title="Active Users"
                        value={report.users.active}
                        icon="bi-person-check"
                    />

                    <ReportCard
                        title="Blocked Users"
                        value={report.users.blocked}
                        icon="bi-person-x"
                    />

                </ReportSection>
            )}

            {/* =================================================
                PRODUCTS
                HIDDEN WHEN FILTER IS ACTIVE
            ================================================= */}

            {!isFiltered && (
                <ReportSection
                    title="Products"
                    icon="bi-box-seam"
                >

                    <ReportCard
                        title="Total Products"
                        value={report.products.total}
                        icon="bi-box-seam"
                    />

                    <ReportCard
                        title="Active Products"
                        value={report.products.active}
                        icon="bi-check-circle"
                    />

                    <ReportCard
                        title="Sold Out"
                        value={report.products.soldOut}
                        icon="bi-bag-x"
                    />

                    <ReportCard
                        title="Inactive Products"
                        value={report.products.inactive}
                        icon="bi-eye-slash"
                    />

                </ReportSection>
            )}

            {/* =================================================
                ORDERS
            ================================================= */}

            <ReportSection
                title="Orders"
                icon="bi-cart"
            >

                <ReportCard
                    title="Total Orders"
                    value={report.orders.total}
                    icon="bi-cart"
                />

                <ReportCard
                    title="Pending"
                    value={report.orders.pending}
                    icon="bi-hourglass"
                />

                <ReportCard
                    title="Confirmed"
                    value={report.orders.confirmed}
                    icon="bi-check2-circle"
                />

                <ReportCard
                    title="Processing"
                    value={report.orders.processing}
                    icon="bi-arrow-repeat"
                />

                <ReportCard
                    title="Shipped"
                    value={report.orders.shipped}
                    icon="bi-truck"
                />

                <ReportCard
                    title="Delivered"
                    value={report.orders.delivered}
                    icon="bi-box2"
                />

                <ReportCard
                    title="Cancelled"
                    value={report.orders.cancelled}
                    icon="bi-x-circle"
                />

            </ReportSection>

            {/* =================================================
                PAYMENTS
            ================================================= */}

            <ReportSection
                title="Payments"
                icon="bi-credit-card"
            >

                <ReportCard
                    title="Paid Orders"
                    value={report.payments.paidOrders}
                    icon="bi-credit-card"
                />

                <ReportCard
                    title="Pending Payments"
                    value={report.payments.pendingPayments}
                    icon="bi-clock"
                />

                <ReportCard
                    title="Failed Payments"
                    value={report.payments.failedPayments}
                    icon="bi-exclamation-circle"
                />

                <ReportCard
                    title="Refunded Payments"
                    value={report.payments.refundedPayments}
                    icon="bi-arrow-counterclockwise"
                />

                <ReportCard
                    title="Total Revenue"
                    value={`₹ ${Number(
                        report.payments.totalRevenue
                    ).toLocaleString("en-IN")}`}
                    icon="bi-currency-rupee"
                />

            </ReportSection>

            {/* =================================================
                CHARTS
            ================================================= */}

            <div className="row g-4 mt-1">

                {/* =================================================
                    ORDER CHART
                ================================================= */}

                <div className="col-12 col-lg-6">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body">

                            <h5 className="fw-bold mb-3">

                                <i className="bi bi-pie-chart text-primary me-2"></i>

                                Order Status

                            </h5>

                            <div style={{ height: "350px" }}>

                                <Doughnut
                                    data={orderChartData}
                                    options={doughnutOptions}
                                />

                            </div>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    PAYMENT CHART
                ================================================= */}

                <div className="col-12 col-lg-6">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body">

                            <h5 className="fw-bold mb-3">

                                <i className="bi bi-pie-chart-fill text-primary me-2"></i>

                                Payment Status

                            </h5>

                            <div style={{ height: "350px" }}>

                                <Doughnut
                                    data={paymentChartData}
                                    options={doughnutOptions}
                                />

                            </div>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    PRODUCT CHART
                    HIDDEN WHEN FILTER IS ACTIVE
                ================================================= */}

                {!isFiltered && (
                    <div className="col-12">

                        <div className="card border-0 shadow-sm">

                            <div className="card-body">

                                <h5 className="fw-bold mb-3">

                                    <i className="bi bi-bar-chart text-primary me-2"></i>

                                    Product Status

                                </h5>

                                <div style={{ height: "350px" }}>

                                    <Bar
                                        data={productChartData}
                                        options={barOptions}
                                    />

                                </div>

                            </div>

                        </div>

                    </div>
                )}

                {/* =================================================
                    REVENUE SUMMARY
                ================================================= */}

                <div className="col-12">

                    <div className="card border-0 shadow-sm">

                        <div className="card-body">

                            <h5 className="fw-bold mb-4">

                                <i className="bi bi-currency-rupee text-primary me-2"></i>

                                Revenue Summary

                            </h5>

                            <div className="row g-3">

                                {/* TOTAL REVENUE */}

                                <div className="col-12 col-md-4">

                                    <div className="border rounded p-4">

                                        <small className="text-muted">
                                            Total Revenue
                                        </small>

                                        <h3 className="fw-bold mt-2 mb-0">

                                            ₹{" "}

                                            {Number(
                                                report.payments.totalRevenue
                                            ).toLocaleString("en-IN")}

                                        </h3>

                                    </div>

                                </div>

                                {/* PAID ORDERS */}

                                <div className="col-12 col-md-4">

                                    <div className="border rounded p-4">

                                        <small className="text-muted">
                                            Paid Orders
                                        </small>

                                        <h3 className="fw-bold mt-2 mb-0">

                                            {report.payments.paidOrders}

                                        </h3>

                                    </div>

                                </div>

                                {/* AVERAGE ORDER VALUE */}

                                <div className="col-12 col-md-4">

                                    <div className="border rounded p-4">

                                        <small className="text-muted">
                                            Average Order Value
                                        </small>

                                        <h3 className="fw-bold mt-2 mb-0">

                                            ₹{" "}

                                            {calculateAverageOrderValue(
                                                report
                                            ).toLocaleString(
                                                "en-IN",
                                                {
                                                    maximumFractionDigits: 2,
                                                }
                                            )}

                                        </h3>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

/* =====================================================
   REPORT SECTION
===================================================== */

function ReportSection({
                           title,
                           icon,
                           children,
                       }) {
    return (
        <div className="mb-4">

            <div className="d-flex align-items-center mb-3">

                <i
                    className={`bi ${icon} fs-4 text-primary me-2`}
                ></i>

                <h5 className="fw-bold mb-0">
                    {title}
                </h5>

            </div>

            <div className="row g-3">
                {children}
            </div>

        </div>
    );
}

/* =====================================================
   REPORT CARD
===================================================== */

function ReportCard({
                        title,
                        value,
                        icon,
                    }) {
    return (
        <div className="col-12 col-sm-6 col-lg-3">

            <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-start">

                        <div>

                            <p className="text-muted mb-2">
                                {title}
                            </p>

                            <h3 className="fw-bold mb-0">
                                {value}
                            </h3>

                        </div>

                        <div>

                            <i
                                className={`bi ${icon} fs-3 text-primary`}
                            ></i>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

/* =====================================================
   AVERAGE ORDER VALUE
===================================================== */

function calculateAverageOrderValue(report) {

    const paidOrders =
        report.payments.paidOrders;

    if (!paidOrders) {
        return 0;
    }

    return (
        Number(
            report.payments.totalRevenue
        ) / paidOrders
    );
}

export default AdminReportPage;