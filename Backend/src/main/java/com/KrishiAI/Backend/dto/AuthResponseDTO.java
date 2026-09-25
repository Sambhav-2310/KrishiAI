package com.KrishiAI.Backend.dto;

import com.KrishiAI.Backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthResponseDTO {

    private String token;
    private Long userId;
    private String name;
    private String email;
    private Role role;
}