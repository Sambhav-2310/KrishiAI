package com.KrishiAI.Backend.dto;

import lombok.Data;

@Data
public class DiseasePredictionResponseDTO {

    private String disease;

    private Double confidence;
}