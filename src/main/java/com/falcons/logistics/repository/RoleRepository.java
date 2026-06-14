package com.falcons.logistics.repository;

import com.falcons.logistics.entity.Role;
import com.falcons.logistics.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleName name);

    Boolean existsByName(RoleName name);
}
