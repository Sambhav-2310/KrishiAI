package com.KrishiAI.Backend.controller;

import com.KrishiAI.Backend.dto.ProductRequestDTO;
import com.KrishiAI.Backend.dto.ProductResponseDTO;
import com.KrishiAI.Backend.entity.UserEntity;
import com.KrishiAI.Backend.service.ProductImageService;
import com.KrishiAI.Backend.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final ProductImageService productImageService;


    // CREATE
    @PostMapping
    public ResponseEntity<ProductResponseDTO> createProduct(
            Authentication authentication,
            @Valid @RequestBody ProductRequestDTO request
    ) {

        UserEntity farmer =
                (UserEntity) authentication.getPrincipal();

        ProductResponseDTO response =
                productService.createProduct(
                        request,
                        farmer
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // GET ALL ACTIVE PRODUCTS
    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>>
    getAllProducts() {

        return ResponseEntity.ok(
                productService.getAllActiveProducts()
        );
    }


    // GET MY PRODUCTS
    @GetMapping("/my")
    public ResponseEntity<List<ProductResponseDTO>>
    getMyProducts(
            Authentication authentication
    ) {

        UserEntity farmer =
                (UserEntity) authentication.getPrincipal();

        return ResponseEntity.ok(
                productService.getMyProducts(
                        farmer.getId()
                )
        );
    }


    // GET PRODUCTS BY CATEGORY
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductResponseDTO>>
    getProductsByCategory(
            @PathVariable Long categoryId
    ) {

        return ResponseEntity.ok(
                productService.getProductsByCategory(
                        categoryId
                )
        );
    }


    // GET SINGLE PRODUCT
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO>
    getProductById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                productService.getProductById(id)
        );
    }


    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO>
    updateProduct(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDTO request
    ) {

        UserEntity farmer =
                (UserEntity) authentication.getPrincipal();

        ProductResponseDTO response =
                productService.updateProduct(
                        id,
                        request,
                        farmer
                );

        return ResponseEntity.ok(response);
    }


    /// SOFT DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(
            Authentication authentication,
            @PathVariable Long id
    ) {

        UserEntity farmer =
                (UserEntity) authentication.getPrincipal();

        productService.deleteProduct(
                id,
                farmer
        );

        return ResponseEntity.ok(
                "Product deleted successfully"
        );
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateProduct(
            Authentication authentication,
            @PathVariable Long id
    ) {
        UserEntity farmer = (UserEntity) authentication.getPrincipal();

        productService.activateProduct(id, farmer);

        return ResponseEntity.ok("Product activated successfully");
    }

    // =========================================================
// UPLOAD PRODUCT IMAGE
// =========================================================

    @PostMapping("/image")
    public ResponseEntity<?> uploadProductImage(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) {

        UserEntity farmer =
                (UserEntity) authentication.getPrincipal();


        if (farmer == null ||
                farmer.getRole() == null ||
                !farmer.getRole()
                        .name()
                        .equals("FARMER")) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            Map.of(
                                    "message",
                                    "Only farmers can upload product images."
                            )
                    );
        }


        String imagePath =
                productImageService.storeImage(file);


        /*
         * Spring Boot server URL.
         *
         * If backend runs on:
         *
         * http://localhost:8080
         *
         * image becomes:
         *
         * http://localhost:8080/uploads/products/abc.jpg
         */
        String imageUrl = ServletUriComponentsBuilder
                .fromCurrentContextPath()
                .path(imagePath)
                .toUriString();

        return ResponseEntity.ok(
                Map.of("imageUrl", imageUrl)
        );
    }
}