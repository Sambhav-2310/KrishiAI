package com.KrishiAI.Backend.repository;

import com.KrishiAI.Backend.entity.OrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderItemRepository
        extends JpaRepository<OrderItemEntity, Long> {

    List<OrderItemEntity> findByOrderId(Long orderId);


    @Query("""
            SELECT oi
            FROM OrderItemEntity oi
            WHERE oi.order.id = :orderId
            AND oi.product.farmer.id = :farmerId
            """)
    List<OrderItemEntity> findFarmerItemsInOrder(
            @Param("orderId") Long orderId,
            @Param("farmerId") Long farmerId
    );


    @Query("""
            SELECT oi
            FROM OrderItemEntity oi
            WHERE oi.id = :itemId
            AND oi.product.farmer.id = :farmerId
            """)
    Optional<OrderItemEntity> findFarmerOrderItem(
            @Param("itemId") Long itemId,
            @Param("farmerId") Long farmerId
    );


    @Query("""
            SELECT oi
            FROM OrderItemEntity oi
            WHERE oi.order.id = :orderId
            """)
    List<OrderItemEntity> findAllItemsForOrder(
            @Param("orderId") Long orderId
    );

}