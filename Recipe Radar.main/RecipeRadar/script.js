const SPOONACULAR_API_KEY = "YOUR API KEY "; // Replace with your Spoonacular API key
const YOUTUBE_API_KEY = "YOUR API KEY"; // Replace with your YouTube Data API key

function getMealList() {
    const ingredients = document.getElementById("search-input").value.trim();
    const mood = document.getElementById("mood-select").value;
    
    if (!ingredients) {
        alert("Please enter at least one ingredient.");
        return;
    }

    let maxReadyTime = mood === "quick" ? 30 : mood === "healthy" ? 60 : 120;
    
    fetch(`https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${ingredients}&maxReadyTime=${maxReadyTime}&addRecipeInformation=true&number=10&apiKey=${SPOONACULAR_API_KEY}`)
        .then(response => response.json())
        .then(data => {
            let html = "";
            if (data.results && data.results.length > 0) {
                data.results.forEach(recipe => {
                    html += `
                        <div class="meal-item" data-id="${recipe.id}">
                            <div class="meal-img">
                                <img src="${recipe.image}" alt="${recipe.title}" />
                            </div>
                            <div class="meal-name">
                                <h3>${recipe.title}</h3>
                                <p>Cooking Time: ${recipe.readyInMinutes} mins</p>
                                <a href="#" class="recipe-btn" data-id="${recipe.id}">Get Recipe</a>
                            </div>
                        </div>
                    `;
                });
            } else {
                html = "<p>No recipes found. Try different ingredients.</p>";
            }
            document.getElementById("meal").innerHTML = html;

            document.querySelectorAll(".recipe-btn").forEach(button => {
                button.addEventListener("click", event => {
                    event.preventDefault();
                    const recipeId = event.target.getAttribute("data-id");
                    getRecipeDetails(recipeId);
                });
            });
        })
        .catch(err => console.error(err));
}

function getRecipeDetails(recipeId) {
    fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}`)
        .then(response => response.json())
        .then(data => {
            const mealDetails = document.querySelector(".meal-details-content");
            const instructions = data.instructions || "Instructions not available.";
            const ingredients = data.extendedIngredients
                ? data.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join("")
                : "Ingredients list is unavailable.";
            
            mealDetails.innerHTML = `
                <h2>${data.title}</h2>
                <img src="${data.image}" alt="${data.title}" />
                <h3>Ingredients:</h3>
                <ul>${ingredients}</ul>
                <h3>Instructions:</h3>
                <p>${instructions}</p>
                <div id="video-container"></div>
            `;
            document.querySelector(".meal-details").classList.add("showRecipe");
            
            getYouTubeVideo(data.title);
        })
        .catch(err => console.error(err));
}

function getYouTubeVideo(recipeTitle) {
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${recipeTitle}+recipe&type=video&key=${YOUTUBE_API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.items.length > 0) {
                const videoId = data.items[0].id.videoId;
                document.getElementById("video-container").innerHTML = `
                    <h3>Watch Video:</h3>
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                `;
            } else {
                document.getElementById("video-container").innerHTML = "<p>No video found.</p>";
            }
        })
        .catch(err => console.error(err));
}

document.getElementById("recipe-close-btn").addEventListener("click", () => {
    document.querySelector(".meal-details").classList.remove("showRecipe");
});

document.getElementById("search-btn").addEventListener("click", getMealList);
