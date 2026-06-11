package com.falcons.logistics.config;

import com.falcons.logistics.entity.Role;
import com.falcons.logistics.entity.User;
import com.falcons.logistics.enums.RoleName;
import com.falcons.logistics.repository.RoleRepository;
import com.falcons.logistics.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // CEO_ADMIN credentials from application.properties
    @Value("${app.default-users.ceo.name}")
    private String ceoName;

    @Value("${app.default-users.ceo.email}")
    private String ceoEmail;

    @Value("${app.default-users.ceo.password}")
    private String ceoPassword;

    // SUPER_ADMIN credentials from application.properties
    @Value("${app.default-users.super-admin.name}")
    private String superAdminName;

    @Value("${app.default-users.super-admin.email}")
    private String superAdminEmail;

    @Value("${app.default-users.super-admin.password}")
    private String superAdminPassword;

    // ADMIN credentials from application.properties
    @Value("${app.default-users.admin.name}")
    private String adminName;

    @Value("${app.default-users.admin.email}")
    private String adminEmail;

    @Value("${app.default-users.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        logger.info("=== Initializing default roles and users ===");

        // Seed Roles
        Role adminRole = seedRole(RoleName.ROLE_ADMIN);
        Role superAdminRole = seedRole(RoleName.ROLE_SUPER_ADMIN);
        Role ceoAdminRole = seedRole(RoleName.ROLE_CEO_ADMIN);

        // Seed Users
        seedUser(ceoName, ceoEmail, ceoPassword, ceoAdminRole);
        seedUser(superAdminName, superAdminEmail, superAdminPassword, superAdminRole);
        seedUser(adminName, adminEmail, adminPassword, adminRole);

        logger.info("=== Data initialization completed ===");
        logger.info("Default Users:");
        logger.info("  CEO_ADMIN  -> Email: {} | Password: {}", ceoEmail, ceoPassword);
        logger.info("  SUPER_ADMIN -> Email: {} | Password: {}", superAdminEmail, superAdminPassword);
        logger.info("  ADMIN      -> Email: {} | Password: {}", adminEmail, adminPassword);
    }

    private Role seedRole(RoleName roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role role = new Role(roleName);
                    roleRepository.save(role);
                    logger.info("Created role: {}", roleName);
                    return role;
                });
    }

    private void seedUser(String name, String email, String rawPassword, Role role) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setIsActive(true);

            Set<Role> roles = new HashSet<>();
            roles.add(role);
            user.setRoles(roles);

            userRepository.save(user);
            logger.info("Created user: {} with role: {}", email, role.getName());
        } else {
            logger.info("User already exists: {}", email);
        }
    }
}
