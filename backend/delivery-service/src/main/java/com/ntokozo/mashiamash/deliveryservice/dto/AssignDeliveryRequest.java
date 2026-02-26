package com.ntokozo.mashiamash.deliveryservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignDeliveryRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Driver ID is required")
    private Long driverId;

    @NotBlank(message = "Driver name is required")
    private String driverName;

    private String driverPhone;

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    private String notes;
}