package com.venuevista.venuevista.controller;

import com.venuevista.venuevista.entity.Booking;
import com.venuevista.venuevista.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public Booking createBooking(@RequestBody Booking booking) {
        return bookingService.createBooking(booking);
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }
    @GetMapping("/user/{userId}")
    public List<Booking> getMyBookings(@PathVariable Long userId) {
        return bookingService.getMyBookings(userId);
    }
    @GetMapping("/event/{eventId}")
    public List<Booking> getEventBookings(@PathVariable Long eventId) {
        return bookingService.getEventBookings(eventId);
    }
}