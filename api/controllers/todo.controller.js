// controllers/todoController.js
const Todo = require("../models/todo");

// Get all to-dos
exports.getTodos = async (req, res) => {
    try {
        const todos = await Todo.find();
        res.status(200).json({ success: true, data: todos });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Create a new to-do
exports.createTodo = async (req, res) => {
    try {
        const todo = await Todo.create(req.body);
        res.status(201).json({ success: true, data: todo });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update a to-do
exports.updateTodo = async (req, res) => {
    try {
        const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!todo) {
            return res.status(404).json({ success: false, message: "To-do not found" });
        }
        res.status(200).json({ success: true, data: todo });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete a to-do
exports.deleteTodo = async (req, res) => {
    try {
        const todo = await Todo.findByIdAndDelete(req.params.id);
        if (!todo) {
            return res.status(404).json({ success: false, message: "To-do not found" });
        }
        res.status(200).json({ success: true, message: "To-do deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
