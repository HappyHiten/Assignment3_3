const express = require('express');
const DietPlan = require('../models/dietplan');
const router = express.Router();

// Get All Diet Plans
router.get('/', async (req, res) => {
    const dietPlans = await DietPlan.find({ createdBy: req.user._id });
    res.render('dietPlans/index', { dietPlans });
});

// Create a New Diet Plan
router.post('/', async (req, res) => {
    const { title, description, meals } = req.body;
    try {
        const dietPlan = new DietPlan({
            title,
            description,
            meals,
            createdBy: req.user._id,
        });
        await dietPlan.save();
        res.redirect('/dietPlans');
    } catch (err) {
        res.redirect('/dietPlans');
    }
});

// Delete a Diet Plan
router.delete('/:id', async (req, res) => {
    try {
        await DietPlan.findByIdAndDelete(req.params.id);
        res.redirect('/dietPlans');
    } catch (err) {
        res.redirect('/dietPlans');
    }
});

module.exports = router;
