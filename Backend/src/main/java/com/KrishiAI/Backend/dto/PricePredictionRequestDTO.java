package com.KrishiAI.Backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PricePredictionRequestDTO {

    @NotBlank
    @Size(min = 2, max = 100)
    private String district;

    @NotBlank
    @Size(min = 2, max = 100)
    private String market;

    @NotBlank
    @Size(min = 2, max = 100)
    private String commodity;

    @NotBlank
    @Size(min = 2, max = 100)
    private String variety;

    @NotBlank
    @Size(min = 1, max = 50)
    private String grade;

    @NotBlank
    private String date;
}