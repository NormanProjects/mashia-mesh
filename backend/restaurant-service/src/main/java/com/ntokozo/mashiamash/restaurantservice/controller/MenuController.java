package com.ntokozo.mashiamash.restaurantservice.controller;

import com.ntokozo.mashiamash.restaurantservice.dto.MenuItemRequest;
import com.ntokozo.mashiamash.restaurantservice.dto.MenuItemResponse;
import com.ntokozo.mashiamash.restaurantservice.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @PostMapping
    public ResponseEntity<MenuItemResponse> addItem(
            @PathVariable("restaurantId") Long restaurantId,
            @Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(menuService.addItem(restaurantId, request));
    }

    @GetMapping
    public ResponseEntity<List<MenuItemResponse>> getMenu(
            @PathVariable("restaurantId") Long restaurantId) {
        return ResponseEntity.ok(menuService.getMenu(restaurantId));
    }

    @PatchMapping("/items/{itemId}/availability")
    public ResponseEntity<MenuItemResponse> updateAvailability(
            @PathVariable("restaurantId") Long restaurantId,
            @PathVariable("itemId") Long itemId,
            @RequestParam("available") boolean available) {
        return ResponseEntity.ok(menuService.updateAvailability(itemId, available));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable("restaurantId") Long restaurantId,
            @PathVariable("itemId") Long itemId) {
        menuService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }
}