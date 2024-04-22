const cron = require('node-cron');
const Order = require('../models/orders');

exports.resetOrders = () =>// Schedule the cron job to run at 12:00 AM every week
    cron.schedule('0 0 * * 0', async () => {
        try {
            // Reset is_completed to 0 for all tasks
            await Order.updateMany({}, { $set: { is_completed: 0 } });
            console.log('Reset is_completed for all tasks.');
        } catch (error) {
            console.error('Error resetting is_completed:', error);
        }
    }, {
        timezone: "Asia/Karachi" // Specify your timezone here, e.g., 'Germany/Berlin'
    });