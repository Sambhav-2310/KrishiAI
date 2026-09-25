package com.KrishiAI.Backend.repository;

import com.KrishiAI.Backend.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository
        extends JpaRepository<CategoryEntity, Long> {

    Optional<CategoryEntity> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<CategoryEntity> findByActiveTrue();

    List<CategoryEntity> findAllByOrderByIdDesc();
}