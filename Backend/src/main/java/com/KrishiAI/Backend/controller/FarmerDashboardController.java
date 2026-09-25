package com.KrishiAI.Backend.controller;

import com.KrishiAI.Backend.dto.FarmerDashboardResponseDTO;
import com.KrishiAI.Backend.entity.UserEntity;
import com.KrishiAI.Backend.service.FarmerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/farmer")
@RequiredArgsConstructor
public class FarmerDashboardController {

    private final FarmerDashboardService farmerDashboardService;


    // =========================================================
    // FARMER DASHBOARD
    // =========================================================

    @GetMapping("/dashboard")
    public ResponseEntity<FarmerDashboardResponseDTO> getDashboard(
            Authentication authentication
    ) {

        UserEntity farmer =
                (UserEntity) authentication.getPrincipal();

        FarmerDashboardResponseDTO response =
                farmerDashboardService.getDashboard(
                        farmer
                );

        return ResponseEntity.ok(response);
    }
}