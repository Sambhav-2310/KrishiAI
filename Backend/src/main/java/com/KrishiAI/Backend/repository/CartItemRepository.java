package com.KrishiAI.Backend.repository;

import com.KrishiAI.Backend.entity.CartItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItemEntity, Long> {

    Optional<CartItemEntity> findByCartIdAndProductId(
            Long cartId,
            Long productId
    );

    List<CartItemEntity> findByCartId(Long cartId);

    Optional<CartItemEntity> findByIdAndCartId(
            Long itemId,
            Long cartId
    );

    void deleteByCartId(Long cartId);
}