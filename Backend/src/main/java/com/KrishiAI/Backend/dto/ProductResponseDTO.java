package com.KrishiAI.Backend.dto;

import com.KrishiAI.Backend.entity.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductResponseDTO {

    private Long id;

    private String name;

    private String description;

    private BigDecimal price;

    private BigDecimal quantity;

    private String unit;

    private String location;

    private String imageUrl;

    private Long categoryId;

    private String categoryName;

    private Long farmerId;

    private String farmerName;

    private ProductStatus status;

    private LocalDateTime createdAt;
}