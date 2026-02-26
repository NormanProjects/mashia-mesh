package com.ntokozo.mashiamash.notificationservice.service;

import com.ntokozo.mashiamash.notificationservice.dto.NotificationResponse;
import com.ntokozo.mashiamash.notificationservice.dto.SendNotificationRequest;
import com.ntokozo.mashiamash.notificationservice.exception.ResourceNotFoundException;
import com.ntokozo.mashiamash.notificationservice.model.Notification;
import com.ntokozo.mashiamash.notificationservice.model.NotificationStatus;
import com.ntokozo.mashiamash.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    public NotificationResponse send(SendNotificationRequest request) {
        String subject = buildSubject(request);
        String body = buildEmailBody(request);

        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .recipientEmail(request.getRecipientEmail())
                .recipientName(request.getRecipientName())
                .type(request.getType())
                .subject(subject)
                .message(body)
                .orderId(request.getOrderId())
                .build();

        boolean sent = emailService.sendEmail(
                request.getRecipientEmail(), subject, body);

        notification.setStatus(sent
                ? NotificationStatus.SENT
                : NotificationStatus.FAILED);

        if (sent) {
            notification.setSentAt(LocalDateTime.now());
        }

        return toResponse(notificationRepository.save(notification));
    }

    public List<NotificationResponse> getByUser(Long userId) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<NotificationResponse> getByOrder(Long orderId) {
        return notificationRepository
                .findByOrderId(orderId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private String buildSubject(SendNotificationRequest req) {
        return switch (req.getType()) {
            case ORDER_PLACED -> "🍽️ Order Placed — MashiaMesh";
            case ORDER_CONFIRMED -> "✅ Order Confirmed — MashiaMesh";
            case ORDER_PREPARING -> "👨‍🍳 Your Order is Being Prepared";
            case ORDER_READY -> "📦 Your Order is Ready!";
            case ORDER_OUT_FOR_DELIVERY -> "🛵 Your Order is On the Way!";
            case ORDER_DELIVERED -> "🎉 Order Delivered — Enjoy!";
            case ORDER_CANCELLED -> "❌ Order Cancelled — MashiaMesh";
            case PAYMENT_SUCCESS -> "💳 Payment Successful — MashiaMesh";
            case PAYMENT_FAILED -> "⚠️ Payment Failed — MashiaMesh";
            case DELIVERY_ASSIGNED -> "🛵 Driver Assigned to Your Order";
            case WELCOME -> "👋 Welcome to MashiaMesh!";
        };
    }

    private String buildEmailBody(SendNotificationRequest req) {
        String name = req.getRecipientName() != null
                ? req.getRecipientName() : "Customer";

        String orderInfo = req.getOrderId() != null
                ? "<p><strong>Order ID:</strong> #" + req.getOrderId() + "</p>" : "";

        String restaurantInfo = req.getRestaurantName() != null
                ? "<p><strong>Restaurant:</strong> " + req.getRestaurantName() + "</p>" : "";

        String totalInfo = req.getOrderTotal() != null
                ? "<p><strong>Total:</strong> R" + String.format("%.2f", req.getOrderTotal()) + "</p>" : "";

        String addressInfo = req.getDeliveryAddress() != null
                ? "<p><strong>Delivery Address:</strong> " + req.getDeliveryAddress() + "</p>" : "";

        String driverInfo = req.getDriverName() != null
                ? "<p><strong>Driver:</strong> " + req.getDriverName() + "</p>" : "";

        String statusMessage = switch (req.getType()) {
            case ORDER_PLACED ->
                    "Your order has been placed successfully! We're waiting for the restaurant to confirm.";
            case ORDER_CONFIRMED ->
                    "Great news! The restaurant has confirmed your order and will start preparing it soon.";
            case ORDER_PREPARING ->
                    "Your food is being prepared with love! Sit tight, it won't be long.";
            case ORDER_READY ->
                    "Your order is ready and waiting for a driver to pick it up!";
            case ORDER_OUT_FOR_DELIVERY ->
                    "Your order is on its way! Your driver is heading to you now.";
            case ORDER_DELIVERED ->
                    "Your order has been delivered! We hope you enjoy your meal. Bon appétit! 🍽️";
            case ORDER_CANCELLED ->
                    "Unfortunately your order has been cancelled. Please contact support if you have any questions.";
            case PAYMENT_SUCCESS ->
                    "Your payment was processed successfully. Thank you!";
            case PAYMENT_FAILED ->
                    "Your payment could not be processed. Please try again or use a different payment method.";
            case DELIVERY_ASSIGNED ->
                    "A driver has been assigned to your order and is on their way to the restaurant!";
            case WELCOME ->
                    "Welcome to MashiaMesh! We're excited to have you on board. Start exploring restaurants near you!";
        };

        return """
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #1a1a1a, #2d1a1a); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">MashiaMesh</h1>
                        <p style="color: #aaa; margin: 8px 0 0;">Online Food Delivery</p>
                    </div>

                    <div style="background: #fff; border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px;">
                        <p style="font-size: 16px;">Hi <strong>%s</strong>,</p>
                        <p style="font-size: 16px; color: #333;">%s</p>

                        <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
                            %s%s%s%s%s
                        </div>
                    </div>

                    <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 24px;">
                        © 2026 MashiaMesh. All rights reserved.
                    </p>
                </body>
                </html>
                """.formatted(name, statusMessage, orderInfo,
                restaurantInfo, totalInfo, addressInfo, driverInfo);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .userId(n.getUserId())
                .recipientEmail(n.getRecipientEmail())
                .recipientName(n.getRecipientName())
                .type(n.getType())
                .subject(n.getSubject())
                .message(n.getMessage())
                .status(n.getStatus())
                .orderId(n.getOrderId())
                .createdAt(n.getCreatedAt())
                .sentAt(n.getSentAt())
                .build();
    }
}