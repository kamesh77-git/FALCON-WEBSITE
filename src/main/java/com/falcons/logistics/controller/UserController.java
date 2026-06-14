package com.falcons.logistics.controller;

import com.falcons.logistics.dto.request.CreateUserRequest;
import com.falcons.logistics.dto.request.UpdateUserRequest;
import com.falcons.logistics.dto.request.UpdateUserRoleRequest;
import com.falcons.logistics.dto.response.ApiResponse;
import com.falcons.logistics.dto.response.UserResponse;
import com.falcons.logistics.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasAuthority('ROLE_CEO_ADMIN')")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * Get all users.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> list = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /**
     * Get user by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Create a new user.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        UserResponse response = userService.createUser(
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                request.getRole()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully", response));
    }

    /**
     * Update user name and/or email.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateUser(id, request.getName(), request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", response));
    }

    /**
     * Update user role.
     */
    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        UserResponse response = userService.updateUserRole(id, request.getRole());
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", response));
    }

    /**
     * Soft-delete (deactivate) a user.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deactivated successfully", null));
    }
}
