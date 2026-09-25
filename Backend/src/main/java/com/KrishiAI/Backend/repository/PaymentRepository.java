package com.KrishiAI.Backend.repository;

import com.KrishiAI.Backend.entity.PaymentEntity;
import com.KrishiAI.Backend.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface PaymentRepository
        extends JpaRepository<PaymentEntity, Long> {

    Optional<PaymentEntity> findByOrderId(Long orderId);

    Optional<PaymentEntity> findByRazorpayOrderId(
            String razorpayOrderId
    );

    Optional<PaymentEntity> findByRazorpayPaymentId(
            String razorpayPaymentId
    );

    long countByStatus(PaymentStatus status);

    @Query("""
            SELECT COALESCE(SUM(p.amount), 0)
            FROM PaymentEntity p
            WHERE p.status = :status
            """)
    BigDecimal sumAmountByStatus(
            @Param("status") PaymentStatus status
    );
}