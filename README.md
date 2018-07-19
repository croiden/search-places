# search-places

This project is used to search different places using the Facebook public API.

How to use:

1. Make use of the search input box to look for different places. 
2. To favourite any place click on the heart icon, click again to unfavourite the place.
3. To see more details about the place, user can click on the "Show more details" link against each place.
4. Clicking on "Favourite(s)" button will list the favourite places of the user. 
5. Use the next or previous button's to load more search results.

Not Implemented:

1. Sorting search results: The API is returning the paginated data and there is no use of applying sorting on paginated data.

Known Limitations:

1. Clicking on "Favourite(s)" button will render all the favourite places without pagination. In case of huge volume, the browser response may be slow.
2. Clicking on "Previous" button will always navigate to the first page. Looks like the previous cursor returned by FB API seems to be wrong or might be I am missing something. 


