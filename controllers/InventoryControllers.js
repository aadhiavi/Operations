const Inventory = require('../models/Inventory');

const getInventory = async (req, res) => {
    try {
        const inventory = await Inventory.find()
        res.status(200).json({
            message: 'fetched all inventory',
            inventory
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Server error',
            error
        })
    }
}

const getItemHistory = async (req, res) => {
    const { project, boqItemId } = req.params;

    try {
        // Find all inventory entries for the given project that contain the item
        const inventoryEntries = await Inventory.find({
            project,
            'categories.categoryItems.boqItemId': boqItemId
        });

        // Filter and format the matched items
        const history = [];

        inventoryEntries.forEach(entry => {
            entry.categories.forEach(category => {
                category.categoryItems.forEach(item => {
                    if (item.boqItemId.toString() === boqItemId) {
                        history.push({
                            deliveryDate: entry.deliveryDate,
                            deliveryNoteNumber: entry.deliveryNoteNumber,
                            receivedBy: entry.receivedBy,
                            quantity: item.quantity,
                            actualReceivedQuantity: item.actualReceivedQuantity,
                            isItemConfirmed: item.isItemConfirmed,
                            isQuantityCorrect: item.isQuantityCorrect,
                            itemName: item.itemName,
                            category: category.category
                        });
                    }
                });
            });
        });

        res.status(200).json({
            message: 'Item history fetched successfully',
            project,
            boqItemId,
            history
        });
    } catch (error) {
        console.error('Error fetching item history:', error);
        res.status(500).json({ error: 'Failed to fetch item history' });
    }
};

module.exports = { getInventory, getItemHistory }