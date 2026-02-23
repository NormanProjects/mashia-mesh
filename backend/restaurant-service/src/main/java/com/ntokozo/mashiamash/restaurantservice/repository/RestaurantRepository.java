package com.ntokozo.mashiamash.restaurantservice.repository;

import com.ntokozo.mashiamash.restaurantservice.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByActiveTrue();
    List<Restaurant> findByCityAndActiveTrue(String city);
    List<Restaurant> findByCuisineTypeAndActiveTrue(String cuisineType);
    List<Restaurant> findByOwnerId(Long ownerId);
}