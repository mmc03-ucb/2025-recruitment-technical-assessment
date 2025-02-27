const request = require("supertest");

describe("Task 1", () => {
  describe("POST /parse", () => {
    const getTask1 = async (inputStr) => {
      return await request("http://localhost:8080")
        .post("/parse")
        .send({ input: inputStr });
    };

    it("example1", async () => {
      const response = await getTask1("Riz@z RISO00tto!");
      expect(response.body).toStrictEqual({ msg: "Rizz Risotto" });
    });

    it("example2", async () => {
      const response = await getTask1("alpHa-alFRedo");
      expect(response.body).toStrictEqual({ msg: "Alpha Alfredo" });
    });

    it("error case", async () => {
      const response = await getTask1("");
      expect(response.status).toBe(400);
    });

    it("multiple hyphens and underscores", async () => {
      const response = await getTask1("meatball___special-case___with__extra");
      expect(response.body).toStrictEqual({ msg: "Meatball Special Case With Extra" });
    });

    it("leading and trailing spaces", async () => {
      const response = await getTask1("   Skibidi spaghetti   ");
      expect(response.body).toStrictEqual({ msg: "Skibidi Spaghetti" });
    });

    it("multiple spaces between words", async () => {
      const response = await getTask1("Skibidi___Spaghetti  ");
      expect(response.body).toStrictEqual({ msg: "Skibidi Spaghetti" });
    });

    it("input already in correct format", async () => {
      const response = await getTask1("Meatball");
      expect(response.body).toStrictEqual({ msg: "Meatball" });
    });

    it("input with invalid characters", async () => {
      const response = await getTask1("Spaghetti$&@");
      expect(response.body).toStrictEqual({ msg: "Spaghetti" });
    });

    it("empty input returns error", async () => {
      const response = await getTask1("!!!");
      expect(response.status).toBe(400);
    });

    it("input with single letter", async () => {
      const response = await getTask1("s");
      expect(response.body).toStrictEqual({ msg: "S" });
    });
  });
});


describe("Task 2", () => {
  describe("POST /entry", () => {
    const putTask2 = async (data) => {
      return await request("http://localhost:8080").post("/entry").send(data);
    };

    it("Add Ingredients", async () => {
      const entries = [
        { type: "ingredient", name: "Egg", cookTime: 6 },
        { type: "ingredient", name: "Lettuce", cookTime: 1 },
      ];
      for (const entry of entries) {
        const resp = await putTask2(entry);
        expect(resp.status).toBe(200);
        expect(resp.body).toStrictEqual({});
      }
    });

    it("Add Recipe", async () => {
      const meatball = {
        type: "recipe",
        name: "Meatball",
        requiredItems: [{ name: "Beef", quantity: 1 }],
      };
      const resp1 = await putTask2(meatball);
      expect(resp1.status).toBe(200);
    });

    it("Ingredient with invalid cookTime", async () => {
      const resp = await putTask2({
        type: "ingredient",
        name: "beef",
        cookTime: -1,
      });
      expect(resp.status).toBe(400);
    });

    it("Invalid type: 'pan'", async () => {
      const resp = await putTask2({
        type: "pan",
        name: "pan",
        cookTime: 20,
      });
      expect(resp.status).toBe(400);
    });

    it("Unique names", async () => {
      const resp = await putTask2({
        type: "ingredient",
        name: "Beef",
        cookTime: 10,
      });
      expect(resp.status).toBe(200);

      const resp2 = await putTask2({
        type: "ingredient",
        name: "Beef",
        cookTime: 8,
      });
      expect(resp2.status).toBe(400);

      const resp3 = await putTask2({
        type: "recipe",
        name: "Beef",
        requiredItems: [{ name: "Egg", quantity: 1 }],
      });
      expect(resp3.status).toBe(400);
    });

    it("Recipe with unique requiredItems names", async () => {
      const meatball = {
        type: "recipe",
        name: "Meatball",
        requiredItems: [
          { name: "Beef", quantity: 1 },
          { name: "Beef", quantity: 2 }, // Duplicate item name
        ],
      };
      const resp = await putTask2(meatball);
      expect(resp.status).toBe(400);
    });

    it("Recipe with valid requiredItems", async () => {
      const meatball = {
        type: "recipe",
        name: "other",
        requiredItems: [
          { name: "Beef", quantity: 1 },
          { name: "Egg", quantity: 2 },
        ],
      };
      const resp = await putTask2(meatball);
      expect(resp.status).toBe(200);
    });

    it("Recipe with no requiredItems", async () => {
      const recipe = {
        type: "recipe",
        name: "Salted Beef",
        requiredItems: [], // No required items
      };
      const resp = await putTask2(recipe);
      expect(resp.status).toBe(200);
    });

    it("Recipe with missing requiredItems field", async () => {
      const recipe = {
        type: "recipe",
        name: "Egg Salad",
      }; // Missing requiredItems field
      const resp = await putTask2(recipe);
      expect(resp.status).toBe(200); // Should still work, as 'requiredItems' is optional
    });
  });
});


