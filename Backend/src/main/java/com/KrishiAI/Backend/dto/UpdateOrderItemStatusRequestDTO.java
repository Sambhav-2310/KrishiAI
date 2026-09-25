package com.KrishiAI.Backend.dto;

import com.KrishiAI.Backend.entity.OrderItemStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateOrderItemStatusRequestDTO {

    @NotNull(message = "Status is required")
    private OrderItemStatus status;
}