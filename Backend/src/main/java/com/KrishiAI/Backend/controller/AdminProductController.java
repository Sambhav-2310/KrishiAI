package com.KrishiAI.Backend.controller;

import com.KrishiAI.Backend.dto.AdminProductResponseDTO;
import com.KrishiAI.Backend.service.AdminProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final AdminProductService adminProductService;

    @GetMapping
    public ResponseEntity<List<AdminProductResponseDTO>> getAllProducts() {

        return ResponseEntity.ok(
                adminProductService.getAllProducts()
        );
    }
}