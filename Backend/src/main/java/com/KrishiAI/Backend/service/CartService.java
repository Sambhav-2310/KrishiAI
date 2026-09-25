package com.KrishiAI.Backend.service;

import com.KrishiAI.Backend.dto.AddToCartRequestDTO;
import com.KrishiAI.Backend.dto.CartItemResponseDTO;
import com.KrishiAI.Backend.dto.CartResponseDTO;
import com.KrishiAI.Backend.dto.UpdateCartItemRequestDTO;
import com.KrishiAI.Backend.entity.CartEntity;
import com.KrishiAI.Backend.entity.CartItemEntity;
import com.KrishiAI.Backend.entity.ProductEntity;
import com.KrishiAI.Backend.entity.ProductStatus;
import com.KrishiAI.Backend.entity.UserEntity;
import com.KrishiAI.Backend.entity.Role;
import com.KrishiAI.Backend.repository.CartItemRepository;
import com.KrishiAI.Backend.repository.CartRepository;
import com.KrishiAI.Backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    @Transactional
    public CartResponseDTO addToCart(
            UserEntity consumer,
            AddToCartRequestDTO request
    ) {

        validateConsumer(consumer);

        ProductEntity product = productRepository
                .findById(request.getProductId())
                .orElseThrow(() ->
                        new RuntimeException("Product not found")
                );

        validateProduct(product);

        CartEntity cart = getOrCreateCart(consumer);

        CartItemEntity cartItem = cartItemRepository
                .findByCartIdAndProductId(
                        cart.getId(),
                        product.getId()
                )
                .orElse(null);

        BigDecimal newQuantity;

        if (cartItem == null) {

            newQuantity = request.getQuantity();

            validateQuantity(newQuantity, product);

            cartItem = CartItemEntity.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(newQuantity)
                    .build();

        } else {

            newQuantity = cartItem.getQuantity()
                    .add(request.getQuantity());

            validateQuantity(newQuantity, product);

            cartItem.setQuantity(newQuantity);
        }

        cartItemRepository.save(cartItem);

        return getCart(consumer);
    }

    @Transactional(readOnly = true)
    public CartResponseDTO getCart(UserEntity consumer) {

        validateConsumer(consumer);

        CartEntity cart = cartRepository
                .findByConsumerId(consumer.getId())
                .orElse(null);

        if (cart == null) {
            return CartResponseDTO.builder()
                    .cartId(null)
                    .consumerId(consumer.getId())
                    .items(List.of())
                    .totalAmount(BigDecimal.ZERO)
                    .build();
        }

        List<CartItemEntity> cartItems =
                cartItemRepository.findByCartId(cart.getId());

        List<CartItemResponseDTO> items = cartItems
                .stream()
                .map(this::mapToItemResponse)
                .toList();

        BigDecimal totalAmount = items.stream()
                .map(CartItemResponseDTO::getItemTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponseDTO.builder()
                .cartId(cart.getId())
                .consumerId(consumer.getId())
                .items(items)
                .totalAmount(totalAmount)
                .build();
    }

    @Transactional
    public CartResponseDTO updateCartItem(
            UserEntity consumer,
            Long itemId,
            UpdateCartItemRequestDTO request
    ) {

        validateConsumer(consumer);

        CartEntity cart = cartRepository
                .findByConsumerId(consumer.getId())
                .orElseThrow(() ->
                        new RuntimeException("Cart not found")
                );

        CartItemEntity cartItem = cartItemRepository
                .findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() ->
                        new RuntimeException("Cart item not found")
                );

        ProductEntity product = cartItem.getProduct();

        validateProduct(product);

        validateQuantity(request.getQuantity(), product);

        cartItem.setQuantity(request.getQuantity());

        cartItemRepository.save(cartItem);

        return getCart(consumer);
    }

    @Transactional
    public CartResponseDTO removeCartItem(
            UserEntity consumer,
            Long itemId
    ) {

        validateConsumer(consumer);

        CartEntity cart = cartRepository
                .findByConsumerId(consumer.getId())
                .orElseThrow(() ->
                        new RuntimeException("Cart not found")
                );

        CartItemEntity cartItem = cartItemRepository
                .findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() ->
                        new RuntimeException("Cart item not found")
                );

        cartItemRepository.delete(cartItem);

        return getCart(consumer);
    }

    @Transactional
    public void clearCart(UserEntity consumer) {

        validateConsumer(consumer);

        CartEntity cart = cartRepository
                .findByConsumerId(consumer.getId())
                .orElse(null);

        if (cart == null) {
            return;
        }

        cartItemRepository.deleteByCartId(cart.getId());
    }

    private CartEntity getOrCreateCart(UserEntity consumer) {

        return cartRepository
                .findByConsumerId(consumer.getId())
                .orElseGet(() -> {

                    CartEntity cart = CartEntity.builder()
                            .consumer(consumer)
                            .build();

                    return cartRepository.save(cart);
                });
    }

    private void validateConsumer(UserEntity user) {

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        if (user.getRole() != Role.CONSUMER) {
            throw new RuntimeException(
                    "Only consumers can use the cart"
            );
        }
    }

    private void validateProduct(ProductEntity product) {

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new RuntimeException(
                    "Product is not available"
            );
        }

        if (product.getQuantity() == null ||
                product.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Product is out of stock"
            );
        }
    }

    private void validateQuantity(
            BigDecimal requestedQuantity,
            ProductEntity product
    ) {

        if (requestedQuantity == null ||
                requestedQuantity.compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than zero"
            );
        }

        if (requestedQuantity.compareTo(product.getQuantity()) > 0) {

            throw new RuntimeException(
                    "Requested quantity exceeds available stock"
            );
        }
    }

    private CartItemResponseDTO mapToItemResponse(
            CartItemEntity item
    ) {

        ProductEntity product = item.getProduct();

        BigDecimal itemTotal =
                product.getPrice().multiply(item.getQuantity());

        return CartItemResponseDTO.builder()
                .id(item.getId())
                .productId(product.getId())
                .productName(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .quantity(item.getQuantity())
                .unit(product.getUnit())
                .imageUrl(product.getImageUrl())
                .location(product.getLocation())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .status(product.getStatus())
                .itemTotal(itemTotal)
                .build();
    }
}