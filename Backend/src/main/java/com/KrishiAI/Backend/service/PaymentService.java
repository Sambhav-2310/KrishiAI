package com.KrishiAI.Backend.service;

import com.KrishiAI.Backend.dto.CreatePaymentOrderRequestDTO;
import com.KrishiAI.Backend.dto.PaymentOrderResponseDTO;
import com.KrishiAI.Backend.dto.payment.PaymentVerificationRequestDTO;
import com.KrishiAI.Backend.dto.payment.PaymentVerificationResponseDTO;
import com.KrishiAI.Backend.entity.CartEntity;
import com.KrishiAI.Backend.entity.CartItemEntity;
import com.KrishiAI.Backend.entity.OrderEntity;
import com.KrishiAI.Backend.entity.OrderItemEntity;
import com.KrishiAI.Backend.entity.OrderItemStatus;
import com.KrishiAI.Backend.entity.OrderStatus;
import com.KrishiAI.Backend.entity.PaymentEntity;
import com.KrishiAI.Backend.entity.PaymentMethod;
import com.KrishiAI.Backend.entity.PaymentStatus;
import com.KrishiAI.Backend.entity.ProductEntity;
import com.KrishiAI.Backend.entity.ProductStatus;
import com.KrishiAI.Backend.entity.UserEntity;
import com.KrishiAI.Backend.repository.CartItemRepository;
import com.KrishiAI.Backend.repository.CartRepository;
import com.KrishiAI.Backend.repository.OrderItemRepository;
import com.KrishiAI.Backend.repository.OrderRepository;
import com.KrishiAI.Backend.repository.PaymentRepository;
import com.KrishiAI.Backend.repository.ProductRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final RazorpayClient razorpayClient;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final ProductRepository productRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;


    // =========================================================
    // CREATE RAZORPAY ORDER
    // =========================================================

    @Transactional
    public PaymentOrderResponseDTO createRazorpayOrder(
            UserEntity consumer,
            CreatePaymentOrderRequestDTO request
    ) {

        CartEntity cart = cartRepository
                .findByConsumerId(consumer.getId())
                .orElseThrow(() ->
                        new RuntimeException("Cart not found")
                );

        List<CartItemEntity> cartItems =
                cartItemRepository.findByCartId(cart.getId());

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;


        // ---------------------------------------------------------
        // Validate cart products and calculate total
        // ---------------------------------------------------------

        for (CartItemEntity cartItem : cartItems) {

            ProductEntity product = cartItem.getProduct();

            if (product.getStatus() == null ||
                    !product.getStatus().name().equals("ACTIVE")) {

                throw new RuntimeException(
                        "Product is not available: "
                                + product.getName()
                );
            }

            if (product.getQuantity() == null ||
                    product.getQuantity()
                            .compareTo(cartItem.getQuantity()) < 0) {

                throw new RuntimeException(
                        "Insufficient stock for product: "
                                + product.getName()
                );
            }

            BigDecimal itemTotal =
                    product.getPrice()
                            .multiply(cartItem.getQuantity());

            totalAmount = totalAmount.add(itemTotal);
        }


        totalAmount = totalAmount.setScale(
                2,
                RoundingMode.HALF_UP
        );


        // =========================================================
        // 1. CREATE INTERNAL KRISHIAI ORDER
        // =========================================================

        OrderEntity order = OrderEntity.builder()
                .consumer(consumer)
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentMethod(PaymentMethod.ONLINE)
                .totalAmount(totalAmount)
                .deliveryAddress(request.getDeliveryAddress())
                .notes(request.getNotes())
                .build();

        order = orderRepository.save(order);


        // =========================================================
        // 2. CREATE ORDER ITEMS
        // =========================================================

        for (CartItemEntity cartItem : cartItems) {

            ProductEntity product = cartItem.getProduct();

            // Always use current database price
            BigDecimal price = product.getPrice();

            BigDecimal subtotal =
                    price.multiply(cartItem.getQuantity())
                            .setScale(
                                    2,
                                    RoundingMode.HALF_UP
                            );


            /*
             * IMPORTANT:
             * Initial farmer order-item status is CONFIRMED.
             *
             * PaymentService previously did not set this field,
             * but OrderItemEntity.status is nullable = false.
             */
            OrderItemEntity orderItem =
                    OrderItemEntity.builder()
                            .order(order)
                            .product(product)
                            .quantity(cartItem.getQuantity())
                            .price(price)
                            .subtotal(subtotal)
                            .status(OrderItemStatus.CONFIRMED)
                            .build();

            orderItemRepository.save(orderItem);
        }


        // =========================================================
        // 3. CONVERT INR TO PAISE
        // =========================================================

        long amountInPaise =
                totalAmount
                        .multiply(BigDecimal.valueOf(100))
                        .longValueExact();


        try {

            // =====================================================
            // 4. CREATE RAZORPAY REQUEST
            // =====================================================

            JSONObject razorpayRequest = new JSONObject();

            razorpayRequest.put(
                    "amount",
                    amountInPaise
            );

            razorpayRequest.put(
                    "currency",
                    "INR"
            );

            razorpayRequest.put(
                    "receipt",
                    "KRISHI_ORDER_" + order.getId()
            );


            JSONObject notes = new JSONObject();

            notes.put(
                    "krishi_order_id",
                    order.getId()
            );

            notes.put(
                    "consumer_id",
                    consumer.getId()
            );

            razorpayRequest.put(
                    "notes",
                    notes
            );


            // =====================================================
            // 5. CREATE RAZORPAY ORDER
            // =====================================================

            Order razorpayOrder =
                    razorpayClient.orders.create(
                            razorpayRequest
                    );

            String razorpayOrderId =
                    razorpayOrder.get("id");


            // =====================================================
            // 6. STORE PAYMENT INFORMATION
            // =====================================================

            PaymentEntity payment =
                    PaymentEntity.builder()
                            .order(order)
                            .amount(totalAmount)
                            .currency("INR")
                            .razorpayOrderId(razorpayOrderId)
                            .status(PaymentStatus.PENDING)
                            .build();

            payment = paymentRepository.save(payment);


            return PaymentOrderResponseDTO.builder()
                    .orderId(order.getId())
                    .paymentId(payment.getId())
                    .razorpayKeyId(razorpayKeyId)
                    .razorpayOrderId(razorpayOrderId)
                    .amount(totalAmount)
                    .currency("INR")
                    .build();


        } catch (Exception exception) {

            throw new RuntimeException(
                    "Unable to create Razorpay order",
                    exception
            );
        }
    }

    // =========================================================
