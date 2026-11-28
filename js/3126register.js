/* =====================================================
   UniSync Registration Page Script
   Handles:
   1. Mobile hamburger menu toggle
   2. Form validation for Name, Student ID, and Email
   3. Clearing error messages as soon as a field is fixed
   4. Saving new users to localStorage and redirecting
   ===================================================== */

// Wait until the HTML page is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Key name used to store registered users in localStorage
  var STORAGE_KEY = "unisync_users";

  // Get header menu elements
  var menuToggle = document.getElementById("menu-toggle");
  var mainNav = document.getElementById("main-nav");

  // Get form and input elements
  var registerForm = document.getElementById("register-form");
  var nameInput = document.getElementById("full-name");
  var studentIdInput = document.getElementById("student-id");
  var emailInput = document.getElementById("university-email");
  var submitBtn = document.getElementById("submit-btn");
  var successBox = document.getElementById("form-success");

  // Get error message paragraph elements
  var nameError = document.getElementById("name-error");
  var studentIdError = document.getElementById("student-id-error");
  var emailError = document.getElementById("email-error");

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

  // Read saved users array safely from localStorage
  function getSavedUsers() {
    var rawData = localStorage.getItem(STORAGE_KEY);
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

  // Show an error message under an input field
  function showError(inputElement, errorElement, message) {
    errorElement.textContent = message;
    inputElement.classList.add("input-error");
    inputElement.setAttribute("aria-invalid", "true");
  }

  // Clear the error message under an input field
  function clearError(inputElement, errorElement) {
    errorElement.textContent = "";
    inputElement.classList.remove("input-error");
    inputElement.removeAttribute("aria-invalid");
  }

  // -----------------------------------------------------
  // 3. Individual Field Validation Functions
  // -----------------------------------------------------

  // Check Name: cannot be empty and must contain at least 3 letters
  function validateName() {
    var value = nameInput.value.trim();

    if (value === "") {
      showError(nameInput, nameError, "Please enter your name.");
      return false;
    }

    // Match all alphabet letters A-Z or a-z
    var letters = value.match(/[a-zA-Z]/g);
    if (!letters || letters.length < 3) {
      showError(nameInput, nameError, "Name must have at least 3 letters.");
      return false;
    }

    clearError(nameInput, nameError);
    return true;
  }

  // Check Student ID: format 26i-1234 and not already registered
  function validateStudentId() {
    var value = studentIdInput.value.trim().toLowerCase();
    // 2 digits, the letter i, a dash, and 4 digits
    var idPattern = /^\d{2}i-\d{4}$/;

    if (!idPattern.test(value)) {
      showError(
        studentIdInput,
        studentIdError,
        "Student ID must look like 26i-1234 (2 digits, i, dash, 4 digits)."
      );
      return false;
    }

    // Check if this Student ID is already in localStorage
    var users = getSavedUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].studentId && users[i].studentId.toLowerCase() === value) {
        showError(
          studentIdInput,
          studentIdError,
          "This Student ID is already registered."
        );
        return false;
      }
    }

    clearError(studentIdInput, studentIdError);
    return true;
  }

  // Check University Email: valid format and ends with @isb.nu.edu.pk
  function validateEmail() {
    var value = emailInput.value.trim().toLowerCase();
    var emailPattern = /^[a-z0-9._%+-]+@isb\.nu\.edu\.pk$/;

    if (!emailPattern.test(value)) {
      showError(
        emailInput,
        emailError,
        "Please enter a valid email ending with @isb.nu.edu.pk."
      );
      return false;
    }

    clearError(emailInput, emailError);
    return true;
  }

  // -----------------------------------------------------
  // 4. Remove Errors Immediately When User Fixes a Field
  // -----------------------------------------------------
  nameInput.addEventListener("input", function () {
    if (nameError.textContent !== "") {
      validateName();
    }
  });

  studentIdInput.addEventListener("input", function () {
    if (studentIdError.textContent !== "") {
      validateStudentId();
    }
  });

  emailInput.addEventListener("input", function () {
    if (emailError.textContent !== "") {
      validateEmail();
    }
  });

  // -----------------------------------------------------
  // 5. Handle Form Submission
  // -----------------------------------------------------
  registerForm.addEventListener("submit", function (event) {
    // Stop normal page reload so JavaScript can validate first
    event.preventDefault();

    // Hide any old success message
    successBox.hidden = true;
    successBox.textContent = "";

    // Run all three checks
    var isNameValid = validateName();
    var isIdValid = validateStudentId();
    var isEmailValid = validateEmail();

    // Stop if any field is invalid
    if (!isNameValid || !isIdValid || !isEmailValid) {
      return;
    }

    // Create the new user object
    var newUser = {
      name: nameInput.value.trim(),
      studentId: studentIdInput.value.trim().toLowerCase(),
      email: emailInput.value.trim().toLowerCase(),
      demoCode: "2026"
    };

    // Save the new user into localStorage
    var users = getSavedUsers();
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

    // Show green success message and disable button during redirect wait
    successBox.textContent = "Account created! Your demo login code is 2026.";
    successBox.hidden = false;
    submitBtn.disabled = true;

    // Wait 2 seconds, then go to 3126login.html
    setTimeout(function () {
      window.location.href = "3126login.html";
    }, 2000);
  });
});
