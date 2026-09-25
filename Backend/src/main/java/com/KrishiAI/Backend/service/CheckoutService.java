package com.KrishiAI.Backend.service;

import com.KrishiAI.Backend.dto.CheckoutRequestDTO;
import com.KrishiAI.Backend.dto.OrderItemResponseDTO;
import com.KrishiAI.Backend.dto.OrderResponseDTO;
import com.KrishiAI.Backend.entity.CartEntity;
import com.KrishiAI.Backend.entity.CartItemEntity;
import com.KrishiAI.Backend.entity.OrderEntity;
import com.KrishiAI.Backend.entity.OrderItemEntity;
import com.KrishiAI.Backend.entity.OrderStatus;
import com.KrishiAI.Backend.entity.PaymentStatus;
import com.KrishiAI.Backend.entity.ProductEntity;
import com.KrishiAI.Backend.entity.ProductStatus;
import com.KrishiAI.Backend.entity.Role;
import com.KrishiAI.Backend.entity.UserEntity;
import com.KrishiAI.Backend.repository.CartItemRepository;
import com.KrishiAI.Backend.repository.CartRepository;
import com.KrishiAI.Backend.repository.OrderItemRepository;
import com.KrishiAI.Backend.repository.OrderRepository;
import com.KrishiAI.Backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CheckoutService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    @Transactional
    public OrderResponseDTO checkout(
            UserEntity consumer,
            CheckoutRequestDTO request
    ) {

        validateConsumer(consumer);

        CartEntity cart = cartRepository
                .findByConsumerId(consumer.getId())
                .orElseThrow(() ->
                        new RuntimeException("Cart not found")
                );

        List<CartItemEntity> cartItems =
                cartItemRepository.findByCartId(cart.getId());

        if (cartItems.isEmpty()) {
            throw new RuntimeException(
                    "Cannot checkout with an empty cart"
            );
        }

        /*
         * Create the order first in memory.
         * We don't save it until all validation succeeds.
         */
        OrderEntity order = OrderEntity.builder()
                .consumer(consumer)
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .deliveryAddress(request.getDeliveryAddress())
                .notes(request.getNotes())
                .totalAmount(BigDecimal.ZERO)
                .build();

        List<OrderItemEntity> orderItems = new ArrayList<>();

        BigDecimal totalAmount = BigDecimal.ZERO;

        /*
         * Validate every cart item and lock its product row.
         */
        for (CartItemEntity cartItem : cartItems) {

            ProductEntity product =
                    productRepository
                            .findByIdForUpdate(
                                    cartItem.getProduct().getId()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Product not found: "
                                                    + cartItem.getProduct().getId()
                                    )
                            );

            validateProduct(product);

            BigDecimal requestedQuantity =
                    cartItem.getQuantity();

            validateStock(
                    product,
                    requestedQuantity
            );

            BigDecimal price = product.getPrice();

            BigDecimal subtotal =
                    price.multiply(requestedQuantity);

            OrderItemEntity orderItem =
                    OrderItemEntity.builder()
                            .order(order)
                            .product(product)
                            .quantity(requestedQuantity)
                            .price(price)
                            .subtotal(subtotal)
                            .build();

            orderItems.add(orderItem);

            totalAmount =
                    totalAmount.add(subtotal);

            /*
             * Reduce current available stock.
             */
            BigDecimal remainingQuantity =
                    product.getQuantity()
                            .subtract(requestedQuantity);

            product.setQuantity(remainingQuantity);

            /*
             * If no stock remains, mark SOLD_OUT.
             */
            if (remainingQuantity.compareTo(
                    BigDecimal.ZERO
            ) == 0) {

                product.setStatus(
                        ProductStatus.SOLD_OUT
                );
            }

            productRepository.save(product);
        }

        order.setTotalAmount(totalAmount);

        OrderEntity savedOrder =
                orderRepository.save(order);

        /*
         * Attach saved order to each order item.
         */
        for (OrderItemEntity orderItem : orderItems) {
            orderItem.setOrder(savedOrder);
        }

        orderItemRepository.saveAll(orderItems);

        /*
         * Checkout succeeded.
         * Clear the cart.
         */
        cartItemRepository.deleteByCartId(
                cart.getId()
        );

        return mapToResponse(
                savedOrder,
                orderItems
        );
    }

    private void validateConsumer(UserEntity user) {

        if (user == null) {
            throw new RuntimeException(
                    "User not found"
            );
        }

        if (user.getRole() != Role.CONSUMER) {
            throw new RuntimeException(
                    "Only consumers can checkout"
            );
        }
    }

    private void validateProduct(ProductEntity product) {

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new RuntimeException(
                    "Product is no longer available: "
                            + product.getName()
            );
        }

        if (product.getQuantity() == null ||
                product.getQuantity()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Product is out of stock: "
                            + product.getName()
            );
        }
    }

    private void validateStock(
            ProductEntity product,
            BigDecimal requestedQuantity
    ) {

        if (requestedQuantity == null ||
                requestedQuantity.compareTo(
                        BigDecimal.ZERO
                ) <= 0) {

            throw new RuntimeException(
                    "Invalid quantity for product: "
                            + product.getName()
            );
        }

        if (requestedQuantity.compareTo(
                product.getQuantity()
        ) > 0) {

            throw new RuntimeException(
                    "Insufficient stock for product: "
                            + product.getName()
                            + ". Available: "
                            + product.getQuantity()
                            + " "
                            + product.getUnit()
            );
        }
    }

    private OrderResponseDTO mapToResponse(
            OrderEntity order,
            List<OrderItemEntity> orderItems
    ) {

        List<OrderItemResponseDTO> items =
                orderItems.stream()
                        .map(this::mapToItemResponse)
                        .toList();

        return OrderResponseDTO.builder()
                .id(order.getId())
                .consumerId(
                        order.getConsumer().getId()
                )
                .consumerName(
                        order.getConsumer().getName()
                )
                .status(order.getStatus())
                .paymentStatus(
                        order.getPaymentStatus()
                )
                .totalAmount(
                        order.getTotalAmount()
                )
                .deliveryAddress(
                        order.getDeliveryAddress()
                )
                .notes(order.getNotes())
                .items(items)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private OrderItemResponseDTO mapToItemResponse(
            OrderItemEntity item
    ) {

        return OrderItemResponseDTO.builder()
                .id(item.getId())
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
                .build();
    }
}