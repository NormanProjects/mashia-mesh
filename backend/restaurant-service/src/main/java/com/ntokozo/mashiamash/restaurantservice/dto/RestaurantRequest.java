package com.ntokozo.mashiamash.restaurantservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RestaurantRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    private String phone;
    private String email;
    private String imageUrl;

    @NotBlank(message = "Cuisine type is required")
    private String cuisineType;

    @NotNull(message = "Owner ID is required")
    private Long ownerId;
}