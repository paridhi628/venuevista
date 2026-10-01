package com.venuevista.venuevista.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "event_seats")
public class EventSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long eventSeatId;

    private Long eventId;

    private Long seatId;

    private String status;

    private double price;

    public EventSeat() {
    }

    public Long getEventSeatId() {
        return eventSeatId;
    }

    public void setEventSeatId(Long eventSeatId) {
        this.eventSeatId = eventSeatId;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getSeatId() {
        return seatId;
    }

    public void setSeatId(Long seatId) {
        this.seatId = seatId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
}