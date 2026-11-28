/* =====================================================
   UniSync Login Page Script
   Handles:
   1. Mobile hamburger menu toggle
   2. Checking if user is already logged in (and Logout)
   3. Form validation for University Email and Demo Code
   4. Clearing error messages as soon as a field is fixed
   5. Saving login state in localStorage and redirecting
   ===================================================== */

// Wait until the HTML page is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Key names used in localStorage
  var USERS_STORAGE_KEY = "unisync_users";
  var CURRENT_USER_KEY = "unisync_current_user";
  var VALID_DEMO_CODE = "2026";

  // Header menu elements
  var menuToggle = document.getElementById("menu-toggle");
  var mainNav = document.getElementById("main-nav");

  // Card view containers
  var loginSubtitle = document.getElementById("login-subtitle");
  var loggedInView = document.getElementById("logged-in-view");
  var loggedInText = document.getElementById("logged-in-text");
  var logoutBtn = document.getElementById("logout-btn");
  var loginFormWrapper = document.getElementById("login-form-wrapper");

  // Form, input, and message elements
  var loginForm = document.getElementById("login-form");
  var emailInput = document.getElementById("login-email");
  var demoCodeInput = document.getElementById("demo-code");
  var emailError = document.getElementById("email-error");
  var demoCodeError = document.getElementById("demo-code-error");
  var successBox = document.getElementById("login-success");
  var loginBtn = document.getElementById("login-btn");

  // -----------------------------------------------------
  // 1. Mobile Hamburger Menu Toggle
  // -----------------------------------------------------
  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // -----------------------------------------------------
  // 2. Helper Functions for localStorage and Errors
  // -----------------------------------------------------

  // Read registered users array safely from localStorage
  function getSavedUsers() {
    var rawData = localStorage.getItem(USERS_STORAGE_KEY);
    if (!rawData) {
      return [];
    }

    try {
      var parsed = JSON.parse(rawData);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  // Find a registered user's name by matching their university email
  function findUserNameByEmail(email) {
    var users = getSavedUsers();
    for (var i = 0; i < users.length; i++) {
      if (
        users[i].email &&
        users[i].email.toLowerCase() === email.toLowerCase() &&
        users[i].name
      ) {
        return users[i].name.trim();
      }
    }
    return "";
  }

  // Read the currently logged-in user safely from localStorage
  function getLoggedInUser() {
    var rawUser = localStorage.getItem(CURRENT_USER_KEY);
    if (!rawUser) {
      return null;
    }

    try {
      var parsed = JSON.parse(rawUser);
      if (parsed && parsed.email) {
        return parsed;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Show an error message and red border on an input field
  function showError(inputElement, errorElement, message) {
    errorElement.textContent = message;
    inputElement.classList.add("input-error");
    inputElement.setAttribute("aria-invalid", "true");
  }

  // Clear the error message and red border on an input field
  function clearError(inputElement, errorElement) {
    errorElement.textContent = "";
    inputElement.classList.remove("input-error");
    inputElement.removeAttribute("aria-invalid");
  }

  // -----------------------------------------------------
  // 3. Toggle Between Logged-In View and Login Form
  // -----------------------------------------------------

  // Show the "already logged in" message with Logout button
  function showLoggedInState(userEmail) {
    loggedInText.textContent = "You are already logged in as " + userEmail;
    loggedInView.hidden = false;
    loginFormWrapper.hidden = true;
    loginSubtitle.hidden = true;
  }

  // Show the login form and clear old inputs or messages
  function showLoginForm() {
    loggedInView.hidden = true;
    loginFormWrapper.hidden = false;
    loginSubtitle.hidden = false;

    loginForm.reset();
    clearError(emailInput, emailError);
    clearError(demoCodeInput, demoCodeError);
    successBox.hidden = true;
    successBox.textContent = "";
    loginBtn.disabled = false;
  }

  // Check login status as soon as the page opens or reloads
  var existingUser = getLoggedInUser();
  if (existingUser) {
    showLoggedInState(existingUser.email);
  } else {
    showLoginForm();
  }

  // Handle Logout button click
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem(CURRENT_USER_KEY);
    showLoginForm();
    emailInput.focus();
  });

  // -----------------------------------------------------
  // 4. Field Validation Functions
  // -----------------------------------------------------

  // Check University Email using the same rule as the Register page
  function validateEmail() {
    var value = emailInput.value.trim().toLowerCase();
    var emailPattern = /^[a-z0-9._%+-]+@isb\.nu\.edu\.pk$/;

    if (value === "") {
      showError(emailInput, emailError, "Please enter your university email.");
      return false;
    }

    if (!emailPattern.test(value)) {
      showError(emailInput, emailError, "Please enter a valid email.");
      return false;
    }

    clearError(emailInput, emailError);
    return true;
  }

  // Check Demo Code: cannot be empty and must equal 2026
  function validateDemoCode() {
    var value = demoCodeInput.value.trim();

    if (value === "") {
      showError(demoCodeInput, demoCodeError, "Please enter the demo code.");
      return false;
    }

    if (value !== VALID_DEMO_CODE) {
      showError(demoCodeInput, demoCodeError, "Wrong demo code. Please use 2026.");
      return false;
    }

    clearError(demoCodeInput, demoCodeError);
    return true;
  }

  // -----------------------------------------------------
  // 5. Remove Errors Immediately When User Fixes a Field
  // -----------------------------------------------------
  emailInput.addEventListener("input", function () {
    if (emailError.textContent !== "") {
      validateEmail();
    }
  });

  demoCodeInput.addEventListener("input", function () {
    if (demoCodeError.textContent !== "") {
      validateDemoCode();
    }
  });

  // -----------------------------------------------------
  // 6. Handle Login Form Submission
  // -----------------------------------------------------
  loginForm.addEventListener("submit", function (event) {
    // Stop normal page reload so JavaScript can validate first
    event.preventDefault();

    // Hide any previous success message
    successBox.hidden = true;
    successBox.textContent = "";

    // Validate both inputs
    var isEmailValid = validateEmail();
    var isCodeValid = validateDemoCode();

    if (!isEmailValid || !isCodeValid) {
      return;
    }

    // Read clean email and look up saved name from registration
    var cleanEmail = emailInput.value.trim().toLowerCase();
    var savedName = findUserNameByEmail(cleanEmail);

    // Save logged-in user in localStorage
    var loggedInUser = {
      email: cleanEmail,
      name: savedName,
      loggedInAt: new Date().toISOString()
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedInUser));

    // Show welcome message (include name if found from Register page)
    if (savedName !== "") {
      successBox.textContent = "Login successful! Welcome back, " + savedName + ".";
    } else {
      successBox.textContent = "Login successful! Welcome back.";
    }
    successBox.hidden = false;
    loginBtn.disabled = true;

    // Wait 1.5 seconds, then take the user to the Home page
    setTimeout(function () {
      window.location.href = "../index.html";
    }, 1500);
  });
});
