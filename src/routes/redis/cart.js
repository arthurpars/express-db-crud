const { Router } = require("express");
const c = require("../../controllers/redis/cart");

const router = Router({ mergeParams: true });

router.get("/", c.getCart);
router.post("/item", c.addItem);
router.put("/item/:productId", c.setItem);
router.delete("/item/:productId", c.removeItem);
router.delete("/", c.clearCart);

module.exports = router;
