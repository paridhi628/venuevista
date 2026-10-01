package com.venuevista.venuevista.service;

import com.venuevista.venuevista.entity.Booking;
import com.venuevista.venuevista.entity.Seat;
import com.venuevista.venuevista.repository.BookingRepository;
import com.venuevista.venuevista.repository.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SeatRepository seatRepository;

    public Booking createBooking(Booking booking) {

        // DEBUG
        System.out.println("========== BOOKING RECEIVED ==========");
        System.out.println("User ID  : " + booking.getUserId());
        System.out.println("Event ID : " + booking.getEventId());
        System.out.println("Seat ID  : " + booking.getSeatId());
        System.out.println("Status   : " + booking.getStatus());
        System.out.println("======================================");

        // Check Seat ID
        if (booking.getSeatId() == null) {
            System.out.println("ERROR: Seat ID is NULL");
            return null;
        }

        Seat seat = seatRepository
                .findById(booking.getSeatId())
                .orElse(null);

        if (seat == null) {
            System.out.println("ERROR: Seat not found");
            return null;
        }

        if ("BOOKED".equals(seat.getStatus())) {
            System.out.println("ERROR: Seat already booked");
            return null;
        }

        // Book seat
        seat.setStatus("BOOKED");
        seatRepository.save(seat);

        // Set booking status
        booking.setStatus("CONFIRMED");

        // Save booking
        Booking savedBooking = bookingRepository.save(booking);

        // DEBUG
        System.out.println("========== BOOKING SAVED ==========");
        System.out.println("Booking ID : " + savedBooking.getBookingId());
        System.out.println("User ID    : " + savedBooking.getUserId());
        System.out.println("Event ID   : " + savedBooking.getEventId());
        System.out.println("Seat ID    : " + savedBooking.getSeatId());
        System.out.println("Status     : " + savedBooking.getStatus());
        System.out.println("===================================");

        return savedBooking;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getMyBookings(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getEventBookings(Long eventId) {
        return bookingRepository.findByEventId(eventId);
    }
}