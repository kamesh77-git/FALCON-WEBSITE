package com.falcons.logistics.controller;

import com.falcons.logistics.dto.request.DeliveryDateUpdateRequest;
import com.falcons.logistics.dto.request.ShipmentAdminRequest;
import com.falcons.logistics.dto.request.ShipmentFinanceRequest;
import com.falcons.logistics.dto.request.ShipmentFullRequest;
import com.falcons.logistics.dto.response.*;
import com.falcons.logistics.service.ShipmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    @Autowired
    private ShipmentService shipmentService;

    // ==================== CREATE ====================

    /**
     * Admin creates a shipment with columns A–M only.
     */
    @PostMapping("/admin")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<ShipmentAdminResponse>> createByAdmin(
            @Valid @RequestBody ShipmentAdminRequest request) {
        ShipmentAdminResponse response = shipmentService.createByAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Shipment created successfully", response));
    }

    /**
     * Super Admin / CEO Admin creates a shipment with all columns A–W.
     */
    @PostMapping("/full")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<ShipmentFullResponse>> createFull(
            @Valid @RequestBody ShipmentFullRequest request) {
        ShipmentFullResponse response = shipmentService.createFull(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Shipment created successfully", response));
    }

    // ==================== READ — ALL ====================

    /**
     * Admin view — returns columns A–M for all shipments.
     */
    @GetMapping("/admin")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<List<ShipmentAdminResponse>>> getAllForAdmin() {
        List<ShipmentAdminResponse> list = shipmentService.getAllForAdmin();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /**
     * Finance view — returns finance columns for all shipments.
     */
    @GetMapping("/finance")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<List<ShipmentFinanceResponse>>> getAllForFinance() {
        List<ShipmentFinanceResponse> list = shipmentService.getAllForFinance();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /**
     * Full view — returns all columns for all shipments.
     */
    @GetMapping("/full")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<List<ShipmentFullResponse>>> getAllFull() {
        List<ShipmentFullResponse> list = shipmentService.getAllFull();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    // ==================== READ — BY ID ====================

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<ShipmentAdminResponse>> getByIdForAdmin(@PathVariable Long id) {
        ShipmentAdminResponse response = shipmentService.getByIdForAdmin(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/finance/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<ShipmentFinanceResponse>> getByIdForFinance(@PathVariable Long id) {
        ShipmentFinanceResponse response = shipmentService.getByIdForFinance(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/full/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<ShipmentFullResponse>> getByIdFull(@PathVariable Long id) {
        ShipmentFullResponse response = shipmentService.getByIdFull(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ==================== READ — NOT DELIVERED ====================

    @GetMapping("/not-delivered/admin")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<List<ShipmentAdminResponse>>> getNotDeliveredForAdmin() {
        List<ShipmentAdminResponse> list = shipmentService.getNotDeliveredForAdmin();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/not-delivered/full")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<List<ShipmentFullResponse>>> getNotDeliveredFull() {
        List<ShipmentFullResponse> list = shipmentService.getNotDeliveredFull();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/not-delivered/finance")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<List<ShipmentFinanceResponse>>> getNotDeliveredForFinance() {
        List<ShipmentFinanceResponse> list = shipmentService.getNotDeliveredForFinance();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    // ==================== READ — DELIVERED ====================

    @GetMapping("/delivered/admin")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<List<ShipmentAdminResponse>>> getDeliveredForAdmin() {
        List<ShipmentAdminResponse> list = shipmentService.getDeliveredForAdmin();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/delivered/full")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<List<ShipmentFullResponse>>> getDeliveredFull() {
        List<ShipmentFullResponse> list = shipmentService.getDeliveredFull();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/delivered/finance")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<List<ShipmentFinanceResponse>>> getDeliveredForFinance() {
        List<ShipmentFinanceResponse> list = shipmentService.getDeliveredForFinance();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    // ==================== UPDATE ====================

    /**
     * Admin updates delivery date — marks shipment as DELIVERED.
     */
    @PatchMapping("/{id}/delivery-date")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<ShipmentAdminResponse>> updateDeliveryDate(
            @PathVariable Long id,
            @Valid @RequestBody DeliveryDateUpdateRequest request) {
        ShipmentAdminResponse response = shipmentService.updateDeliveryDate(id, request);
        return ResponseEntity.ok(ApiResponse.success("Delivery date updated successfully", response));
    }

    /**
     * Finance update — updates finance columns N–W.
     */
    @PutMapping("/{id}/finance")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<ShipmentFinanceResponse>> updateFinance(
            @PathVariable Long id,
            @Valid @RequestBody ShipmentFinanceRequest request) {
        ShipmentFinanceResponse response = shipmentService.updateFinance(id, request);
        return ResponseEntity.ok(ApiResponse.success("Finance details updated successfully", response));
    }

    /**
     * Full update — updates all columns A–W.
     */
    @PutMapping("/{id}/full")
    @PreAuthorize("hasAnyAuthority('ROLE_SUPER_ADMIN', 'ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<ShipmentFullResponse>> updateFull(
            @PathVariable Long id,
            @Valid @RequestBody ShipmentFullRequest request) {
        ShipmentFullResponse response = shipmentService.updateFull(id, request);
        return ResponseEntity.ok(ApiResponse.success("Shipment updated successfully", response));
    }

    // ==================== DELETE ====================

    /**
     * Delete a shipment — CEO_ADMIN only (enforced by SecurityConfig URL rule).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_CEO_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        shipmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Shipment deleted successfully", null));
    }
}
