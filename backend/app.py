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

# Add CORS middleware with more permissive settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_BASE_URL = "https://api.themoviedb.org/3"


@app.get("/recommend")
async def get_movies(query: str):
    try:
        overall_start_time = time.time()

        # Fetch autocomplete results
        autocomplete_url = f"http://localhost:8000/autocomplete?term={query}"
        async with httpx.AsyncClient() as client:
            response = await client.get(autocomplete_url)
            autocomplete_data = response.json()

        if not autocomplete_data["movie"]:
            raise HTTPException(status_code=404, detail="No movie found")

        # Get the URL of the first movie from autocomplete results
        movie_url = f"https://bestsimilar.com{autocomplete_data['movie'][0]['url']}"

        # Fetch similar movies and movie details concurrently
        async with httpx.AsyncClient() as client:
            similar_movies_task = asyncio.create_task(fetch_similar_movies(client, movie_url))
            similar_movies = await similar_movies_task

        # Limit the number of similar movies to process
        # similar_movies = similar_movies[:10]  # Process only top 10 similar movies

        # Fetch movie details concurrently
        movies = await fetch_movie_details(similar_movies)

        overall_time = time.time() - overall_start_time
        print(f"Total time taken: {overall_time:.2f} seconds")

        return {"movies": movies[1:], "given_movie": movies[0]}
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error occurred: {e}")
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def fetch_similar_movies(client, movie_url):
    response = await client.get(movie_url)
    html_content = response.text
    return extract_similar_movies(html_content)

async def fetch_movie_details(movie_titles):
    async with httpx.AsyncClient() as client:
        tasks = [fetch_single_movie_detail(client, title) for title in movie_titles]
        movies = await asyncio.gather(*tasks)
    return [movie for movie in movies if movie is not None]

async def fetch_single_movie_detail(client, title):
    clean_title = title.split('(')[0].strip()
    search_url = f"{TMDB_BASE_URL}/search/movie?api_key={TMDB_API_KEY}&query={clean_title}&language=en-US&page=1&include_adult=true"
    response = await client.get(search_url)
    data = response.json()
    if data["results"]:
        movie = data["results"][0]
        poster_path = movie.get("poster_path")
        if poster_path:
            return {
                "id": movie['id'],
                "title": movie['title'],
                "year": movie['release_date'][:4] if movie.get('release_date') else None,
                "genres": [GENRES.get(genre_id) for genre_id in movie.get('genre_ids', []) if genre_id in GENRES],
                "posterUrl": f"https://image.tmdb.org/t/p/w600_and_h900_bestv2/{poster_path}",
                "overview": movie['overview']
            }
    return None

def extract_similar_movies(html_content):
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html_content, 'html.parser')
    script_tag = soup.find('script', text=lambda string: string and 'aMovieTrailerLists' in string)
    if script_tag:
        content = script_tag.string
        movies = []
        start = 0
        while True:
            name_start = content.find('"name":"', start)
            if name_start == -1:
                break
            name_start += 7  # Length of 'name: "'
            name_end = content.find('(', name_start)
            if name_end == -1:
                name_end = content.find('"', name_start)
            if name_end != -1:
                movie_name = content[name_start+1:name_end].strip()
                movies.append(movie_name)
            start = name_end
        return list(set(movies))
    return []

@app.get("/autocomplete")
async def autocomplete(term: str):
    url = "https://bestsimilar.com/site/autocomplete"
    params = {"term": term}
    headers = {
        "X-Requested-With": "XMLHttpRequest",
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, headers=headers)
        return response.json()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
