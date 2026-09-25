package com.KrishiAI.Backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreatePaymentOrderRequestDTO {

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    private String notes;
}