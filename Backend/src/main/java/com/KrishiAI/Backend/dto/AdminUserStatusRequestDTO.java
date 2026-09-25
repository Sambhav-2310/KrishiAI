package com.KrishiAI.Backend.dto;

import com.KrishiAI.Backend.entity.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminUserStatusRequestDTO {

    @NotNull(message = "Status is required")
    private UserStatus status;
}