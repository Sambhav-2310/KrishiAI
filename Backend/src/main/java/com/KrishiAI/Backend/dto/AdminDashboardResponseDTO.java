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
public class AdminDashboardResponseDTO {

    private long totalUsers;
    private long totalFarmers;
    private long totalConsumers;
    private long totalAdmins;

    private long activeUsers;
    private long blockedUsers;

    private long totalProducts;

    private long totalOrders;
    private long paidOrders;

    private BigDecimal totalRevenue;
}