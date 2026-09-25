package com.KrishiAI.Backend.repository;

import com.KrishiAI.Backend.entity.ProductEntity;
import com.KrishiAI.Backend.entity.ProductStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository
        extends JpaRepository<ProductEntity, Long> {

    List<ProductEntity> findByStatus(ProductStatus status);

    List<ProductEntity> findByFarmerId(Long farmerId);

    List<ProductEntity> findByCategoryIdAndStatus(
            Long categoryId,
            ProductStatus status
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM ProductEntity p WHERE p.id = :id")
    Optional<ProductEntity> findByIdForUpdate(
            @Param("id") Long id
    );

    long countByStatus(ProductStatus status);
}