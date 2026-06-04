const { Router } = require("express");
const c = require("../../controllers/pg/orders");

const router = Router();

router.get("/", c.getAll);
router.get("/:id", c.getById);
router.post("/", c.create);
router.put("/:id", c.update);
router.delete("/:id", c.remove);

module.exports = router;
