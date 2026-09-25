package com.KrishiAI.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FarmerDashboardResponseDTO {

    // =========================================================
    // PRODUCT STATISTICS
    // =========================================================

    private long totalProducts;

    private long activeProducts;

    private long soldOutProducts;

    private long inactiveProducts;


    // =========================================================
    // ORDER STATISTICS
    // =========================================================

    private long totalOrders;

    private long pendingOrders;

    private long confirmedOrders;

    private long processingOrders;

    private long shippedOrders;

    private long deliveredOrders;

    private long cancelledOrders;


    // =========================================================
    // SALES
    // =========================================================

    private BigDecimal totalSales;
}