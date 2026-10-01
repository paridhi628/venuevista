import React, { useEffect, useState } from "react";

import {
  LayoutDashboard,
  CalendarDays,
  Armchair,
  Ticket,
  BarChart3,
  Building2,
  User,
  LogOut,
  Plus,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";

import "./App.css";

function App() {

  /* =========================
     AUTH STATES
  ========================= */

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("userId")
  );

  const [showLogin, setShowLogin] = useState(true);

  const [userRole, setUserRole] = useState(
    localStorage.getItem("userRole") || ""
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  /* =========================
     USER PROFILE
  ========================= */

  const [userProfile, setUserProfile] = useState(null);

  /* =========================
     NAVIGATION
  ========================= */

  const [activeSection, setActiveSection] = useState("dashboard");

  /* =========================
     EVENTS
  ========================= */

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [eventSeats, setEventSeats] = useState({});
  const [selectedEventSeats, setSelectedEventSeats] = useState(null);
  const [bookings, setBookings] = useState([]);

  /*
     Stores user information for admin bookings.
  */

  const [bookingUsers, setBookingUsers] = useState({});

  /*
     Selected event whose booking details
     will be shown inside popup.
  */

  const [selectedBookingEvent, setSelectedBookingEvent] =
    useState(null);

  /* =========================
     ANALYTICS
  ========================= */

  const [totalSeats, setTotalSeats] = useState(0);
  const [bookedSeats, setBookedSeats] = useState(0);
  const [availableSeats, setAvailableSeats] = useState(0);

  const [eventRevenues, setEventRevenues] = useState([]);

  /* =========================
     ADD EVENT
  ========================= */

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventTicketPrice, setEventTicketPrice] = useState("");

  /* =========================
     ADD SEAT
  ========================= */

  const [showAddSeat, setShowAddSeat] = useState(false);
  const [seatNumber, setSeatNumber] = useState("");

  /* =========================
     LOGIN
  ========================= */

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("LOGIN INPUT:", email, password);

    try {

      const response = await fetch(
        "http://localhost:8081/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const responseText = await response.text();

      console.log("Login response:", responseText);

      if (response.ok) {

        if (!responseText) {
          alert("Login failed: Empty response from server");
          return;
        }

        const data = JSON.parse(responseText);

        console.log("Logged in user:", data);

        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userName", data.name);
        localStorage.setItem("userRole", data.role);

        setUserRole(data.role);
        setIsLoggedIn(true);

        setEmail("");
        setPassword("");

        setActiveSection("dashboard");

      } else {

        alert("Invalid email or password");

      }

    } catch (error) {

      console.error("Login error:", error);

      alert("Unable to connect to backend");

    }
  };

  /* =========================
     REGISTER
  ========================= */

  const handleRegister = async (e) => {
    e.preventDefault();

    try {

      const response = await fetch(
        "http://localhost:8081/api/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name,
            email: registerEmail,
            password: registerPassword,
            role: "CUSTOMER",
          }),
        }
      );

      if (response.ok) {

        alert("Registration successful! Please login.");

        setName("");
        setRegisterEmail("");
        setRegisterPassword("");
        setShowLogin(true);

      } else {

        const errorText = await response.text();

        console.log(
          "Register failed:",
          errorText
        );

        alert("Registration failed");
      }

    } catch (error) {

      console.error(
        "Register error:",
        error
      );

      alert("Unable to connect to backend");
    }
  };

  /* =========================
     FETCH EVENTS
  ========================= */

  const fetchEvents = async () => {

    try {

      const response = await fetch(
        "http://localhost:8081/api/events"
      );

      if (response.ok) {

        const data = await response.json();
        const uniqueEvents = [
          ...new Map(
            data.map((event) => [
              `${event.eventName}-${event.date}-${event.time}-${event.venue}`,
              event,
            ])
          ).values(),
        ];

        setEvents(uniqueEvents);

        console.log("UNIQUE EVENTS:", uniqueEvents);

        uniqueEvents.forEach((event) => {
          fetchSeatsForEvent(event.eventId);
        });
        console.log("Events:", data);

        /* =========================
           SEAT ANALYTICS
        ========================= */

        const totalResponse = await fetch(
          "http://localhost:8081/api/analytics/total-seats"
        );

        const bookedResponse = await fetch(
          "http://localhost:8081/api/analytics/booked-seats"
        );

        const availableResponse = await fetch(
          "http://localhost:8081/api/analytics/available-seats"
        );

        if (
          totalResponse.ok &&
          bookedResponse.ok &&
          availableResponse.ok
        ) {

          const total = await totalResponse.json();
          const booked = await bookedResponse.json();
          const available = await availableResponse.json();

          setTotalSeats(total);
          setBookedSeats(booked);
          setAvailableSeats(available);
        }

        /* =========================
           EVENT REVENUE
        ========================= */

        const revenues = [];

        for (const event of data) {

          const revenueResponse = await fetch(
            `http://localhost:8081/api/analytics/revenue/${event.eventId}`
          );

          if (revenueResponse.ok) {

            const revenue =
              await revenueResponse.json();

            revenues.push({
              eventId: event.eventId,
              eventName: event.eventName,
              revenue: revenue,
            });
          }
        }

        setEventRevenues(revenues);
      }

    } catch (error) {

      console.error(
        "Error fetching events:",
        error
      );

    }
  };

  /* =========================
     FETCH GLOBAL SEATS
     ADMIN
  ========================= */

  const fetchSeats = async () => {

    try {

      const response = await fetch(
        "http://localhost:8081/api/seats"
      );

      if (response.ok) {

        const data = await response.json();

        setSeats(data);

      } else {

        console.log(
          "Failed to fetch seats"
        );

      }

    } catch (error) {

      console.error(
        "Error fetching seats:",
        error
      );

    }
  };
