package com.ntokozo.mashiamash.deliveryservice.controller;

import com.ntokozo.mashiamash.deliveryservice.dto.AssignDeliveryRequest;
import com.ntokozo.mashiamash.deliveryservice.dto.DeliveryResponse;
import com.ntokozo.mashiamash.deliveryservice.model.DeliveryStatus;
import com.ntokozo.mashiamash.deliveryservice.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @PostMapping
    public ResponseEntity<DeliveryResponse> assignDelivery(
            @Valid @RequestBody AssignDeliveryRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(deliveryService.assignDelivery(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryResponse> getById(
            @PathVariable("id") Long id) {
        return ResponseEntity.ok(deliveryService.getById(id));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<DeliveryResponse> getByOrderId(
            @PathVariable("orderId") Long orderId) {
        return ResponseEntity.ok(deliveryService.getByOrderId(orderId));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<DeliveryResponse>> getByDriver(
            @PathVariable("driverId") Long driverId) {
        return ResponseEntity.ok(deliveryService.getByDriver(driverId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<DeliveryResponse>> getActive() {
        return ResponseEntity.ok(deliveryService.getActive());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DeliveryResponse> updateStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") DeliveryStatus status,
            @RequestParam(value = "location", required = false) String location) {
        return ResponseEntity.ok(
                deliveryService.updateStatus(id, status, location));
    }
}
