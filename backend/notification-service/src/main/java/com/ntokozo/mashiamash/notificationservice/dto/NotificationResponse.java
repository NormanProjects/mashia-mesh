package com.ntokozo.mashiamash.notificationservice.dto;

import com.ntokozo.mashiamash.notificationservice.model.NotificationStatus;
import com.ntokozo.mashiamash.notificationservice.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private Long userId;
    private String recipientEmail;
    private String recipientName;
    private NotificationType type;
    private String subject;
    private String message;
    private NotificationStatus status;
    private Long orderId;
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;
}