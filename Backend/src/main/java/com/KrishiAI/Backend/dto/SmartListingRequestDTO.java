package com.KrishiAI.Backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SmartListingRequestDTO {

    @NotBlank
    @Size(min = 2, max = 50)
    private String crop;

    @NotNull
    @DecimalMin(value = "0.01")
    private Double quantity;

    @NotBlank
    @Size(min = 2, max = 100)
    private String location;

    @NotBlank
    @Size(min = 2, max = 30)
    private String quality;
}