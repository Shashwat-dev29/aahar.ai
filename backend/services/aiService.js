const axios = require('axios');

exports.evaluateDonation = async (foodType, prepTime, currentTemp, quantity, donorCoords, ngoCoords) => {
    try {
        const pyRes = await axios.post(process.env.PYTHON_ENGINE_URL, {
            food_type: foodType,
            prep_time_str: prepTime,
            current_temp: parseFloat(currentTemp),
            quantity: parseInt(quantity),
            donor_coords: donorCoords,
            ngo_coords: ngoCoords
        });
        return pyRes.data;
    } catch (err) {
        console.error(`[DEBUG] Axios error hitting Python Engine:`, err.message);
        return null; // Ignore failed requests to Python engine
    }
};
