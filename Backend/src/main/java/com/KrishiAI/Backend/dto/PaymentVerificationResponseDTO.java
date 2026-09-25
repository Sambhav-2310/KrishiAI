package com.KrishiAI.Backend.dto.payment;

import com.KrishiAI.Backend.entity.OrderStatus;
import com.KrishiAI.Backend.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentVerificationResponseDTO {

    private Long orderId;

    private Long paymentId;

    private String razorpayPaymentId;

    private BigDecimal amount;

    private PaymentStatus paymentStatus;

    private OrderStatus orderStatus;

    private String message;
}