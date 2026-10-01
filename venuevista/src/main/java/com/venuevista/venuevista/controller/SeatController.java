package com.venuevista.venuevista.controller;

import com.venuevista.venuevista.entity.Seat;
import com.venuevista.venuevista.service.SeatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@CrossOrigin
public class SeatController {

    @Autowired
    private SeatService seatService;

    @PostMapping
    public Seat addSeat(@RequestBody Seat seat) {
        return seatService.addSeat(seat);
    }

    @GetMapping
    public List<Seat> getAllSeats() {
        return seatService.getAllSeats();
    }

    @PutMapping("/{id}")
    public Seat updateSeatStatus(@PathVariable Long id, @RequestParam String status) {
        return seatService.updateSeatStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public String deleteSeat(@PathVariable Long id) {
        seatService.deleteSeat(id);
        return "Seat deleted successfully";
    }
}