const fs = require("fs");
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const categoryModel = require("../models/categories");
const productModel = require("../models/products");
const orderModel = require("../models/orders");
const userModel = require("../models/users");
const customizeModel = require("../models/customize");

class Customize {
  async getImages(req, res) {
    try {
      const Images = await customizeModel.find({});
      if (Images) {
        return res.json({ Images });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async uploadSlideImage(req, res) {
    const image = req.file?.filename;
    if (!image) {
      return res.json({ error: "All field required" });
    }
    
    try {
      const newCustomize = new customizeModel({
        slideImage: image,
      });
      
      const savedImage = await newCustomize.save();
      if (savedImage) {
        return res.json({ success: "Image upload successfully" });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async deleteSlideImage(req, res) {
    const { id } = req.body;
    if (!id) {
      return res.json({ error: "All field required" });
    }
    
    try {
      const deletedSlideImage = await customizeModel.findById(id);
      if (!deletedSlideImage) {
        return res.status(404).json({ error: "Image not found" });
      }

      const filePath = `../server/public/uploads/customize/${deletedSlideImage.slideImage}`;
      const deleteImage = await customizeModel.findByIdAndDelete(id);
      
      if (deleteImage) {
        try {
          await unlinkAsync(filePath);
          return res.json({ success: "Image deleted successfully" });
        } catch (unlinkError) {
          console.log('Error deleting file:', unlinkError);
          // Still return success since database entry was deleted
          return res.json({ success: "Image deleted from database, but file deletion failed" });
        }
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getAllData(req, res) {
    try {
      const [Categories, Products, Orders, Users] = await Promise.all([
        categoryModel.countDocuments({}),
        productModel.countDocuments({}),
        orderModel.countDocuments({}),
        userModel.countDocuments({})
      ]);

      return res.json({ Categories, Products, Orders, Users });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Server error" });
    }
  }
}

const customizeController = new Customize();
module.exports = customizeController;