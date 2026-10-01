package com.venuevista.venuevista.service;

import com.venuevista.venuevista.entity.User;
import com.venuevista.venuevista.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User register(User user) {
        return userRepository.save(user);
    }

    public User login(String email, String password) {

        List<User> users =
                userRepository.findByEmailAndPassword(email, password);

        if (users.isEmpty()) {
            return null;
        }

        return users.get(0);
    }

    public User getUserById(Long userId) {

        Optional<User> user =
                userRepository.findById(userId);

        if (user.isPresent()) {
            return user.get();
        }

        return null;
    }
}