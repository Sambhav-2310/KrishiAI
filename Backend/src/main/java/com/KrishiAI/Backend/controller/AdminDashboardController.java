package com.KrishiAI.Backend.controller;

import com.KrishiAI.Backend.dto.AdminDashboardResponseDTO;
import com.KrishiAI.Backend.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponseDTO> getDashboard() {

        return ResponseEntity.ok(
                adminDashboardService.getDashboard()
        );
    }
}