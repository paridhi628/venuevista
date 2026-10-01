package com.venuevista.venuevista.dto;

public class SeatMapResponse {

    private Long eventSeatId;
    private Long eventId;
    private Long seatId;
    private String seatNumber;
    private String rowName;
    private String sectionName;
    private String seatType;
    private double price;
    private String status;

    public SeatMapResponse() {
    }

    public SeatMapResponse(
            Long eventSeatId,
            Long eventId,
            Long seatId,
            String seatNumber,
            String rowName,
            String sectionName,
            String seatType,
            double price,
            String status
    ) {
        this.eventSeatId = eventSeatId;
        this.eventId = eventId;
        this.seatId = seatId;
        this.seatNumber = seatNumber;
        this.rowName = rowName;
        this.sectionName = sectionName;
        this.seatType = seatType;
        this.price = price;
        this.status = status;
    }

    public Long getEventSeatId() {
        return eventSeatId;
    }

    public Long getEventId() {
        return eventId;
    }

    public Long getSeatId() {
        return seatId;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public String getRowName() {
        return rowName;
    }

    public String getSectionName() {
        return sectionName;
    }

    public String getSeatType() {
        return seatType;
    }

    public double getPrice() {
        return price;
    }

    public String getStatus() {
        return status;
    }
}