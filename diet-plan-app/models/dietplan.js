const mongoose = require('mongoose');

const DietPlanSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    meals: [
        {
            mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], required: true },
            foodItems: [String],
        },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('DietPlan', DietPlanSchema);