// CREATE CASH ON DELIVERY ORDER
// =========================================================

    @Transactional
    public PaymentVerificationResponseDTO createCodOrder(
            UserEntity consumer,
            CreatePaymentOrderRequestDTO request
    ) {

        CartEntity cart = cartRepository
                .findByConsumerId(consumer.getId())
                .orElseThrow(() ->
                        new RuntimeException("Cart not found")
                );

        List<CartItemEntity> cartItems =
                cartItemRepository.findByCartId(cart.getId());

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;


        // =========================================================
        // 1. VALIDATE CART AND STOCK
        // =========================================================

        for (CartItemEntity cartItem : cartItems) {

            ProductEntity product = cartItem.getProduct();

            if (product.getStatus() == null ||
                    product.getStatus() != ProductStatus.ACTIVE) {

                throw new RuntimeException(
                        "Product is not available: "
                                + product.getName()
                );
            }

            if (product.getQuantity() == null ||
                    product.getQuantity()
                            .compareTo(cartItem.getQuantity()) < 0) {

                throw new RuntimeException(
                        "Insufficient stock for product: "
                                + product.getName()
                );
            }

            BigDecimal itemTotal =
                    product.getPrice()
                            .multiply(cartItem.getQuantity());

            totalAmount = totalAmount.add(itemTotal);
        }

        totalAmount = totalAmount.setScale(
                2,
                RoundingMode.HALF_UP
        );


        // =========================================================
        // 2. CREATE COD ORDER
        // =========================================================

        OrderEntity order = OrderEntity.builder()
                .consumer(consumer)
                .status(OrderStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentMethod(PaymentMethod.COD)
                .totalAmount(totalAmount)
                .deliveryAddress(request.getDeliveryAddress())
                .notes(request.getNotes())
                .build();

        order = orderRepository.save(order);


        // =========================================================
        // 3. CREATE ORDER ITEMS AND DEDUCT STOCK
        // =========================================================

        for (CartItemEntity cartItem : cartItems) {

            ProductEntity product =
                    productRepository
                            .findByIdForUpdate(
                                    cartItem.getProduct().getId()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Product not found"
                                    )
                            );

            // Check stock again after locking the row
            if (product.getStatus() != ProductStatus.ACTIVE) {

                throw new RuntimeException(
                        "Product is no longer available: "
                                + product.getName()
                );
            }

            if (product.getQuantity()
                    .compareTo(cartItem.getQuantity()) < 0) {

                throw new RuntimeException(
                        "Insufficient stock for product: "
                                + product.getName()
                );
            }

            BigDecimal price = product.getPrice();

            BigDecimal subtotal =
                    price.multiply(cartItem.getQuantity())
                            .setScale(
                                    2,
                                    RoundingMode.HALF_UP
                            );


            OrderItemEntity orderItem =
                    OrderItemEntity.builder()
                            .order(order)
                            .product(product)
                            .quantity(cartItem.getQuantity())
                            .price(price)
                            .subtotal(subtotal)
                            .status(OrderItemStatus.CONFIRMED)
                            .build();

            orderItemRepository.save(orderItem);


            // ---------------------------------------------------------
            // Deduct stock
            // ---------------------------------------------------------

            BigDecimal remainingQuantity =
                    product.getQuantity()
                            .subtract(cartItem.getQuantity());

            product.setQuantity(remainingQuantity);


            if (remainingQuantity.compareTo(
                    BigDecimal.ZERO
            ) == 0) {

                product.setStatus(
                        ProductStatus.SOLD_OUT
                );
            }

            productRepository.save(product);
        }


        // =========================================================
        // 4. CLEAR CART
        // =========================================================

        cartRepository.findByConsumerId(
                consumer.getId()
        ).ifPresent(cartEntity ->
                cartItemRepository.deleteByCartId(
                        cartEntity.getId()
                )
        );


        // =========================================================
        // 5. RESPONSE
        // =========================================================

        return PaymentVerificationResponseDTO.builder()
                .orderId(order.getId())
                .paymentId(null)
                .razorpayPaymentId(null)
                .amount(totalAmount)
                .paymentStatus(PaymentStatus.PENDING)
                .orderStatus(OrderStatus.CONFIRMED)
                .message(
                        "COD order placed successfully"
                )
                .build();
    }


    // =========================================================
    // VERIFY PAYMENT
    // =========================================================

    @Transactional
    public PaymentVerificationResponseDTO verifyPayment(
            UserEntity consumer,
            PaymentVerificationRequestDTO request
    ) {

        // =========================================================
        // 1. FIND PAYMENT
        // =========================================================

        PaymentEntity payment =
                paymentRepository
                        .findByRazorpayOrderId(
                                request.getRazorpayOrderId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment order not found"
                                )
                        );

        OrderEntity order = payment.getOrder();


        // =========================================================
        // 2. VERIFY ORDER OWNER
        // =========================================================

        if (!order.getConsumer()
                .getId()
                .equals(consumer.getId())) {

            throw new RuntimeException(
                    "You are not authorized to verify this payment"
            );
        }


        // =========================================================
        // 3. IDEMPOTENCY CHECK
        // =========================================================

        if (payment.getStatus() == PaymentStatus.PAID) {

            return PaymentVerificationResponseDTO.builder()
                    .orderId(order.getId())
                    .paymentId(payment.getId())
                    .razorpayPaymentId(
                            payment.getRazorpayPaymentId()
                    )
                    .amount(payment.getAmount())
                    .paymentStatus(payment.getStatus())
                    .orderStatus(order.getStatus())
                    .message("Payment already verified")
                    .build();
        }


        // =========================================================
        // 4. VERIFY RAZORPAY ORDER ID
        // =========================================================

        if (!payment.getRazorpayOrderId()
                .equals(request.getRazorpayOrderId())) {

            throw new RuntimeException(
                    "Invalid Razorpay order ID"
            );
        }


        // =========================================================
        // 5. VERIFY RAZORPAY SIGNATURE
        // =========================================================

        try {

            JSONObject options = new JSONObject();

            options.put(
                    "razorpay_order_id",
                    payment.getRazorpayOrderId()
            );

            options.put(
                    "razorpay_payment_id",
                    request.getRazorpayPaymentId()
            );

            options.put(
                    "razorpay_signature",
                    request.getRazorpaySignature()
            );


            boolean signatureValid =
                    Utils.verifyPaymentSignature(
                            options,
                            razorpayKeySecret
                    );


            if (!signatureValid) {

                throw new RuntimeException(
                        "Invalid Razorpay payment signature"
                );
            }


        } catch (Exception exception) {

            throw new RuntimeException(
                    "Payment signature verification failed",
                    exception
            );
        }


        // =========================================================
        // 6. STORE RAZORPAY PAYMENT INFORMATION
        // =========================================================

        payment.setRazorpayPaymentId(
                request.getRazorpayPaymentId()
        );

        payment.setRazorpaySignature(
                request.getRazorpaySignature()
        );


        // =========================================================
        // 7. GET ORDER ITEMS
        // =========================================================

        List<OrderItemEntity> orderItems =
                orderItemRepository.findByOrderId(
                        order.getId()
                );

        if (orderItems.isEmpty()) {

            throw new RuntimeException(
                    "Order items not found"
            );
        }


        // =========================================================
        // 8. LOCK PRODUCTS
        // =========================================================

        for (OrderItemEntity orderItem : orderItems) {

            ProductEntity product =
                    productRepository
                            .findByIdForUpdate(
                                    orderItem
                                            .getProduct()
                                            .getId()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Product not found: "
                                                    + orderItem
                                                    .getProduct()
                                                    .getId()
                                    )
                            );


            // =====================================================
            // 9. CHECK PRODUCT AVAILABILITY
            // =====================================================

            if (product.getStatus()
                    != ProductStatus.ACTIVE) {

                throw new RuntimeException(
                        "Product is no longer available: "
                                + product.getName()
                );
            }


            // =====================================================
            // 10. CHECK STOCK AGAIN
            // =====================================================

            if (product.getQuantity()
                    .compareTo(orderItem.getQuantity()) < 0) {

                throw new RuntimeException(
                        "Insufficient stock for product: "
                                + product.getName()
                );
            }
        }


        // =========================================================
        // 11. DEDUCT STOCK
        // =========================================================

        for (OrderItemEntity orderItem : orderItems) {

            ProductEntity product =
                    productRepository
                            .findByIdForUpdate(
                                    orderItem
                                            .getProduct()
                                            .getId()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Product not found"
                                    )
                            );


            BigDecimal remainingQuantity =
                    product.getQuantity()
                            .subtract(
                                    orderItem.getQuantity()
                            );

            product.setQuantity(
                    remainingQuantity
            );


            // =====================================================
            // 12. MARK PRODUCT SOLD OUT
            // =====================================================

            if (remainingQuantity.compareTo(
                    BigDecimal.ZERO
            ) == 0) {

                product.setStatus(
                        ProductStatus.SOLD_OUT
                );
            }


            productRepository.save(product);
        }


        // =========================================================
        // 13. PAYMENT SUCCESS
        // =========================================================

        payment.setStatus(
                PaymentStatus.PAID
        );


        // =========================================================
        // 14. CONFIRM ORDER
        // =========================================================

        order.setPaymentStatus(
                PaymentStatus.PAID
        );

        order.setStatus(
                OrderStatus.CONFIRMED
        );


        paymentRepository.save(payment);
        orderRepository.save(order);


        // =========================================================
        // 15. CLEAR CART
        // =========================================================

        cartRepository.findByConsumerId(
                consumer.getId()
        ).ifPresent(cart ->
                cartItemRepository.deleteByCartId(
                        cart.getId()
                )
        );


        // =========================================================
        // RESPONSE
        // =========================================================

        return PaymentVerificationResponseDTO.builder()
                .orderId(order.getId())
                .paymentId(payment.getId())
                .razorpayPaymentId(
                        payment.getRazorpayPaymentId()
                )
                .amount(payment.getAmount())
                .paymentStatus(payment.getStatus())
                .orderStatus(order.getStatus())
                .message(
                        "Payment verified and order confirmed"
                )
                .build();
    }
}