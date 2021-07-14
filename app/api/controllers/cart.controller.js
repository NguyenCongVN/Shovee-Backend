"use strict";

const cartModel = require("../models/cart.model");

exports.findAllUserCart = async (req, res) => {
  await cartModel
    .find({
      user: req.user._id,
    })
    .populate({ path: "user", select: ["_id"] })
    .populate("product")
    .populate({ path: "product", populate: "seller" ,populate : { path : "seller" , populate :  "user"}})
    .then((data) =>
      res.json({
        status: 200,
        data,
      })
    )
    .catch((err) => {
      return res.status(500).json({
        status: 500,
        message: err.message || "same error",
      });
    });
};

exports.create = async (req, res) => {
  const { product } = req.body;
  const user = req.user._id;
  if (!user || !product) {
    return res.status(400).json({
      status: 400,
      message: "product is required",
    });
  }

  await cartModel.find(
    { user: user, product: product },
    async (err, foundList) => {
      if (err) {
        return res.status(500).json({
          status: 500,
          message: err.message || "same error",
        });
      }
      if (foundList.length > 0) {
        cartModel.findOneAndUpdate(
          { user, product },
          { $inc: { entity: 1 } },
          { new: true },
          async (err, result) => {
            if (err) {
              return res.status(500).json({
                status: 500,
                message: err.message || "same error",
              });
            }
            if (result) {
              cartModel
                .findById(result._id)
                .populate("user")
                .populate("product")
                .populate({ path: "product", populate: "seller" })
                .then((createdData) => {
                  return res.json({
                    status: 200,
                    data: createdData,
                  });
                });
            }
          }
        );
      } else {
        cartModel
          .create({ user, product })
          .then((data) => {
            cartModel
              .findById(data._id)
              .populate("user")
              .populate("product")
              .populate({ path: "product", populate: "seller" })
              .then((createdData) =>
                res.json({
                  status: 200,
                  data: createdData,
                })
              );
          })
          .catch((err) => {
            return res.status(500).json({
              status: 500,
              message: err.message || "same error",
            });
          });
      }
    }
  );
};

exports.delete = async (req, res) => {
  if (req.body.wantDecrease) {
    cartModel.findOneAndUpdate(
      { _id: req.params.id },
      { $inc: { entity: -1 } },
      { new: true },
      async (err, result) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            message: err.message || "same error",
          });
        }
        if (result) {
          if (result.entity == 0) {
            await cartModel
              .findByIdAndDelete(req.params.id)
              .then((data) => {
                if (!data) {
                  return res.status(404).json({
                    status: 404,
                    message: `cart not found with id = ${req.params.id}`,
                  });
                }

                res.json({
                  status: 200,
                  _id: req.params.id,
                });
              })
              .catch((err) => {
                if (err.kind === "ObjectId") {
                  res.status(404).json({
                    status: 404,
                    message: `cart not found with id = ${req.params.id}`,
                  });
                }

                res.status(500).json({
                  status: 500,
                  message: err.message || "same error",
                });
              });
          }
          cartModel
            .findById(result._id)
            .populate("user")
            .populate("product")
            .populate({ path: "product", populate: "seller" })
            .then((createdData) => {
              return res.json({
                status: 200,
                data: createdData,
              });
            });
        }
      }
    );
  } else {
    await cartModel
      .findByIdAndDelete(req.params.id)
      .then((data) => {
        if (!data) {
          return res.status(404).json({
            status: 404,
            message: `cart not found with id = ${req.params.id}`,
          });
        }

        res.json({
          status: 200,
          _id: req.params.id,
        });
      })
      .catch((err) => {
        if (err.kind === "ObjectId") {
          res.status(404).json({
            status: 404,
            message: `cart not found with id = ${req.params.id}`,
          });
        }

        res.status(500).json({
          status: 500,
          message: err.message || "same error",
        });
      });
  }
};
