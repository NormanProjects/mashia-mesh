package com.ntokozo.mashiamash.notificationservice.dto;

import com.ntokozo.mashiamash.notificationservice.model.NotificationType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SendNotificationRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @Email(message = "Valid email is required")
    @NotBlank(message = "Recipient email is required")
    private String recipientEmail;

    private String recipientName;

    @NotNull(message = "Notification type is required")
    private NotificationType type;

    private Long orderId;

    private String restaurantName;

    private Double orderTotal;

    private String deliveryAddress;

    private String driverName;
}