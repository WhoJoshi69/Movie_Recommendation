import asyncio
import time
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv
import requests

from backend.constants import GENRES
from backend.movie_gen import createPrompts

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

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
        try:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error occurred while fetching movies: {e}")
            raise
        except Exception as e:
            logger.error(f"An error occurred while fetching movies: {e}")
            raise


async def fetch_all_movies(urls):
    try:
        tasks = [fetch_movies(url) for url in urls]
        responses = await asyncio.gather(*tasks)
        return [movie["results"][0] for movie in responses if movie["results"]]
    except Exception as e:
        logger.error(f"An error occurred while fetching all movies: {e}")
        raise


@app.get("/recommend")
async def get_movies(query: str):
    try:
        start_time = time.time()
        content = createPrompts(query)
        content = query + "," + content

        search_urls = [f"{TMDB_BASE_URL}/search/movie?api_key={TMDB_API_KEY}&query={record}&language=en-US&page=1&include_adult=true"
                       for record in content.split(",")]
        movies_data = await fetch_all_movies(search_urls)

        movies = []
        for movie in movies_data:
            poster_path = movie["poster_path"]
            poster_url = f"https://image.tmdb.org/t/p/w600_and_h900_bestv2/{poster_path}" if poster_path else None
            if poster_url:
                movies.append({
                    "id": movie['id'],
                    "title": movie['title'],
                    "year": movie['release_date'][:4] if movie['release_date'] else None,
                    "genre_ids": movie['genre_ids'],
                    "posterUrl": poster_url,
                    "overview": movie['overview']
                })

        # Add genre names to movies
        for movie in movies:
            movie['genres'] = [GENRES[genre_id] for genre_id in movie['genre_ids'] if genre_id in GENRES]
            del movie['genre_ids']
        print(f"time taken is {time.time() - start_time}")
        return {"movies": movies[1:],
                "given_movie": movies[0]}
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error occurred: {e}")
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)