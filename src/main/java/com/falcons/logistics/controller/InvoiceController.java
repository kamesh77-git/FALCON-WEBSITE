package com.falcons.logistics.controller;

import com.falcons.logistics.dto.request.InvoiceRequest;
import com.falcons.logistics.dto.response.ApiResponse;
import com.falcons.logistics.dto.response.InvoiceResponse;
import com.falcons.logistics.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    /**
     * Generate an invoice for a delivered shipment.
     */
    @PostMapping("/shipment/{shipmentId}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> generateInvoice(
            @PathVariable Long shipmentId,
            @Valid @RequestBody InvoiceRequest request) {
        InvoiceResponse response = invoiceService.generateInvoice(shipmentId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Invoice generated successfully", response));
    }

    /**
     * Get all invoices.
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getAllInvoices() {
        List<InvoiceResponse> list = invoiceService.getAllInvoices();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /**
     * Get invoice by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceById(@PathVariable Long id) {
        InvoiceResponse response = invoiceService.getInvoiceById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get invoice by GC No.
     */
    @GetMapping("/gc/{gcNo}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceByGcNo(@PathVariable String gcNo) {
        InvoiceResponse response = invoiceService.getInvoiceByGcNo(gcNo);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
