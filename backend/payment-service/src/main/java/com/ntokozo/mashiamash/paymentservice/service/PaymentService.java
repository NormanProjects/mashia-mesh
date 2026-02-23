package com.ntokozo.mashiamash.paymentservice.service;

import com.ntokozo.mashiamash.paymentservice.dto.PaymentRequest;
import com.ntokozo.mashiamash.paymentservice.dto.PaymentResponse;
import com.ntokozo.mashiamash.paymentservice.dto.RefundRequest;
import com.ntokozo.mashiamash.paymentservice.exception.PaymentException;
import com.ntokozo.mashiamash.paymentservice.exception.ResourceNotFoundException;
import com.ntokozo.mashiamash.paymentservice.model.Payment;
import com.ntokozo.mashiamash.paymentservice.model.PaymentStatus;
import com.ntokozo.mashiamash.paymentservice.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {

        // Check if payment already exists for this order
        if (paymentRepository.findByOrderId(request.getOrderId()).isPresent()) {
            throw new PaymentException(
                    "Payment already exists for order: " + request.getOrderId());
        }

        Payment payment = Payment.builder()
                .orderId(request.getOrderId())
                .customerId(request.getCustomerId())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .status(PaymentStatus.PROCESSING)
                .build();

        payment = paymentRepository.save(payment);

        // Simulate payment processing
        payment = simulatePaymentProcessing(payment);

        return toResponse(paymentRepository.save(payment));
    }

    public PaymentResponse getByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found for order: " + orderId));
        return toResponse(payment);
    }

    public PaymentResponse getById(Long id) {
        return toResponse(findById(id));
    }

    public List<PaymentResponse> getByCustomer(Long customerId) {
        return paymentRepository.findByCustomerId(customerId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentResponse refund(Long id, RefundRequest request) {
        Payment payment = findById(id);

        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new PaymentException(
                    "Can only refund completed payments");
        }

        BigDecimal alreadyRefunded = payment.getRefundedAmount() != null
                ? payment.getRefundedAmount()
                : BigDecimal.ZERO;

        BigDecimal remaining = payment.getAmount().subtract(alreadyRefunded);

        if (request.getAmount().compareTo(remaining) > 0) {
            throw new PaymentException(
                    "Refund amount exceeds remaining refundable amount: R" + remaining);
        }

        BigDecimal newRefundedTotal = alreadyRefunded.add(request.getAmount());
        payment.setRefundedAmount(newRefundedTotal);

        if (newRefundedTotal.compareTo(payment.getAmount()) == 0) {
            payment.setStatus(PaymentStatus.REFUNDED);
        } else {
            payment.setStatus(PaymentStatus.PARTIALLY_REFUNDED);
        }

        log.info("Refund of R{} processed for payment {}",
                request.getAmount(), id);

        return toResponse(paymentRepository.save(payment));
    }

    private Payment simulatePaymentProcessing(Payment payment) {
        // In production this would call a real payment gateway
        // like PayFast, Peach Payments, or Stripe
        // For now we simulate 90% success rate
        boolean success = Math.random() > 0.1;

        if (success) {
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setTransactionReference("TXN-" +
                    UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            log.info("Payment {} completed successfully. Ref: {}",
                    payment.getId(), payment.getTransactionReference());
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Insufficient funds");
            log.warn("Payment {} failed for order {}",
                    payment.getId(), payment.getOrderId());
        }

        return payment;
    }

    private Payment findById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found with id: " + id));
    }

    private PaymentResponse toResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .orderId(p.getOrderId())
                .customerId(p.getCustomerId())
                .amount(p.getAmount())
                .paymentMethod(p.getPaymentMethod())
                .status(p.getStatus())
                .transactionReference(p.getTransactionReference())
                .failureReason(p.getFailureReason())
                .refundedAmount(p.getRefundedAmount())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}