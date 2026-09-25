package com.KrishiAI.Backend.service;

import com.KrishiAI.Backend.dto.UpdateProfileRequestDTO;
import com.KrishiAI.Backend.dto.UserProfileResponseDTO;
import com.KrishiAI.Backend.entity.UserEntity;
import com.KrishiAI.Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;

    // =========================
    // GET PROFILE
    // =========================

    public UserProfileResponseDTO getProfile(Long userId) {

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        return mapToResponse(user);
    }


    // =========================
    // UPDATE PROFILE
    // =========================

    public UserProfileResponseDTO updateProfile(
            Long userId,
            UpdateProfileRequestDTO request
    ) {

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        // Check phone number only if it is being changed
        if (!user.getPhone().equals(request.getPhone())
                && userRepository.existsByPhone(request.getPhone())) {

            throw new RuntimeException(
                    "Phone number already exists"
            );
        }

        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setCountry(request.getCountry());
        user.setState(request.getState());
        user.setCity(request.getCity());
        user.setLocation(request.getLocation());

        UserEntity updatedUser =
                userRepository.save(user);

        return mapToResponse(updatedUser);
    }


    // =========================
    // ENTITY → DTO
    // =========================

    private UserProfileResponseDTO mapToResponse(
            UserEntity user
    ) {

        return UserProfileResponseDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .country(user.getCountry())
                .state(user.getState())
                .city(user.getCity())
                .location(user.getLocation())
                .profileImageUrl(user.getProfileImageUrl())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }
}