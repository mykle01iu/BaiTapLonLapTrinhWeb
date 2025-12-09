// backend/src/routes/budgets.js
const express = require('express');
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// @route   GET /api/budgets
// @desc    Get all budgets for logged-in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.userId })
      .sort({ category: 1 });

    res.json({
      success: true,
      count: budgets.length,
      budgets
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch budgets', 
      error: error.message 
    });
  }
});

// @route   GET /api/budgets/:id
// @desc    Get single budget
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!budget) {
      return res.status(404).json({ 
        success: false, 
        message: 'Budget not found' 
      });
    }

    res.json({
      success: true,
      budget
    });
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch budget', 
      error: error.message 
    });
  }
});

// @route   POST /api/budgets
// @desc    Create new budget
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { category, limit } = req.body;

    // Validation
    if (!category || limit === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category and limit are required' 
      });
    }

    if (limit < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Limit cannot be negative' 
      });
    }

    // Check if budget already exists for this category
    const existingBudget = await Budget.findOne({
      user: req.userId,
      category: category.trim()
    });

    if (existingBudget) {
      return res.status(400).json({ 
        success: false, 
        message: 'Budget for this category already exists. Use PUT to update.' 
      });
    }

    const budget = new Budget({
      user: req.userId,
      category: category.trim(),
      limit
    });

    await budget.save();

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      budget
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create budget', 
      error: error.message 
    });
  }
});

// @route   PUT /api/budgets/:id
// @desc    Update budget
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { category, limit } = req.body;

    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!budget) {
      return res.status(404).json({ 
        success: false, 
        message: 'Budget not found' 
      });
    }

    // Update fields
    if (category !== undefined) {
      // Check if new category name conflicts with existing budget
      const existingBudget = await Budget.findOne({
        user: req.userId,
        category: category.trim(),
        _id: { $ne: req.params.id }
      });

      if (existingBudget) {
        return res.status(400).json({ 
          success: false, 
          message: 'Budget for this category already exists' 
        });
      }

      budget.category = category.trim();
    }
    
    if (limit !== undefined) {
      if (limit < 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Limit cannot be negative' 
        });
      }
      budget.limit = limit;
    }

    await budget.save();

    res.json({
      success: true,
      message: 'Budget updated successfully',
      budget
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update budget', 
      error: error.message 
    });
  }
});

// @route   DELETE /api/budgets/:id
// @desc    Delete budget
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!budget) {
      return res.status(404).json({ 
        success: false, 
        message: 'Budget not found' 
      });
    }

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete budget', 
      error: error.message 
    });
  }
});

module.exports = router;