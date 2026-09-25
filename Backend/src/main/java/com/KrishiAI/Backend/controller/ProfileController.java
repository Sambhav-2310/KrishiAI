package com.KrishiAI.Backend.controller;

import com.KrishiAI.Backend.dto.UpdateProfileRequestDTO;
import com.KrishiAI.Backend.dto.UserProfileResponseDTO;
import com.KrishiAI.Backend.entity.UserEntity;
import com.KrishiAI.Backend.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class ProfileController {

    private final ProfileService profileService;


    // =========================
    // GET PROFILE
    // =========================

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponseDTO> getProfile(
            Authentication authentication
    ) {

        UserEntity user =
                (UserEntity) authentication.getPrincipal();

        UserProfileResponseDTO response =
                profileService.getProfile(user.getId());

        return ResponseEntity.ok(response);
    }


    // =========================
    // UPDATE PROFILE
    // =========================

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponseDTO> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequestDTO request
    ) {

        UserEntity user =
                (UserEntity) authentication.getPrincipal();

        UserProfileResponseDTO response =
                profileService.updateProfile(
                        user.getId(),
                        request
                );

        return ResponseEntity.ok(response);
    }
}