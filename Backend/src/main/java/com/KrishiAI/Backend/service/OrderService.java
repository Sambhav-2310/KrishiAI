package com.KrishiAI.Backend.service;

import com.KrishiAI.Backend.dto.FarmerOrderResponseDTO;
import com.KrishiAI.Backend.dto.OrderItemResponseDTO;
import com.KrishiAI.Backend.dto.OrderResponseDTO;
import com.KrishiAI.Backend.entity.OrderEntity;
import com.KrishiAI.Backend.entity.OrderItemEntity;
import com.KrishiAI.Backend.entity.OrderItemStatus;
import com.KrishiAI.Backend.entity.OrderStatus;
import com.KrishiAI.Backend.entity.PaymentMethod;
import com.KrishiAI.Backend.entity.PaymentStatus;
import com.KrishiAI.Backend.entity.Role;
import com.KrishiAI.Backend.entity.UserEntity;
import com.KrishiAI.Backend.repository.OrderItemRepository;
import com.KrishiAI.Backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;


    // =========================================================
    // CONSUMER ORDERS
    // =========================================================

    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getMyOrders(
            UserEntity consumer
    ) {

        validateConsumer(consumer);

        List<OrderEntity> orders =
                orderRepository
                        .findByConsumerIdOrderByCreatedAtDesc(
                                consumer.getId()
                        );

        return orders.stream()
                .map(this::mapToResponse)
                .toList();
    }


    @Transactional(readOnly = true)
    public OrderResponseDTO getMyOrder(
            UserEntity consumer,
            Long orderId
    ) {

        validateConsumer(consumer);

        OrderEntity order =
                orderRepository
                        .findByIdAndConsumerId(
                                orderId,
                                consumer.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"
                                )
                        );

        return mapToResponse(order);
    }


    // =========================================================
    // FARMER ORDERS
    // =========================================================

    @Transactional(readOnly = true)
    public List<FarmerOrderResponseDTO> getFarmerOrders(
            UserEntity farmer
    ) {

        validateFarmer(farmer);

        List<OrderEntity> orders =
                orderRepository.findOrdersForFarmer(
                        farmer.getId()
                );

        return orders.stream()
                .map(order ->
                        mapToFarmerResponse(
                                order,
                                farmer.getId()
                        )
                )
                .toList();
    }


    // =========================================================
    // UPDATE FARMER ITEM STATUS
    // =========================================================

    @Transactional
    public FarmerOrderResponseDTO updateOrderItemStatus(
            UserEntity farmer,
            Long itemId,
            OrderItemStatus newStatus
    ) {

        validateFarmer(farmer);

        OrderItemEntity item =
                orderItemRepository
                        .findFarmerOrderItem(
                                itemId,
                                farmer.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order item not found"
                                )
                        );


        // =====================================================
        // VALIDATE STATUS TRANSITION
        // =====================================================

        validateStatusTransition(
                item.getStatus(),
                newStatus
        );


        OrderEntity order =
                item.getOrder();


        // =====================================================
        // DELIVERY + PAYMENT LOGIC
        // =====================================================

        if (newStatus == OrderItemStatus.DELIVERED) {

            /*
             * ONLINE PAYMENT
             *
             * Customer must have completed Razorpay payment
             * before the farmer can mark the product delivered.
             */
            if (order.getPaymentMethod() == PaymentMethod.ONLINE) {

                if (order.getPaymentStatus() != PaymentStatus.PAID) {

                    throw new RuntimeException(
                            "Online payment must be completed before delivery"
                    );
                }
            }


            /*
             * CASH ON DELIVERY
             *
             * For COD, when the farmer marks the item as DELIVERED,
             * it means:
             *
             * 1. Product was delivered
             * 2. Cash was collected
             *
             * Therefore payment becomes PAID.
             */
            if (order.getPaymentMethod() == PaymentMethod.COD) {

                order.setPaymentStatus(
                        PaymentStatus.PAID
                );
            }
        }


        // =====================================================
        // UPDATE ITEM STATUS
        // =====================================================

        item.setStatus(newStatus);

        orderItemRepository.save(item);


        // =====================================================
        // UPDATE OVERALL ORDER STATUS
        // =====================================================

        updateOverallOrderStatus(order);

        orderRepository.save(order);


        // =====================================================
        // RETURN UPDATED FARMER ORDER
        // =====================================================

        return mapToFarmerResponse(
                order,
                farmer.getId()
        );
    }


    // =========================================================
    // STATUS TRANSITION VALIDATION
    // =========================================================

    private void validateStatusTransition(
            OrderItemStatus current,
            OrderItemStatus next
    ) {

        if (current == null) {
            return;
        }

        if (next == null) {
            throw new RuntimeException(
                    "Status is required"
            );
        }


        // Same status - nothing to change
        if (current == next) {
            return;
        }


        // =====================================================
        // CANCELLATION
        // =====================================================

        if (next == OrderItemStatus.CANCELLED) {

            if (current == OrderItemStatus.DELIVERED) {

                throw new RuntimeException(
                        "Delivered item cannot be cancelled"
                );
            }

            return;
        }


        // =====================================================
        // NORMAL STATUS FLOW
        // =====================================================

        boolean valid =
                switch (current) {

                    case CONFIRMED ->
                            next == OrderItemStatus.PROCESSING;

                    case PROCESSING ->
                            next == OrderItemStatus.SHIPPED;

                    case SHIPPED ->
                            next == OrderItemStatus.DELIVERED;

                    case DELIVERED ->
                            false;

                    case CANCELLED ->
                            false;
                };


        if (!valid) {

            throw new RuntimeException(
                    "Invalid status transition from "
                            + current
                            + " to "
                            + next
            );
        }
    }


    // =========================================================
    // UPDATE OVERALL ORDER STATUS
    // =========================================================

    private void updateOverallOrderStatus(
            OrderEntity order
    ) {

        List<OrderItemEntity> items =
                orderItemRepository
                        .findAllItemsForOrder(
                                order.getId()
                        );


        if (items.isEmpty()) {
            return;
        }


        // =====================================================
        // CHECK ALL DELIVERED
        // =====================================================

        boolean allDelivered =
                items.stream()
                        .allMatch(item ->
                                item.getStatus() ==
                                        OrderItemStatus.DELIVERED
                        );


        // =====================================================
        // CHECK ALL CANCELLED
        // =====================================================

        boolean allCancelled =
                items.stream()
                        .allMatch(item ->
                                item.getStatus() ==
                                        OrderItemStatus.CANCELLED
                        );


        // =====================================================
        // CHECK ANY SHIPPED
        // =====================================================

        boolean anyShipped =
                items.stream()
                        .anyMatch(item ->
                                item.getStatus() ==
                                        OrderItemStatus.SHIPPED
                        );


        // =====================================================
        // CHECK ANY PROCESSING
        // =====================================================

        boolean anyProcessing =
                items.stream()
                        .anyMatch(item ->
                                item.getStatus() ==
                                        OrderItemStatus.PROCESSING
                        );


        // =====================================================
        // SET OVERALL ORDER STATUS
        // =====================================================

        if (allCancelled) {

            order.setStatus(
                    OrderStatus.CANCELLED
            );

        } else if (allDelivered) {

            order.setStatus(
                    OrderStatus.DELIVERED
            );

        } else if (anyShipped) {

            order.setStatus(
                    OrderStatus.SHIPPED
            );

        } else if (anyProcessing) {

            order.setStatus(
                    OrderStatus.PROCESSING
            );

        } else {

            order.setStatus(
                    OrderStatus.CONFIRMED
            );
        }
    }


    // =========================================================
    // FARMER RESPONSE
    // =========================================================

    private FarmerOrderResponseDTO mapToFarmerResponse(
            OrderEntity order,
            Long farmerId
    ) {

        List<OrderItemEntity> farmerItems =
                orderItemRepository
                        .findFarmerItemsInOrder(
                                order.getId(),
                                farmerId
                        );


        List<FarmerOrderResponseDTO.FarmerOrderItemDTO>
                items =
                farmerItems.stream()
                        .map(item ->
                                FarmerOrderResponseDTO
                                        .FarmerOrderItemDTO
                                        .builder()
                                        .itemId(
                                                item.getId()
                                        )
                                        .productId(
                                                item.getProduct().getId()
                                        )
                                        .productName(
                                                item.getProduct().getName()
                                        )
                                        .imageUrl(
                                                item.getProduct().getImageUrl()
                                        )
                                        .unit(
                                                item.getProduct().getUnit()
                                        )
                                        .quantity(
                                                item.getQuantity()
                                        )
                                        .price(
                                                item.getPrice()
                                        )
                                        .subtotal(
                                                item.getSubtotal()
                                        )
                                        .status(
                                                item.getStatus()
                                        )
                                        .build()
                        )
                        .toList();


        // =====================================================
        // FARMER TOTAL
        // =====================================================

        BigDecimal farmerTotal =
                farmerItems.stream()
                        .map(OrderItemEntity::getSubtotal)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );


        // =====================================================
        // BUILD FARMER RESPONSE
        // =====================================================

        return FarmerOrderResponseDTO.builder()
                .orderId(
                        order.getId()
                )
                .consumerId(
                        order.getConsumer().getId()
                )
                .consumerName(
                        order.getConsumer().getName()
                )
                .consumerPhone(
                        order.getConsumer().getPhone()
                )
                .orderStatus(
                        order.getStatus()
                )
                .paymentStatus(
                        order.getPaymentStatus()
                )
                .paymentMethod(
                        order.getPaymentMethod()
                )
                .orderTotalAmount(
                        order.getTotalAmount()
                )
                .farmerTotalAmount(
                        farmerTotal
                )
                .deliveryAddress(
                        order.getDeliveryAddress()
                )
                .notes(
                        order.getNotes()
                )
                .items(items)
                .createdAt(
                        order.getCreatedAt()
                )
                .updatedAt(
                        order.getUpdatedAt()
                )
                .build();
    }


    // =========================================================
    // CONSUMER RESPONSE
    // =========================================================

    private OrderResponseDTO mapToResponse(
            OrderEntity order
    ) {

        List<OrderItemEntity> orderItems =
                orderItemRepository
                        .findByOrderId(
                                order.getId()
                        );


        List<OrderItemResponseDTO> items =
                orderItems.stream()
                        .map(this::mapToItemResponse)
                        .toList();


        return OrderResponseDTO.builder()
                .id(
                        order.getId()
                )
                .consumerId(
                        order.getConsumer().getId()
                )
                .consumerName(
                        order.getConsumer().getName()
                )
                .status(
                        order.getStatus()
                )
                .paymentStatus(
                        order.getPaymentStatus()
                )
                .totalAmount(
                        order.getTotalAmount()
                )
                .deliveryAddress(
                        order.getDeliveryAddress()
                )
                .notes(
                        order.getNotes()
                )
                .items(items)
                .createdAt(
                        order.getCreatedAt()
                )
                .updatedAt(
                        order.getUpdatedAt()
                )
                .build();
    }


    // =========================================================
    // ORDER ITEM RESPONSE
    // =========================================================

    private OrderItemResponseDTO mapToItemResponse(
            OrderItemEntity item
    ) {

        return OrderItemResponseDTO.builder()
                .id(
                        item.getId()
                )
                .productId(
                        item.getProduct().getId()
                )
                .productName(
                        item.getProduct().getName()
                )
                .imageUrl(
                        item.getProduct().getImageUrl()
                )
                .unit(
                        item.getProduct().getUnit()
                )
                .quantity(
                        item.getQuantity()
                )
                .price(
                        item.getPrice()
                )
                .subtotal(
                        item.getSubtotal()
                )
                .status(
                        item.getStatus()
                )
                .build();
    }


    // =========================================================
    // CONSUMER VALIDATION
    // =========================================================

    private void validateConsumer(
            UserEntity user
    ) {

        if (user == null) {

            throw new RuntimeException(
                    "User not found"
            );
        }


        if (user.getRole() != Role.CONSUMER) {

            throw new RuntimeException(
                    "Only consumers can access these orders"
            );
        }
    }


    // =========================================================
    // FARMER VALIDATION
    // =========================================================

    private void validateFarmer(
            UserEntity user
    ) {

        if (user == null) {

            throw new RuntimeException(
                    "User not found"
            );
        }


        if (user.getRole() != Role.FARMER) {

            throw new RuntimeException(
                    "Only farmers can access these orders"
            );
        }
    }
}