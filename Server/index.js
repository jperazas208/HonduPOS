const express = require("express");
const bodyParser = require("body-parser");
const sqlite = require("sqlite");
const jwt = require("jsonwebtoken");
const SHA512 = require("crypto-js/sha512");
const path = require("path");
var cors = require("cors");
// function createServer(isDev) {
// on production
// if (isDev) {
databasePath = path.join(__dirname, "/Database/Dave.db");
// } else {
//   databasePath = path
//     .join(__dirname, "/Database/pos.db")
//     .replace("app.asar", "app.asar.unpacked");
// }
const dbPromise = sqlite.open(databasePath, { Promise });
const app = express();
const port = 3001;
const secret =
  "rxzHqn9ZL3RfcdXkxHEiWO1RflzpK7BgkBzV9so4ktPmbMMenSUA3eQSrEGIomfpETiM763btgpDFCpsmt5sAgR4KmTOhwDYonZ4Tj5zz4PHHQ0u2tCtpsI1rzzVmTiDcqs6Px1L8bWrPbpVx5uPnDXInNWOVtGj9qwn2n8s2ATPZzGEi88CzkC8vHutBwpPwjcWzkvd";
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//Gets
app.get("/GetAllProducts", async (req, res) => {
  const db = await dbPromise;
  db.all("SELECT * FROM PRODUCTO").then(data => {
    res.send({ data: data });
  });
});

app.get("/GetAllCategories", async (req, res) => {
  const db = await dbPromise;
  db.all("SELECT * FROM CATEGORIA").then(data => {
    res.send({ data: data });
  });
});

app.get("/GetAllPayments", async (req, res) => {
  const db = await dbPromise;
  db.all("SELECT * FROM MODO_PAGO").then(data => {
    res.send({ data: data });
  });
});

app.get("/GetAllClients", async (req, res) => {
  const db = await dbPromise;
  db.all("SELECT * FROM CLIENTE").then(data => {
    res.send({ data: data });
  });
});

app.get("/GetAllOpenOrders", async (req, res) => {
  const db = await dbPromise;
  db.all("SELECT * FROM FACTURA WHERE cerrada <> 0").then(data => {
    res.send({ data: data });
  });
});

app.get("/GetCompanyData", async (req, res) => {
  res.send(require("./Database/Empresa.json"));
});

app.get("/GetTotalSales", async (req, res) => {
  const db = await dbPromise;
  db.all(
    "SELECT SUM(cantidad*precio) as total FROM DETALLE INNER JOIN FACTURA ON FACTURA.num_factura=DETALLE.id_factura WHERE FACTURA.fecha LIKE ?",
    [new Date().toDateString() + "%"]
  ).then(data => {
    data[0].total !== null ? res.send({ total: data[0].total }) : res.send({ total: 0 });
  });
});
app.get("/GetTotalItemSold", async (req, res) => {
  const db = await dbPromise;
  db.all(
    "SELECT SUM(cantidad) as total FROM DETALLE INNER JOIN FACTURA ON FACTURA.num_factura=DETALLE.id_factura WHERE FACTURA.fecha LIKE ?",
    [new Date().toDateString() + "%"]
  ).then(data => {
    data[0].total !== null ? res.send({ total: data[0].total }) : res.send({ total: 0 });
  });
});

