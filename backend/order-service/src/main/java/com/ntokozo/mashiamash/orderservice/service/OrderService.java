package com.ntokozo.mashiamash.orderservice.service;

import com.ntokozo.mashiamash.orderservice.dto.*;
import com.ntokozo.mashiamash.orderservice.exception.InvalidOrderStateException;
import com.ntokozo.mashiamash.orderservice.exception.ResourceNotFoundException;
import com.ntokozo.mashiamash.orderservice.model.Order;
import com.ntokozo.mashiamash.orderservice.model.OrderItem;
import com.ntokozo.mashiamash.orderservice.model.OrderStatus;
import com.ntokozo.mashiamash.orderservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    @Transactional
    public OrderResponse placeOrder(PlaceOrderRequest request) {

        // Build order items
        List<OrderItem> orderItems = request.getItems().stream()
                .map(itemReq -> OrderItem.builder()
                        .menuItemId(itemReq.getMenuItemId())
                        .itemName(itemReq.getItemName())
                        .unitPrice(itemReq.getUnitPrice())
                        .quantity(itemReq.getQuantity())
                        .subtotal(itemReq.getUnitPrice()
                                .multiply(BigDecimal.valueOf(itemReq.getQuantity())))
                        .build())
                .collect(Collectors.toList());

        // Calculate totals
        BigDecimal subtotal = orderItems.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal deliveryFee = new BigDecimal("25.00");
        BigDecimal total = subtotal.add(deliveryFee);

        // Build and save order
        Order order = Order.builder()
                .customerId(request.getCustomerId())
                .restaurantId(request.getRestaurantId())
                .restaurantName(request.getRestaurantName())
                .deliveryAddress(request.getDeliveryAddress())
                .specialInstructions(request.getSpecialInstructions())
                .subtotal(subtotal)
                .deliveryFee(deliveryFee)
                .totalAmount(total)
                .build();

        Order savedOrder = orderRepository.save(order);

        // Link items to order
        orderItems.forEach(item -> item.setOrder(savedOrder));
        savedOrder.setItems(orderItems);
        orderRepository.save(savedOrder);

        return toResponse(savedOrder);
    }

    public OrderResponse getById(Long id) {
        return toResponse(findById(id));
    }

    public List<OrderResponse> getByCustomer(Long customerId) {
        return orderRepository
                .findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getByRestaurant(Long restaurantId) {
        return orderRepository
                .findByRestaurantIdOrderByCreatedAtDesc(restaurantId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus newStatus) {
        Order order = findById(id);
        validateStatusTransition(order.getStatus(), newStatus);
        order.setStatus(newStatus);
        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse cancelOrder(Long id) {
        Order order = findById(id);
        if (order.getStatus() == OrderStatus.PREPARING ||
                order.getStatus() == OrderStatus.READY ||
                order.getStatus() == OrderStatus.OUT_FOR_DELIVERY ||
                order.getStatus() == OrderStatus.DELIVERED) {
            throw new InvalidOrderStateException(
                    "Cannot cancel order in status: " + order.getStatus());
        }
        order.setStatus(OrderStatus.CANCELLED);
        return toResponse(orderRepository.save(order));
    }

    private void validateStatusTransition(
            OrderStatus current, OrderStatus next) {
        boolean valid = switch (current) {
            case PENDING -> next == OrderStatus.CONFIRMED
                    || next == OrderStatus.CANCELLED;
            case CONFIRMED -> next == OrderStatus.PREPARING
                    || next == OrderStatus.CANCELLED;
            case PREPARING -> next == OrderStatus.READY;
            case READY -> next == OrderStatus.OUT_FOR_DELIVERY;
            case OUT_FOR_DELIVERY -> next == OrderStatus.DELIVERED;
            default -> false;
        };

        if (!valid) {
            throw new InvalidOrderStateException(
                    "Invalid status transition: " + current + " → " + next);
        }
    }

    private Order findById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with id: " + id));
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems() == null
                ? List.of()
                : order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .menuItemId(item.getMenuItemId())
                        .itemName(item.getItemName())
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomerId())
                .restaurantId(order.getRestaurantId())
                .restaurantName(order.getRestaurantName())
                .deliveryAddress(order.getDeliveryAddress())
                .specialInstructions(order.getSpecialInstructions())
                .status(order.getStatus())
                .subtotal(order.getSubtotal())
                .deliveryFee(order.getDeliveryFee())
                .totalAmount(order.getTotalAmount())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}