package com.KrishiAI.Backend.controller;

import com.KrishiAI.Backend.dto.CategoryRequestDTO;
import com.KrishiAI.Backend.dto.CategoryResponseDTO;
import com.KrishiAI.Backend.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    // =========================
    // CREATE
    // =========================

    @PostMapping
    public ResponseEntity<CategoryResponseDTO> createCategory(
            @Valid @RequestBody CategoryRequestDTO request) {

        CategoryResponseDTO response =
                categoryService.createCategory(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================
    // GET ALL ACTIVE
    // PUBLIC
    // =========================

    @GetMapping
    public ResponseEntity<List<CategoryResponseDTO>>
    getAllCategories() {

        return ResponseEntity.ok(
                categoryService.getAllActiveCategories()
        );
    }


    // =========================
    // GET ALL CATEGORIES
    // ADMIN
    // ACTIVE + INACTIVE
    // =========================

    @GetMapping("/admin")
    public ResponseEntity<List<CategoryResponseDTO>>
    getAllCategoriesForAdmin() {

        return ResponseEntity.ok(
                categoryService.getAllCategories()
        );
    }


    // =========================
    // GET BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> getCategoryById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                categoryService.getCategoryById(id)
        );
    }


    // =========================
    // UPDATE
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequestDTO request) {

        return ResponseEntity.ok(
                categoryService.updateCategory(id, request)
        );
    }


    // =========================
    // DEACTIVATE
    // active = false / 0
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivateCategory(
            @PathVariable Long id) {

        categoryService.deactivateCategory(id);

        return ResponseEntity.ok(
                "Category deactivated successfully"
        );
    }


    // =========================
    // ACTIVATE
    // active = true / 1
    // =========================

    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateCategory(
            @PathVariable Long id) {

        categoryService.activateCategory(id);

        return ResponseEntity.ok(
                "Category activated successfully"
        );
    }
}