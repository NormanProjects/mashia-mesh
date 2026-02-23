package com.ntokozo.mashiamash.restaurantservice.service;

import com.ntokozo.mashiamash.restaurantservice.dto.MenuItemRequest;
import com.ntokozo.mashiamash.restaurantservice.dto.MenuItemResponse;
import com.ntokozo.mashiamash.restaurantservice.exception.ResourceNotFoundException;
import com.ntokozo.mashiamash.restaurantservice.model.MenuItem;
import com.ntokozo.mashiamash.restaurantservice.model.Restaurant;
import com.ntokozo.mashiamash.restaurantservice.repository.MenuItemRepository;
import com.ntokozo.mashiamash.restaurantservice.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;

    public MenuItemResponse addItem(Long restaurantId, MenuItemRequest request) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Restaurant not found: " + restaurantId));

        MenuItem item = MenuItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .category(request.getCategory())
                .available(request.isAvailable())
                .restaurant(restaurant)
                .build();

        return toResponse(menuItemRepository.save(item));
    }

    public List<MenuItemResponse> getMenu(Long restaurantId) {
        return menuItemRepository
                .findByRestaurantIdAndAvailableTrue(restaurantId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public MenuItemResponse updateAvailability(Long itemId, boolean available) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Menu item not found: " + itemId));
        item.setAvailable(available);
        return toResponse(menuItemRepository.save(item));
    }

    public void deleteItem(Long itemId) {
        menuItemRepository.deleteById(itemId);
    }

    private MenuItemResponse toResponse(MenuItem item) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .imageUrl(item.getImageUrl())
                .category(item.getCategory())
                .available(item.isAvailable())
                .restaurantId(item.getRestaurant().getId())
                .build();
    }
}