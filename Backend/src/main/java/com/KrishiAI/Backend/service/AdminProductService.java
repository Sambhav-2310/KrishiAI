package com.KrishiAI.Backend.service;

import com.KrishiAI.Backend.dto.AdminProductResponseDTO;
import com.KrishiAI.Backend.entity.ProductEntity;
import com.KrishiAI.Backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminProductService {

    private final ProductRepository productRepository;

    public List<AdminProductResponseDTO> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    private AdminProductResponseDTO mapToDTO(ProductEntity product) {

        return AdminProductResponseDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .quantity(product.getQuantity())
                .unit(product.getUnit())
                .imageUrl(product.getImageUrl())
                .farmerId(
                        product.getFarmer() != null
                                ? product.getFarmer().getId()
                                : null
                )
                .farmerName(
                        product.getFarmer() != null
                                ? product.getFarmer().getName()
                                : null
                )
                .farmerEmail(
                        product.getFarmer() != null
                                ? product.getFarmer().getEmail()
                                : null
                )
                .categoryId(
                        product.getCategory() != null
                                ? product.getCategory().getId()
                                : null
                )
                .categoryName(
                        product.getCategory() != null
                                ? product.getCategory().getName()
                                : null
                )
                .status(product.getStatus())
                .build();
    }
}