package com.venuevista.venuevista.controller;

import com.venuevista.venuevista.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/total-seats")
    public int getTotalSeats() {
        return analyticsService.getTotalSeats();
    }

    @GetMapping("/booked-seats")
    public int getBookedSeats() {
        return analyticsService.getBookedSeats();
    }

    @GetMapping("/available-seats")
    public int getAvailableSeats() {
        return analyticsService.getAvailableSeats();
    }

    @GetMapping("/revenue/{eventId}")
    public double getRevenue(@PathVariable Long eventId) {
        return analyticsService.getRevenue(eventId);
    }
}