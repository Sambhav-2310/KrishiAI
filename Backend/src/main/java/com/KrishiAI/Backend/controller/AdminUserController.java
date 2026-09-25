package com.KrishiAI.Backend.controller;

import com.KrishiAI.Backend.dto.AdminUserResponseDTO;
import com.KrishiAI.Backend.dto.AdminUserStatusRequestDTO;
import com.KrishiAI.Backend.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<List<AdminUserResponseDTO>> getAllUsers() {

        return ResponseEntity.ok(
                adminUserService.getAllUsers()
        );
    }

    @PutMapping("/{userId}/status")
    public ResponseEntity<AdminUserResponseDTO> updateUserStatus(
            @PathVariable Long userId,
            @Valid @RequestBody AdminUserStatusRequestDTO request
    ) {

        return ResponseEntity.ok(
                adminUserService.updateUserStatus(
                        userId,
                        request.getStatus()
                )
        );
    }
}