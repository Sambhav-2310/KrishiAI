package com.KrishiAI.Backend.repository;

import com.KrishiAI.Backend.entity.CartEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<CartEntity, Long> {

    Optional<CartEntity> findByConsumerId(Long consumerId);

}