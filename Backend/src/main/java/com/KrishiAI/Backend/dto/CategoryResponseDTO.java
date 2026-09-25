package com.KrishiAI.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CategoryResponseDTO {

    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Boolean active;
}