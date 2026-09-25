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
public class AdminReportResponseDTO {

    private UserReport users;
    private ProductReport products;
    private OrderReport orders;
    private PaymentReport payments;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class UserReport {

        private long total;
        private long farmers;
        private long consumers;
        private long active;
        private long blocked;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ProductReport {

        private long total;
        private long active;
        private long soldOut;
        private long inactive;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class OrderReport {

        private long total;
        private long pending;
        private long confirmed;
        private long processing;
        private long shipped;
        private long delivered;
        private long cancelled;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PaymentReport {

        private long paidOrders;
        private long pendingPayments;
        private long failedPayments;
        private long refundedPayments;
        private BigDecimal totalRevenue;
    }
}