const fetchSeatsForEvent = async (eventId) => {
  try {
    const response = await fetch(
      `http://localhost:8081/api/event-seats/event/${eventId}`
    );

    if (response.ok) {
      const data = await response.json();


      setEventSeats((prev) => ({
        ...prev,
        [eventId]: data,
      }));
    }
  } catch (error) {
    console.error("Error fetching event seats:", error);
  }
};

  /* =========================
     FETCH EVENT SEATS
     CUSTOMER
  ========================= */

  const fetchEventSeats = async (eventId) => {

    try {

      const response = await fetch(
        `http://localhost:8081/api/event-seats/event/${eventId}`
      );

      if (response.ok) {

        const data = await response.json();

        console.log(
          "Event Seats:",
          data
        );

       setEventSeats((prev) => ({
         ...prev,
         [eventId]: data,
       }));

      } else {

        console.log(
          "Failed to fetch event seats"
        );

      }

    } catch (error) {

      console.error(
        "Error fetching event seats:",
        error
      );

    }
  };

  /* =========================
     FETCH MY BOOKINGS
  ========================= */

  const fetchBookings = async () => {

    try {

      const userId =
        localStorage.getItem("userId");

      if (!userId) {
        return;
      }

      const response = await fetch(
        `http://localhost:8081/api/bookings/user/${userId}`
      );

      if (response.ok) {

        const data = await response.json();

        console.log(
          "My Bookings:",
          data
        );

        setBookings(data);

      } else {

        console.log(
          "Failed to fetch bookings"
        );

      }

    } catch (error) {

      console.error(
        "Error fetching bookings:",
        error
      );

    }
  };

  /* =========================
     GET BOOKING USER ID
  ========================= */

  const getBookingUserId = (booking) => {

    return (
      booking?.userId ??
      booking?.userID ??
      booking?.user_id ??
      booking?.user?.userId ??
      booking?.user?.id ??
      booking?.userDetails?.userId ??
      booking?.userDetails?.id ??
      null
    );

  };

  /* =========================
     GET BOOKING USER NAME
  ========================= */

  const getBookingUserName = (booking) => {

    const userId =
      getBookingUserId(booking);

    /*
       First try username directly from booking response.
    */

    const directName =
      booking?.userName ??
      booking?.username ??
      booking?.user?.name ??
      booking?.user?.userName ??
      booking?.userDetails?.name ??
      booking?.userDetails?.userName ??
      booking?.name ??
      null;

    if (directName) {
      return directName;
    }

    /*
       Then use fetched admin user information.
    */

    if (
      userId != null &&
      bookingUsers[String(userId)]
    ) {

      return bookingUsers[String(userId)].name;

    }

    return "Unknown User";
  };

  /* =========================
     FETCH ALL BOOKINGS
     ADMIN
  ========================= */

  const fetchAllBookings = async () => {

    try {

      const response = await fetch(
        "http://localhost:8081/api/bookings"
      );

      if (response.ok) {

        const data = await response.json();

        console.log(
          "ALL BOOKINGS:",
          data
        );

        setBookings(data);

        /* =========================================
           FETCH USER DETAILS FOR ALL UNIQUE USERS
        ========================================= */

        const uniqueUserIds = [
          ...new Set(
            data
              .map((booking) =>
                getBookingUserId(booking)
              )
              .filter(
                (id) => id != null
              )
          ),
        ];

        const userDetails = {};

        await Promise.all(
          uniqueUserIds.map(
            async (userId) => {

              try {

                const userResponse =
                  await fetch(
                    `http://localhost:8081/api/users/${userId}`
                  );

                if (userResponse.ok) {

                  const userData =
                    await userResponse.json();

                  userDetails[
                    String(userId)
                  ] = {
                    name:
                      userData.name ||
                      "Unknown User",

                    userId:
                      userData.userId ??
                      userId,

                    email:
                      userData.email ||
                      "",
                  };

                }

              } catch (error) {

                console.error(
                  `Error fetching user ${userId}:`,
                  error
                );

              }

            }
          )
        );

        setBookingUsers(
          userDetails
        );

      } else {

        console.log(
          "Failed to fetch all bookings"
        );

      }

    } catch (error) {

      console.error(
        "Error fetching all bookings:",
        error
      );

    }
  };

  /* =========================
     GET BOOKING EVENT ID
  ========================= */

  const getBookingEventId = (booking) => {

    return (
      booking?.eventId ??
      booking?.eventID ??
      booking?.event_id ??
      booking?.event?.eventId ??
      booking?.event?.id ??
      booking?.eventDetails?.eventId ??
      booking?.eventDetails?.id ??
      null
    );

  };

  /* =========================
     GET BOOKING EVENT
  ========================= */

  const getBookingEvent = (booking) => {

    const nestedEvent =
      booking?.event ||
      booking?.eventDetails ||
      booking?.eventData ||
      null;

    if (
      nestedEvent &&
      (
        nestedEvent.eventId != null ||
        nestedEvent.id != null
      )
    ) {
      return nestedEvent;
    }

    const bookingEventId =
      getBookingEventId(booking);

    if (bookingEventId == null) {
      return null;
    }

    return (
      events.find(
        (event) =>
          Number(event.eventId) ===
          Number(bookingEventId)
      ) || null
    );

  };

  /* =========================
     GROUP BOOKINGS BY EVENT
  ========================= */

  const groupBookingsByEvent = () => {

    const grouped = {};

    bookings.forEach((booking) => {

      const eventId =
        getBookingEventId(
          booking
        );

      const eventKey =
        eventId != null
          ? String(eventId)
          : `unknown-${booking.bookingId}`;

      if (!grouped[eventKey]) {

        grouped[eventKey] = [];

      }

      grouped[eventKey].push(
        booking
      );

    });

    return grouped;

  };

  /* =========================
     GROUP BOOKINGS BY USER
  ========================= */

  const groupBookingsByUser = (
    eventBookings
  ) => {

    const grouped = {};

    eventBookings.forEach(
      (booking) => {

        const userId =
          getBookingUserId(
            booking
          );

        const userKey =
          userId != null
            ? String(userId)
            : `unknown-${booking.bookingId}`;

        if (!grouped[userKey]) {

          grouped[userKey] = [];

        }

        grouped[userKey].push(
          booking
        );

      }
    );

    return grouped;

  };

  /* =========================
     OPEN BOOKING EVENT POPUP
  ========================= */

  const openBookingEvent = (
    eventData
  ) => {

    setSelectedBookingEvent(
      eventData
    );

  };

  /* =========================
     CLOSE BOOKING EVENT POPUP
  ========================= */

  const closeBookingEvent = () => {

    setSelectedBookingEvent(null);

  };

  /* =========================
     FETCH PROFILE
  ========================= */

  const fetchUserProfile = async () => {

    try {

      const userId =
        localStorage.getItem("userId");

      if (!userId) {
        return;
      }

      const response = await fetch(
        `http://localhost:8081/api/users/${userId}`
      );

      if (response.ok) {

        const data = await response.json();

        setUserProfile(data);

      } else {

        console.log(
          "Failed to fetch profile"
        );

      }

    } catch (error) {

      console.error(
        "Error fetching profile:",
        error
      );

    }
  };

  /* =========================
     CREATE EVENT
  ========================= */

  const handleCreateEvent = async (e) => {

    e.preventDefault();

    try {

      const response = await fetch(
        "http://localhost:8081/api/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventName: eventName,
            description: eventDescription,
            date: eventDate,
            time: eventTime,
            venue: eventVenue,
            ticketPrice: Number(eventTicketPrice),
          }),
        }
      );

      if (response.ok) {

        alert(
          "Event created successfully!"
        );

        setEventName("");
        setEventDescription("");
        setEventDate("");
        setEventTime("");
        setEventVenue("");
        setEventTicketPrice("");

        setShowAddEvent(false);

        fetchEvents();

      } else {

        const errorText =
          await response.text();

        console.log(
          "Create event failed:",
          errorText
        );

        alert(
          "Failed to create event"
        );
      }

    } catch (error) {

      console.error(
        "Create event error:",
        error
      );

      alert(
        "Unable to connect to backend"
      );
    }
  };

  /* =========================
     CREATE SEAT
  ========================= */

  const handleCreateSeat = async (e) => {

    e.preventDefault();

    try {

      const response = await fetch(
        "http://localhost:8081/api/seats",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            seatNumber: seatNumber,
            status: "AVAILABLE",
          }),
        }
      );

      if (response.ok) {

        alert(
          "Seat added successfully!"
        );

        setSeatNumber("");
        setShowAddSeat(false);

        fetchSeats();
        fetchEvents();

      } else {

        const errorText =
          await response.text();

        console.log(
          "Create seat failed:",
          errorText
        );

        alert(
          "Failed to add seat"
        );
      }

    } catch (error) {

      console.error(
        "Create seat error:",
        error
      );

      alert(
        "Unable to connect to backend"
      );
    }
  };

  /* =========================
     BOOK TICKET
  ========================= */

  const handleBooking = async () => {

    if (!selectedEvent) {

      alert(
        "Please select an event"
      );

      return;
    }

    if (!selectedSeat) {

      alert(
        "Please select a seat"
      );

      return;
    }

    const userId =
      localStorage.getItem("userId");

    if (!userId) {

      alert(
        "Please login again"
      );

      return;
    }

    /* =========================
       GET IDs SAFELY
    ========================= */

    const currentUserId =
      Number(userId);

    const currentEventId =
      selectedEvent?.eventId ??
      selectedEvent?.id ??
      null;

    const currentSeatId =
      selectedSeat?.seatId ??
      selectedSeat?.id ??
      selectedSeat?.eventSeatId ??
      null;

    console.log(
      "========== BOOKING DATA =========="
    );

    console.log(
      "User ID:",
      currentUserId
    );

    console.log(
      "Event ID:",
      currentEventId
    );

    console.log(
      "Seat ID:",
      currentSeatId
    );

    console.log(
      "Selected Event:",
      selectedEvent
    );

    console.log(
      "Selected Seat:",
      selectedSeat
    );

    console.log(
      "=================================="
    );

    /* =========================
       VALIDATE USER ID
    ========================= */

    if (
      !currentUserId ||
      Number.isNaN(currentUserId)
    ) {

      alert(
        "User ID is missing. Please login again."
      );

      return;
    }

    /* =========================
       VALIDATE EVENT ID
    ========================= */

    if (
      currentEventId == null ||
      Number.isNaN(
        Number(currentEventId)
      )
    ) {

      alert(
        "Event ID is missing. Please select the event again."
      );

      return;
    }

    /* =========================
       VALIDATE SEAT ID
    ========================= */

    if (
      currentSeatId == null ||
      Number.isNaN(
        Number(currentSeatId)
      )
    ) {

      alert(
        "Seat ID is missing. Please select another seat."
      );

      return;
    }

    try {

      /* =========================
         BOOKING REQUEST
      ========================= */

      const bookingData = {

        userId:
          Number(currentUserId),

        eventId:
          Number(currentEventId),

        seatId:
          Number(currentSeatId),

        bookingDate:
          new Date()
            .toISOString()
            .split("T")[0],

        status:
          "CONFIRMED",

      };

      console.log(
        "Sending Booking:",
        bookingData
      );

      const response = await fetch(
        "http://localhost:8081/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            bookingData
          ),
        }
      );

      const responseText =
        await response.text();

      console.log(
        "Booking API Response:",
        responseText
      );

      /* =========================
         CHECK HTTP RESPONSE
      ========================= */

      if (!response.ok) {

        console.error(
          "Booking failed:",
          responseText
        );

        alert(
          "Booking failed: " +
          responseText
        );

        return;
      }

      /* =========================
         CHECK EMPTY RESPONSE
      ========================= */

      if (!responseText) {

        alert(
          "Booking failed: Empty response from server"
        );

        return;
      }

      const data =
        JSON.parse(responseText);

      console.log(
        "Created Booking:",
        data
      );

      /* =========================
         CHECK SAVED IDs
      ========================= */

      if (
        data.userId == null ||
        data.eventId == null ||
        data.seatId == null
      ) {

        console.error(
          "Backend returned booking with null IDs:",
          data
        );

        alert(
          "Booking was not saved correctly. Backend returned null IDs."
        );

        return;
      }

      /* =========================
         SUCCESS
      ========================= */

      alert(
        "Ticket booked successfully!"
      );

      const bookedEventId =
        Number(currentEventId);

      /* =========================
         CLOSE MODAL
      ========================= */

      closeSeatMap();

      /* =========================
         REFRESH DATA
      ========================= */

      await fetchEventSeats(
        bookedEventId
      );

      await fetchBookings();

      await fetchEvents();

    } catch (error) {

      console.error(
        "Booking error:",
        error
      );

      alert(
        "Unable to connect to backend"
      );
    }
  };

  /* =========================
     UPDATE SEAT
     ADMIN
  ========================= */

 const updateSeatStatus = async (seatId, status) => {
   try {
     const response = await fetch(
       `http://localhost:8081/api/seats/${seatId}?status=${status}`,
       {
         method: "PUT",
       }
     );

     if (response.ok) {

       // React state mein bhi seat ka status immediately update karo
       if (selectedEventSeats?.eventId) {
         const eventId = selectedEventSeats.eventId;

         setEventSeats((prev) => ({
           ...prev,
           [eventId]: (prev[eventId] || []).map((seat) =>
             seat.seatId === seatId
               ? {
                   ...seat,
                   status: status,
                 }
               : seat
           ),
         }));
       }

     } else {
       alert("Failed to update seat");
     }

   } catch (error) {

     console.error(
       "Seat update error:",
       error
     );

     alert("Unable to connect to backend");
   }
 };

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {

    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");

    setIsLoggedIn(false);
    setUserRole("");

    setSelectedEvent(null);
    setSelectedSeat(null);
    setShowSeatMap(false);

    setSelectedBookingEvent(null);

    setBookings([]);
    setBookingUsers({});
    setUserProfile(null);

    setActiveSection("dashboard");
  };

  /* =========================
     CLOSE SEAT MODAL
  ========================= */

  const closeSeatMap = () => {

    setShowSeatMap(false);
    setSelectedSeat(null);
    setSelectedEvent(null);
    setSeats([]);

  };

  /* =========================
     MODAL BEHAVIOUR
  ========================= */

  useEffect(() => {

    if (!showSeatMap && !selectedBookingEvent) {
      return;
    }

    const handleEscape = (e) => {

      if (e.key === "Escape") {

        if (showSeatMap) {
          closeSeatMap();
        }

        if (selectedBookingEvent) {
          closeBookingEvent();
        }

      }

    };

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {

      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow =
        previousOverflow;

    };

  }, [
    showSeatMap,
    selectedBookingEvent,
  ]);

  /* =========================
     LOAD DATA AFTER LOGIN
  ========================= */

  useEffect(() => {

    if (isLoggedIn) {

      fetchEvents();
      fetchUserProfile();

      if (userRole === "ADMIN") {

        fetchSeats();
        fetchAllBookings();

      } else {

        fetchBookings();

      }

    }

  }, [
    isLoggedIn,
    userRole,
  ]);

  /* =========================
     LOAD EVENT SEATS
  ========================= */

  useEffect(() => {

    if (selectedEvent) {

      fetchEventSeats(
        selectedEvent.eventId
      );

      setSelectedSeat(null);

    }

  }, [selectedEvent]);

  /* =========================================================
     LOGIN / REGISTER
  ========================================================= */

  if (!isLoggedIn) {

    return (

      <div className="app">

        <div className="auth-container">

          <div className="brand-section">

            <div className="brand-icon">
              <Ticket size={38} />
            </div>

            <h1>
              VenueVista
            </h1>

            <p>
              EventPro Ticketing &
              Venue Management
            </p>

            <div className="brand-features">

              <span>
                <CalendarDays size={17} />
                Smart Events
              </span>

              <span>
                <Armchair size={17} />
                Easy Seat Booking
              </span>

              <span>
                <BarChart3 size={17} />
                Powerful Analytics
              </span>

            </div>

          </div>

          <div className="form-section">

            <div className="tabs">

              <button
                className={
                  showLogin
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setShowLogin(true)
                }
              >
                Login
              </button>

              <button
                className={
                  !showLogin
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setShowLogin(false)
                }
              >
                Register
              </button>

            </div>

            {showLogin ? (

              <form
                onSubmit={
                  handleLogin
                }
              >

                <h2>
                  Welcome Back
                </h2>

                <p className="subtitle">
                  Login to your VenueVista
                  account
                </p>

                <label>
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  required
                />

                <label>
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  required
                />

                <button
                  className="submit-btn"
                  type="submit"
                >
                  Login
                </button>

              </form>

            ) : (

              <form
                onSubmit={
                  handleRegister
                }
              >

                <h2>
                  Create Account
                </h2>

                <p className="subtitle">
                  Join VenueVista today
                </p>

                <label>
                  Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  required
                />

                <label>
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={registerEmail}
                  onChange={(e) =>
                    setRegisterEmail(
                      e.target.value
                    )
                  }
                  required
                />

                <label>
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Create a password"
                  value={registerPassword}
                  onChange={(e) =>
                    setRegisterPassword(
                      e.target.value
                    )
                  }
                  required
                />

                <button
                  className="submit-btn"
                  type="submit"
                >
                  Register
                </button>

              </form>

            )}

          </div>

        </div>

      </div>

    );

  }

  /* =========================================================
     ADMIN DASHBOARD
  ========================================================= */

  if (userRole === "ADMIN") {

    return (

      <div className="dashboard">

        {/* SIDEBAR */}

        <aside className="sidebar">

          <div className="sidebar-logo">

            <div className="sidebar-brand-icon">
              <Ticket size={24} />
            </div>

            <div>

              <h2>
                VenueVista
              </h2>

              <span>
                Admin Panel
              </span>

            </div>

          </div>

          <div className="sidebar-menu">

            <button
              className={
                activeSection === "dashboard"
                  ? "sidebar-item active"
                  : "sidebar-item"
              }
              onClick={() =>
                setActiveSection(
                  "dashboard"
                )
              }
            >
              <LayoutDashboard size={20} />
              <span>
                Dashboard
              </span>
            </button>

            <button
              className={
                activeSection === "events"
                  ? "sidebar-item active"
                  : "sidebar-item"
              }
              onClick={() =>
                setActiveSection(
                  "events"
                )
              }
            >
              <CalendarDays size={20} />
              <span>
                Events
              </span>
            </button>

            <button
              className={
                activeSection === "seats"
                  ? "sidebar-item active"
                  : "sidebar-item"
              }
              onClick={() =>
                setActiveSection(
                  "seats"
                )
              }
            >
              <Armchair size={20} />
              <span>
                Seats
              </span>
            </button>

            <button
              className={
                activeSection === "bookings"
                  ? "sidebar-item active"
                  : "sidebar-item"
              }
              onClick={() =>
                setActiveSection(
                  "bookings"
                )
              }
            >
              <Ticket size={20} />
              <span>
                Bookings
              </span>
            </button>

            <button
              className={
                activeSection === "analytics"
                  ? "sidebar-item active"
                  : "sidebar-item"
              }
              onClick={() =>
                setActiveSection(
                  "analytics"
                )
              }
            >
              <BarChart3 size={20} />
              <span>
                Analytics
              </span>
            </button>

            <button
              className={
                activeSection === "venues"
                  ? "sidebar-item active"
                  : "sidebar-item"
              }
              onClick={() =>
                setActiveSection(
                  "venues"
                )
              }
            >
              <Building2 size={20} />
              <span>
                Venues
              </span>
            </button>

            <button
              className={
                activeSection === "profile"
                  ? "sidebar-item active"
                  : "sidebar-item"
              }
              onClick={() =>
                setActiveSection(
                  "profile"
                )
              }
            >
              <User size={20} />
              <span>
                Profile
              </span>
            </button>

          </div>

          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>
              Logout
            </span>
          </button>

        </aside>

        {/* MAIN CONTENT */}

        <main className="main-content">

          {/* ADMIN DASHBOARD */}

          {activeSection === "dashboard" && (

            <>

              <div className="page-header">

                <div>

                  <span className="eyebrow">
                    OVERVIEW
                  </span>

                  <h1>
                    Good Morning 👋
                  </h1>

                  <p>
                    Here's what's happening
                    with your events today.
                  </p>

                </div>

              </div>

              <div className="dashboard-overview">

                <div className="overview-card">

                  <div className="overview-icon purple">
                    <CalendarDays size={24} />
                  </div>

                  <div>

                    <span>
                      Total Events
                    </span>

                    <strong>
                      {events.length}
                    </strong>

                  </div>

                </div>

                <div className="overview-card">

                  <div className="overview-icon green">
                    <Armchair size={24} />
                  </div>

                  <div>

                    <span>
                      Total Seats
                    </span>

                    <strong>
                      {totalSeats}
                    </strong>

                  </div>

                </div>

                <div className="overview-card">

                  <div className="overview-icon peach">
                    <Ticket size={24} />
                  </div>

                  <div>

                    <span>
                      Booked Seats
                    </span>

                    <strong>
                      {bookedSeats}
                    </strong>

                  </div>

                </div>

                <div className="overview-card">

                  <div className="overview-icon blue">
                    <BarChart3 size={24} />
                  </div>

                  <div>

                    <span>
                      Available Seats
                    </span>

                    <strong>
                      {availableSeats}
                    </strong>

                  </div>

                </div>

              </div>

              <div className="dashboard-card large-card">

                <div className="card-heading">

                  <div>

                    <span className="eyebrow">
                      EVENTS
                    </span>

                    <h2>
                      Upcoming Events
                    </h2>

                  </div>

                  <button
                    className="small-action"
                    onClick={() =>
                      setActiveSection(
                        "events"
                      )
                    }
                  >
                    View All
                  </button>

                </div>

                {events.length === 0 ? (

                  <div className="empty-state">

                    <CalendarDays size={35} />

                    <p>
                      No events available
                    </p>

                  </div>

                ) : (

                  <div className="mini-event-grid">

                    {events
                      .slice(0, 3)
                      .map((event) => (

                        <div
                          className="mini-event"
                          key={event.eventId}
                        >

                          <div className="mini-event-icon">
                            <CalendarDays size={20} />
                          </div>

                          <div>

                            <h3>
                              {event.eventName}
                            </h3>

                            <p>
                              {event.date} •{" "}
                              {event.time}
                            </p>

                            <span>
                              ₹{event.ticketPrice}
                            </span>

                          </div>

                        </div>

                      ))}

                  </div>

                )}

              </div>

            </>

          )}

          {/* ADMIN EVENTS */}

          {activeSection === "events" && (

            <>

              <div className="page-header">

                <div>

                  <span className="eyebrow">
                    DISCOVER
                  </span>

                  <h1>
                    Events
                  </h1>

                  <p>
                    Manage your upcoming events.
                  </p>

                </div>

              </div>

              <div className="event-grid">

                {events.length === 0 ? (

                  <div className="dashboard-card empty-state">

                    <CalendarDays size={40} />

                    <h3>
                      No Events Available
                    </h3>

                    <p>
                      Check back later for upcoming events.
                    </p>

                  </div>

                ) : (

                  events.map((event) => (

                    <div
                      className="event-card"
                      key={event.eventId}
                    >

                      <div className="event-card-top">

                        <div className="event-icon">
                          <CalendarDays size={22} />
                        </div>

                        <span className="event-price">
                          ₹{event.ticketPrice}
                        </span>

                      </div>

                      <h3>
                        {event.eventName}
                      </h3>

                      <p className="event-description">
                        {event.description}
                      </p>

                      <div className="event-info">

                        <span>
                          <CalendarDays size={15} />
                          {event.date}
                        </span>

                        <span>
                          <Clock size={15} />
                          {event.time}
                        </span>

                        <span>
                          <MapPin size={15} />
                          {event.venue}
                        </span>

                      </div>

                    </div>

                  ))

                )}

              </div>

            </>

          )}

          {/* ADMIN SEATS */}

          {activeSection === "seats" && (

            <>

              <div className="page-header">

                <div>

                  <span className="eyebrow">
                    MANAGEMENT
                  </span>

                  <h1>
                    Seats
                  </h1>

                  <p>
                    Manage seat availability for your venue.
                  </p>

                </div>

                <button
                  className="primary-action"
                  onClick={() =>
                    setShowAddSeat(
                      !showAddSeat
                    )
                  }
                >

                  <Plus size={18} />

                  {showAddSeat
                    ? "Cancel"
                    : "Add Seat"}

                </button>

              </div>

              {showAddSeat && (

                <div className="dashboard-card add-form-card">

                  <span className="eyebrow">
                    NEW SEAT
                  </span>

                  <h2>
                    Add Seat
                  </h2>

                  <form
                    onSubmit={
                      handleCreateSeat
                    }
                    className="dashboard-form"
                  >

                    <label>
                      Seat Number
                    </label>

                    <input
                      type="text"
                      placeholder="Example: A1"
                      value={seatNumber}
                      onChange={(e) =>
                        setSeatNumber(
                          e.target.value
                        )
                      }
                      required
                    />

                    <button
                      className="primary-action"
                      type="submit"
                    >

                      <Plus size={18} />

                      Add Seat

                    </button>

                  </form>

                </div>

              )}

              <div className="seat-stats">

                <div className="seat-stat">

                  <CheckCircle size={22} />

                  <div>

                    <span>
                      Available
                    </span>

                    <strong>
                      {availableSeats}
                    </strong>

                  </div>

                </div>

                <div className="seat-stat booked">

                  <XCircle size={22} />

                  <div>

                    <span>
                      Booked
                    </span>

                    <strong>
                      {bookedSeats}
                    </strong>

                  </div>

                </div>

                <div className="seat-stat total">

                  <Armchair size={22} />

                  <div>

                    <span>
                      Total
                    </span>

                    <strong>
                      {totalSeats}
                    </strong>

                  </div>

                </div>

              </div>

            <div className="event-seat-list">

              {events.length === 0 ? (

                <div className="dashboard-card empty-state">
                  <Armchair size={40} />
                  <h3>No Events</h3>
                  <p>Create an event first to manage its seats.</p>
                </div>

              ) : (

               [...new Map(events.map((event) => [event.eventId, event])).values()].map(
                 (event) => {

                  const eventSeatList =
                    eventSeats[event.eventId] || [];

                  const bookedCount =
                    eventSeatList.filter(
                      (seat) => seat.status === "BOOKED"
                    ).length;

                  const availableCount =
                    eventSeatList.filter(
                      (seat) => seat.status === "AVAILABLE"
                    ).length;

                  return (

                    <div
                      className="dashboard-card event-seat-card"
                      key={event.eventId}
                    >

                      {/* EVENT HEADER */}

                      <div className="event-seat-header">

                        <div>
                          <span className="eyebrow">
                            EVENT
                          </span>

                          <h2>
                            {event.eventName}
                          </h2>

                          <p>
                            {event.date} • {event.time}
                          </p>

                          <p>
                            {event.venue}
                          </p>
                        </div>

                        <div className="event-seat-total">
                          <Armchair size={24} />

                          <strong>
                            {eventSeatList.length}
                          </strong>

                          <span>
                            Total Seats
                          </span>
                        </div>

                      </div>


                      {/* SEAT SUMMARY */}
                     <div className="seat-stats">

                       <div className="seat-stat">

                         <CheckCircle size={22} />

                         <div>
                           <span>
                             Available
                           </span>

                           <strong>
                             {availableCount}
                           </strong>
                         </div>

                       </div>


                       <div className="seat-stat booked">

                         <XCircle size={22} />

                         <div>
                           <span>
                             Booked
                           </span>

                           <strong>
                             {bookedCount}
                           </strong>
                         </div>

                       </div>


                       <div className="seat-stat total">

                         <Armchair size={22} />

                         <div>
                           <span>
                             Total
                           </span>

                           <strong>
                             {eventSeatList.length}
                           </strong>
                         </div>

                       </div>

                     </div>


                     <button
                       className="primary-action"
                       type="button"
                       onClick={() => {
                         setSelectedEventSeats(event);
                       }}
                     >
                       <Armchair size={18} />
                       View Seat Map
                     </button>

                      </div>

                  );

                })

              )}

            </div>
             {selectedEventSeats && (

               <div className="seat-modal-overlay">

                 <div className="seat-modal">

                   <button
                     className="seat-modal-close"
                     type="button"
                     onClick={() =>
                       setSelectedEventSeats(null)
                     }
                   >
                     <X size={22} />
                   </button>

                   <div className="seat-modal-header">

                     <span className="eyebrow">
                       SEAT MAP
                     </span>

                     <h2>
                       {selectedEventSeats.eventName}
                     </h2>

                     <p>
                       {selectedEventSeats.date} •{" "}
                       {selectedEventSeats.time}
                     </p>

                   </div>

                   <div className="seat-legend">

                     <div>
                       <span className="legend-seat available"></span>
                       Available
                     </div>

                     <div>
                       <span className="legend-seat booked"></span>
                       Booked
                     </div>

                   </div>

                   <div className="theatre-screen">
                     SCREEN
                   </div>
                   <div className="theatre-seat-map">

                     {(() => {

                       const seatList =
                         eventSeats[selectedEventSeats.eventId] || [];

                       if (seatList.length === 0) {
                         return (
                           <div className="empty-seat-map">
                             No seats available for this event.
                           </div>
                         );
                       }

                       const rows = {};

                       seatList.forEach((seat) => {

                        const seatNumber = seat.seatNumber || "";

                         const rowMatch =
                           seatNumber.match(/^[A-Za-z]+/);

                         const row = seat.rowName || "A";

                         if (!rows[row]) {
                           rows[row] = [];
                         }

                         rows[row].push({
                           ...seat,
                           displaySeatNumber: seatNumber
                         });

                       });

                       return Object.keys(rows)
                         .sort()
                         .map((row) => (

                           <div
                             className="theatre-row"
                             key={row}
                           >

                             <span className="row-label">
                               {row}
                             </span>

                             <div className="row-seats">

                               {rows[row]
                                 .sort((a, b) => {

                                   const aNum =
                                     parseInt(
                                       a.displaySeatNumber
                                         ?.match(/\d+/)?.[0] || "0"
                                     );

                                   const bNum =
                                     parseInt(
                                       b.displaySeatNumber
                                         ?.match(/\d+/)?.[0] || "0"
                                     );

                                   return aNum - bNum;

                                 })
                                 .map((seat) => {

                                   const seatId =
                                     seat.seatId ||
                                     seat.seat?.seatId;

                                   const status =
                                     seat.status || "AVAILABLE";

                                   const displaySeatNumber =
                                     seat.seatNumber ||
                                     seat.displaySeatNumber ||
                                     `Seat ${seatId}`;

                                   return (

                                     <button
                                       key={
                                         seat.eventSeatId ||
                                         seatId ||
                                         displaySeatNumber
                                       }
                                       type="button"
                                       className={`theatre-seat ${
                                         status === "BOOKED"
                                           ? "booked"
                                           : "available"
                                       }`}
                                       onClick={() =>
                                         updateSeatStatus(
                                           seatId,
                                           status === "BOOKED"
                                             ? "AVAILABLE"
                                             : "BOOKED"
                                         )
                                       }
                                     >
                                       {displaySeatNumber}
                                     </button>

                                   );
                                 })}

                             </div>

                           </div>

                         ));

                     })()}

                   </div>


                   <div className="seat-modal-footer">
                     Click a seat to change its status
                   </div>

                 </div>

               </div>

             )}
             </>
             )}

          {/* =====================================================
              ADMIN BOOKINGS
          ===================================================== */}

          {activeSection === "bookings" && (

            <>

              <div className="page-header">

                <div>

                  <span className="eyebrow">
                    TRANSACTIONS
                  </span>

                  <h1>
                    All Bookings
                  </h1>

                  <p>
                    Select an event to view customer ticket details.
                  </p>

                </div>

              </div>

              {/* ===============================================
                  EVENT BOOKING GRID
              =============================================== */}

              {bookings.length === 0 ? (

                <div className="dashboard-card empty-state">

                  <Ticket size={40} />

                  <h3>
                    No Bookings
                  </h3>

                  <p>
                    No customer bookings are available yet.
                  </p>

                </div>

              ) : (

                <div className="event-grid booking-event-grid">

                  {Object.entries(
                    groupBookingsByEvent()
                  ).map(
                    (
                      [
                        eventKey,
                        eventBookings,
                      ]
                    ) => {

                      const firstBooking =
                        eventBookings[0];

                      const event =
                        getBookingEvent(
                          firstBooking
                        );

                      const eventName =
                        event?.eventName ??
                        firstBooking?.eventName ??
                        "Unknown Event";

                      const eventDate =
                        event?.date ??
                        firstBooking?.eventDate ??
                        "N/A";

                      const eventTime =
                        event?.time ??
                        firstBooking?.eventTime ??
                        "N/A";

                      const eventVenue =
                        event?.venue ??
                        firstBooking?.eventVenue ??
                        "N/A";

                      return (

                        <button
                          type="button"
                          key={eventKey}
                          className="event-card booking-event-card"
                          onClick={() =>
                            openBookingEvent({
                              eventKey,
                              event,
                              eventName,
                              eventDate,
                              eventTime,
                              eventVenue,
                              eventBookings,
                            })
                          }
                        >

                          <div className="event-card-top">

                            <div className="event-icon">
                              <Ticket size={22} />
                            </div>

                            <span className="event-price">
                              {
                                eventBookings.length
                              }{" "}
                              {
                                eventBookings.length === 1
                                  ? "Ticket"
                                  : "Tickets"
                              }
                            </span>

                          </div>

                          <h3>
                            {eventName}
                          </h3>

                          <p className="event-description">
                            Click to view customer bookings
                          </p>

                          <div className="event-info">

                            <span>
                              <CalendarDays size={15} />
                              {eventDate}
                            </span>

                            <span>
                              <Clock size={15} />
                              {eventTime}
                            </span>

                            <span>
                              <MapPin size={15} />
                              {eventVenue}
                            </span>

                          </div>

                          <div
                            style={{
                              marginTop: "18px",
                              paddingTop: "14px",
                              borderTop:
                                "1px solid rgba(0,0,0,0.08)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              fontSize: "13px",
                              fontWeight: "700",
                            }}
                          >

                            <span>
                              View booking details
                            </span>

                            <span>
                              →
                            </span>

                          </div>

                        </button>

                      );

                    }
                  )}

                </div>

              )}

              {/* =================================================
                  BOOKING DETAILS POPUP
              ================================================= */}

              {selectedBookingEvent && (

                <div
                  className="theatre-overlay"
                  onClick={
                    closeBookingEvent
                  }
                >

                  <div
                    className="theatre-modal"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >

                    {/* ================================
                        POPUP HEADER
                    ================================= */}

                    <div className="theatre-modal-header">

                      <div>

                        <span className="eyebrow">
                          BOOKING DETAILS
                        </span>

                        <h2>
                          {
                            selectedBookingEvent.eventName
                          }
                        </h2>

                        <p>
                          {
                            selectedBookingEvent.eventDate
                          }{" "}
                          •{" "}
                          {
                            selectedBookingEvent.eventTime
                          }{" "}
                          •{" "}
                          {
                            selectedBookingEvent.eventVenue
                          }
                        </p>

                      </div>

                      <button
                        type="button"
                        className="theatre-close"
                        onClick={
                          closeBookingEvent
                        }
                      >

                        <X size={22} />

                      </button>

                    </div>

                    {/* =================================
                        TOTAL EVENT TICKETS
                    ================================= */}

                    <div
                      style={{
                        marginBottom: "20px",
                        padding: "16px 18px",
                        borderRadius: "14px",
                        background:
                          "rgba(124, 92, 255, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >

                      <div>

                        <span
                          style={{
                            display: "block",
                            fontSize: "12px",
                            fontWeight: "700",
                            opacity: 0.65,
                            marginBottom: "4px",
                          }}
                        >
                          TOTAL EVENT BOOKINGS
                        </span>

                        <strong
                          style={{
                            fontSize: "22px",
                          }}
                        >
                          {
                            selectedBookingEvent
                              .eventBookings
                              .length
                          }{" "}
                          {
                            selectedBookingEvent
                              .eventBookings
                              .length === 1
                              ? "Ticket"
                              : "Tickets"
                          }
                        </strong>

                      </div>

                      <Ticket size={28} />

                    </div>

                    {/* =================================
                        GROUP BY USER
                    ================================= */}

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                        maxHeight: "55vh",
                        overflowY: "auto",
                        paddingRight: "4px",
                      }}
                    >

                      {Object.entries(
                        groupBookingsByUser(
                          selectedBookingEvent
                            .eventBookings
                        )
                      ).map(
                        (
                          [
                            userKey,
                            userBookings,
                          ]
                        ) => {

                          const firstUserBooking =
                            userBookings[0];

                          const userId =
                            getBookingUserId(
                              firstUserBooking
                            );

                          const userName =
                            getBookingUserName(
                              firstUserBooking
                            );

                          return (

                            <div
                              key={userKey}
                              style={{
                                border:
                                  "1px solid rgba(0,0,0,0.08)",
                                borderRadius: "16px",
                                padding: "16px",
                                background: "#fff",
                              }}
                            >

                              {/* =========================
                                  USER SUMMARY
                              ========================= */}

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent:
                                    "space-between",
                                  gap: "15px",
                                  marginBottom:
                                    "14px",
                                }}
                              >

                                <div
                                  style={{
                                    display: "flex",
                                    alignItems:
                                      "center",
                                    gap: "12px",
                                  }}
                                >

                                  <div
                                    style={{
                                      width: "42px",
                                      height: "42px",
                                      borderRadius:
                                        "50%",
                                      display: "flex",
                                      alignItems:
                                        "center",
                                      justifyContent:
                                        "center",
                                      background:
                                        "rgba(124, 92, 255, 0.10)",
                                    }}
                                  >

                                    <User size={20} />

                                  </div>

                                  <div>

                                    <span
                                      style={{
                                        display:
                                          "block",
                                        fontSize:
                                          "11px",
                                        fontWeight:
                                          "700",
                                        opacity:
                                          0.55,
                                        marginBottom:
                                          "2px",
                                      }}
                                    >
                                      CUSTOMER
                                    </span>

                                    <h3
                                      style={{
                                        margin:
                                          "0 0 3px",
                                        fontSize:
                                          "17px",
                                      }}
                                    >
                                      {userName}
                                    </h3>

                                    <span
                                      style={{
                                        fontSize:
                                          "12px",
                                        opacity:
                                          0.7,
                                      }}
                                    >
                                      User ID:{" "}
                                      {
                                        userId ??
                                        "N/A"
                                      }
                                    </span>

                                  </div>

                                </div>

                                {/* USER TICKET COUNT */}

                                <div
                                  style={{
                                    textAlign:
                                      "right",
                                    flexShrink:
                                      0,
                                  }}
                                >

                                  <strong
                                    style={{
                                      display:
                                        "block",
                                      fontSize:
                                        "24px",
                                    }}
                                  >
                                    {
                                      userBookings.length
                                    }
                                  </strong>

                                  <span
                                    style={{
                                      fontSize:
                                        "12px",
                                      fontWeight:
                                        "700",
                                      opacity:
                                        0.6,
                                    }}
                                  >
                                    {
                                      userBookings.length === 1
                                        ? "Ticket"
                                        : "Tickets"
                                    }
                                  </span>

                                </div>

                              </div>

                              {/* =========================
                                  USER BOOKINGS
                              ========================= */}

                              <div
                                style={{
                                  display:
                                    "flex",
                                  flexDirection:
                                    "column",
                                  gap: "8px",
                                }}
                              >

                                {userBookings.map(
                                  (
                                    booking
                                  ) => {

                                    const bookingEventId =
                                      getBookingEventId(
                                        booking
                                      );

                                    const bookingUserId =
                                      getBookingUserId(
                                        booking
                                      );

                                    const individualTicketPrice =
                                      selectedBookingEvent
                                        .event
                                        ?.ticketPrice ??
                                      booking?.ticketPrice ??
                                      "N/A";

                                    return (

                                      <div
                                        key={
                                          booking.bookingId
                                        }
                                        style={{
                                          padding:
                                            "12px 14px",
                                          borderRadius:
                                            "12px",
                                          background:
                                            "rgba(0,0,0,0.035)",
                                          display:
                                            "grid",
                                          gridTemplateColumns:
                                            "1fr 1fr",
                                          gap:
                                            "8px 15px",
                                          fontSize:
                                            "12px",
                                        }}
                                      >

                                        <span>
                                          <strong>
                                            Booking ID:
                                          </strong>{" "}
                                          {
                                            booking.bookingId ??
                                            "N/A"
                                          }
                                        </span>

                                        <span>
                                          <strong>
                                            Seat ID:
                                          </strong>{" "}
                                          {
                                            booking.seatId ??
                                            booking.seat_id ??
                                            "N/A"
                                          }
                                        </span>

                                        <span>
                                          <strong>
                                            User ID:
                                          </strong>{" "}
                                          {
                                            bookingUserId ??
                                            "N/A"
                                          }
                                        </span>

                                        <span>
                                          <strong>
                                            Event ID:
                                          </strong>{" "}
                                          {
                                            bookingEventId ??
                                            "N/A"
                                          }
                                        </span>

                                        <span>
                                          <strong>
                                            Booking Date:
                                          </strong>{" "}
                                          {
                                            booking.bookingDate ??
                                            booking.booking_date ??
                                            "N/A"
                                          }
                                        </span>

                                        <span>
                                          <strong>
                                            Ticket:
                                          </strong>{" "}
                                          ₹
                                          {
                                            individualTicketPrice
                                          }
                                        </span>

                                        <span
                                          style={{
                                            gridColumn:
                                              "1 / -1",
                                          }}
                                        >
                                          <strong>
                                            Status:
                                          </strong>{" "}
                                          {
                                            booking.status ??
                                            "N/A"
                                          }
                                        </span>

                                      </div>

                                    );

                                  }
                                )}

                              </div>

                            </div>

                          );

                        }
                      )}

                    </div>

                    {/* ================================
                        CLOSE BUTTON
                    ================================= */}

                    <div
                      style={{
                        marginTop: "18px",
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >

                      <button
                        type="button"
                        className="primary-action"
                        onClick={
                          closeBookingEvent
                        }
                      >

                        <X size={17} />

                        Close

                      </button>

                    </div>

                  </div>

                </div>

              )}

            </>

          )}

          {/* ADMIN ANALYTICS */}

          {activeSection === "analytics" && (

            <>

              <div className="page-header">

                <div>

                  <span className="eyebrow">
                    INSIGHTS
                  </span>

                  <h1>
                    Analytics
                  </h1>

                  <p>
                    Monitor seats, bookings and event revenue.
                  </p>

                </div>

              </div>

              <div className="analytics-grid">

                <div className="analytics-card purple-card">

                  <CalendarDays size={28} />

                  <span>
                    Total Events
                  </span>

                  <strong>
                    {events.length}
                  </strong>

                </div>

                <div className="analytics-card green-card">

                  <Armchair size={28} />

                  <span>
                    Total Seats
                  </span>

                  <strong>
                    {totalSeats}
                  </strong>

                </div>

                <div className="analytics-card peach-card">

                  <Ticket size={28} />

                  <span>
                    Booked Seats
                  </span>

                  <strong>
                    {bookedSeats}
                  </strong>

                </div>

                <div className="analytics-card blue-card">

                  <BarChart3 size={28} />

                  <span>
                    Available Seats
                  </span>

                  <strong>
                    {availableSeats}
                  </strong>

                </div>

              </div>

              <div className="dashboard-card">

                <div className="card-heading">

                  <div>

                    <span className="eyebrow">
                      REVENUE
                    </span>

                    <h2>
                      Event Revenue
                    </h2>

                  </div>

                </div>

                <div className="revenue-list">

                  {eventRevenues.length === 0 ? (

                    <div className="empty-state">

                      <BarChart3 size={35} />

                      <p>
                        No revenue data available.
                      </p>

                    </div>

                  ) : (

                    eventRevenues.map(
                      (event) => (

                        <div
                          className="revenue-item"
                          key={event.eventId}
                        >

                          <div>

                            <h3>
                              {event.eventName}
                            </h3>

                            <span>
                              Event ID:{" "}
                              {event.eventId}
                            </span>

                          </div>

                          <strong>
                            ₹{event.revenue}
                          </strong>

                        </div>

                      )
                    )

                  )}

                </div>

              </div>

            </>

          )}

          {/* ADMIN VENUES */}

          {activeSection === "venues" && (

            <>

              <div className="page-header">

                <div>

                  <span className="eyebrow">
                    LOCATIONS
                  </span>

                  <h1>
                    Venues
                  </h1>

                  <p>
                    Available event venues.
                  </p>

                </div>

              </div>

              <div className="venue-grid">

                {events.length === 0 ? (

                  <div className="dashboard-card empty-state">

                    <Building2 size={40} />

                    <h3>
                      No Venues
                    </h3>

                    <p>
                      Create an event to add a venue.
                    </p>

                  </div>

                ) : (

                  [
                    ...new Map(
                      events.map(
                        (event) => [
                          event.eventName?.trim().toLowerCase(),
                          event,
                        ]
                      )
                    ).values(),
                  ].map((event) => (

                    <div
                      className="venue-card"
                      key={event.venue}
                    >

                      <div className="venue-icon">
                        <Building2 size={25} />
                      </div>

                      <h3>
                        {event.venue}
                      </h3>

                      <p>
                        Events hosted:
                      </p>

                      <strong>
                        {
                          events.filter(
                            (e) =>
                              e.venue ===
                              event.venue
                          ).length
                        }
                      </strong>

                    </div>

                  ))

                )}

              </div>

            </>

          )}

          {/* ADMIN PROFILE */}

          {activeSection === "profile" && (

            <>

              <div className="page-header">

                <div>

                  <span className="eyebrow">
                    ACCOUNT
                  </span>

                  <h1>
                    Profile
                  </h1>

                  <p>
                    Your VenueVista account information.
                  </p>

                </div>

              </div>

              <div className="profile-card">

                <div className="profile-avatar">
                  <User size={38} />
                </div>

                {userProfile ? (

                  <>

                    <h2>
                      {userProfile.name}
                    </h2>

                    <p className="profile-role">
                      {userProfile.role}
                    </p>

                    <div className="profile-info">

                      <div>

                        <span>
                          Email
                        </span>

                        <strong>
                          {userProfile.email}
                        </strong>

                      </div>

                      <div>

                        <span>
                          User ID
                        </span>

                        <strong>
                          {userProfile.userId}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Role
                        </span>

                        <strong>
                          {userProfile.role}
                        </strong>

                      </div>

                    </div>

                  </>

                ) : (

                  <p>
                    Loading profile...
                  </p>

                )}

              </div>

            </>

          )}

        </main>

      </div>

    );

  }

  /* =========================================================
     CUSTOMER DASHBOARD
  ========================================================= */

  return (

    <div className="dashboard">

      {/* CUSTOMER SIDEBAR */}

      <aside className="sidebar">

        <div className="sidebar-logo">

          <div className="sidebar-brand-icon">
            <Ticket size={24} />
          </div>

          <div>

            <h2>
              VenueVista
            </h2>

            <span>
              Customer
            </span>

          </div>

        </div>

        <div className="sidebar-menu">

          <button
            className={
              activeSection === "dashboard"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              setActiveSection(
                "dashboard"
              )
            }
          >
            <LayoutDashboard size={20} />

            <span>
              Dashboard
            </span>

          </button>

          <button
            className={
              activeSection === "events"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              setActiveSection(
                "events"
              )
            }
          >
            <CalendarDays size={20} />

            <span>
              Events
            </span>

          </button>

          <button
            className={
              activeSection === "bookings"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              setActiveSection(
                "bookings"
              )
            }
          >
            <Ticket size={20} />

            <span>
              My Bookings
            </span>

          </button>

          <button
            className={
              activeSection === "venues"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              setActiveSection(
                "venues"
              )
            }
          >
            <Building2 size={20} />

            <span>
              Venues
            </span>

          </button>

          <button
            className={
              activeSection === "profile"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              setActiveSection(
                "profile"
              )
            }
          >
            <User size={20} />

            <span>
              Profile
            </span>

          </button>

        </div>

        <button
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <LogOut size={20} />

          <span>
            Logout
          </span>

        </button>

      </aside>

      {/* CUSTOMER MAIN */}

      <main className="main-content">

        {/* CUSTOMER DASHBOARD */}

        {activeSection === "dashboard" && (

          <>

            <div className="page-header">

              <div>

                <span className="eyebrow">
                  VENUEVISTA
                </span>

                <h1>
                  Welcome Back 👋
                </h1>

                <p>
                  Discover events and book your next experience.
                </p>

              </div>

            </div>

            <div className="dashboard-overview">

              <div className="overview-card">

                <div className="overview-icon purple">
                  <CalendarDays size={24} />
                </div>

                <div>

                  <span>
                    Events
                  </span>

                  <strong>
                    {events.length}
                  </strong>

                </div>

              </div>

              <div className="overview-card">

                <div className="overview-icon green">
                  <Ticket size={24} />
                </div>

                <div>

                  <span>
                    My Bookings
                  </span>

                  <strong>
                    {bookings.length}
                  </strong>

                </div>

              </div>

              <div className="overview-card">

                <div className="overview-icon peach">
                  <Armchair size={24} />
                </div>

                <div>

                  <span>
                    Available Seats
                  </span>

                  <strong>
                    {availableSeats}
                  </strong>

                </div>

              </div>

            </div>

            <div className="dashboard-card large-card">

              <div className="card-heading">

                <div>

                  <span className="eyebrow">
                    DISCOVER
                  </span>

                  <h2>
                    Upcoming Events
                  </h2>

                </div>

                <button
                  className="small-action"
                  onClick={() =>
                    setActiveSection(
                      "events"
                    )
                  }
                >
                  View All
                </button>

              </div>

              <div className="mini-event-grid">

                {events
                  .slice(0, 3)
                  .map((event) => (

                    <div
                      className="mini-event"
                      key={event.eventId}
                    >

                      <div className="mini-event-icon">
                        <CalendarDays size={20} />
                      </div>

                      <div>

                        <h3>
                          {event.eventName}
                        </h3>

                        <p>
                          {event.date} •{" "}
                          {event.time}
                        </p>

                        <span>
                          ₹{event.ticketPrice}
                        </span>

                      </div>

                    </div>

                  ))}

              </div>

            </div>

          </>

        )}

        {/* CUSTOMER EVENTS */}

        {activeSection === "events" && (

          <>

            <div className="page-header">

              <div>

                <span className="eyebrow">
                  DISCOVER
                </span>

                <h1>
                  Events
                </h1>

                <p>
                  Choose an event and reserve your seat.
                </p>

              </div>

            </div>

            <div className="event-grid">

              {events.length === 0 ? (

                <div className="dashboard-card empty-state">

                  <CalendarDays size={40} />

                  <h3>
                    No Events Available
                  </h3>

                  <p>
                    Check back later for upcoming events.
                  </p>

                </div>

              ) : (

                events.map((event) => (

                  <div
                    className="event-card"
                    key={event.eventId}
                  >

                    <div className="event-card-top">

                      <div className="event-icon">
                        <CalendarDays size={22} />
                      </div>

                      <span className="event-price">
                        ₹{event.ticketPrice}
                      </span>

                    </div>

                    <h3>
                      {event.eventName}
                    </h3>

                    <p className="event-description">
                      {event.description}
                    </p>

                    <div className="event-info">

                      <span>
                        <CalendarDays size={15} />
                        {event.date}
                      </span>

                      <span>
                        <Clock size={15} />
                        {event.time}
                      </span>

                      <span>
                        <MapPin size={15} />
                        {event.venue}
                      </span>

                    </div>

                    {/* BOOK SEAT */}

                    <button
                      type="button"
                      className="primary-action booking-button"
                      onClick={() => {

                        setSeats([]);

                        setSelectedEvent(
                          event
                        );

                        setSelectedSeat(
                          null
                        );

                        setShowSeatMap(
                          true
                        );

                      }}
                    >

                      <Armchair size={18} />

                      Book Seat

                    </button>

                  </div>

                ))

              )}

            </div>

            {/* FULL SCREEN THEATRE MODAL */}

            {showSeatMap &&
              selectedEvent && (

                <div
                  className="theatre-overlay"
                  onClick={
                    closeSeatMap
                  }
                >

                  <div
                    className="theatre-modal"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >

                    {/* MODAL HEADER */}

                    <div className="theatre-modal-header">

                      <div>

                        <span className="eyebrow">
                          SELECT YOUR SEAT
                        </span>

                        <h2>
                          {
                            selectedEvent.eventName
                          }
                        </h2>

                        <p>
                          {
                            selectedEvent.date
                          }{" "}
                          •{" "}
                          {
                            selectedEvent.time
                          }{" "}
                          •{" "}
                          {
                            selectedEvent.venue
                          }
                        </p>

                      </div>

                      <button
                        type="button"
                        className="theatre-close"
                        onClick={
                          closeSeatMap
                        }
                      >

                        <X size={22} />

                      </button>

                    </div>

                    {/* SCREEN */}

                    <div className="theatre-screen-area">

                      <div className="theatre-screen">
                        SCREEN
                      </div>

                      <span>
                        All eyes this way
                      </span>

                    </div>

                    {/* SEAT MAP */}

                    <div className="theatre-seat-map">

                      {seats.length === 0 ? (

                        <div className="theatre-empty">

                          <Armchair size={40} />

                          <h3>
                            No Seats Available
                          </h3>

                          <p>
                            No seats are configured for this event.
                          </p>

                        </div>

                      ) : (

                        Object.entries(
                          seats.reduce(
                            (
                              rows,
                              seat
                            ) => {

                              const rowName =
                                seat.rowName ||
                                "A";

                              if (
                                !rows[rowName]
                              ) {

                                rows[
                                  rowName
                                ] = [];

                              }

                              rows[
                                rowName
                              ].push(
                                seat
                              );

                              return rows;

                            },
                            {}
                          )
                        ).map(
                          (
                            [
                              rowName,
                              rowSeats,
                            ]
                          ) => (

                            <div
                              key={
                                rowName
                              }
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                gap:
                                  "12px",
                                marginBottom:
                                  "14px",
                                width:
                                  "100%",
                              }}
                            >

                              <span
                                style={{
                                  width:
                                    "25px",
                                  flexShrink:
                                    0,
                                  textAlign:
                                    "center",
                                  fontWeight:
                                    800,
                                  color:
                                    "#555b63",
                                  fontSize:
                                    "11px",
                                }}
                              >
                                {
                                  rowName
                                }
                              </span>

                              <div
                                style={{
                                  display:
                                    "flex",
                                  flexDirection:
                                    "row",
                                  flexWrap:
                                    "nowrap",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  gap:
                                    "10px",
                                  maxWidth:
                                    "100%",
                                  overflowX:
                                    "auto",
                                  padding:
                                    "6px 3px",
                                }}
                              >

                                {rowSeats.map(
                                  (
                                    seat
                                  ) => {

                                    const isBooked =
                                      String(
                                        seat.status
                                      ).toUpperCase() ===
                                      "BOOKED";

                                    const seatId =
                                      seat.seatId ??
                                      seat.eventSeatId ??
                                      seat.id;

                                    const selectedSeatId =
                                      selectedSeat?.seatId ??
                                      selectedSeat?.eventSeatId ??
                                      selectedSeat?.id;

                                    const isSelected =
                                      Number(
                                        selectedSeatId
                                      ) ===
                                      Number(
                                        seatId
                                      );

                                    return (

                                      <button
                                        key={
                                          seat.eventSeatId ??
                                          seat.seatId ??
                                          seat.id
                                        }
                                        type="button"
                                        disabled={
                                          isBooked
                                        }
                                        className={`theatre-seat ${
                                          isBooked
                                            ? "theatre-seat-booked"
                                            : isSelected
                                            ? "theatre-seat-selected"
                                            : ""
                                        }`}
                                        title={
                                          isBooked
                                            ? `${seat.seatNumber} - Booked`
                                            : `${seat.seatNumber} - ₹${seat.price ?? selectedEvent.ticketPrice}`
                                        }
                                        onClick={() =>
                                          setSelectedSeat(
                                            seat
                                          )
                                        }
                                      >

                                        {
                                          seat.seatNumber
                                        }

                                      </button>

                                    );

                                  }
                                )}

                              </div>

                            </div>

                          )
                        )

                      )}

                    </div>

                    {/* LEGEND */}

                    <div className="theatre-legend">

                      <div>

                        <span className="legend-seat"></span>

                        <span>
                          Available
                        </span>

                      </div>

                      <div>

                        <span className="legend-seat selected"></span>

                        <span>
                          Selected
                        </span>

                      </div>

                      <div>

                        <span className="legend-seat booked"></span>

                        <span>
                          Booked
                        </span>

                      </div>

                    </div>

                    {/* BOTTOM */}

                    <div className="theatre-booking-footer">

                      {selectedSeat ? (

                        <>

                          <div className="selected-seat-info">

                            <div>

                              <span>
                                Seat
                              </span>

                              <strong>
                                {
                                  selectedSeat.seatNumber
                                }
                              </strong>

                            </div>

                            <div>

                              <span>
                                Section
                              </span>

                              <strong>
                                {
                                  selectedSeat.sectionName ||
                                  "General"
                                }
                              </strong>

                            </div>

                            <div>

                              <span>
                                Row
                              </span>

                              <strong>
                                {
                                  selectedSeat.rowName ||
                                  "A"
                                }
                              </strong>

                            </div>

                            <div>

                              <span>
                                Price
                              </span>

                              <strong>
                                ₹
                                {
                                  selectedSeat.price ??
                                  selectedEvent.ticketPrice
                                }
                              </strong>

                            </div>

                          </div>

                          <button
                            type="button"
                            className="primary-action theatre-book-button"
                            onClick={
                              handleBooking
                            }
                          >

                            <Ticket size={18} />

                            Book Ticket

                          </button>

                        </>

                      ) : (

                        <div className="theatre-select-message">

                          Select an available
                          seat to continue

                        </div>

                      )}

                    </div>

                  </div>

                </div>

              )}

          </>

        )}

        {/* CUSTOMER BOOKINGS */}

        {activeSection === "bookings" && (

          <>

            <div className="page-header">

              <div>

                <span className="eyebrow">
                  YOUR TICKETS
                </span>

                <h1>
                  My Bookings
                </h1>

                <p>
                  View your confirmed event tickets.
                </p>

              </div>

            </div>

            <div className="booking-list">

              {bookings.length === 0 ? (

                <div className="dashboard-card empty-state">

                  <Ticket size={40} />

                  <h3>
                    No Bookings Yet
                  </h3>

                  <p>
                    Explore events and book your first ticket.
                  </p>

                </div>

              ) : (

                bookings.map(
                  (booking) => {

                    const bookingEventId =
                      getBookingEventId(
                        booking
                      );

                    const event =
                      getBookingEvent(
                        booking
                      );

                    const eventName =
                      event?.eventName ??
                      booking?.eventName ??
                      "Unknown Event";

                    const eventDate =
                      event?.date ??
                      booking?.eventDate ??
                      "N/A";

                    const eventTime =
                      event?.time ??
                      booking?.eventTime ??
                      "N/A";

                    const eventVenue =
                      event?.venue ??
                      booking?.eventVenue ??
                      "N/A";

                    const ticketPrice =
                      event?.ticketPrice ??
                      booking?.ticketPrice ??
                      "N/A";

                    return (

                      <div
                        className="booking-card"
                        key={
                          booking.bookingId
                        }
                      >

                        <div className="booking-icon">
                          <Ticket size={22} />
                        </div>

                        <div className="booking-main">

                          <span className="eyebrow">
                            BOOKING #
                            {
                              booking.bookingId
                            }
                          </span>

                          <h3>
                            {eventName}
                          </h3>

                          <div className="booking-details">

                            <span>
                              <CalendarDays size={14} />
                              Date: {eventDate}
                            </span>

                            <span>
                              <Clock size={14} />
                              Time: {eventTime}
                            </span>

                            <span>
                              <MapPin size={14} />
                              Venue: {eventVenue}
                            </span>

                            <span>
                              Event ID:{" "}
                              {
                                bookingEventId ??
                                "N/A"
                              }
                            </span>

                            <span>
                              Seat ID:{" "}
                              {
                                booking.seatId ??
                                "N/A"
                              }
                            </span>

                            <span>
                              Ticket: ₹
                              {ticketPrice}
                            </span>

                          </div>

                        </div>

                        <span className="status-badge available">
                          {
                            booking.status
                          }
                        </span>

                      </div>

                    );

                  }
                )

              )}

            </div>

          </>

        )}

        {/* CUSTOMER VENUES */}

        {activeSection === "venues" && (

          <>

            <div className="page-header">

              <div>

                <span className="eyebrow">
                  LOCATIONS
                </span>

                <h1>
                  Venues
                </h1>

                <p>
                  Explore event locations.
                </p>

              </div>

            </div>

            <div className="venue-grid">

              {events.length === 0 ? (

                <div className="dashboard-card empty-state">

                  <Building2 size={40} />

                  <h3>
                    No Venues
                  </h3>

                </div>

              ) : (

                [
                  ...new Map(
                    events.map(
                      (event) => [
                        event.venue,
                        event,
                      ]
                    )
                  ).values(),
                ].map((event) => (

                  <div
                    className="venue-card"
                    key={event.venue}
                  >

                    <div className="venue-icon">
                      <Building2 size={25} />
                    </div>

                    <h3>
                      {event.venue}
                    </h3>

                    <p>
                      Available events
                    </p>

                    <strong>
                      {
                        events.filter(
                          (e) =>
                            e.venue ===
                            event.venue
                        ).length
                      }
                    </strong>

                  </div>

                ))

              )}

            </div>

          </>

        )}

        {/* CUSTOMER PROFILE */}

        {activeSection === "profile" && (

          <>

            <div className="page-header">

              <div>

                <span className="eyebrow">
                  ACCOUNT
                </span>

                <h1>
                  Profile
                </h1>

                <p>
                  Manage your VenueVista account information.
                </p>

              </div>

            </div>

            <div className="profile-card">

              <div className="profile-avatar">
                <User size={38} />
              </div>

              {userProfile ? (

                <>

                  <h2>
                    {userProfile.name}
                  </h2>

                  <p className="profile-role">
                    {userProfile.role}
                  </p>

                  <div className="profile-info">

                    <div>

                      <span>
                        Email
                      </span>

                      <strong>
                        {userProfile.email}
                      </strong>

                    </div>

                    <div>

                      <span>
                        User ID
                      </span>

                      <strong>
                        {userProfile.userId}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Role
                      </span>

                      <strong>
                        {userProfile.role}
                      </strong>

                    </div>

                  </div>

                </>

              ) : (

                <p>
                  Loading profile...
                </p>

              )}

            </div>

          </>

        )}

      </main>

    </div>

  );
}

export default App;