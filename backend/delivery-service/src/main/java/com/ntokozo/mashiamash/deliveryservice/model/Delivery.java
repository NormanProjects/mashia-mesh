package com.ntokozo.mashiamash.deliveryservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "deliveries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long orderId;

    @Column(nullable = false)
    private Long driverId;

    private String driverName;

    private String driverPhone;

    @Column(nullable = false)
    private String deliveryAddress;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DeliveryStatus status = DeliveryStatus.ASSIGNED;

    private String currentLocation;

    private LocalDateTime pickedUpAt;

    private LocalDateTime deliveredAt;

    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}