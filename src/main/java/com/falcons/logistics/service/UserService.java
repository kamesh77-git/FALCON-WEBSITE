package com.falcons.logistics.service;

import com.falcons.logistics.dto.response.UserResponse;
import com.falcons.logistics.entity.Role;
import com.falcons.logistics.entity.User;
import com.falcons.logistics.enums.RoleName;
import com.falcons.logistics.exception.BadRequestException;
import com.falcons.logistics.exception.ResourceNotFoundException;
import com.falcons.logistics.repository.RoleRepository;
import com.falcons.logistics.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        User user = findUserById(id);
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse createUser(String name, String email, String rawPassword, String roleName) {
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already in use: " + email);
        }

        RoleName roleEnum;
        try {
            roleEnum = RoleName.valueOf(roleName);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + roleName
                    + ". Valid roles: ROLE_ADMIN, ROLE_SUPER_ADMIN, ROLE_CEO_ADMIN");
        }

        Role role = roleRepository.findByName(roleEnum)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName));

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setIsActive(true);

        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);

        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    @Transactional
    public UserResponse updateUser(Long id, String name, String email) {
        User user = findUserById(id);

        if (name != null && !name.isBlank()) {
            user.setName(name);
        }
        if (email != null && !email.isBlank()) {
            // Check email uniqueness if changing
            if (!user.getEmail().equals(email) && userRepository.existsByEmail(email)) {
                throw new BadRequestException("Email already in use: " + email);
            }
            user.setEmail(email);
        }

        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    @Transactional
    public UserResponse updateUserRole(Long id, String roleName) {
        User user = findUserById(id);

        RoleName roleEnum;
        try {
            roleEnum = RoleName.valueOf(roleName);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + roleName);
        }

        Role role = roleRepository.findByName(roleEnum)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName));

        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);

        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = findUserById(id);
        user.setIsActive(false);
        userRepository.save(user);
    }

    // ==================== HELPERS ====================

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setIsActive(user.getIsActive());
        response.setRoles(user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList()));
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}
