var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ProductSchema = new Schema({
    name: String,
    description: String,
    marque: String,
    type: String,
    image: String,
    price: Number,
    qte: Number
});

var Product = mongoose.model('Products', ProduitSchema);

module.exports = Product;