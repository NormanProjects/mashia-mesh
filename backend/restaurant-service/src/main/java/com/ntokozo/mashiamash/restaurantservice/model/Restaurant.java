package com.ntokozo.mashiamash.restaurantservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.awt.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "restaurants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    private String phone;
    private String email;
    private String imageUrl;

    @Column(nullable = false)
    private String cuisineType;

    @Builder.Default
    private Double rating = 0.0;

    @Builder.Default
    private boolean active = true;

    // ID of the owner from user-service
    @Column(nullable = false)
    private Long ownerId;

    @OneToMany(mappedBy = "restaurant",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY)
    private List<MenuItem> menuItems;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}