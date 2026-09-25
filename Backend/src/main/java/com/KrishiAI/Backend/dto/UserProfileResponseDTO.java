package com.KrishiAI.Backend.dto;

import com.KrishiAI.Backend.entity.Role;
import com.KrishiAI.Backend.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserProfileResponseDTO {

    private Long id;

    private String name;

    private String email;

    private String phone;

    private String country;

    private String state;

    private String city;

    private String location;

    private String profileImageUrl;

    private Role role;

    private UserStatus status;
}