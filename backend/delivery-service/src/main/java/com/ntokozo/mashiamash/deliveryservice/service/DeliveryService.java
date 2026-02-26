package com.ntokozo.mashiamash.deliveryservice.service;

import com.ntokozo.mashiamash.deliveryservice.dto.AssignDeliveryRequest;
import com.ntokozo.mashiamash.deliveryservice.dto.DeliveryResponse;
import com.ntokozo.mashiamash.deliveryservice.exception.ResourceNotFoundException;
import com.ntokozo.mashiamash.deliveryservice.model.Delivery;
import com.ntokozo.mashiamash.deliveryservice.model.DeliveryStatus;
import com.ntokozo.mashiamash.deliveryservice.repository.DeliveryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;

    @Transactional
    public DeliveryResponse assignDelivery(AssignDeliveryRequest request) {
        // Check if delivery already assigned for this order
        if (deliveryRepository.findByOrderId(request.getOrderId()).isPresent()) {
            throw new RuntimeException(
                    "Delivery already assigned for order: " + request.getOrderId());
        }

        Delivery delivery = Delivery.builder()
                .orderId(request.getOrderId())
                .driverId(request.getDriverId())
                .driverName(request.getDriverName())
                .driverPhone(request.getDriverPhone())
                .deliveryAddress(request.getDeliveryAddress())
                .notes(request.getNotes())
                .build();

        log.info("Delivery assigned to driver {} for order {}",
                request.getDriverName(), request.getOrderId());

        return toResponse(deliveryRepository.save(delivery));
    }

    public DeliveryResponse getByOrderId(Long orderId) {
        return toResponse(deliveryRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Delivery not found for order: " + orderId)));
    }

    public DeliveryResponse getById(Long id) {
        return toResponse(findById(id));
    }

    public List<DeliveryResponse> getByDriver(Long driverId) {
        return deliveryRepository
                .findByDriverIdOrderByCreatedAtDesc(driverId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<DeliveryResponse> getActive() {
        return deliveryRepository.findByStatus(DeliveryStatus.ASSIGNED)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeliveryResponse updateStatus(
            Long id, DeliveryStatus newStatus, String currentLocation) {

        Delivery delivery = findById(id);
        delivery.setStatus(newStatus);

        if (currentLocation != null) {
            delivery.setCurrentLocation(currentLocation);
        }

        if (newStatus == DeliveryStatus.PICKED_UP) {
            delivery.setPickedUpAt(LocalDateTime.now());
        }

        if (newStatus == DeliveryStatus.DELIVERED) {
            delivery.setDeliveredAt(LocalDateTime.now());
        }

        log.info("Delivery {} status updated to {}", id, newStatus);

        return toResponse(deliveryRepository.save(delivery));
    }

    private Delivery findById(Long id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Delivery not found with id: " + id));
    }

    private DeliveryResponse toResponse(Delivery d) {
        return DeliveryResponse.builder()
                .id(d.getId())
                .orderId(d.getOrderId())
                .driverId(d.getDriverId())
                .driverName(d.getDriverName())
                .driverPhone(d.getDriverPhone())
                .deliveryAddress(d.getDeliveryAddress())
                .status(d.getStatus())
                .currentLocation(d.getCurrentLocation())
                .pickedUpAt(d.getPickedUpAt())
                .deliveredAt(d.getDeliveredAt())
                .notes(d.getNotes())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();
    }
}