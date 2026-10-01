package com.venuevista.venuevista.service;

import com.venuevista.venuevista.entity.Booking;
import com.venuevista.venuevista.entity.Event;
import com.venuevista.venuevista.entity.Seat;
import com.venuevista.venuevista.repository.BookingRepository;
import com.venuevista.venuevista.repository.EventRepository;
import com.venuevista.venuevista.repository.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsService {

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EventRepository eventRepository;

    public int getTotalSeats() {
        return seatRepository.findAll().size();
    }

    public int getBookedSeats() {
        List<Seat> seats = seatRepository.findAll();

        int count = 0;

        for (Seat seat : seats) {
            if ("BOOKED".equals(seat.getStatus())) {
                count++;
            }
        }

        return count;
    }

    public int getAvailableSeats() {
        List<Seat> seats = seatRepository.findAll();

        int count = 0;

        for (Seat seat : seats) {
            if ("AVAILABLE".equals(seat.getStatus())) {
                count++;
            }
        }

        return count;
    }

    public double getRevenue(Long eventId) {

        Event event = eventRepository.findById(eventId).orElse(null);

        if (event == null) {
            return 0;
        }

        List<Booking> bookings = bookingRepository.findByEventId(eventId);

        return bookings.size() * event.getTicketPrice();
    }
}