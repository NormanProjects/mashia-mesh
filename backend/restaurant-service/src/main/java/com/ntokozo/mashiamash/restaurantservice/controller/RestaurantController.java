package com.ntokozo.mashiamash.restaurantservice.controller;

import com.ntokozo.mashiamash.restaurantservice.dto.RestaurantRequest;
import com.ntokozo.mashiamash.restaurantservice.dto.RestaurantResponse;
import com.ntokozo.mashiamash.restaurantservice.service.RestaurantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @PostMapping
    public ResponseEntity<RestaurantResponse> create(
            @Valid @RequestBody RestaurantRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(restaurantService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<RestaurantResponse>> getAll() {
        return ResponseEntity.ok(restaurantService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantResponse> getById (@PathVariable("id") Long id) {
        return ResponseEntity.ok(restaurantService.getById(id));
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<RestaurantResponse>> getByCity(
            @PathVariable("city") String city) {
        return ResponseEntity.ok(restaurantService.getByCity(city));
    }

    @GetMapping("/cuisine/{cuisine}")
    public ResponseEntity<List<RestaurantResponse>> getByCuisine(
            @PathVariable("cuisine") String cuisine) {
        return ResponseEntity.ok(restaurantService.getByCuisine(cuisine));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantResponse> update(
            @PathVariable("id") Long id,
            @Valid @RequestBody RestaurantRequest request) {
        return ResponseEntity.ok(restaurantService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable("id") Long id) {
        restaurantService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}