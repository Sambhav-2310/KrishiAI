package com.KrishiAI.Backend.controller;

import com.KrishiAI.Backend.dto.CheckoutRequestDTO;
import com.KrishiAI.Backend.dto.OrderResponseDTO;
import com.KrishiAI.Backend.entity.UserEntity;
import com.KrishiAI.Backend.service.CheckoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final CheckoutService checkoutService;

    @PostMapping
    public ResponseEntity<OrderResponseDTO> checkout(
            Authentication authentication,
            @Valid @RequestBody CheckoutRequestDTO request
    ) {

        UserEntity consumer =
                (UserEntity) authentication.getPrincipal();

        return ResponseEntity.ok(
                checkoutService.checkout(
                        consumer,
                        request
                )
        );
    }
}