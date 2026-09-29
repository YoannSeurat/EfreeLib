# EfreeLib

## Explanation

The goal of this project is to design and develop a Vue.js application that allows users to manage a collection of books or movies.

The project combines UI/UX design, Vue.js, Vue Router, Vuex, an external API, and localStorage.

Users will search for books or movies using an API, add them to their personal library, manage favorites, and track their reading or watching status.

####  Example Concept:

A user searches for "Interstellar".

The application sends a request to a movie API and retrieves:
- Title: Interstellar
- Director: Christopher Nolan
- Year: 2014
- Poster
- Description

The user can then add the movie to their personal library.

 
## Part 1: UI/UX Design
 

Before developing the application, design the user experience.

- Create one main persona with goals, frustrations, and needs.
- Define a problem statement using “How might we help...?”
- Create 2–3 low-fidelity wireframes.
- Create a clickable Figma prototype.

The main user flow should be:
Search → Results → Add → Library
 

## Part 2: API Search
 

Use an external API to retrieve information about books or movies.

You can use:

- Books: Google Books API or Open Library API
- Movies: OMDb API or TMDB API

The application must display at least:
- Title
- Author or director
- Year
- Cover or poster
 
#### Exercise 1: Search using an API
Create a search field.
Send a request to the selected API.
Display the results dynamically.
Allow the user to select an item.
 
## Part 3: Library
Create a /library page.

Users must be able to:

- Add an item from the API results.
- View their collection.
- Delete an item.
- Mark a book as read/unread or a movie as - watched/unwatched.
- Add or remove an item from favorites.
 
#### Exercise 2: Manage the Library
Use Vuex to store and manage the user's collection.

Your store should use:

- state
- getters
- mutations
- actions
 
## Part 4: Favorites
Create a /favorites page that displays only favorite items.

Use a Vuex getter to retrieve the favorite books or movies.

 

#### Exercise 3: Favorites
Add a favorite property to each item.
Create a mutation to change the favorite status.
Create a getter to retrieve favorites.
Display them on the /favorites page.
 
## Part 5: Data Persistence
Use localStorage to save the user's collection.

The collection must remain available after refreshing the application.

 

#### Exercise 4: localStorage
Save the Vuex library in localStorage.
Load the saved library when the application starts.
Verify that refreshing the page does not delete the collection.
 

## Final Requirements

The project must use:

- Vue.js
- Vue Router
- Vuex
- External API
- localStorage
- Figma

Students must submit:
- Figma prototype
- Git repository
- README with installation instructions and the API used

Each team will present their persona, wireframes, Figma prototype, API integration, and final Vue.js application.

## Part 6: Advanced Features
Students who finish the main requirements can implement minimum 4 of this additional features.

#### Filters and sorting

Filter by favorites.
Filter by watched/read status.
Sort by title, year, or date added.
Add a search field inside the personal library.
#### Item details page

Create a dynamic route such as /movie/:id or /book/:id.
Display additional information from the API.
Use Vue Router route parameters.
#### Rating system

Allow users to give a personal rating from 1 to 5.
Display the rating in the library.
Store the rating with Vuex and localStorage.
#### Personal notes

Allow users to write a short review or personal note for each item.
The note must persist after refreshing the application.
#### Library statistics

Total number of items.
Number watched/read.
Number remaining.
Number of favorites.
Average personal rating.
#### Better API experience

Loading indicator while searching.
Error message if the API request fails.
“No results found” state.
Pagination or “Load more” button.
Prevent duplicate items from being added to the library.
#### UI/UX improvements

Responsive mobile/desktop interface.
Dark/light mode.
Empty states for Library and Favorites.
Confirmation before deleting an item.
Toast/notification after adding or removing an item.