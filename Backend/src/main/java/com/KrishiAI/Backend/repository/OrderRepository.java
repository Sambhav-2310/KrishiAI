package com.KrishiAI.Backend.repository;

import com.KrishiAI.Backend.entity.OrderEntity;
import com.KrishiAI.Backend.entity.OrderStatus;
import com.KrishiAI.Backend.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    List<OrderEntity> findByConsumerIdOrderByCreatedAtDesc(Long consumerId);

    Optional<OrderEntity> findByIdAndConsumerId(
            Long orderId,
            Long consumerId
    );

    @Query("""
            SELECT DISTINCT o
            FROM OrderEntity o
            JOIN OrderItemEntity oi
                 ON oi.order.id = o.id
            JOIN oi.product p
            WHERE p.farmer.id = :farmerId
            ORDER BY o.createdAt DESC
            """)
    List<OrderEntity> findOrdersForFarmer(
            @Param("farmerId") Long farmerId
    );

    long countByStatus(OrderStatus status);

    long countByPaymentStatus(PaymentStatus paymentStatus);

    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0)
        FROM OrderEntity o
        WHERE o.paymentStatus = :paymentStatus
        """)
    BigDecimal sumRevenueByPaymentStatus(
            @Param("paymentStatus") PaymentStatus paymentStatus
    );

    @Query("""
        SELECT COUNT(o)
        FROM OrderEntity o
        WHERE o.createdAt >= :from
        AND o.createdAt < :to
        """)
    long countOrdersBetween(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query("""
        SELECT COUNT(o)
        FROM OrderEntity o
        WHERE o.paymentStatus = :paymentStatus
        AND o.createdAt >= :from
        AND o.createdAt < :to
        """)
    long countPaymentsBetween(
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0)
        FROM OrderEntity o
        WHERE o.paymentStatus = :paymentStatus
        AND o.createdAt >= :from
        AND o.createdAt < :to
        """)
    BigDecimal sumRevenueBetween(
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query("""
        SELECT COUNT(o)
        FROM OrderEntity o
        WHERE o.status = :status
        AND o.createdAt >= :from
        AND o.createdAt < :to
        """)
    long countOrdersByStatusBetween(
            @Param("status") OrderStatus status,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );
}