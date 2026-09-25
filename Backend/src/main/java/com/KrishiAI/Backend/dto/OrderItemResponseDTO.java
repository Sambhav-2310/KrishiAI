package com.KrishiAI.Backend.dto;

import com.KrishiAI.Backend.entity.OrderItemStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderItemResponseDTO {

    private Long id;

    private Long productId;

    private String productName;

    private String imageUrl;

    private String unit;

    private BigDecimal quantity;

    private BigDecimal price;

    private BigDecimal subtotal;

    private OrderItemStatus status;
}