import os

from groq import Groq
from pip._internal.utils.misc import enum

client = Groq(
    api_key=os.getenv("GROQ_API_KEY"),
)


def createPrompts(prompt):
    """
    Create distinctive new prompts from the given image prompt.

    Parameters:
    prompt (str): The original image prompt.

    Returns:
    str: A distinctive new prompt.
    """

    # Create a chat completion using the Groq client
    completion = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[
            {
                "role": "system",
                "content": """i want you to be my movie recommendation engineer, who have knowledge of all the explicit 
                - non explicit. rated - non rated - r rated movies in the world. when i give you a name of a movie, 
                you will in respond give me 15 movies and series combined or non combined with having really really
                 similar plot or environment or story. you will represent the response in comma seperated strings format nothing
                  extra information just the movie name nothing extra at all
                  - reminding you once again i need response in comma seperated strings format nothing extra.
                  - nothing extra not at all. response format should exactly look like example. 
                  - don't even say here are your required data. just give me those names only and only
                  - example response: 
    response-start: "Emmanuelle,The Story of O,The Night Porter,Salon Kitty,Caligula,Fellini Satyricon,The Libertine,The Damned,Theorem,Belle de Jour,Juliet of the Spirits,The Servant,Secrets of a Chambermaid,Eyes Wide Shut,Mulholland Drive" - response-end
                  """

            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=1,
        max_tokens=1024,
        top_p=1,
        stream=False,
        stop=None,
    )

    # Return the generated prompt
    return completion.choices[0].message.content
# response = createPrompts("celestine 1974")
# print(response)
# print(type(enum(response)))
