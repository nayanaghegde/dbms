document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded');

    const profileButton = document.getElementById('profileButton');
    const userDetailsContainer = document.getElementById('userDetailsContainer');

    if (profileButton && userDetailsContainer) {
        console.log('Profile button found');

        profileButton.addEventListener('click', function() {
            console.log('Profile button clicked');

            // Toggle the visibility of the user details container
            if (userDetailsContainer.style.display === 'block') {
                userDetailsContainer.style.display = 'none';
            } else {
                // Retrieve the userEmail from local storage
                const userEmail = localStorage.getItem('email');

                if (userEmail) {
                    console.log('User email found in local storage:', email);
                    // If userEmail exists, fetch user details
                    fetchUserDetails(userEmail);
                } else {
                    console.error('User email not found in local storage');
                    // Handle the case when userEmail is not found in local storage
                }
                userDetailsContainer.style.display = 'block';
            }
        });
    } else {
        console.error('Profile button or user details container not found');
        // Handle the case when profile button or user details container is not found
    }

    // Function to fetch user details
    function fetchUserDetails(userEmail) {
        fetch(`/api/userDetails/${userEmail}`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.json().then(data => {
                        throw new Error(data.error);
                    });
                }
            })
            .then(data => {
                console.log('User details:', data);

                // Clear previous content (if any)
                userDetailsContainer.innerHTML = '';

                // Create elements to display user details
                const userDetailsHeader = document.createElement('h2');
                userDetailsHeader.textContent = 'User Details';
                const userDetailsList = document.createElement('ul');

                // Add user details as list items
                const keys = Object.keys(data);
                keys.forEach(key => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${key}: ${data[key]}`;
                    userDetailsList.appendChild(listItem);
                });

                // Append elements to userDetailsContainer
                userDetailsContainer.appendChild(userDetailsHeader);
                userDetailsContainer.appendChild(userDetailsList);
            })
            .catch(error => {
                console.error('Error fetching user details:', error);
                // Handle the error appropriately
            });
    }
});

const loginButton = document.getElementById('loginButton');

loginButton.addEventListener('click', function() {
    loginAndRedirect();
});

function loginAndRedirect() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then(data => {
                throw new Error(data.error);
            });
        }
    })
    .then(data => {
        const userEmail = data.email; // Make sure 'email' is the correct field in your server response
        localStorage.setItem('userEmail', userEmail);
        fetchUserDetails(userEmail);
        const baseUrl = window.location.protocol + '//' + window.location.host;
        window.location.href = baseUrl + '/home.html';
    })
    .catch(error => {
        console.error('Error logging in:', error);
        alert(error.message);
    });
}

// Logout button click event
logoutButton.addEventListener("click", function() {
    // Clear the user's email from local storage
    localStorage.removeItem("userEmail");
    // Redirect to the login page
    window.location.href = "home.html";
});
