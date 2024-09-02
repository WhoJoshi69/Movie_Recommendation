from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace with your React app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_BASE_URL = "https://api.themoviedb.org/3"


async def fetch_movies(url):
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()


@app.get("/recommend")
async def get_movies(query: str):
    try:
        search_url = f"{TMDB_BASE_URL}/search/movie?api_key={TMDB_API_KEY}&query={query}&language=en-US&page=1&include_adult=false"
        data = await fetch_movies(search_url)

        movies = []
        for movie in data['results'][:15]:  # Limit to 15 movies
            poster_path = movie['poster_path']
            poster_url = f"https://image.tmdb.org/t/p/w200{poster_path}" if poster_path else None

            movies.append({
                "id": movie['id'],
                "title": movie['title'],
                "year": movie['release_date'][:4] if movie['release_date'] else None,
                "genre_ids": movie['genre_ids'],
                "posterUrl": poster_url,
                "overview": movie['overview']
            })

        # Fetch genres
        genres_url = f"{TMDB_BASE_URL}/genre/movie/list?api_key={TMDB_API_KEY}&language=en-US"
        genres_data = await fetch_movies(genres_url)
        genres = {genre['id']: genre['name'] for genre in genres_data['genres']}

        # Add genre names to movies
        for movie in movies:
            movie['genres'] = [genres[genre_id] for genre_id in movie['genre_ids'] if genre_id in genres]
            del movie['genre_ids']

        return {"movies": movies}
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
