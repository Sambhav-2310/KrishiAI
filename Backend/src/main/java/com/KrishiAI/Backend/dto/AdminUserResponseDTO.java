package com.KrishiAI.Backend.dto;

import com.KrishiAI.Backend.entity.Role;
import com.KrishiAI.Backend.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminUserResponseDTO {

    private Long id;
    private String name;
    private String email;
    private String phone;

    private Role role;
    private UserStatus status;

    private String country;
    private String state;
    private String city;
    private String location;

    private LocalDateTime createdAt;
}