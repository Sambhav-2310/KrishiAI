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
public class PaymentOrderResponseDTO {

    private Long orderId;

    private Long paymentId;

    private String razorpayKeyId;

    private String razorpayOrderId;

    private BigDecimal amount;

    private String currency;
}