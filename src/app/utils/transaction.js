const generateTransactionId = () => {
    const crypto = require("crypto");

    const id = crypto.randomBytes(16).toString("hex");

    return id;
}

module.exports = { generateTransactionId }