package com.KrishiAI.Backend.controller;

import com.KrishiAI.Backend.dto.FarmerOrderResponseDTO;
import com.KrishiAI.Backend.dto.OrderResponseDTO;
import com.KrishiAI.Backend.dto.UpdateOrderItemStatusRequestDTO;
import com.KrishiAI.Backend.entity.UserEntity;
import com.KrishiAI.Backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;


    // =========================================================
    // CONSUMER
    // =========================================================

    @GetMapping("/my")
    public ResponseEntity<List<OrderResponseDTO>> getMyOrders(
            Authentication authentication
    ) {

        UserEntity consumer =
                (UserEntity) authentication.getPrincipal();

        return ResponseEntity.ok(
                orderService.getMyOrders(
                        consumer
                )
        );
    }


    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getMyOrder(
            Authentication authentication,
            @PathVariable Long orderId
    ) {

        UserEntity consumer =
                (UserEntity) authentication.getPrincipal();

        return ResponseEntity.ok(
                orderService.getMyOrder(
                        consumer,
                        orderId
                )
        );
    }


    // =========================================================
    // FARMER
    // =========================================================

    @GetMapping("/farmer")
    public ResponseEntity<List<FarmerOrderResponseDTO>>
    getFarmerOrders(
            Authentication authentication
    ) {

        UserEntity farmer =
                (UserEntity) authentication.getPrincipal();

        return ResponseEntity.ok(
                orderService.getFarmerOrders(
                        farmer
                )
        );
    }


    @PutMapping("/items/{itemId}/status")
    public ResponseEntity<FarmerOrderResponseDTO>
    updateOrderItemStatus(
            Authentication authentication,
            @PathVariable Long itemId,
            @Valid @RequestBody
            UpdateOrderItemStatusRequestDTO request
    ) {

        UserEntity farmer =
                (UserEntity) authentication.getPrincipal();

        return ResponseEntity.ok(
                orderService.updateOrderItemStatus(
                        farmer,
                        itemId,
                        request.getStatus()
                )
        );
    }
}