//Reports
app.post("/GetReport", async (req, res) => {
  const db = await dbPromise;
  let body = req.body;
  if (body.kind === 0) {
    if (body.type === "0") {
      db.all(
        "SELECT DETALLE.id_producto, nombre, SUM(cantidad) as cantidad, fecha from FACTURA INNER JOIN DETALLE ON DETALLE.id_factura=FACTURA.num_factura INNER JOIN PRODUCTO ON DETALLE.id_producto=PRODUCTO.id_producto WHERE FACTURA.fecha LIKE ? GROUP BY DETALLE.id_producto",
        [new Date(body.date).toDateString() + "%"]
      ).then(data => {
        let final = { labels: [], series: [[]] };
        for (let i = 0; i < data.length; i++) {
          const deta = data[i];
          final.labels.push(new Date(deta.fecha).toLocaleDateString());
          let meta = {
            meta: deta.nombre,
            value: deta.cantidad,
          };
          final.series[0].push(meta);
        }
        res.send(final);
      });
    } else if (body.type === "1") {
      db.all(
        "SELECT DETALLE.id_producto, nombre, SUM(cantidad) as cantidad, fecha from FACTURA INNER JOIN DETALLE ON DETALLE.id_factura=FACTURA.num_factura INNER JOIN PRODUCTO ON DETALLE.id_producto=PRODUCTO.id_producto WHERE FACTURA.fecha LIKE ? GROUP BY DETALLE.id_producto",
        [
          "%" +
            new Date(body.date).toLocaleDateString("default", { month: "short" }) +
            "%" +
            new Date(body.date).getFullYear() +
            "%",
        ]
      ).then(data => {
        let final = { labels: [], series: [[]] };
        for (let i = 0; i < data.length; i++) {
          const deta = data[i];
          let detaDate = new Date(deta.fecha);
          let bodyDate = new Date(body.date);
          if (
            detaDate.getMonth() === bodyDate.getMonth() &&
            detaDate.getFullYear() === bodyDate.getFullYear()
          ) {
            final.labels.push(new Date(deta.fecha).toLocaleDateString());
            let meta = {
              meta: deta.nombre,
              value: deta.cantidad,
            };
            final.series[0].push(meta);
          }
        }
        res.send(final);
      });
    } else if (body.type === "2") {
      db.all(
        "SELECT DETALLE.id_producto, nombre, SUM(cantidad) as cantidad, fecha from FACTURA INNER JOIN DETALLE ON DETALLE.id_factura=FACTURA.num_factura INNER JOIN PRODUCTO ON DETALLE.id_producto=PRODUCTO.id_producto WHERE FACTURA.fecha LIKE ? GROUP BY DETALLE.id_producto",
        ["%" + new Date(body.date).getFullYear() + "%"]
      ).then(data => {
        let final = { labels: [], series: [[]] };
        for (let i = 0; i < data.length; i++) {
          const deta = data[i];
          final.labels.push(new Date(deta.fecha).toLocaleDateString());
          let meta = {
            meta: deta.nombre,
            value: deta.cantidad,
          };
          final.series[0].push(meta);
        }
        res.send(final);
      });
    }
  } else if (body.kind === 1) {
    if (body.type === "0") {
      db.all(
        "SELECT PRODUCTO.id_categoria, producto.nombre AS nombre,CATEGORIA.nombre AS categoria, SUM(cantidad) as cantidad, fecha from FACTURA INNER JOIN DETALLE ON DETALLE.id_factura=FACTURA.num_factura INNER JOIN PRODUCTO ON DETALLE.id_producto=PRODUCTO.id_producto INNER JOIN CATEGORIA ON PRODUCTO.id_categoria=CATEGORIA.id_categoria WHERE FACTURA.fecha LIKE ? GROUP BY PRODUCTO.id_categoria",
        [new Date(body.date).toDateString() + "%"]
      ).then(data => {
        let final = { labels: [], series: [[]] };
        for (let i = 0; i < data.length; i++) {
          const deta = data[i];
          final.labels.push(new Date(deta.fecha).toLocaleDateString());
          let meta = {
            meta: deta.categoria,
            value: deta.cantidad,
          };
          final.series[0].push(meta);
        }
        res.send(final);
      });
    } else if (body.type === "1") {
      db.all(
        "SELECT PRODUCTO.id_categoria, producto.nombre AS nombre,CATEGORIA.nombre AS categoria, SUM(cantidad) as cantidad, fecha from FACTURA INNER JOIN DETALLE ON DETALLE.id_factura=FACTURA.num_factura INNER JOIN PRODUCTO ON DETALLE.id_producto=PRODUCTO.id_producto INNER JOIN CATEGORIA ON PRODUCTO.id_categoria=CATEGORIA.id_categoria WHERE FACTURA.fecha LIKE ? GROUP BY PRODUCTO.id_categoria",
        [
          "%" +
            new Date(body.date).toLocaleDateString("default", { month: "short" }) +
            "%" +
            new Date(body.date).getFullYear() +
            "%",
        ]
      ).then(data => {
        let final = { labels: [], series: [[]] };
        for (let i = 0; i < data.length; i++) {
          const deta = data[i];
          final.labels.push(new Date(deta.fecha).toLocaleDateString());
          let meta = {
            meta: deta.categoria,
            value: deta.cantidad,
          };
          final.series[0].push(meta);
        }
        res.send(final);
      });
    } else if (body.type === "2") {
      db.all(
        "SELECT PRODUCTO.id_categoria, producto.nombre AS nombre,CATEGORIA.nombre AS categoria, SUM(cantidad) as cantidad, fecha from FACTURA INNER JOIN DETALLE ON DETALLE.id_factura=FACTURA.num_factura INNER JOIN PRODUCTO ON DETALLE.id_producto=PRODUCTO.id_producto INNER JOIN CATEGORIA ON PRODUCTO.id_categoria=CATEGORIA.id_categoria WHERE FACTURA.fecha LIKE ? GROUP BY PRODUCTO.id_categoria",
        ["%" + new Date(body.date).getFullYear() + "%"]
      ).then(data => {
        let final = { labels: [], series: [[]] };
        for (let i = 0; i < data.length; i++) {
          const deta = data[i];
          final.labels.push(new Date(deta.fecha).toLocaleDateString());
          let meta = {
            meta: deta.categoria,
            value: deta.cantidad,
          };
          final.series[0].push(meta);
        }
        res.send(final);
      });
    }
  }
});

