const express = require('express');
const router = express.Router();
//const session = require('express-session')
const mongoose = require('mongoose');
const uri = "mongodb+srv://cashmate:cashmate@cashmate.powzf.mongodb.net/?retryWrites=true&w=majority&appName=cashmate";
mongoose.connect(uri)
            .then(() => console.log('MongoDB connected successfully'))
            .catch((err) => console.error('MongoDB connection error:', err));

// Define MongoDB schemas
const expenseSchema = new mongoose.Schema({
    exp_id: Number,
    user_id: Number,
    name: String,
    note: String,
    date: Date,
    amount: Number,
    budget_amount: Number,
});

const userSchema = new mongoose.Schema({
    user_id: String,
    created_date: Date,
    user_email: String,
    user_status: String,
    user_name: String,
});

const budgetSchema = new mongoose.Schema({
    bud_id: Number,
    user_id: String,
    bud_date: Date,
    bud_amount: Number,
    bud_name: String,
});

const transactionSchema = new mongoose.Schema({
    trans_id: Number,
    user_id: String,
    trans_month: Date,
    trans_balance: Number,
    trans_target: Number,
    trans_budget: Number,
});

const Expense = mongoose.model('expenses', expenseSchema);
const User = mongoose.model('user', userSchema);
const Budget = mongoose.model('budget', budgetSchema);
const Transaction = mongoose.model('transactions', transactionSchema);

const models = {
    expenses: Expense,
    users: User,
    budgets: Budget,
    transactions: Transaction,
};



router.get("/", (req, res) => res.send("Express on Vercel"));
// Define API routes
router.route('/:table')
    .get(async (req, res) => {
        try {
            const { table } = req.params;
            const { monthyear, userId } = req.query;
            const Model = models[table];
            if (!Model) return res.status(404).send('Table not found');

            const query = {};
            if (monthyear) {
                const [year, month] = monthyear.split('-');
                query.date = {
                    $gte: new Date(`${year}-${month}-01T00:00:00.000Z`),
                    $lt: new Date(`${year}-${month}-01T00:00:00.000Z`).setMonth(new Date(`${year}-${month}-01T00:00:00.000Z`).getMonth() + 1),
                };
            }
            if (userId) {
                query.user_id = userId;
            }
            const data = await Model.find(query);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).send(error.message);
        }
    })
    .post(async (req, res) => {
        try {
            const { table } = req.params;
            const body = req.body;
            const Model = models[table];
            if (!Model) return res.status(404).send('Table not found');
            const result = await Model.create(body);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).send(error.message);
        }
    })
    .put(async (req, res) => {
        try {
            const { table } = req.params;
            const { id } = req.query;
            let body = req.body;
            const Model = models[table];
            if (!Model) return res.status(404).send('Table not found');
            const result = await Model.findOneAndUpdate({ _id: id }, body, { new: true });
            if (!result) return res.status(404).send('Record not found');
            res.status(200).json(result);
        } catch (error) {
            res.status(500).send(error.message);
        }
    })
    .delete(async (req, res) => {
        try {
            const { table } = req.params;
            const { id } = req.query;
            const Model = models[table];
            if (!Model) return res.status(404).send('Table not found');
            const result = await Model.findOneAndDelete({ _id: id });
            if (!result) return res.status(404).send('Record not found');
            res.status(200).send('Record deleted successfully');
        } catch (error) {
            res.status(500).send(error.message);
        }
    });

router.post('/all/sync', async (req, res) => {
    try {
        const sqliteData = req.body;
        await Promise.all([
            Expense.insertMany(sqliteData.expenses),
            User.insertMany(sqliteData.users),
            Budget.insertMany(sqliteData.budgets),
            Transaction.insertMany(sqliteData.transactions),
        ]);

        res.status(200).send('Data synchronized successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/all/sync', async (req, res) => {
    try {
        const [expenses, users, budgets, transactions] = await Promise.all([
            Expense.find({}),  // Retrieve all expenses
            User.find({}),     // Retrieve all users
            Budget.find({}),   // Retrieve all budgets
            Transaction.find({}), // Retrieve all transactions
        ]);

        const data = {
            expenses,
            users,
            budgets,
            transactions,
        };

        res.status(200).json(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
