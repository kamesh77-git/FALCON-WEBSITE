package com.falcons.logistics.repository;

import com.falcons.logistics.entity.Shipment;
import com.falcons.logistics.enums.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    List<Shipment> findByStatus(ShipmentStatus status);

    List<Shipment> findByStatusIn(List<ShipmentStatus> statuses);

    Optional<Shipment> findByGcNo(String gcNo);

    Boolean existsByGcNo(String gcNo);

    List<Shipment> findByDeliveryDateIsNull();

    List<Shipment> findByDeliveryDateIsNotNull();
}
