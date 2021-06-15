const SmartyStreetsSDK = require("smartystreets-javascript-sdk");
const SmartyStreetsCore = SmartyStreetsSDK.core;
const Lookup = SmartyStreetsSDK.usAutocompletePro.Lookup;
import { Loader } from "@googlemaps/js-api-loader";

// This is the loader from the google sdk api
const loader = new Loader({
  apiKey: "AIzaSyAtX6_7dXbMVatPvsXef4906IezRlggkM4",
  version: "weekly",
});

let globalAddreses = [];
let address;
const query = window.matchMedia('(min-width: 992px)');
const map = document.getElementById("map-quote");
const pano = document.getElementById("pano-quote");

query.addEventListener("change", (e) => {
  if(e.matches) {
    if(window.getComputedStyle(map).getPropertyValue('display') == 'none') {
      document.getElementById('pano-quote').setAttribute('style', 'height: 100% !important');
    }
    if(window.getComputedStyle(pano).getPropertyValue('display') == 'none') {
      document.getElementById('map-quote').setAttribute('style', 'height: 100% !important');
    }
  } else {
    if(window.getComputedStyle(map).getPropertyValue('display') == 'none') {
      document.getElementById('pano-quote').setAttribute('style', 'height: 500px !important');
    }
    if(window.getComputedStyle(pano).getPropertyValue('display') == 'none') {
      document.getElementById('map-quote').setAttribute('style', 'height: 500px !important');
    }
  }
})

/**
 * Set marker on the map
 *
 * @param   {Object}  geocoder    Geocoder instance
 * @param   {Object}  resultsMap  Google map instance in the DOM
 * @param   {string}  address     Address build with SmartyStreet
 *
 * @return  {HTMLDivElement}
 */