//Updates
app.post("/updateProduct", async (req, res) => {
  const db = await dbPromise;
  let body = req.body;
  db.run("UPDATE PRODUCTO SET nombre=?,precio=?,id_categoria=?,image=? WHERE id_producto=?", [
    body.nombre,
    body.precio,
    body.id_categoria,
    body.image,
    body.id_producto,
  ])
    .then(data => {
      res.send({ status: "OK" });
    })
    .catch(error => {
      res.send({ status: "FAILED" });
    });
});

app.post("/updateCategorie", async (req, res) => {
  const db = await dbPromise;
  let body = req.body;
  db.run("UPDATE CATEGORIA SET nombre=?,descripcion=? WHERE id_categoria=?", [
    body.nombre,
    body.descripcion,
    body.id_categoria,
  ])
    .then(data => {
      res.send({ status: "OK" });
    })
    .catch(error => {
      res.send({ status: "FAILED" });
    });
});

app.post("/updatePaymentMethod", async (req, res) => {
  const db = await dbPromise;
  let body = req.body;
  db.run("UPDATE MODO_PAGO SET nombre=?, otros_detalles=? WHERE num_pago=?", [
    body.nombre,
    body.otros_detalles,
    body.num_pago,
  ])
    .then(data => {
      res.send({ status: "OK" });
    })
    .catch(error => {
      res.send({ status: "FAILED" });
    });
});

app.post("/updateClient", async (req, res) => {
  const db = await dbPromise;
  let body = req.body;
  db.run(
    "UPDATE CLIENTE SET nombre=?, apellido=?, rtn=?, fecha_nacimiento=?, telefono=? WHERE id_cliente=?",
    [body.nombre, body.apellido, body.rtn, body.fecha_nacimiento, body.telefono, body.id_cliente]
  )
    .then(data => {
      res.send({ status: "OK" });
    })
    .catch(error => {
      res.send({ status: "FAILED" });
    });
});

//Pos
app.post("/GenerateReceipt", async (req, res) => {
  const db = await dbPromise;
  let body = req.body;
  if ((body.nombre !== [] && body.precio !== "", body.id_categoria !== "")) {
    db.run("INSERT INTO FACTURA(id_cliente,fecha,id_empleado) VALUES(?,?,?)", [
      body.cliente.id_cliente,
      new Date().toString(),
      body.empleado.id_empleado,
    ])
      .then(async data => {
        let num_factura = data.lastID;
        await body.payments.map(pay => {
          db.run("INSERT INTO MODO_PAGOFACTURA(num_pago,id_factura) VALUES(?,?)", [
            pay.num_pago,
            num_factura,
          ]).catch(error => {
            res.send({ status: "FAILED" });
          });
        });
        await body.products.map(prod => {
          db.run("INSERT INTO DETALLE(id_factura,id_producto,cantidad,precio) VALUES(?,?,?,?)", [
            num_factura,
            prod.id_producto,
            prod.cant,
            prod.precio,
          ]).catch(error => {
            res.send({ status: "FAILED" });
          });
        });
        res.send({ status: "OK" });
      })
      .catch(error => {
        res.send({ status: "FAILED" });
      });
  } else {
    res.send({ status: "FAILED" });
  }
});

//Creates
app.post("/CreateProduct", async (req, res) => {
  const db = await dbPromise;
  let body = req.body;

  if ((body.nombre !== "" && body.precio !== "", body.id_categoria !== "")) {
    db.run("INSERT INTO PRODUCTO(nombre,precio,id_categoria,image) VALUES(?,?,?,?)", [
      body.nombre,
      body.precio,
      body.id_categoria,
      body.photo,
    ])
      .then(data => {
        res.send({ status: "OK" });
      })
      .catch(error => {
        res.send({ status: "FAILED" });
      });
  } else {
    res.send({ status: "FAILED" });
  }
});

app.post("/CreateCategorie", async (req, res) => {
  const db = await dbPromise;
  let body = req.body;

  if (body.nombre !== "" && body.descripcion !== "") {
    db.run("INSERT INTO CATEGORIA(nombre,descripcion) VALUES(?,?)", [body.nombre, body.descripcion])
      .then(data => {
        res.send({ status: "OK" });
      })
      .catch(error => {
        res.send({ status: "FAILED" });
      });
  } else {
    res.send({ status: "FAILED" });
  }
});

app.post("/CreatePaymentMethod", async (req, res) => {
  const db = await dbPromise;
  let body = req.body;

  if (body.nombre !== "" && body.otro_detalles !== "") {
    db.run("INSERT INTO MODO_PAGO(nombre,otros_detalles) VALUES(?,?)", [
      body.nombre,
      body.otros_detalles,
    ])
      .then(data => {
        res.send({ status: "OK" });
      })
      .catch(error => {
        res.send({ status: "FAILED" });
      });
  } else {
    res.send({ status: "FAILED" });
  }
});

