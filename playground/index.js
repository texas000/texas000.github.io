   
// console.log('navigator', navigator)

// function success(param) {
//     console.log('success: ',param)
// }

// function fail(param) {
//     console.log('fail:', param)
// }


// console.log(navigator.geolocation.getCurrentPosition(success, fail, {enableHighAccuracy: true}))


const colors = [...document.querySelectorAll('.color-list li')]

colors.forEach((color) => {
  //   using innerText for ease but would likely use data attributes for more specific colors
  const colorValue = color.innerText;
  color.style.background = colorValue;
})