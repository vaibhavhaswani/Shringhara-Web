const { toTitleCase } = require("../config/function");
const categoryModel = require("../models/categories");
const fs = require("fs");
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

class Category {
  async getAllCategory(req, res) {
    try {
      const Categories = await categoryModel.find({}).sort({ _id: -1 });
      if (Categories) {
        return res.json({ Categories });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async postAddCategory(req, res) {
    let { cName, cDescription, cStatus } = req.body;
    const cImage = req.file?.filename;
    const filePath = `../server/public/uploads/categories/${cImage}`;

    // Validate inputs
    if (!cName || !cDescription || !cStatus || !cImage) {
      try {
        await unlinkAsync(filePath);
      } catch (err) {
        console.log('Error deleting file:', err);
      }
      return res.json({ error: "All fields must be required" });
    }

    cName = toTitleCase(cName);
    
    try {
      // Check if category exists
      const checkCategoryExists = await categoryModel.findOne({ cName: cName });
      if (checkCategoryExists) {
        await unlinkAsync(filePath);
        return res.json({ error: "Category already exists" });
      }

      // Create new category
      const newCategory = new categoryModel({
        cName,
        cDescription,
        cStatus,
        cImage,
      });

      const savedCategory = await newCategory.save();
      if (savedCategory) {
        return res.json({ success: "Category created successfully" });
      }
    } catch (err) {
      console.log(err);
      // Try to clean up uploaded file if database operation failed
      try {
        await unlinkAsync(filePath);
      } catch (unlinkErr) {
        console.log('Error deleting file:', unlinkErr);
      }
      return res.status(500).json({ error: "Error creating category" });
    }
  }

  async postEditCategory(req, res) {
    const { cId, cDescription, cStatus } = req.body;
    if (!cId || !cDescription || !cStatus) {
      return res.json({ error: "All fields must be required" });
    }

    try {
      const editedCategory = await categoryModel.findByIdAndUpdate(
        cId,
        {
          cDescription,
          cStatus,
          updatedAt: Date.now(),
        },
        { new: true }
      );

      if (editedCategory) {
        return res.json({ success: "Category edited successfully" });
      } else {
        return res.status(404).json({ error: "Category not found" });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Error updating category" });
    }
  }

  async getDeleteCategory(req, res) {
    const { cId } = req.body;
    if (!cId) {
      return res.json({ error: "All fields must be required" });
    }

    try {
      const deletedCategoryFile = await categoryModel.findById(cId);
      if (!deletedCategoryFile) {
        return res.status(404).json({ error: "Category not found" });
      }

      const filePath = `../server/public/uploads/categories/${deletedCategoryFile.cImage}`;
      const deleteCategory = await categoryModel.findByIdAndDelete(cId);

      if (deleteCategory) {
        try {
          await unlinkAsync(filePath);
          return res.json({ success: "Category deleted successfully" });
        } catch (unlinkErr) {
          console.log('Error deleting file:', unlinkErr);
          // Still return success since database entry was deleted
          return res.json({ 
            success: "Category deleted from database, but file deletion failed"
          });
        }
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Error deleting category" });
    }
  }
}

const categoryController = new Category();
module.exports = categoryController;