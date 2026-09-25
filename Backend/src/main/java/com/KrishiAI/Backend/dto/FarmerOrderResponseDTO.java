package com.KrishiAI.Backend.dto;

import com.KrishiAI.Backend.entity.OrderItemStatus;
import com.KrishiAI.Backend.entity.OrderStatus;
import com.KrishiAI.Backend.entity.PaymentMethod;
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
public class FarmerOrderResponseDTO {

    private Long orderId;

    private Long consumerId;

    private String consumerName;

    private String consumerPhone;

    private OrderStatus orderStatus;

    private PaymentStatus paymentStatus;

    private PaymentMethod paymentMethod;

    private BigDecimal orderTotalAmount;

    private BigDecimal farmerTotalAmount;

    private String deliveryAddress;

    private String notes;

    private List<FarmerOrderItemDTO> items;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class FarmerOrderItemDTO {

        private Long itemId;

        private Long productId;

        private String productName;

        private String imageUrl;

        private String unit;

        private BigDecimal quantity;

        private BigDecimal price;

        private BigDecimal subtotal;

        private OrderItemStatus status;
    }
}