function geocodeAddress(geocoder, resultsMap, address) {
  geocoder.geocode(
    {
      address: address,
    },
    (results, status) => {
      if (status === "OK") {
        resultsMap.setCenter(results[0].geometry.location);
        new google.maps.Marker({
          map: resultsMap,
          position: results[0].geometry.location,
        });
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    }
  );
}

/**
 * This function makes the request to the Smarty Address API
 *
 * @param   {String}  text  The text of the input field
 *
 * @return  {void}        [return description]
 * For More Reference here: https://github.com/smartystreets/smartystreets-javascript-sdk/blob/master/examples/us_autocomplete_pro.js
 */
const smartStreetLook = (text) => {
  const credentials = new SmartyStreetsCore.SharedCredentials(
    "71672805381907944"
  );
  let client = SmartyStreetsCore.buildClient.usAutocompletePro(credentials);
  // *** Using Filter and Prefer ***

  let lookup = new Lookup(text);

  lookup.maxResults = 10;
  lookup.preferRatio = 33;

  client
    .send(lookup)
    .then(function (response) {
      globalAddreses = [...response.result];
      createMoreOptions();
    })
    .catch(console.log);
};

/**
 * Remove all the options in the data list
 *
 * @param   {HTMLDataElement}  selectBox  The DataList Element
 *
 * @return  {void}
 */
const removeAll = (selectBox) => {
  for (var i of selectBox.options) {
    i.remove();
  }
};

/**
 * Create options for the data list in the request quote option
 *
 * @param   {[Object]}  response  array of addresses
 *
 * @return  {void}            [void]
 */
const createMoreOptions = () => {
  const searchAddressList = document.getElementById("search-address-list");
  removeAll(searchAddressList);
  globalAddreses.forEach((suggestion) => {
    const newOption = document.createElement("option");
    newOption.setAttribute(
      "value",
      `${suggestion.streetLine} ${
        suggestion.secondary && suggestion.secondary
      }, ${suggestion.city}, ${suggestion.state}, ${suggestion.zipcode}`
    );
    newOption.className += "option-search-address-list";

    searchAddressList.appendChild(newOption);
  });
};

/**
 * Get the latitude and longitude with geocoder
 *
 * @param   {Object}  geocoder  Geocoder instance
 * @param   {string}  address   Address build with SmartyStreet
 *
 * @return  {Object}
 */
const getGeocodeLatLng = (address) => {
  let geocoder = new google.maps.Geocoder();
  return new Promise((resolve) => {
    geocoder.geocode(
      {
        address: address,
      },
      (results, status) => {
        if (status === "OK") {
          resolve({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
        }
      }
    );
  });
};

const streetViewData = (data, status) => {
  // Initialize map
  let map = new google.maps.Map(document.getElementById("map-quote"), {
    zoom: 17,
  });

  if (status === google.maps.StreetViewStatus.OK) {
    document.getElementById('map-quote').setAttribute('style', 'display: none !important');
    if(query.matches) {
      document.getElementById('pano-quote').setAttribute('style', 'height: 100% !important');
    } else {
      document.getElementById('pano-quote').setAttribute('style', 'height: 500px !important');
    }

    let panorama = new google.maps.StreetViewPanorama(document.getElementById('pano-quote'));
    const marker = new google.maps.Marker({
      position: data.location.latLng,
      map: map,
      title: data.location.description,
    });

    panorama.setPano(data.location.pano);
    panorama.setPov({
      heading: 270,
      pitch: 0,
    });
    panorama.setVisible(true);
    google.maps.event.addListener(marker, "click", () => {
      const markerId = data.location.pano;
      panorama.setPano(markerId);
      panorama.setPov({
        heading: 270,
        pitch: 0,
      });
      panorama.setVisible(true);
    });
  } else {
    // Hiding StreetView Map
    document.getElementById('pano-quote').setAttribute('style', 'display: none !important');
    if(query.matches) {
      document.getElementById('map-quote').setAttribute('style', 'height: 100% !important');
    } else {
      document.getElementById('map-quote').setAttribute('style', 'height: 500px !important');
    }

    // Initializing Geocoder
    let geocoder = new google.maps.Geocoder();

    // Let's do the geolocation
    geocodeAddress(geocoder, map, address);
  }
};

/**
 * [This function takes the search input for address and fetch the list of addresses and populate the inputs]
 *
 * @return  {void}  [void]
 */
const searchInSmartyAddress = () => {
  const searchInput = document.querySelector("#search-address");
  const searchAddressList = document.getElementById("search-address-list");

  if (searchInput && searchAddressList) {
    loader.load().then(() => {
      searchInput.addEventListener("input", (e) => {
        if (e.target.value.length > 0) {
          const timerId = setTimeout(smartStreetLook(e.target.value), 1000);

          clearInterval(timerId);
        }
      });
      searchInput.addEventListener("change", function (e) {
        if (globalAddreses.length > 0 && e.target.value) {
          // HERE NEW

          const validAddress = globalAddreses.filter(
            (suggestionAddress) =>
              e.target.value ===
              `${suggestionAddress.streetLine} ${
                suggestionAddress.secondary && suggestionAddress.secondary
              }, ${suggestionAddress.city}, ${suggestionAddress.state}, ${
                suggestionAddress.zipcode
              }`
          );
          if (!validAddress.length) {
            const [addr, city, state, zipcode] = e.target.value.split(",");

            /** Here set the values for the other inputs even if the address was not found*/
            setValuesToTheForm({
              streetLine: addr,
              secondary: "",
              city,
              state,
              zipcode,
            });

            // Erase Placeholder
            document
              .getElementById("placeholder-text")
              .setAttribute("style", "display: none !important");
            let container = document.getElementById("map-container");
            container.classList.remove("align-items-center");

            // Assign Address
            address = `${addr}, ${city}, ${state}, ${zipcode}`;

            // Get Coordinate with Geocode
            const coordinates = getGeocodeLatLng(address);
            const streetViewService = new google.maps.StreetViewService();

            coordinates.then((coord) => {
              streetViewService.getPanoramaByLocation(
                { lat: coord.lat, lng: coord.lng },
                50,
                streetViewData
              );
            });
            return;
          }

          /** Here set the values for the other inputs */
          setValuesToTheForm(validAddress[0]);

          // Erase Placeholder
          document
            .getElementById("placeholder-text")
            .setAttribute("style", "display: none !important");
          let container = document.getElementById("map-container");
          container.classList.remove("align-items-center");

          // Assign Address
          address = `${validAddress[0].streetLine} ${
            validAddress[0].secondary && validAddress[0].secondary
          }, ${validAddress[0].city}, ${validAddress[0].state}, ${
            validAddress[0].zipcode
          }`;

          // Get Coordinate with Geocode
          const coordinates = getGeocodeLatLng(address);
          const streetViewService = new google.maps.StreetViewService();

          coordinates.then((coord) => {
            streetViewService.getPanoramaByLocation(
              { lat: coord.lat, lng: coord.lng },
              50,
              streetViewData
            );
          });
        } else {
          document.getElementById("search-address").value = e.target.value;
        }
        searchInput.blur();
        removeAll(searchAddressList);
        globalAddreses = [];
      });
    });
  }
};

const setValuesToTheForm = (fullAddress) => {
  document.getElementById("search-address").value =
    fullAddress.streetLine || "";
  document.getElementById("quote-address2").value = fullAddress.secondary || "";
  document.getElementById("quote-city").value = fullAddress.city || "";
  document.getElementById("quote-state").value = fullAddress.state || "";
  document.getElementById("quote-zip").value = fullAddress.zipcode || "";
};

export default searchInSmartyAddress;
