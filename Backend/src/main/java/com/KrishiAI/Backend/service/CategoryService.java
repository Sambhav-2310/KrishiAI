package com.KrishiAI.Backend.service;

import com.KrishiAI.Backend.dto.CategoryRequestDTO;
import com.KrishiAI.Backend.dto.CategoryResponseDTO;
import com.KrishiAI.Backend.entity.CategoryEntity;
import com.KrishiAI.Backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    // =========================
    // CREATE
    // =========================

    public CategoryResponseDTO createCategory(
            CategoryRequestDTO request) {

        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Category already exists");
        }

        CategoryEntity category = CategoryEntity.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .active(true)
                .build();

        CategoryEntity savedCategory =
                categoryRepository.save(category);

        return mapToResponse(savedCategory);
    }


    // =========================
    // GET ALL ACTIVE CATEGORIES
    // Used by Marketplace / Farmer
    // =========================

    public List<CategoryResponseDTO> getAllActiveCategories() {

        return categoryRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================
    // GET ALL CATEGORIES
    // Used by ADMIN
    // Returns ACTIVE + INACTIVE
    // =========================

    public List<CategoryResponseDTO> getAllCategories() {

        return categoryRepository.findAllByOrderByIdDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================
    // GET CATEGORY BY ID
    // =========================

    public CategoryResponseDTO getCategoryById(Long id) {

        CategoryEntity category =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found"));

        return mapToResponse(category);
    }


    // =========================
    // UPDATE
    // =========================

    public CategoryResponseDTO updateCategory(
            Long id,
            CategoryRequestDTO request) {

        CategoryEntity category =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found"));

        if (!category.getName().equalsIgnoreCase(request.getName())
                && categoryRepository
                .existsByNameIgnoreCase(request.getName())) {

            throw new RuntimeException(
                    "Category name already exists");
        }

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());

        CategoryEntity updatedCategory =
                categoryRepository.save(category);

        return mapToResponse(updatedCategory);
    }


    // =========================
    // DEACTIVATE
    // active = false
    // =========================

    public void deactivateCategory(Long id) {

        CategoryEntity category =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found"));

        category.setActive(false);

        categoryRepository.save(category);
    }


    // =========================
    // ACTIVATE
    // active = true
    // =========================

    public void activateCategory(Long id) {

        CategoryEntity category =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found"));

        category.setActive(true);

        categoryRepository.save(category);
    }


    // =========================
    // MAP ENTITY → RESPONSE DTO
    // =========================

    private CategoryResponseDTO mapToResponse(
            CategoryEntity category) {

        return CategoryResponseDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .active(category.getActive())
                .build();
    }
}