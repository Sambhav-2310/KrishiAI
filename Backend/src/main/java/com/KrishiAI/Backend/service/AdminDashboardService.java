package com.KrishiAI.Backend.service;

import com.KrishiAI.Backend.dto.AdminDashboardResponseDTO;
import com.KrishiAI.Backend.entity.PaymentStatus;
import com.KrishiAI.Backend.entity.Role;
import com.KrishiAI.Backend.entity.UserStatus;
import com.KrishiAI.Backend.repository.OrderRepository;
import com.KrishiAI.Backend.repository.PaymentRepository;
import com.KrishiAI.Backend.repository.ProductRepository;
import com.KrishiAI.Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    public AdminDashboardResponseDTO getDashboard() {

        long totalUsers = userRepository.count();

        long totalFarmers =
                userRepository.countByRole(Role.FARMER);

        long totalConsumers =
                userRepository.countByRole(Role.CONSUMER);

        long totalAdmins =
                userRepository.countByRole(Role.ADMIN);

        long activeUsers =
                userRepository.countByStatus(UserStatus.ACTIVE);

        long blockedUsers =
                userRepository.countByStatus(UserStatus.BLOCKED);

        long totalProducts =
                productRepository.count();

        long totalOrders =
                orderRepository.count();

        long paidOrders =
                paymentRepository.countByStatus(
                        PaymentStatus.PAID
                );

        BigDecimal totalRevenue =
                paymentRepository.sumAmountByStatus(
                        PaymentStatus.PAID
                );

        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        return AdminDashboardResponseDTO.builder()
                .totalUsers(totalUsers)
                .totalFarmers(totalFarmers)
                .totalConsumers(totalConsumers)
                .totalAdmins(totalAdmins)
                .activeUsers(activeUsers)
                .blockedUsers(blockedUsers)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .paidOrders(paidOrders)
                .totalRevenue(totalRevenue)
                .build();
    }
}