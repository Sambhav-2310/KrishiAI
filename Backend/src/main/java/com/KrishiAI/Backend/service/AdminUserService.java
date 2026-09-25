package com.KrishiAI.Backend.service;

import com.KrishiAI.Backend.dto.AdminUserResponseDTO;
import com.KrishiAI.Backend.entity.Role;
import com.KrishiAI.Backend.entity.UserEntity;
import com.KrishiAI.Backend.entity.UserStatus;
import com.KrishiAI.Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    public List<AdminUserResponseDTO> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional
    public AdminUserResponseDTO updateUserStatus(
            Long userId,
            UserStatus newStatus
    ) {

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException(
                    "Admin accounts cannot be modified here"
            );
        }

        user.setStatus(newStatus);

        UserEntity savedUser =
                userRepository.save(user);

        return mapToDTO(savedUser);
    }

    private AdminUserResponseDTO mapToDTO(UserEntity user) {

        return AdminUserResponseDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .country(user.getCountry())
                .state(user.getState())
                .city(user.getCity())
                .location(user.getLocation())
                .createdAt(user.getCreatedAt())
                .build();
    }
}