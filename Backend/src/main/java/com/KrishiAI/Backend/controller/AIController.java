package com.KrishiAI.Backend.controller;

import com.KrishiAI.Backend.dto.PricePredictionRequestDTO;
import com.KrishiAI.Backend.dto.SmartListingRequestDTO;
import com.KrishiAI.Backend.service.AIService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    @PostMapping("/smart-listing")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<Map<String, Object>> smartListing(
            @Valid @RequestBody SmartListingRequestDTO request
    ) {

        Map<String, Object> response =
                aiService.generateSmartListing(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/predict-price")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<Map<String, Object>> predictPrice(
            @Valid @RequestBody PricePredictionRequestDTO request
    ) {

        Map<String, Object> response =
                aiService.predictPrice(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping(
            value = "/predict-disease",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<Map<String, Object>> predictDisease(
            @RequestParam("file") MultipartFile file
    ) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "success", false,
                            "message", "Image file is required"
                    ));
        }

        Map<String, Object> response =
                aiService.predictDisease(file);

        return ResponseEntity.ok(response);
    }
}