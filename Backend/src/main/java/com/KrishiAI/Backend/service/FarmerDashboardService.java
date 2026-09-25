package com.KrishiAI.Backend.service;

import com.KrishiAI.Backend.dto.FarmerDashboardResponseDTO;
import com.KrishiAI.Backend.dto.FarmerOrderResponseDTO;
import com.KrishiAI.Backend.dto.ProductResponseDTO;
import com.KrishiAI.Backend.entity.OrderStatus;
import com.KrishiAI.Backend.entity.ProductStatus;
import com.KrishiAI.Backend.entity.Role;
import com.KrishiAI.Backend.entity.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FarmerDashboardService {

    private final ProductService productService;
    private final OrderService orderService;


    // =========================================================
    // FARMER DASHBOARD
    // =========================================================

    @Transactional(readOnly = true)
    public FarmerDashboardResponseDTO getDashboard(
            UserEntity farmer
    ) {

        validateFarmer(farmer);


        // =====================================================
        // PRODUCTS
        // =====================================================

        List<ProductResponseDTO> products =
                productService.getMyProducts(
                        farmer.getId()
                );


        long totalProducts =
                products.size();

        long activeProducts =
                products.stream()
                        .filter(product ->
                                product.getStatus()
                                        == ProductStatus.ACTIVE
                        )
                        .count();

        long soldOutProducts =
                products.stream()
                        .filter(product ->
                                product.getStatus()
                                        == ProductStatus.SOLD_OUT
                        )
                        .count();

        long inactiveProducts =
                products.stream()
                        .filter(product ->
                                product.getStatus()
                                        == ProductStatus.INACTIVE
                        )
                        .count();


        // =====================================================
        // ORDERS
        // =====================================================

        List<FarmerOrderResponseDTO> orders =
                orderService.getFarmerOrders(
                        farmer
                );


        long totalOrders =
                orders.size();


        long pendingOrders =
                orders.stream()
                        .filter(order ->
                                order.getOrderStatus()
                                        == OrderStatus.PENDING
                        )
                        .count();


        long confirmedOrders =
                orders.stream()
                        .filter(order ->
                                order.getOrderStatus()
                                        == OrderStatus.CONFIRMED
                        )
                        .count();


        long processingOrders =
                orders.stream()
                        .filter(order ->
                                order.getOrderStatus()
                                        == OrderStatus.PROCESSING
                        )
                        .count();


        long shippedOrders =
                orders.stream()
                        .filter(order ->
                                order.getOrderStatus()
                                        == OrderStatus.SHIPPED
                        )
                        .count();


        long deliveredOrders =
                orders.stream()
                        .filter(order ->
                                order.getOrderStatus()
                                        == OrderStatus.DELIVERED
                        )
                        .count();


        long cancelledOrders =
                orders.stream()
                        .filter(order ->
                                order.getOrderStatus()
                                        == OrderStatus.CANCELLED
                        )
                        .count();


        // =====================================================
        // TOTAL SALES
        // =====================================================

        /*
         * FarmerOrderResponseDTO already contains
         * farmerTotalAmount, which represents only this
         * farmer's products in that order.
         *
         * We therefore do NOT use the complete order total.
         */

        BigDecimal totalSales =
                orders.stream()
                        .filter(order ->
                                order.getOrderStatus() != OrderStatus.CANCELLED
                        )
                        .map(FarmerOrderResponseDTO::getFarmerTotalAmount)
                        .filter(amount -> amount != null)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );


        // =====================================================
        // RETURN DASHBOARD
        // =====================================================

        return FarmerDashboardResponseDTO.builder()

                // Products
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .soldOutProducts(soldOutProducts)
                .inactiveProducts(inactiveProducts)

                // Orders
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .confirmedOrders(confirmedOrders)
                .processingOrders(processingOrders)
                .shippedOrders(shippedOrders)
                .deliveredOrders(deliveredOrders)
                .cancelledOrders(cancelledOrders)

                // Sales
                .totalSales(totalSales)

                .build();
    }


    // =========================================================
    // FARMER VALIDATION
    // =========================================================

    private void validateFarmer(UserEntity farmer) {

        if (farmer == null) {
            throw new RuntimeException(
                    "Farmer not found"
            );
        }

        if (farmer.getRole() != Role.FARMER) {
            throw new RuntimeException(
                    "Only farmers can access the farmer dashboard"
            );
        }
    }
}