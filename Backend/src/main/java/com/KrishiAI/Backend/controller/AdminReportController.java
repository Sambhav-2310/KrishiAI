package com.KrishiAI.Backend.controller;

import com.KrishiAI.Backend.dto.AdminReportResponseDTO;
import com.KrishiAI.Backend.service.AdminReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/reports")
public class AdminReportController {

    private final AdminReportService adminReportService;

    @GetMapping
    public ResponseEntity<AdminReportResponseDTO> getReport(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to
    ) {

        if (from == null) {
            from = LocalDate.now().minusDays(30);
        }

        if (to == null) {
            to = LocalDate.now();
        }

        return ResponseEntity.ok(
                adminReportService.getReport(from, to)
        );
    }
}