app.post("/CreateUser", async (req, res) => {
  const db = await dbPromise;
  let body = req.body;
  if (
    body.identidad !== "" &&
    body.nombre !== "" &&
    body.apellido !== "" &&
    body.user !== "" &&
    body.password !== ""
  ) {
    db.all("SELECT count(*) FROM EMPLEADO WHERE user=?", [body.user])
      .then(data => {
        if (data[0]["count(*)"] === 0) {
          db.run(
            "INSERT INTO EMPLEADO(nombre,apellido,user,password) VALUES(?,?,?,?)",
            [
              body.nombre,
              body.apellido,
              body.user,
              SHA512(body.password).toString(),
            ]
          )
            .then(data => {
              res.send({ status: "OK" });
            })
            .catch(error => {
              res.send({ status: "FAILED" });
            });
        } else {
          console.log("aqui")
          res.send({ status: "FAILED" });
        }
      })
      .catch(error => {});
  } else {
    res.send({ status: "FAILED" });
  }
});

app.post("/CreateClient", async (req, res) => {
  const db = await dbPromise;
  let body = req.body;
  if (
    body.nombre !== "" &&
    body.apellido !== "" &&
    body.rtn !== "" &&
    body.fecha_nacimiento !== "" &&
    body.telefono !== ""
  ) {
    db.run("INSERT INTO CLIENTE(nombre,apellido,rtn,fecha_nacimiento,telefono) VALUES(?,?,?,?,?)", [
      body.nombre,
      body.apellido,
      body.rtn,
      body.fecha_nacimiento,
      body.telefono,
    ])
      .then(data => {
        res.send({ status: "OK" });
      })
      .catch(error => {
        res.send({ status: "FAILED" });
      });
  } else {
    res.send({ status: "FAILED" });
  }
});

//Deletes
app.post("/DeleteProduct", async (req, res) => {
  const db = await dbPromise;
  let body = req.body;
  if (body.id_producto !== "" && body.id_producto !== undefined) {
    db.run("DELETE FROM PRODUCTO WHERE id_producto=?", [body.id_producto])
      .then(data => {
        res.send({ status: "OK" });
      })
      .catch(error => {
        res.send({ status: "FAILED" });
      });
  } else {
    res.send({ status: "FAILED" });
  }
});

app.post("/DeleteCategorie", async (req, res) => {
  const db = await dbPromise;
  let body = req.body;
  if (body.id_categoria !== "" && body.id_categoria !== undefined) {
    db.run("DELETE FROM CATEGORIA WHERE id_categoria=?", [body.id_categoria])
      .then(data => {
        res.send({ status: "OK" });
      })
      .catch(error => {
        res.send({ status: "FAILED" });
      });
  } else {
    res.send({ status: "FAILED" });
  }
});

app.post("/DeletePaymentMethod", async (req, res) => {
  const db = await dbPromise;
  let body = req.body;
  if (body.num_pago !== "" && body.num_pago !== undefined) {
    db.run("DELETE FROM MODO_PAGO WHERE num_pago=?", [body.num_pago])
      .then(data => {
        res.send({ status: "OK" });
      })
      .catch(error => {
        res.send({ status: "FAILED" });
      });
  } else {
    res.send({ status: "FAILED" });
  }
});

app.post("/DeleteClient", async (req, res) => {
  const db = await dbPromise;
  let body = req.body;
  if (body.id_cliente !== "" && body.id_cliente !== undefined) {
    db.run("DELETE FROM CLIENTE WHERE id_cliente=?", [body.id_cliente])
      .then(data => {
        res.send({ status: "OK" });
      })
      .catch(error => {
        res.send({ status: "FAILED" });
      });
  } else {
    res.send({ status: "FAILED" });
  }
});

//Auth
app.post("/Auth", async (req, res) => {
  const db = await dbPromise;
  let body = req.body;

  if (body.user !== "" && body.password !== "") {
    db.all("SELECT * FROM EMPLEADO where user=? AND password=?", [
      body.user,
      SHA512(body.password).toString(),
    ]).then(data => {
      if (data.length > 0) {
        let user = data[0];
        user.exp = Math.floor(Date.now() / 1000) + 60 * 60 * 128;
        var token = jwt.sign(user, secret);
        res.send({ status: "OK", token });
      } else {
        res.send({ status: "FAILED" });
      }
    });
  } else {
    res.send({ status: "FAILED" });
  }
});

let server = app.listen(port, () => console.log(`App is Alive in port: ${port}`));
// }

// exports.createServer = createServer;
