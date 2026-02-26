package com.ntokozo.mashiamash.deliveryservice.dto;

import com.ntokozo.mashiamash.deliveryservice.model.DeliveryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryResponse {
    private Long id;
    private Long orderId;
    private Long driverId;
    private String driverName;
    private String driverPhone;
    private String deliveryAddress;
    private DeliveryStatus status;
    private String currentLocation;
    private LocalDateTime pickedUpAt;
    private LocalDateTime deliveredAt;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}