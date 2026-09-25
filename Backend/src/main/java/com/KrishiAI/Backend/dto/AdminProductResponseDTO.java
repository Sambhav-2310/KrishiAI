package com.KrishiAI.Backend.dto;

import com.KrishiAI.Backend.entity.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminProductResponseDTO {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal quantity;
    private String unit;
    private String imageUrl;

    private Long farmerId;
    private String farmerName;
    private String farmerEmail;

    private Long categoryId;
    private String categoryName;

    private ProductStatus status;
}