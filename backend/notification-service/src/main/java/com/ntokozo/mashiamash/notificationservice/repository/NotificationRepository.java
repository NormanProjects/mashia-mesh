package com.ntokozo.mashiamash.notificationservice.repository;

import com.ntokozo.mashiamash.notificationservice.model.Notification;
import com.ntokozo.mashiamash.notificationservice.model.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByStatus(NotificationStatus status);
    List<Notification> findByOrderId(Long orderId);
}