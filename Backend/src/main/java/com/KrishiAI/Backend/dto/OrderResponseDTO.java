package com.KrishiAI.Backend.dto;

import com.KrishiAI.Backend.entity.OrderStatus;
import com.KrishiAI.Backend.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderResponseDTO {

    private Long id;

    private Long consumerId;

    private String consumerName;

    private OrderStatus status;

    private PaymentStatus paymentStatus;

    private BigDecimal totalAmount;

    private String deliveryAddress;

    private String notes;

    private List<OrderItemResponseDTO> items;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}