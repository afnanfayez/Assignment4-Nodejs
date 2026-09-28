const express = require("express");
const mysql2 = require("mysql2/promise");

const app = express();
app.use(express.json());

const dbName = "products";
const dbUser = "root";
const dbPassword = "";

let db;

async function setupDatabase() {
  let firstConnection = await mysql2.createConnection({
    host: "localhost",
    port: 3306,
    user: dbUser,
    password: dbPassword,
  });
  await firstConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
  await firstConnection.end();

  db = mysql2.createPool({
    host: "localhost",
    port: 3306,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    connectionLimit: 10,
  });

  await db.query(`
    CREATE TABLE IF NOT EXISTS Suppliers (
      SupplierID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
      SupplierName VARCHAR(100),
      ContactNumber VARCHAR(20)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS Products (
      ProductID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
      ProductName VARCHAR(100),
      Price DECIMAL(10,2),
      StockQuantity INT,
      SupplierID INT,
      FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID) ON DELETE CASCADE
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS Sales (
      SaleID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
      ProductID INT,
      QuantitySold INT,
      SaleDate DATE,
      FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE
    )
  `);

  console.log("DB and tables are ready");
}

// -------------------------------------------------------
//  Products (CRUD)

// Create a product
app.post("/products", async (req, res) => {
  try {
    let { ProductName, Price, StockQuantity, SupplierID } = req.body;
    let [result] = await db.execute(
      "INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES (?, ?, ?, ?)",
      [ProductName, Price, StockQuantity, SupplierID],
    );
    res
      .status(201)
      .json({ message: "Product created successfully.", id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all products
app.get("/products", async (req, res) => {
  try {
    let [result] = await db.execute("SELECT * FROM Products");
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get product by ID
app.get("/products/:id", async (req, res) => {
  try {
    let [result] = await db.execute(
      "SELECT * FROM Products WHERE ProductID = ?",
      [req.params.id],
    );
    if (result.length === 0) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.status(200).json(result[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a product
app.put("/products/:id", async (req, res) => {
  try {
    let { ProductName, Price, StockQuantity, SupplierID } = req.body;
    let [result] = await db.execute(
      "UPDATE Products SET ProductName = ?, Price = ?, StockQuantity = ?, SupplierID = ? WHERE ProductID = ?",
      [ProductName, Price, StockQuantity, SupplierID, req.params.id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.status(200).json({ message: "Product updated successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a product
app.delete("/products/:id", async (req, res) => {
  try {
    let [result] = await db.execute(
      "DELETE FROM Products WHERE ProductID = ?",
      [req.params.id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.status(200).json({ message: "Product deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------------------------------------------
// Suppliers (CRUD)

// Create a supplier
app.post("/suppliers", async (req, res) => {
  try {
    let { SupplierName, ContactNumber } = req.body;
    let [result] = await db.execute(
      "INSERT INTO Suppliers (SupplierName, ContactNumber) VALUES (?, ?)",
      [SupplierName, ContactNumber],
    );
    res
      .status(201)
      .json({ message: "Supplier created successfully.", id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all suppliers
app.get("/suppliers", async (req, res) => {
  try {
    let [result] = await db.execute("SELECT * FROM Suppliers");
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a supplier
app.put("/suppliers/:id", async (req, res) => {
  try {
    let { SupplierName, ContactNumber } = req.body;
    let [result] = await db.execute(
      "UPDATE Suppliers SET SupplierName = ?, ContactNumber = ? WHERE SupplierID = ?",
      [SupplierName, ContactNumber, req.params.id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Supplier not found." });
    }
    res.status(200).json({ message: "Supplier updated successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a supplier
app.delete("/suppliers/:id", async (req, res) => {
  try {
    let [result] = await db.execute(
      "DELETE FROM Suppliers WHERE SupplierID = ?",
      [req.params.id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Supplier not found." });
    }
    res.status(200).json({ message: "Supplier deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------------------------------------------
//  Sales

// Record a sale
app.post("/sales", async (req, res) => {
  try {
    let { ProductID, QuantitySold, SaleDate } = req.body;
    let [result] = await db.execute(
      "INSERT INTO Sales (ProductID, QuantitySold, SaleDate) VALUES (?, ?, ?)",
      [ProductID, QuantitySold, SaleDate],
    );
    res
      .status(201)
      .json({ message: "Sale recorded successfully.", id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all sales
app.get("/sales", async (req, res) => {
  try {
    let [result] = await db.execute("SELECT * FROM Sales");
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get sales for a specific product
app.get("/sales/product/:productId", async (req, res) => {
  try {
    let [result] = await db.execute("SELECT * FROM Sales WHERE ProductID = ?", [
      req.params.productId,
    ]);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------------------------------------------
//  Table modifications (ALTER TABLE)

// Add Category column
app.post("/alter/add-category", async (req, res) => {
  try {
    await db.query("ALTER TABLE Products ADD COLUMN Category VARCHAR(50)");
    res.status(200).json({ message: "Category column added." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove Category column
app.delete("/alter/remove-category", async (req, res) => {
  try {
    await db.query("ALTER TABLE Products DROP COLUMN Category");
    res.status(200).json({ message: "Category column removed." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Change ContactNumber to VARCHAR(15)
app.patch("/alter/contact-number", async (req, res) => {
  try {
    await db.query(
      "ALTER TABLE Suppliers MODIFY COLUMN ContactNumber VARCHAR(15)",
    );
    res.status(200).json({ message: "ContactNumber changed to VARCHAR(15)." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add NOT NULL to ProductName
app.patch("/alter/product-name-not-null", async (req, res) => {
  try {
    await db.query(
      "ALTER TABLE Products MODIFY COLUMN ProductName VARCHAR(100) NOT NULL",
    );
    res.status(200).json({ message: "ProductName is now NOT NULL." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------------------------------------------
// Insert initial data

app.post("/seed", async (req, res) => {
  try {
    // if FreshFoods already exists, do not insert it again
    let [old] = await db.execute(
      "SELECT * FROM Suppliers WHERE SupplierName = 'FreshFoods'",
    );
    if (old.length > 0) {
      return res.status(200).json({ message: "Data already inserted." });
    }

    // a. The supplier
    let [supplier] = await db.execute(
      "INSERT INTO Suppliers (SupplierName, ContactNumber) VALUES ('FreshFoods', '01001234567')",
    );
    let supplierId = supplier.insertId;

    // b. The three products
    let [milk] = await db.execute(
      "INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES ('Milk', 15.00, 50, ?)",
      [supplierId],
    );
    await db.execute(
      "INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES ('Bread', 10.00, 30, ?)",
      [supplierId],
    );
    await db.execute(
      "INSERT INTO Products (ProductName, Price, StockQuantity, SupplierID) VALUES ('Eggs', 20.00, 40, ?)",
      [supplierId],
    );

    // c. The sale record
    await db.execute(
      "INSERT INTO Sales (ProductID, QuantitySold, SaleDate) VALUES (?, 2, '2025-05-20')",
      [milk.insertId],
    );

    res.status(201).json({ message: "Initial data inserted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------------------------------------------
// Update the price of Bread to 25.00

app.patch("/special/update-bread-price", async (req, res) => {
  try {
    let [result] = await db.execute(
      "UPDATE Products SET Price = 25.00 WHERE ProductName = 'Bread'",
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Bread not found." });
    }
    res.status(200).json({ message: "Bread price updated to 25.00." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------------------------------------------
//  Delete the product Eggs

app.delete("/special/delete-eggs", async (req, res) => {
  try {
    let [result] = await db.execute(
      "DELETE FROM Products WHERE ProductName = 'Eggs'",
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Eggs not found." });
    }
    res.status(200).json({ message: "Eggs deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------------------------------------------
// Reports

//Total quantity sold for each product
app.get("/reports/total-sold", async (req, res) => {
  try {
    let [result] = await db.execute(`
      SELECT Products.ProductName, SUM(Sales.QuantitySold) AS TotalSold
      FROM Products
      JOIN Sales ON Products.ProductID = Sales.ProductID
      GROUP BY Products.ProductID, Products.ProductName
    `);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//  Product with the highest stock quantity
app.get("/reports/highest-stock", async (req, res) => {
  try {
    let [result] = await db.execute(
      "SELECT * FROM Products ORDER BY StockQuantity DESC LIMIT 1",
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//  Suppliers whose names start with 'F'
app.get("/reports/suppliers-start-with-f", async (req, res) => {
  try {
    let [result] = await db.execute(
      "SELECT * FROM Suppliers WHERE SupplierName LIKE 'F%'",
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//  Products that have never been sold
app.get("/reports/never-sold", async (req, res) => {
  try {
    let [result] = await db.execute(
      "SELECT * FROM Products WHERE ProductID NOT IN (SELECT ProductID FROM Sales)",
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// All sales with product name (JOIN)
app.get("/reports/sales-details", async (req, res) => {
  try {
    let [result] = await db.execute(`
      SELECT Products.ProductName, Sales.QuantitySold, Sales.SaleDate
      FROM Sales
      JOIN Products ON Sales.ProductID = Products.ProductID
    `);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------------------------------------------
//  store_manager user and permissions

//  Create the user + grant SELECT, INSERT, UPDATE
app.post("/admin/create-manager", async (req, res) => {
  try {
    await db.query(
      "CREATE USER IF NOT EXISTS 'store_manager'@'localhost' IDENTIFIED BY 'Manager@123'",
    );
    await db.query(
      `GRANT SELECT, INSERT, UPDATE ON ${dbName}.* TO 'store_manager'@'localhost'`,
    );
    res
      .status(200)
      .json({ message: "store_manager created with SELECT, INSERT, UPDATE." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//  Revoke UPDATE permission
app.post("/admin/revoke-update", async (req, res) => {
  try {
    await db.query(
      `REVOKE UPDATE ON ${dbName}.* FROM 'store_manager'@'localhost'`,
    );
    res
      .status(200)
      .json({ message: "UPDATE permission revoked from store_manager." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//  Grant DELETE permission on the Sales table only
app.post("/admin/grant-delete-sales", async (req, res) => {
  try {
    await db.query(
      `GRANT DELETE ON ${dbName}.Sales TO 'store_manager'@'localhost'`,
    );
    res
      .status(200)
      .json({ message: "DELETE permission granted on Sales table." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -------------------------------------------------------

setupDatabase()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.log("DB connection failed:", err.message);
  });
