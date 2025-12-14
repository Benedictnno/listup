# Student Journey Simulation Script

**Goal:** Simulate a complete student/buyer journey from registration to browsing.

**Prerequisites:**
- Main Frontend running at http://localhost:3000
- Main Backend running at http://localhost:4000

**Steps:**

1.  **Registration**
    -   Navigate to `http://localhost:3000/signup`
    -   Fill in "First Name" with "Test"
    -   Fill in "Last Name" with "Student"
    -   Fill in "Email" with a unique email (e.g., `teststudent_[timestamp]@example.com`)
    -   Fill in "Password" with "Password123!"
    -   Submit the form.
    -   *Checkpoint:* Verify redirection to Email Verification or Dashboard.

2.  **Login (if not auto-logged in)**
    -   Navigate to `http://localhost:3000/login`
    -   Enter Email and Password.
    -   Submit.
    -   *Checkpoint:* Verify URL contains `/dashboard` or user is redirected to Home.

3.  **Browsing**
    -   Navigate to `http://localhost:3000` (Home)
    -   Click on a category (e.g., "Electronics" or "Fashion")
    -   *Checkpoint:* Verify listing page loads.
    -   Click on a specific listing.
    -   *Checkpoint:* Verify listing details page loads.

4.  **Search**
    -   Use the search bar to search for "iPhone" (or common term).
    -   *Checkpoint:* Verify search results appear.

**Notes for Subagent:**
-   If email verification is required and blocked (no real email access), check if we can bypass or if the backend logs the OTP.
-   Take screenshots at every *Checkpoint*.
