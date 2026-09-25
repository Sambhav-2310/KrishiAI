package com.KrishiAI.Backend.controller;

import com.KrishiAI.Backend.dto.CreatePaymentOrderRequestDTO;
import com.KrishiAI.Backend.dto.PaymentOrderResponseDTO;
import com.KrishiAI.Backend.entity.UserEntity;
import com.KrishiAI.Backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.KrishiAI.Backend.dto.payment.PaymentVerificationRequestDTO;
import com.KrishiAI.Backend.dto.payment.PaymentVerificationResponseDTO;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<PaymentOrderResponseDTO> createOrder(
            Authentication authentication,
            @Valid @RequestBody CreatePaymentOrderRequestDTO request
    ) {

        UserEntity consumer =
                (UserEntity) authentication.getPrincipal();

        PaymentOrderResponseDTO response =
                paymentService.createRazorpayOrder(
                        consumer,
                        request
                );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<com.KrishiAI.Backend.dto.payment.PaymentVerificationResponseDTO> verifyPayment(
            Authentication authentication,
            @Valid @RequestBody PaymentVerificationRequestDTO request
    ) {

        UserEntity consumer =
                (UserEntity) authentication.getPrincipal();

        PaymentVerificationResponseDTO response =
                paymentService.verifyPayment(
                        consumer,
                        request
                );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/cod")
    public ResponseEntity<PaymentVerificationResponseDTO> createCodOrder(
            Authentication authentication,
            @RequestBody @Valid CreatePaymentOrderRequestDTO request
    ) {

        UserEntity consumer =
                (UserEntity) authentication.getPrincipal();

        PaymentVerificationResponseDTO response =
                paymentService.createCodOrder(
                        consumer,
                        request
                );

        return ResponseEntity.ok(response);
    }
}