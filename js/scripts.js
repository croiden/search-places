(function (W) {
	'use strict';
	var searchPlace = {
		accessToken: "674884599526434|1v_qUeyO_C3UX4XwU-k7vU-i7mk",
		baseUrl: "https://graph.facebook.com",
		onLoad: function () {
			var self = this;
			var favPlaces = [];
			var searchField = document.querySelector('input[type="search"]');
			searchField.addEventListener('search', function (e) {
				self.clearPlaces();
				var searchVal = e.currentTarget.value;
				if (typeof searchVal === "string") {
					searchVal = searchVal.trim();
					if (searchVal !== '') {
						self.getPlaces(searchVal);
					}
				}
			});
			favPlaces = self.getFavPlaces();
			if (favPlaces === null) {
				self.setFavPlaces({});
			}else{
				self.updateFavCount(Object.keys(favPlaces).length);
			}
			self.addButtonEvents();
		},
		getPlaces: function (searchVal) {
			var self = this;
			var placesUrl = `${self.baseUrl}/search?type=place&fields=name&q=${searchVal}&access_token=${self.accessToken}`;
			self.makeHttpRequest(placesUrl, function (resp) {
				self.renderPlaces(JSON.parse(resp), searchVal);
			});
		},
		getPlace: function (placeId) {
			var self = this;
			var placeUrl = `${self.baseUrl}/v3.0/${placeId}?fields=phone,website,about,single_line_address&access_token=${self.accessToken}`;
			self.makeHttpRequest(placeUrl, function (resp) {
				self.renderMoreDetails(JSON.parse(resp), placeId);
			});
		},
		makeHttpRequest: function (url, callback) {
			var self = this;
			self.showMask();
			document.querySelector('div.page-error').style.display = "none";
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.onreadystatechange = function () {
				if (xmlHttp.readyState == 4){
					if (xmlHttp.status === 200) {  
						callback(xmlHttp.responseText);
						self.hideMask();
					 }else{
						self.hideMask();
						document.querySelector('div.page-error').style.display = "block";
					  	console.error("Error");
					 }
				}
			}
			xmlHttp.open("GET", url, true);
			xmlHttp.send(null);
		},
		renderPlaces: function (response, searchVal) {
			var self = this;
			delete self.next;
			delete self.previous;
			self.resources = {};
			var places = response.data;
			
			if (places.length > 0) {
				if(response.paging){
					self.next = response.paging.next;
					self.previous = response.paging.previous;
				}
				var ul = document.querySelector('ul');
				var placesEl = '';
				var favPlaces = self.getFavPlaces();
				places.forEach(function (place) {
					self.resources[place.id] = place;
					var isFav = favPlaces[place.id]? "checked" : "";
					placesEl = placesEl + self.getTemplate({
						"id":place.id,
						"name":place.name,
						"isFav":isFav
					});
				});
				ul.innerHTML = placesEl;
			} else {
				var emptyMes = document.querySelector('div.empty-message');
				emptyMes.innerHTML = `<i>Your search - <b>${searchVal}</b> - did not match any places.</i>`;
				emptyMes.style.display = "block";
			}
			document.querySelector('.footer').style.display = "block";
			self.next?self.toggleNxtBtn(false): self.toggleNxtBtn(true);
			self.previous?self.togglePrvBtn(false): self.togglePrvBtn(true);
		},
		renderFavPlaces: function(places){
			var self = this;
			self.resources = {};
			self.clearPlaces();
			var ul = document.querySelector('ul');
			var placesEl = '';
			Object.keys(places).forEach(function (placeId) {
				self.resources[placeId] = places[placeId];
				placesEl = placesEl + self.getTemplate({
					"id":placeId,
					"name":places[placeId].name,
					"isFav":"checked"
				});
			});
			ul.innerHTML = placesEl;
			document.querySelector('.footer').style.display = "none";
		},
		getTemplate: function(place){
			return `<li>
						<div class="place-row">
							<label>${place.name}</label><br>
							<div id="#more-det-${place.id}">
								<a data-id="${place.id}" class="show-more-details" onclick="SP.showMoreDetails(this)">Show more details</a>
							</div>
							<div class="fav-place">
								<input id="${place.id}" type="checkbox" onchange="SP.checkboxChange(this)" ${place.isFav}/>
								<label for="${place.id}"></label>
							</div>
						</div>
					</li>`;
		},
		clearPlaces: function () {
			document.querySelector('ul').innerHTML = '';
			document.querySelector('div.empty-message').style.display = "none";
			document.querySelector('div.page-error').style.display = "none";
			document.querySelector('.footer').style.display = "block";
		},
		checkboxChange: function(e){
			var self = this;
			var favPlaces = self.getFavPlaces();
			if (e.checked) {
				favPlaces[e.id] = {
					"id":e.id,
					"name":self.resources[e.id].name
				};
			} else {
				delete favPlaces[e.id];
			}
			self.setFavPlaces(favPlaces);
			self.updateFavCount(Object.keys(favPlaces).length);
		},
		showMoreDetails: function (e) {
			var self = this;
			self.getPlace(e.getAttribute("data-id"));
		},
		renderMoreDetails: function (moreDetails, placeId) {
			var moreDetOfPlace = '';
			var placeRow = document.getElementById('#more-det-' + placeId);
			moreDetOfPlace += moreDetails.phone ? `Phone: <a href="tel:${moreDetails.phone}">${moreDetails.phone}</a><br>` : '';
			moreDetOfPlace += moreDetails.website ? `<a href="${moreDetails.website}" target="_blank">${moreDetails.website}</a><br>` : '';		
			moreDetOfPlace += moreDetails.single_line_address ? `<p><b>Address: </b>${moreDetails.single_line_address}</p>` : '';
			moreDetOfPlace += moreDetails.about ? `<p><b>About: </b>${moreDetails.about}</p>` : '';
			placeRow.innerHTML = moreDetOfPlace;
		},
		getFavPlaces: function () {
			return JSON.parse(localStorage.getItem("my-fav-places"));
		},
		setFavPlaces: function (val) {
			localStorage.setItem("my-fav-places", JSON.stringify(val));
		},
		togglePrvBtn: function(disable){
			document.querySelector('.previous').disabled = disable;
		},
		toggleNxtBtn: function(disable){
			document.querySelector('.next').disabled = disable;
		},
		showMask: function(){
			document.querySelector('div.mask').style.display = "block";
		},
		hideMask: function(){
			document.querySelector('div.mask').style.display = "none";
		},
		updateFavCount: function(count){
			document.querySelector('button.my-fav span').textContent = count;
			if(count > 0){
				document.querySelector('button.my-fav').disabled = false;
			}else{
				document.querySelector('button.my-fav').disabled = true;
			}
		},
		addButtonEvents: function(){
			var self = this;
			document.querySelector('.next').addEventListener('click', function(){
				if(self.next){
					self.makeHttpRequest(self.next, function (resp) {
						self.renderPlaces(JSON.parse(resp));
					});
				}
			});
			document.querySelector('.previous').addEventListener('click', function(){
				if(self.previous){
					self.makeHttpRequest(self.previous, function (resp) {
						self.renderPlaces(JSON.parse(resp));
					});
				}
			});
			document.querySelector('.my-fav').addEventListener('click', function(){
				var favPlaces = self.getFavPlaces();
				if(Object.keys(favPlaces).length > 0){
					document.querySelector('input[type="search"]').value ='';
					self.renderFavPlaces(favPlaces);
				}
			});
		}
	};

	searchPlace.onLoad();
	
	W.SP = {
		checkboxChange: function(e){
			searchPlace.checkboxChange(e);
		},
		showMoreDetails: function(e){
			searchPlace.showMoreDetails(e);
		}
	};
})(window);
