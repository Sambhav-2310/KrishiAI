package com.KrishiAI.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CartResponseDTO {

    private Long cartId;

    private Long consumerId;

    private List<CartItemResponseDTO> items;

    private BigDecimal totalAmount;
}