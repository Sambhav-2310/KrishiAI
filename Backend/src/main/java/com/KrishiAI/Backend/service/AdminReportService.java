package com.KrishiAI.Backend.service;

import com.KrishiAI.Backend.dto.AdminReportResponseDTO;
import com.KrishiAI.Backend.entity.OrderStatus;
import com.KrishiAI.Backend.entity.PaymentStatus;
import com.KrishiAI.Backend.entity.ProductStatus;
import com.KrishiAI.Backend.entity.Role;
import com.KrishiAI.Backend.entity.UserStatus;
import com.KrishiAI.Backend.repository.OrderRepository;
import com.KrishiAI.Backend.repository.ProductRepository;
import com.KrishiAI.Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminReportService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public AdminReportResponseDTO getReport(
            LocalDate fromDate,
            LocalDate toDate
    ) {

        /*
         * =========================================================
         * DATE RANGE
         * =========================================================
         *
         * fromDate is inclusive.
         * toDate is inclusive.
         *
         * Example:
         *
         * from = 2026-09-01
         * to   = 2026-09-12
         *
         * Query:
         *
         * >= 2026-09-01 00:00:00
         * <
         * 2026-09-13 00:00:00
         */

        LocalDateTime fromDateTime =
                fromDate.atStartOfDay();

        LocalDateTime toDateTime =
                toDate.plusDays(1).atStartOfDay();


        /*
         * =========================================================
         * USER REPORT
         * =========================================================
         *
         * Users are NOT date filtered.
         *
         * These are overall platform statistics.
         *
         * The frontend can hide this section when a filter
         * is applied.
         */

        AdminReportResponseDTO.UserReport userReport =
                AdminReportResponseDTO.UserReport.builder()
                        .total(userRepository.count())
                        .farmers(
                                userRepository.countByRole(
                                        Role.FARMER
                                )
                        )
                        .consumers(
                                userRepository.countByRole(
                                        Role.CONSUMER
                                )
                        )
                        .active(
                                userRepository.countByStatus(
                                        UserStatus.ACTIVE
                                )
                        )
                        .blocked(
                                userRepository.countByStatus(
                                        UserStatus.BLOCKED
                                )
                        )
                        .build();


        /*
         * =========================================================
         * PRODUCT REPORT
         * =========================================================
         *
         * Products are NOT date filtered.
         *
         * These are overall platform statistics.
         *
         * The frontend can hide this section when a filter
         * is applied.
         */

        AdminReportResponseDTO.ProductReport productReport =
                AdminReportResponseDTO.ProductReport.builder()
                        .total(productRepository.count())
                        .active(
                                productRepository.countByStatus(
                                        ProductStatus.ACTIVE
                                )
                        )
                        .soldOut(
                                productRepository.countByStatus(
                                        ProductStatus.SOLD_OUT
                                )
                        )
                        .inactive(
                                productRepository.countByStatus(
                                        ProductStatus.INACTIVE
                                )
                        )
                        .build();


        /*
         * =========================================================
         * ORDER REPORT
         * =========================================================
         *
         * IMPORTANT:
         *
         * EVERY ORDER STATUS COUNT now uses the selected
         * date range.
         */

        long totalOrders =
                orderRepository.countOrdersBetween(
                        fromDateTime,
                        toDateTime
                );


        long pendingOrders =
                orderRepository.countOrdersByStatusBetween(
                        OrderStatus.PENDING,
                        fromDateTime,
                        toDateTime
                );


        long confirmedOrders =
                orderRepository.countOrdersByStatusBetween(
                        OrderStatus.CONFIRMED,
                        fromDateTime,
                        toDateTime
                );


        long processingOrders =
                orderRepository.countOrdersByStatusBetween(
                        OrderStatus.PROCESSING,
                        fromDateTime,
                        toDateTime
                );


        long shippedOrders =
                orderRepository.countOrdersByStatusBetween(
                        OrderStatus.SHIPPED,
                        fromDateTime,
                        toDateTime
                );


        long deliveredOrders =
                orderRepository.countOrdersByStatusBetween(
                        OrderStatus.DELIVERED,
                        fromDateTime,
                        toDateTime
                );


        long cancelledOrders =
                orderRepository.countOrdersByStatusBetween(
                        OrderStatus.CANCELLED,
                        fromDateTime,
                        toDateTime
                );


        AdminReportResponseDTO.OrderReport orderReport =
                AdminReportResponseDTO.OrderReport.builder()
                        .total(totalOrders)
                        .pending(pendingOrders)
                        .confirmed(confirmedOrders)
                        .processing(processingOrders)
                        .shipped(shippedOrders)
                        .delivered(deliveredOrders)
                        .cancelled(cancelledOrders)
                        .build();


        /*
         * =========================================================
         * PAYMENT REPORT
         * =========================================================
         *
         * All payment statistics use the SAME date range.
         */

        long paidOrders =
                orderRepository.countPaymentsBetween(
                        PaymentStatus.PAID,
                        fromDateTime,
                        toDateTime
                );


        long pendingPayments =
                orderRepository.countPaymentsBetween(
                        PaymentStatus.PENDING,
                        fromDateTime,
                        toDateTime
                );


        long failedPayments =
                orderRepository.countPaymentsBetween(
                        PaymentStatus.FAILED,
                        fromDateTime,
                        toDateTime
                );


        long refundedPayments =
                orderRepository.countPaymentsBetween(
                        PaymentStatus.REFUNDED,
                        fromDateTime,
                        toDateTime
                );


        /*
         * =========================================================
         * REVENUE
         * =========================================================
         *
         * Revenue only comes from PAID orders inside
         * the selected date range.
         */

        BigDecimal revenue =
                orderRepository.sumRevenueBetween(
                        PaymentStatus.PAID,
                        fromDateTime,
                        toDateTime
                );


        if (revenue == null) {
            revenue = BigDecimal.ZERO;
        }


        /*
         * =========================================================
         * PAYMENT REPORT DTO
         * =========================================================
         */

        AdminReportResponseDTO.PaymentReport paymentReport =
                AdminReportResponseDTO.PaymentReport.builder()
                        .paidOrders(paidOrders)
                        .pendingPayments(pendingPayments)
                        .failedPayments(failedPayments)
                        .refundedPayments(refundedPayments)
                        .totalRevenue(revenue)
                        .build();


        /*
         * =========================================================
         * FINAL REPORT
         * =========================================================
         */

        return AdminReportResponseDTO.builder()
                .users(userReport)
                .products(productReport)
                .orders(orderReport)
                .payments(paymentReport)
                .build();
    }
}