describe("Task 3", () => {
  describe("GET /summary", () => {
    const postEntry = async (data) => {
      return await request("http://localhost:8080").post("/entry").send(data);
    };

    const getTask3 = async (name) => {
      return await request("http://localhost:8080").get(
        `/summary?name=${name}`
      );
    };

    it("What is bro doing - Get empty cookbook", async () => {
      const resp = await getTask3("nothing");
      expect(resp.status).toBe(400);
    });

    it("What is bro doing - Get ingredient", async () => {
      const resp = await postEntry({
        type: "ingredient",
        name: "beef",
        cookTime: 2,
      });
      expect(resp.status).toBe(200);

      const resp2 = await getTask3("beef");
      expect(resp2.status).toBe(400);
    });

    it("Unknown missing item", async () => {
      const cheese = {
        type: "recipe",
        name: "Cheese",
        requiredItems: [{ name: "Not Real", quantity: 1 }],
      };
      const resp1 = await postEntry(cheese);
      expect(resp1.status).toBe(200);

      const resp2 = await getTask3("Cheese");
      expect(resp2.status).toBe(400);
    });

    it("Bro cooked", async () => {
      const meatball = {
        type: "recipe",
        name: "Skibidi",
        requiredItems: [{ name: "Bruh", quantity: 1 }],
      };
      const resp1 = await postEntry(meatball);
      expect(resp1.status).toBe(200);

      const resp2 = await postEntry({
        type: "ingredient",
        name: "Bruh",
        cookTime: 2,
      });
      expect(resp2.status).toBe(200);

      const resp3 = await getTask3("Skibidi");
      expect(resp3.status).toBe(200);
    });


    it("Recipe with zero cookTime ingredients", async () => {
      await postEntry({ type: "ingredient", name: "Salt", cookTime: 0 });

      await postEntry({
        type: "recipe",
        name: "Salty Water",
        requiredItems: [{ name: "Salt", quantity: 1 }],
      });

      const resp = await getTask3("Salty Water");
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual({
        name: "Salty Water",
        cookTime: 0,
        ingredients: [{ name: "Salt", quantity: 1 }],
      });
    });
    it("Duplicate ingredients in different recipes", async () => {
      await postEntry({ type: "ingredient", name: "Milk", cookTime: 3 });
      await postEntry({ type: "ingredient", name: "Cocoa", cookTime: 4 });

      await postEntry({
        type: "recipe",
        name: "Chocolate Syrup",
        requiredItems: [{ name: "Cocoa", quantity: 2 }],
      });

      await postEntry({
        type: "recipe",
        name: "Hot Chocolate",
        requiredItems: [
          { name: "Milk", quantity: 1 },
          { name: "Chocolate Syrup", quantity: 1 },
        ],
      });

      const resp = await getTask3("Hot Chocolate");
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual({
        name: "Hot Chocolate",
        cookTime: 11, // 3 (Milk) + 2*4 (Cocoa)
        ingredients: [
          { name: "Milk", quantity: 1 },
          { name: "Cocoa", quantity: 2 },
        ],
      });
    });
  });
});
