package com.KrishiAI.Backend.controller;

import com.KrishiAI.Backend.dto.AddToCartRequestDTO;
import com.KrishiAI.Backend.dto.CartResponseDTO;
import com.KrishiAI.Backend.dto.UpdateCartItemRequestDTO;
import com.KrishiAI.Backend.entity.UserEntity;
import com.KrishiAI.Backend.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    @PostMapping("/items")
    public ResponseEntity<CartResponseDTO> addToCart(
            Authentication authentication,
            @Valid @RequestBody AddToCartRequestDTO request
    ) {

        UserEntity consumer =
                (UserEntity) authentication.getPrincipal();

        return ResponseEntity.ok(
                cartService.addToCart(consumer, request)
        );
    }

    @GetMapping
    public ResponseEntity<CartResponseDTO> getCart(
            Authentication authentication
    ) {

        UserEntity consumer =
                (UserEntity) authentication.getPrincipal();

        return ResponseEntity.ok(
                cartService.getCart(consumer)
        );
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponseDTO> updateCartItem(
            Authentication authentication,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequestDTO request
    ) {

        UserEntity consumer =
                (UserEntity) authentication.getPrincipal();

        return ResponseEntity.ok(
                cartService.updateCartItem(
                        consumer,
                        itemId,
                        request
                )
        );
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponseDTO> removeCartItem(
            Authentication authentication,
            @PathVariable Long itemId
    ) {

        UserEntity consumer =
                (UserEntity) authentication.getPrincipal();

        return ResponseEntity.ok(
                cartService.removeCartItem(
                        consumer,
                        itemId
                )
        );
    }

    @DeleteMapping
    public ResponseEntity<?> clearCart(
            Authentication authentication
    ) {

        UserEntity consumer =
                (UserEntity) authentication.getPrincipal();

        cartService.clearCart(consumer);

        return ResponseEntity.ok(
                "Cart cleared successfully"
        );
    }
}