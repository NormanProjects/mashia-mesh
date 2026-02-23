package com.ntokozo.mashiamash.orderservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class PlaceOrderRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Restaurant ID is required")
    private Long restaurantId;

    private String restaurantName;

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    private String specialInstructions;

    @Valid
    @NotEmpty(message = "Order must have at least one item")
    private List<OrderItemRequest> items;
}