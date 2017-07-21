# Belp

## Description <br/> 
Belp was brainstormed with beer lovers in mind. We wanted a safe haven where true beer enthusists are able to come and express what they truly believe, feel, experience, and love when it comes to this revitalizing and refreshing beverage.  Belp, a web app that allows Users to research their favorite beers while leaving geniune heartfelt opinions. Users feel apart of the Belp movement as they sign in to create their own unique name and leave their own personal message about the beers they love the most.

## Technology Used <br/>
**FrontEnd**: HTML, CSS, Javascript<br/>
**BackEnd**: NodeJS, Express, MongoDB, Mongoose, Mlab<br/>
**Deployment**: Heroku, Travis <br/> 

## Documentation of API <br/>
* **GET** https://boiling-refuge-95989.herokuapp.com/beers<br/>
  * This allows you to get all the Beers in the database <br/>
  * This is used to display all the Beers in the frontend persistently</br>
* **POST** https://boiling-refuge-95989.herokuapp.com/beers<br/>
  * This allows you to post a Beer into the database <br/>
  * This is used to allow student users (who do not need to log in) to submit a Beer
* **PUT** https://boiling-refuge-95989.herokuapp.com/beers/:id <br/>
  * This allows Belp users that are logged in to update a Beer in the database <br/>
  * This is used to allow Belp users to update the status of a Beer <br/>
* **DELETE** https://boiling-refuge-95989.herokuapp.com/beers/:id <br/>
  * This allows you to delete a Beer from the database <br/>
  * This is used to allow student users to delete the Beer if they don't need help <br/>
  * This is used to allow Belp users to delete the Beer once they are finished with it <br/>
* **GET** https://boiling-refuge-95989.herokuapp.com/users <br/>
  * This allows Belp users that are logged in to get their username and fullName from the database <br/>
  * This is used to allow us to store the username and fullname into a localStorage once the Belp logs in <br/>
* **POST** https://boiling-refuge-95989.herokuapp.com/users/:id <br/>
  * This allows you to add a user into the database <br/>
  * This is used to allow people to sign up as a Belp user <br/>

## How To Use our code <br/>
* Fork it to your Repo
* Git clone the Repo link
```git clone [repo link]```
* Move into the project directory: 
```cd ~/YOUR_PROJECTS_DIRECTORY/YOUR_PROJECT_NAME```
* Run `npm install` in the terminal => install all the dependencies
* Make sure MongoDB is installed
* Run `mongod` in the terminal => to run the mongodb server 
* Run `npm start` in the terminal => to run the client and backend server
    * Starts a server running at http://localhost:8080


## Contributing 

* Please refer to [contributing.md](/contributing.md)

## Authors


* **Evan Harris** - [eharris128](https://github.com/eharris128)
* **William McKelvey** - [52lions06](https://github.com/52lions06)<br>


## Acknowledgments
* Thank you Thinkful for giving us the opportunity to develop our project throughout this week 
* Thanks to Chris for helping to teach us the back-end mechanics these past few weeks, hope all is well for you in the future
* Thanks to Elias, Joshua, and Sidharthchugh for all of their guidance and assistance to help improve our code.
* Thanks to cohort 12 for being so supportive 


