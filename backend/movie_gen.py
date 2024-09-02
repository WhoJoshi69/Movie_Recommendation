from groq import Groq
from pip._internal.utils.misc import enum

client = Groq(
    api_key="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",
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
                 similar plot or environment or story. you will represent the response in python list format nothing
                  extra information just the movie name, release year in bracket nothing extra at all
                  - reminding you once again i need response in python list format nothing extra.
                  - example response: [
    "Emmanuelle (1974)",
    "The Story of O (1975)",
    "The Night Porter (1974)",
    "Salon Kitty (1976)",
    "Caligula (1979)",
    "Fellini Satyricon (1969)",
    "The Libertine (1968)",
    "The Damned (1962)",
    "Theorem (1968)",
    "Belle de Jour (1967)",
    "Juliet of the Spirits (1965)",
    "The Servant (1963)",
    "Secrets of a Chambermaid (1998)",
    "Eyes Wide Shut (1999)",
    "Mulholland Drive (2001)"
]
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


response = [
    "Emmanuelle (1974)",
    "The Story of O (1975)",
    "The Night Porter (1974)",
    "Salon Kitty (1976)",
    "Caligula (1979)",
    "Fellini Satyricon (1969)",
    "The Libertine (1968)",
    "The Damned (1962)",
    "Theorem (1968)",
    "Belle de Jour (1967)",
    "Juliet of the Spirits (1965)",
    "The Servant (1963)",
    "Secrets of a Chambermaid (1998)",
    "Eyes Wide Shut (1999)",
    "Mulholland Drive (2001)"
]
response = createPrompts("celestine 1974")
print(response)
print(type(enum(response)))
