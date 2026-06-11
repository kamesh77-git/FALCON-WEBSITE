package com.falcons.logistics.service;

import com.falcons.logistics.dto.request.InvoiceRequest;
import com.falcons.logistics.dto.response.InvoiceResponse;
import com.falcons.logistics.entity.Invoice;
import com.falcons.logistics.entity.Shipment;
import com.falcons.logistics.entity.User;
import com.falcons.logistics.enums.ShipmentStatus;
import com.falcons.logistics.exception.BadRequestException;
import com.falcons.logistics.exception.DuplicateResourceException;
import com.falcons.logistics.exception.ResourceNotFoundException;
import com.falcons.logistics.repository.InvoiceRepository;
import com.falcons.logistics.repository.ShipmentRepository;
import com.falcons.logistics.repository.UserRepository;
import com.falcons.logistics.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public InvoiceResponse generateInvoice(Long shipmentId, InvoiceRequest request) {
        // Validate shipment exists
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment", "id", shipmentId));

        // Validate shipment is DELIVERED
        if (shipment.getStatus() != ShipmentStatus.DELIVERED) {
            throw new BadRequestException(
                    "Invoice can only be generated for DELIVERED shipments. Current status: "
                            + shipment.getStatus());
        }

        // Validate no existing invoice for this shipment
        if (invoiceRepository.existsByShipmentId(shipmentId)) {
            throw new DuplicateResourceException("Invoice", "shipmentId", shipmentId);
        }

        // Validate invoice number is unique
        if (invoiceRepository.existsByInvoiceNumber(request.getInvoiceNumber())) {
            throw new DuplicateResourceException("Invoice", "invoiceNumber", request.getInvoiceNumber());
        }

        // Create invoice
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(request.getInvoiceNumber());
        invoice.setShipment(shipment);
        invoice.setGcNo(shipment.getGcNo());
        invoice.setInvoiceDate(request.getInvoiceDate());
        invoice.setInvoiceAmount(request.getInvoiceAmount());
        invoice.setRemarks(request.getRemarks());
        invoice.setGeneratedBy(getCurrentUser());

        Invoice saved = invoiceRepository.save(invoice);

        // Update shipment status to INVOICED
        shipment.setStatus(ShipmentStatus.INVOICED);
        shipmentRepository.save(shipment);

        return mapToResponse(saved);
    }

    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public InvoiceResponse getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "id", id));
        return mapToResponse(invoice);
    }

    public InvoiceResponse getInvoiceByGcNo(String gcNo) {
        Invoice invoice = invoiceRepository.findByGcNo(gcNo)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", "GC No", gcNo));
        return mapToResponse(invoice);
    }

    // ==================== HELPERS ====================

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userDetails.getId()));
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        InvoiceResponse response = new InvoiceResponse();
        response.setId(invoice.getId());
        response.setInvoiceNumber(invoice.getInvoiceNumber());
        response.setShipmentId(invoice.getShipment().getId());
        response.setGcNo(invoice.getGcNo());
        response.setInvoiceDate(invoice.getInvoiceDate());
        response.setInvoiceAmount(invoice.getInvoiceAmount());
        response.setRemarks(invoice.getRemarks());
        response.setGeneratedByName(
                invoice.getGeneratedBy() != null ? invoice.getGeneratedBy().getName() : null);
        response.setCreatedAt(invoice.getCreatedAt());

        // Shipment summary
        Shipment shipment = invoice.getShipment();
        response.setCustomer(shipment.getCustomer());
        response.setDestination(shipment.getDestination());
        response.setTotalFreight(shipment.getTotalFreight());

        return response;
    }
}
