---

---
// Do All Dom Manipulation After The DOM content is full loaded
document.addEventListener("DOMContentLoaded", function() {
  (function main() {
    hashFilter()

// Event listener to Update UI on url parameter change
    window.addEventListener('locationchange', hashFilter)

  })()

})

function getCurrentSearch() {
  let currentSearch = location
    .search
    .slice(1, location.search.length)
    .replaceAll("+", "")
    .toLowerCase()
  if (! currentSearch) {
    return null
  }
  let currentSearchArr = currentSearch.split("&")
  currentSearchObj = {}
  currentSearchArr.forEach(search => {
    newArr = search.split("=")
    currentSearchObj[newArr[0]] = newArr[1].split(",")
  })
  return currentSearchObj
}

function hashFilter(e) {

  const currentSearch = getCurrentSearch()

  let cardContainers = document.querySelectorAll("[data-article-type]");
  cardContainers.forEach(card => {
    if (currentSearch) {
      currentSearch["category"].includes(card.dataset.articleType)
        ? card.style.display = "block"
        : card.style.display = "none";
    } else {
      card.style.display = "block"
    }

  })
  updateCheckBoxState(currentSearch)
  updateFilterTagDisplayState(currentSearch)
  attachEventListenerToFilterTags()
}

// new below
{% assign guides = site.guide-pages | sort: "title" | jsonify %}
{% assign externalGuides = site.data.internal.toolkitresources | sort: "title" | jsonify %}

let guides = JSON.parse(decodeURIComponent("{{ guides | jsonify | uri_escape }}"));
let externalGuides = JSON.parse(decodeURIComponent("{{ externalGuides | jsonify | uri_escape }}"));
const guidesArr = JSON.parse(guides)
const externalGuidesArr = JSON.parse(externalGuides)
let dropdownOptions = {}
externalGuidesArr.forEach(guide => {
  if (guide["practice-area"]) {
    dropdownOptions[guide["practice-area"]] = dropdownOptions[guide["practice-area"]]
      ? dropdownOptions[guide["practice-area"]] + 1
      : 1
  }
})
guidesArr.forEach(guide => {
  if (guide["practice-area"]) {
    dropdownOptions[guide["practice-area"]] = dropdownOptions[guide["practice-area"]]
      ? dropdownOptions[guide["practice-area"]] + 1
      : 1
  }
})
console.log(guidesArr, externalGuidesArr)

const filterList = document.querySelector("#filter-list")

function dropDownFilterComponent(categoryName, filterObject, filterTitle) {
  dropDownItemsArr = []
  const currentSearch = getCurrentSearch()
  
  for (const [key, value] of Object.entries(filterObject)) {
    dropDownItemsArr.push(`
            <li>
                <input id='${key}' name='${categoryName}'  type='checkbox' class='filter-checkbox'>
                <label for='${key}'>${key} <span> (${value})</span></label>
            </li>
            `)
  }

  return `
    <li class='filter-item'>
    <a class='category-title' style='text-transform: capitalize;'>
        ${filterTitle}
        <span id='counter_${categoryName}' class='number-of-checked-boxes'></span>
        <span class='labelArrow'> ∟ </span>
    </a>
    <ul class='dropdown' id='${
    categoryName.toLowerCase()
  }'>
        ${
    dropDownItemsArr.join("")
  }
    </ul>
    </li>
    `
}

function updateCheckBoxState(filterParams) {
  document.querySelectorAll("input[type='checkbox']").forEach(checkBox => {
    if (filterParams && checkBox.name in filterParams) {
      let args = filterParams[checkBox.name]
      args.includes(checkBox.id.replaceAll(" ", "").toLowerCase())
        ? checkBox.checked = true
        : checkBox.checked = false;
    } else {
      checkBox.checked = false
    }
  })
}

filterList.insertAdjacentHTML('beforeend', dropDownFilterComponent("category", dropdownOptions, "guide category"));

/**
 * Update the history state and the url parameters on checkbox changes
*/
function checkBoxEventHandler() {
  let incomingFilterData = document.querySelectorAll("input[type='checkbox']");
  let queryObj = {}
  incomingFilterData.forEach(input => {
    if (input.checked) {
      if (input.name in queryObj) {
        queryObj[input.name].push(input.id);
      } else {
        queryObj[input.name] = [];
        queryObj[input.name].push(input.id)
      }
    }
  })

  let queryString = Object
    .keys(queryObj)
    .map(key => key + '=' + queryObj[key])
    .join('&')
    .replaceAll(" ", "+");

// Update URL parameters
  window.history.replaceState(null, '', `?${queryString}`);
}

document.querySelectorAll("input[type='checkbox']").forEach(item => {
  item.addEventListener('change', checkBoxEventHandler)
});

// filter tag below

function attachEventListenerToFilterTags() {
  if (document.querySelectorAll('.filter-tag').length > 0) { // Attach event handlers to button
    document.querySelectorAll('.filter-tag').forEach(button => {
      button.addEventListener('click', filterTagOnClickEventHandler)
    })

// If there exist a filter-tag button on the page add a clear all button after the last filter tag button
    if (!document.querySelector('.clear-filter-tags')) {
      document.querySelector('.filter-tag:last-of-type').insertAdjacentHTML('afterend', `<a class="clear-filter-tags" style="white-space: nowrap;">Clear All</a>`);

// Attach an event handler to the clear all button
      document.querySelector('.clear-filter-tags').addEventListener('click', clearAllEventHandler);
    }
  }
}

function updateFilterTagDisplayState(filterParams){
  // Clear all filter tags
  document.querySelectorAll('.filter-tag').forEach(filterTag => filterTag.parentNode.removeChild(filterTag) );
  let clearAllButton = document.querySelector(".clear-filter-tags")
  if (clearAllButton) {
    clearAllButton.parentNode.removeChild(clearAllButton)
  }
  

  //Filter tags display hide logic
  if (filterParams) {
    for(const [key,value] of Object.entries(filterParams)){
      value.forEach(item =>{
          document.querySelector('.filter-tag-container').insertAdjacentHTML('afterbegin', filterTagComponent(key,item ) );

      })
    }
  }
}

function filterTagComponent(filterName, filterValue) {
  return `<div
                data-filter='${filterName},${filterValue}'
                class='filter-tag'
            >
                <span>
                ${
    filterName === "looking"
      ? "Role"
      : filterName
    }: ${filterValue}
                </span>
            </div>`
}

function filterTagOnClickEventHandler(){

    //Get filter parameters from the url
    const filterParams = Object.fromEntries(new URLSearchParams(window.location.search));

    //Transform filterparam object values to arrays
    Object.entries(filterParams).forEach( ([key,value]) => filterParams[key] = value.toLowerCase().replaceAll(" ", "").split(',') )

    let buttonClickedData = Object.fromEntries([ this.dataset.filter.split(",") ])

    for(const [button_filtername,button_filtervalue] of Object.entries(buttonClickedData)){
        if(filterParams[button_filtername].includes(button_filtervalue) ){
            filterParams[button_filtername].splice( filterParams[button_filtername].indexOf(button_filtervalue), 1);
            filterParams[button_filtername].length == 0 && delete filterParams[button_filtername];
        }
    }

    // Prepare Query String
    let queryString = Object.keys(filterParams).map(key => key + '=' + filterParams[key]).join('&').replaceAll(" ","+");

    //Update URL parameters
    window.history.replaceState(null, '', `?${queryString}`);
}

function clearAllEventHandler(){
    //Update URL parameters
    window.history.replaceState(null, '', '/?');
}