package com.ntokozo.mashiamash.restaurantservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantResponse {
    private Long id;
    private String name;
    private String description;
    private String address;
    private String city;
    private String phone;
    private String email;
    private String imageUrl;
    private String cuisineType;
    private Double rating;
    private boolean active;
    private Long ownerId;
    private LocalDateTime createdAt;
}