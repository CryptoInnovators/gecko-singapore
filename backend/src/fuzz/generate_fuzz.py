import openai
import argparse
import os
import sys
import re
from dotenv import load_dotenv

def extract_invariants(contract_code, api_base, api_key, model="gpt-4o-mini", temperature=0.0):
    """
    Uses OpenAI's API to extract invariants from a Solidity smart contract.

    Parameters:
    - contract_code (str): The Solidity contract code.
    - api_base (str): The OpenAI API base URL.
    - api_key (str): Your OpenAI API key.
    - model (str): The OpenAI model to use (default: gpt-4o-mini).
    - temperature (float): Sampling temperature.

    Returns:
    - List of invariants extracted from the contract.
    """
    openai.api_base = api_base
    openai.api_key = api_key

    prompt = (
        "Extract a list of invariants from the following Solidity smart contract. "
        "An invariant is a statement that describes a property or condition that should hold true throughout the execution of the contract.\n\n"
        "Solidity Contract:\n"
    )

    messages = [
        {
            "role": "system",
            "content": (
                "You are an assistant that extracts invariants from Solidity smart contracts. "
                "Provide a clear and concise list of invariants."
            ),
        },
        {
            "role": "user",
            "content": f"{prompt}\n{contract_code}",
        },
    ]

    try:
        response = openai.ChatCompletion.create(
            model=model,
            temperature=temperature,
            messages=messages,
        )
    except openai.error.OpenAIError as e:
        print(f"An error occurred while communicating with OpenAI: {e}")
        sys.exit(1)

    content = response['choices'][0]['message']['content']

    invariants = re.findall(r'^\s*\d+\.\s*(.*)', content, re.MULTILINE)

    if not invariants:
        print("No invariants were found in the response.")
        print("Response from OpenAI:")
        print(content)
        sys.exit(1)

    return invariants

def generate_fuzz_test(invariant, api_base, api_key, model="gpt-4o-mini", temperature=0.0):
    """
    Uses OpenAI's API to generate a fuzz test for a given invariant.

    Parameters:
    - invariant (str): The invariant statement.
    - api_base (str): The OpenAI API base URL.
    - api_key (str): Your OpenAI API key.
    - model (str): The OpenAI model to use (default: gpt-4o-mini).
    - temperature (float): Sampling temperature.

    Returns:
    - Generated fuzz test code as a string.
    """
    openai.api_base = api_base
    openai.api_key = api_key

    prompt = (
        f"Create a Hardhat fuzz test for the following invariant in a Solidity smart contract.\n\n"
        f"Invariant: {invariant}\n\n"
        "Write a Hardhat fuzz test in JavaScript that tests this invariant. The test should include various scenarios and edge cases to ensure the invariant holds true."
    )

    messages = [
        {
            "role": "system",
            "content": (
                "You are an assistant that generates Hardhat fuzz tests for given invariants in Solidity smart contracts."
            ),
        },
        {
            "role": "user",
            "content": prompt,
        },
    ]

    try:
        response = openai.ChatCompletion.create(
            model=model,
            temperature=temperature,
            messages=messages,
        )
    except openai.error.OpenAIError as e:
        print(f"An error occurred while communicating with OpenAI for fuzz test generation: {e}")
        return None
    content = response['choices'][0]['message']['content']

    return content.strip()

def main():
    load_dotenv()

    parser = argparse.ArgumentParser(description="Extract invariants from a Solidity smart contract and generate fuzz tests.")
    parser.add_argument('contract_file', type=str, help='Path to the Solidity contract file (.sol)')
    parser.add_argument('--temperature', type=float, default=0.0, help='Sampling temperature for both extraction and test generation (default: 0.0)')

    args = parser.parse_args()

    api_base = "https://api.openai.com/v1" 
    api_key = os.getenv("OPENAI_API_KEY")


    if not api_key:
        print("Error: OPENAI_API_KEY is not set in the .env file.")
        sys.exit(1)

    try:
        with open(args.contract_file, 'r', encoding='utf-8') as f:
            contract_code = f.read()
    except FileNotFoundError:
        print(f"Error: File '{args.contract_file}' not found.")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading file '{args.contract_file}': {e}")
        sys.exit(1)

    invariants = extract_invariants(
        contract_code,
        api_base=api_base,
        api_key=api_key,
        model="gpt-4o-mini", 
        temperature=args.temperature
    )

    print("\nList of Invariants:")
    for idx, invariant in enumerate(invariants, 1):
        print(f"{idx}. {invariant}")

    print("\nGenerating Fuzz Tests for Each Invariant:\n")
    for idx, invariant in enumerate(invariants, 1):
        print(f"Fuzz Test {idx}:")
        fuzz_test = generate_fuzz_test(
            invariant,
            api_base=api_base,
            api_key=api_key,
            model="gpt-4o-mini",  
            temperature=args.temperature
        )
        if fuzz_test:
            print(fuzz_test)
        else:
            print("Failed to generate fuzz test.\n")
        print("-" * 80)  

if __name__ == "__main__":
    main()
