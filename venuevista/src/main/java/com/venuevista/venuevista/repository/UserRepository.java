package com.venuevista.venuevista.repository;

import com.venuevista.venuevista.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findByEmailAndPassword(String email, String password);
}