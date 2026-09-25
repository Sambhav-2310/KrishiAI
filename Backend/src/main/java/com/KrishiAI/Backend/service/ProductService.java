package com.KrishiAI.Backend.service;

import com.KrishiAI.Backend.dto.ProductRequestDTO;
import com.KrishiAI.Backend.dto.ProductResponseDTO;
import com.KrishiAI.Backend.entity.CategoryEntity;
import com.KrishiAI.Backend.entity.ProductEntity;
import com.KrishiAI.Backend.entity.ProductStatus;
import com.KrishiAI.Backend.entity.UserEntity;
import com.KrishiAI.Backend.repository.CategoryRepository;
import com.KrishiAI.Backend.repository.OrderItemRepository;
import com.KrishiAI.Backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // CREATE PRODUCT
    public ProductResponseDTO createProduct(
            ProductRequestDTO request,
            UserEntity farmer
    ) {

        CategoryEntity category =
                categoryRepository.findById(request.getCategoryId())
                        .orElseThrow(() ->
                                new RuntimeException("Category not found"));

        if (!category.getActive()) {
            throw new RuntimeException("Category is inactive");
        }

        ProductEntity product = ProductEntity.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .unit(request.getUnit().trim())
                .location(request.getLocation())
                .imageUrl(request.getImageUrl())
                .status(ProductStatus.ACTIVE)
                .category(category)
                .farmer(farmer)
                .build();

        ProductEntity savedProduct =
                productRepository.save(product);

        return mapToResponse(savedProduct);
    }


    // GET ALL ACTIVE PRODUCTS
    public List<ProductResponseDTO> getAllActiveProducts() {

        return productRepository
                .findByStatus(ProductStatus.ACTIVE)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // GET PRODUCT BY ID
    public ProductResponseDTO getProductById(Long id) {
        ProductEntity product =
                productRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new RuntimeException("Product is not available");
        }

        return mapToResponse(product);
    }

    // GET PRODUCTS OF CURRENT FARMER
    public List<ProductResponseDTO> getMyProducts(Long farmerId) {

        return productRepository
                .findByFarmerId(farmerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // GET PRODUCTS BY CATEGORY
    public List<ProductResponseDTO> getProductsByCategory(
            Long categoryId
    ) {

        return productRepository
                .findByCategoryIdAndStatus(
                        categoryId,
                        ProductStatus.ACTIVE
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // UPDATE PRODUCT
    public ProductResponseDTO updateProduct(
            Long productId,
            ProductRequestDTO request,
            UserEntity farmer
    ) {

        ProductEntity product =
                productRepository.findById(productId)
                        .orElseThrow(() ->
                                new RuntimeException("Product not found"));

        // Ownership check
        if (!product.getFarmer().getId().equals(farmer.getId())) {
            throw new RuntimeException(
                    "You can only update your own products"
            );
        }

        CategoryEntity category =
                categoryRepository.findById(request.getCategoryId())
                        .orElseThrow(() ->
                                new RuntimeException("Category not found"));

        if (!category.getActive()) {
            throw new RuntimeException("Category is inactive");
        }

        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        product.setUnit(request.getUnit().trim());
        product.setLocation(request.getLocation());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);

        // If quantity becomes zero
        if (request.getQuantity().signum() == 0) {
            product.setStatus(ProductStatus.SOLD_OUT);
        } else if (product.getStatus() == ProductStatus.SOLD_OUT) {
            product.setStatus(ProductStatus.ACTIVE);
        }

        ProductEntity updatedProduct =
                productRepository.save(product);

        return mapToResponse(updatedProduct);
    }


    // SOFT DELETE PRODUCT
    public void deleteProduct(
            Long productId,
            UserEntity farmer
    ) {

        ProductEntity product =
                productRepository.findById(productId)
                        .orElseThrow(() ->
                                new RuntimeException("Product not found"));

        // Ownership check
        if (!product.getFarmer().getId().equals(farmer.getId())) {
            throw new RuntimeException(
                    "You can only delete your own products"
            );
        }

        // Soft delete
        product.setStatus(ProductStatus.INACTIVE);

        productRepository.save(product);
    }

    // ACTIVATE PRODUCT
    public void activateProduct(Long productId, UserEntity farmer) {

        ProductEntity product =
                productRepository.findById(productId)
                        .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getFarmer().getId().equals(farmer.getId())) {
            throw new RuntimeException("You can only activate your own products");
        }

        if (product.getQuantity().signum() == 0) {
            product.setStatus(ProductStatus.SOLD_OUT);
        } else {
            product.setStatus(ProductStatus.ACTIVE);
        }

        productRepository.save(product);
    }


    // MAPPING ENTITY → DTO
    private ProductResponseDTO mapToResponse(
            ProductEntity product
    ) {

        return ProductResponseDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .quantity(product.getQuantity())
                .unit(product.getUnit())
                .location(product.getLocation())
                .imageUrl(product.getImageUrl())

                .categoryId(
                        product.getCategory().getId()
                )

                .categoryName(
                        product.getCategory().getName()
                )

                .farmerId(
                        product.getFarmer().getId()
                )

                .farmerName(
                        product.getFarmer().getName()
                )

                .status(product.getStatus())

                .createdAt(product.getCreatedAt())

                .build();
    }
}