'use strict';

let appState = {
  beerData: {},
  previousUserLoggedIn: false,
  userLoggedIn: false,
  userQueryInDb: false,
  reviewEntry: false,
  searchBeerId: '',
  currentUserId: '',
  showSearchForm: false,
  userLoggedOut: null
};
// State Modification Functions
if (localStorage.loginHash) {
  appState.previousUserLoggedIn = true;
}

function resetState() {
  appState.reviewEntry = false;
  appState.userLoggedIn = false;
  appState.userQueryInDb = false;
  appState.searchBeerId = '';
  appState.showSearchForm = false;
}

function updatesStateSearchFormStatus() {
  appState.showSearchForm = true;
}
function updatesStateUserLogin() {
  appState.userLoggedIn = !appState.userLoggedIn;
}
function updatesStatePreviousUserLogin() {
  appState.previousUserLoggedIn = true;
}
function userLogout() {
  delete localStorage.loginHash;
  appState.previousUserLoggedIn = false;
  appState.userLoggedOut = true;
}
function updatesStateUserId(userId) {
  appState.currentUserId = userId;
}
function updatesStateBeerData(userSearchBeer) {
  appState.beerData = userSearchBeer;
}

function updatesStateQueryStatus(state) {
  state.userQueryInDb = true;
}

function updatesStateSearchBeerId(searchBeerId) {
  appState.searchBeerId = searchBeerId;
}

function updatesStateReviewStatus() {
  if (!appState.reviewEntry) {
    appState.reviewEntry = true;
  } else if (appState.reviewEntry) {
    appState.reviewEntry = false;
  }
}

function updatesStateReviewToFalse() {
  appState.reviewEntry = false;
}

// Render Functions

function renderErrorMessage(status) {
  if (status === 200) {
    let beerNotInDatabaseError = `
    <h3> The beer you searched for does not appear to be in the database. <br> Please try again. </h3>
    `;
    $('.js-results').html(beerNotInDatabaseError).removeClass('hidden');
  } else if (status === 422) {
    let usernameTakenError = `
      <h3> That username is taken, please try a different one.</h3>
    `;

    $('.js-login-error').html(usernameTakenError).removeClass('hidden');
    $('.js-loggedIn').addClass('hidden');
  }
}

function stateRender(state) {
  console.log('hopeful: ' + localStorage.loginHash);
  // console.log('User is now logged in: ' + state.userLoggedIn);
  // console.log('Previous User is now logged in: ' + state.previousUserLoggedIn);
  if (state.userLoggedOut) {
    $('.js-login-page').removeClass('hidden');
    $('.js-signup-form').removeClass('hidden');
    $('.js-previousUserLoggedIn').addClass('hidden');
  }

  if (state.showSearchForm) {
    $('.js-beer-form').removeClass('hidden');
    $('.js-starter-page').addClass('hidden');
  }

  $('.js-login-error').addClass('hidden');
  $('.js-loggedIn').addClass('hidden');

  const { beerData } = state;
  const loggedIn = state.userLoggedIn;
  const previousUserLoggedIn = state.previousUserLoggedIn;
  const reviewEntry = state.reviewEntry;

  if (reviewEntry) {
    let reviewEntryTemplate = `
      <form action="#" id="review-form" name="reviewForm" class="js-review-form">
			<fieldset>
				<label class="input-label" for="review">Please leave your review below: </label>
				<input class="input-box" type="text" name="review" id="review" required placeholder="I really enjoyed...">
			</fieldset>
			<button class ="button submit-button" type="submit">Submit Review</button>
		</form>
    `;
    $('.js-results').append(reviewEntryTemplate);
  } else if (beerData.name !== undefined) {
    let beerList = beerData.reviews
      .map(function(review, i) {
        return `
    <li><p>${review
    .author.firstName} ${review.author.lastName}: ${review.comment}</p></li>
    `;
      })
      .join('');

    let beerInfoTemplate = `
    <h2> Beer Name: ${beerData.name}</h2
    <p> Style: ${beerData.style}</p>
    <p> ABV: ${beerData.abv}</p>
    <p> IBU: ${beerData.ibu}</p>
    <p> Description: ${beerData.description}</p>
    <p> Brewery: ${beerData.brewery}</p>
    <h3> Reviews: </h3>
    <ul> ${beerList} </ul>
    <button class="js-review" type="button"> Click to leave a review </button>
    `;

    $('.js-results').html(beerInfoTemplate).removeClass('hidden');
  } else if (loggedIn) {
    $('.js-loggedIn').removeClass('hidden');
    $('.js-show-results-button').removeClass('hidden');
    $('.js-logout-button').removeClass('hidden');
  } else if (previousUserLoggedIn) {
    $('.js-previousUserLoggedIn').removeClass('hidden');
    $('.js-show-results-button').removeClass('hidden');
    $('.js-login-page').addClass('hidden');
    $('.js-signup-form').addClass('hidden');
    $('.js-signup-message').addClass('hidden');
    $('.js-logout-button').removeClass('hidden');
  }
}

