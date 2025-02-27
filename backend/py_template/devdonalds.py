from dataclasses import dataclass
from typing import List, Dict, Union
from flask import Flask, request, jsonify
import re


# ==== Type Definitions, feel free to add or modify ===========================
@dataclass
class CookbookEntry:
    name: str


@dataclass
class RequiredItem:
    name: str
    quantity: int


@dataclass
class Recipe(CookbookEntry):
    required_items: List[RequiredItem]


@dataclass
class Ingredient(CookbookEntry):
    cook_time: int


# =============================================================================
# ==== HTTP Endpoint Stubs ====================================================
# =============================================================================
app = Flask(__name__)

# Store your recipes here!
cookbook = {}


# Task 1 helper (don't touch)
@app.route("/parse", methods=["POST"])
def parse():
    data = request.get_json()
    recipe_name = data.get("input", "")
    parsed_name = parse_handwriting(recipe_name)
    if parsed_name is None:
        return "Invalid recipe name", 400
    return jsonify({"msg": parsed_name}), 200


# [TASK 1] ====================================================================
# Takes in a recipeName and returns it in a form that
def parse_handwriting(recipeName: str) -> Union[str, None]:
    # Replace hyphens and underscores with spaces
    recipeName = re.sub(r"[-_]", " ", recipeName)

    # Remove everything except letters and spaces
    recipeName = re.sub(r"[^a-zA-Z ]", "", recipeName)

    # Clean up extra spaces
    recipeName = " ".join(recipeName.split())

    # Captilize each word
    recipeName = recipeName.title()

    return recipeName if recipeName else None


# [TASK 2] ====================================================================
# Endpoint that adds a CookbookEntry to your magical cookbook
@app.route("/entry", methods=["POST"])
def create_entry():
    data = request.get_json()
    # Can be only recipe or ingredient
    if data["type"] not in ["recipe", "ingredient"]:
        return (
            jsonify({"error": "Invalid type. It must be 'recipe' or 'ingredient'."}),
            400,
        )
    # Check if the name is unique
    if data["name"] in cookbook:
        return jsonify({"error": "Entry name must be unique."}), 400
    # Ingredient entries
    if data["type"] == "ingredient":
        # Ensure cookTime is >= 0
        if data.get("cookTime", -1) < 0:
            return jsonify({"error": "Invalid cookTime. It must be >= 0."}), 400
        # Add to the cookbook
        cookbook[data["name"]] = data
        return jsonify({}), 200
    # Recipe Entries
    # Recipe Entries
    if data["type"] == "recipe":
        required_items_names = set()
        for item in data.get("requiredItems", []):
            # Compare only the name of the item, not the entire dictionary
            if item["name"] in required_items_names:
                return jsonify({"error": "Required items must have unique names."}), 400
            required_items_names.add(item["name"])

        cookbook[data["name"]] = data
        return jsonify({}), 200


# [TASK 3] ====================================================================
# Endpoint that returns a summary of a recipe that corresponds to a query name
@app.route("/summary", methods=["GET"])
def summary():
    recipe_name = request.args.get("name")

    # Recipe not in cookbook
    if not cookbook or recipe_name not in cookbook:
        return jsonify({"error": "Recipe not found."}), 400
    # Type is ingredient
    if cookbook[recipe_name]["type"] == "ingredient":
        return jsonify({"error": "Requested name is an ingredient, not a recipe."}), 400

    # Check if all required items exist in the cookbook
    for item in cookbook[recipe_name].get("requiredItems", []):
        if item["name"] not in cookbook:
            return jsonify({"error": f"Missing required item: {item['name']}"}), 400

    return "not implemented", 500


# =============================================================================
# ==== DO NOT TOUCH ===========================================================
# =============================================================================

if __name__ == "__main__":
    app.run(debug=True, port=8080)
