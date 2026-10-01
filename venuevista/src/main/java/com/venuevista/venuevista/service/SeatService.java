package com.venuevista.venuevista.service;

import com.venuevista.venuevista.entity.Seat;
import com.venuevista.venuevista.repository.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeatService {

    @Autowired
    private SeatRepository seatRepository;

    public Seat addSeat(Seat seat) {
        return seatRepository.save(seat);
    }

    public List<Seat> getAllSeats() {
        return seatRepository.findAll();
    }
    public Seat updateSeatStatus(Long id, String status) {

        Seat seat = seatRepository.findById(id).orElse(null);

        if (seat != null) {
            seat.setStatus(status);
            return seatRepository.save(seat);
        }

        return null;
    }
    public void deleteSeat(Long id) {
        seatRepository.deleteById(id);
    }
}