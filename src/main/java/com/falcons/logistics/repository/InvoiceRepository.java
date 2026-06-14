package com.falcons.logistics.repository;

import com.falcons.logistics.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByGcNo(String gcNo);

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Optional<Invoice> findByShipmentId(Long shipmentId);

    Boolean existsByInvoiceNumber(String invoiceNumber);

    Boolean existsByShipmentId(Long shipmentId);
}
