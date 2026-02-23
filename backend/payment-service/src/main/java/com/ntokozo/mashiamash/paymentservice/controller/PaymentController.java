package com.ntokozo.mashiamash.paymentservice.controller;

import com.ntokozo.mashiamash.paymentservice.dto.PaymentRequest;
import com.ntokozo.mashiamash.paymentservice.dto.PaymentResponse;
import com.ntokozo.mashiamash.paymentservice.dto.RefundRequest;
import com.ntokozo.mashiamash.paymentservice.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponse> processPayment(
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(paymentService.processPayment(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getById(
            @PathVariable("id") Long id) {
        return ResponseEntity.ok(paymentService.getById(id));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getByOrderId(
            @PathVariable("orderId") Long orderId) {
        return ResponseEntity.ok(paymentService.getByOrderId(orderId));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<PaymentResponse>> getByCustomer(
            @PathVariable("customerId") Long customerId) {
        return ResponseEntity.ok(paymentService.getByCustomer(customerId));
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<PaymentResponse> refund(
            @PathVariable("id") Long id,
            @Valid @RequestBody RefundRequest request) {
        return ResponseEntity.ok(paymentService.refund(id, request));
    }
}
