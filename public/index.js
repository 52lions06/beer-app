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
  appState.userLoggedOut = null;
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
  console.log('when does this become undefined' + appState.currentUserId);
  $('.js-login-error').addClass('hidden');
  $('.js-loggedIn').addClass('hidden');

  const { beerData } = state;
  const loggedIn = state.userLoggedIn;
  const previousUserLoggedIn = state.previousUserLoggedIn;
  const reviewEntry = state.reviewEntry;

  if (state.userLoggedOut) {
    $('.js-login-page').removeClass('hidden');
    $('.js-signup-form').removeClass('hidden');
    $('.js-beer-form').addClass('hidden');
    $('.js-previousUserLoggedIn').addClass('hidden');
    $('.js-results').addClass('hidden');
    $('.js-logout-button').addClass('hidden');
  }

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
    $('.js-starter-page').removeClass('hidden');
    $('.js-previousUserLoggedIn').removeClass('hidden');
    $('.js-show-results-button').removeClass('hidden');
    $('.js-login-page').addClass('hidden');
    $('.js-signup-form').addClass('hidden');
    $('.js-signup-message').addClass('hidden');
    $('.js-logout-button').removeClass('hidden');
  }
  if (state.showSearchForm) {
    $('.js-beer-form').removeClass('hidden');
    $('.js-starter-page').addClass('hidden');
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
  let formattedReview;
  if (!localStorage.userId) {
    formattedReview = {
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
  } else if (localStorage.userId) {
    formattedReview = {
      id: appState.searchBeerId,
      reviews: [
        {
          author: {
            _id: localStorage.userId
          },
          comment: userReview,
          date: Date.now()
        }
      ]
    };
  }

  console.log(
    'this is what we need to set author._id to ' + localStorage.userId
  );
  // console.log(' the problem is here: ' + appState.searchBeerId);
  // console.log(' the problem is here: ' + localStorage.loginHash);
  console.log(' I bet this is undefined ' + appState.currentUserId);
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

// User Functions
function userLogout() {
  delete localStorage.loginHash;
  delete localStorage.userId;
  appState.beerData = {};
  appState.previousUserLoggedIn = false;
  appState.userLoggedOut = true;
  $('.js-show-results-button').addClass('hidden');
}

function loginUser(userData) {
  const loginHash = btoa(userData.username + ':' + userData.password);
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
        localStorage.loginHash = loginHash;
        localStorage.userId = res._id;
        updatesStateUserId(res._id);
        updatesStatePreviousUserLogin();
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
  stateRender(appState);
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
