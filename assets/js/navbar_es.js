/** DOCUMENTATION
 * This script is used to load the navbar template on every page of the website.
 */
document.addEventListener("DOMContentLoaded", function() {
    fetch('/assets/templates/navbar_es.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error loading navbar:', error));
});