// Data Retrieval functions

function fetchBeerData(userQuery) {
  let status;
  fetch('/beers')
    .then(res => {
      status = res.status;
      return res.json();
    })
    .then(data => {
      for (let i = 0; i < data.beers.length; i++) {
        let currentBeer = data.beers[i];
        if (currentBeer.name === userQuery) {
          updatesStateSearchBeerId(currentBeer.id);
          updatesStateQueryStatus(appState);
          updatesStateBeerData(currentBeer);
          stateRender(appState);
        }
      }
      if (!appState.userQueryInDb) {
        renderErrorMessage(status);
      }
    })
    .catch(err => {
      console.error(err);
    });
}

function sendReviewData(userReview) {
  let formattedReview = {
    id: appState.searchBeerId,
    reviews: [
      {
        author: {
          _id: appState.currentUserId
        },
        comment: userReview,
        date: Date.now()
      }
    ]
  };
  // console.log('problem is here: ' + localStorage.loginHash);
  // Password is hardcoded in for authorization
  const opts = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + localStorage.loginHash //connect all of the endpoints that connect to the backend
    },
    method: 'PUT',
    body: JSON.stringify(formattedReview)
  };
  fetch(`/beers/${appState.searchBeerId}`, opts)
    .then(function(res) {
      updatesStateReviewToFalse();
      return res;
    })
    .then(function(res) {
      fetchBeerData(appState.beerData.name);
    })
    .catch(err => {
      return err;
    });
}

// User Endpoint Functions
function loginUser(userData) {
  const loginHash = btoa(userData.username + ':' + userData.password); //we are passing this in to use the Hash on 198
  console.log('login Hash' + loginHash);
  const opts = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + loginHash
    },
    method: 'GET'
  };
  fetch('/users/login', opts)
    .then(function(res) {
      return res.json();
    })
    .then(function(res) {
      if (res.status === 422) {
        renderErrorMessage(res.status);
      } else {
        // These are the function calls that were made after the code review. Need to confirm logic flow
        console.log('login hash here' + loginHash);
                localStorage.loginHash = loginHash;
        updatesStateUserId(res._id);
        updatesStatePreviousUserLogin();
        // updatesStateUserLogin();
        $('.js-demo').addClass('hidden');
        stateRender(appState);
        return res;
      }
    })
    .catch(err => {
      return err;
    });
}
function createUser(userData) {
  const loginHash = btoa(userData.username + ':' + userData.password);
  const opts = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(userData)
  };
  fetch('/users', opts)
    .then(function(res) {
      return res.json();
    })
    .then(function(res) {
      if (res.status === 422) {
        renderErrorMessage(res.status);
      } else {
        localStorage.loginHash = loginHash;
        updatesStateUserId(res._id);
        updatesStateUserLogin();
        $('.js-login-page').addClass('hidden');
        $('.js-demo').addClass('hidden');
        stateRender(appState);
        return res;
      }
    })
    .catch(err => {
      return err;
    });
}

// Event Listener Functions

$(function() {
  // stateRender(appState);
  $('.js-logout-button').on('click', function(event) {
    resetState();
    event.preventDefault();
    userLogout();
    stateRender(appState);
  });

  $('.js-login-form').on('submit', function(event) {
    resetState();
    const userFields = $('.js-login-form input');
    event.preventDefault();
    let userData = {};

    $.each(userFields, function(i, field) {
      userData[field.name] = field.value;
    });
    loginUser(userData);
    userFields.val('');
  });
  $('.js-signup-form').on('submit', function(event) {
    resetState();
    const userFields = $('.js-signup-form input');
    event.preventDefault();
    let userData = {};

    $.each(userFields, function(i, field) {
      userData[field.name] = field.value;
    });
    createUser(userData);
    userFields.val('');
  });

  $('.js-beer-form').submit(function(event) {
    resetState();
    event.preventDefault();
    let userQuery = $('#beer-name').val();
    fetchBeerData(userQuery);
    $('#beer-name').val('');
  });

  $('.js-results').on('click', '.js-review', function(event) {
    event.preventDefault();
    updatesStateReviewStatus();
    stateRender(appState);
  });

  $('.js-results').on('submit', '.js-review-form', function(event) {
    event.preventDefault();
    let userReview = $('#review').val();
    sendReviewData(userReview);
    $('#review').val('');
  });

  $('.js-show-results-button').on('click', function(event) {
    event.preventDefault();
    updatesStateSearchFormStatus();
    stateRender(appState);
  });
});
