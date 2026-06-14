package com.falcons.logistics.entity;

import com.falcons.logistics.enums.ShipmentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ===== Columns A–M (Admin fields) =====

    @Column(length = 20)
    private String month;                          // A

    @Column(length = 100)
    private String customer;                       // B

    @Column(name = "booking_place", length = 100)
    private String bookingPlace;                   // C

    @Column(name = "vendor_name", length = 100)
    private String vendorName;                     // D

    @Column(name = "shipment_date")
    private LocalDate shipmentDate;                // E

    @Column(name = "truck_no", length = 50)
    private String truckNo;                        // F

    @Column(name = "gc_no", unique = true, length = 50)
    private String gcNo;                           // G

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;                // H

    @Column(length = 100)
    private String destination;                    // I

    @Column(name = "truck_type", length = 20)
    private String truckType;                      // J

    @Column(precision = 12, scale = 2)
    private BigDecimal freight;                    // K

    @Column(name = "additional_charges", precision = 12, scale = 2)
    private BigDecimal additionalCharges;          // L

    @Column(name = "total_freight", precision = 12, scale = 2)
    private BigDecimal totalFreight;               // M

    // ===== Columns N–W (Finance fields) =====

    @Column(name = "loading_charge", precision = 12, scale = 2)
    private BigDecimal loadingCharge;              // N

    @Column(name = "vendor_freight", precision = 12, scale = 2)
    private BigDecimal vendorFreight;              // O

    @Column(name = "halt_charge", precision = 12, scale = 2)
    private BigDecimal haltCharge;                 // P

    @Column(name = "unloading_charge", precision = 12, scale = 2)
    private BigDecimal unloadingCharge;            // Q

    @Column(precision = 12, scale = 2)
    private BigDecimal diesel;                     // R

    @Column(name = "rtgs_amount", precision = 12, scale = 2)
    private BigDecimal rtgsAmount;                 // S

    @Column(name = "rtgs_date")
    private LocalDate rtgsDate;                    // T

    @Column(precision = 12, scale = 2)
    private BigDecimal mamul;                      // U

    @Column(precision = 12, scale = 2)
    private BigDecimal balance;                    // V

    @Column(precision = 12, scale = 2)
    private BigDecimal income;                     // W

    // ===== System fields =====

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private ShipmentStatus status = ShipmentStatus.NOT_DELIVERED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
