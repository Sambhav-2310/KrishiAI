package com.KrishiAI.Backend.repository;

import com.KrishiAI.Backend.entity.Role;
import com.KrishiAI.Backend.entity.UserEntity;
import com.KrishiAI.Backend.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    //select * from tbl_users where email = ?
    Optional<UserEntity> findByEmail(String email);

    //select * from tbl_users where email = ?
    boolean existsByEmail(String email);

    //select * from tbl_users where phone = ?
    Optional<UserEntity> findByPhone(String phone);

    //select * from tbl_users where phone = ?
    boolean existsByPhone(String phone);

    //select * from tbl_users where role = ?
    long countByRole(Role role);

    //select * from tbl_users where status = ?
    long countByStatus(UserStatus status);
}
