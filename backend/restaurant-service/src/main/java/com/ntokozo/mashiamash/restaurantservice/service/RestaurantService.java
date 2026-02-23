package com.ntokozo.mashiamash.restaurantservice.service;

import com.ntokozo.mashiamash.restaurantservice.dto.RestaurantRequest;
import com.ntokozo.mashiamash.restaurantservice.dto.RestaurantResponse;
import com.ntokozo.mashiamash.restaurantservice.exception.ResourceNotFoundException;
import com.ntokozo.mashiamash.restaurantservice.model.Restaurant;
import com.ntokozo.mashiamash.restaurantservice.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    public RestaurantResponse create(RestaurantRequest request) {
        Restaurant restaurant = Restaurant.builder()
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .phone(request.getPhone())
                .email(request.getEmail())
                .imageUrl(request.getImageUrl())
                .cuisineType(request.getCuisineType())
                .ownerId(request.getOwnerId())
                .build();

        return toResponse(restaurantRepository.save(restaurant));
    }

    public List<RestaurantResponse> getAll() {
        return restaurantRepository.findByActiveTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public RestaurantResponse getById(Long id) {
        return toResponse(findById(id));
    }

    public List<RestaurantResponse> getByCity(String city) {
        return restaurantRepository.findByCityAndActiveTrue(city)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<RestaurantResponse> getByCuisine(String cuisine) {
        return restaurantRepository.findByCuisineTypeAndActiveTrue(cuisine)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public RestaurantResponse update(Long id, RestaurantRequest request) {
        Restaurant restaurant = findById(id);
        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setAddress(request.getAddress());
        restaurant.setCity(request.getCity());
        restaurant.setPhone(request.getPhone());
        restaurant.setEmail(request.getEmail());
        restaurant.setCuisineType(request.getCuisineType());
        return toResponse(restaurantRepository.save(restaurant));
    }

    public void deactivate(Long id) {
        Restaurant restaurant = findById(id);
        restaurant.setActive(false);
        restaurantRepository.save(restaurant);
    }

    private Restaurant findById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Restaurant not found with id: " + id));
    }

    private RestaurantResponse toResponse(Restaurant r) {
        return RestaurantResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .description(r.getDescription())
                .address(r.getAddress())
                .city(r.getCity())
                .phone(r.getPhone())
                .email(r.getEmail())
                .imageUrl(r.getImageUrl())
                .cuisineType(r.getCuisineType())
                .rating(r.getRating())
                .active(r.isActive())
                .ownerId(r.getOwnerId())
                .createdAt(r.getCreatedAt())
                .build();
    }
}